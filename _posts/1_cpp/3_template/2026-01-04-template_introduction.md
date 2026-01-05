---
layout: post
title: （一）模板那些事儿：是什么？
categories: C++
related_posts: True
tags: Template
toc:
  sidebar: right
---

## （一）模板那些事儿：是什么？

1. **模板基础**：介绍模板的基本概念和语法，包括函数模板和类模板的定义和使用。
2. **模板参数**：详细讲解模板参数的类型，包括类型模板参数、非类型模板参数和模板模板参数。
3. **模板实例化**：解释模板实例化的概念和时机，包括显式实例化和隐式实例化。
4. **模板特化**：介绍模板特化的概念和应用场景，包括部分特化和全特化。

### 1. 模板基础

#### 1.1 什么是模板

从应用层次来看，C++中的模板堪称一种极为强大的泛型编程工具，它使得编写与类型无关的代码成为可能。借助模板，只需完成一次代码编写，就能在各种不同场景中重复运用，无需针对每种类型都另行编写代码。

- **狭义泛型编程层面**：如前文所述，由于编写的是与类型无关的代码，一旦声明具体类型并完成模板实例化，代码即可实现复用。例如，编写一个简单的交换函数模板：

```cpp
template <typename T>
void swap(T& a, T& b) {
    T temp = a;
    a = b;
    b = temp;
}
```

然而，这种实现并非尽善尽美，如果我需要对一些特殊类型做特殊操作呢？为解决此问题，可以利用模板特化来实现特殊交换函数。但模板特化只能针对某一个具体类型给出特殊实现，但倘若需要对具有某种性质的一类类型进行特化，情况又当如何呢？

例如，对于一个容器的`clear()`函数，POD 类型（Plain Old Data，即具有平凡构造函数、平凡析构函数、平凡拷贝构造函数且为标准布局的数据类型，像 C++中的基本数据类型`int`、`char`等以及满足特定条件的自定义结构体和类都属于 POD 类型）和自定义类型的实现要求便有所不同。

POD 类型通常不涉及复杂的资源管理，其析构函数的概念相对薄弱，在`clear()`函数中直接使用`memset(0)`来清理内存即可；而自定义类型可能涉及资源管理，调用`clear()`时需要逐个调用元素的析构函数。此时，模板的条件判断能力就显得至关重要。也就是说，如果我如何实现能够对POD类型数据进行一个特化实现，而非POD又是另一个特化实现呢？这是没办法简单通过模板特化来实现的。

可以这么说，一般模板特化的实现更近似于`switch - case`的形式，是一个类型对应一个特化的条件判断，而无法达成类似于`if - else`的针对某一类的普遍特化。为解决这一难题，C++11 引入了`std::enable_if`，它允许在模板参数中运用条件表达式，进而实现更为灵活的模板特化。通过这种方式，能够依据类型的特性来选择不同的实现。这也是后面会进一步展开的。

---

从概念层面来讲，对于编译器而言，模板可看作是一种基于类型的编程模式，也可称之为面向类型编程。模板的值对象涵盖类型与常量；模板特化类似于针对类型进行条件判断，它允许针对特定类型提供专门的模板实现。例如，当模板在处理多种不同类型时，如果对某些特定类型存在特殊需求，便可借助模板特化来予以满足；而模板递归则是通过持续不断地实例化模板来逐步展开。综上可以认为，模板具备类似于变量、条件判断（if - else）以及循环（loop）的能力，只不过这些能力的实现方式与常规 C++语法存在差异。正因如此，不少人觉得 C++的模板近乎一门独立的语言，而基于此的编程方式便被称作模板元编程。

这个时候，其实可以从函数的角度去理解模板。模板就像是一个函数，这个函数的参数是类型或者字面量（常量）。当调用这个函数时，传入具体的类型或者常量，函数体内的代码会根据传入的参数进行相应的操作。模板的实例化过程就类似于函数调用的过程，只不过这里的“调用”发生在编译期，而不是运行时。

