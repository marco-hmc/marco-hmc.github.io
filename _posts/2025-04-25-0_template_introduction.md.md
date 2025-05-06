---
layout: post
title: 模板的入门使用
categories: language
related_posts: True
tags: cpp template
toc:
  sidebar: left
---

# 模板的入门使用

> Marco

```c++
├── 1. 模板基础
│   ├── 1.1 什么是模板（函数模板/类模板/变量模板）
│   ├── 1.2 模板的基本语法
│   │   ├── 1.2.1 注入类名
│   │   ├── 1.2.2 依赖名称
├── 2. 模板参数
│   ├── 2.1 类型模板参数
│   ├── 2.2 非类型模板参数
│   └── 2.3 模板模板参数
├── 3. 模板实例化
│   ├── 3.1 隐式实例化
│   ├── 3.2 显式实例化
│   └── 3.3 模板链接
├── 4. 模板特化
│   ├── 4.1 模板特化
│   ├── 4.2 模板偏特化
│   └── 4.3 特化的推断规则
```

1. **模板基础**：介绍模板的基本概念和语法，包括函数模板和类模板的定义和使用。
2. **模板参数**：详细讲解模板参数的类型，包括类型模板参数、非类型模板参数和模板模板参数。
3. **模板实例化**：解释模板实例化的概念和时机，包括显式实例化和隐式实例化。
4. **模板特化**：介绍模板特化的概念和应用场景，包括部分特化和全特化。
5. **模板的高级用法**：深入探讨模板的高级用法，包括模板的递归、偏特化、SFINAE 和模板元编程。
6. **模板与继承**：讨论模板类的继承关系，包括 CRTP 模式和模板与多态的结合。
7. **C++11/14/17/20 中的模板新特性**：介绍 C++11、C++14、C++17 和 C++20 中引入的模板新特性，如变参模板、类型别名模板、变量模板、折叠表达式、概念和约束。
8. **模板的常见问题**：分析模板代码膨胀、编译错误和调试等常见问题。

## 1. 模板基础

### 1.1 什么是模板

- **概念上**
  模板是 C++ 中的一种泛型编程工具，它允许你编写与类型无关的代码。通过使用模板，你可以编写一次代码，然后在不同的上下文中重用它，而不需要为每种类型编写单独的代码。
  如果从概念上理解，对于编译器来说模板可以看成是基于类型的编程，或者称之为面向类型编程。

模板的值对象，其实就是类型和常量；模板特化，其实就是是对于类型做 if-else判断；模板的递归，其实就对通过模板不停实例化展开。也就是说模板实际上是能够做到存在变量的概念，if-else 能力，loop 能力，且这些能力的实现与一般c++开发不相同，因此会有人觉得c++的模板是非常接近一门单独的语言的。而这种语言的编程就是模板元编程。

那模板编程的好处是什么呢？

- 如果单单从狭义的泛型编程来看，正如前面提到的，因为写的是类型无关的代码，当声明了类型，完成了模板实例化的时候，就可以复用代码了。
- 还有什么好处呢？远远提升了泛型编程的能力，比如说实现一个容器对象，容器对象的`clear()`，即清除容器内所有元素的函数。这个函数对于 POD 类型（plain old data，可简单理解为默认类型）和自定义类型来说是有两种实现要求的。如果是 POD 类型，不会管理资源，其析构函数概念弱，不强调，直接`memset(0)`就好了；而自定义类型是可能管理资源，当调用`clear()`的时候是需要对元素逐个调用其析构函数的。这个时候就需要强调对类型有 if-else 的能力了。

- **模板内容划分**
  从用法来看，C++ 模板可以归类粗浅归为以下两种，入门和进阶两种：

1. **入门使用-简单泛型编程（Generic Programming）**：

   - **函数模板**：函数模板允许编写与类型无关的函数，通过类型参数化实现函数的泛型。例如，`std::sort` 可以对任何类型的容器进行排序。
   - **类模板**：类模板允许编写与类型无关的类，通过类型参数化实现类的泛型。例如，`std::map<Key, Value>` 可以存储任何类型的键值对。
   - **变量模板**：主要是用于模板元编程，类型特征那套，也可以用于表示`pi`在不同类型下的大小吧，比如说精度要求不高，可以`float`和`double`各定义一个`pi`吧。
   - **模板参数**：模板允许编写与类型无关的代码，通过类型参数化实现代码复用。例如，`std::vector<T>` 可以存储任何类型的元素。
   - **模板特化**：模板特化允许为特定类型提供特殊的实现，从而优化特定类型的操作。例如，`std::hash` 可以为不同类型提供不同的哈希函数。

