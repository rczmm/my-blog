---
title: 'Java 生产环境调试指南：Arthas 与 JDK 原生工具实战'
pubDate: 2025-12-22
layout: '../../layouts/PostLayout.astro'
description: '深入讲解 Arthas 诊断利器与 JDK 原生命令，涵盖 CPU 飙高、内存溢出、方法追踪及热更新等生产实战场景。'
author: 'rcz'
tags:
  - "Java"
  - "Arthas"
  - "JVM"
  - "故障排查"
---

在生产环境中，当应用出现响应缓慢、CPU 飙升或内存异常时，传统的本地调试手段往往失效。本文将详细介绍两类“救火”工具：阿里开源的 **Arthas** 和 JDK 自带的 **原生命令**。

---

## 1. Arthas：线上诊断利器

Arthas (阿尔萨斯) 是阿里巴巴开源的 Java 诊断工具，支持热更新、查看类加载、追踪方法调用等，无需重启应用即可实时诊断。

### 1.1 安装与启动

```bash
# 下载 arthas-boot.jar
curl -O https://arthas.aliyun.com/arthas-boot.jar

# 启动 (会自动列出当前机器所有的 Java 进程)
java -jar arthas-boot.jar

# 选择对应的进程 ID 即可进入交互界面
```

### 1.2 核心命令实战

#### 1. 查看大盘 (`dashboard`)
实时查看系统的 CPU 占用、内存使用（Heap/Non-Heap）、线程状态及 JVM 信息。
- **场景**：初步定位系统压力点。

#### 2. 线程分析 (`thread`)
- `thread -n 3`: 展示当前最忙的前 3 个线程堆栈（排查 CPU 飙高）。
- `thread <id>`: 查看指定线程的详细堆栈。
- `thread -b`: 找出当前阻塞其他线程的线程（排查死锁）。

#### 3. 方法观测 (`watch`)
观测方法的入参、返回值、抛出的异常及当前对象的属性。
```bash
# 观察 UserService 的 getUser 方法，输出入参和返回值，遍历深度为 2
watch com.example.UserService getUser "{params, returnObj}" -x 2
```
- **参数说明**：`-x` 指定结果展开层级；`'#cost > 100'` 可增加耗时过滤。

#### 4. 方法追踪 (`trace`)
追踪方法内部的调用路径及每一步的耗时。
```bash
# 追踪 OrderController 的 create 方法，过滤耗时大于 50ms 的调用
trace com.example.OrderController create '#cost > 50'
```
- **场景**：精准定位业务代码中的性能瓶颈。

#### 5. 反编译与热更新 (`jad` / `mc` / `retransform`)
这是 Arthas 最强大的功能之一，可以在不重启应用的情况下修复 Bug。
1. **反编译**：`jad --source-output /tmp com.example.UserService`
2. **本地修改**：修改导出的 `.java` 文件逻辑。
3. **查找类加载器**：`sc -d com.example.UserService | grep classLoaderHash`
4. **编译**：`mc -c <hash> /tmp/UserService.java -d /tmp`
5. **替换**：`retransform /tmp/UserService.class`

---

## 2. JDK 原生诊断工具

在无法下载外部工具或受限的环境下，JDK 自带的工具是排查问题的“最后一道防线”。

### 2.1 进程查询：`jps`
查看当前运行的 Java 进程。
- `jps -l`: 显示主类全名或 Jar 路径。
- `jps -v`: 显示传递给 JVM 的参数。

### 2.2 状态监控：`jstat`
监视 JVM 的堆内存、GC 情况。
```bash
# 每 1000ms 输出一次 GC 情况，共输出 10 次
jstat -gc <pid> 1000 10
```
- **核心指标**：`YGC` (年轻代 GC 次数), `FGC` (全量 GC 次数), `GCT` (总 GC 耗时)。

### 2.3 内存分析：`jmap`
- **查看直方图**：`jmap -histo <pid> | head -n 20` (查看哪些类占用了最多内存)。
- **生成堆快照 (Heap Dump)**：
  ```bash
  jmap -dump:format=b,file=heap.hprof <pid>
  ```
