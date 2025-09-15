---
layout: post
title: （三）模板那些事儿：模板与继承
categories: C++
related_posts: True
tags: template doing
toc:
  sidebar: right
---

## （三）模板那些事儿：模板与继承与多态

### 1. 模板与继承

模板与继承是 C++ 模板编程中的一个重要概念。通过将模板与继承结合使用，可以实现更加灵活和强大的代码结构。以下是模板与继承的几个主要方面：

#### 1.1 模板类的继承

模板类的继承指的是一个模板类从另一个模板类或者普通类继承而来。借助模板类的继承机制，能够实现代码的复用与扩展。

例如：

```cpp
template<typename T>
class Base {
public:
    void f() {
        std::cout << "Base::f" << std::endl;
    }
};

template<typename T>
class Derived : public Base<T> {
public:
    void g() {
        f();         // ❌ 错误
        this->f();   // ✅ 正确
        Base<T>::f(); // ✅ 同样正确
        {
            using Base<T>::f;  // 显式引入基类的函数
            f();
        }

    }
};
```

在模板继承场景下，存在一个关键特性：**基类模板成员不会自动被引入到派生类的作用域**。

其背后的原因在于：当编译器实例化 `Derived<T>` 时，并不能预先「知晓」`Base<T>::f()` 是否存在，只有在 `Base<T>` 被具体实例化之后才能确定。因此，需要通过 `this->` 或者 `Base<T>::` 这种方式来告知编译器：该成员来自基类模板。

具体来说，编译器处理模板时会分为两个阶段：

1. **模板定义阶段（template definition）**：在此阶段，编译器不会解析依赖名称。所谓依赖名称，就是其存在与否依赖于模板参数的名称，比如上述代码中的 `f()`，它的存在与模板参数 `T` 相关。在这个阶段，编译器不会去深入探究 `Base<T>` 中是否真的有 `f()` 这个成员。
2. **模板实例化阶段（template instantiation）**：到了这个阶段，编译器才会去解析 `Base<T>` 中究竟有没有 `f()`。由于在模板定义阶段无法确定依赖名称 `f()` 的情况，所以必须**手动引导编译器进行解析**，方法就是添加 `this->` 或者 `Base<T>::`。这样，编译器就能在实例化阶段准确识别并处理来自基类模板的成员。

#### 1.2 CRTP（Curiously Recurring Template Pattern）

CRTP（Curiously Recurring Template Pattern）是一种特殊的模板设计模式，其中派生类将自身作为模板参数传递给基类。CRTP 常用于实现静态多态、编译时多态和类型安全的接口。

```cpp
#include <iostream>

template <typename Derived>
class Base {
public:
    void interface() {
        static_cast<Derived*>(this)->implementation();
    }

    void implementation() {
        std::cout << "Base implementation" << std::endl;
    }
};

class Derived : public Base<Derived> {
public:
    void implementation() {
        std::cout << "Derived implementation" << std::endl;
    }
};

int main() {
    Derived obj;
    obj.interface();
    return 0;
}
```

- **静态绑定替代动态绑定**：
  - 在传统的多态实现中，如通过虚函数和指针或引用进行动态绑定，运行时系统需要额外的机制来确定调用哪个函数。具体来说，每个包含虚函数的类都有一个虚函数表（vtable），对象中会包含一个指向该虚函数表的指针（vptr）。当通过指针或引用调用虚函数时，程序需要先通过 vptr 找到对应的 vtable，然后在 vtable 中查找要调用的函数地址，这一系列操作会带来额外的时间和空间开销。
  - 而 CRTP 利用模板在编译时就确定了要调用的函数。以之前的代码为例，`Base<Derived>` 中的 `interface` 函数通过 `static_cast<Derived*>(this)->implementation();` 调用 `Derived` 类的 `implementation` 函数。在编译阶段，编译器就知道 `Derived` 类的 `implementation` 函数的具体地址，直接生成调用该函数的代码，无需像动态绑定那样在运行时进行额外的查找操作，从而节省了时间开销。核心就在于虽然还是有指针跳转，但这些都是编译期间能够确定的，都会被优化掉，不需要动态查询虚函数表。
  - 特别注意，CRTP的做法只是形式上统一函数接口，并不是真正意义上的多态，即能够通过基类指针/基类引用就能够调用对应函数。
  - 常用于策略模式（policy-based design）或表达式模板。

#### 1.3 模板与多态

在 C++ 编程中，模板类通常并非虚函数多态基类的理想选择。例如：

```cpp
template <typename T>
class Base {
public:
    virtual void foo() {} // 虽然语法上合法，但实际应用中意义不大
};
```

这是因为对于不同模板参数实例化得到的 `Base<int>` 和 `Base<double>`，它们是完全独立且无关的类类型。尽管它们都基于同一个模板定义，但并不存在共同的基类关系。在多态机制中，通常需要一个公共的基类来实现动态绑定，即通过基类指针或引用调用虚函数时，根据对象的实际类型来决定调用哪个派生类的虚函数实现。而模板类的这种特性，使得以它作为多态基类时，无法满足多态的基本要求，也就难以实现有效的虚函数多态。

若要通过虚函数实现多态，更为恰当的做法是避免将“多态基类”设置为模板。以下是一种可行的设计方式：

```cpp
class IAnimal {
public:
    virtual void speak() = 0;
    virtual ~IAnimal() = default;
};

template<typename T>
class Animal : public IAnimal {
public:
    void speak() override {
        static_cast<T*>(this)->impl();
    }
};
```

在上述代码中，`IAnimal` 作为一个非模板的抽象基类，定义了纯虚函数 `speak`，为所有派生类提供了统一的接口规范。而模板类 `Animal` 继承自 `IAnimal`，并实现了 `speak` 函数。在 `speak` 函数中，通过 `static_cast<T*>(this)->impl();` 调用具体类型 `T` 的 `impl` 方法（这里假设 `T` 类中定义了 `impl` 方法）。这种设计结合了虚函数实现的动态多态和基于模板的 CRTP（Curiously Recurring Template Pattern，奇异递归模板模式）实现的静态多态，达成了一种混合设计。动态多态使得程序在运行时能够根据对象的实际类型来决定调用哪个派生类的 `speak` 实现，提供了运行时的灵活性；而 CRTP 则在编译期确定类型，能带来编译期的优化，如内联函数调用等，提高了程序的性能。
