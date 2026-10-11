#!/usr/bin/env python3
"""Refresh World Transport New Year Gala's public Bilibili profile/video data.

Run from the GitHub Pages site root with Python 3.10+. This script accesses only
public metadata and thumbnail/avatar images; it does not download video files.
"""
from __future__ import annotations

import hashlib
import html
import json
import mimetypes
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
MID = "3546601293351293"
MANIFEST = ROOT / "assets" / "world-transport-bnj-data.json"
ASSET_DIR = ROOT / "assets"
COVER_DIR = ASSET_DIR / "world-transport-bnj-covers"
AVATAR_FALLBACK = "assets/world-transport-bnj-avatar.svg"
COVER_FALLBACK = "assets/world-transport-bnj-cover.svg"
FEATURED_BVID = "BV16ZFjeMEzE"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
    "Referer": "https://www.bilibili.com/",
    "Origin": "https://www.bilibili.com",
    "Accept": "application/json,text/html,application/xhtml+xml,image/avif,image/webp,*/*",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
}

# Bilibili WBI signature permutation table.
MIXIN_TABLE = [46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13]


def fetch_bytes(url: str, timeout: int = 12, attempts: int = 2) -> tuple[bytes, str]:
    error: Exception | None = None
    for attempt in range(attempts):
        try:
            request = Request(url, headers=HEADERS)
            with urlopen(request, timeout=timeout) as response:
                return response.read(), response.headers.get("Content-Type", "")
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            error = exc
            if attempt + 1 < attempts:
                time.sleep(1.0 + attempt)
    assert error is not None
    raise error


def fetch_json(url: str) -> dict:
    raw, _ = fetch_bytes(url)
    value = json.loads(raw.decode("utf-8", errors="replace"))
    if not isinstance(value, dict):
        raise ValueError("API response is not a JSON object")
    return value


def image_extension(url: str, content_type: str) -> str:
    from urllib.parse import urlparse
    suffix = Path(urlparse(url).path).suffix.lower()
    if suffix in {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}:
        return ".jpg" if suffix == ".jpeg" else suffix
    ext = mimetypes.guess_extension(content_type.split(";")[0].strip().lower()) or ".jpg"
    return ".jpg" if ext == ".jpe" else ext


def download_image(url: str, destination_stem: Path) -> str | None:
    if not url:
        return None
    image_url = "https:" + url if url.startswith("//") else url
    try:
        raw, content_type = fetch_bytes(image_url, timeout=18, attempts=2)
        mime = content_type.split(";")[0].strip().lower()
        if not mime.startswith("image/") or len(raw) < 256:
            raise ValueError(f"unexpected image response: {content_type}, {len(raw)} bytes")
        ext = image_extension(image_url, content_type)
        destination = destination_stem.with_suffix(ext)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(raw)
        return destination.relative_to(ROOT).as_posix()
    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as exc:
        print(f"  image cache failed: {image_url[:100]} ({exc})")
        return None


def fetch_profile() -> dict | None:
    # The card endpoint generally exposes account name/avatar/sign without login.
    for url in (
        f"https://api.bilibili.com/x/web-interface/card?mid={MID}&photo=true",
        f"https://api.bilibili.com/x/space/acc/info?mid={MID}",
    ):
        try:
            payload = fetch_json(url)
            if payload.get("code") != 0 or not payload.get("data"):
                print(f"  profile API returned code={payload.get('code')}: {payload.get('message')}")
                continue
            data = payload["data"]
            card = data.get("card") if isinstance(data.get("card"), dict) else data
            name = card.get("name") or card.get("uname")
            face = card.get("face") or data.get("face")
            if name or face:
                return {
                    "mid": MID,
                    "name": "世界交通拜年纪",
                    "spaceName": name or "",
                    "face": face or "",
                    "sign": card.get("sign") or data.get("sign") or "以交通为题，以热爱相聚。通过年度拜年纪与相关投稿，记录全球交通的多样风景。",
                    "officialSpace": f"https://space.bilibili.com/{MID}",
                    "source": "Bilibili public account API",
                    "follower": data.get("follower") or card.get("follower"),
                    "archiveCount": data.get("archive_count") or card.get("archive_count"),
                }
        except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"  profile API unavailable: {exc}")
    return None


def get_wbi_mixin_key() -> str | None:
    try:
        payload = fetch_json("https://api.bilibili.com/x/web-interface/nav")
        wbi = ((payload.get("data") or {}).get("wbi_img") or {})
        img = str(wbi.get("img_url") or "").rsplit("/", 1)[-1].split(".", 1)[0]
        sub = str(wbi.get("sub_url") or "").rsplit("/", 1)[-1].split(".", 1)[0]
        raw = img + sub
        if len(raw) < max(MIXIN_TABLE):
            return None
        return "".join(raw[i] for i in MIXIN_TABLE)[:32]
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"  WBI key unavailable: {exc}")
        return None


