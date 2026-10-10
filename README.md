# 嶺南東道 · 个人网站

一个无构建步骤的响应式静态网站，主题为城市轨道交通、线路观察与沿途记录。纯 HTML / CSS / JavaScript，可直接部署。

## 本地预览

直接双击 `index.html` 即可打开。若浏览器限制本地资源，可在当前目录运行：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 发布到公网（推荐 Netlify Drop）

1. 打开 https://app.netlify.com/drop 并登录/注册 Netlify。
2. 将整个 `lingnan-portfolio` 文件夹拖入页面的上传区域。
3. 等待发布完成，Netlify 会生成一个可访问的 `*.netlify.app` 网址。
4. 如需自定义网址，可在 Netlify 站点设置中改站点名称或绑定自己的域名。

也可使用 Cloudflare Pages 的 Direct Upload：https://developers.cloudflare.com/pages/ 。上传这些静态文件即可，无需构建命令；确保 `index.html` 位于发布目录根部。

## 可编辑内容

- 页面文字与专题卡片：`index.html`
- 页面样式：`style.css`
- 移动端导航与页脚年份：`script.js`
- 浏览器图标：`favicon.svg`

## 备注

专题卡片目前链接到 B 站个人主页，作为内容方向展示；没有编造具体视频地址、粉丝数或播放量。网站不包含第三方表单或数据收集功能。Google Fonts 仅用于增强字体呈现，字体加载失败时会自动回退至系统字体。
