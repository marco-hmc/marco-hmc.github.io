---
date: 2025-04-04 10:24:28 +0800
project: language
title: template_instantiation
image: /images/post/post-24.jpg
tags: template

---

## 3. 模板实例化

模板实例化是指将模板转换为具体类型的过程。在 C++ 中，模板实例化有两种主要方式：显式实例化和隐式实例化。模板实例化的时机也非常重要，因为它决定了模板代码何时被编译。

模板实例化是将模板代码转换为具体类型的代码的过程。显式实例化和隐式实例化是两种主要的模板实例化方式。显式实例化通过明确指定模板参数强制编译器生成特定类型的模板实例，而隐式实例化则由编译器在需要使用模板时自动生成模板实例。模板实例化的时机对编译速度和代码膨胀有重要影响。通过理解模板实例化的概念、显式实例化、隐式实例化和模板实例化的时机，可以更好地编写和优化模板代码。

### 3.1 模板实例化的概念

模板实例化是将模板代码转换为具体类型的代码的过程。模板实例化发生在编译时，编译器会根据模板参数生成具体的函数或类定义。
模板实例化的结果是一个具体的函数或类，可以在程序中使用。

### 3.2 显式实例化

显式实例化是指在代码中明确指定模板参数，从而强制编译器生成特定类型的模板实例。显式实例化通常用于提高编译速度或减少代码膨胀。

```cpp
template <typename T>
T add(T a, T b) {
    return a + b;
}

// 显式实例化 add 函数模板
template int add<int>(int, int);
template double add<double>(double, double);

int main() {
    int result1 = add(3, 4); // 使用显式实例化的 int 类型的 add 函数
    double result2 = add(3.5, 4.5); // 使用显式实例化的 double 类型的 add 函数
    return 0;
}
```

### 3.3 隐式实例化

隐式实例化是指编译器在需要使用模板时自动生成模板实例。隐式实例化通常发生在模板被第一次使用时，编译器会根据模板参数自动生成具体的函数或类定义。

```cpp
template <typename T>
T add(T a, T b) {
    return a + b;
}

int main() {
    int result1 = add(3, 4); // 这里发生了隐式实例化，生成了 int 类型的 add 函数
    double result2 = add(3.5, 4.5); // 这里发生了隐式实例化，生成了 double 类型的 add 函数
    return 0;
}
```

### 3.4 模板实例化的时机

模板实例化的时机是指模板代码何时被编译器转换为具体类型的代码。模板实例化通常发生在模板被第一次使用时，但也可以通过显式实例化提前进行。模板实例化的时机对编译速度和代码膨胀有重要影响。

```cpp
template <typename T>
T add(T a, T b) {
    return a + b;
}

// 显式实例化 add 函数模板
template int add<int>(int, int);

int main() {
    int result1 = add(3, 4); // 使用显式实例化的 int 类型的 add 函数
    double result2 = add(3.5, 4.5); // 这里发生了隐式实例化，生成了 double 类型的 add 函数
    return 0;
}
```

### 99. quiz

#### 1. 不同源文件都使用了`vector<int>`，这是实例化了几次？代码有几次？

在 C++ 中，模板实例化的行为取决于编译器和链接器的实现。通常情况下，如果多个源文件都使用了相同的模板实例（例如 vector<int>），编译器会在每个使用该模板实例的源文件中生成一份实例化代码。
然而，链接器会负责消除重复的实例化代码，只保留一份最终的实例化代码。

也就是说不同源文件使用了相同的模板实例就会各自实例化，但是链接器会优化，合并重复实例代码。
注意，合并了重复的实例代码，只是减轻了代码生成的体积，实例的开销没办法去掉，所以模板用多了，编译会慢一些，开销在于模板实例化。

#### 2. 怎么显式实例化，减少实例化的次数？

```c++
// 在头文件 template_example.h 中
template<typename T>
class MyClass {
public:
    void doSomething();
};

// 在一个源文件 template_example.cpp 中
#include "template_example.h"

// 显式实例化定义（在这个翻译单元中生成实例化代码）
template class MyClass<int>;

// 在其他源文件中使用时
// 显式实例化声明（只声明实例化，避免重复定义）
extern template class MyClass<int>;
```

