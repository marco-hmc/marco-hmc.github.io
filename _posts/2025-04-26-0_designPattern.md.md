---
layout: post
title: cpp设计模式-入门
categories: 程序设计
related_posts: True
tags: 设计模式
toc:
  sidebar: left
---

## cpp设计模式-入门

<img src="imgs/18-oo-patterns.png" />
https://refactoringguru.cn/

设计模式的本质在于提供系统的灵活性和可扩展性。

- 不要重复：设想如果一份代码中存在大量重复代码，当这些重复代码需要修改时，就会有多处需要修改，扩展起来非常麻烦;
- 不要耦合：如果代码之间耦合度高，改动一处会影响到其他部分，就会导致扩展性差的问题；
- 不要模块混乱：如果项目内部模块依赖混乱，当需要多人开发不同模块时，提交代码会非常麻烦，不是单纯一方接受另一方的变更即可，而是双方需要来回修改提交代码才能合并。这本质上也是一种扩展性差的问题。
- 便于维护：而且经典的设计模式是所有成熟开发者的共识，维护也更简单。

因此，如果一份代码不需要修改，自然就不需要引入设计模式。但代码的修改是不可避免的，这也是为什么设计模式很重要。所有的设计模式和设计原则本质上也都是基于此，即如何让系统具备足够的可扩展性。

### 1 六大原则

#### 1.1 单一职责原则(Single Responsibility Principle,简称SRP )

- **核心思想:**应该有且仅有一个原因引起类的变更
- **问题描述:**假如有类Class1完成职责T1,T2,当职责T1或T2有变更需要修改时,有可能影响到该类的另外一个职责正常工作
- **好处:**类的复杂度降低/可读性提高/可维护性提高/扩展性提高/降低了变更引起的风险
- 单一职责原则是实现**高内聚/低耦合**的指导方针,它是最简单但又最难运用的原则,需要设计人员发现类的不同职责并将其分离
- **需注意:**单一职责原则提出了一个编写程序的标准,用"职责"或"变化原因"来衡量接口或类设计得是否优良,但是"职责"和"变化原因"都是不可以度量的,因项目和环境而异

#### 1.2 里氏替换原则(Liskov Substitution Principle,简称LSP)

- **核心思想:**在使用基类的的地方可以任意使用其子类,能保证子类完美替换基类
- **通俗来讲:**只要父类能出现的地方子类就能出现.反之,父类则未必能胜任
- **好处:**增强程序的健壮性,即使增加了子类,原有的子类还可以继续运行
- **需注意:**如果子类不能完整地实现父类的方法,或者父类的某些方法在子类中已经发生"畸变",则建议断开父子继承关系 采用依赖/聚合/组合等关系代替继承

#### 1.3 依赖倒置原则(Dependence Inversion Principle,简称DIP)

- **核心思想**:高层模块不应该依赖底层模块,二者都该依赖其抽象;抽象不应该依赖细节;细节应该依赖抽象
- **说明**:高层模块就是调用端,低层模块就是具体实现类.抽象就是指接口或抽象类.细节就是实现类
- **解决方案:**将类A修改为依赖接口interface,类B和类C各自实现接口interface,类A通过接口interface间接与类B或者类C发生联系,则会大大降低修改类A的几率
- **好处**:依赖倒置的好处在小型项目中很难体现出来.但在大中型项目中可以减少需求变化引起的工作量.使并行开发更友好

#### 1.4 接口隔离原则(Interface Segregation Principle,简称ISP)

- **核心思想**:类间的依赖关系应该建立在最小的接口上
- **通俗来讲:**建立单一接口,不要建立庞大臃肿的接口,尽量细化接口,接口中的方法尽量少.也就是说,我们要为各个类建立专用的接口,而不要试图去建立一个很庞大的接口供所有依赖它的类去调用.
- **需注意:**
  - **接口尽量小,但是要有限度**.对接口进行细化可以提高程序设计灵活性,但是如果过小,则会造成接口数量过多,使设计复杂化.所以一定要适度
  - **提高内聚,减少对外交互**.使接口用最少的方法去完成最多的事情
  - **为依赖接口的类定制服务**.只暴露给调用的类它需要的方法,它不需要的方法则隐藏起来.只有专注地为一个模块提供定制服务,才能建立最小的依赖关系

#### 1.5 迪米特法则(Law of Demeter,简称LoD)

- **核心思想:**类间解耦
- **通俗来讲:** 一个类对自己依赖的类知道的越少越好.自从我们接触编程开始,就知道了软件编程的总的原则:低耦合,高内聚.无论是面向过程编程还是面向对象编程,只有使各个模块之间的耦合尽量的低,才能提高代码的复用率.低耦合的优点不言而喻,但是怎么样编程才能做到低耦合呢?那正是迪米特法则要去完成的

#### 1.6 开放封闭原则(Open Close Principle,简称OCP)

- **核心思想:**尽量通过扩展软件实体来解决需求变化,而不是通过修改已有的代码来完成变化
- **通俗来讲:** 一个软件产品在生命周期内,都会发生变化,既然变化是一个既定的事实,我们就应该在设计的时候尽量适应这些变化,以提高项目的稳定性和灵活性

* 总结:单一职责原则告诉我们实现类要职责单一;里氏替换原则告诉我们不要破坏继承体系;依赖倒置原则告诉我们要面向接口编程;接口隔离原则告诉我们在设计接口的时候要精简单一;迪米特法则告诉我们要降低耦合.而开闭原则是总纲,他告诉我们要对扩展开放,对修改关闭
