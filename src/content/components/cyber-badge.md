---
id: "cyber-badge"
name: "赛博徽章 (Cyber Badge)"
description: "极小尺寸的高信息密度标签，支持多种语义颜色和交互特效。"
usage: "用于标记状态、分类、版本号或警告级别。"
props:
  - name: "text"
    type: "string"
    default: "'STABLE'"
    description: "徽章显示的文字内容"
  - name: "type"
    type: "'primary' | 'success' | 'warning' | 'error' | 'neutral'"
    default: "'primary'"
    description: "语义化颜色类型"
  - name: "variant"
    type: "'solid' | 'outline' | 'glitch'"
    default: "'outline'"
    description: "视觉风格：实心、轮廓或带有 Glitch 悬停特效"
  - name: "size"
    type: "'xs' | 'sm' | 'md'"
    default: "'sm'"
    description: "徽章尺寸"
  - name: "class"
    type: "string"
    default: "''"
    description: "自定义样式类名"
---

### 组件特性
- **工业语义化**：内置五种核心语义颜色，能够清晰传递系统状态信息。
- **Glitch 特效**：`glitch` 变体在悬停时会触发一个覆盖式的色块滑动效果，增加交互的动感。
- **紧凑布局**：专为高密度信息流设计，即使在 `xs` 尺寸下也能保持极佳的可读性。
- **等宽字体**：强制使用等宽字体，确保在不同文字内容下徽章的视觉重心保持一致。

### 使用建议
推荐用于文章标签、代码版本号标记或监控面板的状态显示。在列表项中使用时，建议保持 `size="sm"` 以维持视觉平衡。
