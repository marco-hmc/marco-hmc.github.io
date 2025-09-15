# C++ 设计模式指南

![设计模式概览](imgs/18-oo-patterns.png)

## 概述

设计模式的本质在于赋予系统卓越的灵活性与可扩展性。它们是经过时间检验的解决方案，用于解决软件设计中的常见问题。

### 为什么需要设计模式？

设计模式主要解决以下问题：

1. **减少代码冗余**：避免重复代码，一处修改，多处同步更新困难
2. **降低模块耦合度**：减少模块间的依赖，提高系统扩展性
3. **优化模块依赖关系**：简化多人协作开发中的代码合并
4. **提升维护便捷性**：标准化的设计模式提高代码可读性和可维护性

> **核心理念**：所有设计模式都围绕一个目标——使系统具备充足的可扩展性。

---

## 一、六大设计原则

### 1.1 单一职责原则 (SRP)

**核心思想**：一个类应该只有一个引起其变化的原因，即每个类只负责一项职责。

```cpp
// 违反SRP：用户类既管理信息又处理登录
class BadUser {
    void saveUserInfo();     // 职责1：用户信息管理
    void authenticateUser(); // 职责2：用户认证
};

// 遵循SRP：职责分离
class UserInfo {
    void saveUserInfo();
};

class UserAuthenticator {
    void authenticateUser();
};
```

### 1.2 里氏替换原则 (LSP)

**核心思想**：子类必须能够替换其基类，且不影响程序正确性。

### 1.3 依赖倒置原则 (DIP)

**核心思想**：高层模块不应依赖低层模块，两者都应依赖抽象。

### 1.4 接口隔离原则 (ISP)

**核心思想**：类不应被迫依赖它不使用的方法。

### 1.5 迪米特法则 (LoD)

**核心思想**：一个对象应该对其他对象保持最少的了解。

### 1.6 开放封闭原则 (OCP)

**核心思想**：对扩展开放，对修改封闭。

---

## 二、创建型模式

### 2.1 工厂模式

```cpp
class ShapeFactory {
public:
    virtual std::unique_ptr<Shape> createShape() = 0;
};
```

在面向对象编程中，不直接借助构造函数创建对象，而是借助一个辅助类（通常称作工厂类），通过调用其创建方法来构造对象。委托工厂类构造对象具有显著优势，它不仅能够一次性创建多个相关对象，还可在对象创建时执行额外操作。

工厂方法模式着重于利用工厂类的创建方法来创建对象，适用于在运行时方能确定具体实例化类别的场景。例如，在一个图形绘制系统中，存在一个抽象的`ShapeFactory`类，其定义了创建图形的抽象方法`createShape()`。具体的子类如`CircleFactory`和`RectangleFactory`继承自`ShapeFactory`，并各自实现`createShape()`方法以创建圆形和矩形对象。这样，系统在运行时可依据实际需求，选择合适的子类工厂来创建特定图形，增强了代码的灵活性。

抽象工厂模式则强调工厂类的创建方法能够一次批量创建多个相关或相互依赖的对象，适用于需要创建一组协同工作对象的情形。例如，在游戏开发中，`GameFactory`作为抽象工厂接口，定义了创建游戏角色、游戏场景等相关对象的抽象方法。具体的`RPGGameFactory`和`StrategyGameFactory`等子类实现该接口，根据不同游戏类型创建相互适配的对象组。这种方式将对象的创建过程与使用过程解耦，有效提升了代码的可扩展性。

### 2.2 建造者模式

```cpp
class BurgerBuilder {
    Burger burger;
public:
    BurgerBuilder& addCheese() { /* ... */ return *this; }
    BurgerBuilder& addOnion() { /* ... */ return *this; }
    Burger build() { return burger; }
};
```

最主要的是在于返回引用，便于链式构造。

