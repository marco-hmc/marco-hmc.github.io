---
date: 2025-04-04 10:24:28 +0800
project: language
title: template_specialization
image: /images/post/post-27.jpg
tags: template

---

## 4. 模板特化

模板特化（Template Specialization）是 C++ 模板编程中的一个重要概念，它允许你为特定的模板参数提供特殊的实现。模板特化分为部分特化和全特化。通过模板特化，你可以为特定类型或特定条件提供优化的实现，从而提高代码的灵活性和性能。

模板特化在以下场景中非常有用：

1. **优化特定类型**：为特定类型提供优化的实现。例如，为 `int` 类型提供特殊的实现，以提高性能。
2. **处理特殊情况**：处理特定类型或条件下的特殊情况。例如，为指针类型提供特殊的实现，以处理指针的解引用和内存管理。
3. **实现类型特征**：实现类型特征（type traits），用于在编译时检查类型属性。例如，检查类型是否为指针类型、是否为整数类型等。

模板特化是 C++ 模板编程中的一个重要概念，它允许你为特定的模板参数提供特殊的实现。模板特化分为部分特化和全特化。部分特化用于为模板的某些特定参数提供特殊的实现，而全特化用于为模板的所有参数提供特殊的实现。通过模板特化，你可以为特定类型或特定条件提供优化的实现，从而提高代码的灵活性和性能。模板特化在优化特定类型、处理特殊情况和实现类型特征等场景中非常有用。

### 4.1 部分特化和全特化

```c++
#include <iostream>

namespace PartialSpecialization {
    template <typename T, typename U>
    class MyClass {
      public:
        void print() { std::cout << "Primary template" << std::endl; }
    };

    template <typename T>
    class MyClass<T, int> {
      public:
        void print() {
            std::cout << "Partial specialization: second parameter is int"
                      << std::endl;
        }
    };

    void task() {
        MyClass<double, int> obj2;
        obj2.print();
    }
}  // namespace PartialSpecialization

namespace FullSpecialization {
    template <typename T>
    class MyClass {
      public:
        void print() { std::cout << "Primary template" << std::endl; }
    };

    template <>
    class MyClass<int> {
      public:
        void print() {
            std::cout << "Full specialization for int" << std::endl;
        }
    };

    void task() {
        MyClass<int> obj2;
        obj2.print();
    }
}  // namespace FullSpecialization
```

### 4.2 特化的推断规则

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


## [特化（Specialization）](https://en.cppreference.com/w/cpp/language/template_specialization)

#### 函数模板的特化不能有默认实参，但会使用要被特化的模板的默认实参

```cpp
namespace jc {

template <typename T>
constexpr int f(T x = 1) {  // T 不会由默认实参推断
  return x;
}

template <>
constexpr int f(int x) {  // 不能指定默认实参
  return x + 1;
}

static_assert(f<int>() == 2);

}  // namespace jc

int main() {}
```

#### 类模板特化的实参列表必须对应模板参数，如果有默认实参可以不指定对应参数。可以特化整个类模板，也可以特化部分成员。如果对某种类型特化类模板成员，就不能再特化整个类模板，其他未特化的成员会被保留

```cpp
#include <cassert>

namespace jc {

template <typename T, typename U = int>
struct A;

template <>
struct A<void> {
  constexpr int f();
};

constexpr int A<void>::f() { return 1; }

template <>
struct A<int, int> {
  int i = 0;
};

template <>
struct A<char, char> {
  template <typename T>
  struct B {
    int f() { return i; }
    static int i;
  };
};

template <typename T>
int A<char, char>::B<T>::i = 1;

template <>
int A<char, char>::B<double>::i = 2;

template <>
int A<char, char>::B<char>::f() {
  return 0;
};

// template <>
// struct A<char, char> {};  // 错误，不能对已经特化过成员的类型做特化

template <>
struct A<char, char>::B<bool> {
  int j = 3;
};

}  // namespace jc

int main() {
  static_assert(jc::A<void>{}.f() == 1);
  static_assert(jc::A<void, int>{}.f() == 1);
  // jc::A<void, double>{};  // 错误：未定义类型
  assert((jc::A<int, int>{}.i == 0));
  assert((jc::A<char, char>::B<int>{}.i == 1));
  assert((jc::A<char, char>::B<int>{}.f() == 1));
  assert((jc::A<char, char>::B<double>{}.i == 2));
  assert((jc::A<char, char>::B<double>{}.f() == 2));
  assert((jc::A<char, char>::B<char>{}.i == 1));
  assert((jc::A<char, char>::B<char>{}.f() == 0));
  assert((jc::A<char, char>::B<bool>{}.j == 3));
}
```
### 类模板特化必须在实例化之前，对已实例化的类型不能再进行特化

