---
id: "code-snippet"
name: "代码片段卡片 (Code Snippet)"
description: "优雅的代码展示容器，支持行号显示、语言标签和 macOS 风格的控制按钮。"
usage: "用于在博客或文档中展示短小的代码块，提供类 IDE 的视觉体验。"
props:
  - name: "code"
    type: "string"
    default: "'function initialize() { ... }'"
    description: "要显示的代码内容"
  - name: "lang"
    type: "string"
    default: "'javascript'"
    description: "代码语言名称，将显示在右上角"
  - name: "title"
    type: "string"
    default: "'CORE_LOGIC.js'"
    description: "顶部的标题文字"
  - name: "showLineNumbers"
    type: "boolean"
    default: "true"
    description: "是否显示行号"
  - name: "class"
    type: "string"
    default: "''"
    description: "自定义样式类名"
---

### 组件特性
- **磨砂设计**：背景采用高斯模糊处理，能够完美融入各种背景环境。
- **macOS 风格**：左上角集成了经典的红黄绿三色控制圆点，模拟原生应用质感。
- **交互细节**：单行悬停高亮显示，右上角提供一键复制按钮（UI 占位）。
- **响应式排版**：自动处理长代码换行和溢出，保持卡片比例协调。

### 使用建议
适用于展示核心算法、配置示例或 API 定义。为了保持最佳视觉效果，建议展示的代码量控制在 20 行以内。