```cpp
/*
    函数名为`add`，传入参数为类型模板参数`T`，表示函数可以接受任何类型的参数。
    计算操作是给出特定类型的函数特化。
*/
template <typename T>
T add(T a, T b) {
    return a + b;
}

/*
    函数名为`fib`，传入参数为非类型模板参数`N`，表示要计算的斐波那契数列的第`N`项。
    计算完成在编译期。
*/
template <int N>
constexpr int fib = fib<N - 1> + fib<N - 2>;
template <>
constexpr int fib<0> = 0;
template <>
constexpr int fib<1> = 1;
static_assert(fib<10> == 55);

int main() {
    int result1 = add<int>(3, 4); // 实例化为 int 类型的 add 函数
    double result2 = add(3.5, 4.5); // 实例化为 double 类型的 add 函数
    return 0;
}
```

关于模板的内容我会从两方面展开讲，简单划分为入门内容（语法层面），进阶内容（模板元编程层面）展开。具体如下：

1. **入门使用-简单泛型编程（Generic Programming）**：

   - **函数模板**：函数模板允许编写与类型无关的函数，通过类型参数化实现函数的泛型。例如，`std::sort` 可以对任何类型的容器进行排序。
   - **类模板**：类模板允许编写与类型无关的类，通过类型参数化实现类的泛型。例如，`std::map<Key, Value>` 可以存储任何类型的键值对。
   - **变量模板**：主要是用于模板元编程，类型特征那套，也可以用于表示`pi`在不同类型下的大小吧，比如说精度要求不高，可以`float`和`double`各定义一个`pi`吧。
   - **模板参数**：模板允许编写与类型无关的代码，通过类型参数化实现代码复用。例如，`std::vector<T>` 可以存储任何类型的元素。
   - **模板特化**：模板特化允许为特定类型提供特殊的实现，从而优化特定类型的操作。例如，`std::hash` 可以为不同类型提供不同的哈希函数。

2. **进阶使用-模板元编程（Template Metaprogramming）**：

   - **类型特征（Type Traits）**：通过模板元编程，可以实现类型特征，用于在编译期检查和操作类型。进一步地，可以认为是一种函数。其参数为类型或者字面量。例如，`std::is_integral` 可以用于检查一个类型是否是整型。
   - **递归模板**：模板元编程通常使用递归模板来实现复杂的编译期计算。例如，计算编译期常量、生成类型列表等。
   - **条件编译**：通过模板元编程，可以实现条件编译，根据不同的模板参数生成不同的代码。而 SAFINAE 是模板元编程，利用 type traits 实现条件编译的一种常见手段。

3. **模板实践**
   - 不定长参数
   - 类型擦除
   - 表达式模板
   - 不同编译器下的模板实现差异

#### 1.2 模板的基本语法

模板的基本语法包括模板声明、模板定义和模板实例化。模板声明和定义使用 `template` 关键字，后跟模板参数列表。模板参数列表可以包含类型参数和非类型参数。

```cpp
{
    // 函数模板
    template <typename T>
    T functionName(T parameter) {}
}

{
    // 类模板
    template <typename T>
    class ClassName {
      public:
        T memberFunction(T parameter) {}

      private:
        T memberVariable;
    };
}

{
    // C++14（变量模板）
    template <typename T>
    inline constexpr bool is_integral_v = std::is_integral<T>::value;
    static_assert(is_integral_v<int>);

    template <int N>
    constexpr int fib = fib<N - 1> + fib<N - 2>;
    template <>
    constexpr int fib<0> = 0;
    template <>
    constexpr int fib<1> = 1;
    static_assert(fib<10> == 55);
}
```

##### 1.2.1 注入类名

在 C++中，类模板的注入类名（Injected class name）是指在类模板内部，类模板名可以被用作一个类型名，并且这个名字会隐式地被替换为当前实例化的模板类型。下面详细介绍其含义和使用场景。

```cpp
#include <iostream>

template <typename T>
class MyClass {
public:
    // ctor里面的MyClass能直接使用，不需要再考虑模板实例化，这个就是注入类名
    MyClass(const MyClass& other) {
        std::cout << "Copy constructor called." << std::endl;
    }

    // 模板又实例化一次是多余的。
    MyClass<T> clone() {
        return *this;
    }

    static MyClass createInstance() {
        return MyClass();
    }
};

```

