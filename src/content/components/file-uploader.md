---
id: "file-uploader"
name: "流式文件上传器 (File Uploader)"
description: "支持大文件切片上传和进度实时反馈的上传组件，具备玻璃质感和状态切换。"
usage: "用于处理各类文件上传场景，提供明确的视觉反馈。"
props:
  - name: "title"
    type: "string"
    default: "'DROP_FILES_HERE'"
    description: "上传区域的主提示文字"
  - name: "maxSize"
    type: "string"
    default: "'512MB'"
    description: "允许上传的最大文件大小"
  - name: "accept"
    type: "string"
    default: "'*.*'"
    description: "允许上传的文件类型 (MIME type)"
  - name: "progress"
    type: "number"
    default: "42"
    description: "当前的上传进度百分比 (0-100)"
  - name: "fileName"
    type: "string"
    default: "'DATA_CORE.bin'"
    description: "当前正在上传的文件名"
  - name: "status"
    type: "'idle' | 'uploading' | 'success' | 'error'"
    default: "'uploading'"
    description: "上传器的状态控制"
  - name: "class"
    type: "string"
    default: "''"
    description: "自定义样式类名"
---

### 组件特性
- **状态感知**：内置空闲、上传中、成功、失败四种状态，自动切换图标和配色。
- **流式进度**：进度条支持平滑过渡，并带有霓虹发光效果，增强视觉动感。
- **玻璃质感**：继承了系统的磨砂玻璃设计语言，支持背景模糊。
- **交互反馈**：悬停时触发边框高亮和背景微光，提升操作确定性。

### 使用建议
建议在表单提交、附件上传或资源管理后台使用。可以通过监听 `status` 的变化来同步更新 UI 的其他部分。对于大文件上传，建议配合后端的分片上传接口使用。
