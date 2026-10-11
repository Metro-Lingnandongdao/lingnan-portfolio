#!/usr/bin/env python3
"""Discover article-specific image URLs for the static news page.

The script fetches only public article HTML and records a direct image URL in a
JSON manifest. It does not download/re-host third-party photographs. URLs are
used by the page with a link back to the originating article; when no plausible
article image is available, the site shows a source-page card instead of a
misleading generic illustration.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
NEWS_HTML = ROOT / "news.html"
MANIFEST_PATH = ROOT / "assets" / "news-source-images" / "manifest.json"
UA = "Mozilla/5.0 (compatible; LingnanDongDaoNewsImageIndexer/1.0; +https://metro-lingnandongdao.github.io/lingnan-portfolio/)"
TIMEOUT = (8, 18)
MAX_HTML_BYTES = 6_000_000
BAD_HINTS = re.compile(r"logo|favicon|sprite|avatar|qrcode|qr-code|wechat|weixin|share-icon|icon[-_./]|default-avatar", re.I)

session = requests.Session()
session.headers.update({
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
})


def norm_image_url(url: str | None, page_url: str) -> str | None:
    if not url:
        return None
    url = url.strip()
    if url.startswith("//"):
        url = "https:" + url
    url = urljoin(page_url, url)
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        return None
    if parsed.path.lower().endswith((".svg", ".ico", ".gif")):
        return None
    if BAD_HINTS.search(parsed.path):
        return None
    if any(token in parsed.query.lower() for token in ("type=logo", "image=logo")):
        return None
    return url


def candidates_from_page(soup: BeautifulSoup, page_url: str) -> list[dict]:
    found: list[dict] = []
    seen: set[str] = set()

    def add(raw: str | None, alt: str = "", context: str = "", rank: int = 0):
        url = norm_image_url(raw, page_url)
        if not url or url in seen:
            return
        if len(url) > 2000:
            return
        # Exclude very likely tiny UI sprites; do not reject generic filenames,
        # because news CMSs often call inline photos image1.jpg or pic.jpg.
        hint = (url + " " + alt + " " + context).lower()
        if BAD_HINTS.search(hint):
            return
        seen.add(url)
        found.append({"url": url, "alt": alt.strip(), "context": context[:140], "rank": rank})

    # First look inside likely article-body containers; this is more trustworthy
    # than the whole-page header/footer or an unrelated page logo.
    selectors = [
        '[itemprop="articleBody"]', "article", "#articleContent", ".article-content",
        ".article_content", ".article-detail", ".detail-content", ".content-detail",
        ".news-content", ".TRS_Editor",
    ]
    scopes = []
    for selector in selectors:
        for el in soup.select(selector):
            if el not in scopes:
                scopes.append(el)
    for scope in scopes[:5]:
        scope_text = scope.get_text(" ", strip=True)
        # Avoid generic content wrappers that contain almost the entire page.
        for img in scope.select("img")[:40]:
            raw = (img.get("src") or img.get("data-src") or img.get("data-original") or
                   img.get("data-lazy-src") or img.get("data-echo") or img.get("srcset"))
            if raw and "," in raw and " " in raw:
                raw = raw.split(",")[-1].strip().split(" ")[0]
            alt = img.get("alt", "")
            cls = " ".join(img.get("class", []))
            # Prefer actual editorial photos and avoid tiny utility graphics.
            try:
                width = int(str(img.get("width", "0")).replace("px", ""))
                height = int(str(img.get("height", "0")).replace("px", ""))
            except ValueError:
                width = height = 0
            if (width and width < 160) or (height and height < 90):
                continue
            add(raw, alt=alt, context=cls, rank=120 if len(scope_text) > 300 else 85)
        for source in scope.select("source[srcset]")[:12]:
            raw = source.get("srcset", "").split(",")[-1].strip().split(" ")[0]
            add(raw, context="picture source", rank=95)

    # Only use social metadata as fallback when no image was found in a likely
    # editorial body. Some sites set og:image to a generic home-page banner.
    if not found:
        for key, attr in [("property", "og:image"), ("name", "twitter:image"), ("name", "twitter:image:src")]:
            tag = soup.find("meta", attrs={key: attr})
            if tag:
                add(tag.get("content"), context=attr, rank=90)

    # JSON-LD may name a primary article image.
    for tag in soup.find_all("script", attrs={"type": "application/ld+json"})[:10]:
        text = tag.string or tag.get_text(" ", strip=True)
        if not text:
            continue
        try:
            data = json.loads(text)
        except Exception:
            continue
        stack = data if isinstance(data, list) else [data]
        while stack:
            node = stack.pop(0)
            if isinstance(node, dict):
                img = node.get("image") or node.get("thumbnailUrl")
                if isinstance(img, str):
                    add(img, context="JSON-LD image", rank=88)
                elif isinstance(img, dict):
                    add(img.get("url") or img.get("contentUrl"), context="JSON-LD image", rank=88)
                elif isinstance(img, list):
                    for one in img[:3]:
                        add(one if isinstance(one, str) else one.get("url") if isinstance(one, dict) else None,
                            context="JSON-LD image", rank=88)
                graph = node.get("@graph")
                if isinstance(graph, list):
                    stack.extend(graph)
    found.sort(key=lambda x: x["rank"], reverse=True)
    return found


def get_article_cards() -> list[tuple[str, str, str]]:
    soup = BeautifulSoup(NEWS_HTML.read_text(encoding="utf-8"), "html.parser")
    out = []
    for card in soup.select(".news-card[id]"):
        title_link = card.select_one(".news-card-body h2 a[href]")
        if not title_link:
            continue
        out.append((card["id"], title_link["href"], title_link.get_text(" ", strip=True)))
    return out


def main() -> int:
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    try:
        current = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    except Exception:
        current = {"version": 1, "cards": {}}
    current_cards = current.get("cards", {}) if isinstance(current.get("cards"), dict) else {}
    result_cards: dict[str, dict] = {}
    counts = {"fetched": 0, "found": 0, "no_image": 0, "failed": 0}

    for card_id, url, title in get_article_cards():
        prior = current_cards.get(card_id, {})
        entry = {
            "sourcePage": url,
            "title": title,
            "imageUrl": None,
            "alt": title,
            "status": "source-link-only",
            "fallbackImage": prior.get("fallbackImage", f"assets/news-reference-fallbacks/{card_id}.svg"),
            "checkedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }
        try:
            response = session.get(url, timeout=TIMEOUT, allow_redirects=True, stream=True)
            response.raise_for_status()
            ctype = response.headers.get("content-type", "").lower()
            if "text/html" not in ctype and "application/xhtml+xml" not in ctype:
                raise ValueError(f"not html: {ctype}")
            # Limit HTML read so accidental large responses cannot balloon the run.
            chunks = []
            total = 0
            for chunk in response.iter_content(65536):
                if not chunk:
                    continue
                total += len(chunk)
                if total > MAX_HTML_BYTES:
                    break
                chunks.append(chunk)
            body = b"".join(chunks)
            soup = BeautifulSoup(body, "html.parser")
            cands = candidates_from_page(soup, response.url)
            counts["fetched"] += 1
            if cands:
                best = cands[0]
                entry.update({
                    "imageUrl": best["url"],
                    "alt": best["alt"] or title,
                    "status": "source-image-found",
                    "imageContext": best["context"],
                    "imageHost": urlparse(best["url"]).netloc,
                    "imageSourcePage": response.url,
                    "imageCredit": urlparse(response.url).netloc,
                })
                counts["found"] += 1
            else:
                counts["no_image"] += 1
                prior = current_cards.get(card_id, {})
                # Keep a known appropriate image (original photo, related reference, or labelled local illustration)
                # if this publisher has no discoverable image in this run. Never silently replace it with a generic image.
                keep_keys = ("imageUrl", "url", "alt", "status", "imageSourcePage", "imageCredit", "note", "fallbackImage", "page", "credit", "topic")
                prior_image = prior.get("imageUrl") or prior.get("url")
                if prior_image and prior.get("status") in {"verified", "related-reference", "site-illustration", "source-image-found"}:
                    entry.update({k: prior[k] for k in keep_keys if k in prior})
                    entry["imageUrl"] = prior_image
                    entry["imageSourcePage"] = entry.get("imageSourcePage") or entry.get("page") or entry.get("sourcePage")
                    entry["imageCredit"] = entry.get("imageCredit") or entry.get("credit")
                    entry["note"] = (entry.get("note", "") + " 刷新时未发现更合适的原文图片，保留现有标注图片。请核对来源。 ").strip()
                else:
                    entry["note"] = "未识别到可信原文图；保留本地主题示意图，并提供原文入口。"
        except Exception as exc:
            counts["failed"] += 1
            # Keep known, previously verified source URLs if a transient fetch fails.
            prior = current_cards.get(card_id, {})
            keep_keys = ("imageUrl", "url", "alt", "status", "imageSourcePage", "imageCredit", "note", "fallbackImage", "page", "credit", "topic")
            prior_image = prior.get("imageUrl") or prior.get("url")
            if prior_image and prior.get("status") in {"verified", "related-reference", "site-illustration", "source-image-found"}:
                entry.update({k: prior[k] for k in keep_keys if k in prior})
                entry["imageUrl"] = prior_image
                entry["imageSourcePage"] = entry.get("imageSourcePage") or entry.get("page") or entry.get("sourcePage")
                entry["imageCredit"] = entry.get("imageCredit") or entry.get("credit")
            entry["note"] = f"{entry.get('note', '')} 原文在本次刷新中读取失败（{type(exc).__name__}），保留既有图片或本地示意图；请核对来源。"
            print(f"[WARN] {card_id}: {type(exc).__name__}: {exc}", file=sys.stderr)
        result_cards[card_id] = entry

    out = {
        "version": 2,
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "strategy": "Prefer images from the original article. Preserve clearly labelled related-reference photos and local non-photographic illustrations when originals cannot be retrieved; never mislabel them as original article photos.",
        "summary": counts,
        "cards": result_cards,
    }
    MANIFEST_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(counts, ensure_ascii=False))
    print(f"Wrote {MANIFEST_PATH}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