##### 1.2.2 依赖名称

- **依赖名称和 typename**

依赖名称是模板定义中，其含义依赖于模板参数的名称。这些名称的类型或值，需在模板实例化时才能确定。
在这个场景中，可简单理解为带了模板参数的符号，但这个理解并不完全完成准确。

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

// Container<T>是依赖名称，因为其具体类型依赖于模板参数T
template <typename T>
void process(Container<T>& container) {
    // Container<T>::Iterator同样是依赖名称，其具体类型也依赖于模板参数T
    typename Container<T>::Iterator it = container.getIterator();
    it.print();
}
```

依赖名称不仅包括依赖于模板参数实例化的类型，还可能涉及函数名等其他名称，只要其含义依赖于模板参数，均属于依赖名称。但是，依赖名称并不总是类型名称，可能是值名称或其他实体。那这会导致什么呢？

简单来说，编译器分为两阶段处理模板：第一阶段-模板定义阶段（语法解析阶段），这个时候需要知道一个标识符（identifier）是类型还是值，还是成员函数，才能知道后续如何解析；第二阶段-模板实例化阶段，专门为模板增加的一个阶段，用于实例化模板。在第一阶段，编译器只知道结构和语法，但无法确定模板相关的具体符号是什么，因为这些模板相关的符号只有在实例化时才能确定。因此，编译器在第一阶段需要明确的指示来区分类型和其他实体，这是开发者需要提供给编译器的必要信息，比如，`typename`指定类型，`template`指定模板函数，来确保编译器正确解析代码。

下面是依赖名称的所有场景：

```cpp
// 需要指定类型的
{
    template<typename T>
    void f(T& c) {
        typename T::value_type v;               // 需要 typename
        std::vector<typename T::value_type> V;  // 需要 typename
    }

    template<typename T>
    using VT = typename T::value_type; // 需要 typename

    template<typename T>
    void call(T& obj) {
        // 假设 obj 有成员模板 template <typename U> void mem(U);
        obj.template mem<int>(42); // 需要 template
    }

    template<typename T>
    void s() {
        T::template apply<int>(); // 如果 apply 是静态成员模板，需 template
    }
}


// 不需要指定类型的
{
    template<typename T>
    void g() {
        auto n = T::count;     // 不需要 typename（这是值）
        int k = T::enum_value; // 不需要 typename（枚举值/常量）
    }

    /* 其实T::Base作为类型，本身应该也是要typename的，但特殊的地方在于这个语法位置对应的符号只能够是类型，编译器不需要额外声明 */
    template<typename T>
    struct D : T::Base {    // base-specifier 中不写 typename（编译器允许）
        // ...
    };

    template<typename T>
    void g() {
        auto n = T::count;     // 不需要 typename（这是值）
        int k = T::enum_value; // 不需要 typename（枚举值/常量）
    }

    template<typename T>
    void h(T& obj) {
        obj.foo(); // 不依赖 typename/template
    }

    struct S { using value_type = int; template<typename U> void mem(U); };
    void ok() {
        S::value_type x;     // 不用 typename，因为 S 不是模板参数依赖名
        S s; s.mem<int>(1);  // 不用 template
    }
}
```

### 2. 模板参数

#### 2.1 类型模板参数

类型模板参数是指在模板定义中，以类型作为参数的一种机制。通过类型模板参数，我们可以让模板适应不同的数据类型，从而提高代码的通用性。例如，在常见的 `std::vector` 模板中，`typename T` 就是类型模板参数，使得 `std::vector` 可以存储各种不同类型的数据，如 `std::vector<int>`、`std::vector<double>` 等。在模板定义中，通常使用 `typename` 或 `class` 关键字来声明类型模板参数，二者在这种场景下语义相同。

#### 2.2 非类型模板参数

非类型模板参数是模板参数的一种特殊形式，它用于在模板定义中指定常量值。与类型模板参数不同，非类型模板参数代表的是具体的常量，而非数据类型。这些常量可以是整数、枚举、指针或引用等。

使用非类型模板参数能够在编译期确定一些值，从而增强代码的灵活性和效率。例如，我们可以定义一个固定大小的数组模板，通过非类型模板参数指定数组的大小：

```cpp
template <typename T, int size>
class FixedSizeArray {
    T data[size];
public:
    FixedSizeArray() = default;
    T& operator[](int index) {
        return data[index];
    }
    const T& operator[](int index) const {
        return data[index];
    }
};
```

这里的 `int size` 就是非类型模板参数，在实例化模板时，必须提供一个常量值来确定数组的大小，如 `FixedSizeArray<int, 10> arr;` 就创建了一个大小为 10 的 `int` 类型数组。

#### 2.3 模板模板参数

模板模板参数允许我们编写接受其他模板作为参数的模板，这进一步提升了代码的灵活性和重用性。它为模板提供了一种更高层次的抽象，使得我们可以基于不同的模板容器实现通用的功能。

例如，假设有一个 `Container` 类模板用于存储数据：

```cpp
#include <vector>

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

