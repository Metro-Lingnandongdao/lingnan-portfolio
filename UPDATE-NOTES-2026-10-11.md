# 嶺南東道整站更新说明（2026-10-11）

这是单一完整网站包。解压后 `index.html`、`news.html`、`rail-atlas.html`、`railways.html`、`videos.html`、`sites.html` 等网页直接位于根目录。不要再额外套一层目录。

## 本次重点

- **首页（`index.html`）**：页面底部已嵌入 `assets/site-tour/lingnan-website-tour.mp4`，附视频预览和保存链接。
- **轨道百科（`rail-atlas.html`）**：99 条线路各自有线路色专属识别图；页面会尝试读取对应维基百科条目的配图，外部图片或 API 无法加载时保留标注为“非实拍”的本地识别图。线路详情页在 `line-details/`。
- **铁路资讯（`news.html`）**：18 条新闻都有独立图片。优先使用原文图；对于同一线路／车型的参考照片明确标记“相关参考图（非现场）”；无法找到适合实拍图片的主题使用本地示意图。外链图片失败时会退回专属 SVG。
- **线路图作品**：主页作品卡片的预览、放大和下载链接现均指向包内存在的 WebP 图像。

## 图片真实性

新闻配图状态已在 `assets/news-source-images/manifest.json` 和 `NEWS-IMAGE-SOURCES.md` 中说明。只有 `verified` 代表来自同一篇新闻原文；`related-reference` 表示主题相关但非本篇报道现场；`site-illustration` 是本站制作的非实拍示意图。

线路图片来源与更新策略见 `LINE-IMAGE-SOURCES.md`；手动／定期更新工作流位于 `.github/workflows/`。自动更新依赖来源网站是否允许读取，不保证所有页面都会有可用照片。

## 部署

将解压后的所有文件和文件夹放在 `Metro-Lingnandongdao/lingnan-portfolio` 仓库的网站根目录，保持相对路径。提交推送后等待 GitHub Pages 发布。本文件包尚未直接推送到 GitHub。
