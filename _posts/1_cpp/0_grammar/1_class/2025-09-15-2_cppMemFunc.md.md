---
layout: post
title: （三）C++对象内存模型那些事儿：特殊成员函数
categories: C++
related_posts: True
tags: class
toc:
  sidebar: right
---

## （三）C++对象内存模型那些事儿：特殊成员函数

### 0. 引言：特殊成员函数概述

C++编译器会自动为类生成一些特殊成员函数，以支持对象的初始化、拷贝、移动和销毁等基本操作。这些函数被称为"特殊成员函数"，它们的生成遵循特定的规则：

- 用户定义了某个特殊成员函数，编译器就不会生成该函数的默认版本
- 即使用户未定义，在某些条件下编译器也不会自动生成

C++中的特殊成员函数包括：

1. **默认构造函数**：`T()`
2. **析构函数**：`~T()`
3. **拷贝构造函数**：`T(const T& other)`
4. **拷贝赋值运算符**：`T& operator=(const T& other)`
5. **移动构造函数（C++11）**：`T(T&& other)`
6. **移动赋值运算符（C++11）**：`T& operator=(T&& other)`

以下是一个包含所有特殊成员函数的完整示例：

```cpp
#include <iostream>
#include <utility>

class Resource {
private:
    int* data;
    size_t size;

public:
    // 默认构造函数
    Resource() : data(nullptr), size(0) {
        std::cout << "Default constructor called" << std::endl;
    }

    // 带参数的构造函数
    explicit Resource(size_t n) : size(n) {
        data = new int[size];
        std::cout << "Parameterized constructor called" << std::endl;
    }

    // 析构函数
    ~Resource() {
        delete[] data;
        std::cout << "Destructor called" << std::endl;
    }

    // 拷贝构造函数
    Resource(const Resource& other) : size(other.size) {
        data = new int[size];
        std::copy(other.data, other.data + size, data);
        std::cout << "Copy constructor called" << std::endl;
    }

    // 拷贝赋值运算符
    Resource& operator=(const Resource& other) {
        if (this != &other) {  // 自赋值检查
            delete[] data;     // 释放原有资源
            size = other.size;
            data = new int[size];
            std::copy(other.data, other.data + size, data);
        }
        std::cout << "Copy assignment called" << std::endl;
        return *this;
    }

    // 移动构造函数
    Resource(Resource&& other) noexcept
        : data(other.data), size(other.size) {
        other.data = nullptr;  // 转移资源所有权
        other.size = 0;
        std::cout << "Move constructor called" << std::endl;
    }

    // 移动赋值运算符
    Resource& operator=(Resource&& other) noexcept {
        if (this != &other) {
            delete[] data;     // 释放原有资源
            data = other.data; // 转移资源所有权
            size = other.size;
            other.data = nullptr;
            other.size = 0;
        }
        std::cout << "Move assignment called" << std::endl;
        return *this;
    }

    // 辅助函数
    size_t getSize() const { return size; }
};
```

### 1. 构造函数机制

#### 1.1 默认构造函数的生成规则

编译器在以下情况下**不会**生成默认构造函数：

```cpp
#include <iostream>

// 1. 成员对象没有默认构造函数
class NoDefaultCtor {
public:
    explicit NoDefaultCtor(int x) : value(x) {}
private:
    int value;
};

// 2. 基类没有默认构造函数
class BaseWithParam {
public:
    explicit BaseWithParam(int x) : baseValue(x) {}
private:
    int baseValue;
};

// 3. 含有const或引用成员
class SpecialMembers {
private:
    NoDefaultCtor member;        // 1. 成员没有默认构造函数
    const int constValue;        // 3. const成员
    int& refValue;               // 3. 引用成员

public:
    // 必须提供构造函数，编译器无法生成默认构造函数
    SpecialMembers(int x, int& ref)
        : member(x), constValue(42), refValue(ref) {}
};

class DerivedClass : public BaseWithParam {
public:
    // 2. 基类没有默认构造函数，必须显式调用基类构造函数
    DerivedClass(int x) : BaseWithParam(x) {}
};

// 4. 显式删除默认构造函数
class DeletedDefault {
public:
    DeletedDefault() = delete;
    explicit DeletedDefault(int x) : value(x) {}
private:
    int value;
};

// 5. 私有默认构造函数
class PrivateDefault {
private:
    PrivateDefault() = default;  // 外部无法访问
public:
    static PrivateDefault create() { return PrivateDefault(); }
};
```

**简单总结**：当基类或成员变量无法进行默认初始化时，编译器就无法生成合法的默认构造函数。

#### 1.2 对象构造顺序与虚函数表的变化

```cpp
C cObj;
    C::C()
        B::B()
            A::A()
                vptr = A::vftable;
                cout << "A::A()" << endl;
            // done A ctor
            vptr = B::vftable;
            cout << "B::B()" << endl;
        // done B ctor
        vptr = C::vftable;
        m_c = 11;
        cout << "C::C()" << endl;
    // done C ctor
```

在上述代码中，`C`类继承自`B`类，`B`类又继承自`A`类。当创建`C`类对象`cObj`时，构造顺序如下：

1. 首先调用`A`类的构造函数。在`A`类构造函数执行时，对象的虚函数表指针指向`A`类的虚函数表。此时如果调用虚函数`print`，会调用`A`类版本的`print`函数。这是因为在父类构造期间，对象的虚函数表指针指向的是父类的虚函数表。
2. 接着调用`B`类的构造函数。此时虚函数表指针更新为指向`B`类的虚函数表，但由于在`B`类构造函数执行前，`A`类构造函数已经执行完毕，所以在`A`类构造函数里调用虚函数时，依然调用的是`A`类版本的虚函数。
3. 最后调用`C`类的构造函数，对`C`类特有的成员变量`m_c`进行初始化。

综上所述，在继承体系中，对象的构造是从基类开始，逐步向派生类进行的，并且在构造过程中虚函数表指针会根据当前正在构造的类进行相应更新，这对于理解多态在构造函数中的行为非常关键。

因此，在父类构造函数里调用虚函数时，还是调用父类版本的虚函数。

```cpp
#include <iostream>

class A {
public:
    A() {
        vptr = &A_vtable;  // 设置A的虚函数表指针
        std::cout << "A constructor" << std::endl;
        print();  // 调用A::print()
    }
    virtual void print() { std::cout << "A::print()" << std::endl; }
    virtual ~A() = default;
};

class B : public A {
public:
    B() {
        vptr = &B_vtable;  // 更新为B的虚函数表指针
        std::cout << "B constructor" << std::endl;
        print();  // 调用B::print()
    }
    void print() override { std::cout << "B::print()" << std::endl; }
};

class C : public B {
private:
    int m_c;
public:
    C() {
        vptr = &C_vtable;  // 更新为C的虚函数表指针
        m_c = 11;
        std::cout << "C constructor" << std::endl;
        print();  // 调用C::print()
    }
    void print() override { std::cout << "C::print()" << std::endl; }
};

// 使用示例
int main() {
    C obj;  // 输出：A constructor -> A::print() -> B constructor -> B::print() -> C constructor -> C::print()
    return 0;
}
```