在上述代码中，`template <typename> class ContainerType` 就是模板模板参数，它表示一个接受单个类型参数的模板。`Wrapper` 模板可以接受任何符合这种模板形式的容器模板，如 `Container`，并对其进行封装，提供统一的接口。

实际上，模板也可以看成是一种类型，只不过这种类型是在编译时才能确定的。它为 C++ 提供了强大的元编程能力，使得我们可以在编译期完成一些复杂的计算和代码生成，提高程序的运行效率和灵活性。

### 3. 模板实例化

隐式实例化指的是当编译器首次察觉到需要使用某个模板时，会自动为其生成对应的模板实例。也就是说，在代码中首次调用模板函数或创建模板类对象时，编译器根据传入的实际模板参数类型，自动生成具体的函数或类定义。例如：

```cpp
template <typename T>
T add(T a, T b) {
    return a + b;
}

int main() {
    int result1 = add(3, 4);
    // 在此处，由于使用了add函数且传入int类型参数，编译器自动生成int类型的add函数实例，即发生了隐式实例化。

    double result2 = add(3.5, 4.5);
    // 同理，这里传入double类型参数，编译器又会隐式实例化出double类型的add函数实例。
    return 0;
}
```

#### 3.2 显式实例化

显式实例化要求在代码中明确指定模板参数，以此强制编译器生成特定类型的模板实例。其主要应用场景在于优化编译过程，具体表现为：

- **提高编译速度**：在大型项目中，若某些模板实例会被频繁使用，提前进行显式实例化，可避免在多个编译单元中重复隐式实例化相同的模板，从而减少编译时间。
- **减少代码膨胀**：当模板实例化出的代码量较大且相同类型的实例在多处使用时，显式实例化可确保仅生成一份实例代码，避免因多次隐式实例化导致的代码体积增大。

示例如下：

```cpp
template <typename T>
T add(T a, T b) {
    return a + b;
}

// 显式实例化add函数模板，明确指定生成int类型和double类型的add函数实例
template int add<int>(int, int);
template double add<double>(double, double);

int main() {
    int result1 = add(3, 4);
    // 这里直接使用显式实例化生成的int类型的add函数。
    double result2 = add(3.5, 4.5);
    // 同样，使用显式实例化生成的double类型的add函数。
    return 0;
}
```

需注意，在进行显式实例化时，要确保显式实例化的声明与模板定义在同一作用域内，否则可能导致链接错误。同时，若在同一编译单元中对同一模板进行多次显式实例化，也会引发编译错误。

- **显式实例化怎么做？**

```cpp
/* -------- a.hpp --------- */
#pragma once

template <typename T>
class A {
 public:
  void f(){};
};
extern template class A<int>;         // 声明 A<int> 的显式实例化
extern template void A<double>::f();  // 声明 A<double>::f() 的显式实例化

/* -------- a.cpp --------- */
#include "a.hpp"

template class A<int>;  // 实例化 A<int>
template void A<double>::f();  // 实例化 A<double>::f()

/* -------- main.cpp --------- */
#include "a.hpp"

int main() {
  A<int>{}.f();
  A<double>{}.f();
}
```

#### 3.3 模板链接