```c++
// template_example.h
template<typename T>
class MyClass {
public:
    void doSomething();
};
template class MyClass<int>; // 显式实例化定义

// template_example.cpp
#include "template_example.h"

template<typename T>
void MyClass<T>::doSomething() {}

// main.cpp
#include "template_example.h"

int main() {
    MyClass<int> obj;
    obj.doSomething();
    return 0;
}
```
### 2. 查找过程的细节

## line ----------------------------------------------------

## POI（Points of Instantiation）

### 1. POI 的基本概念

**POI（Points of Instantiation）** 是指编译器在模板实例化过程中，访问模板的声明或定义的某个位置。这时，编译器会在代码中插入相应的模板实例。POI 是编译器实例化模板时的“触发点”，即模板实例化发生的位置。

#### 示例：POI 与二阶段查找

```cpp
namespace jc {

struct A {
  A(int i) : i(i) {}
  int i;
};

A operator-(const A& a) { return A{-a.i}; }

bool operator<(const A& lhs, const A& rhs) { return lhs.i < rhs.i; }

using Int = A;  // 若使用 int 而不使用 A，则无法使用 ADL 找到 g

template <typename T>
void f(T i) {
  if (i < 0) {
    g(-i);  // POI: 二阶段查找，T 为 A 时可以使用 ADL，T 为 int 时找不到 g
  }
}

void g(Int) {  // 这里的 g 是 POI
  f<Int>(42);  // 调用点
}

}  // namespace jc

int main() {}
```

在上述代码中，当调用 `f<Int>(42)` 时，编译器会在 `f` 的调用位置实例化 `f<Int>`，这时编译器会查找 `g()`。如果 `T` 是 `A`，则通过 **ADL（Argument-Dependent Lookup）** 找到 `g()`，否则无法找到。

### 2. POI 的位置限制

类模板实例的 POI 位置只能在包含该实例声明或定义之前的最近作用域内。

#### 示例：POI 的位置限制

```cpp
namespace jc {

template <typename T>
struct A {
  T x;
};

// POI 位置
int f() {
  // 不能作为 POI，因为 A<int> 的定义不能出现在函数作用域内
  return sizeof(A<int>);
  // 不能作为 POI，因为 sizeof(A<int>) 在函数作用域内无法解析
}

}  // namespace jc

int main() {}
```

在上面的代码中，`sizeof(A<int>)` 无法在 `f()` 函数中成为 POI，因为类模板 `A<int>` 的定义必须在该位置之前才能正确实例化。

### 3. 模板实例化的连锁效应

实例化一个模板时，可能会触发其他模板的实例化。这种“连锁”效应会导致多个 POI。

#### 示例：模板实例化引发的连锁 POI

```cpp
namespace jc {

template <typename T>
struct A {
  using type = int;
};

template <typename T>
void f() {
  A<char>::type a = 0;  // A<char> 的 POI
  typename A<T>::type b = 0;  // A<T> 的 POI
}

}  // namespace jc

int main() {
  jc::f<double>();  // f<double> 的 POI
  // A<double> 的 POI
  // f<double> 的 POI
}
```

在这个例子中，调用 `jc::f<double>()` 会导致 `A<double>` 和 `A<char>` 的实例化。因此，`f<double>` 和 `A<double>` 的 POI 会在不同的点产生。

### 4. POI 的重复性与优化

一个编译单元通常会包含一个模板实例的多个 POI。然而，对于类模板实例化，通常每个编译单元只会保留首个 POI，其他 POI 会被忽略。对于函数模板和变量模板的实例化，所有 POI 都会被保留。

## 模板的链接（Linkage of Templates）

### 1. 类模板的名称冲突

类模板的名称不能与其他实例的名称冲突。

#### 示例：名称冲突

```cpp
namespace jc {

int A;

class A;  // OK：两者名称在不同的作用域内

int B;

template <typename T>
struct B;  // 错误：模板名称与非模板名称冲突

struct C;

template <typename T>
struct C;  // 错误：模板名称与非模板名称冲突

}  // namespace jc

int main() {}
```