**构造过程分析**：

1. **A 构造阶段**：vptr 指向 A 的虚函数表，调用虚函数时执行 A 版本
2. **B 构造阶段**：vptr 更新为 B 的虚函数表，调用虚函数时执行 B 版本
3. **C 构造阶段**：vptr 最终指向 C 的虚函数表，调用虚函数时执行 C 版本

**关键点**：在父类构造函数中调用虚函数时，执行的是当前正在构造的类的版本，而非最终派生类的版本。这是为了安全考虑，因为派生类部分尚未构造完成。

### 2. 析构函数机制

#### 2.1 合成析构函数的行为

```cpp
#include <iostream>

class Member {
public:
    ~Member() { std::cout << "Member destructor" << std::endl; }
};

class Base {
public:
    virtual ~Base() { std::cout << "Base destructor" << std::endl; }
};

class Derived : public Base {
private:
    Member member1;
    Member member2;

public:
    // 编译器生成的析构函数等价于：
    ~Derived() {
        // 1. 用户代码（如果有）
        std::cout << "Derived destructor" << std::endl;

        // 2. 按声明的逆序析构成员变量
        // member2.~Member();  // 后声明的先析构
        // member1.~Member();

        // 3. 调用基类析构函数
        // Base::~Base();
    }
};

int main() {
    {
        Derived obj;
    }  // 析构顺序：Derived -> member2 -> member1 -> Base
    return 0;
}
```

#### 2.2 虚析构函数的重要性

```cpp
#include <iostream>
#include <memory>

class Base {
public:
    virtual ~Base() {  // 虚析构函数确保正确的多态析构
        std::cout << "Base destructor" << std::endl;
    }
};

class Derived : public Base {
private:
    int* data;

public:
    Derived() : data(new int[100]) {
        std::cout << "Derived constructor" << std::endl;
    }

    ~Derived() override {
        delete[] data;
        std::cout << "Derived destructor" << std::endl;
    }
};

void polymorphicDestruction() {
    Base* ptr = new Derived();
    delete ptr;  // 正确调用：Derived析构 -> Base析构

    // 如果Base的析构函数不是虚函数，只会调用Base析构函数
    // 导致Derived的资源泄露
}

int main() {
    polymorphicDestruction();
    return 0;
}
```

### 3. 拷贝构造函数

#### 3.1 拷贝构造函数的生成条件

不会生成默认拷贝构造函数的条件：

1. **显式声明或删除**：若在类中显式声明了拷贝构造函数，或者将拷贝构造函数声明为`delete`，编译器将不会生成默认的拷贝构造函数。
2. **成员或基类问题**：当类成员变量或基类包含没有拷贝构造函数的成员对象时，编译器无法生成默认拷贝构造函数。因为在拷贝时，需要对所有成员进行拷贝，若存在无法拷贝的成员，就无法完成默认拷贝构造。
3. **特殊成员类型**：如果类中含有`const`或`引用`类型的成员，编译器也不会生成默认拷贝构造函数。因为`const`成员一旦初始化后值不能改变，引用必须在初始化时绑定到特定对象，这两种情况都不适合默认的拷贝构造方式。

简单概括，若没有显式定义拷贝函数，且类中的所有成员都支持拷贝操作，编译器会为类生成默认拷贝构造函数。反之，若类中存在无法拷贝的成员，如`std::unique_ptr`类型成员，或定义了删除拷贝构造函数的类型成员，或有`const`和`引用`类型成员变量，编译器就不会生成。

```cpp
#include <iostream>

// 编译器会生成默认拷贝构造函数的情况
class SimpleCopyable {
private:
    int value;
    double data;

public:
    SimpleCopyable(int v, double d) : value(v), data(d) {}
    // 编译器自动生成：SimpleCopyable(const SimpleCopyable& other) = default;
};

// 编译器不会生成默认拷贝构造函数的情况
class NonCopyable {
private:
    std::unique_ptr<int> ptr;  // unique_ptr不可拷贝
    const int constValue;      // const成员
    int& refValue;             // 引用成员

public:
    NonCopyable(int& ref) : ptr(std::make_unique<int>(42)), constValue(100), refValue(ref) {}

    // 必须显式定义或删除拷贝构造函数
    NonCopyable(const NonCopyable&) = delete;
};
```

#### 3.2 拷贝构造函数的调用场景

```cpp
#include <iostream>

class Trackable {
public:
    Trackable() { std::cout << "Default constructor" << std::endl; }
    Trackable(const Trackable&) { std::cout << "Copy constructor" << std::endl; }
    ~Trackable() { std::cout << "Destructor" << std::endl; }
};

Trackable createObject() {
    Trackable local;
    return local;  // 可能触发拷贝构造（取决于编译器优化）
}

void processObject(Trackable obj) {  // 参数传递时调用拷贝构造
    // 函数体
}

int main() {
    std::cout << "=== 直接初始化 ===" << std::endl;
    Trackable obj1;

    std::cout << "=== 拷贝初始化 ===" << std::endl;
    Trackable obj2 = obj1;  // 调用拷贝构造函数

    std::cout << "=== 函数参数传递 ===" << std::endl;
    processObject(obj1);    // 调用拷贝构造函数

    std::cout << "=== 函数返回值 ===" << std::endl;
    Trackable obj3 = createObject();  // 可能调用拷贝构造函数

    return 0;
}
```

##### 拷贝构造函数的特殊行为

- **逐位拷贝构造（浅拷贝）**：当满足以下所有条件时，编译器生成的拷贝构造函数会进行逐位拷贝，这种方式有时也被视为一种特殊的浅拷贝：

  - 类没有用户自定义的拷贝构造函数。
  - 类没有虚函数。
  - 类没有基类，或者基类没有自定义的拷贝构造函数。
  - 类的所有非静态数据成员都支持逐位拷贝。在此情况下，拷贝行为类似于`memset()`，直接按位复制数据，不会调用通常意义上的拷贝构造函数，所以有些资料会说此过程不调用拷贝构造函数。

