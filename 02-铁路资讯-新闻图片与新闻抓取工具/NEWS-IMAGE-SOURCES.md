# Railway news image provenance

The news page intentionally does not use unrelated stock photographs or generic transit illustrations as if they came from a particular report.

## Verified source-page images included initially

- `news-dongguan-line2-three`: article from Dongguan Transportation Investment Holding Group, [original report](https://www.dgjkjt.com.cn/dgjkjt/c100365/202607/72b1bc7a43ee43fca3702e1a8fe85071.shtml). The image URL is linked in that same article's image gallery/caption, showing the first rail-panel placement at Humen Dadao station's track-laying base.
- `news-macau-themed-train`: article from the Macao SAR Government Tourism Office, [original report](https://www.gov.mo/zh-hans/news/915928/). The image is captioned “麦麦主题列车”启动仪式.

## Other stories

When an article's direct photo URL cannot be verified, the card links to the article and explains that the photo should be viewed on the source page. This is deliberate: it is better to have an explicit source link than display a photo from an unrelated story.

## Refreshing photos

The workflow `.github/workflows/update-news-image-manifest.yml` can be run manually from GitHub Actions, and runs weekly. It executes `scripts/fetch_news_image_manifest.py` to read the public HTML of each story and locate image URLs from the article body or article-specific social metadata. It does not download or re-host photos. It preserves manually verified image URLs if a source page is blocked or returns no recognizable article image. Some publishers block automated requests or render content with JavaScript; in those cases, the workflow may leave the card as a source-link placeholder.

Please review each fetched image before treating it as an editorially verified photo. Image copyrights, names, captions, and reuse permissions remain with the respective source publishers; check the original article for their terms.
