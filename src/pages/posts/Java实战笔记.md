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
