---
title: 'Java 实战开发笔记'
pubDate: 2025-12-15
layout: '../../layouts/PostLayout.astro'
description: '日常笔记'
author: 'rcz'
tags:
  - "Java"
  - "后端"
  - "实战"
---

## 1. 函数式编程：Stream 与 Optional

Java 8+ 带来的函数式编程极大地提升了代码的简洁性与可读性。关于这两者的详细 API 列表、复杂数据转换（如多级分组、扁平化）以及生产环境下的联动实战，请参考专项笔记：

👉 **[Java 高阶编程：Stream 与 Optional 实战](./Java高阶编程：Stream与Optional实战)**

---

## 2. 线程池 (ThreadPool)

推荐手动创建线程池以更好地控制资源，但也需要了解常见的预设线程池。

### 3.1 手动创建 (推荐)

```java
import java.util.concurrent.*;

public class ThreadPoolDemo {
    public static void main(String[] args) {
        // 核心参数说明：
        // corePoolSize: 核心线程数 (常驻)
        // maximumPoolSize: 最大线程数
        // keepAliveTime: 非核心线程空闲存活时间
        // unit: 时间单位
        // workQueue: 任务队列 (建议使用有界队列，如 ArrayBlockingQueue)
        // threadFactory: 线程工厂 (用于命名线程)
        // handler: 拒绝策略 (队列满且线程达最大值时的处理方式)
        
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            5, 
            10, 
            60L, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(100),
            Executors.defaultThreadFactory(),
            new ThreadPoolExecutor.CallerRunsPolicy() // 拒绝策略：由调用线程处理
        );

        executor.execute(() -> {
            System.out.println("执行任务: " + Thread.currentThread().getName());
        });
        
        // 记得关闭
        executor.shutdown();
    }
}
```

### 3.2 常见预设线程池 (Executors)

> **注意**：`Executors` 创建的线程池可能会有 OOM (内存溢出) 风险，生产环境请谨慎使用。

*   **FixedThreadPool**: 固定大小线程池。
    *   *特点*: 核心线程数 = 最大线程数，队列无界。
    *   *适用*: 负载较重的服务器，限制线程数量。
    ```java
    ExecutorService fixedPool = Executors.newFixedThreadPool(5);
    ```

*   **CachedThreadPool**: 缓存线程池。
    *   *特点*: 核心线程 0，最大线程 Integer.MAX_VALUE (可能创建过多线程导致 OOM)，队列不存储元素。
    *   *适用*: 执行很多短期异步小任务。
    ```java
    ExecutorService cachedPool = Executors.newCachedThreadPool();
    ```

*   **SingleThreadExecutor**: 单线程池。
    *   *特点*: 只有一个线程，保证任务按顺序执行。
    *   *适用*: 需要保证顺序执行的场景。
    ```java
    ExecutorService singlePool = Executors.newSingleThreadExecutor();
    ```

*   **ScheduledThreadPool**: 定时任务线程池。
    *   *特点*: 支持定时及周期性任务执行。
    ```java
    ScheduledExecutorService scheduledPool = Executors.newScheduledThreadPool(5);
    ```

*   **WorkStealingPool** (Java 8+): 
    *   *特点*: 基于 ForkJoinPool，利用所有可用处理器核心，适合并行计算。
    ```java
    ExecutorService workStealingPool = Executors.newWorkStealingPool();
    ```

## 4. 定时任务

### 4.1 JDK 原生 (ScheduledExecutorService)

```java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

// 延迟 1 秒后执行，之后每 3 秒执行一次
scheduler.scheduleAtFixedRate(() -> {
    System.out.println("定时任务执行: " + new Date());
}, 1, 3, TimeUnit.SECONDS);
```

### 4.2 Spring Boot (@Scheduled)

这是最常用的方式，支持 Cron 表达式。

```java
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTask {

    // 每隔 5 秒执行一次
    @Scheduled(fixedRate = 5000)
    public void reportCurrentTime() {
        System.out.println("现在时间: " + new Date());
    }

    // 每天中午 12 点执行 (秒 分 时 日 月 周)
    @Scheduled(cron = "0 0 12 * * ?")
    public void dailyTask() {
        System.out.println("执行日报任务");
    }
}
```