2. **进阶使用-模板元编程（Template Metaprogramming）**：
   - **类型特征（Type Traits）**：通过模板元编程，可以实现类型特征，用于在编译期检查和操作类型。进一步地，可以认为是一种函数。其参数为类型或者字面量。例如，`std::is_integral` 可以用于检查一个类型是否是整型。
   - **递归模板**：模板元编程通常使用递归模板来实现复杂的编译期计算。例如，计算编译期常量、生成类型列表等。
   - **条件编译**：通过模板元编程，可以实现条件编译，根据不同的模板参数生成不同的代码。而SAFINAE是模板元编程，利用type traits实现条件编译的一种常见手段。

### 1.2 模板的基本语法

模板的基本语法包括模板声明、模板定义和模板实例化。模板声明和定义使用 `template` 关键字，后跟模板参数列表。模板参数列表可以包含类型参数和非类型参数。

```cpp
// 函数模板
template <typename T>
T functionName(T parameter) {
    // 函数体
}

// 类模板
template <typename T>
class ClassName {
public:
    T memberFunction(T parameter) {
        // 函数体
    }
private:
    T memberVariable;
};
```

#### 1.2.1 注入类名

在C++中，类模板的注入类名（Injected class name）是指在类模板内部，类模板名可以被用作一个类型名，并且这个名字会隐式地被替换为当前实例化的模板类型。下面详细介绍其含义和使用场景。

```cpp
#include <iostream>

template <typename T>
class MyClass {
public:
    // ctor里面的MyClass能直接使用，不需要再考虑模板实例化，这个就是注入类名
    MyClass(const MyClass& other) {
        std::cout << "Copy constructor called." << std::endl;
    }

    MyClass<T> clone() {
        return *this;
    }

    static MyClass createInstance() {
        return MyClass();
    }
};

```

- 注入类名主要用于类模板内部，简化代码书写。
- 在类模板外部，使用类模板名时通常需要显式指定模板参数。
- 注入类名可以提高代码的可读性和可维护性，特别是在复杂的模板类中。

#### 1.2.2 依赖名称

- **依赖名称和typename**

依赖名称是指在模板定义中，其含义依赖于模板参数的名称。也就是说，这些名称的类型或值在模板实例化时才能确定。

```cpp
#include <iostream>

template <typename T>
class Container {
public:
    class Iterator {
    public:
        void print() {
            std::cout << "Iterator print" << std::endl;
        }
    };

    Iterator getIterator() {
        return Iterator();
    }
};

// Container<T>也是依赖名称
template <typename T>
void process(Container<T>& container) {
    // Container<T>::Iterator也是依赖名称
    typename Container<T>::Iterator it = container.getIterator();
    it.print();
}
```

- 简单来说需要实例化的类型的，都是依赖名称的。
- 编译器读到 `Container<T>::Iterator` 时，无法知道这是一个类型；因为还没有实例。
- 因此需要使用 `typename` 关键字显式告诉编译器这是一个类型。
- 在函数签名的时候，编译器还能推断出来这是一个类型，因此可写可不写。
- 在声明变量的时候，编译器没办法确定是不是一个方法，因此需要加上`typename`。

- **依赖名称和template**

```cpp
#include <iostream>

template <typename T>
class Container {
public:
    template <typename U>
    void print(U value) {
        std::cout << "Value: " << value << std::endl;
    }
};

template <typename T>
void test(Container<T>& c) {
    // 在实例化模板的时候，如果还有一个嵌套的模板
    // 编译器需要知道print也是一个模板函数，还需要接着实例化
    // 因此要用template
    c.template print<int>(42);
}

int main() {
    Container<double> c;
    test(c);
    return 0;
}
```

## 2. 模板参数

### 2.1 类型模板参数