当对象的构造函数参数众多，或者对象的构造过程极为复杂时，建造者模式便成为一种理想选择。尤其当一个对象存在多种风格，且为避免构造函数伸缩问题（即随着对象配置选项增多，构造函数数量急剧增加的问题）时，建造者模式更能凸显其优势。与工厂模式的关键差异在于，工厂模式适用于对象创建为单一步骤的过程，而建造者模式适用于对象创建需多个步骤的场景。

以制作汉堡为例，汉堡具有众多定制化选项，如是否添加双层芝士、洋葱、酸黄瓜等。此时，可将汉堡的制作委托给`BurgerBuilder`（汉堡建造者）。`BurgerBuilder`依据订单和当前状态，分步骤完成汉堡的构造。这种方式带来诸多益处：

- **更好的控制**：建造者模式允许在对象构建过程中逐步操作，灵活地添加、修改或删除部件，精准控制对象的构造。
- **提高代码可读性**：将复杂的构造过程分解为多个清晰的步骤，使代码结构更加清晰，易于理解和维护。
- **避免构造函数污染**：有效避免了构造函数因参数过多而变得臃肿复杂的问题，让对象的创建过程更为灵活。

建造者模式通过将复杂对象的构造过程细分为多个步骤，显著提升了构造过程的灵活性与可控性。它支持按步骤构建对象，并能根据实际需求灵活调整构建步骤，从而增强了代码的可读性与可维护性。

### 2.3 单例模式

```cpp
class Singleton {
public:
    static Singleton& getInstance() {
        static Singleton instance; // C++11保证线程安全
        return instance;
    }
private:
    Singleton() = default;
    Singleton(const Singleton&) = delete;
    Singleton& operator=(const Singleton&) = delete;
};
```

单例模式的核心在于确保特定类在系统中仅创建一个实例，并提供全局访问点以便获取该实例。然而，单例模式也存在一些弊端：

- **调试困难**：单例模式在应用程序中引入了全局状态，一处的更改可能波及其他区域，增加了调试的复杂性。例如，在一个大型软件系统中，单例对象的某个属性值被意外修改，可能导致多个依赖该单例的模块出现异常，而定位问题根源较为困难。
- **单元测试挑战**：由于单例模式使类之间的依赖关系紧密耦合，模拟单例对象进行单元测试变得棘手。例如，在测试依赖单例的模块时，难以隔离单例对象的影响，从而影响测试的准确性和独立性。
- **依赖关系隐藏**：单例模式可能隐匿类之间的依赖关系，使代码的理解和维护成本增加。例如，一个模块看似独立，但实际上依赖单例对象的某些行为，当单例对象发生变化时，可能引发该模块的潜在问题，而这种依赖关系在代码结构中并不直观。

尽管存在上述缺点，但在满足以下条件时，仍可合理运用单例模式：

- **唯一性要求**：该类的对象在整个系统中必须保证仅有一个实例。例如，数据库连接池管理类，为确保数据库连接的合理复用与管理，通常设计为单例模式，避免多个连接池实例造成资源浪费和管理混乱。
- **高可见性需求**：该实例需要在多个不同的地方被频繁访问和使用。例如，日志记录类作为单例，可方便系统各个模块在不同位置记录日志信息。
- **生命周期管理宽松**：对该实例的生命周期管理要求不高，无需精细控制其创建与销毁时机。

在早期，由于存在线程安全问题，单例模式衍生出饿汉模式和懒汉模式。饿汉模式在程序启动时即创建单例实例，保证了线程安全，但可能造成资源浪费；懒汉模式则在首次使用时创建实例，但在多线程环境下需要额外的同步机制来确保线程安全。然而，在现代 C++ 中，通过使用局部静态变量，如以下代码：

```c++
static EagerSingleton& getInstance() {
    static EagerSingleton instance;
    return instance;
}
```

饿汉模式的单例实现既能实现延迟实例化，又能保证线程安全，因此在现代 C++ 开发中，无需过于强调饿汉模式与懒汉模式的区分。

### 2.4 原型模式

