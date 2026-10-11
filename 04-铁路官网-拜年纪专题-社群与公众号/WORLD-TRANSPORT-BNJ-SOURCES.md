# 世界交通拜年纪页面：资料来源与同步说明

## 官方账号入口（由用户提供）
- B站空间：https://space.bilibili.com/3546601293351293
- 视频投稿：https://space.bilibili.com/3546601293351293/upload/video
- 合集列表：https://space.bilibili.com/3546601293351293/lists
- 动态：https://space.bilibili.com/3546601293351293/dynamic

## 当前已核实作品
- 《〖2025年交通拜年纪〗2025年世界交通拜年纪直播回放》；BV16ZFjeMEzE；原视频：https://www.bilibili.com/video/BV16ZFjeMEzE/
- 标题的公开索引参考：https://www.bilibili.com/opus/1033097290076651526/ （页面第 311 条列出了该 BV 号与标题）。这属于第三方整理索引，不代表该专栏由本团队发布。

## 头像、视频封面、合集与动态自动同步
- `scripts/fetch_world_transport_bnj.py` 使用 B站公开空间信息、视频列表、视频详情、合集和动态接口尝试读取数据。
- `.github/workflows/refresh-world-transport-bnj.yml` 支持手动运行和每周运行，成功获取后会把 `assets/world-transport-bnj-data.json`、头像和封面缓存提交回仓库。
- 目前执行环境不能直接访问 B 站空间/API，因此 ZIP 中的头像和封面 SVG 是明确标识的本地主题占位图，不是抓取到的官方头像或原视频封面。部署后需在仓库 Actions 中运行 `Refresh World Transport New Year Gala`，只有接口正常返回时，才会替换为真实数据。
- 此同步工具只读公开账号元数据并缓存头像/视频缩略图，不下载视频本体。
- B站接口可能限流、调整或拒绝匿名请求；同步失败时会保留已有资料和四个官方入口，不会编造标题、发布日期或数据。