##### 3.3.1 模板实现不能放在.cpp

- 原因概述  
  模板的实例化发生在编译期：编译器在看到某个翻译单元需要某个模板实例时，必须同时看到该模板的定义才能生成对应的代码。如果把模板实现仅放在某个 .cpp 中，其他翻译单元在编译时看不到实现，无法完成实例化，会导致链接阶段出现未定义符号（undefined reference）。

- 为什么普通函数可以放在 .cpp？  
  普通函数的定义在编译后只需生成一次，其他翻译单元仅通过声明（头文件）在链接时引用同一符号；而模板对每个需要的类型都要生成实例代码，因此编译器需要在使用点能看到模板定义。

- 合法且常用的替代方案：显式实例化（explicit instantiation）  
  如果确实希望把实现放在 .cpp 中，可以在该 .cpp 里对需要的具体类型做显式实例化，同时在头文件声明为 extern template，示例：

  ```cpp
  // a.hpp
  #pragma once
  template<typename T>
  class A {
  public:
      void f();
  };
  extern template class A<int>;          // 告诉其他编译单元：A<int> 已在别处实例化
  ```

  ```cpp
  // a.cpp
  #include "a.hpp"
  template<typename T>
  void A<T>::f() { /* 实现 */ }

  template class A<int>;                 // 在此翻译单元中生成并导出 A<int>
  ```

  说明：使用显式实例化时要确保声明（extern template）与实例化（template class A<int>;）匹配、且只在少数受控类型上使用，否则会丧失模板的灵活性并增加维护成本。

##### 3.3.2 模板不能具有 C 链接

C++ 的模板不能与 C 语言的链接规范（C linkage）一起使用。链接规范决定了编译器如何生成符号以及链接器如何解析这些符号。C语言和C++ 语言的链接规范有所不同，C++ 为了支持函数重载等特性，其符号命名规则更为复杂。

模板是 C++ 特有的高级特性，依赖于 C++ 的编译和链接机制。当使用 `extern "C"` 来指定 C 链接规范时，它会改变符号的命名规则，使得模板实例化生成的符号无法按照 C++ 的方式被正确解析。例如：

```cpp
namespace {
    extern "C++" template <typename T>
    void normal();  // 正确：默认 C++ 链接规范，编译器按照 C++ 的符号命名规则处理该模板函数
    extern "C" template <typename T>
    void invalid();  // 错误：不能使用 C 链接，因为 C 链接规范下无法正确处理模板实例化生成的符号
}  // namespace

int main() {}
```

而使用 `extern "C++"` 时，即为默认的 C++ 链接规范，编译器和链接器能够正确处理模板相关的符号。

##### 3.3.3 模板的外链接与静态链接

在C++ 中，模板通常具有外链接（**external linkage**）特性。这意味着模板的定义在整个程序中是共享的，不同的编译单元可以引用同一个模板实例化生成的代码。当多个编译单元都需要使用某个模板的特定实例时，链接器会确保这些实例是同一个。

然而，对于**静态模板函数**（即在模板函数定义前加上 `static` 关键字），它会具有内部链接（**internal linkage**）。具有内部链接的实体在当前翻译单元内可见，但在其他翻译单元中不可见。这是因为 `static` 关键字改变了模板函数的链接属性，使得每个编译单元都拥有自己独立的该静态模板函数的实例，而不会与其他编译单元共享。例如：

```cpp
template <typename T>  // 外部链接，不同编译单元可共享该模板实例化生成的代码
void external();

template <typename T>  // 内部链接，每个编译单元都有自己独立的该静态模板函数实例
static void internal();

namespace {
    template <typename>  // 匿名命名空间内的模板具有内部链接，同样每个编译单元独立实例化
    void other_internal();
}

struct {
    template <typename T>  // 无链接：这种在结构体内部定义的模板不能被重复声明，仅在结构体内部使用
    void f(T) {}
} x;

int main() {}
```

理解模板的链接特性对于编写大型项目以及避免链接错误至关重要。在实际编程中，应根据需求合理选择模板的链接方式，以确保代码的正确性和高效性。

### 4. 模板特化

