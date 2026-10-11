#!/usr/bin/env python3
"""Fetch public Bilibili metadata and thumbnail images for this portfolio.

Run from the extracted site root with Python 3.10+:
    python scripts/fetch_bilibili_metadata.py

Only public metadata and cover thumbnails are fetched; video files are not downloaded.
The official view API is preferred. When it is temporarily unavailable, the script
tries the public video page's Open Graph metadata as a fallback.
"""
from __future__ import annotations
import html
import json
import mimetypes
import re
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "video-covers-original"
MANIFEST = ROOT / "assets" / "bilibili-video-metadata.json"
BVIDS = [
    "BV1zrcpz2EFV", "BV1QeKE6WEMj",
    "BV1fy8m6kEbm", "BV1Pg8c6nEPu", "BV1BPgq6hEiz", "BV1rcG76UEkP", "BV18vckzpEHg", "BV1ByAzziEXA",
    "BV17NfGByEeY", "BV1mqZ2BdEDM", "BV1sGZjBaEMP", "BV1pLZjB8Ezh", "BV1hacgzNETe", "BV17f27BfEPa",
    "BV192CaBpEMi", "BV1nBtAzwESo", "BV1qwhHzJECL", "BV16s88zkE9y", "BV1cJuRzhE8i", "BV1NSGNzBEak",
    "BV1VwMrzkE6C", "BV1cPJgzFEZ5", "BV1s7VKzGEkZ", "BV1LvRdYfE9E", "BV1g6XDYPEvw", "BV1SCfGYMECP",
    "BV1L8wHeSEmM", "BV1Y4ByYmEww", "BV1Lf421B7Gp", "BV1NS421d72t", "BV1QT42167gg", "BV1Cf421B7Nu",
    "BV19m42137sB", "BV1ki421v7HA", "BV1Af421D7Cq", "BV1VC41137zy", "BV1t642137MN", "BV1YB421z7ev",
    "BV1NC4y167ZU", "BV1ca4y1C7Ce", "BV1r94y1K7pW", "BV1fb4y1A7wb", "BV1QD4y1f7dG", "BV1GC4y1r7BG",
]
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
    "Referer": "https://www.bilibili.com/",
    "Accept": "application/json,text/html,application/xhtml+xml,*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
}


class MetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.values: dict[str, str] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "meta":
            return
        d = {k.lower(): (v or "") for k, v in attrs}
        key = d.get("property") or d.get("name")
        value = d.get("content", "")
        if key and value:
            self.values.setdefault(key.lower(), html.unescape(value).strip())


def fetch_bytes(url: str, attempts: int = 1) -> tuple[bytes, str]:
    last_exc: Exception | None = None
    for attempt in range(attempts):
        try:
            req = Request(url, headers=HEADERS)
            with urlopen(req, timeout=8) as response:
                return response.read(), response.headers.get("Content-Type", "")
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            last_exc = exc
            if attempt + 1 < attempts:
                time.sleep(1.2 * (attempt + 1))
    assert last_exc is not None
    raise last_exc


def fetch_json(url: str) -> dict:
    raw, _ = fetch_bytes(url)
    return json.loads(raw.decode("utf-8"))


