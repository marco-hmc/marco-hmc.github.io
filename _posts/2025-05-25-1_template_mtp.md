---
layout: post
title: （二）模板那些事儿：模板元
categories: cpp
related_posts: True
tags: cpp template
toc:
  sidebar: right
---

## （二）模板那些事儿：模板元

```plaintext
模板进阶
├── 1. 模板元编程基础
│   ├── 1.1 模板的内存能力体现
│   ├── 1.2 模板的循环的递归能力
│   ├── 1.3 模板的条件控制能力
├── 2. 模板与继承（施工中）
│   ├── 2.1 模板的继承
│   ├── 2.2 CRTP
│   └── 2.3 模板与多态
│   └── 2.4 `std::variant` 和 `std::visit` 实现多态模板与多态
├── 3. 不定长参数
│   ├── 3.1
├── 4. 类型擦除（施工中）
│   ├── 4.1
├── 5. 表达式模板（施工中）
│   ├── 5.1
```

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

在上述代码中，`std::enable_if`根据`std::is_integral_v<T>`的结果来决定是否启用对应的`process`模板函数。如果`T`是整数类型，`std::is_integral_v<T>`为`true`，第一个`process`模板函数被启用；否则，第二个`process`模板函数被启用。

下面来看`enable_if`的一种简单自定义实现：

```c++
template <bool B, typename T = void>
struct enable_if {};

template <typename T>
struct enable_if<true, T> {
    using type = T;
};
```

这个自定义的`enable_if`模板结构体，当第一个模板参数`B`为`true`时，定义了一个`type`别名，其类型为第二个模板参数`T`。在实际使用中，类似于标准库中的`std::enable_if`，通过这种方式可以在模板实例化时根据条件选择性地启用或禁用模板。

##### 1.3.3 if-constexpr

在C++编程中，`if - constexpr` 是一种强大的特性，用于在编译期进行条件判断，这与传统的 `if` 语句在运行期进行条件判断有所不同。以下通过具体代码示例来深入理解这一特性。

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

##### 1.3.4 concept

在C++中，概念（`concept`）是一种用于约束模板参数的工具，它为模板参数指定了一组必须满足的条件。通过使用概念，我们可以使模板代码更加易读、易维护，并且在编译期就能发现更多潜在的错误。

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

### 2. 模板与继承

模板与继承是 C++ 模板编程中的一个重要概念。通过将模板与继承结合使用，可以实现更加灵活和强大的代码结构。以下是模板与继承的几个主要方面：

#### 2.1 模板类的继承

模板类的继承是指一个模板类继承自另一个模板类或普通类。通过模板类的继承，可以实现代码的重用和扩展。

```cpp
#include <iostream>

// 基类模板
template <typename T>
class Base {
public:
    void baseFunction() {
        std::cout << "Base function" << std::endl;
    }
};

// 派生类模板，继承自基类模板
template <typename T>
class Derived : public Base<T> {
public:
    void derivedFunction() {
        std::cout << "Derived function" << std::endl;
    }
};

int main() {
    Derived<int> obj;
    obj.baseFunction();    // 调用基类模板的函数
    obj.derivedFunction(); // 调用派生类模板的函数
    return 0;
}
```

#### 2.2 CRTP（Curiously Recurring Template Pattern）

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

#### 2.3 模板与多态

模板与多态是指将模板与多态结合使用，以实现更加灵活和强大的代码结构。通过将模板与多态结合使用，可以实现编译时多态和运行时多态的结合。

```cpp
#include <iostream>
#include <memory>
#include <vector>

// 基类
class Base {
public:
    virtual void function() const = 0;
    virtual ~Base() = default;
};

// 派生类模板
template <typename T>
class Derived : public Base {
public:
    void function() const override {
        std::cout << "Derived function with type " << typeid(T).name() << std::endl;
    }
};

int main() {
    std::vector<std::unique_ptr<Base>> objects;
    objects.push_back(std::make_unique<Derived<int>>());
    objects.push_back(std::make_unique<Derived<double>>());

    for (const auto& obj : objects) {
        obj->function(); // 调用派生类模板的实现
    }

    return 0;
}
```

