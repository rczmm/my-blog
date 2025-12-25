---
id: "glass-card"
name: "玻璃拟态卡片 (Glass Card)"
description: "具有磨砂玻璃质感的卡片容器，支持背景模糊和半透明边框。"
usage: "用于展示内容块，增强视觉层次感。"
props:
  - name: "title"
    type: "string"
    description: "卡片顶部标题"
  - name: "icon"
    type: "string"
    description: "标题旁的图标 (支持 Emoji 或图标组件)"
  - name: "subtitle"
    type: "string"
    description: "标题下方的副标题"
  - name: "class"
    type: "string"
    default: "''"
    description: "自定义样式类名"
---

### 组件特性
- **结构化布局**：内置 Header、Subheader、Content 和 Footer 区域。
- **磨砂玻璃效果**：利用 `backdrop-filter: blur()` 实现。
- **插槽灵活性**：支持通过 `slot="header"`、`slot="subheader"` 和 `slot="footer"` 自定义各个区域的内容。
- **悬停交互**：平滑的上移和阴影加深效果。

### 视觉细节
建议在具有彩色或复杂背景的容器中使用，以突出玻璃的透明感。可以使用内置的 `title` 和 `icon` 属性快速构建卡片头部。