类型是模板参数的一种，用于指定模板的类型。类型模板参数允许你编写与类型无关的代码，从而提高代码的重用性和灵活性。类型模板参数通常使用 `typename` 或 `class` 关键字来声明。

```cpp
// 函数模板示例
template <typename T>
T add(T a, T b) {
    return a + b;
}

// 类模板示例
template <typename T>
class Pair {
public:
    Pair(T first, T second) : first(first), second(second) {}
    T getFirst() const { return first; }
    T getSecond() const { return second; }
private:
    T first;
    T second;
};

int main() {
    int result1 = add(3, 4);
    double result2 = add(3.5, 4.5);

    Pair<int> intPair(1, 2);
    Pair<double> doublePair(3.5, 4.5);

    return 0;
}
```

### 2.2 非类型模板参数

简单来说就是模板参数是非类型参数，或者说常量。

非类型模板参数是模板参数的一种，用于指定模板的常量值。非类型模板参数可以是整数、枚举、指针或引用等。非类型模板参数允许你在模板中使用常量值，从而提高代码的灵活性。

```cpp
// 函数模板示例
template <typename T, int N>
T arraySum(T (&arr)[N]) {
    T sum = 0;
    for (int i = 0; i < N; ++i) {
        sum += arr[i];
    }
    return sum;
}

// 类模板示例
template <typename T, int N>
class Array {
public:
    T& operator[](int index) {
        return data[index];
    }
    const T& operator[](int index) const {
        return data[index];
    }
private:
    T data[N];
};

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    int sum = arraySum(arr);
    Array<int, 10> intArray;
    intArray[0] = 42;

    return 0;
}
```

### 2.3 模板模板参数

模板本身也可以是模板参数的一种，用于指定模板的模板参数。模板模板参数允许你编写接受其他模板作为参数的模板，从而提高代码的灵活性和重用性。

```cpp
// 类模板示例
template <typename T>
class Container {
public:
    void add(const T& value) {
        data.push_back(value);
    }
    const T& get(int index) const {
        return data[index];
    }
private:
    std::vector<T> data;
};

// 模板参数还是模板的示例
template <template <typename> class ContainerType, typename T>
class Wrapper {
public:
    void add(const T& value) {
        container.add(value);
    }
    const T& get(int index) const {
        return container.get(index);
    }
private:
    ContainerType<T> container;
};

int main() {
    Wrapper<Container, int> intWrapper;
    intWrapper.add(42);
    int value = intWrapper.get(0);

    return 0;
}
```

其实实际上模板也可以看成是一种类型，只是一种编译时才能确定的类型。

## 3. 模板实例化

模板实例化是指将模板转换为具体类型的过程。在 C++ 中，模板实例化有两种主要方式：显式实例化和隐式实例化。模板实例化的时机也非常重要，因为它决定了模板代码何时被编译。

模板实例化是将模板代码转换为具体类型的代码的过程。显式实例化和隐式实例化是两种主要的模板实例化方式。显式实例化通过明确指定模板参数强制编译器生成特定类型的模板实例，而隐式实例化则由编译器在需要使用模板时自动生成模板实例。模板实例化的时机对编译速度和代码膨胀有重要影响。通过理解模板实例化的概念、显式实例化、隐式实例化和模板实例化的时机，可以更好地编写和优化模板代码。

模板实例化是将模板代码转换为具体类型的代码的过程。模板实例化发生在编译时，编译器会根据模板参数生成具体的函数或类定义。
模板实例化的结果是一个具体的函数或类，可以在程序中使用。

### 3.1 隐式实例化

隐式实例化是指编译器在需要使用模板时自动生成模板实例。隐式实例化通常发生在模板被第一次使用时，编译器会根据模板参数自动生成具体的函数或类定义。

```cpp
template <typename T>
T add(T a, T b) {
    return a + b;
}

int main() {
    int result1 = add(3, 4); // 这里发生了隐式实例化
    double result2 = add(3.5, 4.5); // 这里发生了隐式实例化
    return 0;
}
```

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

- **显式实例化怎么做？**

