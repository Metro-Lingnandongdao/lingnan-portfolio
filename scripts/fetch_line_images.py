#!/usr/bin/env python3
"""Refresh per-route lead images from Chinese Wikipedia.

This script stores remote thumbnails in the manifest for the static site to show.
It only downloads/rehosts a thumbnail when the original file is from Wikimedia
Commons and its metadata clearly declares a reusable free licence. Unclear or
non-free images remain remote links and are never copied into the repository.
"""
from __future__ import annotations

import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote, urlparse

import requests

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets" / "line-images-manifest.json"
CACHE = ROOT / "assets" / "line-photos-cache"
API = "https://zh.wikipedia.org/w/api.php"
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
UA = "Mozilla/5.0 (compatible; LingnanDongDaoLineImageIndex/1.0; +https://metro-lingnandongdao.github.io/lingnan-portfolio/)"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": UA, "Accept": "application/json,image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8"})
TIMEOUT = (8, 20)

def api_get(url: str, params: dict) -> dict:
    r = SESSION.get(url, params=params, timeout=TIMEOUT)
    r.raise_for_status()
    return r.json()

def page_query(params: dict) -> list[dict]:
    data = api_get(API, {"action":"query", "format":"json", "formatversion":"2", **params})
    return (data.get("query") or {}).get("pages") or []

def lookup_article(entry: dict) -> dict | None:
    title = (entry.get("sourceTitle") or "").strip()
    if title:
        try:
            pages = page_query({"prop":"pageimages|info", "piprop":"thumbnail|original", "pithumbsize":"1000", "inprop":"url", "titles":title})
            for p in pages:
                if p.get("thumbnail", {}).get("source"):
                    return p
        except Exception as e:
            print(f"[WARN] direct title {title}: {type(e).__name__}", file=sys.stderr)
    # Search only accepts a title if it explicitly shares the route identifier or line name.
    search_title = (entry.get("searchTitle") or entry.get("name") or "").strip()
    if not search_title:
        return None
    try:
        q = api_get(API, {"action":"query", "format":"json", "formatversion":"2", "list":"search", "srnamespace":"0", "srlimit":"8", "srsearch":search_title})
        results = (q.get("query") or {}).get("search") or []
        name_compact = re.sub(r"[（）()／/\s]", "", entry.get("name", ""))
        nums = re.findall(r"\d+", entry.get("name", ""))
        best = []
        for result in results:
            t = result.get("title", "")
            compact = re.sub(r"[（）()／/\s]", "", t)
            same_name = bool(name_compact and (name_compact in compact or compact in name_compact))
            same_number = bool(nums and nums[0] in compact and re.search(r"地铁|铁路|城际|轻轨|磁浮", compact))
            if same_name or same_number:
                best.append((10 if same_name else 5, t))
        best.sort(reverse=True)
        if not best:
            return None
        pages = page_query({"prop":"pageimages|info", "piprop":"thumbnail|original", "pithumbsize":"1000", "inprop":"url", "titles":"|".join(x[1] for x in best[:3])})
        return next((p for p in pages if p.get("thumbnail", {}).get("source")), None)
    except Exception as e:
        print(f"[WARN] search {search_title}: {type(e).__name__}", file=sys.stderr)
        return None

