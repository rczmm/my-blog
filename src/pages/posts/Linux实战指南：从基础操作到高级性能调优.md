---
title: 'Linux 实战指南：从基础操作到高级性能调优'
pubDate: 2025-12-22
layout: '../../layouts/PostLayout.astro'
description: '针对后端开发者的 Linux 知识图谱：涵盖文件处理、网络排查、系统监控及性能调优常用命令。'
author: 'rcz'
tags:
  - "Linux"
  - "运维"
  - "性能调优"
  - "实战"
---

## 1. 文件与目录操作 (基础中的基础)

### 1.1 查找文件
*   `find / -name "app.log"`: 从根目录开始全局查找名为 `app.log` 的文件。
*   `locate app.log`: 基于数据库查找，速度极快（需定期执行 `updatedb`）。
*   `which java`: 查看可执行二进制文件的位置。

### 1.2 内容检索 (Grep 家族)
*   `grep -i "error" app.log`: 不区分大小写查找。
-   `grep -v "info" app.log`: 排除包含 `info` 的行。
*   `grep -A 5 "exception" app.log`: 显示匹配行及**后** 5 行。
*   `grep -B 5 "exception" app.log`: 显示匹配行及**前** 5 行。
*   `grep -C 5 "exception" app.log`: 显示匹配行及**前后**各 5 行。
*   `grep -r "keyword" ./src`: 递归查找目录下所有文件。

### 1.3 文件压缩与解压
*   `tar -zcvf test.tar.gz ./test`: 压缩。
*   `tar -zxvf test.tar.gz`: 解压。
*   `zip -r test.zip ./test`: Zip 格式压缩。
*   `unzip test.zip`: 解压 Zip。

---

## 2. 文本处理三剑客 (AWK, SED, CUT)

### 2.1 AWK (报表处理)
*   `awk '{print $1, $3}' log.txt`: 打印每行的第 1 和第 3 列（默认空格分隔）。
*   `awk -F ',' '{print $1}' data.csv`: 指定逗号为分隔符。
*   `last -n 5 | awk '{print $1}'`: 提取最近登录的 5 个用户名。

### 2.2 SED (流编辑器)
*   `sed -i 's/old/new/g' config.yaml`: **直接修改**文件，将所有的 `old` 替换为 `new`。
*   `sed -n '5,10p' app.log`: 仅打印第 5 到第 10 行。
*   `sed '/error/d' app.log`: 删除所有包含 `error` 的行。

### 2.3 CUT (简单切割)
*   `echo "hello:world" | cut -d ':' -f 1`: 以 `:` 分隔取第 1 部分。

---

## 3. 网络排查与监控

### 3.1 端口与连接
*   `netstat -ntlp`: 查看所有监听中的 TCP 端口及对应的 PID。
*   `lsof -i:8080`: 查看谁占用了 8080 端口。
*   `ss -s`: 查看当前系统的网络连接统计（比 netstat 更快）。

### 3.2 网络联通性
*   `ping google.com`: 测试延迟。
*   `telnet 192.168.1.1 80`: 测试指定 IP 的端口是否开放。
*   `nc -zv 192.168.1.1 80`: 使用 Netcat 测试端口（更现代）。
*   `curl -v http://api.com`: 查看 HTTP 请求过程的详细 Header 信息。

---

## 4. 系统监控与性能调优

### 4.1 CPU 监控
*   `top`: 实时监控。按 `1` 查看多核 CPU 详情。
*   `uptime`: 查看系统负载（1, 5, 15 分钟平均负载）。
*   `sar -u 1 5`: 每秒采样一次 CPU 使用率，共 5 次。

### 4.2 内存监控
*   `free -h`: 以易读方式（GB/MB）查看内存。
*   `vmstat 1`: 每秒刷新一次虚拟内存统计。
*   `cat /proc/meminfo`: 查看底层内存详细指标。

### 4.3 磁盘监控
*   `df -h`: 查看磁盘分区占用。
*   `du -sh *`: 查看当前目录下各文件/目录的大小。
*   `iostat -x 1`: 查看磁盘 I/O 详情（查看是否存在 I/O 等待 `iowait`）。

### 4.4 进程管理
*   `ps -ef | grep java`: 查看 Java 进程。
*   `ps -aux --sort=-pmem | head -5`: 按内存占用排序取前 5。
*   `kill -9 <pid>`: 强制杀死进程。

---

## 5. 后端开发常用神技

### 5.1 实时日志查看
*   `tail -f app.log`: 动态查看。
*   `tail -n 100 app.log`: 查看最后 100 行。
*   `less app.log`: 分页查看（支持 `/` 搜索，`G` 到末尾，`g` 到开头）。

### 5.2 统计关键字出现次数
*   `grep "ERROR" app.log | wc -l`: 统计 ERROR 出现的总行数。

### 5.3 批量删除指定进程
*   `ps -ef | grep 'my-app' | grep -v grep | awk '{print $2}' | xargs kill -9`

### 5.4 查看系统发行版信息
*   `cat /etc/os-release` 或 `lsb_release -a`
