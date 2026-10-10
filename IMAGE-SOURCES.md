# 图片与线路图来源说明（2026-10-10 更新）

本网站页面引用的部分原始列车照片、车站照片及线路图使用 Wikimedia Commons 的 `Special:FilePath` 公开文件地址，并在各张图旁链接回具体文件页。不同图片可能采用 CC BY-SA、公共领域或其他授权，使用或再发布前应以对应文件页的作者、署名方式和许可证为准。

## 线路图文件页
- 广州地铁：<https://commons.wikimedia.org/wiki/File:Guangzhou_Metro_Linemap.svg>
- 珠三角综合轨道交通图（用于佛山区域参考）：<https://commons.wikimedia.org/wiki/File:Pearl_River_Delta_Metro_and_Railway_Map.svg>
- 深圳地铁系统图：<https://commons.wikimedia.org/wiki/File:Shenzhen_Metro_(Rapid_Transit)_System_Map.svg>
- 东莞轨道交通线网图：<https://commons.wikimedia.org/wiki/File:Dongguan_Rail_Transit_System_Map.svg>
- 香港铁路路线图：<https://commons.wikimedia.org/wiki/File:Hong_Kong_Railway_Route_Map_en.svg>
- 澳门轻轨规划线路图：<https://commons.wikimedia.org/wiki/File:MLRT_Route_Map_Planning.svg>
- 大湾区城际线路示意：<https://commons.wikimedia.org/wiki/File:PRDIR_(GBA_Intercity)_Diagram_(CHS%26ENG,_svg,_by_Sir1L0n).svg>
- 清远磁浮旅游专线实际走向：<https://commons.wikimedia.org/wiki/File:Actual_Route_of_Qingyuan_Maglev_Tourist_Line.png>
- 珠三角客运铁路示意（不是广东全省国铁完整官方线路图）：<https://commons.wikimedia.org/wiki/File:Map_of_Intercity_Passenger_Rail_System_in_Pearl_River_Delta_Area,_China.png>

## 列车与车站照片文件页
- 广州地铁车辆基地列车：<https://commons.wikimedia.org/wiki/File:A10_Train_(12x005-006)_and_B12_Train_(07x101-102_and_07x105-106)_at_Guangzhou_CRRC_Base,_Guangzhou_Metro_20240331.jpg>
- 广肇城际列车停靠佛山西站：<https://commons.wikimedia.org/wiki/File:Guangzhou-Zhaoqing_Intercity_Rail_CRH6_Train_Arriving_at_Foshanxi_Railway_Station_Platform_19.jpg>
- 深圳地铁列车：<https://commons.wikimedia.org/wiki/File:L13_Train_(1326)_at_CRRC_Guangdong_Base,_Shenzhen_Metro_20260218.jpg>
- 东莞轨道交通1号线列车：<https://commons.wikimedia.org/wiki/File:Dongguan_Rail_Transit_Line_1_Train.jpg>
- 香港港铁列车：<https://commons.wikimedia.org/wiki/File:MTR-train.jpg>
- 澳门轻轨列车：<https://commons.wikimedia.org/wiki/File:Macau_LRT_Train.jpg>
- 清远磁浮列车进站：<https://commons.wikimedia.org/wiki/File:QY03_entering_Maglev_Yinzhan_Station,_Qingyuan_Maglev_20240206.jpg>
- 广州南站与高速列车：<https://commons.wikimedia.org/wiki/File:Guangzhou_South_Station_with_trains.jpg>

## 技术说明与边界
- 新闻栏目主题 SVG 是本网站本地制作的示意图，不应被理解为新闻现场摄影。
- 视频栏目优先读取 B 站公开标题及封面；接口受限时以本地封面示意图和原视频链接作为回退，本站并未下载或重新托管视频文件。仓库附带 GitHub Actions 工作流，可按月/手动读取公开元数据并把封面缩略图缓存到本地；上传工作流并启用 Actions 后才会实际运行。
- “佛山地铁”目前使用佛山西站的广肇城际列车作为区域轨道交通配图，页面文案明确说明它不是佛山地铁车辆。
- “广铁集团”卡片中的珠三角客运铁路示意图并非广东省内普速与高速铁路的完整线路图；请以中国国家铁路集团、12306 及相关铁路局公告为准。
- 维基图件是社区维护的版本快照，尤其线路图中规划线、建设线和运营线的边界可能不同；关键线路状态需以运营公司及主管部门公告核对。
- 对其他区域运营方，铁路官网目录卡片使用标有“非该公司实拍图”的本地通用示意图，避免把别家列车误标为该公司车辆。重点粤港澳运营方则使用有可追溯文件页的图片。


## 运营方标志与动态图片检索

`railway-media.js` 会优先尝试使用可明确识别的维基共享资源标志文件；其余运营方在访客浏览器支持跨域请求时，会通过 Wikimedia Commons API 搜索可公开访问的图片。图片结果会保存源文件页 URL，并在卡片中提供来源入口。由于 Commons 文件名及搜索结果可能不完全匹配，正式使用前仍应打开来源页核验是否确属对应运营公司及适用许可。

若无可稳定匹配的正式 Logo，页面使用带“非官方文字标识”说明的本地回退图，不冒充官方标志。外部照片无法加载时，页面会显示本地 SVG 主题示意图；主题示意图不是列车实拍。

## 新闻图片

部分新闻卡片使用 Wikimedia Commons 的系统参考照片，并附有图源页面链接；照片不一定拍摄于新闻发生现场。其余卡片使用 `assets/news-covers/` 中自制的主题 SVG，并在卡片说明中标注。使用 Commons 内容时应逐个文件页复核作者、许可和署名要求。
