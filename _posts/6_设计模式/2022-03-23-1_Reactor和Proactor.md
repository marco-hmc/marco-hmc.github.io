---
title: "Reactor和Proactor"
layout: post
author: "Marco"
header-style: text
hidden: true
tags:
  - 设计模式
---

# Reactor和Proactor

### 1. 基本概念

* ***什么是Reactor和Proactor模式***

  ​	服务器连接多个客户端进行通信属于IO问题（这个通信，包含增删改查等等请求）。而这种有BIO、NIO、以及IO复用等常见方式。而Reactor和Proactor则是属于IO复用中在设计使用的时候，推荐的两种设计模式。

* ***Reactor和Proactor的简单了解***

  ​	I/O复用本质上都是同时处理多个请求，哪个请求能处理就处理哪个；避免了BIO，只能处理单一请求；避免了NIO会发起大量无效的请求。

  ​	随着业务的扩展，不可能每一个新的业务都是从select/poll/epoll实现IO复用，因此在IO复用的基础上多了一层封装，把网络API细节尽可能进行屏蔽，让开发者可以仅关注在应用代码的编写。而这种封装就被叫做，Reactor模式和Proactor模式。

### 2. Reactor

#### 2.1 原始版本

​	多个客户端向服务器发出请求，那么每一个请求/链接都创建一个线程进行处理。这时候，会出现两个问题。

- 如果有很多短请求，不断申请线程，然后又销毁线程，造成了极大性能开销，如何优化？
  - 线程池，也就是通过资源复用的方式。不用再为每个链接创建线程，而是创建一个线程池，将连接分配给线程，然后一个线程可以处理多个连接的业务。
- 多个请求的处理顺序如何安排？
  - 如果是BIO形式的话，每个请求都会阻塞，如果当前请求，资源没有就绪，就会一直卡着，不好；
  - 如果是NIO形式的话，请求会一直发出，直至可以响应，大量的无效请求也会造成性能开销，也不好；
  - 如果IO复用形式的话，传入大量的IO请求，哪个能处理就处理哪个。

------

​	这时候性能方面问题大致解决了，可是IO复用在写的时候如果不注意的话，就会出现网络层API和应用代码交织编写的情况，而网络层API是不同业务上都雷同的，这时候就希望
IO复用哪些网络IO和业务代码分离，提高代码复用率。

#### 2.2 单reactor 单进程

