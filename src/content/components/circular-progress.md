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
    default: "100"
    description: "组件的宽度和高度 (px)"
  - name: "strokeWidth"
    type: "number"
    default: "8"
    description: "进度条的线条粗细"
---

### 组件特性
- **SVG 矢量渲染**：无论缩放倍数如何，始终保持清晰的边缘。
- **平滑动画**：利用 `stroke-dashoffset` 实现进度变化的补间动画。
- **霓虹发光**：内置 `drop-shadow` 滤镜，增强暗色模式下的视觉表现力。
- **自动对齐**：文字始终保持在圆环中心，且不受 SVG 旋转影响。

### 技术实现细节
该组件使用了经典的 SVG 圆环进度原理：
1.  设置 `stroke-dasharray` 为圆的周长 ($2\pi r$)。
2.  通过计算偏移量 `stroke-dashoffset` 来控制显示的弧度长度。
3.  外层容器设置 `transform: rotate(-90deg)` 使起点位于 12 点钟方向。

### 使用建议
建议在数据仪表盘、系统监控面板或文件上传进度等场景下使用。可以配合 `var(--color-primary-start)` 等主题变量来实现颜色的统一。
