# 项目名称

项目名称：**惠州环境预测**

## 项目描述

**Env Predict** 是一个基于`Flask`的 Web 应用程序，旨在提供环境预测服务。该项目支持 HTTP 启动，并集成了 `MongoDB` 数据库,爬虫模块,和定时任务调度功能,并通过自己训练的模型提供环境aqi预测功能。用户可以通过 API 接口访问预测服务。
**Env front** 是前端展示页面，利用`VUE`实现

## 安装步骤

1. **克隆项目**：
   ```bash
   git clone 
   ```

2. **后端项目启动**：
- `http_app.py`是项目的启动文件，启动后会执行一个服务器，此时前端才可以获取后端的接口,同时每天会定时执行爬虫脚本
- `src/collector/env_huizhou_bak.py`是爬虫脚本，这个脚本的执行需要运行`docker run -p 8050:8050 scrapinghub/splash`并且在配置`mongodb`数据库,数据库名为`env_city_test`,集合名为`d_aqi_huizhou`,
- `AQI_display`是预测模块

3. **前端项目启动**：
- `npm run dev`即可启动

4. 特殊说明
- 后端启动必须以`env_predict`为根目录，不然启动不了 

## 贡献指南

欢迎任何形式的贡献！请遵循以下步骤：

1. Fork 本仓库。
2. 创建您的特性分支 (`git checkout -b feature/YourFeature`)。
3. 提交您的更改 (`git commit -m 'Add some feature'`)。
4. 推送到分支 (`git push origin feature/YourFeature`)。
5. 创建一个新的 Pull Request。

## 许可证

本项目使用 MIT 许可证。有关详细信息，请查看 [LICENSE](LICENSE) 文件。