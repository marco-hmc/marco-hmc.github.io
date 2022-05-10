---
title: "2_什么是kafka"
subtitle: "一"
layout: post
author: "Marco"
header-style: text
hidden: true
tags:
  - 中间件
---

## 什么是kafka

### 1. 基本概念

- ***什么是kafka?***

  ​	kafka是一种分布式消息中间件。
  
- ***什么是消息中间件？***

  ![img](https://s2.loli.net/2022/04/20/IgxhR8qOtua7dnb.png)
  
  ​	分布式消息是一种通信机制，和 RPC、HTTP、RMI 等不一样，消息中间件采用分布式中间代理的方式进行通信。如图所示，采用了消息中间件之后，上游业务系统发送消息，先存储在消息中间件，然后由消息中间件将消息分发到对应的业务模块应用（分布式生产者 - 消费者模式）。这种异步的方式，减少了服务之间的耦合程度。
  
- ***信息中间件的优势是什么？***

  - 解耦/异步通信：因为是异步的，所以上游系统和下游系统可以解耦，仅留下一个通信的机制。
  - 峰值处理/缓冲：其实可以看成是一种生产者消费者模式，上游系统可能有订单请求，下游系统要把消息转发给支付系统、卖家系统等。如果订单多的时候，下游系统可能处理不过来，而这种突然的峰值情况，有可能导致整个系统阻塞。而消息中间件可以作为一个缓存，缓解峰值的情况。
  - 扩展性好
  - 顺序保证

- ***应用场景***

  > 转载自[kafka简单介绍](https://www.cnblogs.com/liuxs13/p/9283129.html)

  - 日志收集：

    ELK日志采集框架中，利用kafka同Logstash来收集服务端日志。

  - 消息系统：

  　　解耦生产者与消费者，缓存消息，实现异步处理。

  - 实现消息 “发布-订阅模式“：

    对于不同消费者消费同一消息，利用Kafka实现：同一个topic中的消息只能被同一个Consumer Group中的一个消费者消费，但可以被多个Consumer Group消费这一消息。

  - 用户活动跟踪：

    Kafka经常被用来记录web用户或者app用户的各种活动，如浏览网页、搜索、点击等活动，这些活动信息被各个服务器发布到kafka的topic中，然后订阅者通过订阅这些topic来做实时的监控分析，或者装载到Hadoop、数据仓库中做离线分析和挖掘。

  - 运营指标：

    Kafka也经常用来记录运营监控数据。包括收集各种分布式应用的数据，生产各种操作的集中反馈，比如报警和报告。

- ***消息中间件选型的时候主要看什么？***

  ​	语言(开发语言、客户端支持语言)、协议、数据可靠性、性能、生态、推拉模式，下面以kafka为例，讲解一下。

### 2. kafka工作原理

- ***重温kafka工作目标***

  >![img](https://s2.loli.net/2022/04/20/CyfYb1VGEQLgl3I.png)

  ​	kafka作为消息中间件，是为了异步实现生产者和消费者的通信问题，而为了实现异步，采用的是一种发布-订阅，push-pull模式，即生产者的产品，会push/发布到中间件的某一个节点(Broker)中的一个单位(topic)，消费者会订阅(follow)这个单位(topic)，在合适的情况下，消费者会把产品push下来，完成整个流程，这就可以称为一个tiny的消息中间件，而称为一个成熟的消息中间件还希望有如下功能。

  ​	整个工作流程，希望是非常安全的，不希望某一个Broker宕机的时候，数据就丢失了，因此数据要求是多备份的。

  ​	除此，因为Broker节点是有很多，需要有一个分布式的服务器管理。不然有可能一个消息，多个Broker都有，下游从一个Broker里完成pull产品操作后，其他Broker还存在这个产品。而在kafka则是依赖与zookeeper实现这个分布式的服务管理。

- ***zookeeper进一步的作用***
  > ​	![img](https://s2.loli.net/2022/04/20/LWeXNyPJFk3oBVY.png)
  - Broker 注册：Broker 是分布式部署并且之间相互独立，Zookeeper 用来管理注册到集群的所有 Broker 节点。
  - Topic 注册：在 Kafka 中，同一个 Topic 的消息会被分成多个分区并将其分布在多个 Broker 上，这些分区信息及与 Broker 的对应关系也都是由 Zookeeper 在维护
  - 生产者负载均衡：由于同一个 Topic 消息会被分区并将其分布在多个 Broker 上，因此，生产者需要将消息合理地发送到这些分布式的 Broker 上。
  - 消费者负载均衡：与生产者类似，Kafka 中的消费者同样需要进行负载均衡来实现多个消费者合理地从对应的 Broker 服务器上接收消息，每个消费者分组包含若干消费者，每条消息都只会发送给分组中的一个消费者，不同的消费者分组消费自己特定的 Topic 下面的消息，互不干扰。

- ***代码实战部分***

  ```c++
  // pseudo code
  // producer.config
  IP-ID: host1:8080 // 设定kafka服务地址
  ...// 错误重传次数、延时等
  
  // producer class
  class Producer: KafKaProducer{
      void init(); // 加载producer.config
      void sendToKafka(); // 父类有send之类的相关方法
  }
  ```

  ```c++
  // pseudo code
  // consumer.config
  IP-ID: host1:8080 // 设定kafka服务地址
  ...// 错误重传次数、延时等
  
  // producer class
  class Consumer: KafKaConsumer{
      void init(); // consumer.config
      void sendToKafka(){
          subscribe(); //订阅
          logger.info();
          get();
      }; // 父类有send之类的相关方法
  }
  ```

  

### 参考

1. [一文学完 Kafka 中间件](https://jishuin.proginn.com/p/763bfbd35ca2)
2. [深入浅出理解基于 Kafka 和 ZooKeeper 的分布式消息队列](https://gitbook.cn/books/5ae1e77197c22f130e67ec4e/index.html)


