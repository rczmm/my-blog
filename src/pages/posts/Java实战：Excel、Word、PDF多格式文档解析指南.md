---
title: 'Java Excel、Word、PDF 多格式文档解析指南'
pubDate: 2025-12-22
layout: '../../layouts/PostLayout.astro'
description: '全面覆盖 Java 生态下的文档处理方案，包括 EasyExcel、FastExcel、Apache POI 以及 PDFBox 。'
author: 'rcz'
tags:
  - "Java"
  - "EasyExcel"
  - "Apache POI"
  - "文档解析"
---

## 1. Excel 处理：高效与全能的博弈

### 1.1 EasyExcel (阿里开源 - 推荐)
*   **核心优势**：基于流式读取，内存占用极低（解决 POI 的 `OutOfMemoryError` 问题）。
*   **适用场景**：海量数据导入导出、日常业务报表。

#### 核心代码示例
```java
// 1. 读取 Excel
// 参数说明：
// pathName: 文件路径
// head: 数据模型类（使用 @ExcelProperty 绑定列名）
// readListener: 监听器，每读一行都会回调其 invoke 方法
EasyExcel.read(fileName, UserData.class, new PageReadListener<UserData>(dataList -> {
    for (UserData user : dataList) {
        log.info("读取到用户: {}", user.getName());
    }
})).sheet().doRead();

// 2. 写入 Excel
// 参数说明：
// pathName: 输出文件路径
// head: 数据模型类
EasyExcel.write(fileName, UserData.class)
    .sheet("用户信息")
    .doWrite(dataList);
```

#### 核心 API 与参数详解

| 方法 | 说明 | 关键参数意义 |
| :--- | :--- | :--- |
| `read(file, head, listener)` | 入口方法 | `head`: 映射模型，若传 `null` 则需在监听器用 `Map` 接收；`listener`: 监听器。 |
| `.sheet(index/name)` | 指定工作表 | `index`: 0开始；`name`: 标签名。不调用默认读第一个 sheet。 |
| `.headRowNumber(n)` | 表头行数 | **关键**：设为 0 表示把第一行当数据读；设为 1 表示第一行是表头（默认）。 |
| `.registerReadListener(l)`| 注册监听器 | 相比 `read()` 构造函数，此方式更灵活，支持注册多个监听器。 |
| `.autoCloseStream(bool)` | 自动关流 | 默认 true。若需多次读取同一个流，务必设为 false。 |
| `.doRead()` | 触发执行 | 必须调用，否则之前的链式配置均不生效。 |

#### 进阶实战：动态读取与强制停止

在某些场景下，我们不需要读完整个文件，或者文件表头是不固定的，这时需要用到以下高级技巧：

##### 1. 使用 `Map` 接收动态表头
当没有预定义的模型类（Bean）时，可以使用 `Map<Integer, String>` 接收数据，其中 Key 是列索引。

##### 2. 提前结束读取 (Stop Reading)
EasyExcel 没有提供 `stop()` 方法，官方推荐通过 **抛出异常** 来中断读取。这在“仅校验表头”或“只取前几行预览”时非常有用。

```java
// 实战：仅读取表头并立即停止
Map<Integer, String> headerMap = new HashMap<>();

EasyExcelFactory.read(filePath)
    .sheet(0)
    .headRowNumber(0) // 从第0行开始读
    .registerReadListener(new AnalysisEventListener<Map<Integer, String>>() {
        @Override
        public void invokeHeadMap(Map<Integer, String> headMap, AnalysisContext context) {
            // 抓取表头信息
            headerMap.putAll(headMap);
            // 关键：抛出自定义异常强制停止，避免读取后续千万级数据
            throw new RuntimeException("StopReading");
        }

        @Override
        public void invoke(Map<Integer, String> data, AnalysisContext context) {
            // 如果 headRowNumber(0)，第一行也会进到这里
            headerMap.putAll(data);
            throw new RuntimeException("StopReading");
        }

        @Override
        public void doAfterAllAnalysed(AnalysisContext context) {}
    })
    .doRead();
```

##### 3. AnalysisContext 的妙用
监听器中的 `AnalysisContext` 包含了当前读取的所有上下文信息：
*   `context.readSheetHolder().getApproximateTotalRowNumber()`: 获取总行数（近似值）。
*   `context.readRowHolder().getRowIndex()`: 获取当前正在读第几行。

#### 易错点与实战坑位

**1. 导入失败（读取不到数据/报错）**
*   **模型映射问题**：模型类字段必须有 `getter/setter` 方法（建议使用 Lombok `@Data`），否则 EasyExcel 无法注入值。
*   **表头行数不匹配**：若 Excel 标题占了 2 行，但未设置 `headRowNumber(2)`，会导致第一行数据被当成表头过滤掉。
*   **监听器逻辑**：`ReadListener` 里的 `invoke` 方法是逐行回调的，**最后一行读完后不会自动触发业务逻辑**，需要在 `doAfterAllAnalysed` 方法中进行收尾（如批量保存数据库）。
*   **文件流重复读取**：`InputStream` 读取一次后指针会移到末尾，若需重复读取，需重新构建流或使用支持 `reset` 的流。

