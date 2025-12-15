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

## 1. Stream 流操作

Java 8 引入的 Stream API 极大地简化了集合操作。

### 常用操作示例

```java
import java.util.*;
import java.util.stream.Collectors;

public class StreamDemo {
    public static void main(String[] args) {
        List<User> users = Arrays.asList(
            new User(1, "张三", 20, "北京"),
            new User(2, "李四", 25, "上海"),
            new User(3, "王五", 20, "北京"),
            new User(4, "赵六", 30, "深圳")
        );

        // 1. 过滤 (Filter): 筛选年龄大于 22 的用户
        List<User> oldUsers = users.stream()
            .filter(u -> u.getAge() > 22)
            .collect(Collectors.toList());

        // 2. 映射 (Map): 提取所有用户的名字
        List<String> names = users.stream()
            .map(User::getName)
            .collect(Collectors.toList());

        // 3. 分组 (GroupingBy): 按城市分组
        Map<String, List<User>> byCity = users.stream()
            .collect(Collectors.groupingBy(User::getCity));

        // 4. 排序 (Sorted): 按年龄倒序
        List<User> sortedUsers = users.stream()
            .sorted(Comparator.comparing(User::getAge).reversed())
            .collect(Collectors.toList());

        // 5. 聚合 (Reduce): 计算年龄总和
        int totalAge = users.stream()
            .mapToInt(User::getAge)
            .sum();
            
        System.out.println("总年龄: " + totalAge);
    }
}
```

## 2. Optional 的用法

Optional 用于优雅地处理可能为 `null` 的值，避免 `NullPointerException`。

```java
import java.util.Optional;

public class OptionalDemo {
    public void processUser(User user) {
        // 1. 创建 Optional (允许为 null)
        Optional<User> optUser = Optional.ofNullable(user);

        // 2. 如果存在则执行 (ifPresent)
        optUser.ifPresent(u -> System.out.println("用户存在: " + u.getName()));

        // 3. 获取值，如果为空则提供默认值 (orElse)
        User safeUser = optUser.orElse(new User(0, "未知用户", 0, "未知"));

        // 4. 获取值，如果为空则抛出异常 (orElseThrow)
        // User requiredUser = optUser.orElseThrow(() -> new RuntimeException("用户不能为空"));

        // 5. 链式处理 (Map): 安全获取城市名称，如果 user 为 null 或 city 为 null，返回 "未知城市"
        String city = optUser
            .map(User::getCity)
            .orElse("未知城市");
    }
}
```

## 3. 线程池 (ThreadPool)

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
