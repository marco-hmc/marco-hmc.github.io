---
layout: post
title: （六）模板那些事儿：类型擦除
categories: C++
related_posts: True
tags: template doing
toc:
  sidebar: right
---

## （六）模板那些事儿：类型擦除

### 1. concepts

#### 1.1 什么是类型擦除

在 C++ 中，类型擦除是一种重要的编程技术，它能够在运行时隐藏对象的具体类型信息，仅保留对象的行为，为实现多态性和泛型编程提供了一种灵活途径。本质上，类型擦除类似于 wrapper 的行为，通过创建抽象接口，将具体类型的对象包装起来，对外仅暴露统一接口，从而隐藏具体类型细节。

C++ 的模板提供了编译时的泛型编程能力，编译器会依据具体类型实例化代码。然而，有时我们期望在运行时处理不同类型对象，且无需知晓其具体类型，仅关注它们共有的行为。例如，假设有 `Dog`、`Cat`、`Bird` 多个不同类型的类，它们都具备 `speak` 方法。借助类型擦除技术，可将这些不同类型对象统一包装于 `AnimalWrapper` 类中，如此外部代码就能以相同方式调用它们的 `speak` 方法，而无需关注具体是哪种动物。

#### 1.2 类型擦除的用途

1. **`std::any`**
   `std::any` 可存储任意类型的值。它通过类型擦除技术，隐藏了存储对象的具体类型。例如：

```cpp
std::any value = 42; // 存储 int 类型
int num = std::any_cast<int>(value); // 获取存储的值

value = "Hello, World!"; // 重新存储字符串类型
const char* str = std::any_cast<const char*>(value);
```

2. **`std::function`**
   `std::function` 用于存储任意可调用对象，同样运用了类型擦除技术。比如，可将不同类型的函数对象存储在 `std::function` 中，并以统一方式调用：

```cpp
int add(int a, int b) { return a + b; }
auto lambda = [](int a, int b) { return a - b; };

std::function<int(int, int)> func1 = add;
std::function<int(int, int)> func2 = lambda;

int result1 = func1(3, 2); // 调用 add 函数
int result2 = func2(3, 2); // 调用 lambda 函数
```

3. 也可以用于实现多态行为。

### 2. impl

#### 2.1 void\* + type_info的实现方式

假设要实现一个能存储任意类型数据的容器，这就需要弱化或“擦除”类型信息，使所有数据都能用同一种类型表示。一种可能的思路是容器内部存储 `void* ptr` 来表示对象地址，以及 `std::type_info *type` 来记录对象类型。

```c++
#include <iostream>
#include <memory>
#include <string>
#include <typeinfo>

class Any {
  private:
    void* data;
    const std::type_info& type;
    void (*deleter)(void*);
    void* (*creator)(const void*);

  public:
    template <typename T>
    Any(const T& value)
        : data(new T(value)),
          type(typeid(T)),
          deleter([](void* ptr) { delete static_cast<T*>(ptr); }),
          creator([](const void* ptr) -> void* {
              return new T(*static_cast<const T*>(ptr));
          }) {}

    ~Any() {
        if (data) deleter(data);
    }

    Any(const Any& other)
        : data(other.data ? other.creator(other.data) : nullptr),
          type(other.type),
          deleter(other.deleter),
          creator(other.creator) {}

    template <typename T>
    bool is() const {
        return typeid(T) == type;
    }

    template <typename T>
    T get() const {
        if (!is<T>()) {
            throw std::bad_cast();
        }
        return *static_cast<T*>(data);
    }
};

int main() {
    Any value(42);
    std::cout << "Value: " << value.get<int>() << std::endl;

    Any text(std::string("Hello"));
    std::cout << "Text: " << text.get<std::string>() << std::endl;

    try {
        text.get<int>();
    } catch (const std::bad_cast& e) {
        std::cerr << "Bad cast: " << e.what() << std::endl;
    }

    return 0;
}
```