- **一般拷贝构造（深拷贝或复杂拷贝）**：
  - **成员拷贝**：对于能够逐位拷贝的成员，进行逐位拷贝。
  - **虚函数指针处理**：类的虚函数指针不会被覆盖，以保证多态性的正确实现。
  - **继承体系拷贝**：先调用父类的拷贝构造函数，再调用子类自身的拷贝构造函数，确保继承体系中各级对象都被正确拷贝。

#### 3.3 为什么使用 const 引用参数

```cpp
// 错误的拷贝构造函数声明
class Wrong {
public:
    Wrong(Wrong other);  // 会导致无限递归！
    // 调用此构造函数需要先拷贝参数other，又会调用拷贝构造函数...
};

// 正确的拷贝构造函数声明
class Correct {
public:
    Correct(const Correct& other);  // const引用避免递归，提高效率

    // const引用的优势：
    // 1. 无性能开销（不需要拷贝参数）
    // 2. 避免无限递归
    // 3. 可以接受临时对象
    // 4. 可以接受const对象
};
```

### 4. 移动语义与移动构造函数

#### 4.1 移动构造函数的生成条件

编译器在以下条件**全部满足**时才会生成移动构造函数：

- 没有用户定义的拷贝构造函数
- 没有用户定义的拷贝赋值运算符
- 没有用户定义的析构函数
- 没有用户定义的移动赋值运算符
- 所有成员都可移动

```cpp
#include <iostream>
#include <memory>

// 编译器会生成移动构造函数
class AutoMovable {
private:
    std::unique_ptr<int> ptr;
    std::string name;

public:
    AutoMovable(int value, const std::string& n)
        : ptr(std::make_unique<int>(value)), name(n) {}

    // 编译器自动生成移动构造函数和移动赋值运算符
    // AutoMovable(AutoMovable&&) = default;
    // AutoMovable& operator=(AutoMovable&&) = default;
};

// 编译器不会生成移动构造函数（因为定义了析构函数）
class ManualMovable {
private:
    int* data;
    size_t size;

public:
    explicit ManualMovable(size_t n) : size(n), data(new int[size]) {}

    // 定义了析构函数，编译器不会生成移动构造函数
    ~ManualMovable() { delete[] data; }

    // 需要手动定义移动构造函数
    ManualMovable(ManualMovable&& other) noexcept
        : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
    }

    ManualMovable& operator=(ManualMovable&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            size = other.size;
            other.data = nullptr;
            other.size = 0;
        }
        return *this;
    }
};
```

#### 4.2 移动语义的本质

```cpp
#include <iostream>
#include <vector>

class ResourceHolder {
private:
    std::vector<int> data;
    std::string name;

public:
    ResourceHolder(const std::string& n) : name(n) {
        data.resize(1000000);  // 大量数据
        std::cout << "Constructor: " << name << std::endl;
    }

    // 拷贝构造：复制资源（开销大）
    ResourceHolder(const ResourceHolder& other)
        : data(other.data), name(other.name + "_copy") {
        std::cout << "Copy constructor: " << name << std::endl;
    }

    // 移动构造：转移资源所有权（开销小）
    ResourceHolder(ResourceHolder&& other) noexcept
        : data(std::move(other.data)), name(std::move(other.name)) {
        name += "_moved";
        std::cout << "Move constructor: " << name << std::endl;
    }

    const std::string& getName() const { return name; }
};

ResourceHolder createResource() {
    return ResourceHolder("temp");  // 返回时可能触发移动构造
}

int main() {
    std::cout << "=== 移动构造示例 ===" << std::endl;
    ResourceHolder res1 = createResource();

    std::cout << "=== 拷贝vs移动对比 ===" << std::endl;
    ResourceHolder res2 = res1;                    // 拷贝构造
    ResourceHolder res3 = std::move(res1);         // 移动构造

    std::cout << "res2: " << res2.getName() << std::endl;
    std::cout << "res3: " << res3.getName() << std::endl;

    return 0;
}
```

#### 4.3 为什么移动操作使用 noexcept

```cpp
#include <vector>
#include <iostream>

class ThrowingMove {
public:
    ThrowingMove() = default;

    // 移动构造函数可能抛异常
    ThrowingMove(ThrowingMove&& other) {
        // 可能抛出异常的操作
        if (/* 某些条件 */ false) {
            throw std::runtime_error("Move failed");
        }
    }
};

class NoThrowMove {
public:
    NoThrowMove() = default;

    // 移动构造函数保证不抛异常
    NoThrowMove(NoThrowMove&& other) noexcept {
        // 安全的移动操作，不会抛异常
    }
};

void demonstrateVectorBehavior() {
    std::vector<ThrowingMove> vec1;
    vec1.reserve(2);
    vec1.emplace_back();
    vec1.emplace_back();

    // 容量不足时扩容：由于移动构造函数可能抛异常，
    // vector会选择拷贝而非移动来保证异常安全
    vec1.emplace_back();  // 使用拷贝构造函数

    std::vector<NoThrowMove> vec2;
    vec2.reserve(2);
    vec2.emplace_back();
    vec2.emplace_back();

    // 容量不足时扩容：由于移动构造函数标记为noexcept，
    // vector会选择移动来提高性能
    vec2.emplace_back();  // 使用移动构造函数
}
```

#### 4.2 怎么理解移动构造函数？

移动构造函数的核心意义在于实现对象资源所有权的转移。它在语义层面与传统的拷贝操作有着本质区别，其重点并非在于优化性能，尽管在某些场景下可能带来性能提升。

从性能角度看，移动构造函数的开销往往与浅拷贝相近。有一种常见误解，认为移动构造函数依赖于编译器的特殊实现，能够像返回值优化（RVO）那样，完全避免开辟新的内存空间，仅通过更改所有权来完成操作。然而实际情况是，对于自定义类型，在移动过程中通常仍需先开辟空间，之后才对资源所有权进行处理。

以包含纯粹基本类型数据的自定义类型为例，其拷贝操作与移动操作在开销上几乎没有差异。这是因为基本类型数据的拷贝本身就较为高效，不存在复杂的资源管理问题，所以移动构造函数在此场景下无法体现出显著的性能优势。

因此，理解移动构造函数时，不应单纯从性能优化的角度出发，而要着重把握其语义，即实现资源所有权从一个对象到另一个对象的转移。这种语义上的改变，在处理动态资源（如动态分配的内存、文件句柄等）时，能够有效避免不必要的资源复制，从而在某些情况下提升程序的整体效率，并简化资源管理流程。例如，当一个对象持有动态分配的内存，在移动构造过程中，该内存的所有权直接转移到新对象，原对象不再拥有对这块内存的控制权，避免了重复的内存分配与释放操作，同时确保了资源的正确管理，防止内存泄漏等问题的发生。

