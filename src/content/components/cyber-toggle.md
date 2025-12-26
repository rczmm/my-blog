---
id: "cyber-toggle"
name: "赛博开关 (Cyber Toggle)"
description: "具有未来科技感的二进制切换开关，支持多种尺寸和禁用状态。"
usage: "用于系统设置、功能开关或任何需要二进制状态切换的场景。"
props:
  - name: "label"
    type: "string"
    default: "'SYSTEM_CORE'"
    description: "开关旁的标签文字"
  - name: "checked"
    type: "boolean"
    default: "true"
    description: "开关的初始状态"
  - name: "size"
    type: "'sm' | 'md' | 'lg'"
    default: "'md'"
    description: "开关的尺寸"
  - name: "disabled"
    type: "boolean"
    default: "false"
    description: "是否禁用开关"
  - name: "class"
    type: "string"
    default: "''"
    description: "自定义样式类名"
---

### 组件特性
- **工业设计**：采用硬朗的方角设计，区别于传统的圆润风格，更具工业和科幻感。
- **动态反馈**：开关切换时带有平滑的位移动效，并伴有核心发光效果。
- **扫描特效**：鼠标悬停时，轨道内部会触发一层流光扫描特效。
- **多尺寸适配**：预设了三种尺寸，能够灵活适配从侧边栏到主面板的不同布局需求。

### 使用建议
推荐在深色模式或具有科技感的 UI 界面中使用。作为核心功能的开关时，建议搭配 `lg` 尺寸以增强视觉引导。