- **注意**：线上执行 `jmap -dump` 会导致应用暂停（STW），大数据量下需谨慎。

### 2.4 线程分析：`jstack`
生成当前时刻的线程快照。
```bash
jstack -l <pid> > dump.txt
```
- **搜索关键字**：`BLOCKED` (锁竞争), `waiting on condition` (等待资源)。

### 2.5 全能工具：`jcmd`
Java 7+ 引入，官方推荐替代 `jstack`/`jmap`。
- `jcmd <pid> VM.uptime`: 查看运行时间。
- `jcmd <pid> GC.heap_info`: 查看堆概要。
- `jcmd <pid> Thread.print`: 打印线程栈。
- `jcmd <pid> GC.heap_dump /tmp/dump.hprof`: 生成堆快照。

---

## 3. 常见生产问题排查流程

### 3.1 CPU 飙升 100%
1. 使用 `top` 定位高 CPU 进程。
2. `top -Hp <pid>` 定位高 CPU 线程 ID。
3. 使用 Arthas `thread <id>` 或 `jstack` 打印堆栈。
4. 将线程 ID 转为 16 进制，在堆栈文件中搜索对应的代码行。

### 3.2 内存溢出 (OOM)
1. 检查 JVM 启动参数是否配置了 `-XX:+HeapDumpOnOutOfMemoryError`。
2. 若未配置，使用 `jmap -histo:live` 初步观察。
3. 导出 `hprof` 文件，使用 **MAT (Memory Analyzer Tool)** 或 **JVisualVM** 分析引用链，定位内存泄漏。

### 3.3 接口响应极慢
1. Arthas `dashboard` 查看系统负载。
2. `trace` 追踪接口耗时，定位到具体的 SQL 或外部 RPC 调用。
3. 检查数据库执行计划或下游系统状态。

---

## 4. 深度实战：某生产环境 OOM 导致 CPU 飙高案例

### 4.1 故障背景
- **现象**：生产环境某服务节点在 Nacos 注册中心频繁掉线（心跳超时）。
- **初查**：登录服务器后执行 `top`，发现 Java 进程 CPU 占用率极高（接近满载）。
- **阻碍**：由于 CPU 负载过高，Arthas 启动后无法正常建立连接（无响应），此时只能依赖 **JDK 原生命令** 进行盲排。

### 4.2 排查过程与详细命令

#### 第一步：确认系统症状 (OS Level)
**思路**：先看系统整体负载，确认是哪个进程在作怪。
```bash
# 1. 查看整体负载
top
# 结果：Java 进程 (PID: 1234) CPU 占用 800% (8核满载)

# 2. 深入进程内部，查看线程 CPU 占用
top -Hp 1234
# 结果：前 10-20 个线程 CPU 占用均在 50%-90%，且线程名类似 "GC task thread#0"
```
**诊断**：CPU 几乎全被 GC 线程占据，说明系统在疯狂进行垃圾回收，极大概率是内存爆了。

#### 第二步：监控 JVM 堆状态 (JVM Level)
**思路**：确认 GC 的频率和耗时，判断是 Minor GC 还是 Full GC。
```bash
# 每 1 秒打印一次 GC 统计，看百分比 (gcutil)
jstat -gcutil 1234 1000 10

# 输出示例：
# S0     S1     E      O      M    YGC   YGCT    FGC   FGCT     GCT
# 0.00   0.00  100.00  99.85  98.2  500   20.5   1200  4000.5   4021.0
```
**诊断**：`O` (Old) 区占比 99.85%，`FGC` 次数疯狂增长且 `FGCT` (FGC总耗时) 巨大，确认进入了 **FGC 死循环**。

#### 第三步：快速定位大对象类型 (Histo)
**思路**：在内存极大的情况下，直接 Dump 会导致应用长时间停顿。先用 `jmap -histo` 预览内存中的对象分布。
```bash
# 查看内存中存活对象的直方图
jmap -histo:live 1234 | head -n 20
```
**诊断**：发现 `java.util.HashMap$Node` 和 `java.lang.String` 的实例数量级达到千万级，占用空间数 GB。这说明业务代码中产生了一个巨大的 Map 结构。

