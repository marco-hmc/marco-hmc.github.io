---
layout: post
title: （二）模板那些事儿：模板元
categories: C++
related_posts: True
tags: template
toc:
  sidebar: right
---

## （二）模板那些事儿：模板元

### 1. 模板元编程

模板元编程（Template Metaprogramming, TMP）是一种利用模板技术在编译阶段执行计算的编程方式。它通过在编译期提前进行类型推导、计算以及选择，能有效地提升程序在运行时的性能，同时增强程序的灵活性。在 C++编程领域，模板元编程展现出强大的能力，能够应对各种复杂任务，如精准的类型推导、递归计算以及条件编译等。

从本质上讲，模板元编程主要围绕类型和常量展开操作。虽然其功能十分强大，能够处理众多与类型和常量相关的操作，但不能绝对地说任何针对类型和常量的操作都可通过模板元编程实现。在实际应用中，会受到一些限制，例如模板实例化的深度限制等。

元编程技术，简而言之，就是自动生成代码的技术。在早期的 C/C++编程中，常常借助宏来实现这一目的。以`Qt`库的`moc`（Meta - Object Compiler）技术为例，它同样可被视作元编程技术的一种体现。而模板元编程具有独特的优势：它在编译阶段执行，不会产生运行时开销；专注于针对类型和常量进行操作；并且具备图灵完备性，这意味着理论上它可以实现任何可计算的算法。

- **模板元编程图灵完备的体现**： C++的模板元编程在理论上是图灵完备的，即能完成任何可计算的任务，而一个图灵完备的计算系统具备以下几个关键特征：
  - **值对象操作能力**：
    - `定义`：能够读取和修改变量的值（或进行类似的操作）。
    - `关键`：编译期常量/ 类型/ traits
  - **条件控制能力**：
    - `定义`： 能够执行条件语句（如 if-else 或 switch-case）。
    - `关键`： SFINAE / 重载决议/ concept
  - **循环或递归能力**：
    - `定义`：能够执行循环或递归操作（递归和循环在计算理论中是等价的，是可相互转换的）。
    - `关键`：模板递归（终止条件）/ 不定长参数

下面展开模板是如何体现值对象操作能力、条件控制能力，以及循环活递归能力的。

#### 1.1 模板的值对象操作能力

##### 1.1.1 基本例子

```c++
template <int N>
struct Fib {
    static constexpr int value = Fib<N - 1>::value + Fib<N - 2>::value;
};

template <>
struct Fib<0> {
    static constexpr int value = 0;
};

template <>
struct Fib<1> {
    static constexpr int value = 1;
};

// static_assert可表明零运行时
static_assert(Fib<10>::value == 55);
```

这个例子体现，模板可以对常量做值操作。

```c++
template <typename T>
struct RemoveConst {
    using type = T;
};

template <typename T>
struct RemoveConst<const T> {
    using type = T;
};

using TestType1 = int;
using TestType2 = const int;

static_assert(std::is_same_v<typename RemoveConst<TestType1>::type, TestType1>);
static_assert(std::is_same_v<typename RemoveConst<TestType2>::type, int>);
```

这个例子体现，模板可以对类型做值操作，移除`const`等等。

#### 1.2 模板的循环和递归能力

模板的递归是指在模板定义中递归调用模板自身。这种技术通常用于编写模板元编程代码，例如计算编译时常量、生成编译时数据结构等。模板的递归可以分为两种：函数模板递归和类模板递归。

常见应用场景：

- **计算编译期常量**：如阶乘、斐波那契数列等。
- **类型列表的递归处理**：对类型序列进行递归操作，如类型列表的生成和拆解。

```cpp
#include <iostream>

// 类模板递归
template <int N>
struct Factorial {
    static const int value = N * Factorial<N - 1>::value;
};

template <>
struct Factorial<0> {
    static const int value = 1;
};

int main() {
    std::cout << "Factorial<5>::value = " << Factorial<5>::value << std::endl; // 输出 120
    return 0;
}
```

#### 1.3 模板的条件控制能力

##### 1.3.1 模板特化 switch-case

在C++中，模板特化提供了一种针对特定类型定制模板行为的机制。如下代码展示了模板特化的基本形式：

```c++
template <typename T>
struct TypeHandler {
    static void process() { std::cout << "Generic type\n"; }
};

template <>
struct TypeHandler<int> {
    static void process() { std::cout << "Integer type\n"; }
};

TypeHandler<double>::process();  // 输出 "Generic type"
TypeHandler<int>::process();      // 输出 "Integer type"
```