> [图片来自:如何深刻理解Reactor和Proactor？ - 小林coding的回答 - 知乎](https://www.zhihu.com/question/26943938/answer/1856426252)
>
> 以下部分都会大量转载自小林coding

![img](https://s2.loli.net/2022/05/09/NlaFPtJsmzuSh7e.jpg)

- ***流程***
  - Reactor 对象通过 select （IO 多路复用接口） 监听事件，收到事件后通过 dispatch 进行分发，具体分发给 Acceptor 对象还是 Handler 对象，还要看收到的事件类型；
  - 如果是连接建立的事件，则交由 Acceptor 对象进行处理，Acceptor 对象会通过 accept 方法 获取连接，并创建一个 Handler 对象来处理后续的响应事件；
  - 如果不是连接建立事件， 则交由当前连接对应的 Handler 对象来进行响应；
  - Handler 对象通过 read -> 业务处理 -> send 的流程来完成完整的业务流程。
- ***优缺点***
  - 第一个缺点，因为只有一个进程，**无法充分利用 多核 CPU 的性能**；
  - 第二个缺点，Handler 对象在业务处理时，整个进程是无法处理其他连接的事件的，**如果业务处理耗时比较长，那么就造成响应的延迟**；
  - 所以，单 Reactor 单进程的方案**不适用计算机密集型的场景，只适用于业务处理非常快速的场景**。
- ***实际应用***
  - Redis 是由 C 语言实现的，它采用的正是「单 Reactor 单进程」的方案，因为 Redis 业务处理主要是在内存中完成，操作的速度是很快的，性能瓶颈不在 CPU 上，所以 Redis 对于命令的处理是单进程的方案。

#### 2.3 单reactor 多进程

> [图片来自:如何深刻理解Reactor和Proactor？ - 小林coding的回答 - 知乎](https://www.zhihu.com/question/26943938/answer/1856426252)
>
> 以下部分都会大量转载自小林coding

![img](https://s2.loli.net/2022/05/09/zHC9YtDZOQ4m6sB.jpg)

- ***流程***
  - Reactor 对象通过 select （IO 多路复用接口） 监听事件，收到事件后通过 dispatch 进行分发，具体分发给 Acceptor 对象还是 Handler 对象，还要看收到的事件类型；
  - 如果是连接建立的事件，则交由 Acceptor 对象进行处理，Acceptor 对象会通过 accept 方法 获取连接，并创建一个 Handler 对象来处理后续的响应事件；
  - 如果不是连接建立事件， 则交由当前连接对应的 Handler 对象来进行响应；
  - Handler 对象不再负责业务处理，只负责数据的接收和发送，Handler 对象通过 read 读取到数据后，会将数据发给子线程里的 Processor 对象进行业务处理；
  - 线程里的 Processor 对象就进行业务处理，处理完后，将结果发给主线程中的 Handler 对象，接着由 Handler 通过 send 方法将响应结果发送给 client；
- ***优缺点***
  - 单 Reator 多线程的方案优势在于**能够充分利用多核 CPU 的能**，那既然引入多线程，那么自然就带来了多线程竞争资源的问题。
  - 单 Reactor 多进程相比单 Reactor 多线程实现起来很麻烦，主要因为要考虑子进程 <-> 父进程的双向通信，并且父进程还得知道子进程要将数据发送给哪个客户端。
  - 「单 Reactor」的模式还有个问题，**因为一个 Reactor 对象承担所有事件的监听和响应，而且只在主线程中运行，在面对瞬间高并发的场景时，容易成为性能的瓶颈的地方**
- ***实际应用***
  - 而多线程间可以共享数据，虽然要额外考虑并发问题，但是这远比进程间通信的复杂度低得多，因此实际应用中也看不到单 Reactor 多进程的模式。

#### 2.4 多reactor 多进程

> [图片来自:如何深刻理解Reactor和Proactor？ - 小林coding的回答 - 知乎](https://www.zhihu.com/question/26943938/answer/1856426252)
>
> 以下部分都会大量转载自小林coding

![img](https://s2.loli.net/2022/05/09/AU8gv3RXQY7NkKT.jpg)

- ***流程***
  - 主线程中的 MainReactor 对象通过 select 监控连接建立事件，收到事件后通过 Acceptor 对象中的 accept 获取连接，将新的连接分配给某个子线程；
  - 子线程中的 SubReactor 对象将 MainReactor 对象分配的连接加入 select 继续进行监听，并创建一个 Handler 用于处理连接的响应事件。
  - 如果有新的事件发生时，SubReactor 对象会调用当前连接对应的 Handler 对象来进行响应。
  - Handler 对象通过 read -> 业务处理 -> send 的流程来完成完整的业务流程。
- ***优缺点***
  - 主线程和子线程分工明确，主线程只负责接收新连接，子线程负责完成后续的业务处理。
  - 主线程和子线程的交互很简单，主线程只需要把新连接传给子线程，子线程无须返回数据，直接就可以在子线程将处理结果发送给客户端。
- ***实际应用***
  -  Netty 和 Memcache 都采用了「多 Reactor 多线程」的方案。

### 3. Proactor

​	**Proactor 是异步网络模式。**	

​	可惜的是，在 Linux 下的异步 I/O 是不完善的， `aio` 系列函数是由 POSIX 定义的异步操作接口，不是真正的操作系统级别支持的，而是在用户空间模拟出来的异步，并且仅仅支持基于本地文件的 aio 异步操作，网络编程中的 socket 是不支持的，这也使得基于 Linux 的高性能网络程序都是使用 Reactor 方案。所以这里也就省去介绍。

​	

### 参考

[zhihu: 如何理解Reactor和Proactor](https://www.zhihu.com/question/26943938)

