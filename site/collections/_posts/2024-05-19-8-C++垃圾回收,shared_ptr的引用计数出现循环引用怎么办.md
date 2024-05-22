---
title: C++垃圾回收,shared_ptr的引用计数出现循环引用怎么办
date: 2024-05-19 13:57:15 +0800
image: /images/post/post-3.jpg
project: ccpp
tags: 

---

**std::weak_ptr** 是一个不控制资源生命周期的智能指针,是对对象的一种弱引用,只是提供了对其管理的资源的一个访问手段,引入它的目的为协助 **std::shared_ptr** 工作.
**std::weak_ptr** 可以从一个 **std::shared_ptr** 或另一个 **std::weak_ptr** 对象构造,**std::shared_ptr** 可以直接赋值给 **std::weak_ptr** ,也可以通过 **std::weak_ptr** 的 **lock()** 函数来获得 **std::shared_ptr**.它的构造和析构不会引起引用计数的增加或减少.**std::weak_ptr** 可用来解决 **std::shared_ptr** 相互引用时的死锁问题(即两个**std::shared_ptr** 相互引用,那么这两个指针的引用计数永远不可能下降为 0, 资源永远不会释放).

## C++垃圾回收,shared_ptr的引用计数出现循环引用怎么办

1. 智能指针实现
     * weak_ptr是用于解决什么问题的
     * 智能指针的实际使用