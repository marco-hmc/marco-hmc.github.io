---
title: "MySQL并发控制"
layout: post
author: "Marco"
header-style: text
hidden: true
tags:
  - 数据库
---

## MySQL中的MVCC机制

### 1. 基本概念

- ***什么是mvcc机制？***

  ​	MVCC是一种多版本并发控制机制，是MySQL的InnoDB存储引擎实现隔离级别的一种具体方式，用于实现提交读和可重复读这两种隔离级别。

- ***MVCC的实现原理***

  ​	MVCC的两个实现核心是**undo log**和**一致性视图**，通过undo log来保存多版本的数据，通过一致性视图来保存当前活跃的事务列表，将两者结合和制定一定的规则来判断当前可读数据。

- ***实现原理***

  [这里](https://www.jianshu.com/p/20fa5703bd3e)