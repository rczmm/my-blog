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
        description: "类似 GitHub 的提交记录热力图，展示数据频率。",
        usage: "用于展示活动记录、活跃度等时间序列数据。"
      },
      {
        id: "circular-progress",
        name: "圆形进度条 (Circular Progress)",
        description: "动态展示百分比进度的圆形容器。",
        usage: "用于展示加载状态、任务完成率等。"
      }
    ]
  },
  {
    id: "business-logic",
    name: "业务逻辑组件库",
    description: "封装了特定业务逻辑的复合组件，如文件上传、评论系统等。",
    icon: "🛠️",
    components: [
      {
        id: "file-uploader",
        name: "流式文件上传器 (File Uploader)",
        description: "支持大文件切片上传和进度实时反馈的上传组件。",
        usage: "用于处理各类文件上传场景。"
      }
    ]
  }
];