def signed_wbi_url(endpoint: str, params: dict, mixin_key: str) -> str:
    from urllib.parse import quote
    clean = {key: re.sub(r"[!'()*]", "", str(value)) for key, value in params.items()}
    clean["wts"] = str(int(time.time()))
    query = "&".join(f"{quote(k, safe='')}={quote(clean[k], safe='')}" for k in sorted(clean))
    wrid = hashlib.md5((query + mixin_key).encode("utf-8")).hexdigest()
    return f"{endpoint}?{query}&w_rid={wrid}"


def fetch_videos() -> list[dict]:
    videos: list[dict] = []
    params = {"mid": MID, "pn": 1, "ps": 30, "order": "pubdate", "platform": "web", "web_location": 1550101}
    urls: list[str] = []
    mixin = get_wbi_mixin_key()
    if mixin:
        urls.append(signed_wbi_url("https://api.bilibili.com/x/space/wbi/arc/search", params, mixin))
    urls.append("https://api.bilibili.com/x/space/arc/search?" + urlencode({"mid": MID, "pn": 1, "ps": 30, "order": "pubdate"}))
    payload = None
    for url in urls:
        try:
            candidate = fetch_json(url)
            if candidate.get("code") == 0 and candidate.get("data"):
                payload = candidate
                break
            print(f"  video API returned code={candidate.get('code')}: {candidate.get('message')}")
        except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"  video API unavailable: {exc}")
    if not payload:
        return videos

    vlist = (((payload.get("data") or {}).get("list") or {}).get("vlist") or [])
    for video in vlist:
        bvid = str(video.get("bvid") or "").strip()
        title = html.unescape(str(video.get("title") or "")).strip()
        pic = str(video.get("pic") or "").strip()
        if not bvid or not title:
            continue
        stem = COVER_DIR / bvid
        local_cover = download_image(pic, stem) if pic else None
        duration = video.get("length") or ""
        videos.append({
            "bvid": bvid,
            "title": title,
            "pic": pic,
            "localCover": local_cover or COVER_FALLBACK,
            "url": f"https://www.bilibili.com/video/{bvid}/",
            "pubdate": video.get("created"),
            "durationText": duration,
            "desc": html.unescape(str(video.get("description") or "")).strip(),
            "play": video.get("play"),
            "source": "Bilibili public video list API",
        })
        time.sleep(0.3)
    print(f"  videos fetched: {len(videos)}")
    return videos


def format_duration(value: object) -> str:
    try:
        seconds = max(0, int(value or 0))
    except (TypeError, ValueError):
        return str(value or "")
    hours, rem = divmod(seconds, 3600)
    minutes, secs = divmod(rem, 60)
    return f"{hours}:{minutes:02d}:{secs:02d}" if hours else f"{minutes}:{secs:02d}"


def fetch_featured() -> dict | None:
    url = f"https://api.bilibili.com/x/web-interface/view?bvid={FEATURED_BVID}"
    try:
        payload = fetch_json(url)
        if payload.get("code") != 0 or not payload.get("data"):
            print(f"  featured video API returned code={payload.get('code')}")
            return None
        data = payload["data"]
        bvid = data.get("bvid") or FEATURED_BVID
        pic = data.get("pic") or ""
        local = download_image(pic, COVER_DIR / bvid) if pic else None
        owner = data.get("owner") or {}
        return {
            "bvid": bvid,
            "title": html.unescape(str(data.get("title") or "〖2025年交通拜年纪〗2025年世界交通拜年纪直播回放")),
            "pic": pic,
            "localCover": local or COVER_FALLBACK,
            "url": f"https://www.bilibili.com/video/{bvid}/",
            "pubdate": data.get("pubdate"),
            "duration": data.get("duration"),
            "durationText": format_duration(data.get("duration")),
            "desc": html.unescape(str(data.get("desc") or "")).strip(),
            "owner": owner,
            "stat": data.get("stat") or {},
            "source": "Bilibili public view API",
            "featured": True,
        }
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"  featured video metadata unavailable: {exc}")
        return None


def fetch_collections() -> list[dict]:
    # Keep the user-provided playlist page as a guaranteed entry; API results are optional.
    urls = [
        f"https://api.bilibili.com/x/space/fav/season/list?mid={MID}&page_num=1&page_size=30",
        f"https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid={MID}&type=2",
    ]
    for url in urls:
        try:
            data = fetch_json(url)
            if data.get("code") != 0:
                continue
            root = data.get("data") or {}
            items = root.get("items") or root.get("list") or []
            if isinstance(items, list) and items:
                results = []
                for item in items[:20]:
                    title = html.unescape(str(item.get("title") or item.get("name") or "")).strip()
                    fid = item.get("season_id") or item.get("id") or item.get("media_id")
                    if not title:
                        continue
                    href = f"https://space.bilibili.com/{MID}/lists/{fid}?type=season" if fid else f"https://space.bilibili.com/{MID}/lists"
                    results.append({"title": title, "url": href, "count": item.get("media_count") or item.get("count")})
                if results:
                    return results
        except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
            print(f"  collections API unavailable: {exc}")
    return []


