# 嶺南東道 · 个人网站作品集版

一个无构建步骤的响应式静态网站，适合 GitHub Pages、Netlify 或 Cloudflare Pages。纯 HTML / CSS / JavaScript，所有插图均为本地 SVG 文件，不依赖外部图片服务。

## 当前包含

- 个人介绍与原创线路风格视觉：首页和关于板块。
- 视频专题展示：3 张专题卡片，可用顶部分类标签筛选。
- 线路图作品集：4 张原创矢量概念样稿，可按线网图、低运量系统、换乘关系、车站导视分类，并点击查看大图。
- 手机端导航与响应式卡片布局。
- 无构建步骤，适合直接部署。

## 重要说明

视频卡片标题基于创作专题方向，用于展示作品集版式；目前尚未绑定已确认的单条 B 站稿件，因此卡片暂时指向 B 站主页。线路图 SVG 均为原创概念示意稿，虚构路线与节点，不是官方运营线路图，不能用于实际出行。替换为真实作品后，可删除卡片中的概念说明。

## 本地预览

双击 `index.html` 即可打开。若希望在本地服务器预览，在该目录运行：

```bash
python -m http.server 8000
```

然后打开 `http://localhost:8000`。

## 部署到 GitHub Pages

1. 将此文件夹中的所有内容（包括 `assets` 文件夹）上传到仓库根目录。
2. 确保 `index.html` 位于仓库根目录，而不是二级文件夹内。
3. 在仓库中打开 **Settings → Pages**。
4. 在 **Build and deployment** 中选 **Deploy from a branch**，分支选 `main`，目录选 `/ (root)`，然后保存。
5. 提交更新后，GitHub Pages 会自动重新发布。

## 怎么修改

### 修改文字、视频标题和链接

编辑 `index.html`。

每张视频卡片的标题在 `<h3>...</h3>` 中，描述在后面的 `<p>...</p>` 中。把卡片里两个 `href="https://space.bilibili.com/514708666"` 改成对应视频的完整 B 站链接，即可让封面和底部链接都打开指定视频。

视频筛选类别由 `data-video-category` 控制，可用值为 `rail`、`intercity`、`design`。

### 替换视频封面

把新封面文件放入 `assets/`，再把视频卡片 `<img src="assets/video-lrt.svg">` 的路径换成自己的 JPG、PNG 或 SVG 文件。建议所有封面保持接近 16:9 比例。

### 替换线路图作品

把线路图导出为 SVG、PNG 或 JPG，放进 `assets/`。每张作品卡片的预览图路径位于 `<img src="assets/map-network.svg">`，大图弹窗路径位于按钮的 `data-map-src="assets/map-network.svg"`；两处都要改成同一个新文件。

更改卡片标题和说明时，也需要更新该按钮的 `data-map-title`、`data-map-desc` 属性。分类值 `data-map-category` 可选 `network`、`lrt`、`transfer`、`guide`。

### 修改颜色与样式

编辑 `style.css`。文件顶部的 `:root` 中存放主色变量，后半部追加的 `Portfolio upgrade` 区域用于控制视频与线路图作品集。

### 修改交互

编辑 `script.js`。这里包括手机导航、视频筛选、线路图筛选、作品大图弹窗与页脚年份。

## 文件结构

```text
lingnan-portfolio/
├── index.html
├── style.css
├── script.js
├── favicon.svg
├── README.md
└── assets/
    ├── video-lrt.svg
    ├── video-loop.svg
    ├── video-interchange.svg
    ├── map-network.svg
    ├── map-lrt.svg
    ├── map-transfer.svg
    └── map-wayfinding.svg
```
