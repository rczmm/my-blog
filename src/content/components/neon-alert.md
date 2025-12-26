---
id: "neon-alert"
name: "霓虹警报 (Neon Alert)"
description: "具有强视觉引导力的提示框，通过左侧霓虹灯条和扫描线效果增强临场感。"
usage: "用于显示系统通知、操作反馈、安全警告或状态提示。"
props:
  - name: "title"
    type: "string"
    default: "'SYSTEM_NOTIFICATION'"
    description: "提示框顶部的标题文字"
  - name: "message"
    type: "string"
    default: "'Operation completed successfully...'"
    description: "详细的提示信息内容"
  - name: "type"
    type: "'info' | 'success' | 'warning' | 'error'"
    default: "'info'"
    description: "警报的语义化类型，决定主题颜色"
  - name: "icon"
    type: "string"
    description: "自定义图标 (Emoji 或组件)，不传则使用默认语义图标"
  - name: "class"
    type: "string"
    default: "''"
    description: "自定义样式类名"
---

### 组件特性
- **霓虹边框**：左侧带有高亮度的垂直灯条，并伴有向外扩散的呼吸发光效果。
- **动态扫描线**：内置极细的横向扫描线动画，模拟 CRT 或全息显示屏的视觉质感。
- **磨砂沉浸**：背景采用深色半透明材质，配合高斯模糊，在任何复杂背景上都能清晰浮现。
- **语义化色彩**：针对四种状态进行了色彩优化，确保信息的优先级能够被直观感知。

### 使用建议
适用于需要引起用户注意但又不想中断其操作流程的场景。可以作为全局通知系统的一部分，或者在表单提交后作为反馈显示。