#### 4.3 为什么移动的构造赋值用 noexcept，但是拷贝的没有？

在 C++中，移动构造和移动赋值通常使用`noexcept`关键字进行修饰，而拷贝操作则不然，这主要基于以下几方面原因：

**移动操作的特性**：移动操作的本质通常是转移资源指针，这一过程一般不会抛出异常。例如，`std::vector`的移动构造函数就保证了`noexcept`。由于移动操作相对简单且稳定，声明`noexcept`能够让编译器针对此类操作进行优化。以`std::vector`为例，在空间不足时，编译器会优先选择移动元素而非拷贝元素，因为移动操作不抛出异常，编译器可以更高效地进行优化处理，从而提升程序性能。

**拷贝操作的特性**：拷贝操作往往涉及堆资源的分配，比如使用`new`关键字进行内存分配。在这个过程中，可能会因为内存不足等原因抛出异常。所以，拷贝操作不能简单地标记为`noexcept`，否则一旦出现异常，程序将面临未定义行为的风险。

**标准库的约束**：C++标准对容器的操作有明确要求，如果移动构造函数未标记为`noexcept`，像`std::vector`这样的容器在扩容时会退化为拷贝操作。这意味着原本可以通过移动操作实现的高效资源转移将无法实现，从而丧失移动优化带来的性能优势。

综上所述，由于移动操作和拷贝操作本身的特性差异，以及 C++标准库的相关约束，使得移动构造和移动赋值使用`noexcept`，而拷贝操作不使用该关键字。

### 5. 成员初始化列表

#### 5.1 必须使用初始化列表的场景

```cpp
#include <iostream>

class RequiredInitList {
private:
    const int constMember;           // 1. const成员
    int& refMember;                  // 2. 引用成员
    std::string stringMember;        // 3. 有参构造函数的类成员

public:
    // 必须使用初始化列表
    RequiredInitList(int value, int& ref, const std::string& str)
        : constMember(value)         // const成员必须初始化
        , refMember(ref)             // 引用成员必须初始化
        , stringMember(str)          // 避免默认构造+赋值的开销
    {
        // 构造函数体：所有成员已经初始化完成
        std::cout << "Constructor body executed" << std::endl;
    }
};

class BaseWithParam {
public:
    explicit BaseWithParam(int x) : value(x) {}
private:
    int value;
};

class DerivedClass : public BaseWithParam {
public:
    // 4. 基类需要参数时必须在初始化列表中调用
    DerivedClass(int baseValue, int derivedValue)
        : BaseWithParam(baseValue)   // 必须显式调用基类构造函数
        , derivedMember(derivedValue)
    {}

private:
    int derivedMember;
};
```

在 C++中，对象的成员变量在进入构造函数体之前就会进行初始化。这是因为若成员变量未初始化，在构造函数内使用中会引发错误。而初始化列表就是一种介入并控制这种初始化行为的有效方式。具体在以下几种情况下必须使用初始化列表：

1. **成员变量为引用类型**：引用在创建时就必须绑定到一个已存在的对象，无法在构造函数体中进行赋值操作。因此，需要通过初始化列表在构造时完成绑定。例如上述代码中`Derived`类的`ref`成员变量。
2. **成员变量为`const`类型**：`const`成员变量一旦初始化后其值就不能改变，所以必须在初始化阶段就赋予其初始值，只能通过初始化列表来实现。如`Derived`类中的`constMember`成员变量。
3. **类继承自带有参数构造函数的基类**：当派生类继承自一个基类，且基类的构造函数带有参数时，派生类必须在初始化列表中调用基类的构造函数，并传递相应参数，以确保基类部分能正确初始化。就像`Derived`类对`Base`类的继承关系。
4. **成员变量为类类型且该类构造函数有参数**：如果类中包含其他类类型的成员变量，并且该成员变量所属类的构造函数需要参数，那么就需要在初始化列表中为其传递参数来完成初始化。例如`Derived`类中的`AnotherClass`类型成员变量`another`。

若在上述情况下不使用初始化列表，代码将无法通过编译。因此，也不需要一一记忆。只需要大致理解即可。

#### 5.2 初始化列表的优势与执行顺序

初始化列表在 C++编程中具有显著优势，主要体现在提升程序运行效率方面，尤其对于类类型的数据，效果更为明显，而对于内置类型，效率提升相对不显著。

- **类类型与内置类型的效率差异**：

  - **类类型**：将类类型的成员变量放在初始化列表中初始化，效率提升较为明显。这是因为若不在初始化列表中进行初始化，在进入当前类的构造函数之前，会先通过默认构造函数创建类类型成员变量的临时对象，在构造函数体中可能还会涉及类似拷贝构造或赋值的操作，最后临时对象析构，这一系列过程产生了较大的开销。例如，若有一个自定义类`MyClass`，其构造函数有参数，若不在初始化列表中初始化，会先默认构造一个临时对象，然后在构造函数体中再对其进行赋值操作，而临时对象的创建和析构都需要额外的时间和资源。
  - **内置类型**：对于内置类型，使用初始化列表和在构造函数体内初始化的效率基本一致。因为内置类型的初始化相对简单，通常只是进行简单的赋值操作，不存在复杂的构造和析构过程。

- **初始化列表的执行特点**：
  - **执行位置**：初始化列表中的代码实际上是由编译器安插在构造函数之中的，并且在构造函数的函数体代码执行之前就会被执行。这意味着在构造函数体开始执行时，所有成员变量已经通过初始化列表完成了初始化，构造函数体中可以直接使用这些已初始化的成员变量。
  - **初始化顺序**：初始化列表中成员变量的初始化顺序取决于它们在类中定义的顺序，而非在初始化列表中出现的顺序。特别地，对于类类型的成员变量，在进入构造函数体前，会先调用其默认构造函数进行初始化（若不在初始化列表中显式指定构造方式）。例如：

