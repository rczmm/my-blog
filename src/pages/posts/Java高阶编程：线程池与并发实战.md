---
title: 'Java 高阶编程：线程池与并发'
pubDate: 2025-12-22
layout: '../../layouts/PostLayout.astro'
description: '深入理解 Java 线程池、JDK 预设方案、执行原理以及 JDK 21 虚拟线程。'
author: 'rcz'
tags:
  - "Java"
  - "多线程"
  - "并发编程"
  - "JDK21"
---

## 1. 线程池核心原理 (ThreadPoolExecutor)

在生产环境中，我们永远推荐通过 `ThreadPoolExecutor` 手动创建线程池，而不是使用 `Executors` 的预设方法。

### 1.1 七大核心参数

```java
public ThreadPoolExecutor(
    int corePoolSize,                      // 1. 核心线程数 (常驻线程)
    int maximumPoolSize,                   // 2. 最大线程数
    long keepAliveTime,                    // 3. 非核心线程空闲存活时间
    TimeUnit unit,                         // 4. 时间单位
    BlockingQueue<Runnable> workQueue,     // 5. 任务队列 (存放等待执行的任务)
    ThreadFactory threadFactory,           // 6. 线程工厂 (用于给线程起名)
    RejectedExecutionHandler handler       // 7. 拒绝策略 (队列和线程都满时的处理)
)
```

### 1.2 执行流程 (原理)

1.  **提交任务**：首先判断 **核心线程数** 是否已满。
2.  **入队**：如果核心线程已满，任务进入 **阻塞队列** (`workQueue`)。
3.  **扩容**：如果队列也满了，判断当前线程数是否达到 **最大线程数**。未达到则创建非核心线程立即执行。
4.  **拒绝**：如果达到最大线程数且队列已满，触发 **拒绝策略** (`handler`)。

---

## 2. JDK 预设线程池详解

虽然不推荐直接使用，但在特定小型工具类场景中仍有其价值。

### 2.1 FixedThreadPool (固定大小)
*   **原理**：`corePoolSize` == `maximumPoolSize`。
*   **场景**：已知并发压力，需要限制资源消耗的场景。
*   **危险**：默认使用 `LinkedBlockingQueue` (无界队列)，任务堆积可能导致 **OOM**。

### 2.2 CachedThreadPool (缓存池)
*   **原理**：核心线程 0，最大线程 `Integer.MAX_VALUE`，线程空闲 60s 回收。
*   **场景**：执行大量短期、轻量级的异步任务。
*   **危险**：瞬时任务过多会创建海量线程，导致 **CPU 100%** 或 **OOM**。

### 2.3 SingleThreadExecutor (单线程)
*   **原理**：核心与最大线程均为 1，使用无界队列。
*   **场景**：需要保证任务按 **顺序执行** 的场景（如日志写入）。

### 2.4 ScheduledThreadPool (定时任务)
*   **原理**：支持延迟执行或周期性执行。
*   **场景**：简单的清理任务、心跳检测。

### 2.5 WorkStealingPool (JDK 8+ 任务窃取)
*   **原理**：基于 `ForkJoinPool`，每个线程都有自己的双端队列，空闲线程会从其他线程队列末尾“窃取”任务。
*   **场景**：耗时较长的并行计算，能极大地提高多核 CPU 利用率。

---

## 3. 拒绝策略选择

| 策略 | 说明 | 适用场景 |
| :--- | :--- | :--- |
| **AbortPolicy** (默认) | 直接抛出异常 | 关键业务，必须感知任务丢失 |
| **CallerRunsPolicy** | 由提交任务的线程执行 | 只要主线程不垮，任务最终会被执行 |
| **DiscardPolicy** | 直接丢弃任务，不报错 | 无关紧要的日志、监控推送 |
| **DiscardOldestPolicy** | 丢弃队列里最老的任务 | 关注最新数据的场景 |

---

## 4. JDK 21 虚拟线程 (Virtual Threads)

这是 Java 并发编程史诗级的更新（Project Loom）。

### 4.1 为什么需要虚拟线程？
*   **传统平台线程**：由 OS 调度，一个线程约占 1MB 内存，上下文切换成本高。1000 个线程就可能让系统吃力。
*   **虚拟线程**：由 JVM 调度，极其轻量（KB 级别）。你可以轻松开启 **100 万个** 虚拟线程而不会压垮内存。

### 4.2 实战代码

#### 直接创建
```java
Thread.startVirtualThread(() -> {
    System.out.println("运行在虚拟线程中: " + Thread.currentThread());
});
```

#### 配合线程池 (ExecutorService)
JDK 21 专门为虚拟线程提供了新的执行器：
```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10000).forEach(i -> {
        executor.submit(() -> {
            // 模拟阻塞 IO (虚拟线程在这里会自动让出底层平台线程)
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
} // 自动关闭并等待任务完成
```

### 4.3 适用场景
*   **高并发 IO 密集型**：Web 服务、数据库操作、文件读写。
*   **注意**：对于 **CPU 密集型**（如加密、图像处理），虚拟线程并不能带来性能提升，仍应使用传统的固定大小线程池。

---

## 5. 最佳实战建议

1.  **线程命名**：使用 `ThreadFactory` 为线程起名，方便 `jstack` 排查。
2.  **有界队列**：永远不要使用无界队列，防止 OOM。
3.  **关闭线程池**：在应用关闭时，务必调用 `shutdown()` 或 `shutdownNow()`。
4.  **核心线程预热**：可以使用 `prestartAllCoreThreads()` 在初始化时就启动核心线程。