**2. 导出成功但文件无法打开/损坏**
*   **未调用 finish()**：如果手动构建 `ExcelWriter` 而不是使用 `doWrite()` 快捷方法，必须在最后显式调用 `writer.finish()`，否则文件头信息不完整。
*   **流被提前关闭**：在 `doWrite` 执行完成前，手动关闭了输出流，导致数据写入中断。
*   **格式扩展名不符**：使用 `ExcelTypeEnum.XLSX` 导出，但文件名后缀写成了 `.xls`。

**3. 导出文件无数据**
*   **字段未匹配**：导出模型中的字段全被标记了 `@ExcelIgnore`，或者 `@ExcelProperty` 中的列名与模板不符。
*   **集合为空**：传入 `doWrite(list)` 的 list 为 null 或 size 为 0，此时 EasyExcel 默认只会创建表头。
*   **数据类型转换异常**：如将包含特殊字符的 String 强制导出为 Date 类型，且未配置 `Converter`。

**4. 内存溢出 (OOM)**
*   **使用了 readAll()**：对于几十万行的大文件，绝对不要使用 `readAllSync()`，这会一次性将所有对象加载进内存。**必须使用监听器流式读取**。

---

### 1.2 FastExcel (轻量级黑马)
*   **核心优势**：专注于速度，比 EasyExcel 更快，API 极其简洁。
*   **适用场景**：对解析速度有极致要求，且不需要复杂样式控制的场景。

#### 核心代码示例
```java
// 读取所有数据
// 参数说明：
// file: File 对象或 InputStream
List<MyBean> list = FastExcel.read(file, MyBean.class);

// 流式处理 (适合大文件)
FastExcel.read(file, MyBean.class, data -> {
    // 处理单行数据
    System.out.println(data);
});
```

---

### 1.3 Apache POI (原生全能王)
*   **核心优势**：功能最强大，支持复杂的单元格合并、公式、图表、样式自定义。
*   **适用场景**：需要生成极其精美的、带复杂排版的 Excel 模板。

#### 关键对象意义
*   `Workbook`：代表整个 Excel 文件。
*   `Sheet`：代表文件中的一个工作表。
*   `Row`：代表一行。
*   `Cell`：代表一个单元格。

---

## 2. Word 文档处理 (Apache POI)

对于 Word (`.docx`)，通常使用 `poi-ooxml`。

### 2.1 文本与表格提取
```java
try (XWPFDocument doc = new XWPFDocument(new FileInputStream("demo.docx"))) {
    // 提取所有段落
    List<XWPFParagraph> paragraphs = doc.getParagraphs();
    
    // 提取所有表格
    List<XWPFTable> tables = doc.getTables();
    for (XWPFTable table : tables) {
        for (XWPFTableRow row : table.getRows()) {
            // 获取单元格内容
            String text = row.getCell(0).getText();
        }
    }
}
```

---

## 3. PDF 文档解析 (PDFBox / iText)

### 3.1 Apache PDFBox (开源免费)
*   **场景**：提取 PDF 文本内容、渲染 PDF 为图片。

```java
try (PDDocument document = PDDocument.load(new File("test.pdf"))) {
    PDFTextStripper stripper = new PDFTextStripper();
    // 参数说明：
    // stripper.setStartPage(1): 设置起始页码
    // stripper.setEndPage(5): 设置结束页码
    String text = stripper.getText(document);
    System.out.println(text);
}
```

### 3.2 iText (商业级方案)
*   **场景**：根据 HTML 模板生成 PDF、给 PDF 加水印、电子签名。
*   **注意**：iText 7+ 采用 AGPL 协议，商用需付费。

---

## 4. 方案对比与总结

| 格式 | 推荐库 | 选型理由 |
| :--- | :--- | :--- |
| **Excel (大数据量)** | **EasyExcel** | 内存平稳，防止 OOM，阿里背书。 |
| **Excel (极致速度)** | **FastExcel** | 性能优于 EasyExcel，API 现代。 |
| **Excel (复杂样式)** | **Apache POI** | 支持所有底层特性，灵活但繁琐。 |
| **Word** | **Apache POI** | 生态成熟，支持段落、图片、表格处理。 |
| **PDF (仅读取)** | **PDFBox** | 完全开源，功能覆盖基础需求。 |
| **PDF (生成/签名)** | **iText** | 功能极其强大，适合金融级凭证生成。 |

### 5. 实战避坑指南
1.  **资源关闭**：所有的 `Workbook`、`InputStream`、`PDDocument` 必须在 `try-with-resources` 中开启，确保资源释放。
2.  **并发问题**：POI 的 `Workbook` 对象是非线程安全的，不要在多线程中共享同一个实例。
3.  **版本兼容**：`poi` 和 `poi-ooxml` 的版本必须严格一致，否则会出现莫名其妙的 `NoSuchMethodError`。
