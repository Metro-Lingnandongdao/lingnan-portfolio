#!/usr/bin/env python3
"""Fetch public Bilibili video metadata and cover images for this portfolio.

Run from the extracted site root:
    python scripts/fetch_bilibili_metadata.py

This downloads only public metadata and cover thumbnails, not video files.
"""
from __future__ import annotations
import json
import mimetypes
import time
from datetime import datetime, timezone
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
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/129 Safari/537.36",
    "Referer": "https://www.bilibili.com/",
    "Accept": "application/json,text/plain,*/*",
}


def fetch_json(url: str) -> dict:
    req = Request(url, headers=HEADERS)
    with urlopen(req, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def download_cover(url: str, bvid: str) -> str | None:
    if not url:
        return None
    url = "https:" + url if url.startswith("//") else url
    req = Request(url, headers=HEADERS)
    try:
        with urlopen(req, timeout=20) as response:
            data = response.read()
            content_type = response.headers.get("Content-Type", "").split(";")[0].strip()
        ext = Path(urlparse(url).path).suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp", ".avif"}:
            guessed = mimetypes.guess_extension(content_type) or ".jpg"
            ext = ".jpg" if guessed == ".jpe" else guessed
        ASSET_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"{bvid}{ext}"
        (ASSET_DIR / filename).write_bytes(data)
        return f"assets/video-covers-original/{filename}"
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
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
        try:
            api_url = "https://api.bilibili.com/x/web-interface/view?" + urlencode({"bvid": bvid})
            payload = fetch_json(api_url)
            if payload.get("code") != 0 or not payload.get("data"):
                print(f"  metadata unavailable: {payload.get('message') or payload.get('code')}")
                time.sleep(0.35)
                continue
            data = payload["data"]
            cover = download_cover(data.get("pic", ""), bvid)
            entry = {
                "bvid": bvid,
                "title": data.get("title", bvid),
                "pic": data.get("pic", ""),
                "pubdate": data.get("pubdate"),
                "duration": data.get("duration"),
                "desc": data.get("desc", ""),
                "stat": data.get("stat", {}),
            }
            if cover:
                entry["localCover"] = cover
            items[bvid] = entry
            ok += 1
        except (HTTPError, URLError, TimeoutError, OSError, ValueError, KeyError) as exc:
            print(f"  metadata failed: {exc}")
        time.sleep(0.35)

    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": "Bilibili public view API",
        "items": items,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Finished: refreshed {ok} entries. Manifest: {MANIFEST}")
    print("Review the downloaded covers and commit the generated assets/ files with the site.")


if __name__ == "__main__":
    main()