在 C++ 模板编程领域，模板特化（Template Specialization）是一项极为关键的技术。它赋予开发者针对特定的模板参数设定独特实现的能力，进而显著增强代码的灵活性与性能表现。模板特化主要细分为部分特化和全特化两种类型。

模板特化在众多实际编程场景中具有不可或缺的作用：

- **优化特定类型**：当涉及某些特定类型时，为其量身定制优化后的实现，能够有效提升程序性能。例如，在处理 `int` 类型数据时，由于其使用频率高且特性明确，可提供特殊实现以加快处理速度。
- **处理特殊情况**：针对特定类型或者特定条件下的特殊状况，模板特化可发挥重要作用。以指针类型为例，因其涉及解引用操作和内存管理等复杂问题，通过为指针类型提供特殊实现，能够更妥善地处理这些情况。
- **实现类型特征**：借助模板特化，能够实现类型特征（type traits），这对于在编译阶段检测类型属性至关重要。比如，通过模板特化实现检查某个类型是否为指针类型、是否为整数类型等功能。

#### 4.1 模板特化

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

#### 4.2 模板偏特化

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

#### 4.3 特化的推断规则

在C++ 中，当存在多个模板都能匹配给定的模板参数时，编译器会依据偏序规则来选择最合适的模板。若无法明确判断哪个模板更特化，编译器将报出歧义错误。

所谓“更特化”，可以这样理解：对于两个模板，如果在所有能使其中一个模板匹配的模板参数实例化情况下，另一个模板也能匹配，并且存在至少一种情况，使得后者匹配而前者不匹配，那么前者就是更特化的模板。换个角度看，如果把模板参数的匹配情况看作集合，更特化的模板所对应的参数匹配集合是另一个模板参数匹配集合的真子集。

以下通过代码示例详细说明：

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
    assert(f(pp) == 3); // 三个模板均匹配，第三个模板更特殊。const T*是T和T*的真子集
}
```

### 99. quiz

#### 1. 不同源文件都使用了`vector<int>`，有没有违反 odr 原则？实例化了几次？代码里面会有多少`vector<int>`的定义？

在 C++ 中，模板实例化的行为取决于编译器和链接器的实现。通常情况下，如果多个源文件都使用了相同的模板实例（例如 vector<int>），编译器会在每个使用该模板实例的源文件中生成一份实例化代码。然而，链接器会负责消除重复的实例化代码，只保留一份最终的实例化代码。

也就是说不同源文件使用了相同的模板实例就会各自实例化，但是链接器会优化，合并重复实例代码。注意，合并了重复的实例代码，只是减轻了代码生成的体积，实例的开销没办法去掉，所以模板用多了，编译会慢一些，开销在于模板实例化。

#### 2. 什么是 ADL？

ADL（Argument - Dependent Lookup，依赖于实参的查找）是 C++ 中一种特殊的函数查找机制。在常规的函数调用中，编译器会在函数调用点的作用域以及包含该函数调用的命名空间中查找函数声明。而 ADL 则额外在实参类型所属的命名空间中查找函数声明，这使得在调用函数时，即使函数不在当前作用域内直接可见，只要它在实参类型相关的命名空间中，也能被找到并调用。

```cpp
#include <iostream>

namespace MyNamespace {
    struct MyType {};

    void someFunction(MyType myArg) {
        std::cout << "Function in MyNamespace called" << '\n';
    }
}

template <typename T>
void myTemplateFunction(T arg) {
    someFunction(arg);
}

int main() {
    MyNamespace::MyType obj;
    myTemplateFunction(obj);
    return 0;
}
```

在上述代码中，`myTemplateFunction` 模板函数内部调用 `someFunction` 时，虽然 `someFunction` 不在 `myTemplateFunction` 的直接作用域内，但因为 `arg` 的类型是 `MyNamespace::MyType`，ADL 机制会在 `MyNamespace` 命名空间中查找 `someFunction`，从而成功调用该函数。这展示了 ADL 如何让模板函数在不明确知道具体类型细节的情况下，利用参数类型在相应命名空间中找到合适的函数进行调用。

#### 3. 下面这些代码的注释处为什么不行？

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
