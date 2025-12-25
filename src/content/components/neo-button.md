---
id: "neo-button"
name: "新拟态按钮 (Neumorphic Button)"
description: "具有独特光影反馈的按钮，支持多种类型、尺寸和形状，内置扫光动效。"
usage: "用于页面主要的交互操作，提供强烈的点击感和视觉反馈。"
props:
  - name: "text"
    type: "string"
    default: "'PUSH_ME'"
    description: "按钮显示的文字内容"
  - name: "type"
    type: "'primary' | 'secondary' | 'outline' | 'ghost'"
    default: "'primary'"
    description: "按钮风格类型"
  - name: "size"
    type: "'sm' | 'md' | 'lg'"
    default: "'md'"
    description: "按钮尺寸大小"
  - name: "shape"
    type: "'square' | 'rounded' | 'pill'"
    default: "'rounded'"
    description: "按钮圆角形状"
  - name: "class"
    type: "string"
    default: "''"
    description: "自定义样式类名"
---

### 组件特性
- **多样化风格**：预设四种核心类型，满足不同场景的权重需求。
- **扫光动效**：悬停时触发平滑的扫光效果，增强科技感。
- **交互反馈**：内置活跃态（Active）缩放效果，模拟真实的按压触感。
- **灵活布局**：支持三种常用尺寸和三种边框形状，高度可配置。

### 使用建议
推荐在深色或具有玻璃质感的容器中使用，以获得最佳的视觉表现。`primary` 类型自带发光阴影，适合作为页面的 Call-to-Action 按钮。