在上面的代码中，`struct A` 和 `int A` 的名称冲突会导致编译错误。同样，模板名称 `B` 和 `C` 与非模板类型冲突也会导致错误。

### 2. 模板不能具有 C 链接

模板不能与 C 语言的链接规范（C linkage）一起使用。

#### 示例：C 链接错误

```cpp
namespace jc {

extern "C++" template <typename T>
void normal();  // 正确：默认 C++ 链接规范

extern "C" template <typename T>
void invalid();  // 错误：不能使用 C 链接

extern "Java" template <typename T>
void java_link();  // 非标准链接，某些编译器可能支持

}  // namespace jc

int main() {}
```

模板不能使用 C 链接规范（`extern "C"`）。如果使用 `extern "C++"`，则为默认的 C++ 链接规范。

### 3. 模板的外链接与静态链接

模板通常具有外链接（**external linkage**）。然而，**静态模板函数**（即加上 `static` 关键字的模板函数）会具有内部链接（**internal linkage**），这使得它在当前翻译单元内可见，但在其他翻译单元中不可见。

#### 示例：静态与外部链接

```cpp
template <typename T>  // 外部链接
void external();

template <typename T>  // 内部链接
static void internal();

namespace {
template <typename>  // 内部链接
void other_internal();
}

struct {
  template <typename T>  // 无链接：不能被重复声明
  void f(T) {}
} x;

int main() {}
```

### 4. 链接错误

与普通函数不同，如果模板的声明和实现分离，通常会出现链接错误，因为编译器在函数调用处没有看到模板实例化的定义，只会假设在其他地方提供了定义，链接器依赖该引用进行解决。

#### 示例：模板声明与实现分离导致链接错误

```cpp
// a.hpp
#pragma once

namespace jc {

template <typename T>
class A {
 public:
  void f();
};

}  // namespace jc

// a.cpp
#include "a.hpp"

namespace jc {

template <typename T>
void A<T>::f() {}

}  // namespace jc

// main.cpp
#include "a.hpp"

int main() {
  jc::A<int>{}.f();  // 链接错误
}
```

上面的代码会导致链接错误，因为 `A<int>::f()` 的实现只出现在 `a.cpp` 中，但在 `main.cpp` 中调用时，编译器无法找到该定义。

### 5. 推荐的做法：在头文件中实现模板

为了避免链接错误，通常建议在头文件中直接实现模板。

#### 示例：头文件中实现模板

```cpp
// a.hpp
#pragma once

namespace jc {

template <typename T>
class A {
 public:
  void f();
};

template <typename T>
inline void A<T>::f() {}

}  // namespace jc

// main.cpp
#include "a.hpp"

int main() {
  jc::A<int>{}.f();
}
```

通过这种方式，模板的实现会在头文件中直接提供，避免了链接错误。

## 显式实例化（Explicit Instantiation）

显式实例化是手动指定模板实例化特定类型的机制。它允许将模板的定义与实例化分离，并控制哪些模板类型在编译期间被实例化。

### 1. 显式实例化的基本用法

在头文件中使用 `extern` 声明显式实例化，告知用户哪些类型的模板被实例化。

#### 示例：显式实例化

```cpp
// a.hpp
#pragma once

namespace jc {

template <typename T>
class A {
 public:
  void f();
};

extern template class A<int>;         // 声明 A<int> 的显式实例化
extern template void A<double>::f();  // 声明 A<double>::f() 的显式实例化

}  // namespace jc

// a.cpp
#include "a.hpp"

namespace jc {

template <typename T>
void A<T>::f() {}

template class A<int>;  // 实例化 A<int>
template void A<double>::f();  // 实例化 A<double>::f()

}  // namespace jc

// main.cpp
#include "a.hpp"

int main() {
  jc::A<int>{}.f();
  jc::A<double>{}.f();
}
```

### 2. 分离实例化实现

显式实例化可以将实例化过程提取到单独的源文件中，这有助于减小头文件的大小和提高编译效率。

#### 示例：分离显式实例化实现