这里，`TypeHandler`模板类针对通用类型有一个默认实现，而针对`int`类型进行了特化。当调用`TypeHandler<int>::process()`时，会执行特化版本的函数；调用`TypeHandler<double>::process()`时，执行通用版本。这种根据不同类型执行不同代码的行为，在功能上类似于`switch - case`语句。

在模板特化中，不同的模板参数类型就如同`switch - case`中不同的`case`值，模板的通用实现类似于`switch - case`中的`default`分支。它们都提供了一种根据不同条件选择执行不同代码块的方式。

##### 1.3.2 SFINAE if-else

SFINAE（Substitution Failure Is Not An Error）是C++模板编程里一个极为重要的概念。在模板实例化期间，如果某些模板参数的替换操作失败，并不会导致编译错误，编译器会尝试寻找其他可行的模板实例化方式。这一特性在条件性模板特化和模板元编程中有着广泛应用。

SFINAE主要有以下用途：

- **根据类型选择不同模板**：允许根据传入模板的类型，选择最合适的模板函数或模板特化，以实现不同类型下的特定行为。
- **类型特定行为实现**：能够根据类型判断是否支持某些操作，比如判断一个类型是否支持加法运算，或者是否属于容器类型等，从而实现类型相关的定制化逻辑。

**enable_if的应用**

`enable_if`是基于SFINAE实现的一个工具，用于有条件地启用或禁用模板实例化。以下是使用标准库`std::enable_if`的示例：

```c++
#include <iostream>
#include <type_traits>

template <typename T>
typename std::enable_if<std::is_integral_v<T>, void>::type process(T val) {
    std::cout << "Integral: " << val << "\n";
}

template <typename T>
typename std::enable_if<!std::is_integral_v<T>, void>::type process(T val) {
    std::cout << "Non - integral: " << val << "\n";
}

int main() {
    process(42);    // Integral
    process(3.14);  // Non - integral
    return 0;
}
```

在上述代码中，`std::enable_if`根据`std::is_integral_v<T>`的结果来决定是否启用对应的`process`模板函数。如果`T`是整数类型，`std::is_integral_v<T>`为`true`，第一个`process`模板函数被启用；否则，第二个`process`模板函数被启用。而整数类型包含`int`, `unsigned int`, `long long`, `unsigned long`等等，甚至`char`也可以是整数类型，这个时候不是使用`switch-case`的特化能够完成，模板实例需要一种`if(condition)`的能力，这就是`std::enable_if`了。下面来看`enable_if`的一种简单自定义实现：

```c++
template <bool B, typename T = void>
struct enable_if {};

template <typename T>
struct enable_if<true, T> {
    using type = T;
};
```

这个自定义的`enable_if`模板结构体，当第一个模板参数`B`为`true`时，定义了一个`type`别名，其类型为第二个模板参数`T`。而如果为`false`的时候，则实例化失败，因为就没有定义`using type = T;`了，这也是`SFINAE（Substitution Failure Is Not An Error）`的意思，即实例化失败不是错误，实例化失败了就失败了，就跳过去了。标准库中的`std::enable_if`就是类似这种的实现方式，通过这种方式可以在模板实例化时根据条件选择性地启用或禁用模板。

##### 1.3.3 if-constexpr

在C++编程中，`if - constexpr` 是一种强大的特性，用于在编译期进行条件判断，在`C++17`之后支持。这与传统的 `if` 语句在运行期进行条件判断有所不同。以下通过具体代码示例来深入理解这一特性。

```c++
// 编译时条件判断的版本
template <typename T>
void process_compile_time(T val) {
    if constexpr (std::is_integral_v<T>) {
        std::cout << "Integral: " << val * 2 << "\n";
    } else if constexpr (std::is_floating_point_v<T>) {
        std::cout << "Floating: " << val + 1.0 << "\n";
    } else {
        std::cout << "Other type\n";
    }
}

// 运行时条件判断的版本
template <typename T>
void process_runtime(T val) {
    if (std::is_integral_v<T>) {
        std::cout << "Integral: " << val << "\n";
    } else if (std::is_floating_point_v<T>) {
        std::cout << "Floating: " << val << "\n";
    } else {
        std::cout << "Other type\n";
    }
}
```

在上述代码中，`process_compile_time` 函数模板使用了 `if - constexpr`。这意味着编译器在编译阶段就会根据模板参数 `T` 的类型来决定执行哪个分支。如果 `T` 是整数类型（`std::is_integral_v<T>` 为 `true`），则执行第一个分支，将 `val` 乘以 2 后输出；如果 `T` 是浮点类型（`std::is_floating_point_v<T>` 为 `true`），则执行第二个分支，将 `val` 加上 1.0 后输出；否则执行 `else` 分支。