在 C++ 中，原型设计模式的概念体现相对不那么突出。其核心意图是通过复用现有对象来创建新对象，而非通过常规的类实例化方式。在 C++ 里，可借助拷贝构造函数或移动构造函数实现类似行为。例如，当需要创建多个相似对象时，可通过拷贝已有的对象实例，而非每次都重新实例化类，以此提高对象创建效率。因此，相较于其他语言，C++ 中原型设计模式的特征表现得相对隐晦。

### 2.5 总结

创建型模式本质上是对对象创建过程进行有效管理，涵盖从简单对象创建到复杂对象构建的各种场景。若仅需对对象创建进行基本控制，工厂模式是不错的选择；若涉及复杂的流程控制，建造者模式则更为适用。原型模式通过复用现有对象优化创建过程，单例模式则专注于确保特定类在系统中的唯一性与全局可访问性。理解并合理运用这些创建型模式，有助于开发人员构建更加灵活、可维护且高效的软件系统。

---

### 3. 结构型模式

结构型模式关注类与对象的组合方式，旨在通过合理的结构设计提高系统的灵活性与复用性。

#### 3.1 **适配器模式（Adapter Pattern）**

**目的**：将一个类的接口转换为客户期望的另一种接口，使原本因接口不兼容而无法协同工作的类能够顺利合作。

**使用场景**：

- 当需要利用一个已有的类，但其接口与当前需求不匹配时。
- 当需要统一多个类的接口以便于调用时。

**示例**：

```cpp
// 适配器模式示例
class OldLibrary {
public:
    void oldMethod();
};

class Adapter {
    OldLibrary* oldLib;
public:
    void newMethod() {
        oldLib->oldMethod(); // 调用旧接口
    }
};
```

#### 3.2 **桥接模式（Bridge Pattern）**

**目的**：将抽象部分与实现部分分离，使它们可以独立变化。

**使用场景**：

- 当一个类存在多个独立变化的维度时。
- 当希望通过组合而非继承来扩展类的功能时。

**示例**：

```cpp
// 桥接模式示例
class Theme {
public:
    virtual std::string getColor() = 0;
};

class Page {
    Theme* theme;
public:
    Page(Theme* t) : theme(t) {}
    void render() {
        std::cout << "Page color: " << theme->getColor() << std::endl;
    }
};
```

#### 3.3 **组合模式（Composite Pattern）**

**目的**：将对象组合成树形结构，用于表示“部分-整体”的层次结构。

**使用场景**：

- 当需要以统一的方式处理单个对象和组合对象时。
- 当需要构建树形结构的对象层次时。

**补充**：
文件系统是组合模式的典型应用场景。文件系统中的文件夹可包含文件和其他文件夹，对于打开、删除、移动、复制、重命名等操作，无论是针对文件（单个对象）还是文件夹（组合对象），操作方式应保持一致。一般通过多态特性实现，单个对象和组合对象继承自同一个父类，组合对象以容器形式存储单个对象，从而对外呈现统一的操作模式。

**示例**：

```cpp
// 组合模式示例
class Component {
public:
    virtual void operation() = 0;
};

class Leaf : public Component {
public:
    void operation() override {
        std::cout << "Leaf operation" << std::endl;
    }
};

class Composite : public Component {
    std::vector<Component*> children;
public:
    void add(Component* child) {
        children.push_back(child);
    }
    void operation() override {
        for (auto child : children) {
            child->operation();
        }
    }
};
```

#### 3.4 **装饰模式（Decorator Pattern）**

**目的**：动态地为对象添加额外职责。

**使用场景**：

- 当需要在不修改原始类的情况下扩展其功能时。
- 当需要动态地添加或移除功能时。

**补充**：
在不修改原始类的情况下，为对象增添新功能。例如为图形对象添加边框或阴影。在实际开发中，如果某个类由库提供，而当前工程使用该类时存在统一的调整需求，但又无法直接修改库中的类，此时可通过继承原有类创建装饰类，在装饰类中添加所需功能。这样既保留了原有类的功能，又实现了对其功能的调整和扩展。

**示例**：

