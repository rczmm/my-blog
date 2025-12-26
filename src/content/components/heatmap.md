---
id: "heatmap"
name: "贡献热力图 (Heatmap)"
description: "类似 GitHub 的提交记录热力图，展示数据频率。"
usage: "用于展示活动记录、活跃度等时间序列数据。"
props:
  - name: "data"
    type: "number[]"
    default: "[]"
    description: "活跃度数据数组，0-4 表示不同强度"
  - name: "cellSize"
    type: "number"
    default: "14"
    description: "每个方格的大小 (px)"
  - name: "gap"
    type: "number"
    default: "4"
    description: "方格之间的间距 (px)"
  - name: "colors"
    type: "string[]"
    default: "['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']"
    description: "五个等级对应的颜色数组"
  - name: "title"
    type: "string"
    default: "'Activity Heatmap'"
    description: "热力图顶部的标题内容"
---

### 组件特性
- **数据映射**：将数值自动映射到五个等级的颜色。
- **动态网格**：基于 CSS Grid，支持自定义行列比例。
- **交互缩放**：鼠标悬停时方格平滑放大，并显示详细信息。
- **图例展示**：内置 Legend 区域，清晰展示颜色等级含义。

### 使用建议
常用于展示 GitHub 贡献、用户活跃度或任何时间序列的频率数据。可以根据项目主题修改 `colors` 数组来适配不同的色彩倾向（如蓝色系或紫色系）。

### 示例配置
```javascript
const data = [
  { date: '2023-01-01', count: 5 },
  { date: '2023-01-02', count: 12 },
  // ...
];
```