def fetch_dynamics() -> list[dict]:
    url = f"https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid={MID}&offset=&type=all"
    try:
        payload = fetch_json(url)
        if payload.get("code") != 0:
            print(f"  dynamic API returned code={payload.get('code')}")
            return []
        items = ((payload.get("data") or {}).get("items") or [])
        results = []
        for item in items[:12]:
            modules = item.get("modules") or {}
            author = modules.get("module_author") or {}
            dynamic = modules.get("module_dynamic") or {}
            desc = dynamic.get("desc") or {}
            text = str(desc.get("text") or "").strip()
            major = dynamic.get("major") or {}
            archive = major.get("archive") or {}
            title = str(archive.get("title") or "").strip()
            bvid = str(archive.get("bvid") or "").strip()
            if not (text or title):
                text = str(((major.get("opus") or {}).get("summary") or {}).get("text") or "").strip()
            if not (text or title):
                continue
            dynamic_id = str(item.get("id_str") or item.get("id") or "")
            href = f"https://www.bilibili.com/video/{bvid}/" if bvid else (f"https://t.bilibili.com/{dynamic_id}" if dynamic_id else f"https://space.bilibili.com/{MID}/dynamic")
            results.append({
                "title": title or text[:56],
                "text": text[:260],
                "url": href,
                "pubdate": author.get("pub_ts"),
                "type": str(item.get("type") or "dynamic"),
            })
        return results
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"  dynamics API unavailable: {exc}")
        return []


def read_previous() -> dict:
    try:
        value = json.loads(MANIFEST.read_text(encoding="utf-8"))
        return value if isinstance(value, dict) else {}
    except (OSError, json.JSONDecodeError):
        return {}


def main() -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    COVER_DIR.mkdir(parents=True, exist_ok=True)
    previous = read_previous()
    old_profile = previous.get("profile") or {}
    old_videos = previous.get("videos") or []
    old_collections = previous.get("collections") or []
    old_dynamics = previous.get("dynamic") or []

    print(f"Refreshing public profile for MID {MID} …")
    fetched_profile = fetch_profile()
    profile = {**old_profile, **(fetched_profile or {})}
    profile.setdefault("mid", MID)
    profile.setdefault("name", "世界交通拜年纪")
    profile.setdefault("sign", "以交通为题，以热爱相聚。通过年度拜年纪与相关投稿，记录全球交通的多样风景。")
    profile.setdefault("officialSpace", f"https://space.bilibili.com/{MID}")
    if fetched_profile and fetched_profile.get("face"):
        cached_face = download_image(fetched_profile["face"], ASSET_DIR / "world-transport-bnj-avatar")
        if cached_face:
            profile["faceLocal"] = cached_face
    if not profile.get("faceLocal") and not profile.get("face"):
        profile["faceLocal"] = AVATAR_FALLBACK

    videos_by_id: dict[str, dict] = {}
    # Retain our independently verified seed until an actual API response replaces it.
    for old in old_videos:
        if isinstance(old, dict) and old.get("bvid"):
            videos_by_id[str(old["bvid"])] = old
    seed = videos_by_id.get(FEATURED_BVID, {
        "bvid": FEATURED_BVID,
        "title": "〖2025年交通拜年纪〗2025年世界交通拜年纪直播回放",
        "pic": "",
        "localCover": COVER_FALLBACK,
        "url": f"https://www.bilibili.com/video/{FEATURED_BVID}/",
        "source": "Public search index title; API details not yet synchronized",
        "featured": True,
    })
    videos_by_id[FEATURED_BVID] = seed
    featured = fetch_featured()
    if featured:
        videos_by_id[FEATURED_BVID] = featured
    for video in fetch_videos():
        # Mark the featured replay when it is also part of the recent listing.
        if video.get("bvid") == FEATURED_BVID:
            video["featured"] = True
        videos_by_id[video["bvid"]] = {**videos_by_id.get(video["bvid"], {}), **video}
    videos = sorted(videos_by_id.values(), key=lambda v: (not bool(v.get("featured")), -int(v.get("pubdate") or v.get("ctime") or 0)))

    collections = fetch_collections() or old_collections
    dynamics = fetch_dynamics() or old_dynamics
    had_fresh = bool(fetched_profile or featured or videos and any(v.get("source") == "Bilibili public video list API" for v in videos) or collections != old_collections or dynamics != old_dynamics)
    if not had_fresh:
        print("No Bilibili endpoint returned fresh public data. Leaving the existing JSON unchanged.")
        return

    result = {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": "Bilibili public account/video/collection/dynamic API; fallback cache preserved when a section is unavailable",
        "profile": profile,
        "videos": videos,
        "collections": collections,
        "dynamic": dynamics,
    }
    MANIFEST.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {len(videos)} videos, {len(collections)} collections, {len(dynamics)} dynamics to {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