```cpp
// 装饰模式示例
class Component {
public:
    virtual void operation() = 0;
};

class ConcreteComponent : public Component {
public:
    void operation() override {
        std::cout << "ConcreteComponent operation" << std::endl;
    }
};

class Decorator : public Component {
    Component* component;
public:
    Decorator(Component* c) : component(c) {}
    void operation() override {
        component->operation();
        std::cout << "Decorator operation" << std::endl;
    }
};
```

#### 3.5 **外观模式（Facade Pattern）**

**目的**：为子系统中的一组接口提供一个统一的接口，简化子系统的使用。

**使用场景**：

- 当需要为复杂的子系统提供一个简单接口时。
- 当需要降低子系统与客户端之间的耦合度时。

**补充**：
比如说有多个子系统类，客户端需要频繁调用这些子系统类的多个方法来完成某个任务。为了简化客户端的操作，可以创建一个外观类，封装对子系统类的调用逻辑，客户端只需与外观类交互即可。这样不仅简化了客户端代码，还降低了客户端与子系统之间的耦合度，提高了系统的可维护性。
举个例子，比如说开机操作，实际上涉及多个子系统的初始化工作，如电源管理、硬件检测、操作系统加载等。通过外观模式，可以创建一个 `Computer` 类，封装这些复杂的初始化过程，客户端只需调用 `Computer` 类的 `start()` 方法即可完成开机操作，而无需了解具体的子系统（电源、CPU、IO等系统）的`init()`实现细节。

**示例**：

```cpp
// 外观模式示例
class SubsystemA {
public:
    void operationA() {
        std::cout << "SubsystemA operation" << std::endl;
    }
};

class SubsystemB {
public:
    void operationB() {
        std::cout << "SubsystemB operation" << std::endl;
    }
};

class Facade {
    SubsystemA a;
    SubsystemB b;
public:
    void operation() {
        a.operationA();
        b.operationB();
    }
};
```

#### 3.6 **享元模式（Flyweight Pattern）**

**目的**：通过共享技术有效支持大量细粒度对象的复用，减少内存消耗。

**使用场景**：

- 当系统中存在大量相似对象时。
- 当对象的状态可以分为内部状态和外部状态时。

**补充**：
享元模式通过共享对象来减少内存使用，适用于大量相似对象的场景。享元对象包含不可变的内部状态，而可变的外部状态由客户端在使用时传入。这样可以显著降低内存消耗，提高系统性能。

享元和池化的思想类似。只是狭义上，池化通常更强调复用对象来减少频繁的创建和销毁开销，和对象生命周期相关。而享元模式则侧重于共享对象的内部状态，适用于大量相似对象的场景。两者都旨在优化资源使用，但实现方式和应用场景有所不同。

**示例**：

```cpp
// 享元模式示例
class Flyweight {
    std::string intrinsicState;
public:
    Flyweight(const std::string& state) : intrinsicState(state) {}
    void operation(const std::string& extrinsicState) {
        std::cout << "Intrinsic: " << intrinsicState
                  << ", Extrinsic: " << extrinsicState << std::endl;
    }
};
```

#### 3.7 **代理模式（Proxy Pattern）**

- **目的**：为其他对象提供代理，实现对该对象访问的有效控制，并可在访问过程中添加额外功能。
- **使用场景**：当需要对某个对象的访问进行控制，如延迟加载、安全控制、日志记录等场景时，代理模式是合适的解决方案。
- **优点**：不仅能控制对象访问，还可在不修改原对象的基础上，为其添加诸如延迟加载、安全控制等额外功能。
- **缺点**：增加了系统的复杂性，可能对性能产生一定影响，尤其是在代理对象处理逻辑复杂的情况下。
- **示例**：在远程代理场景中，代理对象负责控制对远程对象的访问；虚拟代理则在实际需要时才创建实际对象。与装饰器模式不同，装饰器侧重于增加对象对外的能力，而代理模式通常不改变对外接口，而是在内部修改实现逻辑。例如，直接上网和通过代理上网，对外接口相同，但代理上网可在不改变接口的情况下添加额外处理逻辑，如访问权限控制、日志记录等。又如为“门”类创建“防盗门”代理，在不改变“门”的基本接口前提下，增强安全防护功能。