模板与继承是 C++ 模板编程中的一个重要概念。通过将模板与继承结合使用，可以实现代码的重用和扩展。CRTP 是一种特殊的模板设计模式，常用于实现静态多态和类型安全的接口。模板与多态结合使用，可以实现编译时多态和运行时多态的结合，从而实现更加灵活和强大的代码结构。通过理解和使用模板与继承，可以编写出更加灵活和高效的代码。

### 3. 不定长参数

#### 3.1 C++11 变参模板（Variadic Templates）

变参模板允许模板接受任意数量的模板参数。这使得编写泛型代码更加灵活，特别是在处理不定数量的参数时。

```cpp
#include <iostream>

void print() {
    std::cout << "End of recursion" << std::endl;
}

template <typename T, typename... Args>
void print(T first, Args... args) {
    std::cout << first << std::endl;
    print(args...);
}

int main() {
    print(1, 2.5, "Hello", 'c');
    return 0;
}
```

#### 3.2 C++17 折叠表达式（Fold Expressions）

折叠表达式是 C++17 引入的一种语法，用于简化变参模板中的递归操作。折叠表达式可以对参数包进行折叠，生成一个单一的表达式。

```cpp
#include <iostream>

template <typename... Args>
auto sum(Args... args) {
    return (args + ...);
}

int main() {
    std::cout << sum(1, 2, 3, 4, 5) << std::endl;
    return 0;
}
```

### 4. 表达式模板