而 `process_runtime` 函数模板使用的是普通的 `if` 语句，它在运行时根据 `T` 的类型来判断执行哪个分支。

`if - constexpr` 的优势主要体现在以下几个方面：

- **编译期优化**：由于条件判断在编译期完成，对于不满足条件的分支，编译器不会生成对应的代码。这有助于减少生成的可执行文件大小，提高运行效率。例如，如果模板实例化时 `T` 是整数类型，那么 `process_compile_time` 函数中浮点类型和其他类型的分支代码不会被生成，而 `process_runtime` 函数无论 `T` 是什么类型，所有分支的代码都会被生成。
- **模板元编程**：在模板元编程中，`if - constexpr` 能够实现基于类型的条件逻辑，使得模板代码更加灵活和强大。它可以根据不同的类型特性进行不同的操作，而不需要为每种类型都编写单独的模板特化。

通过对比这两个函数模板，我们可以清晰地看到 `if - constexpr` 在编译时条件判断方面的独特作用，以及它与传统运行时条件判断的区别。在实际编程中，合理运用 `if - constexpr` 可以提升代码的性能和可维护性，尤其在处理模板相关的复杂逻辑时，能发挥出显著的优势。

和`std::enable_if`相比，两者很多时候能力范围和性能上是等价的（但还是存在部分情况只能用`std::enable_if`，部分情况下`if-constexpr`更快），可以认为`if-constexpr`在大部分时候是`std::enable_if`的上位选择，是模板元逐步发展之后更便利的一种技术方式。

##### 1.3.4 concept

除了上述两种之外，还有一种更简约的方式实现模板的`if-condition`能力。在`C++20`中，概念（`concept`）是一种用于约束模板参数的工具，它为模板参数指定了一组必须满足的条件。通过使用概念，我们可以使模板代码更加易读、易维护，并且在编译期就能发现更多潜在的错误。

例如，下面的代码展示了如何定义和使用一个简单的概念：

```c++
// 定义一个名为Iterable的概念，用于判断类型T是否可迭代
template <typename T>
concept Iterable = requires(T t) {
    t.begin();
    t.end();
};

template <Iterable T>
void print(T&& container) {
    for (auto&& item : container)
        std::cout << item << " ";
    std::cout << "\n";
}

template <typename T>
void print(T&& val) {
    std::cout << val << "\n";
}

int main() {
    std::vector<int> vec{1, 2, 3};
    print(vec);     // 调用版本1，输出 "1 2 3"
    print(42);      // 调用版本2，输出 "42"
    return 0;
}
```

在上述代码中，首先定义了`Iterable`概念。这个概念要求类型`T`必须具备`begin()`和`end()`成员函数，满足这个条件的类型才被认为是可迭代的。

然后，基于`Iterable`概念重载了`print`函数。当调用`print`函数时，编译器会根据传入参数的类型是否满足`Iterable`概念来选择合适的函数版本。如果传入的是可迭代类型（如`std::vector<int>`），则会调用第一个`print`函数，它会遍历容器并打印每个元素；如果传入的是普通类型（如`int`），则会调用第二个`print`函数，直接打印该值。

使用概念有诸多优势。一方面，它增强了代码的可读性，通过明确模板参数的要求，使代码的意图更加清晰。另一方面，在编译期就能对模板参数进行更严格的检查，如果模板参数不满足概念所定义的条件，编译器会报错，从而避免在运行时出现难以调试的错误。这有助于提高代码的健壮性和稳定性，尤其在大型模板库和复杂的模板编程中，概念的使用能大大提升开发效率和代码质量。

通过这种方式，C++中的概念为模板编程提供了一种强大的类型约束机制，使模板代码的编写和理解变得更加容易。
`concept`的方式确实是进一步增强了模板元的`if(condition)`能力的，但笔者的生成环境没到`C++20`，用得不多，写得不多，就不深入介绍。

### 总结

综上所述，模板具备对类型、常量进行基本值操作的能力，同时还拥有类似于 `if - else` 的判断能力，以及循环递归能力 。这三种能力构成了模板元编程的基础。它们极大地拓展了模板原本仅用于泛型编程的能力范畴。因此，理解模板元编程应当从这三种能力入手。此外，模板元编程具有编译期计算、泛型编程的特性。前三种能力使得模板元可以被看成一门独立的语言，而编译期计算、泛型能力则是模板元真正发挥能力的地方。