---

### 4. 行为型设计模式

行为型设计模式聚焦于对象之间职责的分配，与结构型模式不同，它们不仅关注结构，更着重于对象间消息传递与通信模式的构建。简单来说，这类模式致力于解决“如何在软件组件中实现行为运作”的问题。在软件工程领域，行为型设计模式旨在识别对象间常见的通信模式，并将其实现，以此提升通信的灵活性。

#### 4.1 **责任链模式**

**目的**：将请求沿着处理者链传递，直到被某个处理者处理。

**使用场景**：

- 当多个对象可以处理同一请求时。
- 当需要动态指定处理者时。

**补充**：
假设有一个日志记录系统，依据日志级别（如 INFO、DEBUG、ERROR）记录日志。可运用责任链模式，为不同级别日志创建对应的记录器，每个记录器处理特定级别的日志，并将其他级别日志传递给下一个记录器。

**示例**：

```cpp
// 责任链模式示例
class Handler {
    Handler* next;
public:
    Handler() : next(nullptr) {}
    void setNext(Handler* n) { next = n; }
    virtual void handleRequest(int request) {
        if (next) next->handleRequest(request);
    }
};

class ConcreteHandler : public Handler {
public:
    void handleRequest(int request) override {
        if (request < 10) {
            std::cout << "Handled by ConcreteHandler" << std::endl;
        } else {
            Handler::handleRequest(request);
        }
    }
};
```

#### 4.2 **命令模式**

**目的**：将请求封装为对象，从而支持参数化、队列化、事务和撤销操作。

**使用场景**：

- 当需要对操作进行参数化时。
- 当需要支持撤销和重做操作时。

**示例**：

```cpp
// 命令模式示例
class Command {
public:
    virtual void execute() = 0;
};

class Receiver {
public:
    void action() {
        std::cout << "Receiver action" << std::endl;
    }
};

class ConcreteCommand : public Command {
    Receiver* receiver;
public:
    ConcreteCommand(Receiver* r) : receiver(r) {}
    void execute() override {
        receiver->action();
    }
};
```

#### 4.3 **迭代器模式**

**目的**：提供一种顺序访问聚合对象元素的方法，而不暴露其内部表示。

**使用场景**：

- 当需要访问聚合对象内容却无需暴露其内部结构时。
- 当需要为聚合对象提供多种遍历方式时。

**补充**：
以 MP3 播放器或电视机为例，通过按下“上一个”和“下一个”按钮，可浏览连续的频道、歌曲或电台，这相当于为频道、歌曲或电台列表提供了迭代访问的接口。

**示例**：

```cpp
// 迭代器模式示例
class Iterator {
public:
    virtual bool hasNext() = 0;
    virtual int next() = 0;
};

class ConcreteIterator : public Iterator {
    std::vector<int> data;
    size_t index;
public:
    ConcreteIterator(const std::vector<int>& d) : data(d), index(0) {}
    bool hasNext() override { return index < data.size(); }
    int next() override { return data[index++]; }
};
```

#### 4.4 **中介者模式**

**目的**：通过一个中介对象封装多个对象间的交互，降低对象间的耦合度。

**使用场景**：

- 当对象间存在复杂引用关系，导致依赖关系结构混乱时。
- 当需要通过一个中介对象协调多个对象的交互时。

**补充**：
中介者模式是一种解耦模式。例如在聊天软件中，用户与聊天室原本相互引用，若要解耦两者关系，可借助中介者模式，将用户与聊天室的相互引用转变为用户与中介者、聊天室与中介者的相互引用。进一步抽象，对于复杂的引用关系图，使用中介者模式可将其简化为类似海星模式，所有节点都与中心节点（中介者）关联，由中介者处理复杂的耦合关系，避免每个节点既要处理业务又要处理引用关系。当然，如果原本的引用关系简单，则无需使用该模式。