def commons_file_metadata(original_url: str) -> dict | None:
    parsed = urlparse(original_url)
    if "upload.wikimedia.org" not in parsed.netloc or "/wikipedia/commons/" not in parsed.path:
        return None
    filename = unquote(parsed.path.rsplit("/", 1)[-1])
    if not filename:
        return None
    try:
        data = api_get(COMMONS_API, {"action":"query", "format":"json", "formatversion":"2", "prop":"imageinfo", "iiprop":"url|extmetadata", "titles":"File:"+filename})
        for page in (data.get("query") or {}).get("pages") or []:
            info = (page.get("imageinfo") or [{}])[0]
            meta = info.get("extmetadata") or {}
            license_name = (meta.get("LicenseShortName") or {}).get("value", "").strip()
            license_url = (meta.get("LicenseUrl") or {}).get("value", "").strip()
            author = (meta.get("Artist") or {}).get("value", "").strip()
            credit = (meta.get("Credit") or {}).get("value", "").strip()
            desc = (meta.get("ImageDescription") or {}).get("value", "").strip()
            normalized = re.sub(r"<[^>]+>", " ", license_name).strip()
            is_free = bool(re.search(r"CC BY(?:-SA)?|CC0|Public domain|GFDL|Free Art License|GPL", normalized, re.I)) and not bool(re.search(r"Non.?commercial|\bNC\b|Non.?free|Fair.?use", normalized, re.I))
            return {"license": normalized, "licenseUrl": license_url, "author": re.sub(r"<[^>]+>", " ", author).strip(), "credit": re.sub(r"<[^>]+>", " ", credit).strip(), "description": re.sub(r"<[^>]+>", " ", desc).strip(), "free": is_free, "commonsFilePage": "https://commons.wikimedia.org/wiki/File:"+filename.replace(" ", "_")}
    except Exception as e:
        print(f"[WARN] Commons metadata {filename}: {type(e).__name__}", file=sys.stderr)
    return None

def download_open_image(url: str, idx: int, metadata: dict) -> str | None:
    try:
        r = SESSION.get(url, timeout=TIMEOUT, stream=True)
        r.raise_for_status()
        ctype = r.headers.get("content-type", "").split(";", 1)[0].lower()
        ext = {"image/jpeg":"jpg", "image/jpg":"jpg", "image/png":"png", "image/webp":"webp"}.get(ctype)
        if not ext:
            return None
        path = CACHE / f"line-{idx+1:03}.{ext}"
        temp = path.with_suffix(path.suffix + ".tmp")
        size = 0
        with temp.open("wb") as f:
            for chunk in r.iter_content(65536):
                if not chunk: continue
                size += len(chunk)
                if size > 10_000_000:
                    raise ValueError("thumbnail too large")
                f.write(chunk)
        if size < 4000:
            temp.unlink(missing_ok=True)
            return None
        temp.replace(path)
        for old in CACHE.glob(f"line-{idx+1:03}.*"):
            if old != path and old.is_file(): old.unlink(missing_ok=True)
        return str(path.relative_to(ROOT)).replace("\\", "/")
    except Exception as e:
        print(f"[WARN] image download line {idx+1}: {type(e).__name__}", file=sys.stderr)
        return None

def main() -> int:
    doc = json.loads(MANIFEST.read_text(encoding="utf-8"))
    CACHE.mkdir(parents=True, exist_ok=True)
    stats = {"routes":len(doc.get("routes", [])), "remote":0, "cached_open_license":0, "fallback":0}
    for entry in doc.get("routes", []):
        idx = int(entry["index"])
        try:
            page = lookup_article(entry)
        except Exception as e:
            print(f"[WARN] line {idx+1} lookup: {type(e).__name__}: {e}", file=sys.stderr)
            page = None
        if not page or not page.get("thumbnail", {}).get("source"):
            entry["remoteImage"] = None
            entry["caption"] = "线路识别图（本地生成，非实拍）"
            stats["fallback"] += 1
            continue
        thumb = page["thumbnail"]["source"]
        original = (page.get("original") or {}).get("source") or thumb
        entry["remoteImage"] = thumb
        entry["imagePage"] = page.get("fullurl") or entry.get("sourceUrl")
        entry["pageTitle"] = page.get("title") or entry.get("name")
        entry["caption"] = "维基百科对应条目配图；请打开来源核对图注和版权信息。"
        stats["remote"] += 1
        meta = commons_file_metadata(original)
        if meta and meta.get("free"):
            local = download_open_image(thumb, idx, meta)
            if local:
                entry.update({"localImage":local,"imageLicense":meta.get("license"),"licenseUrl":meta.get("licenseUrl"),"imageAuthor":meta.get("author"),"imageCredit":meta.get("credit"),"imageDescription":meta.get("description"),"imageSource":meta.get("commonsFilePage"),"caption":"维基共享资源自由许可配图（本地缓存）；作者与许可见来源链接。"})
                stats["cached_open_license"] += 1
        # Respect Wikimedia API rate limits.
        time.sleep(0.12)
    doc["generatedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    doc["refreshSummary"] = stats
    MANIFEST.write_text(json.dumps(doc, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(json.dumps(stats, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
