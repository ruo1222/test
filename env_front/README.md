# 惠州市空气质量监测平台 <img src="public/logo.svg" alt="logo" width="32" height="32" align="right"/>

<div align="center">
  <img src="public/banner.svg" alt="惠州市空气质量监测平台" width="800"/>
  
  
  <p align="center">
    <strong>专业 · 精准 · 实时</strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js" alt="Vue 3"/>
    <img src="https://img.shields.io/badge/Vite-2.x-646CFF?style=flat-square&logo=vite" alt="Vite"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/ECharts-5.x-AA344D?style=flat-square&logo=apache-echarts" alt="ECharts"/>
  </p>
</div>

## 项目简介

惠州市空气质量监测平台是一个现代化的空气质量数据可视化系统，提供实时空气质量监测、历史数据分析、趋势预测等功能。该平台采用 Vue 3 框架开发，结合 Tailwind CSS 实现响应式设计，为用户提供直观、专业的空气质量数据展示界面。

## 主要功能

- 实时空气质量指数（AQI）监测
- 24小时空气质量趋势分析
- 未来空气质量预测
- 历史数据统计与分析
- 空气质量知识库
- 健康建议提示

## 技术栈

- Vue 3
- Vite
- Tailwind CSS
- ECharts
- Lucide Icons
- PostCSS

## 项目结构

```
project/
├── src/
│   ├── components/
│   │   ├── AirQualityDashboard.vue   # 主面板组件
│   │   ├── AirQualityChart.vue       # 24小时趋势图表组件
│   │   ├── AirQualityPrediction.vue  # 空气质量预测组件
│   │   ├── AirQualityIndicators.vue  # 空气质量指标组件
│   │   ├── HistoricalData.vue        # 历史数据组件
│   │   └── AirQualityKnowledge.vue   # 空气质量知识库组件
│   ├── lib/
│   │   └── api.js                    # API 接口封装
│   ├── assets/                       # 静态资源
│   ├── App.vue                       # 根组件
│   └── main.js                       # 应用入口
├── public/                           # 公共资源
├── index.html                        # HTML 模板
├── vite.config.js                    # Vite 配置
├── tailwind.config.js                # Tailwind 配置
├── postcss.config.js                 # PostCSS 配置
└── package.json                      # 项目依赖配置
```

## 组件说明

### AirQualityDashboard.vue
- 项目的主要面板组件
- 整合所有子组件的展示
- 负责数据的统一管理和分发
- 实现响应式布局设计

### AirQualityChart.vue
- 展示24小时空气质量趋势图表
- 使用 ECharts 实现数据可视化
- 支持数据缩放和交互功能

### AirQualityPrediction.vue
- 展示未来空气质量预测数据
- 包含多个污染物指标的预测趋势
- 支持预测数据的图表展示

### AirQualityIndicators.vue
- 展示各项空气质量指标
- 包括 PM2.5、PM10、SO2、NO2、O3、CO 等
- 提供指标的实时数值和等级展示

### HistoricalData.vue
- 历史数据查询和展示
- 支持多维度数据筛选
- 提供数据统计和分析功能

### AirQualityKnowledge.vue
- 空气质量相关知识库
- 提供污染物介绍和防护知识
- 健康影响评估指南

## 安装和运行

### 环境要求
- Node.js 16.0 或更高版本
- npm 7.0 或更高版本

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd [项目目录]
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## API 接口说明

项目的 API 接口封装在 `src/lib/api.js` 中，主要包含以下功能：

- `fetchAirQualityData()`: 获取实时空气质量数据
- `fetchAQITrend()`: 获取24小时 AQI 趋势数据
- `fetchPredictionData()`: 获取空气质量预测数据
- `fetchHistoricalData()`: 获取历史统计数据

## 部署说明

1. 执行构建命令生成生产版本
```bash
npm run build
```

2. 将 `dist` 目录下的文件部署到 Web 服务器

3. 确保服务器配置了正确的 CORS 和缓存策略

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

[待定]

## 联系方式

[待定] 