**示例**：

```cpp
// 中介者模式示例
class Mediator {
public:
    virtual void notify(const std::string& event) = 0;
};

class ConcreteMediator : public Mediator {
    ComponentA* a;
    ComponentB* b;
public:
    void setComponents(ComponentA* compA, ComponentB* compB) {
        a = compA;
        b = compB;
    }
    void notify(const std::string& event) override {
        if (event == "A") {
            b->doSomething();
        } else if (event == "B") {
            a->doSomething();
        }
    }
};
```

#### 4.5 **备忘录模式**

**目的**：保存对象的某个状态，以便在需要时恢复。

**使用场景**：

- 当需要保存对象的历史状态以便在合适时机恢复时。
- 当使用命令模式实现撤销操作时。

**补充**：
备忘录模式类似于缓存机制，用于记录对象的中间状态。比如游戏中的读档和存档功能，保存角色当前状态以便回退到之前状态，这是典型应用。以计算器为例（发起者），每次计算后，结果会保存在内存中（备忘录），可通过操作按钮（看护者）恢复结果。Word 文档的 Ctrl + S 操作也会记录当前文档的若干版本备份，同样属于备忘录模式的实现。从某种角度看，该模式就是添加中间状态变量。

**示例**：

```cpp
// 备忘录模式示例
class Memento {
    int state;
public:
    Memento(int s) : state(s) {}
    int getState() { return state; }
};

class Originator {
    int state;
public:
    void setState(int s) { state = s; }
    Memento saveState() { return Memento(state); }
    void restoreState(const Memento& m) { state = m.getState(); }
};
```

#### 4.6 **观察者模式**

**目的**：定义对象间的一对多依赖关系，当一个对象状态改变时，通知所有依赖它的对象。

**使用场景**：

- 当一个对象的改变需要通知其他对象时。
- 当需要实现事件订阅机制时。

**补充**：
求职者订阅招聘网站，当有匹配工作机会时，求职者会收到通知。招聘网站无需认识具体求职者，但可认识订阅消息，并调用这些消息实际认识和调用求职者接口。

进一步抽象，对象拥有作为观察者/monitor 的成员变量，观察者需注册消息，收到消息后进行处理。该模式定义了对象间的依赖关系，当一个对象状态改变时，所有依赖它的对象都会收到通知，实现了对象间的松耦合，提升了系统的灵活性与可维护性。

**示例**：

```cpp
// 观察者模式示例
class Observer {
public:
    virtual void update() = 0;
};

class Subject {
    std::vector<Observer*> observers;
public:
    void attach(Observer* o) {
        observers.push_back(o);
    }
    void notify() {
        for (auto o : observers) {
            o->update();
        }
    }
};
```

#### 4.7 **访问者模式**

- **介绍**：访问者模式是一种动态添加对象能力的方法。例如酒店设置入访登记处，服务员、厨师等不同职能人员进入酒店时，只需在酒店统一登记`accept(args: Visitor)/register(args: Visitor)`，并通过多态在`accept()`中调用统一的`action()`方法，以完成各自职能。该模式表示对对象结构中各元素执行的操作，可在不改变各元素类的前提下定义新操作。
- **使用场景**：当需要对对象结构中的对象执行多种不同且不相关的操作，同时避免这些操作“污染”对象类，或者对象结构稳定但经常需要定义新操作时适用。
- **优点**：易于添加新操作，将相关行为集中到一个访问者对象中。
- **缺点**：增加新元素类较为困难，并且破坏了类的封装性。

#### 4.8 **策略模式**

**目的**：定义一系列算法，将每个算法封装起来，使它们可以互相替换。

**使用场景**：

- 当系统需要动态选择算法时。
- 当类定义了多种行为，且这些行为以多个条件语句形式出现时。

**补充**：
在排序场景中，起初使用冒泡排序，但随着数据量增长，冒泡排序变慢，于是实现快速排序。然而，快速排序处理小数据集时性能不佳。因此，实现一种策略，小数据集使用冒泡排序，大数据集使用快速排序。

