---
title: 'Java 高阶编程：Stream 与 Optional'
pubDate: 2025-12-22
layout: '../../layouts/PostLayout.astro'
description: '全方位掌握 Java 8+ 函数式编程：API 详解、复杂数据转换与生产场景'
author: 'rcz'
tags:
  - "Java"
  - "Stream"
  - "Optional"
  - "函数式编程"
---

## 1. Optional：优雅处理 Null

Optional 不是为了替代 null，而是为了明确表达“值可能缺失”的意图，强制调用者处理空情况。

### 1.1 核心 API 概览

| API | 描述 | 最佳实践 |
| :--- | :--- | :--- |
| `of(T)` | 创建 Optional，值不能为 null | 确定有值时用 |
| `ofNullable(T)` | 创建 Optional，值可为 null | 最常用 |
| `map(Function)` | 值转换 | 链式获取属性 |
| `flatMap(Function)` | 值转换，返回 Optional | 处理返回 Optional 的方法 |
| `filter(Predicate)` | 条件过滤 | 只有满足条件才保留值 |
| `ifPresent(Consumer)` | 存在则执行 | 替代 `if (x != null)` |
| `orElse(T)` | 为空则返回默认值 | 简单默认值 |
| `orElseGet(Supplier)` | 为空则执行函数获取默认值 | 默认值获取逻辑较重时用 |
| `orElseThrow()` | 为空则抛异常 | 业务必传参数校验 |

### 1.2 API 实战示例

#### 1. 创建方式
```java
// 1. of: 值必须非空，否则立即抛出 NPE
Optional<String> opt1 = Optional.of("hello"); 

// 2. ofNullable: 最常用，值可为空
Optional<String> opt2 = Optional.ofNullable(getExternalData()); 

// 3. empty: 创建一个空的 Optional
Optional<String> opt3 = Optional.empty();
```

#### 2. 存在即处理 (ifPresent)
```java
// 代替 if (user != null) { ... }
Optional.ofNullable(user)
    .ifPresent(u -> System.out.println("发送邮件给：" + u.getEmail()));
```

#### 3. 获取值与默认值 (orElse / orElseGet)
```java
// orElse: 无论是否为空，括号内的对象都会被创建（即使没用到）
User user1 = Optional.ofNullable(u).orElse(new User("默认用户"));

// orElseGet: 只有为空时，才会执行 Supplier 函数创建对象（懒加载，性能更好）
User user2 = Optional.ofNullable(u).orElseGet(() -> userService.createNewUser());
```

#### 4. 过滤与转换 (filter / map / flatMap)
```java
Optional<User> userOpt = Optional.ofNullable(user);

// filter: 只有满足条件的才保留
userOpt.filter(u -> u.getAge() >= 18)
       .ifPresent(u -> System.out.println("成年人"));

// map: 属性提取
String city = userOpt.map(User::getAddress)
                     .map(Address::getCity)
                     .orElse("未知城市");

// flatMap: 如果 map 返回的是 Optional，使用 flatMap 扁平化，避免 Optional<Optional<T>>
Optional<String> detail = userOpt.flatMap(User::getOptionalDetail);
```

#### 5. 异常处理 (orElseThrow)
```java
// 代替 if (user == null) throw new BizException(...)
User user = Optional.ofNullable(apiResponse)
    .orElseThrow(() -> new BizException(ErrorCode.USER_NOT_FOUND));
```

---

## 2. Stream：流式数据处理

Stream 是对集合对象功能的增强，专注于对集合对象进行各种非常便利、高效的聚合操作。

### 2.1 常用 API 分类

#### 中间操作 (Intermediate)
*   `filter`: 过滤
*   `map`: 1对1映射
*   `flatMap`: 1对多映射（扁平化）
*   `distinct`: 去重
*   `sorted`: 排序
*   `peek`: 查看（主要用于调试）
*   `limit/skip`: 截断与跳过

#### 终端操作 (Terminal)
*   `collect`: 收集（转 List, Map, Set 等）
*   `forEach`: 遍历
*   `reduce`: 规约（求和、最小最大值）
*   `anyMatch/allMatch/noneMatch`: 匹配
*   `findFirst/findAny`: 查找（返回 Optional）
*   `count`: 计数
| `anyMatch/allMatch` | 匹配校验 |

