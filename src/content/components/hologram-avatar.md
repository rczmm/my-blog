---
id: "hologram-avatar"
name: "全息头像 (Hologram Avatar)"
description: "具有全息投影质感的头像组件，支持扫描线、外发光环和故障特效。"
usage: "用于展示用户头像、团队成员或 AI 助手入口。"
props:
  - name: "src"
    type: "string"
    description: "图片源地址"
  - name: "size"
    type: "'sm' | 'md' | 'lg'"
    default: "'md'"
    description: "头像尺寸"
  - name: "glowColor"
    type: "string"
    default: "'var(--color-primary-start)'"
    description: "外发光颜色"
  - name: "scanline"
    type: "boolean"
    default: "true"
    description: "是否显示扫描线"
  - name: "class"
    type: "string"
    default: "''"
    description: "自定义样式类名"
---

### 组件特性
- **全息质感**：通过色彩偏移（Sepia）、对比度调整和半透明遮罩，模拟全息影像的半透明和不稳定感。
- **动态光环**：头像外围环绕一个持续旋转的能量环，带有一个亮白色的“轨道卫星”点。
- **故障交互**：鼠标悬停时，头像会触发强烈的 Glitch 故障动效，包括位置抖动和色相旋转。
- **扫描动画**：内置垂直移动的扫描线，增强了老式科幻界面的临场感。

### 使用建议
推荐在侧边栏用户信息、评论系统头像或 AI 对话框中使用。由于全息效果会降低图片的色彩饱和度，建议使用对比度较高的原始图片以获得最佳效果。