```cpp
/* -------- a.hpp --------- */
#pragma once

template <typename T>
class A {
 public:
  void f();
}
extern template class A<int>;         // 声明 A<int> 的显式实例化
extern template void A<double>::f();  // 声明 A<double>::f() 的显式实例化

/* -------- a.cpp --------- */
#include "a.hpp"

template <typename T>
void A<T>::f() {}

template class A<int>;  // 实例化 A<int>
template void A<double>::f();  // 实例化 A<double>::f()

/* -------- main.cpp --------- */
#include "a.hpp"

int main() {
  A<int>{}.f();
  A<double>{}.f();
}
```

### 3.3 模板链接

#### 3.3.1 模板实现不能放在.cpp

odr问题。

#### 3.3.2 模板不能具有 C 链接

模板不能与 C 语言的链接规范（C linkage）一起使用。

```cpp
namespace jc {
    extern "C++" template <typename T>
    void normal();  // 正确：默认 C++ 链接规范

    extern "C" template <typename T>
    void invalid();  // 错误：不能使用 C 链接
}  // namespace jc

int main() {}
```

模板不能使用 C 链接规范（`extern "C"`）。如果使用 `extern "C++"`，则为默认的 C++ 链接规范。

#### 3.3.3 模板的外链接与静态链接

模板通常具有外链接（**external linkage**）。然而，**静态模板函数**（即加上 `static` 关键字的模板函数）会具有内部链接（**internal linkage**），这使得它在当前翻译单元内可见，但在其他翻译单元中不可见。

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

## 4. 模板特化

模板特化（Template Specialization）是 C++ 模板编程中的一个重要概念，它允许你为特定的模板参数提供特殊的实现。模板特化分为部分特化和全特化。通过模板特化，你可以为特定类型或特定条件提供优化的实现，从而提高代码的灵活性和性能。

模板特化在以下场景中非常有用：

1. **优化特定类型**：为特定类型提供优化的实现。例如，为 `int` 类型提供特殊的实现，以提高性能。
2. **处理特殊情况**：处理特定类型或条件下的特殊情况。例如，为指针类型提供特殊的实现，以处理指针的解引用和内存管理。
3. **实现类型特征**：实现类型特征（type traits），用于在编译时检查类型属性。例如，检查类型是否为指针类型、是否为整数类型等。

模板特化是 C++ 模板编程中的一个重要概念，它允许你为特定的模板参数提供特殊的实现。模板特化分为部分特化和全特化。部分特化用于为模板的某些特定参数提供特殊的实现，而全特化用于为模板的所有参数提供特殊的实现。通过模板特化，你可以为特定类型或特定条件提供优化的实现，从而提高代码的灵活性和性能。模板特化在优化特定类型、处理特殊情况和实现类型特征等场景中非常有用。

### 4.1 模板特化

```c++
#include <iostream>

namespace FullSpecialization {
    // 主模板
    template <typename T>
    class MyClass {
      public:
        void print() { std::cout << "Primary template" << std::endl; }
    };

    // 模板特化
    template <>
    class MyClass<int> {
      public:
        void print() {
            std::cout << "Full specialization for int" << std::endl;
        }
    };
}  // namespace FullSpecialization

```

### 4.2 模板偏特化

```c++
namespace PartialSpecialization {
    // 主模板
    template <typename T, typename U>
    class MyClass {
      public:
        void print() { std::cout << "Primary template" << std::endl; }
    };

    // 偏特化-部分模板参数特化
    template <typename T>
    class MyClass<T, int> {
      public:
        void print() {
            std::cout << "Partial specialization: second parameter is int"
                      << std::endl;
        }
    };
}  // namespace PartialSpecialization
```

### 4.3 特化的推断规则

当多个模板匹配时，编译器通过偏序规则选择更特化的模板；若无法比较特化程度，则报歧义错误。
普遍资料都是说会选择更特化的模板，但对何为更特化的定义说的不是很清楚。这里我给出我的理解：
如果模板参数能匹配两个模板，这两个模板只有在一个会是另一个模板的真子集的时候才能编译通过，并且最终会匹配真子集那一个模板；如果不是真子集关系，同时能匹配多个模板的时候就会出现编译器错误。