```cpp
// a.hpp
#pragma once

namespace jc {

template <typename T>
class A {


 public:
  void f();
};

extern template class A<int>;
extern template void A<double>::f();

}  // namespace jc

// a.cpp
#include "a.hpp"

namespace jc {

template <typename T>
void A<T>::f() {}

template class A<int>;
template void A<double>::f();

}  // namespace jc

// a_init.cpp
#include "a.cpp"

namespace jc {

template class A<int>;
template void A<double>::f();

}  // namespace jc

// main.cpp
#include "a.hpp"

int main() {
  jc::A<int>{}.f();
  jc::A<double>{}.f();
}
```

### 3. 显式实例化不会影响类型推断

显式实例化只影响模板实例化，并不会影响类型推断规则。模板实例化和类型推断始终保持一致。

#### 示例：显式实例化与类型推断

```cpp
namespace jc {

template <typename T>
void f(T, T) {}

template void f<double>(double, double);

}  // namespace jc

int main() {
  jc::f<double>(1, 3.14);  // OK
  jc::f(1, 3.14);  // 错误：推断类型不一致，不存在普通函数 f(double, double)
}
```

### 4. 显式实例化与特化冲突

显式实例化后，不能为相同的类型定义特化。

#### 示例：显式实例化与特化冲突

```cpp
namespace jc {

template <typename T>
struct A {
  void f();
};

template <typename T>
void A<T>::f() {}

template struct A<int>;  // 显式实例化 A<int>

// 不允许为 A<int> 定义特化
// template <>
// struct A<int> {};  // 错误

}  // namespace jc

int main() {}
```

### 5. 显式实例化与友元函数

通过显式实例化，可以为已有的类添加友元函数。

#### 示例：显式实例化与友元函数

```cpp
#include <cassert>
#include <iostream>
#include <string>

namespace jc {

template <auto>
struct A;

template <typename T, typename Class, T Class::*Member>
struct A<Member> {
  friend T& get(Class& c) { return c.*Member; }
};

}  // namespace jc

class Data {
 public:
  std::string value() const { return value_; }

 private:
  std::string value_ = "downdemo";
};

template struct jc::A<&Data::value_>;
std::string& jc::get(Data&);

int main() {
  Data data;
  assert(data.value() == "downdemo");
  jc::get(data) = "june";
  assert(data.value() == "june");
}
```

通过显式实例化，`get` 成为 `Data` 类的友元函数，从而能够访问 `value_` 成员。

### 98. ref

#### 1. 什么是ADL？
在C++里，ADL（Argument-Dependent Lookup）也被叫做Koenig查找，它是一种在函数调用时确定函数名称查找范围的规则。在普通的名称查找里，编译器会在当前作用域以及包含当前作用域的外层作用域里查找函数名。而ADL会额外在实参所属的命名空间里查找函数名。

* **规则**
当调用一个函数时，如果没有指定命名空间限定符，编译器除了在常规作用域查找函数名外，还会在实参类型所在的命名空间进行查找。这意味着如果函数调用的实参属于某个命名空间，编译器会自动在该命名空间中查找匹配的函数。

* **示例**
```cpp
#include <iostream>

namespace MyNamespace {
    struct MyType {};

    void myFunction(MyType) {
        std::cout << "Function called from MyNamespace" << std::endl;
    }
}

int main() {
    MyNamespace::MyType obj;
    // 这里调用 myFunction 时，编译器会通过 ADL 在 MyNamespace 中找到该函数
    myFunction(obj); 
    return 0;
}
```
在这个示例里，`myFunction` 定义于 `MyNamespace` 命名空间中。在 `main` 函数里调用 `myFunction` 时，并未指定命名空间限定符。不过由于实参 `obj` 的类型 `MyType` 属于 `MyNamespace` 命名空间，所以编译器会通过ADL在 `MyNamespace` 中找到 `myFunction`。

* **优点**
- **简化代码**：在使用自定义类型时，无需每次都显式指定命名空间，使代码更加简洁。
- **增强封装性**：允许将函数与类型定义在同一个命名空间中，提高了代码的封装性和可维护性。

* **注意事项**
- **命名冲突**：ADL可能会导致命名冲突，特别是在多个命名空间中存在同名函数时。
- **意外调用**：由于ADL会在实参类型所在的命名空间中查找函数，可能会导致意外的函数调用。因此，在编写代码时需要注意命名的选择和作用域的管理。 