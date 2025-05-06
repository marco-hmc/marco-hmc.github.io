---
layout: post
title: 模板的进阶使用
categories: language
related_posts: True
tags: cpp template
toc:
  sidebar: left
---

# 模板的进阶使用

> Marco

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

## 1. 模板元编程

模板元编程（Template Metaprogramming, TMP）是一种通过模板技术在编译时进行计算的方式。模板元编程通过提前在编译阶段进行类型推导、计算和选择，能显著提升程序的运行时性能和灵活性。模板元编程在 C++ 中非常强大，能够处理各种类型推导、递归计算和条件编译等复杂任务。**模板元编程是针对类型、常量的操作，因此任何针对类型和常量的操作都可以通过模板元编程实现。**

- **特点**：

  - 编译时进行
  - 针对类型和常量操作
  - 能够自动生成代码
  - 图灵完备

- **模板元编程的能力**：
  C++的模板元编程在理论上是图灵完备的，即能完成任何可计算的任务，而一个图灵完备的计算系统具备以下几个关键特征：
  - **存储能力**：
    - 定义：能够读取和修改变量的值（或进行类似的操作）。
    - 模板体现：模板元编程中，值的概念对应的是类型和编译期常量。
    - 关键：编译器常量/ 类型/ traits
  - **循环或递归能力**：
    - 定义：能够执行循环或递归操作（递归和循环在计算理论中是等价的，是可相互转换的）。
    - 模板体现：模板元编程可通过递归模板类和结构体实现，而 constexpr 方法也是可以直接调用的。
    - 关键：模板递归（终止条件）/ 不定长参数
  - **条件控制能力**：
    - 定义： 能够执行条件语句（如 if-else 或 switch-case）。
    - 模板体现：模板特化就是switch-case，std::enable_if就是if-else。
    - 关键： SFINAE / 重载决议/ concept

总结，元编程是指的是自动生成代码，早期的元编程都是通过宏去做的。而模板元编程的强大之处在于图灵完备，即能够满足上述三个特征，如条件控制（没有 if，只有 sfinae），如循环的体现（通过模板实例化递归展开），如值的体现（没有变量，只有常量和类型）。

### 1.1 模板的内存能力

#### 1.1.1 基本例子

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

static_assert(Fib<10>::value == 55);

int fib(int n) {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}
// non compile time operations, thus illegal.
// static_assert(fib(10) == 55);

int main() { return 0; }
```

#### 1.1.2 变量模板

```c++
// C++14（变量模板）
template <typename T>
inline constexpr bool is_integral_v = std::is_integral<T>::value;  // 变量模板

static_assert(is_integral_v<int>);         // 直接使用变量
```

```c++
template <int N>
constexpr int fib = fib<N-1> + fib<N-2>;

template <> constexpr int fib<0> = 0;
template <> constexpr int fib<1> = 1;

static_assert(fib<10> == 55);
```

```c++
template <int N>
struct IsPrime {
    static constexpr bool value = [](auto i) {
        return (i * i > N) || ((N % i == 0) ? false : IsPrime<N, i+1>::value);
    }(2);
};

template <int N, int I=2>
struct PrimeList {
    // 模板变量存储当前质数（若N是质数）
    constexpr static auto value = [] {
        if constexpr (IsPrime<N>::value) {
            return std::tuple_cat(PrimeList<N-1>::value, std::make_tuple(N));
        } else {
            return PrimeList<N-1>::value;
        }
    }();
};

template <> struct PrimeList<0> { static constexpr auto value = std::tuple<>(); };

constexpr auto primes = PrimeList<20>::value;  // (2,3,5,7,11,13,17,19)
```

### 1.2 模板的循环和递归能力

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

### 1.3 模板的条件控制能力

#### 1.3.1 模板特化 switch-case

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

#### 1.3.2 SFINAE if-else

SFINAE（Substitution Failure Is Not An Error） 是 C++ 模板编程中的一个重要概念，它允许在模板实例化过程中，如果某些模板参数替换失败，不会导致编译错误，而是会选择其他可行的模板实例化。SFINAE 通常用于实现条件性模板特化和模板元编程。SFINAE 的主要用途：

- 根据类型的不同选择不同的模板函数或模板特化。
- 实现类型特定的行为，如根据类型判断是否支持某些操作（例如，是否支持加法、是否是容器类型等）。

* **enable_if**

```c++
   template <typename T>
   typename std::enable_if<std::is_integral_v<T>, void>::type
   process(T val) {
      std::cout << "Integral: " << val << "\n";
   }

   template <typename T>
   typename std::enable_if<!std::is_integral_v<T>, void>::type
   process(T val) {
      std::cout << "Non-integral: " << val << "\n";
   }

   process(42);     // Integral
   process(3.14);   // Non-integral
```

```c++
    template <bool B, typename T = void>
    struct enable_if {};

    template <typename T>
    struct enable_if<true, T> {
        using type = T;
    };
