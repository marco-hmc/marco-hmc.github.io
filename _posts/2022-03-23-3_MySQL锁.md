---
title: "MySQL隔离级别"
layout: post
author: "Marco"
header-style: text
hidden: true
tags:
  - 数据库
---

## MySQL中的锁

### 1. 基本概念

- ***锁的定义以及目的***

  ​	计算机协调多个进程或线程访问某一个资源的机制。MySQL中特别是处理多线程（多事务）下对数据的竞争。不同的存储引擎，其锁的支持程度、类别会有不同。

- ***锁有什么缺点***

  ​	所有锁都是额外的开销，上锁，解锁，检测锁都需要增加系统额外的开销

- ***锁的种类***

  - 按照锁的空间分
    - 行锁
    - 表锁
    - 页锁
  - 按照锁的权限分
    - 排他锁：当前操作未完成之前，不给读不给写
    - 共享锁：多个读操作可以同时进行

- 如何解决表锁和行锁之间的冲突？

  [InnoDB 的意向锁有什么作用？ - 发条地精的回答 - 知乎](https://www.zhihu.com/question/51513268/answer/127777478)

- ***如何避免数据库的死锁***

  - 加锁顺序一致
  - 使用较低的隔离级别
  - 尽量使用索引访问数据

- ***乐观锁和悲观锁的设计理念***

  - 乐观锁
    - 定义：假定会发生并发冲突
    - 机制：表锁、行锁
    - 实现层面：数据库本身实现
    - 使用场景：并发量大

  - 悲观锁
    - 定义：假定不会发生并发冲突，只在提交操作的时候，检测是否冲突。
    - 机制：提交更新是，检查版本号以及时间戳是否符合。
    - 实现层面：业务代码
    - 使用场景：并发量小

### 2. 实战篇

- ***表锁中如何上锁***

  - 隐式上锁
    - `select //读锁`
    - `insert、update、delete //写锁`

  - 显式上锁
    - `lock table A read // 读锁`
    - `lock table A write // 写锁`
  - 手动解锁
    - `unlock tables`

- ***行锁中如何上锁***

  - 隐式上锁
    - `select //读锁`
    - `insert、update、delete //写锁`

  - 显式上锁
    - `select * from A lock in share mode // 读锁`
    - `select * from A for update // 写锁`
  - 手动解锁
    - `unlock tables`



## 参考

[一张图搞定MySQL的锁机制](https://learnku.com/articles/39212?order_by=vote_count&)