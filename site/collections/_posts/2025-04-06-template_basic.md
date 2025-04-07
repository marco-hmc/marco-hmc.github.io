---
date: 2025-04-06 14:44:11 +0800
project: language
title: template_basic
image: /images/post/post-23.jpg
tags: template

---

## 一：模板基础

### 1.1 什么是模板

* **概念上**
模板是 C++ 中的一种泛型编程工具，它允许你编写与类型无关的代码。通过使用模板，你可以编写一次代码，然后在不同的上下文中重用它，而不需要为每种类型编写单独的代码。
如果从概念上理解，对于编译器来说模板可以看成是基于类型的编程，或者称之为面向类型编程。

而所谓模板实例化，其实对应的是类型的声明；模板特化，其实是对于类型做 if-else判断；模板的递归，其实就对类型做循环。因此模板实际上是能够做到存在变量的概念，if-else 能力，loop 能力，且这些能力的实现与一般c++开发不相同，因此会有人觉得c++的模板是非常接近一门单独的语言的。而这种语言的编程就是模板元编程。

那模板编程的好处是什么呢？
* 如果单单从狭义的泛型编程来看，正如前面提到的，因为写的是类型无关的代码，当声明了类型，完成了模板实例化的时候，就可以复用代码了。
* 而如果从狭义的面向类型编程角度出发，有什么好处呢？首先，要知道的是对于 c++语言来说，类型不是运行时必要的信息，类型更多是编译时的概念。因此面向类型的编程的耗时都是在编译期间完成的。但是类型确定是编码期间要确定的，把开销挪到编译时只能局限于非常小的范围。
* 还有什么好处呢？永永提升了泛型编程的能力，比如说实现一个容器对象，容器对象的`clear()`，即清除容器内所有元素的函数。这个函数对于 POD 类型（plain old data，可简单理解为默认类型）和自定义类型来说是有两种实现要求的。如果是 POD 类型，不会管理资源，其析构函数概念弱，不强调，直接`memset(0)`就好了；而自定义类型是可能管理资源，当调用`clear()`的时候是需要对元素逐个调用其析构函数的。这个时候就需要强调对类型有 if-else 的能力了。

* **模板内容划分**
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

### 1.3 注入类名

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

### 1.4 依赖名称和typename

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

* 简单来说需要实例化的类型的，都是依赖名称的。
* 编译器读到 `Container<T>::Iterator` 时，无法知道这是一个类型；因为还没有实例。
* 因此需要使用 `typename` 关键字显式告诉编译器这是一个类型。
* 在函数签名的时候，编译器还能推断出来这是一个类型，因此可写可不写。
* 在声明变量的时候，编译器没办法确定是不是一个方法，因此需要加上`typename`。

### 1.5 依赖名称和template

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