```cpp
#include <cassert>
#include <cstddef>
#include <type_traits>

namespace jc {

template <typename T>
class SArray {
 public:
  explicit SArray(std::size_t sz) : data_(new T[sz]), sz_(sz) { init(); }

  SArray(const SArray<T>& rhs) : data_(new T[rhs.sz_]), sz_(rhs.sz_) {
    copy(rhs);
  }

  SArray<T>& operator=(const SArray<T>& rhs) {
    if (&rhs != this) {
      copy(rhs);
    }
    return *this;
  }

  ~SArray() { delete[] data_; }

  std::size_t size() const { return sz_; }

  T& operator[](std::size_t i) { return data_[i]; }

  const T& operator[](std::size_t i) const { return data_[i]; }

  SArray<T>& operator+=(const SArray<T>& rhs) {
    assert(sz_ == rhs.sz_);
    for (std::size_t i = 0; i < sz_; ++i) {
      (*this)[i] += rhs[i];
    }
    return *this;
  }

  SArray<T>& operator*=(const SArray<T>& rhs) {
    assert(sz_ == rhs.sz_);
    for (std::size_t i = 0; i < sz_; ++i) {
      (*this)[i] *= rhs[i];
    }
    return *this;
  }

  SArray<T>& operator*=(const T& rhs) {
    for (std::size_t i = 0; i < sz_; ++i) {
      (*this)[i] *= rhs;
    }
    return *this;
  }

 protected:
  void init() {
    for (std::size_t i = 0; i < sz_; ++i) {
      data_[i] = T{};
    }
  }

  void copy(const SArray<T>& rhs) {
    assert(sz_ == rhs.sz_);
    for (std::size_t i = 0; i < sz_; ++i) {
      data_[i] = rhs.data_[i];
    }
  }

 private:
  T* data_;
  std::size_t sz_;
};

template <typename T>
SArray<T> operator+(const SArray<T>& lhs, const SArray<T>& rhs) {
  assert(lhs.size() == rhs.size());
  SArray<T> res{lhs.size()};
  for (std::size_t i = 0; i < lhs.size(); ++i) {
    res[i] = lhs[i] + rhs[i];
  }
  return res;
}

template <typename T>
SArray<T> operator*(const SArray<T>& lhs, const SArray<T>& rhs) {
  assert(lhs.size() == rhs.size());
  SArray<T> res{lhs.size()};
  for (std::size_t i = 0; i < lhs.size(); ++i) {
    res[i] = lhs[i] * rhs[i];
  }
  return res;
}

template <typename T>
SArray<T> operator*(const T& lhs, const SArray<T>& rhs) {
  SArray<T> res{rhs.size()};
  for (std::size_t i = 0; i < rhs.size(); ++i) {
    res[i] = lhs * rhs[i];
  }
  return res;
}

template <typename T>
class A_Scalar {
 public:
  constexpr A_Scalar(const T& v) : value_(v) {}

  constexpr const T& operator[](std::size_t) const { return value_; }

  constexpr std::size_t size() const { return 0; };

 private:
  const T& value_;
};

template <typename T>
struct A_Traits {
  using type = const T&;
};

template <typename T>
struct A_Traits<A_Scalar<T>> {
  using type = A_Scalar<T>;
};

template <typename T, typename OP1, typename OP2>
class A_Add {
 public:
  A_Add(const OP1& op1, const OP2& op2) : op1_(op1), op2_(op2) {}

  T operator[](std::size_t i) const { return op1_[i] + op2_[i]; }

  std::size_t size() const {
    assert(op1_.size() == 0 || op2_.size() == 0 || op1_.size() == op2_.size());
    return op1_.size() != 0 ? op1_.size() : op2_.size();
  }

 private:
  typename A_Traits<OP1>::type op1_;
  typename A_Traits<OP2>::type op2_;
};

template <typename T, typename OP1, typename OP2>
class A_Mult {
 public:
  A_Mult(const OP1& op1, const OP2& op2) : op1_(op1), op2_(op2) {}

  T operator[](std::size_t i) const { return op1_[i] * op2_[i]; }

  std::size_t size() const {
    assert(op1_.size() == 0 || op2_.size() == 0 || op1_.size() == op2_.size());
    return op1_.size() != 0 ? op1_.size() : op2_.size();
  }

 private:
  typename A_Traits<OP1>::type op1_;
  typename A_Traits<OP2>::type op2_;
};

template <typename T, typename A1, typename A2>
class A_Subscript {
 public:
  A_Subscript(const A1& a1, const A2& a2) : a1_(a1), a2_(a2) {}

  T& operator[](std::size_t i) {
    return const_cast<T&>(a1_[static_cast<std::size_t>(a2_[i])]);
  }

  decltype(auto) operator[](std::size_t i) const {
    return a1_[static_cast<std::size_t>(a2_[i])];
  }

  std::size_t size() const { return a2_.size(); }

 private:
  const A1& a1_;
  const A2& a2_;
};

}  // namespace jc

namespace jc::test {

template <typename T, typename Rep = SArray<T>>
class Array {
 public:
  explicit Array(std::size_t i) : r_(i) {}

  Array(const Rep& rhs) : r_(rhs) {}

  Array& operator=(const Array& rhs) {
    assert(size() == rhs.size());
    for (std::size_t i = 0; i < rhs.size(); ++i) {
      r_[i] = rhs[i];
    }
    return *this;
  }

  template <typename T2, typename Rep2>
  Array& operator=(const Array<T2, Rep2>& rhs) {
    assert(size() == rhs.size());
    for (std::size_t i = 0; i < rhs.size(); ++i) {
      r_[i] = rhs[i];
    }
    return *this;
  }

  std::size_t size() const { return r_.size(); }

  T& operator[](std::size_t i) {
    assert(i < size());
    return r_[i];
  }

  decltype(auto) operator[](std::size_t i) const {
    assert(i < size());
    return r_[i];
  }

  template <typename T2, typename Rep2>
  Array<T, A_Subscript<T, Rep, Rep2>> operator[](const Array<T2, Rep2>& rhs) {
    return Array<T, A_Subscript<T, Rep, Rep2>>{
        A_Subscript<T, Rep, Rep2>{this->rep(), rhs.rep()}};
  }

  template <typename T2, typename Rep2>
  decltype(auto) operator[](const Array<T2, Rep2>& rhs) const {
    return Array<T, A_Subscript<T, Rep, Rep2>>{
        A_Subscript<T, Rep, Rep2>{this->rep(), rhs.rep()}};
  }

  Rep& rep() { return r_; }

  const Rep& rep() const { return r_; }

 private:
  Rep r_;
};

template <typename T, typename R1, typename R2>
Array<T, A_Add<T, R1, R2>> operator+(const Array<T, R1>& lhs,
                                     const Array<T, R2>& rhs) {
  return Array<T, A_Add<T, R1, R2>>{A_Add<T, R1, R2>{lhs.rep(), rhs.rep()}};
}

template <typename T, typename R1, typename R2>
Array<T, A_Mult<T, R1, R2>> operator*(const Array<T, R1>& lhs,
                                      const Array<T, R2>& rhs) {
  return Array<T, A_Mult<T, R1, R2>>{A_Mult<T, R1, R2>{lhs.rep(), rhs.rep()}};
}

template <typename T, typename R2>
Array<T, A_Mult<T, A_Scalar<T>, R2>> operator*(const T& lhs,
                                               const Array<T, R2>& rhs) {
  return Array<T, A_Mult<T, A_Scalar<T>, R2>>{
      A_Mult<T, A_Scalar<T>, R2>{A_Scalar<T>(lhs), rhs.rep()}};
}

}  // namespace jc::test

int main() {
  constexpr std::size_t sz = 1000;
  constexpr double a = 10;
  constexpr double b = 2;
  jc::test::Array<double> x{sz};
  jc::test::Array<double> y{sz};
  assert(x.size() == sz);
  assert(y.size() == sz);
  for (std::size_t i = 0; i < sz; ++i) {
    x[i] = a;
    y[i] = b;
  }
  x = 1.2 * x + x * y;
  static_assert(std::is_same_v<
                decltype(1.2 * x),
                jc::test::Array<double, jc::A_Mult<double, jc::A_Scalar<double>,
                                                   jc::SArray<double>>>>);
  static_assert(std::is_same_v<
                decltype(x * y),
                jc::test::Array<double, jc::A_Mult<double, jc::SArray<double>,
                                                   jc::SArray<double>>>>);

  static_assert(
      std::is_same_v<
          decltype(1.2 * x + x * y),
          jc::test::Array<double,
                          jc::A_Add<double,
                                    jc::A_Mult<double, jc::A_Scalar<double>,
                                               jc::SArray<double>>,
                                    jc::A_Mult<double, jc::SArray<double>,
                                               jc::SArray<double>>>>>);

  for (std::size_t i = 0; i < sz; ++i) {
    assert(x[i] == 1.2 * a + a * b);
    y[i] = static_cast<double>(i);
  }

  /*
   * x[y] = 2.0 * x[y] equals to:
   * for (std::size_t i = 0; i < y.size(); ++i) {
   *   x[y[i]] = 2 * x[y[i]];
   * }
   */
  x[y] = 2.0 * x[y];
  for (std::size_t i = 0; i < sz; ++i) {
    assert(x[i] == 2.0 * (1.2 * a + a * b));
  }
}
```