```cpp
#include <iostream>

class ExpensiveClass {
public:
    ExpensiveClass() {
        std::cout << "ExpensiveClass default constructor" << std::endl;
    }

    ExpensiveClass(int value) {
        std::cout << "ExpensiveClass parameterized constructor: " << value << std::endl;
    }

    ExpensiveClass(const ExpensiveClass& other) {
        std::cout << "ExpensiveClass copy constructor" << std::endl;
    }

    ExpensiveClass& operator=(const ExpensiveClass& other) {
        std::cout << "ExpensiveClass assignment operator" << std::endl;
        return *this;
    }
};

class InitializationDemo {
private:
    int member1;
    ExpensiveClass member2;  // 注意：声明顺序决定初始化顺序
    int member3;

public:
    // 推荐：使用初始化列表
    InitializationDemo(int a, int b, int c)
        : member3(c)        // 尽管在初始化列表中写在前面
        , member1(a)        // 但实际初始化顺序仍按声明顺序
        , member2(b)        // 直接调用带参构造函数
    {
        std::cout << "Constructor body" << stdendl;
    }

    // 不推荐：在构造函数体中赋值
    /*
    InitializationDemo(int a, int b, int c) {
        // member2首先被默认构造，然后赋值
        // 这样会调用默认构造函数 + 赋值运算符，效率低
        member1 = a;
        member2 = ExpensiveClass(b);  // 创建临时对象并赋值
        member3 = c;
    }
    */
};

int main() {
    std::cout << "=== 使用初始化列表 ===" << std::endl;
    InitializationDemo obj(1, 42, 3);

    // 输出顺序（按声明顺序）：
    // ExpensiveClass parameterized constructor: 42
    // Constructor body

    return 0;
}
```

### 6. 成员函数调用机制

#### 6.1 非静态成员函数的调用

**非静态成员函数**：非静态成员函数依赖于对象实例进行调用。C++ 确保非静态成员函数的调用效率至少与普通函数相当，为此编译器会对其进行一系列转换：

1. **插入 `this` 指针参数**：编译器将非静态成员函数改写为普通函数形式，并插入一个额外参数，即 `this` 指针。`this` 指针指向调用该成员函数的对象实例，为访问对象的成员变量和其他成员函数提供通道。例如，对于类 `MyClass` 中的非静态成员函数 `void func()`，编译器可能将其改写为 `void func(MyClass* this)`。
2. **通过 `this` 指针访问成员**：在改写后的函数里，所有对非静态成员变量和成员函数的访问操作，都调整为通过 `this` 指针来实现。比如，原函数中访问成员变量 `data`，会被改写为 `this->data`。
3. **生成唯一外部函数名**：编译器会把成员函数转变为外部函数，并为其生成独一无二的名称，防止与其他函数重名。这个独特名称一般包含类名与成员函数名相关信息。例如，类 `MyClass` 中的 `func` 函数，可能被命名为 `MyClass_func`。

```cpp
#include <iostream>

class MyClass {
private:
    int data;

public:
    MyClass(int value) : data(value) {}

    // 非静态成员函数
    void memberFunction(int param) {
        data += param;  // 实际上是 this->data += param;
        std::cout << "Member function called, data = " << data << std::endl;
    }

    // 静态成员函数
    static void staticFunction(int param) {
        // 没有this指针，无法访问非静态成员
        std::cout << "Static function called with param = " << param << std::endl;
    }
};

// 编译器将成员函数转换为类似这样的形式：
void MyClass_memberFunction(MyClass* this, int param) {
    this->data += param;
    std::cout << "Member function called, data = " << this->data << std::endl;
}

int main() {
    MyClass obj(10);

    // 成员函数调用
    obj.memberFunction(5);  // 编译器转换为 MyClass_memberFunction(&obj, 5);

    // 静态函数调用
    MyClass::staticFunction(20);  // 直接调用，无需对象实例

    return 0;
}
```

#### 6.2 虚函数的调用机制

虚函数成员函数的调用机制与非静态成员函数有所不同，它主要用于实现多态性。当通过基类指针或引用调用虚函数时，实际调用的函数版本取决于指针或引用所指向对象的实际类型，而非指针或引用本身的类型。

这一过程依赖于虚函数表（vtable）和虚函数表指针（vptr）。每个包含虚函数的类都有一个虚函数表，表中存储着该类虚函数的地址。对象中则包含一个虚函数表指针，指向所属类的虚函数表。

在运行时，当通过基类指针或引用调用虚函数时，程序首先根据对象的虚函数表指针找到对应的虚函数表，然后在表中查找并调用实际对象类型对应的虚函数版本。例如：

```cpp
#include <iostream>

class Base {
public:
    virtual void virtualFunc() {
        std::cout << "Base::virtualFunc()" << std::endl;
    }

    void normalFunc() {
        std::cout << "Base::normalFunc()" << std::endl;
    }

    virtual ~Base() = default;
};

class Derived : public Base {
public:
    void virtualFunc() override {
        std::cout << "Derived::virtualFunc()" << std::endl;
    }

    void normalFunc() {  // 这不是重写，而是隐藏
        std::cout << "Derived::normalFunc()" << std::endl;
    }
};

void demonstrateVirtualCall(Base& obj) {
    // 虚函数调用：运行时确定调用哪个版本
    obj.virtualFunc();  // 根据对象实际类型调用相应版本

    // 普通函数调用：编译时确定
    obj.normalFunc();   // 总是调用Base::normalFunc()
}

int main() {
    Derived derivedObj;

    std::cout << "=== 直接调用 ===" << std::endl;
    derivedObj.virtualFunc();  // Derived::virtualFunc()
    derivedObj.normalFunc();   // Derived::normalFunc()

    std::cout << "=== 通过基类引用调用 ===" << std::endl;
    demonstrateVirtualCall(derivedObj);
    // 输出：
    // Derived::virtualFunc() （动态绑定）
    // Base::normalFunc()     （静态绑定）

    return 0;
}
```

### 7. quiz

#### 1. 虚析构函数的必要性

在 C++的多态机制里，通过基类指针操作对象时，该指针实际可能指向某个派生类对象。例如：

```c++
Base* ptr = new Derived();
delete ptr;
```

在此情况下，如果基类的析构函数未声明为`virtual`，当执行`delete ptr`时，只会调用基类的析构函数，派生类的析构函数不会被调用。这是因为在非虚析构函数的情况下，编译器依据指针类型（即基类类型）来确定调用的析构函数。而派生类在构造函数中可能分配了一些资源，若其析构函数未被调用，这些资源将无法在析构时得到正确释放，进而引发资源泄漏问题。

值得留意的是，C++中派生类的析构函数在执行完毕后会隐式调用其父类的析构函数。这表明父类资源一般由父类自身的析构函数负责清理，子类通常无需直接管理父类资源。但在多态场景下，前提是基类析构函数必须声明为`virtual`，如此才能保证在销毁对象层次结构时，每个类的析构函数都能被正确调用。

这里简单回顾一下构造和析构的顺序：创建对象时，先调用父类构造函数，再调用子类构造函数；销毁对象时，顺序则相反，先调用子类析构函数，再调用父类析构函数。在对象拷贝时，同样先执行父类的拷贝操作，再执行子类的拷贝操作。即构造和析构顺序为：父构 - 子构 - 子析 - 父析；拷贝顺序为：父拷 - 子拷。

- 如果基类和子类没有指针的成员对象，且析构函数都没有特殊操作，当通过基类指针删除派生类对象的时候，会有内存问题吗？

