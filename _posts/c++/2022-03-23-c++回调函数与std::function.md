---
title: "c++回调函数与std::function"
subtitle: "线程同步"
layout: post
author: "Marco"
header-style: text
hidden: true
tags:
  - c++
---

## c++回调函数与std::function

### 1. 基本概念

- ***什么是回调函数？***

  ​	[如何浅显地解释回调函数](https://bot-man-jl.github.io/articles/?post=2017/Callback-Explained)。简单来说就是把函数作为参数，传给另外一个函数。如果你想了一下，可能会疑问怎么传函数。但这个解决方案也是很显然的，肯定不能把函数代码全部弄上去啊，传一个函数指针就行了。
  
- ***什么是函数指针？***

  ​	[什么是函数指针](https://www.runoob.com/cprogramming/c-fun-pointer-callback.html)

- ***什么是std::function？***

  ​	函数指针无法指向lambda，重载了operator()之类的东西，function更灵活。

  ​	[std::funtcion和函数指针的区别](https://www.zhihu.com/question/314660217)

- ***总结***

  ​	函数的回调只需要将一个函数的地址/指针告诉给另外一个就可以了，而类的回调函数实现会有点问题，因为普通和函数和类的静态成员函数都分配有确定的函数地址，但是类的普通函数是类共用的，并不会给类的每一个实例都分配一个独立的成员函数。

### 2. 回调函数的实现

- [关于c++回调函数精简且使用](https://blog.csdn.net/zhoupian/article/details/119495949)

