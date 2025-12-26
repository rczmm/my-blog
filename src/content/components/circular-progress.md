---
id: "circular-progress"
name: "圆形进度条 (Circular Progress)"
description: "动态展示百分比进度的圆形容器，支持自定义颜色和发光特效。"
usage: "用于展示加载状态、任务完成率或仪表盘数据。"
props:
  - name: "percent"
    type: "number"
    default: "75"
    description: "当前的进度百分比 (0-100)"
  - name: "size"
    type: "number"
    default: "120"
    description: "组件的宽度和高度 (px)"
  - name: "strokeWidth"
    type: "number"
    default: "10"
    description: "进度条的线条粗细"
  - name: "showText"
    type: "boolean"
    default: "true"
    description: "是否显示中间的百分比文字"
  - name: "color"
    type: "string"
    default: "var(--color-primary-start)"
    description: "进度条的颜色 (支持 CSS 颜色值)"
---

### 组件特性
- **SVG 渲染**：基于原生 SVG，支持任意缩放而不失真。
- **平滑动画**：内置 CSS 过渡动画，进度切换自然流畅。
- **高度定制**：可自由调整粗细、大小、颜色及文字显示。
- **响应式设计**：适配各种容器尺寸。

### 使用建议
适用于展示任务进度、资源占用、仪表盘等场景。可以通过 `color` 参数配合主题变量，实现不同状态（如成功、警告、错误）的视觉反馈。
