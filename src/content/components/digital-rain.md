---
id: "digital-rain"
name: "数字雨背景 (Digital Rain)"
description: "经典的黑客帝国风格代码雨特效，基于 Canvas 渲染，高度可配置。"
usage: "用于装饰背景、加载界面或营造极客氛围。"
props:
  - name: "speed"
    type: "number"
    default: "1"
    description: "下落速度倍率"
  - name: "fontSize"
    type: "number"
    default: "14"
    description: "字符大小 (px)"
  - name: "color"
    type: "string"
    default: "'var(--color-primary-start)'"
    description: "字符颜色"
  - name: "density"
    type: "number"
    default: "0.5"
    description: "字符密度 (0-1)"
  - name: "class"
    type: "string"
    default: "''"
    description: "自定义样式类名"
---

### 组件特性
- **高性能渲染**：基于原生 Canvas API 绘制，即使在大量字符下落时也能保持流畅。
- **动态适配**：自动监听容器尺寸变化并重新初始化，确保全屏或局部展示都能完美填充。
- **氛围增强**：叠加了一层细微的扫描线效果，模拟老式显示器的质感。
- **全字符集**：内置了包括字母、数字、特殊符号在内的丰富字符集，随机掉落。

### 使用建议
建议作为页面的局部背景（如卡片内部）或全屏背景使用。为了保证文字可读性，建议在上方覆盖一层半透明的遮罩或使用高对比度的文字颜色。
