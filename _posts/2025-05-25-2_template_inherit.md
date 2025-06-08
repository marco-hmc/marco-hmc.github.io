---
layout: post
title: （三）模板那些事儿：模板与继承
categories: cpp
related_posts: True
tags: cpp template doing
toc:
  sidebar: right
---

## （三）模板那些事儿：模板与继承

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

### 1. 模板与继承

模板与继承是 C++ 模板编程中的一个重要概念。通过将模板与继承结合使用，可以实现更加灵活和强大的代码结构。以下是模板与继承的几个主要方面：

#### 1.1 模板类的继承

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

#### 1.3 模板与多态

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