```c++
class Base {
public:
    ~Base() {}  // 无特殊操作
};

class Derived : public Base {
private:
    std::string name;  // 非指针成员
public:
    ~Derived() {}  // 无特殊操作，name会自动析构
};

int main() {
    Base* ptr = new Derived();
    delete ptr;  // 仅调用Base::~Base()，但Derived::~Derived()无操作，name会被自动清理
}
```

这个name是会被清理的。

#### 2. override 关键字的重要性

在 C++中，使用`override`关键字具有重要意义，主要体现在以下几个方面：

**对开发人员而言**：

- **明确意图**：`override`关键字清晰地表明派生类中的函数是对基类虚函数的重写，显著提高了代码的可读性和可维护性。开发人员在阅读代码时，能迅速了解函数之间的重写关系，使代码意图一目了然。例如，当看到派生类函数声明中有`override`关键字，就可明确该函数是对基类虚函数的重新定义，方便理解代码逻辑。

**对编译器来说**：

- **编译器检查**：`override`关键字可让编译器对函数签名进行检查，确保其与基类中的虚函数正确匹配。若函数签名不匹配，编译器会报错，有效避免潜在错误。例如，若基类虚函数有特定参数列表，而派生类重写函数的参数列表与之不同，使用`override`关键字时编译器就能及时发现并提示错误。
- **防止意外重载**：若派生类中的函数签名与基类虚函数不匹配，编译器会将其视为新函数，而非重写函数。使用`override`关键字可防止这种意外重载情况的发生，保证代码按照预期的多态行为运行。

虽然使用`override`和不使用`override`生成的代码在运行时行为上并无差异，去掉已有代码中的所有`override`关键字也不会改变程序的运行结果，但为提升代码质量，避免潜在问题，强烈建议在重写基类虚函数时使用`override`关键字。

#### 3. 如果父类声明了虚析构，那么同样地，拷贝，移动也需要是虚的吗？

答案是不需要。

父类声明虚析构函数，主要目的是确保在多态场景下析构方法能被正确调用。以`std::vector<Animal*>`容器为例，当释放其中存储的对象资源时，如果`Animal`类（作为父类）的析构函数不是虚函数，且容器中实际存放的是派生类对象指针，那么在析构时就只能调用到父类的析构函数，派生类的析构函数不会被执行，进而无法正确释放派生类特有的资源。这是因为对于多态类型，析构操作通常在 RAII（资源获取即初始化）管理器中进行，或者在对象自身被销毁时执行。若此时对象的静态类型是基类类型，而非实际的派生类类型，就会出现资源释放不完整的问题。

然而，拷贝构造函数和移动构造函数本质上属于构造方法，在构造过程中不能使用虚函数。这是由于对象构造过程遵循特定顺序：先调用基类的构造函数，再调用派生类的构造函数。在基类构造函数执行阶段，派生类部分尚未构造完成。

具体来说，在父类构造函数执行时，虚函数指针指向的是基类虚函数表。因为子类虚函数可能依赖子类成员变量，而此时子类成员变量还未初始化，所以子类虚函数不应被调用。从安全角度考虑，父类构造时虚函数指针只能指向父类方法。只有在子类构造完成后，虚函数指针才会指向子类虚函数表。所以，即便在构造函数中调用虚函数，父类构造调用的是父类虚方法，子类构造调用的是子类虚方法，无法体现多态特性。因此，拷贝和移动构造函数不需要声明为虚函数。

#### 4. 移动操作 vs 拷贝操作的选择

```cpp
#include <iostream>

class CopyMoveDemo {
private:
    std::string data;

public:
    CopyMoveDemo(const std::string& str) : data(str) {}

    // 拷贝构造：保留原对象
    CopyMoveDemo(const CopyMoveDemo& other) : data(other.data) {
        std::cout << "Copy constructor: " << data << std::endl;
    }

    // 移动构造：转移资源
    CopyMoveDemo(CopyMoveDemo&& other) noexcept : data(std::move(other.data)) {
        std::cout << "Move constructor: " << data << std::endl;
    }

    const std::string& getData() const { return data; }
};

void demonstrateCopyVsMove() {
    CopyMoveDemo original("Hello");

    // 拷贝：original保持不变
    CopyMoveDemo copy = original;
    std::cout << "Original after copy: " << original.getData() << std::endl;
    std::cout << "Copy: " << copy.getData() << std::endl;

    // 移动：original被"掏空"
    CopyMoveDemo moved = std::move(original);
    std::cout << "Original after move: " << original.getData() << std::endl;
    std::cout << "Moved: " << moved.getData() << std::endl;
}
```

#### 5. 继承中的特殊成员函数处理

```cpp
#include <iostream>

class Base {
private:
    std::string baseName;

public:
    Base(const std::string& name) : baseName(name) {
        std::cout << "Base constructor: " << baseName << std::endl;
    }

    Base(const Base& other) : baseName(other.baseName) {
        std::cout << "Base copy constructor: " << baseName << std::endl;
    }

    Base(Base&& other) noexcept : baseName(std::move(other.baseName)) {
        std::cout << "Base move constructor: " << baseName << std::endl;
    }

    virtual ~Base() {
        std::cout << "Base destructor: " << baseName << std::endl;
    }

    Base& operator=(const Base& other) {
        if (this != &other) {
            baseName = other.baseName;
            std::cout << "Base copy assignment: " << baseName << std::endl;
        }
        return *this;
    }

    Base& operator=(Base&& other) noexcept {
        if (this != &other) {
            baseName = std::move(other.baseName);
            std::cout << "Base move assignment: " << baseName << std::endl;
        }
        return *this;
    }
};

class Derived : public Base {
private:
    std::string derivedName;

public:
    Derived(const std::string& base, const std::string& derived)
        : Base(base), derivedName(derived) {
        std::cout << "Derived constructor: " << derivedName << std::endl;
    }

    // 拷贝构造：必须显式调用基类拷贝构造
    Derived(const Derived& other)
        : Base(other), derivedName(other.derivedName) {
        std::cout << "Derived copy constructor: " << derivedName << std::endl;
    }

    // 移动构造：必须显式调用基类移动构造
    Derived(Derived&& other) noexcept
        : Base(std::move(other)), derivedName(std::move(other.derivedName)) {
        std::cout << "Derived move constructor: " << derivedName << std::endl;
    }

    ~Derived() override {
        std::cout << "Derived destructor: " << derivedName << std::endl;
    }

    // 拷贝赋值：必须调用基类拷贝赋值
    Derived& operator=(const Derived& other) {
        if (this != &other) {
            Base::operator=(other);  // 调用基类拷贝赋值
            derivedName = other.derivedName;
            std::cout << "Derived copy assignment: " << derivedName << std::endl;
        }
        return *this;
    }

    // 移动赋值：必须调用基类移动赋值
    Derived& operator=(Derived&& other) noexcept {
        if (this != &other) {
            Base::operator=(std::move(other));  // 调用基类移动赋值
            derivedName = std::move(other.derivedName);
            std::cout << "Derived move assignment: " << derivedName << std::endl;
        }
        return *this;
    }
};
```