```cpp
#include <cassert>

template <typename T>
int f(T) {
    return 1;
}

template <typename T>
int f(T*) {
    return 2;
}
template <typename T>
int f(const T*) {  // 3
    return 3;
}

int main() {
    assert(f(0) == 1);  // 0 推断为 int，匹配第一个模板
    assert(f(nullptr) == 1);

    int* p = nullptr;
    assert(f(p) == 2);  // 两个模板均匹配，第二个模板更特殊。T*是T的真子集

    const int* pp = nullptr;
    assert(f(pp) == 3); // 两个模板均匹配，第三个模板更特殊。const T*是T和T*的真子集
}
```

## 99. quiz

### 1. 不同源文件都使用了`vector<int>`，有没有违反odr原则？实例化了几次？代码里面会有多少`vector<int>`的定义？

在 C++ 中，模板实例化的行为取决于编译器和链接器的实现。
通常情况下，如果多个源文件都使用了相同的模板实例（例如 vector<int>），编译器会在每个使用该模板实例的源文件中生成一份实例化代码。
然而，链接器会负责消除重复的实例化代码，只保留一份最终的实例化代码。

也就是说不同源文件使用了相同的模板实例就会各自实例化，但是链接器会优化，合并重复实例代码。
注意，合并了重复的实例代码，只是减轻了代码生成的体积，实例的开销没办法去掉，所以模板用多了，编译会慢一些，开销在于模板实例化。

### 2. 怎么显式实例化？显式实例化的好处是什么？

```cpp
/* -------- a.hpp --------- */
#pragma once

template <typename T>
class A {
 public:
  void f();
}
extern template class A<int>;         // 声明 A<int> 的显式实例化
extern template void A<double>::f();  // 声明 A<double>::f() 的显式实例化

/* -------- a.cpp --------- */
#include "a.hpp"

template <typename T>
void A<T>::f() {}

template class A<int>;  // 实例化 A<int>
template void A<double>::f();  // 实例化 A<double>::f()

/* -------- main.cpp --------- */
#include "a.hpp"

int main() {
  A<int>{}.f();
  A<double>{}.f();
}
```

### 3. 什么是ADL？

在C++里，ADL（Argument-Dependent Lookup）也被叫做Koenig查找，它是一种在函数调用时确定函数名称查找范围的规则。在普通的名称查找里，编译器会在当前作用域以及包含当前作用域的外层作用域里查找函数名。而ADL会额外在实参所属的命名空间里查找函数名。

- **规则**
  当调用一个函数时，如果没有指定命名空间限定符，编译器除了在常规作用域查找函数名外，还会在实参类型所在的命名空间进行查找。这意味着如果函数调用的实参属于某个命名空间，编译器会自动在该命名空间中查找匹配的函数。

- **示例**

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

- **优点**

* **简化代码**：在使用自定义类型时，无需每次都显式指定命名空间，使代码更加简洁。
* **增强封装性**：允许将函数与类型定义在同一个命名空间中，提高了代码的封装性和可维护性。

- **注意事项**

* **命名冲突**：ADL可能会导致命名冲突，特别是在多个命名空间中存在同名函数时。
* **意外调用**：由于ADL会在实参类型所在的命名空间中查找函数，可能会导致意外的函数调用。因此，在编写代码时需要注意命名的选择和作用域的管理。

### 4. 下面这些代码的注释处为什么不行？

```c++
namespace StringLinkErrorTpl {

    template <const char* s>
    class S {
      public:
        void print() { std::cout << s << std::endl; }
    };

    const char str[] = "abc";  // external linked object
    void syntax_literal_string_ok_example() {
        S<str> i;
        i.print();
    }

    void syntax_literal_string_fail_example() {
        const char str[] = "abc";  // running linked object
        // S<str> i; // not ok
        // i.print();
    }

    void task() {
        syntax_literal_string_ok_example();
        syntax_literal_string_fail_example();
    }
}  // namespace StringLinkErrorTpl

namespace PtrLinkErrorTpl {
    template <int* buf>
    struct ArrPtr {};

    template <int (*fun)()>
    struct FuncPtr {};

    void task() {
        static int buffer[5] = {1, 2, 3, 4, 5};
        ArrPtr<buffer> arrPtr;

        // int buffer2[5] = {1, 2, 3, 4, 5};  // not ok
        // ArrPtr<buffer2> arrPtr2;

        auto func = []() -> int { return 42; };
        FuncPtr<func> funcPtr;
    }
}  // namespace PtrLinkErrorTpl
```
