---
title: 'CSS 核心速查手册：从基础到现代 Web 开发'
pubDate: 2025-12-25
layout: '../../layouts/PostLayout.astro'
description: '一份为开发者准备的 CSS 实用手册，涵盖现代布局、动画性能、高级选择器及避坑指南。'
author: 'rcz'
tags:
  - "CSS"
  - "CheatSheet"
  - "前端"
  - "开发指南"
---

## 🛠️ 核心速查表 (Quick Reference)

### 1. 现代选择器权重 (Specificity)
| 类型 | 示例 | 权重 |
| :--- | :--- | :--- |
| `!important` | `color: red !important;` | 🚀 最高 |
| 行内样式 | `style="..."` | 1000 |
| ID 选择器 | `#header` | 0100 |
| 类/属性/伪类 | `.card`, `[type]`, `:hover` | 0010 |
| 元素/伪元素 | `div`, `::before` | 0001 |
| 通配符/逻辑 | `*`, `:is()`, `:where()` | 0000 |

> **Tip**: 尽量使用类名选择器，避免 ID 选择器过度嵌套，保持样式可重用性。

### 2. 常用单位 (Units)
- **`rem`**: 相对于根元素 (`<html>`) 的字体大小。建议设为 16px，方便计算。
- **`em`**: 相对于父元素。常用于 `padding` 或 `margin` 随字体缩放。
- **`vh / vw`**: 视口高度/宽度的 1%。
- **`vmin / vmax`**: 视口宽高中的 最小值/最大值。
- **`ch`**: 字符 '0' 的宽度。非常适合限制段落文本行宽（如 `max-width: 60ch`）。

---

## 📦 布局引擎 (Layout Engines)

### 1. Flexbox (一维布局)
用于沿行或列排列元素。
- **容器属性**:
  - `display: flex;`
  - `justify-content`: 主轴对齐 (center, space-between, flex-end)
  - `align-items`: 交叉轴对齐 (center, stretch, flex-start)
  - `gap`: 子元素间距 (替代 margin 的现代方案)
- **项目属性**:
  - `flex: 1;` (等同于 `flex-grow: 1; flex-shrink: 1; flex-basis: 0%;`)
  - `margin: auto;` (在 flex 中可实现极致的对齐控制)

### 2. Grid (二维布局)
用于构建复杂的页面结构。
- **快速居中**: `display: grid; place-items: center;`
- **自适应网格**: `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));`
- **区域定义**:
  ```css
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  ```

---

## ✨ 视觉特效 (Visual Styles)

### 1. 毛玻璃 (Glassmorphism)
```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
}
```

### 2. 性能级动画 (GPU Acceleration)
**只动画化以下两个属性**以获得 60fps：
1. **`transform`**: (translate, rotate, scale, skew)
2. **`opacity`**

> **避坑**: 避免在动画中使用 `width`, `height`, `top`, `left`，它们会触发重排 (Reflow)。

---

## 🚀 现代 CSS 特性

### 1. CSS 变量 (Variables)
```css
:root {
  --primary-color: #007bff;
}
.btn {
  background-color: var(--primary-color);
}
```

### 2. 父级选择器 `:has()`
根据子元素状态改变父元素：
```css
.card:has(.active) {
  border-color: green; /* 当卡片内有 .active 元素时，卡片变绿 */
}
```

### 3. 容器查询 (Container Queries)
不依赖视口，依赖父容器大小：
```css
.card-container { container-type: inline-size; }
@container (min-width: 400px) {
  .card { display: flex; } /* 容器宽于 400px 时切换布局 */
}
```

---

## 🔍 调试与避坑 (Troubleshooting)

- **Z-index 无效?** 检查父元素是否有 `position: relative/absolute` 或 `z-index`。检查是否创建了新的 **层叠上下文 (Stacking Context)**。
- **Margin 消失?** 检查是否发生了 **外边距折叠**，或使用 `padding` / `overflow: hidden` (创建 BFC) 解决。
- **图片拉伸?** 使用 `object-fit: cover;` 保持比例裁剪。
- **文本溢出?**
  ```css
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  ```

---

## 📖 学习资源推荐
- [MDN Web Docs](https://developer.mozilla.org/zh-CN/docs/Web/CSS) (权威文档)
- [CSS-Tricks](https://css-tricks.com/) (技巧与实战)
- [Flexbox Froggy](https://flexboxfroggy.com/) (互动式学习)