#### 6. 构造/析构异常处理

这个问题的考量在于一旦构造函数抛出异常，对象的创建就会失败，它的析构函数不会被调用。而析构函数不调用就会有潜在的内存泄露风险。

面对这种问题，一般得这么做：（1）构造函数内部捕获异常，如果异常就 delete 资源。如果有多个资源，实现哪些资源需要 delete 的时候，会比较麻烦。（2）智能指针管理资源。因为智能指针对于这个类来说，是栈上的资源。栈上的资源即使抛出异常也会正常释放。这个时候资源的管理是安全的。

当构造函数中使用 `new` 操作符分配内存时，如果分配成功，资源会被分配给指针变量。如果在构造函数的某个 `new` 操作之后抛出异常，构造函数会立即退出，且不会调用析构函数，因为对象还没有完全构造出来。

然而，已经成功构造的成员变量会被自动销毁，这意味着它们的析构函数会被调用，从而释放已经分配的资源。可如果成员变量是堆上的资源，则会出现资源泄露问题。因此最好是使用智能指针去管理。

类的析构函数也是类似的。

```cpp
#include <iostream>
#include <memory>
#include <stdexcept>

// 问题示例：构造函数中的原始指针
class ProblematicClass {
private:
    int* ptr1;
    int* ptr2;

public:
    ProblematicClass() {
        ptr1 = new int(42);

        // 如果这里抛出异常，ptr1会泄露！
        if (/* 某些条件 */ false) {
            throw std::runtime_error("Construction failed");
        }

        ptr2 = new int(24);
    }

    ~ProblematicClass() {
        delete ptr1;
        delete ptr2;
    }
};

// 推荐方案1：智能指针
class SafeClass {
private:
    std::unique_ptr<int> ptr1;
    std::unique_ptr<int> ptr2;

public:
    SafeClass()
        : ptr1(std::make_unique<int>(42))
        , ptr2(std::make_unique<int>(24))
    {
        // 即使这里抛出异常，智能指针也会自动清理
        if (/* 某些条件 */ false) {
            throw std::runtime_error("Construction failed");
        }
    }

    // 无需显式析构函数，智能指针自动管理内存
};

// 推荐方案2：RAII包装
class RAIIClass {
private:
    int* ptr1;
    int* ptr2;

public:
    RAIIClass() : ptr1(nullptr), ptr2(nullptr) {
        try {
            ptr1 = new int(42);

            if (/* 某些条件 */ false) {
                throw std::runtime_error("Construction failed");
            }

            ptr2 = new int(24);
        } catch (...) {
            // 异常处理：清理已分配的资源
            delete ptr1;
            delete ptr2;
            throw;  // 重新抛出异常
        }
    }

    ~RAIIClass() {
        delete ptr1;
        delete ptr2;
    }
};
```

#### 7. 成员函数模板可以为虚函数吗？

成员函数模板不能成为虚函数。原因在于，若允许成员函数模板为虚函数，每次以不同的模板类型调用该虚函数模板时，都会生成一个新的虚函数实例。这将使得虚函数表的内容无法在编译阶段确定，而只能在程序链接阶段才能明确。

虚函数表在 C++ 中起着关键作用，它存储了类的虚函数地址。正常情况下，虚函数表的内容在编译阶段就已确定，以便在运行时能够高效地进行虚函数调用。然而，若虚函数表的内容需在链接阶段确定，链接器就需要重新解析和调整所有涉及虚函数调用的代码。这无疑会极大地增加链接器的复杂性和工作量，对程序的构建过程产生不利影响。所以，基于这种机制和实际操作的考量，成员函数模板不能被定义为虚函数。

#### 8. 为什么拷贝赋值、移动赋值要判断`this`指针不相同？

在拷贝赋值操作中，如果不先判断`this`指针与传入对象的指针是否相同，而是直接先释放自身资源再进行拷贝，就可能出现严重问题。例如，当进行自赋值（即`this`指针与传入对象指针相同）时，释放自身资源后，就无法从传入对象（此时自身已被释放）拷贝数据，从而导致程序出错。

对于移动赋值操作同样如此。若不判断`this`指针与传入对象指针是否相同，直接窃取传入对象的资源，在自赋值情况下，会出现“自己释放自己资源”的错误。比如执行`data = other.data; other.data = nullptr;`语句时，如果是自赋值，`data`会被错误地置空。所以，在拷贝赋值和移动赋值操作中，判断`this`指针是否相同是非常必要的，以避免这些潜在错误。

#### 9. 如果拷贝构造函数使用`T& other`作为形参会怎样？

在 C++中，拷贝构造函数即便使用`T& other`作为形参，也是可以声明的。然而，通常我们会选择覆盖编译器默认生成的拷贝构造函数，并且使用`const T& other`作为形参具有明显优势。

`const T& other`这种形式能够从任何对象（包括`const`对象和临时对象）进行拷贝。这是因为在 C++语言规则中，临时对象（右值）不能绑定到非`const`的左值引用上，但可以绑定到`const`的左值引用上。这样设计主要是为了防止临时对象被意外修改。若使用`T& other`作为形参，就无法从临时对象进行拷贝，限制了拷贝构造函数的使用场景。所以，从通用性和安全性角度考虑，`const T& other`是更优的选择。

#### 10. 拷贝构造函数实现方式可以用`memcpy()`方法吗？

不建议在拷贝构造函数中使用`memcpy()`方法。如前文所述，编译器会为类添加一些隐藏成员变量，例如虚函数指针。当使用`memcpy()`进行逐位拷贝时，虚函数指针往往无法得到正确处理。虚函数指针对于类的多态性实现至关重要，不正确的拷贝可能导致运行时错误，使程序在调用虚函数时出现未定义行为。因此，为确保拷贝构造函数的正确性和可靠性，不应使用`memcpy()`来实现。

#### 11. 继承的析构函数一般要怎么处理？继承的特殊成员函数怎么处理？

在继承体系中，对于析构函数及其他特殊成员函数，需遵循特定的处理方式。