```cpp
namespace jc {

template <typename T>
struct A {};

A<int> a;

template <>
struct A<double> {};  // OK

template <>
struct A<int> {};  // 错误：不能特化已实例化的 A<int>

}  // namespace jc

int main() {}
```

## [偏特化（Partial Specialization）](https://en.cppreference.com/w/cpp/language/partial_specialization)
### 类模板偏特化限定一些类型，而非某个具体类型

```cpp
namespace jc {

template <typename T>
struct A;  // primary template

template <typename T>
struct A<const T> {};

template <typename T>
struct A<T*> {
  static constexpr int size = 0;
};

template <typename T, int N>
struct A<T[N]> {
  static constexpr int size = N;
};

template <typename Class>
struct A<int * Class::*> {
  static constexpr int i = 1;
};

template <typename T, typename Class>
struct A<T * Class::*> {
  static constexpr int i = 2;
};

template <typename Class>
struct A<void (Class::*)()> {
  static constexpr int i = 3;
};

template <typename RT, typename Class>
struct A<RT (Class::*)() const> {
  static constexpr int i = 4;
};

template <typename RT, typename Class, typename... Args>
struct A<RT (Class::*)(Args...)> {
  static constexpr int i = 5;
};

template <typename RT, typename Class, typename... Args>
struct A<RT (Class::*)(Args...) const noexcept> {
  static constexpr int i = 6;
};

struct B {
  int* i = nullptr;
  double* j = nullptr;
  void f1() {}
  constexpr int f2() const { return 0; }
  void f3(int&, double) {}
  void f4(int&, double) const noexcept {}
};

static_assert(A<decltype(&B::i)>::i == 1);
static_assert(A<decltype(&B::j)>::i == 2);
static_assert(A<decltype(&B::f1)>::i == 3);
static_assert(A<decltype(&B::f2)>::i == 4);
static_assert(A<decltype(&B::f3)>::i == 5);
static_assert(A<decltype(&B::f4)>::i == 6);

}  // namespace jc

int main() {
  int a[] = {1, 2, 3};
  static_assert(jc::A<decltype(&a)>::size == 0);
  static_assert(jc::A<decltype(a)>::size == 3);
  // jc::A<const int[3]>{};  // 错误：匹配多个版本
}
```
### [变量模板（variable template）](https://en.cppreference.com/w/cpp/language/variable_template)的特化和偏特化

```cpp
#include <cassert>
#include <list>
#include <type_traits>
#include <vector>

namespace jc {

template <typename T>
constexpr int i = sizeof(T);

template <>
constexpr int i<void> = 0;

template <typename T>
constexpr int i<T&> = sizeof(void*);

static_assert(i<int> == sizeof(int));
static_assert(i<double> == sizeof(double));
static_assert(i<void> == 0);
static_assert(i<int&> == sizeof(void*));

// 变量模板特化的类型可以不匹配 primary template
template <typename T>
typename T::iterator null_iterator;

template <>
int* null_iterator<std::vector<int>> = nullptr;

template <typename T, std::size_t N>
T* null_iterator<T[N]> = nullptr;

}  // namespace jc

int main() {
  auto it1 = jc::null_iterator<std::vector<int>>;
  auto it2 = jc::null_iterator<std::list<int>>;
  auto it3 = jc::null_iterator<double[3]>;
  static_assert(std::is_same_v<decltype(it1), int*>);
  assert(!it1);
  static_assert(std::is_same_v<decltype(it2), std::list<int>::iterator>);
  static_assert(std::is_same_v<decltype(it3), double*>);
  assert(!it3);
}
```