## 5. 文档解析

### 5.1 Excel 解析

#### 方案一：EasyExcel (推荐)

阿里开源，基于流式读写，内存占用极低。

```java
// 1. 引入依赖
// <dependency>
//     <groupId>com.alibaba</groupId>
//     <artifactId>easyexcel</artifactId>
//     <version>3.x.x</version>
// </dependency>

// 2. 定义实体类
public class DemoData {
    @ExcelProperty("字符串标题")
    private String string;
    @ExcelProperty("日期标题")
    private Date date;
    @ExcelProperty("数字标题")
    private Double doubleData;
    // getter/setter...
}

// 3. 读取 Excel
EasyExcel.read("demo.xlsx", DemoData.class, new PageReadListener<DemoData>(dataList -> {
    for (DemoData demoData : dataList) {
        System.out.println("读取到数据:" + demoData);
    }
})).sheet().doRead();

// 4. 写入 Excel
EasyExcel.write("output.xlsx", DemoData.class).sheet("模板").doWrite(dataList);
```

#### 方案二：FastExcel

FastExcel 是一个轻量级、高性能的 Excel 处理库，旨在替代 Apache POI。

```java
// FastExcel 读取示例 (伪代码，具体 API 视版本而定)
try (InputStream is = new FileInputStream("file.xlsx");
     ReadableWorkbook wb = new ReadableWorkbook(is)) {
    wb.getFirstSheet().openStream().forEach(row -> {
        System.out.println(row.getCellText(0));
    });
}
```

#### 方案三：Apache POI (原生)

功能最全，但内存占用大，代码繁琐。

```java
Workbook workbook = new XSSFWorkbook(new FileInputStream("file.xlsx"));
Sheet sheet = workbook.getSheetAt(0);
for (Row row : sheet) {
    System.out.println(row.getCell(0).getStringCellValue());
}
```

### 5.2 Word 解析 (Apache POI)

主要用于提取文本。

```java
// <dependency>
//     <groupId>org.apache.poi</groupId>
//     <artifactId>poi-ooxml</artifactId>
// </dependency>

try (XWPFDocument doc = new XWPFDocument(new FileInputStream("demo.docx"))) {
    // 提取段落文本
    for (XWPFParagraph p : doc.getParagraphs()) {
        System.out.println(p.getText());
    }
    
    // 提取表格内容
    for (XWPFTable table : doc.getTables()) {
        for (XWPFTableRow row : table.getRows()) {
            for (XWPFTableCell cell : row.getTableCells()) {
                System.out.println(cell.getText());
            }
        }
    }
}
```

### 5.3 PDF 解析 (Apache PDFBox)

```java
// <dependency>
//     <groupId>org.apache.pdfbox</groupId>
//     <artifactId>pdfbox</artifactId>
//     <version>2.0.x</version>
// </dependency>

try (PDDocument document = PDDocument.load(new File("demo.pdf"))) {
    if (!document.isEncrypted()) {
        PDFTextStripper stripper = new PDFTextStripper();
        String text = stripper.getText(document);
        System.out.println("PDF 内容: " + text);
    }
}
```

## 6. Maven 构建管理

Maven 是 Java 项目最常用的构建与管理工具。关于 Maven 的详细命令、生命周期、POM 标签以及多环境打包等实战场景，请参考专项笔记：

👉 **[Maven 实战详解](./Maven实战详解)**

---

## 7. Spring Boot SSE (Server-Sent Events)

SSE 是一种轻量级的服务端推送技术，基于 HTTP 协议，适合单向推送场景（如股票行情、日志推送）。

### 7.1 后端实现

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
public class SseController {

    private final ExecutorService executor = Executors.newCachedThreadPool();