表达式模板支持对数组像内置类型一样进行数值运算，并且不会产生临时对象

### 5. 类型擦除

#### 5.1 什么是类型擦除？可以用来做什么？

- **什么是类型擦除** 在 C++中，类型擦除（Type Erasure）是一种编程技术，它允许你在运行时隐藏或“擦除”对象的具体类型信息，只保留对象的行为，从而实现多态性和泛型编程的一种灵活方式。类型擦除是一个类似 wrapper 的行为。

  C++ 中模板提供了编译时的泛型编程能力，使用模板时编译器会根据具体的类型实例化代码。然而，有时我们希望在运行时处理不同类型的对象，而不需要知道它们的具体类型，只关心它们具有某些共同的行为。类型擦除通过创建一个抽象接口，将具体类型的对象包装起来，对外只暴露统一的接口，从而隐藏了具体的类型信息。

  例如，假设有多个不同类型的类 `Dog`、`Cat`、`Bird`，它们都有一个 `speak` 方法。可以通过类型擦除技术，将这些不同类型的对象统一包装在一个类（比如 `AnimalWrapper`）中，使得外部代码可以以相同的方式调用它们的 `speak` 方法，而无需关心具体是哪种动物。

- **类型擦除的用途**
  - **实现多态行为**：除了传统的虚函数多态，类型擦除提供了另一种实现多态的方式。通过类型擦除，不同类型的对象可以被视为具有相同的抽象类型，从而实现更灵活的多态行为。例如，在一个图形绘制系统中，`Circle`、`Rectangle`、`Triangle` 等不同形状的类可以通过类型擦除被统一处理，对外提供统一的 `draw` 接口。
  - **泛型容器**：在自定义容器中，使用类型擦除可以使容器能够存储不同类型的对象，而不需要为每种类型都单独实现一个容器。比如，实现一个 `Any` 类型的容器，它可以存储任意类型的对象，内部通过类型擦除技术来管理这些对象。
  - **简化接口设计**：类型擦除可以使接口更加简洁和通用。客户端代码只需要与抽象的接口交互，而不需要了解具体的实现类型。这有助于提高代码的可维护性和可扩展性。例如，在一个日志记录系统中，不同的日志记录器（如文件日志记录器、控制台日志记录器等）可以通过类型擦除被统一的日志记录接口调用。

