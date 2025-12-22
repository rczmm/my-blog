---
title: '分布式定时任务：从 @Scheduled 到 XXL-JOB'
pubDate: 2025-12-22
layout: '../../layouts/PostLayout.astro'
description: '从单机定时任务到分布式调度中心的演进，涵盖 JDK 原生、Spring Boot @Scheduled 以及 XXL-JOB 深度实战。'
author: 'rcz'
tags:
  - "Java"
  - "Spring Boot"
  - "XXL-JOB"
  - "分布式"
---

## 1. 单机定时任务方案

在简单的单体应用或对可靠性要求不高的场景下，单机方案是最快捷的选择。

### 1.1 JDK 原生 (ScheduledExecutorService)
*   **原理**：基于线程池，支持延迟执行和周期执行。
*   **优点**：无任何框架依赖。
*   **缺点**：功能单一，无法处理 Cron 表达式，任务异常容易中断。

```java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
scheduler.scheduleAtFixedRate(() -> {
    System.out.println("执行任务...");
}, 1, 5, TimeUnit.SECONDS);
```

### 1.2 Spring Boot (@Scheduled)
*   **原理**：Spring 封装的注解驱动任务。
*   **场景**：单体应用内部的简单逻辑。
*   **痛点**：
    *   **无法动态修改**：修改执行时间必须重启应用。
    *   **集群重复执行**：多实例部署时，每个实例都会跑一遍任务，可能导致数据重复（需配合分布式锁解决）。

```java
@Component
@EnableScheduling
public class MyTask {
    @Scheduled(cron = "0 0/5 * * * ?") // 每 5 分钟执行一次
    public void run() {
        // 业务逻辑
    }
}
```

---

## 2. 分布式调度中心：XXL-JOB

XXL-JOB 是目前国内最流行的分布式任务调度平台，它将“调度”与“执行”解耦。

### 2.1 核心架构
1.  **调度中心 (Admin)**：统一管理任务，负责触发任务执行，不参与具体业务逻辑。
2.  **执行器 (Executor)**：接收调度中心的请求，执行具体的业务代码。

### 2.2 为什么选择 XXL-JOB？
*   **动态性**：在管理后台随时开启、关闭、修改任务，无需重启。
*   **高可用**：支持调度中心集群，支持执行器自动注册与故障转移。
*   **丰富策略**：支持分片广播（处理海量数据）、失败重试、超时控制、报警通知等。

### 2.3 接入实战

#### 1. 引入依赖
```xml
<dependency>
    <groupId>com.xuxueli</groupId>
    <artifactId>xxl-job-core</artifactId>
    <version>2.4.x</version>
</dependency>
```

#### 2. 配置执行器
```yaml
xxl:
  job:
    admin:
      addresses: http://127.0.0.1:8080/xxl-job-admin
    executor:
      appname: my-sample-executor
      port: 9999
```

#### 3. 编写 JobHandler (Bean 模式)
这是最常用的方式，方法上加注解即可。

```java
@Component
public class SampleJob {

    @XxlJob("myDemoJobHandler")
    public void execute() {
        String param = XxlJobHelper.getJobParam(); // 获取后台配置的参数
        XxlJobHelper.log("XXL-JOB, Hello World."); // 打印日志到调度中心
        
        // 业务代码...
        
        XxlJobHelper.handleSuccess(); // 标记成功
    }
}
```

---

## 3. 进阶：分片广播任务

当你需要处理海量数据（如给 1000 万用户发通知）时，单台机器处理太慢，可以利用分片广播。

### 3.1 原理
调度中心会广播给所有注册的执行器，每个执行器获取到自己的 **分片索引 (index)** 和 **分片总数 (total)**。

### 3.2 实现代码
```java
@XxlJob("shardingJobHandler")
public void shardingJobHandler() {
    int shardIndex = XxlJobHelper.getShardIndex();
    int shardTotal = XxlJobHelper.getShardTotal();

    XxlJobHelper.log("分片参数：当前分片={}, 总分片={}", shardIndex, shardTotal);

    // 逻辑：只处理 ID % 总分片 == 当前索引 的数据
    for (int i = 0; i < 1000; i++) {
        if (i % shardTotal == shardIndex) {
            System.out.println("分片 " + shardIndex + " 正在处理数据 ID: " + i);
        }
    }
}
```

---

## 4. 方案选型建议

| 特性 | @Scheduled | XXL-JOB |
| :--- | :--- | :--- |
| **部署难度** | 极低（内置） | 中（需部署调度中心） |
| **动态调整** | 不支持 | 支持 |
| **分布式支持** | 差（需分布式锁） | 原生支持 |
| **可视化监控** | 无 | 强大（运行报表、日志） |
| **分片执行** | 不支持 | 支持 |
| **适用场景** | 简单的本地辅助任务 | 核心业务任务、海量数据处理 |
