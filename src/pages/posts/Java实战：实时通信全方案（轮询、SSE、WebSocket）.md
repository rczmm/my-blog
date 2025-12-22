---
title: 'Java 实战：实时通信全方案（轮询、SSE、WebSocket）'
pubDate: 2025-12-22
layout: '../../layouts/PostLayout.astro'
description: '全面对比 Java 实时通信方案：从传统的短/长轮询到现代的 SSE 与全双工 WebSocket，包含 API 详解与场景选型。'
author: 'rcz'
tags:
  - "Java"
  - "WebSocket"
  - "SSE"
  - "实时通信"
---

## 1. 传统方案：轮询 (Polling)

### 1.1 短轮询 (Short Polling)
*   **原理**：客户端每隔固定时间（如 5s）向服务器发起一次普通的 HTTP 请求。
*   **场景**：对实时性要求不高、并发量极低的后台管理系统。
*   **缺点**：浪费带宽和服务器资源，大量请求返回“无数据”。

### 1.2 长轮询 (Long Polling)
*   **原理**：服务器收到请求后不立即返回，而是将请求挂起（Hold），直到有数据更新或超时才返回。
*   **场景**：早期的 Web 聊天室、配置中心（如 Apollo/Nacos 早期版本）。
*   **实现**：Spring 中可使用 `DeferredResult` 实现。

---

## 2. 服务端推送：SSE (Server-Sent Events)

### 2.1 核心理念
基于 HTTP 协议，服务端单向向客户端推送文本流。

### 2.2 适用场景
*   股票行情、体育直播比分。
*   ChatGPT 式的流式文本输出。
-   日志监控、消息通知。

### 2.3 Spring Boot 实战

#### 后端：SseEmitter 参数意义
```java
@GetMapping("/sse/stream")
public SseEmitter handleSse() {
    // 参数说明：
    // timeout: 超时时间（毫秒）。0 表示永不超时。
    // 建议：生产环境设置合理超时，并在前端处理重连。
    SseEmitter emitter = new SseEmitter(30_000L); 

    executor.execute(() -> {
        try {
            // 发送事件
            emitter.send(SseEmitter.event()
                .id("1")                // 事件 ID，客户端重连时会带上 Last-Event-ID
                .name("custom-event")   // 自定义事件名，前端对应 addEventListener("custom-event")
                .data("Hello SSE")      // 推送的数据内容
                .reconnectTime(5000));  // 建议客户端重连间隔
            
            emitter.complete(); // 正常完成
        } catch (Exception e) {
            emitter.completeWithError(e); // 异常结束
        }
    });
    return emitter;
}
```

#### 前端：EventSource API
```javascript
const source = new EventSource('/sse/stream');

// 参数意义：
// onmessage: 监听默认事件（未命名的事件）
source.onmessage = (e) => console.log(e.data);

// addEventListener: 监听后端指定的 .name("custom-event")
source.addEventListener('custom-event', (e) => {
    console.log("自定义事件数据:", e.data);
});

source.onerror = (err) => {
    if (source.readyState === EventSource.CLOSED) {
        console.log("连接已关闭");
    }
};
```

---

## 3. 全双工通信：WebSocket

### 3.1 核心理念
基于 TCP 的独立协议（握手阶段使用 HTTP），支持服务端与客户端真正的双向实时交互。

### 3.2 适用场景
*   即时通讯（IM）、在线协作编辑器。
*   多人在线游戏。
*   高频交互的交易系统。

### 3.3 Spring Boot 实战

#### 后端：核心注解意义
```java
@ServerEndpoint("/ws/{userId}") // 路径参数，用于区分用户
@Component
public class ChatServer {

    // 存储会话，注意线程安全
    private static Map<String, Session> sessionMap = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("userId") String userId) {
        // 参数意义：
        // Session: 当前连接的会话对象，用于发送消息
        sessionMap.put(userId, session);
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        // 收到客户端消息
        System.out.println("来自客户端的消息: " + message);
    }

    @OnClose
    public void onClose(@PathParam("userId") String userId) {
        sessionMap.remove(userId);
    }

    @OnError
    public void onError(Session session, Throwable error) {
        error.printStackTrace();
    }

    // 发送消息方法
    public void send(String userId, String msg) throws IOException {
        Session s = sessionMap.get(userId);
        if (s != null && s.isOpen()) {
            // getBasicRemote(): 同步发送
            // getAsyncRemote(): 异步发送
            s.getBasicRemote().sendText(msg);
        }
    }
}
```

---

## 4. 方案深度对比

| 特性 | 轮询 | SSE | WebSocket |
| :--- | :--- | :--- | :--- |
| **协议** | HTTP | HTTP | WS (独立协议) |
| **方向** | 客户端请求 | 服务端单向推送 | 双向全双工 |
| **数据格式** | 任意 (通常 JSON) | 仅限文本 (UTF-8) | 文本 + 二进制 |
| **连接数** | 每次请求一个 | 占用 1 个 HTTP 连接 | 占用 1 个 TCP 连接 |
| **自动重连** | 客户端控制 | **浏览器原生支持** | 需手动实现心跳与重连 |
| **防火墙** | 友好 | 友好 | 可能被拦截（需 80/443 端口） |

---

## 5. 实战避坑指南
1.  **SSE 的连接限制**：浏览器对同一个域名的 HTTP 连接数有限制（通常为 6 个）。如果打开多个 SSE 标签页，可能会耗尽连接池。**解决方法**：使用 HTTP/2，或者控制标签页数量。
2.  **WebSocket 心跳机制**：WS 连接可能因为网络波动或中间代理（如 Nginx）超时而被断开。**必须实现心跳（Ping/Pong）**，否则连接会莫名其妙变成“僵尸连接”。
3.  **Nginx 配置**：
    *   **SSE**: 需要关闭缓冲 `proxy_buffering off;`，否则数据会被缓存而不立即推送。
    *   **WS**: 需要显式配置 Upgrade 头：
      ```nginx
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "Upgrade";
      ```