**示例**：

```cpp
// 策略模式示例
class Strategy {
public:
    virtual void execute() = 0;
};

class ConcreteStrategyA : public Strategy {
public:
    void execute() override {
        std::cout << "Executing Strategy A" << std::endl;
    }
};

class Context {
    Strategy* strategy;
public:
    void setStrategy(Strategy* s) { strategy = s; }
    void executeStrategy() { strategy->execute(); }
};
```

#### 4.9 **状态模式**

**目的**：允许对象在其内部状态改变时改变其行为。

**使用场景**：

- 当对象的行为依赖于其状态，并且必须在运行时根据状态改变行为时。

**补充**：
状态模式是一种状态机的实现模式。以音乐播放器为例，“下一首”功能依赖播放模式状态，如单曲循环、顺序循环、随机播放等，同一行为根据不同状态执行不同操作，这就是状态模式。广义上，状态模式等同于状态机；狭义而言，状态模式更强调将业务能力下放到`state`中，由`state`的子类实现具体业务需求，例如音乐播放功能可表示为`void playNext(){m_state->action()}`。

**示例**：

```cpp
// 状态模式示例
class State {
public:
    virtual void handle() = 0;
};

class ConcreteStateA : public State {
public:
    void handle() override {
        std::cout << "Handling State A" << std::endl;
    }
};

class Context {
    State* state;
public:
    void setState(State* s) { state = s; }
    void request() { state->handle(); }
};
```

#### 4.10 **模板方法模式**

**目的**：定义算法的骨架，将某些步骤延迟到子类实现。

**使用场景**：

- 当算法的整体结构确定，但某些步骤的具体实现可由子类完成时。

- **补充**：模板方法模式用于定义流程。例如炒菜有固定流程，可设定为“1. 买菜；2. 洗菜；3. 切菜；4. 炒菜；5. 上菜”，并通过统一的`make()`方法调用这 5 个步骤。辣椒炒肉、番茄炒蛋等具体菜品类派生自炒菜类，按需重写不同制作步骤。该模式定义了操作算法的骨架，将部分步骤延迟到子类实现，使子类可不改变算法结构重定义特定步骤。

**示例**：

```cpp
// 模板方法模式示例
class AbstractClass {
public:
    void templateMethod() {
        step1();
        step2();
        step3();
    }
protected:
    virtual void step1() = 0;
    virtual void step2() = 0;
    virtual void step3() = 0;
};

class ConcreteClass : public AbstractClass {
protected:
    void step1() override { std::cout << "Step 1" << std::endl; }
    void step2() override { std::cout << "Step 2" << std::endl; }
    void step3() override { std::cout << "Step 3" << std::endl; }
};
```

## 总结

### 设计模式分类概览

| 类型       | 关注点         | 主要模式                                             |
| ---------- | -------------- | ---------------------------------------------------- |
| **创建型** | 对象创建       | 工厂、建造者、单例、原型                             |
| **结构型** | 类和对象组合   | 适配器、桥接、组合、装饰器、外观、享元、代理         |
| **行为型** | 对象间职责分配 | 责任链、命令、迭代器、观察者、策略、状态、模板方法等 |

### 选择指导原则

1. **创建型模式**：简单创建 → 工厂模式；复杂构建 → 建造者模式；唯一实例 → 单例模式
2. **结构型模式**：接口不匹配 → 适配器模式；功能扩展 → 装饰模式；简化复杂系统 → 外观模式
3. **行为型模式**：事件通知 → 观察者模式；算法切换 → 策略模式；流程定义 → 模板方法模式

### 最佳实践

- **不要过度设计**：只在需要时应用设计模式
- **理解问题本质**：选择最适合的模式解决具体问题
- **保持简洁**：优先考虑代码的可读性和可维护性

> **记住**：设计模式是工具，不是目标。好的设计是为了解决实际问题，而不是炫技。