#### 5.2 类型擦除实现的基本原理是什么？

    假设我们希望实现一个容器，该容器能够同时存储任何类型的数据。换句话，就是弱化类型信息，或者说擦除类型信息，从而使得如何数据都可以同一种类型表示。
    为了实现这一目标，容器内部存储的对象必然是`void* ptr`，以及`std::type_info *type`。一个表示地址，一个表示类型。

    一种方法是将所有存储的类型都派生自一个公共父类，并通过该父类提供的方法获取类型信息。例如，我们可以定义 intType 和 doubleType 类，它们都继承自一个公共父类 type。这样，容器可以存储指向 type 类型的指针，通过多态机制获取具体类型并进行解码。

    然而，这种方法需要对存储的类型进行改造，增加了复杂性。有没有一种更好的方法呢？

    答案是肯定的。我们可以通过提供包装器的方式，将公共父类的概念隐藏到一个自定义类型中。这种方式就是类型擦除。类型擦除通过创建一个抽象接口，将具体类型的对象包装起来，对外只暴露统一的接口，从而隐藏了具体的类型信息，实现了更加灵活和简洁的多态性和泛型编程。

### 99. quiz

#### 2. 模板参数 parameter 和模板实参 argument 概念的区分

使用了 decltype(a)，各种莫名其妙报错，is_same_v 判断无效（因为 decltype(a) 会返回 A const & 而不是 A，用 std::decay_t<decltype(a)> 即可） T::value_type 无法编译通过（由于缺乏 typename 前缀，用 typename T::value_type 即可）

#### 3. 将与参数无关的代码抽离模板（Factor Parameter-Independent Code Out of Templates）

在 C++ 模板编程中，模板参数的多样化可能导致生成冗余的二进制代码。为避免这种情况，可以将与模板参数无关的代码提取到模板外部。

- **原始代码**

```cpp
template<typename T, std::size_t n>
class SquareMatrix {
public:
    void invert(); // 求逆矩阵
};

SquareMatrix<double, 5> sm1;
SquareMatrix<double, 10> sm2;
sm1.invert();  // 编译器会为这两个调用生成两个完全不同的 invert 实现
sm2.invert();
```

- **改进后的代码**

将与模板参数 `n` 无关的代码提取到基类 `SquareMatrixBase` 中：

```cpp
template<typename T>
class SquareMatrixBase {
protected:
    void invert(std::size_t matrixSize);  // 在基类中实现实际的求逆算法
};

template<typename T, std::size_t n>
class SquareMatrix : private SquareMatrixBase<T> {
private:
    using SquareMatrixBase<T>::invert;  // 避免遮蔽基类的 invert 函数

public:
    void invert() {
        this->invert(n);  // 使用一个 inline 调用来调用基类的 invert
    }
};
```

- **增加矩阵数据存储**

使用指针存储矩阵数据，并在构造函数中传递给基类：

```cpp
template<typename T, std::size_t n>
class SquareMatrix : private SquareMatrixBase<T> {
public:
    SquareMatrix() : SquareMatrixBase<T>(n, 0), pData(new T[n * n]) {
        this->setDataPtr(pData.get());  // 设置矩阵数据指针
    }

private:
    std::unique_ptr<T[]> pData;  // 存储在堆上的矩阵数据
};
```

- **总结**
  1. **避免模板参数依赖：** 将与模板参数无关的代码抽离到基类中，减少冗余代码。
  2. **使用基类共享实现：** 通过基类共享实现，避免因模板实例化导致的代码膨胀。
  3. **通过成员变量替代模板参数：** 将非类型模板参数作为类成员变量传递，减少二进制膨胀。
  4. **使用指针和动态内存：** 动态分配存储数据，进一步减少代码膨胀。

通过这些技巧，可以有效减少模板参数导致的代码膨胀，优化编译时间和生成的二进制文件。

#### 4. 宏的元编程和模板的元编程对比