```

- **尾返回类型**

```c++
    template <typename T>
    auto foo(const T& t) -> decltype(t.size()) {
        // ...
        return t.size();
    }

    template <typename T>
    auto foo(const T& t) -> decltype(t.length()) {
        // ...
        return t.length();
    }

```

#### 1.3.3 if-constexpr

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

#### 1.3.4 concept

```c++
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

   std::vector<int> vec{1, 2, 3};
   print(vec);     // 调用版本1，输出 "1 2 3"
   print(42);      // 调用版本2，输出 "42"

```

## 2. 模板与继承

模板与继承是 C++ 模板编程中的一个重要概念。通过将模板与继承结合使用，可以实现更加灵活和强大的代码结构。以下是模板与继承的几个主要方面：

### 2.1 模板类的继承

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

### 2.2 CRTP（Curiously Recurring Template Pattern）

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

### 2.3 模板与多态

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

## 3. 不定长参数

### 3.1 C++11 变参模板（Variadic Templates）

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

### 3.2 C++17 折叠表达式（Fold Expressions）

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

## 4. 表达式模板

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

## 5. 类型擦除

### 5.1 什么是类型擦除？可以用来做什么？

- **什么是类型擦除**
  在 C++中，类型擦除（Type Erasure）是一种编程技术，它允许你在运行时隐藏或“擦除”对象的具体类型信息，只保留对象的行为，从而实现多态性和泛型编程的一种灵活方式。
  类型擦除是一个类似 wrapper 的行为。

  C++ 中模板提供了编译时的泛型编程能力，使用模板时编译器会根据具体的类型实例化代码。然而，有时我们希望在运行时处理不同类型的对象，而不需要知道它们的具体类型，只关心它们具有某些共同的行为。类型擦除通过创建一个抽象接口，将具体类型的对象包装起来，对外只暴露统一的接口，从而隐藏了具体的类型信息。

  例如，假设有多个不同类型的类 `Dog`、`Cat`、`Bird`，它们都有一个 `speak` 方法。可以通过类型擦除技术，将这些不同类型的对象统一包装在一个类（比如 `AnimalWrapper`）中，使得外部代码可以以相同的方式调用它们的 `speak` 方法，而无需关心具体是哪种动物。

- **类型擦除的用途**
  - **实现多态行为**：除了传统的虚函数多态，类型擦除提供了另一种实现多态的方式。通过类型擦除，不同类型的对象可以被视为具有相同的抽象类型，从而实现更灵活的多态行为。例如，在一个图形绘制系统中，`Circle`、`Rectangle`、`Triangle` 等不同形状的类可以通过类型擦除被统一处理，对外提供统一的 `draw` 接口。
  - **泛型容器**：在自定义容器中，使用类型擦除可以使容器能够存储不同类型的对象，而不需要为每种类型都单独实现一个容器。比如，实现一个 `Any` 类型的容器，它可以存储任意类型的对象，内部通过类型擦除技术来管理这些对象。
  - **简化接口设计**：类型擦除可以使接口更加简洁和通用。客户端代码只需要与抽象的接口交互，而不需要了解具体的实现类型。这有助于提高代码的可维护性和可扩展性。例如，在一个日志记录系统中，不同的日志记录器（如文件日志记录器、控制台日志记录器等）可以通过类型擦除被统一的日志记录接口调用。

### 5.2 类型擦除实现的基本原理是什么？

    假设我们希望实现一个容器，该容器能够同时存储任何类型的数据。换句话，就是弱化类型信息，或者说擦除类型信息，从而使得如何数据都可以同一种类型表示。
    为了实现这一目标，容器内部存储的对象必然是`void* ptr`，以及`std::type_info *type`。一个表示地址，一个表示类型。

    一种方法是将所有存储的类型都派生自一个公共父类，并通过该父类提供的方法获取类型信息。例如，我们可以定义 intType 和 doubleType 类，它们都继承自一个公共父类 type。这样，容器可以存储指向 type 类型的指针，通过多态机制获取具体类型并进行解码。

    然而，这种方法需要对存储的类型进行改造，增加了复杂性。有没有一种更好的方法呢？

    答案是肯定的。我们可以通过提供包装器的方式，将公共父类的概念隐藏到一个自定义类型中。这种方式就是类型擦除。类型擦除通过创建一个抽象接口，将具体类型的对象包装起来，对外只暴露统一的接口，从而隐藏了具体的类型信息，实现了更加灵活和简洁的多态性和泛型编程。

## 99. quiz

### 1. 注入类名

是说对类模板的作用域内，如果这个类型没有显式指定模板参数，默认都是用当前模板类型 T 的类型吗？

### 2. 模板参数 parameter 和模板实参 argument 概念的区分

使用了 decltype(a)，各种莫名其妙报错，is_same_v 判断无效（因为 decltype(a) 会返回 A const & 而不是 A，用 std::decay_t<decltype(a)> 即可）
T::value_type 无法编译通过（由于缺乏 typename 前缀，用 typename T::value_type 即可）

### 3. 将与参数无关的代码抽离模板（Factor Parameter-Independent Code Out of Templates）

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

### 4. 宏的元编程和模板的元编程对比
