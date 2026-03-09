---
title: 'JVM 生产实战：从告警到解决，彻底搞定 Full GC'
pubDate: 2026-03-09
layout: '../../layouts/PostLayout.astro'
description: 'Full GC 是 Java 程序员绕不开的坎。本文抛弃空洞的理论，直接从生产排查的视角出发，拆解从收到告警到最终定位并解决 Full GC 的全流程，涵盖 jstat、jmap、MAT 及 Arthas 的深度实战。'
author: 'rcz'
tags:
  - "JVM"
  - "Full GC"
  - "性能调优"
  - "故障排查"
---

在 Java 应用的运维字典里，**Full GC** 是“延迟飙升”和“系统卡顿”的头号元凶。一旦触发 **Stop-The-World (STW)**，应用线程全部停摆，这种不可控的抖动是高并发场景下的噩梦。

本文不谈玄学，只讲生产排查的“军规”和实战技巧。

---

## 1. 核心共识：分清 Full GC 的“流派”

排查的第一步是根据 GC 收集器的不同，识别出它是哪种“姿态”的 Full GC，这决定了后续的排查重心。

| 收集器 | 危险信号 | 背后含义 |
| :--- | :--- | :--- |
| **Parallel GC** | `Allocation Failure` | 老年代确实塞满了，通常是内存泄漏或大对象。 |
| **CMS** | `Concurrent Mode Failure` | 回收速度赶不上分配速度，被迫退化为 Serial Old 串行回收，STW 时间最长。 |
| **CMS** | `Promotion Failed` | 内存碎片化严重，老年代虽然有空位但没“连续”空间容纳晋升的对象。 |
| **G1** | `Evacuation Pause Full` | Region 分配失败，G1 退化为 Full GC，说明 Mixed GC 调优失效或对象分配过猛。 |

---

## 2. 战时指挥：排查全链路“军规”

当监控告警提示 Full GC 频繁或耗时过长时，应按以下逻辑快速响应。

### 第一阶段：瞬时态势确认（The First Response）
不要一上来就去分析 Dump。先用轻量工具确认系统还在不在，以及 GC 的频率。

- **jstat 实时观察**：
  ```bash
  # 每隔 1s 打印一次 GC 统计，共打印 10 次
  jstat -gcutil <pid> 1000 10
  ```
  **看什么？** 关注 `O` (Old) 和 `M` (Metaspace) 的比例。如果 `O` 接近 100% 且 `FGC` 次数在不断跳变，说明系统正陷入“死亡循环”。

- **Arthas 快速扫描**：
  ```bash
  # 启动 Arthas
  java -jar arthas-boot.jar
  # 查看面板
  dashboard
  ```
  **看什么？** 观察是否有某个线程（比如 `http-nio-8080-exec-X`）消耗了大量 CPU，这通常是分配大对象或死循环的元凶。

### 第二阶段：日志取证（The Smoking Gun）
GC 日志是排查的“第一现场”。如果没有日志，你就是在盲打。

**生产环境必配参数 (JDK8)**：
```bash
-XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:/opt/logs/gc-%t.log
-XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=100M
```

**日志关键行解读**：
```plaintext
[Full GC (Metadata GC Threshold) [PSYoungGen: 512K->0K(2048M)] [ParOldGen: 8192K->7800K(8192M)] ... 2.3s]
```
- **关键点**：括号里的 `Metadata GC Threshold` 直接告诉你是因为元空间满了触发的，而不是堆内存。

### 第三阶段：证据固定（Data Collection）
如果 Full GC 后内存没降下来，必须 Dump 堆快照。

- **jmap 强制 Dump**：
  ```bash
  # 注意：Dump 会导致应用短暂 STW，线上操作需谨慎
  jmap -dump:format=b,file=/tmp/heap.hprof <pid>
  ```
- **jstack 线程快照**：
  ```bash
  # 连续导出 3 次，对比线程状态
  jstack <pid> > thread_1.txt
  ```

---

## 3. 深度尸检：MAT 实战技巧

拿到 `heap.hprof` 后，使用 **Eclipse MAT (Memory Analyzer Tool)**。不要只看 `Leak Suspects`，掌握以下操作更专业：

### 技巧 1：支配树 (Dominator Tree)
在 `Dominator Tree` 中，按 `Retained Heap`（深堆，即该对象被回收后能释放的总内存）降序排列。
- **看什么？** 找那个排名第一的“巨头”。如果是 `ConcurrentHashMap`，右键 `Path To GC Roots -> exclude all phantom/soft/weak references`，直接看是谁在强引用它。

### 技巧 2：直方图与 OQL (Object Query Language)
如果你怀疑是某个业务对象泄露，使用 OQL 过滤：
```sql
SELECT * FROM com.your.package.OrderVO WHERE age > 100
```
或者在 `Histogram` 中按类名过滤，查看 `Objects` 数量。如果某个 VO 对象有几十万个，那大概率是查询没加分页。

---

## 4. 典型“案发现场”复盘

### 现场 A：代码里的“垃圾堆”（内存泄漏）
- **根因**：`static` 容器、未关闭的资源、错误的 `equals/hashCode` 导致 `Map` 膨胀。
- **特征**：Full GC 后，老年代内存占用量（基高）呈阶梯式上升，无法回到低点。
- **解药**：使用 MAT 找到引用链，修复代码。

### 现场 B：元空间之殇（Metaspace Pressure）
- **根因**：使用了大量动态代理（CGLIB）、JSP 热加载、或者 Groovy 脚本未缓存编译类。
- **特征**：`jstat` 显示 `M` 区接近 100%，日志里有 `Metadata GC Threshold`。
- **解药**：调大 `-XX:MaxMetaspaceSize`；检查是否有类加载器泄露。

### 现场 C：碎片化的代价（Promotion Failed）
- **根因**：老年代虽然有空闲，但全是碎银子，容纳不下新生代晋升过来的金条（大对象）。
- **特征**：使用 CMS 收集器，日志频繁出现 `Promotion Failed`。
- **解药**：开启 `-XX:+UseCMSCompactAtFullCollection`；或者直接升级到 G1，从根源解决碎片化。

### 现场 D：System.gc() 的背刺
- **根因**：某些中间件（如 RMI、NIO）或二方库显式调用了 `System.gc()`。
- **解药**：JVM 参数加上 `-XX:+DisableExplicitGC`。

---

## 5. 预防胜于抢救

1. **设置合理的堆大小**：`-Xms` 和 `-Xmx` 建议设为一致，避免堆动态扩容带来的抖动。
2. **监控先行**：接入 Prometheus + Grafana，设置老年代占用率告警（如 > 85%）。
3. **重视代码 Review**：严禁在循环内查询数据库，严禁不带分页的查询。

**总结**：排查 Full GC 就像破案，日志是线索，Dump 是物证，MAT/Arthas 是解剖刀。只有建立了清晰的逻辑链路，才能在生产事故面前临危不乱。
