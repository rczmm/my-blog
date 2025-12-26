export interface ComponentItem {
  id: string;
  name: string;
  description: string;
  preview?: string;
  usage?: string;
}

export interface ComponentLibrary {
  id: string;
  name: string;
  description: string;
  icon: string;
  components: ComponentItem[];
}

export const componentLibraries: ComponentLibrary[] = [
  {
    id: "basic-ui",
    name: "基础 UI 组件库",
    description: "常用的基础界面元素，包括按钮、输入框、卡片等。",
    icon: "🎨",
    components: [
      {
        id: "glass-card",
        name: "玻璃拟态卡片 (Glass Card)",
        description: "具有磨砂玻璃质感的卡片容器，支持背景模糊和半透明边框。",
        usage: "用于展示内容块，增强视觉层次感。"
      },
      {
        id: "neo-button",
        name: "新拟态按钮 (Neumorphic Button)",
        description: "通过光影效果营造出凸起或凹陷感的按钮。",
        usage: "用于主要的交互操作，提供独特的触感反馈。"
      },
      {
        id: "cyber-toggle",
        name: "赛博开关 (Cyber Toggle)",
        description: "具有未来科技感的二进制切换开关。",
        usage: "用于系统设置、功能开关等场景。"
      },
      {
        id: "cyber-badge",
        name: "赛博徽章 (Cyber Badge)",
        description: "高信息密度的状态标签。",
        usage: "用于标记状态、分类或版本号。"
      },
      {
        id: "hologram-avatar",
        name: "全息头像 (Hologram Avatar)",
        description: "全息投影质感的头像组件。",
        usage: "用于展示用户头像、团队成员等。"
      }
    ]
  },
  {
    id: "data-viz",
    name: "数据可视化组件库",
    description: "用于展示复杂数据的图表、进度条和统计面板。",
    icon: "📊",
    components: [
      {
        id: "heatmap",
        name: "贡献热力图 (Heatmap)",
        description: "展示数据频率的热力图。",
        usage: "用于展示活动记录、活跃度等时间序列数据。"
      },
      {
        id: "circular-progress",
        name: "圆形进度条 (Circular Progress)",
        description: "动态展示百分比进度的圆形容器。",
        usage: "用于展示加载状态、任务完成率等。"
      },
      {
        id: "digital-rain",
        name: "数字雨背景 (Digital Rain)",
        description: "经典的黑客帝国风格代码雨特效。",
        usage: "用于装饰背景、加载界面等。"
      }
    ]
  },
  {
    id: "business-logic",
    name: "业务逻辑组件库",
    description: "封装了特定业务逻辑的复合组件。",
    icon: "🛠️",
    components: [
      {
        id: "file-uploader",
        name: "流式文件上传器 (File Uploader)",
        description: "支持大文件切片上传和进度反馈的组件。",
        usage: "用于处理各类文件上传场景。"
      },
      {
        id: "code-snippet",
        name: "代码片段卡片 (Code Snippet)",
        description: "优雅的代码展示容器，支持行号和 macOS 风格。",
        usage: "用于展示短小的代码块。"
      },
      {
        id: "neon-alert",
        name: "霓虹警报 (Neon Alert)",
        description: "强视觉引导力的状态提示框。",
        usage: "用于系统通知、操作反馈等。"
      }
    ]
  }
];