**析构函数**：若存在基类，基类的析构函数通常应声明为虚函数。这是为了保证在通过基类指针或引用释放派生类对象时，能够正确调用派生类的析构函数，防止资源泄漏。例如，当在基类指针上执行`delete`操作时，如果基类析构函数不是虚函数，就只会调用基类的析构函数，派生类中分配的资源可能无法释放。

**构造函数**：

- **默认构造函数**：派生类无论是使用默认的构造函数，还是自定义构造函数，都会自动调用父类的默认构造函数，无需额外操作。
- **有参构造函数**：由于基类无法得知派生类构造时应传入的参数，因此派生类在使用有参构造函数时，必须手动调用父类的有参构造函数。实际开发中，常出现父类同时具备默认构造函数和有参构造函数，而派生类使用有参构造函数时，未显式调用父类有参构造函数，从而导致默认调用父类的默认构造函数。为避免重复调用父类构造函数，应通过初始化列表调用父类的有参构造函数。

**拷贝构造、拷贝赋值、移动构造、移动赋值函数**：在派生类中实现这些函数时，首先要在初始化列表中调用父类的相应函数，然后再实现派生类自身的逻辑。以移动操作为例，虽然使用`std::move(other)`看似将整个对象的资源都移动走了，但实际上父类只会处理父类的资源，子类资源不受影响，可继续安全使用。也就是说，初始化列表中的`std::move`操作仅对父类资源进行移动，子类仍可利用`other`对象完成自身资源的移动。

总结如下：

- 基类析构函数应声明为虚函数，确保派生类析构函数能正确调用。
- 派生类构造函数，特别是有参构造函数，需显式调用基类的构造函数。
- 派生类的拷贝构造函数、拷贝赋值运算符、移动构造函数和移动赋值运算符，应在初始化列表中显式调用基类的相应函数，以保证基类部分能正确复制或移动。

#### 12. 如果在构造函数中调用 memset(this, 0, sizeof(\*this))来初始化内存空间，有什么问题吗？

在构造函数中调用`memset(this, 0, sizeof(*this))`初始化内存空间存在诸多问题：

- **对象成员初始化混乱**：对于类中的非`POD`（Plain Old Data，平凡旧数据类型，如包含构造函数、虚函数等的类）成员，`memset`会破坏对象的内部结构。例如，若类中包含`std::string`类型成员，`std::string`内部有自己的管理机制，`memset`将其内存置零后，会导致`std::string`对象处于无效状态，后续使用时可能引发未定义行为，如内存访问错误。

- **虚函数表指针问题**：如果类中有虚函数，虚函数表指针对于实现多态至关重要。`memset`将内存清零会破坏虚函数表指针，使得程序在调用虚函数时无法正确找到对应的函数地址，从而导致运行时错误。

- **基类部分初始化问题**：在继承体系中，这样做无法正确初始化基类部分。`memset`会覆盖基类已经初始化好的成员变量和虚函数表等重要信息，导致基类部分功能异常。

- **初始化不完整**：`memset`只能对基本数据类型进行简单的按位清零操作，对于类中的指针成员，只是将指针值清零，而不会释放指针所指向的内存，可能导致内存泄漏。

综上所述，虽然`memset`在某些特定场景下对`POD`类型数据的初始化有用，但在类的构造函数中使用它来初始化整个对象内存空间，会带来一系列严重问题，应避免这种做法。

#### 13.. 普通继承与虚继承构造顺序的区别

- **普通继承**
  - 基类构造函数在其直接派生类构造函数之前调用。在多层继承中，按照从基类到派生类的顺序，先执行基类的构造函数，再执行派生类的构造函数。例如，若有类`A`、`B`、`C`，`C`继承自`B`，`B`继承自`A`，构造`C`类对象时，先调用`A`的构造函数，再调用`B`的构造函数，最后调用`C`的构造函数。
  - 如果存在多个基类，按照它们在派生类定义中出现的顺序依次调用其构造函数。
- **虚继承**
  - 虚基类的构造函数总是在非虚基类构造函数和派生类构造函数之前调用。例如在菱形继承结构中，若`D`类虚继承自`A`类，同时继承自`B`类和`C`类，`B`类和`C`类又继承自`A`类，在构造`D`类对象时，首先调用`A`的构造函数，然后再按照顺序调用`B`和`C`的构造函数，最后调用`D`的构造函数。
  - 无论虚基类在继承体系中出现的位置如何，也无论有多少条路径可以到达虚基类，虚基类都只被构造一次，且由最终的派生类负责初始化。

### 8. 最佳实践总结

#### Rule of Zero/Three/Five

```cpp
// Rule of Zero: 使用RAII，无需自定义特殊成员函数
class RuleOfZero {
private:
    std::unique_ptr<int> data;
    std::string name;
    std::vector<double> values;

public:
    RuleOfZero(const std::string& n) : name(n), data(std::make_unique<int>(42)) {}
    // 编译器自动生成所有特殊成员函数
};

// Rule of Three: 需要自定义析构函数时，通常也需要拷贝构造和拷贝赋值
class RuleOfThree {
private:
    int* data;
    size_t size;

public:
    explicit RuleOfThree(size_t n) : size(n), data(new int[size]) {}

    // 1. 析构函数
    ~RuleOfThree() { delete[] data; }

    // 2. 拷贝构造函数
    RuleOfThree(const RuleOfThree& other) : size(other.size), data(new int[size]) {
        std::copy(other.data, other.data + size, data);
    }

    // 3. 拷贝赋值运算符
    RuleOfThree& operator=(const RuleOfThree& other) {
        if (this != &other) {
            delete[] data;
            size = other.size;
            data = new int[size];
            std::copy(other.data, other.data + size, data);
        }
        return *this;
    }
};

// Rule of Five: C++11后，还需要考虑移动语义
class RuleOfFive {
private:
    int* data;
    size_t size;

public:
    explicit RuleOfFive(size_t n) : size(n), data(new int[size]) {}

    // 1. 析构函数
    ~RuleOfFive() { delete[] data; }

    // 2. 拷贝构造函数
    RuleOfFive(const RuleOfFive& other) : size(other.size), data(new int[size]) {
        std::copy(other.data, other.data + size, data);
    }

    // 3. 拷贝赋值运算符
    RuleOfFive& operator=(const RuleOfFive& other) {
        if (this != &other) {
            delete[] data;
            size = other.size;
            data = new int[size];
            std::copy(other.data, other.data + size, data);
        }
        return *this;
    }

    // 4. 移动构造函数
    RuleOfFive(RuleOfFive&& other) noexcept : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
    }

    // 5. 移动赋值运算符
    RuleOfFive& operator=(RuleOfFive&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            size = other.size;
            other.data = nullptr;
            other.size = 0;
        }
        return *this;
    }
};
```