    @GetMapping("/sse/stream")
    public SseEmitter handleSse() {
        // 设置超时时间，0 表示不过期
        SseEmitter emitter = new SseEmitter(0L);

        executor.execute(() -> {
            try {
                for (int i = 0; i < 10; i++) {
                    // 发送数据
                    emitter.send(SseEmitter.event()
                        .name("message")
                        .data("推送消息 " + i));
                    Thread.sleep(1000);
                }
                // 完成推送
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}
```

### 7.2 前端接收 (HTML + JS)

```html
<!DOCTYPE html>
<html>
<body>
    <h1>SSE 测试</h1>
    <div id="result"></div>
    <script>
        // 连接 SSE 接口
        const eventSource = new EventSource('/sse/stream');

        // 监听消息
        eventSource.onmessage = function(event) {
            const div = document.getElementById('result');
            div.innerHTML += event.data + '<br>';
        };

        // 监听自定义事件
        eventSource.addEventListener('message', function(event) {
             console.log("收到数据:", event.data);
        });

        eventSource.onerror = function(err) {
            console.error("连接错误:", err);
            eventSource.close();
        };
    </script>
</body>
</html>
```

## 8. WebSocket

WebSocket 提供全双工通信，适合聊天室、在线游戏等需要高实时性双向交互的场景。

### 8.1 引入依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### 8.2 开启 WebSocket 支持

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

@Configuration
public class WebSocketConfig {
    
    // 如果使用外部 Tomcat，则不需要此 Bean
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
```

### 8.3 服务端端点

```java
import org.springframework.stereotype.Component;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.concurrent.CopyOnWriteArraySet;

@ServerEndpoint("/ws/chat")
@Component
public class WebSocketServer {

    // 存储所有在线连接
    private static final CopyOnWriteArraySet<WebSocketServer> webSocketSet = new CopyOnWriteArraySet<>();
    private Session session;

    @OnOpen
    public void onOpen(Session session) {
        this.session = session;
        webSocketSet.add(this);
        System.out.println("新连接加入！当前在线人数: " + webSocketSet.size());
    }

    @OnClose
    public void onClose() {
        webSocketSet.remove(this);
        System.out.println("连接关闭！当前在线人数: " + webSocketSet.size());
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        System.out.println("收到消息: " + message);
        // 群发消息
        for (WebSocketServer item : webSocketSet) {
            try {
                item.sendMessage("广播: " + message);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    @OnError
    public void onError(Session session, Throwable error) {
        System.out.println("发生错误");
        error.printStackTrace();
    }

    public void sendMessage(String message) throws IOException {
        this.session.getBasicRemote().sendText(message);
    }
}
```

## 9. Linux 常用诊断命令

在排查 Java 应用问题前，通常需要先查看系统层面的状态。

### 9.1 CPU 与 进程

*   `top`: 实时显示进程动态。按 `P` 按 CPU 排序，按 `M` 按内存排序。
*   `top -Hp <pid>`: 查看某个进程下的所有线程占用情况 (排查 CPU 飙升神器)。
*   `ps -ef | grep java`: 查看 Java 进程详情。

### 9.2 内存与磁盘

*   `free -h`: 查看系统内存使用情况。
*   `df -h`: 查看磁盘空间占用。
*   `du -sh *`: 查看当前目录下各个文件夹的大小。

### 9.3 网络

*   `netstat -ntlp`: 查看端口占用情况。
*   `lsof -i:<port>`: 查看指定端口被哪个进程占用。
*   `curl -X GET http://localhost:8080`: 终端发起 HTTP 请求。

### 9.4 日志查询 (三剑客)

*   `tail -f demo.log`: 实时滚动查看日志。
*   `grep -C 5 "NullPointerException" demo.log`: 查找关键字及前后 5 行。
*   `sed -n '/2023-12-01 10:00/,/2023-12-01 11:00/p' demo.log`: 按时间段截取日志。

---

## 10. Arthas 线上诊断工具

Arthas 是阿里开源的 Java 诊断利器，无需重启即可排查问题。

### 10.1 安装与启动

```bash
# 下载并启动 (会自动列出所有 Java 进程)
curl -O https://arthas.aliyun.com/arthas-boot.jar
java -jar arthas-boot.jar
```

### 10.2 常用命令实战

#### 1. 查看大盘 (`dashboard`)
实时查看 CPU、内存、线程、JVM 状态。

#### 2. 排查高 CPU 线程 (`thread`)
*   `thread -n 3`: 显示当前最忙的前 3 个线程堆栈。
*   `thread <id>`: 查看指定线程状态。
*   `thread -b`: 找出当前阻塞其他线程的线程 (排查死锁)。

#### 3. 观测方法入参返回值 (`watch`)
这是最常用的功能。
```bash
# 观察类 UserService 的 getUser 方法的入参和返回值，深度为 2
watch com.example.UserService getUser "{params, returnObj}" -x 2
```

#### 4. 统计耗时 (`trace`)
定位哪一步执行慢。
```bash
# 追踪方法调用链耗时，并过滤掉耗时小于 10ms 的调用
trace com.example.OrderController createOrder '#cost > 10'
```

#### 5. 反编译代码 (`jad`)
确认线上运行的代码是否为最新版本。
```bash
jad com.example.UserService
```

### 10.3 高级：不重启修改代码 (热更新)

如果发现线上有个小 Bug 需要紧急修复：

1.  **反编译**: `jad --source-output /tmp com.example.UserService`
2.  **修改源码**: `vim /tmp/com/example/UserService.java`
3.  **查找类加载器**: `sc -d com.example.UserService | grep classLoaderHash`
4.  **编译新类**: `mc -c <hash> /tmp/com/example/UserService.java -d /tmp`
5.  **热替换**: `retransform /tmp/com/example/UserService.class`

> **注意**: 热更新不能新增方法或字段，只能修改现有方法逻辑。

## 11. JDK 原生诊断命令

虽然 Arthas 非常强大，但在某些受限环境下（如无法下载外部 Jar），JDK 自带的命令行工具仍是最后的防线。

### 11.1 进程查询 (`jps`)

查看当前运行的 Java 进程 ID。
```bash
jps -l  # 输出主类全名或 jar 路径
jps -v  # 输出 JVM 参数
```

### 11.2 状态监控 (`jstat`)

用于监视 JVM 各种堆和非堆的大小及其内存使用量、垃圾回收情况。
```bash
# 每 1000ms 查询一次进程 <pid> 的 GC 情况，查询 10 次
jstat -gc <pid> 1000 10
```
**关键列含义**:
*   **S0C/S1C**: 两个幸存区的容量。
*   **EC/OC**: 伊甸园区/老年代的容量。
*   **YGC/FGC**: 年轻代/全量 GC 的次数。
*   **GCT**: GC 总耗时。

### 11.3 内存分析 (`jmap`)

用于生成堆转储快照（Heap Dump）或查看对象统计信息。

**1. 查看对象直方图 (排查哪些对象占内存最多)**
```bash
jmap -histo <pid> | head -n 20
```

**2. 生成堆快照 (用于离线分析，如使用 MAT 或 VisualVM)**
```bash
jmap -dump:format=b,file=heap.hprof <pid>
```

**3. 查看堆配置信息**
```bash
jmap -heap <pid>
```

### 11.4 线程分析 (`jstack`)

用于生成虚拟机当前时刻的线程快照，排查死锁、CPU 飙高、线程冻结等问题。
```bash
jstack -l <pid> > thread_dump.txt
```
*   查找 `waiting on condition` (等待资源) 或 `BLOCKED` (锁竞争)。

### 11.5 全能工具 (`jcmd`)

从 Java 7 开始引入，官方推荐使用 `jcmd` 替代大部分 `jmap`, `jstack` 等命令。

```bash
jcmd <pid> VM.uptime          # 查看启动时间
jcmd <pid> GC.heap_info       # 查看堆概要信息
jcmd <pid> Thread.print       # 打印线程栈 (同 jstack)
jcmd <pid> GC.class_histogram # 查看类直方图 (同 jmap -histo)
jcmd <pid> GC.heap_dump /tmp/dump.hprof # 生成堆快照
```

### 11.6 堆快照浏览器 (`jhat`)

JDK 自带的简单分析工具（现已不推荐，通常建议使用更强大的 MAT 或 JVisualVM）。
```bash
jhat heap.hprof
# 启动后访问 http://localhost:7000 查看分析结果
```