def fetch_page_metadata(bvid: str) -> dict:
    url = f"https://www.bilibili.com/video/{bvid}/"
    raw, _ = fetch_bytes(url)
    text = raw.decode("utf-8", errors="replace")
    parser = MetaParser()
    parser.feed(text)
    meta = parser.values
    title = meta.get("og:title") or meta.get("twitter:title")
    pic = meta.get("og:image") or meta.get("twitter:image") or meta.get("og:image:url")
    description = meta.get("og:description") or meta.get("description", "")
    if title:
        # Bilibili pages sometimes append a site suffix to OG title.
        title = re.sub(r"\s*[-_|｜]\s*哔哩哔哩(?:\s*\(゜-゜\)つロ\s*干杯~-bilibili)?\s*$", "", title).strip()
    result: dict = {"bvid": bvid}
    if title:
        result["title"] = title
    if pic:
        result["pic"] = pic
    if description:
        result["desc"] = description
    # Some page responses include JSON hydration with duration/publish time/owner.
    # These fields are optional and only used if they can be parsed safely.
    match = re.search(r"window\.__INITIAL_STATE__\s*=\s*(\{.*?\})\s*;\s*\(function", text, re.S)
    if match:
        try:
            state = json.loads(match.group(1))
            video_data = state.get("videoData") or state.get("videoInfo") or {}
            for key in ("pubdate", "duration", "owner", "stat"):
                if key in video_data:
                    result[key] = video_data[key]
        except (json.JSONDecodeError, TypeError):
            pass
    if not result.get("title") or not result.get("pic"):
        raise ValueError("public page did not expose title and cover metadata")
    return result


def download_cover(url: str, bvid: str) -> str | None:
    if not url:
        return None
    url = "https:" + url if url.startswith("//") else url
    try:
        data, content_type = fetch_bytes(url, attempts=1)
        content_type = content_type.split(";")[0].strip().lower()
        if not content_type.startswith("image/"):
            raise ValueError(f"cover URL returned non-image content: {content_type}")
        ext = Path(urlparse(url).path).suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp", ".avif"}:
            ext = mimetypes.guess_extension(content_type) or ".jpg"
            if ext == ".jpe":
                ext = ".jpg"
        ASSET_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"{bvid}{ext}"
        (ASSET_DIR / filename).write_bytes(data)
        return f"assets/video-covers-original/{filename}"
    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
        print(f"  cover failed for {bvid}: {exc}")
        return None


def main() -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    items: dict[str, dict] = {}
    try:
        existing = json.loads(MANIFEST.read_text(encoding="utf-8"))
        items.update(existing.get("items", {}))
    except (OSError, json.JSONDecodeError):
        pass

    ok = 0
    for number, bvid in enumerate(BVIDS, 1):
        print(f"[{number}/{len(BVIDS)}] {bvid}")
        data: dict | None = None
        api_error: Exception | None = None
        try:
            api_url = "https://api.bilibili.com/x/web-interface/view?" + urlencode({"bvid": bvid})
            payload = fetch_json(api_url)
            if payload.get("code") == 0 and payload.get("data"):
                data = payload["data"]
            else:
                api_error = ValueError(f"official API code={payload.get('code')} message={payload.get('message')}")
        except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
            api_error = exc

        if not data:
            print(f"  official API unavailable ({api_error}); trying public page metadata")
            try:
                data = fetch_page_metadata(bvid)
            except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
                print(f"  page metadata unavailable: {exc}")
                time.sleep(0.5)
                continue

        title = data.get("title")
        pic = data.get("pic") or data.get("cover")
        if not title or not pic:
            print("  skipped: title or cover is missing")
            time.sleep(0.5)
            continue
        cover = download_cover(pic, bvid)
        entry = {
            "bvid": bvid,
            "title": html.unescape(str(title)).strip(),
            "pic": pic,
            "pubdate": data.get("pubdate") or data.get("ctime"),
            "duration": data.get("duration"),
            "desc": data.get("desc", ""),
            "owner": data.get("owner", {}),
            "stat": data.get("stat", {}),
            "source": "Bilibili public metadata",
        }
        if cover:
            entry["localCover"] = cover
        items[bvid] = entry
        ok += 1
        print(f"  cached title: {entry['title']}")
        time.sleep(0.8)

    if ok == 0:
        print("No fresh video metadata could be fetched. Keeping the existing metadata manifest unchanged.")
        raise SystemExit(1)

    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": "Bilibili public view API with public-page fallback",
        "items": items,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Finished: refreshed {ok} entries; total cached entries: {len(items)}.")
    print(f"Manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
