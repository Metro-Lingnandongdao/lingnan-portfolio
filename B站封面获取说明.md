# 获取 B 站标题与封面（可选）

视频页会先尝试读取仓库里的 `assets/bilibili-video-metadata.json`，然后再尝试调用 B 站公开视频信息接口。由于托管环境的跨域与访问策略不同，浏览器不一定总能读取接口，所以包内保留了本地占位封面与原视频链接。

如需把官方封面保存到本地：

1. 在已解压的网站根目录安装 Python 3。
2. 确认电脑可正常访问 B 站公开页面。
3. 运行 `python scripts/fetch_bilibili_metadata.py`。
4. 脚本会尝试获取本页收录的视频标题、发布时间、时长、播放统计和封面图，写入 `assets/bilibili-video-metadata.json`，并将可获取的封面存进 `assets/video-covers-original/`。
5. 检查生成文件，再将 JSON 和 `assets/video-covers-original/` 一并提交到 GitHub。

此脚本只获取公开元数据与封面图片，不下载视频文件。若 B 站返回访问限制或接口不可用，脚本会报告失败并继续处理后续视频；不要反复高频请求，稍后再试即可。
