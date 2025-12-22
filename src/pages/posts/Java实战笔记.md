---
title: 'Java 笔记'
pubDate: 2025-12-15
layout: '../../layouts/PostLayout.astro'
description: 'Java日常笔记,部分内容单独列出,本篇为汇总'
author: 'rcz'
tags:
  - "Java"
  - "后端"
---

## 1. 函数式编程：Stream 与 Optional

Java 8+ 带来的函数式编程极大地提升了代码的简洁性与可读性。关于这两者的详细 API 列表、复杂数据转换（如多级分组、扁平化）以及生产环境下的联动实战，请参考专项笔记：

👉 **[Java 高阶编程：Stream 与 Optional 实战](./Java高阶编程：Stream与Optional实战)**

---

## 2. 线程池与并发 (ThreadPool)

Java 线程池是后端开发中处理高并发的核心工具。从基础的 `ThreadPoolExecutor` 到 JDK 21 引入的虚拟线程，理解其执行原理与场景选择至关重要。关于线程池的参数详解、拒绝策略选择以及虚拟线程实战，请参考专项笔记：

👉 **[Java 高阶编程：线程池与并发实战](./Java高阶编程：线程池与并发实战)**

---

## 3. 定时任务 (Scheduled Tasks)

从简单的本地定时器到复杂的分布式任务调度中心，Java 生态提供了成熟的演进路径。无论是 Spring 内置的 `@Scheduled` 还是工业级的 `XXL-JOB`，核心在于根据业务规模选择合适的调度策略。关于单机与分布式任务的对比及 XXL-JOB 实战，请参考专项笔记：

👉 **[分布式定时任务实战：从 @Scheduled 到 XXL-JOB](./分布式定时任务实战：从@Scheduled到XXL-JOB)**

---

## 4. 文档解析 (Document Parsing)

在企业级应用中，对 Excel、Word 和 PDF 的读写是极其常见的需求。从阿里的 EasyExcel 到经典的 Apache POI，选择合适的工具能显著提升系统稳定性。关于各框架的参数定义、使用场景及性能对比，请参考专项笔记：

👉 **[Java 实战：Excel、Word、PDF 多格式文档解析指南](./Java实战：Excel、Word、PDF多格式文档解析指南)**

---

## 5. Maven 构建管理

Maven 是 Java 项目最常用的构建与管理工具。关于 Maven 的详细命令、生命周期、POM 标签以及多环境打包等实战场景，请参考专项笔记：

👉 **[Maven 实战详解](./Maven实战详解)**

---

## 6. 实时通信 (Real-time Communication)

在现代 Web 应用中，实时性是用户体验的关键。从传统的轮询到现代的服务端推送（SSE）和全双工通信（WebSocket），Java 提供了丰富的技术栈。关于各方案的实现细节、参数定义以及 Nginx 配置优化，请参考专项笔记：

👉 **[Java 实战：实时通信全方案（轮询、SSE、WebSocket）](./Java实战：实时通信全方案（轮询、SSE、WebSocket）)**

---

## 7. Linux 运维与调优 (Linux Ops & Tuning)

后端开发离不开 Linux。从日志排查（Grep/Awk）到性能监控（Top/Free），再到网络诊断（Netstat/Curl），掌握高频命令能让排错效率翻倍。详细命令手册请参考：

👉 **[Linux 实战指南：从基础操作到高级性能调优](./Linux实战指南：从基础操作到高级性能调优)**

---

## 8. 生产环境调试方案 (Production Debugging)

当应用在生产环境出现 CPU 飙高、内存溢出或响应缓慢时，如何快速准确定位问题？除了 Linux 基础命令，我们还需要掌握 Arthas 诊断利器及 JDK 原生工具。详细实战指南请参考：

👉 **[Java 生产环境调试指南：Arthas 与 JDK 原生工具实战](./Java生产环境调试指南：Arthas与JDK原生工具实战)**

---
