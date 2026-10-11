# 粤港澳轨道交通资料库：来源与维护说明

## 页面文件

新增资料页使用以下文件：

- `rail-atlas.html`：资料库页面与导航。
- `rail-atlas.css`：资料库独立样式，沿用全站青绿—蓝色系。
- `rail-atlas-data.js`：9 类系统及本地线路、车站、车辆基地目录数据。
- `rail-atlas.js`：搜索、筛选、卡片渲染与维基百科表格读取。
- `style.css`：本次也加入了首页资料库入口卡片样式。
- 多个现有 HTML 页面的导航中已加入“轨道百科”链接。

## 数据范围

页面以 2026-10-10 为编辑时的状态快照，当前本地索引包含：

- 9 类系统／运营主体；
- 99 条线路与工程条目；
- 23 个重点车站条目；
- 33 个车辆段、停车场、动车运用所及其他设施条目；
- 多个维基百科条目和主管部门／运营方入口。

这些数字是本地索引的条目数，不代表当地所有车站、基地或规划线路的总量。完整逐站站名以及部分工程表通过“在线资料表格”区域按需读取维基百科 `action=parse` API 中的 `wikitable` 表格。如果浏览器网络、跨域策略或接口不可用，页面会给出原条目链接作为替代。

## 主要数据入口

### 城市轨道与城际

- [广州地铁](https://zh.wikipedia.org/wiki/广州地铁) · [广州地铁车站列表](https://zh.wikipedia.org/wiki/广州地铁车站列表)
- [佛山地铁](https://zh.wikipedia.org/wiki/佛山地铁) · [佛山市城市轨道交通列表](https://zh.wikipedia.org/wiki/佛山市城市轨道交通列表)
- [深圳地铁](https://zh.wikipedia.org/wiki/深圳地铁) · [深圳地铁车站列表](https://zh.wikipedia.org/wiki/深圳地铁车站列表)
- [东莞轨道交通](https://zh.wikipedia.org/wiki/东莞轨道交通)
- [香港铁路运输系统](https://zh.wikipedia.org/wiki/香港铁路运输系统) · [港铁车站列表](https://zh.wikipedia.org/wiki/港铁车站列表) · [香港轻铁车站列表](https://zh.wikipedia.org/wiki/香港轻铁车站列表)
- [澳门轻轨](https://zh.wikipedia.org/wiki/澳门轻轨) · [澳门轻轨车站列表](https://zh.wikipedia.org/wiki/澳门轻轨车站列表)
- [广东城际](https://zh.wikipedia.org/wiki/广东城际) · [粤港澳大湾区城际铁路](https://zh.wikipedia.org/wiki/粤港澳大湾区城际铁路)
- [清远长隆磁浮旅游专线](https://zh.wikipedia.org/wiki/清远长隆磁浮旅游专线)

### 广东省境内国铁

- [广州铁路枢纽](https://zh.wikipedia.org/wiki/广州铁路枢纽)
- [广深铁路](https://zh.wikipedia.org/wiki/广深铁路)
- [广清城际铁路](https://zh.wikipedia.org/wiki/广清城际铁路)
- [广汕高速铁路](https://zh.wikipedia.org/wiki/广汕高速铁路)
- [广湛高速铁路](https://zh.wikipedia.org/wiki/广湛高速铁路)
- [厦深铁路](https://zh.wikipedia.org/wiki/厦深铁路)
- [赣深高速铁路](https://zh.wikipedia.org/wiki/赣深高速铁路)
- [广珠城际铁路](https://zh.wikipedia.org/wiki/广珠城际铁路)

## 状态标注原则

1. 官方主管部门、建设单位、运营方公告优先于百科条目；百科用于索引、概览和交叉核对。
2. “规划”“前期研究”“已批”“在建”“联调联试”“试运行”“正式载客运营”不是同一状态，不能相互替代。
3. 对未有正式批复的远期构想，不把可能站名、线位、基地位置写成确定事实。
4. 高铁、普速铁路和城际铁路即使共用车站，也须区分线路类别、运营主体与服务范围。
5. 车辆段、停车场、动车运用所、客技站、综合维修基地功能不同，列表中按可查资料分别标注。

## 图片来源及授权

- 资料页的系统配图使用维基共享资源的文件链接（不是把图片文件下载到本仓库）。每张图片卡片均提供“图片来源”文件页链接；文件页列有作者、原始文件和许可协议。
- 由于图片由 Wikimedia Commons 远程提供，网络策略、文件重命名或来源站点变化可能导致个别图片无法显示。网页包含占位回退；若要离线稳定展示，应另行下载许可允许的原文件、保存作者和许可证信息，并按相应许可要求署名。
- 不要移除图片来源链接，也不要在未核对许可证时重新分发图片。

## GitHub Pages 部署

解压后进入 `lingnan_edit/` 目录，将其中的所有文件、`assets/` 和 `scripts/` 一起复制到仓库当前 GitHub Pages 发布目录。不要把 ZIP 本身上传，也不要把 `lingnan_edit` 文件夹再套一层。覆盖同名 HTML 文件时，确认 `rail-atlas.html`、`rail-atlas.css`、`rail-atlas.js`、`rail-atlas-data.js` 都在相同目录。提交后等待 Pages 部署，再打开网站首页与“轨道百科”页面测试搜索、筛选和在线表格读取。