#### 第四步：寻找肇事代码 (Stack)
**思路**：虽然 GC 线程占满 CPU，但我们要找的是谁在往内存里塞数据。
```bash
# 打印线程栈到文件
jstack -l 1234 > stack.txt

# 思路延伸：如果想看具体某个高 CPU 业务线程在干嘛
# 1. 获取线程 ID (十进制): 1245
# 2. 转换为十六进制: printf "%x\n" 1245  =>  4dd
# 3. 在 stack.txt 中搜索 "0x4dd"
```
**诊断**：在 `stack.txt` 中搜索 `RUNNABLE` 状态的线程，发现 `longRunningExecutor-5` 线程正停留在 `ArrayList.addAll` 方法上，上层调用链指向了 `MyService.java:575`。

#### 第五步：导出 Dump 并进行离线分析 (Dump & MAT)
**思路**：既然直方图已经看到了 HashMap，我们需要通过 Dump 确认这些 Map 被谁持有。
```bash
# 1. 生成堆快照
jmap -dump:format=b,file=heap.hprof 1234

# 2. 压缩快照 (生产环境通常很大，压缩后下载能省几个小时)
tar -czvf heap.hprof.tar.gz heap.hprof

# 3. 本地分析
# 如果文件 > 8GB，需修改 MAT 配置文件 MemoryAnalyzer.ini
# 将 -Xmx 修改为 16g 或更高
```
**分析**：在 MAT 中使用 `Leak Suspects`，直接看到 `longRunningExecutor-5` 线程的局部变量持有一个 `ArrayList`，Retained Heap 大小为 **8.3 GB**。

---

### 4.3 根因定位 (Root Cause)
通过 MAT 的引用链，最终锁定了嫌疑代码：

**“肇事”代码片段：**
```java
// 错误示范：在循环中无限追加结果集
List<Map<String, Object>> basicPeopleData = new ArrayList<>(); 

for (int startIndex = 0; startIndex < cardNosChangeQuery.size(); startIndex += 1000) { 
    // 虽然 SQL 传参做了 1000 批次的分割，但结果却被全部攒在了一个大 List 里
    List<Map<String, Object>> mapListBySql = customMapper.getMapListBySql( 
        "select * from jinjiang_rkjd_jcxx where status in (0,1,2) and pre_id is null and sqdm = " + areaCodes + 
        " and card_no in (" + String.join(",", cardNosChangeQuery.subList(startIndex, Math.min(startIndex + 1000, cardNosChangeQuery.size()))) + ")"); 
    
    basicPeopleData.addAll(mapListBySql);   // ← 内存炸弹：无限追加
}
```

### 4.4 数据推算
- 当 `cardNosChangeQuery` 量级达到 7-8 万时，循环执行约 80 批次。
- 假设每批次返回 1-2 万行数据，最终 `basicPeopleData` 将承载百万级 Map。
- **估算**：1 条 Map 及其内部字段约占用 100 字节，100 万 × 100 B ≈ 10 GB。与 MAT 分析出的 8.3 GB 完全吻合。

### 4.5 修复方案
**核心思路**：**随用随走，禁止大集合缓存。**
将业务逻辑移动到循环内部，每批次处理完即释放内存，或者采用流式处理。

```java
for (int startIndex = 0; startIndex < cardNosChangeQuery.size(); startIndex += 1000) { 
    List<Map<String, Object>> mapListBySql = customMapper.getMapListBySql(...);
    
    // 1. 在循环内直接处理业务逻辑，不再 addAll 到外部大集合
    processData(mapListBySql); 
    
    // 2. 处理完手动清空（或等待下一轮循环变量重新赋值），确保及时回收
    mapListBySql.clear(); 
}
```

> **总结**：生产环境排查 OOM 时，如果工具链受限，**JDK 原生命令 + MAT 离线分析** 是最稳妥的组合拳。同时要警惕任何“在循环中不断追加数据到集合”的代码逻辑。