### 2.2 核心 API 实战

#### 1. 过滤与计数 (filter, count)
```java
long count = users.stream()
    .filter(u -> u.getAge() > 18)
    .filter(u -> "Beijing".equals(u.getCity()))
    .count();
```

#### 2. 数值规约 (reduce)
```java
// 计算薪资总额
Double totalSalary = employees.stream()
    .map(Employee::getSalary)
    .reduce(0.0, Double::sum);

// 获取最大值
Optional<Integer> maxAge = users.stream()
    .map(User::getAge)
    .reduce(Integer::max);
```

#### 3. 匹配校验 (anyMatch, allMatch)
```java
// 是否包含未成年人
boolean hasMinor = users.stream().anyMatch(u -> u.getAge() < 18);

// 是否全都是北京用户
boolean allInBeijing = users.stream().allMatch(u -> "Beijing".equals(u.getCity()));
```

#### 4. 排序 (sorted)
```java
List<User> sortedUsers = users.stream()
    .sorted(Comparator.comparing(User::getAge).reversed() // 先按年龄倒序
                      .thenComparing(User::getName))      // 再按姓名升序
    .collect(Collectors.toList());
```

---

## 3. 复杂数据转换实战

### 3.1 多级分组与聚合 (GroupingBy)

**场景**: 按部门分组，并计算每个部门的平均薪资，最后筛选出平均薪资 > 5000 的部门。

```java
Map<String, Double> highSalaryDepts = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.averagingDouble(Employee::getSalary)
    ))
    .entrySet().stream()
    .filter(entry -> entry.getValue() > 5000.0)
    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
```

### 3.2 扁平化处理 (FlatMap)

**场景**: 一个订单包含多个商品项，提取所有订单中商品单价 > 100 的商品名称列表（去重）。

```java
List<String> expensiveProductNames = orders.stream()
    .flatMap(order -> order.getItems().stream()) // 将订单列表扁平化为商品列表
    .filter(item -> item.getPrice() > 100)
    .map(Item::getName)
    .distinct()
    .collect(Collectors.toList());
```

### 3.3 List 转 Map 的各种坑

**场景**: 将用户列表转为 ID 为 Key，User 对象为 Value 的 Map。

```java
// 1. 基础转换 (如果 ID 重复会抛 IllegalStateException)
Map<Long, User> userMap = users.stream()
    .collect(Collectors.toMap(User::getId, u -> u));

// 2. 处理重复 Key (保留旧值)
Map<Long, User> safeMap = users.stream()
    .collect(Collectors.toMap(User::getId, u -> u, (oldVal, newVal) -> oldVal));

// 3. 指定返回 Map 的实现 (如 TreeMap)
TreeMap<Long, User> sortedMap = users.stream()
    .collect(Collectors.toMap(
        User::getId, 
        u -> u, 
        (v1, v2) -> v1, 
        TreeMap::new
    ));
```

---

## 4. Optional + Stream 深度联动

### 4.1 安全链式调用

**场景**: 获取用户所在部门的负责人的名字，中间任何一步都可能为 null。

```java
String managerName = Optional.ofNullable(user)
    .map(User::getDepartment)
    .map(Department::getManager)
    .map(Manager::getName)
    .orElse("未知负责人");
```

### 4.2 过滤空流

**场景**: 一个包含 Optional 的列表，提取所有有值的内容并转为 List。

```java
List<String> names = list.stream()
    .flatMap(opt -> opt.map(Stream::of).orElseGet(Stream::empty)) // Java 8 做法
    // .flatMap(Optional::stream) // Java 9+ 做法，更优雅
    .collect(Collectors.toList());
```

---

## 5. 性能与注意事项

1.  **惰性求值**: 只有执行终端操作时，中间操作才会真正执行。
2.  **不可变性**: Stream 不会改变源集合，而是返回一个新流或结果。
3.  **并行流 (parallelStream)**:
    *   *优势*: 利用多核提高计算速度。
    *   *风险*: 线程安全问题（不要在并行流中修改共享变量）、线程上下文丢失（如 MDC, ThreadLocal）。
    *   *建议*: 只有在大数据量（10w+）且任务不涉及 I/O 时才考虑。