注意要知道`type_info`其实也是不好根据`type_info`去调用对应的拷贝和删除函数的。因为`type_info`是运行时标签，不是类型。C++ 不支持从标签恢复类型对象，因为它没有内建的运行时反射机制。简单来说，c++作为一种编译型语言，所有代码都是编译时就确定下来了，不能说根据运行时信息去动态生成一个新的代码去运行。因此只能通过`type_info`和对应的构造、拷贝、析构函数进行一个注册，这种注册就得提前写好了。

所以如果不提前注册的话，就得像记录`type_info`一样，记录对应的拷贝、构造和析构函数。而这种实现的最大问题就在于内存开销太大，每一个`Any`对象都要单独存一个拷贝和删除函数。因此类型擦除方式的实现一般都是`model-base`的方式。

#### 2.2 model-concept的类型擦除实现方式

```c++
#include <iostream>
#include <memory>
#include <typeinfo>

class Any {
  private:
    struct Concept {
        virtual ~Concept() = default;
        virtual const std::type_info& type() const = 0;
        virtual std::unique_ptr<Concept> clone() const = 0;
    };

    template <typename T>
    struct Model : Concept {
        T value;

        Model(const T& val) : value(val) {}

        const std::type_info& type() const override { return typeid(T); }

        std::unique_ptr<Concept> clone() const override {
            return std::make_unique<Model<T>>(value);
        }
    };

    std::unique_ptr<Concept> concept_;

  public:
    Any() = default;

    template <typename T>
    Any(const T& value) : concept_(std::make_unique<Model<T>>(value)) {}

    Any(const Any& other)
        : concept_(other.concept_ ? other.concept_->clone() : nullptr) {}

    Any(Any&& other) noexcept = default;

    Any& operator=(const Any& other) {
        if (this != &other) {
            concept_ = other.concept_ ? other.concept_->clone() : nullptr;
        }
        return *this;
    }

    Any& operator=(Any&& other) noexcept = default;

    template <typename T>
    bool is() const {
        return concept_ && concept_->type() == typeid(T);
    }

    template <typename T>
    T& get() {
        if (!is<T>()) throw std::bad_cast();
        return static_cast<Model<T>*>(concept_.get())->value;
    }

    template <typename T>
    const T& get() const {
        if (!is<T>()) throw std::bad_cast();
        return static_cast<const Model<T>*>(concept_.get())->value;
    }

    bool has_value() const { return static_cast<bool>(concept_); }

    void reset() { concept_.reset(); }

    const std::type_info& type() const {
        return concept_ ? concept_->type() : typeid(void);
    }
};

int main() {
    Any a = 123;
    std::cout << "a = " << a.get<int>() << std::endl;

    a = std::string("Hello, Concept!");
    if (a.is<std::string>()) {
        std::cout << "a = " << a.get<std::string>() << std::endl;
    }

    Any b = a;
    std::cout << "b = " << b.get<std::string>() << std::endl;

    a = 3.14159;
    std::cout << "a = " << a.get<double>() << std::endl;

    try {
        std::cout << a.get<std::string>() << std::endl;
    } catch (const std::bad_cast& e) {
        std::cerr << "Caught bad_cast: " << e.what() << std::endl;
    }

    return 0;
}
```

`Any`存储的是`std::unique_ptr<Concept> concept_;`，析构的时候会调用到`Concept`的析构，而这个的析构是虚的，所以就实际上会调用到`Model<T>`的析构，尽管这个时候没有主动声明`Model<T>`的析构，但是默认的`Model<T>`就满足使用了；析构可以通过虚析构自动完成；但拷贝由于不是语言支持的虚操作，因此需要通过手写虚函数 `clone()` 实现。可以认为拷贝还是得通过类似注册的方式，只不过现在上了模板，可以利用模板统一自动去注册了。除此之外，这种方式天然就支持任意类型。
