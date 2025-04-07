---
date: 2025-02-28 22:42:34 +0800
project: language
title: template_metaProgramming
image: /images/post/post-22.jpg
tags: template

---

## 5. 模板元编程

模板元编程（Template Metaprogramming, TMP）是一种通过模板技术在编译时进行计算的方式。模板元编程通过提前在编译阶段进行类型推导、计算和选择，能显著提升程序的运行时性能和灵活性。模板元编程在 C++ 中非常强大，能够处理各种类型推导、递归计算和条件编译等复杂任务。

* **模板元编程的能力**：
   C++的模板元编程在理论上是图灵完备的，即能完成任何可计算的任务，而一个图灵完备的计算系统具备以下几个关键特征：
      * **条件控制**：
         * 能够执行条件语句（如 if-else 或 switch-case）。
         * 模板元编程可通过std::enable_if或者sfinae（也就是实例化）实现
      * **循环或递归**：
         * 能够执行循环或递归操作（递归和循环在计算理论中是等价的，是可相互转换的）。
         * 模板元编程可通过递归模板类和结构体实现，而constexpr方法也是可以直接调用的。
      * **内存管理**：
         * 能够读取和修改变量的值（或进行类似的操作）。
         * 模板元编程中，值的概念对应的是类型和编译器常量，其中编译器常量就是里面可被赋值的。

   总结，图灵完备的计算系统的特征其实模板元编程都符合。只是体现方式上不同，如条件控制（没有if，只有sfinae），如循环的体现（通过递归），如值的体现（没有变量，只有编译器常量和类型）。

* **模板元编程的好处**：
   1. **编译期计算与性能优化**：
      - 通过模板元编程，许多计算可以在编译期完成，减少了运行时的计算负担。例如，使用递归模板计算常量值，避免在运行时重新计算。
      - 可以根据类型在编译时决定不同的实现，从而避免不必要的运行时分支和性能损耗。
   2. **类型安全**：
      - 模板元编程通过类型特征（type traits）和启用条件（如 `std::enable_if`）提供了类型安全检查。在编译时检查类型，减少了潜在的运行时错误。
      - 可以通过静态断言（`static_assert`）来确保类型或计算结果在编译时符合要求。
   3. **代码复用与抽象**：
      - 模板元编程为不同的类型提供统一的接口，减少代码冗余。例如，标准库中的容器和算法都利用模板技术，使得同一段代码能适应多种类型。
      - 通过模板元编程可以轻松地编写与类型无关的通用代码，增强代码的复用性和可扩展性。
   4. **条件编译与类型推导**：
      - 通过 SFINAE（Substitution Failure Is Not An Error）技术，模板元编程能够在不同的条件下选择合适的实现路径。可以根据不同的类型选择不同的算法，进行条件编译。

* **模板元编程的原则**：
   1. **递归是核心技术**：
      - 模板元编程往往依赖递归模板来完成编译期的计算任务，如递归展开类型序列、计算阶乘、斐波那契数列等。
   2. **终止条件的定义**：
      - 递归模板需要明确的终止条件，通常通过模板特化来实现终止。在递归过程中，必须确保最终能够到达终止条件，避免编译时死循环。
   3. **编译期常量**：
      - 利用 `constexpr` 和递归模板，能够在编译期计算常量，提高效率。
      - 这些常量可以是常规的数值，也可以是与类型相关的特征信息。
   4. **SFINAE与重载决议**：
      - 利用 SFINAE 技术，通过类型特征选择合适的重载函数或模板特化。重载决议过程中，编译器会尝试匹配最适合的模板，如果某个匹配失败，会继续尝试其他可行的模板，而不会报错。
   5. **类型特征与模板推导**：
      - 通过类型特征（如 `std::is_integral`, `std::is_pointer`）可以在编译时检查类型特性，从而决定模板实例化时的行为。

* **常见应用场景**：
   1. **类型计算与推导**：
      - 在编译期进行类型推导和计算，如计算类型大小、类型之间的转换、数组的维度和大小等。
      - 例如，可以通过模板推导判断一个类型是否是整数、浮点数或指针类型。
   2. **编译期常量与优化**：
      - 通过递归模板计算阶乘、斐波那契数列等常量，并在编译期直接得到结果，避免在运行时计算。
      - 可以根据编译期条件优化算法或数据结构选择，如选择适合的排序算法、内存管理方式等。
   3. **自定义类型特征与启用条件**：
      - 通过类型特征（`std::is_integral`）实现编译期类型检查。
      - 使用 SFINAE 技术和 `std::enable_if` 编写基于类型的函数重载。
   4. **简化接口与抽象**：
      - 通过模板特化和 SFINAE，实现更为灵活的接口和抽象。例如，根据类型的不同选择不同的处理方式，提高程序的扩展性。
   5. **提高编译时安全性**：
      - 通过 `static_assert` 或类型特征检查，增强程序的编译时安全性，减少类型错误。

### 5.1 模板的递归
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

// 基本情况
template <>
struct Factorial<0> {
    static const int value = 1;
};

int main() {
    std::cout << "Factorial<5>::value = " << Factorial<5>::value << std::endl; // 输出 120
    return 0;
}
```

### 5.2 模板的偏特化

模板的偏特化（Partial Specialization）是指为模板的某些特定参数提供特殊的实现，而不是为所有参数提供特殊的实现。偏特化通常用于类模板，因为函数模板不支持偏特化。通过偏特化，可以为特定类型或特定条件提供优化的实现。

```cpp
#include <iostream>

// 通用类模板
template <typename T>
class MyClass {
public:
    void print() {
        std::cout << "Primary template" << std::endl;
    }
};

// 偏特化，当类型为指针时
template <typename T>
class MyClass<T*> {
public:
    void print() {
        std::cout << "Partial specialization for pointer" << std::endl;
    }
};

int main() {
    MyClass<int> obj1;
    obj1.print(); // 输出 "Primary template"

    MyClass<int*> obj2;
    obj2.print(); // 输出 "Partial specialization for pointer"

    return 0;
}
```

### 5.3 SFINAE（Substitution Failure Is Not An Error）

SFINAE 是 C++ 模板编程中的一个重要概念，它允许在模板实例化过程中，如果某些模板参数替换失败，不会导致编译错误，而是会选择其他可行的模板实例化。SFINAE 通常用于实现条件性模板特化和模板元编程。

SFINAE 的主要用途：
- 根据类型的不同选择不同的模板函数或模板特化。
- 实现类型特定的行为，如根据类型判断是否支持某些操作（例如，是否支持加法、是否是容器类型等）。

   ```cpp
   // 示例：根据类型启用不同的函数重载
   template<typename T>
   typename std::enable_if<std::is_integral<T>::value, void>::type print_type(T t) {
      std::cout << "Integral: " << t << std::endl;
   }

   template<typename T>
   typename std::enable_if<std::is_floating_point<T>::value, void>::type print_type(T t) {
      std::cout << "Floating point: " << t << std::endl;
   }

   int main() {
      print_type(42);         // 输出 Integral: 42
      print_type(3.14);       // 输出 Floating point: 3.14
   }
   ```

- **SFINAE**：模板实例化过程中发生的类型不匹配或无法进行某种操作被视为替换失败，而不是编译错误。编译器会继续寻找其他可能的模板重载或特化来尝试匹配。
- **重载决议**：编译器在进行重载决议时，会根据实参和形参的匹配程度、函数声明的可见性、最佳匹配原则、模板特化和偏特化、参数类型退化、引用折叠和转发引用、`constexpr` 函数等因素来选择最佳匹配的函数。

* **重载决议的关键点**
   1. **实参的推断要求一致**：
      - 在进行重载决议时，编译器会尝试匹配函数调用中实参的类型与各个重载函数形参的类型。虽然某些隐式类型转换是允许的（如从 `int` 到 `double`），但编译器不会进行过于复杂的转换尝试。实参类型需要与某个重载版本的形参类型足够“接近”，否则该重载版本不会被选中。
   2. **函数声明的可见性**：
      - 只有在函数调用前声明的重载才会被匹配，即使后续有更优先的匹配，由于不可见也会被忽略。在 C++ 中，函数的可见性是基于声明的位置的。如果在调用一个重载函数时，编译器只能“看到”那些在调用点之前声明的重载版本。
   3. **最佳匹配原则**：
      - 在所有可见的重载函数中，编译器会根据实参和形参的匹配程度来选择“最佳匹配”。这个选择过程考虑了参数的类型、数量、是否有默认参数等因素。如果有多个重载函数同样适合，但没有一个能被确定为最佳匹配，那么会导致编译错误，因为这种情况被认为是模糊的。
   4. **模板特化和偏特化**：
      - 对于模板函数，重载决议还会考虑模板特化和偏特化。如果存在特化版本的模板函数，它们通常会被优先考虑，因为特化提供了更具体的实现。
   5. **参数类型退化**：
      - 在函数模板重载决议中，参数类型可能会经历退化。例如，数组类型的参数会退化为指针，函数类型的参数会退化为函数指针。这种退化行为可能会影响哪个重载版本被选择。
   6. **引用折叠和转发引用**：
      - C++11 引入了转发引用（Forwarding References）和引用折叠规则，这对于模板函数的重载决议尤其重要。转发引用允许函数模板完美地转发参数到另一个函数，而引用折叠规则决定了当模板参数被推导为引用时的行为。这些特性使得模板函数可以更灵活地处理不同的参数类型，包括左值和右值。
   7. **constexpr 函数**：
      - 从 C++11 开始，`constexpr` 函数提供了在编译时进行计算的能力。在重载决议中，如果一个 `constexpr` 函数能够在编译时解析，它可能会被优先选择，这使得编译时优化和运行时性能得到提升。


### 5.4 模板元编程应用

#### 5.4.1 `std` 提供的类型特征技术

C++标准库提供了丰富的类型特征工具（`type_traits`），这些工具允许在编译时检查和推导类型特性，使得模板编程更加高效和灵活。常用的类型特征包括：

   - **`std::is_integral<T>`**：检查类型 `T` 是否为整数类型。
   - **`std::is_floating_point<T>`**：检查类型 `T` 是否为浮点类型。
   - **`std::is_pointer<T>`**：检查类型 `T` 是否为指针类型。
   - **`std::is_same<T, U>`**：检查类型 `T` 和 `U` 是否相同。
   - **`std::is_convertible<T, U>`**：检查类型 `T` 是否可以转换为 `U` 类型。
   - **`std::conditional<T, U, V>`**：根据条件 `T` 来选择 `U` 或 `V` 类型。
   - **`std::remove_reference<T>`**：移除类型 `T` 的引用部分。

通过这些类型特征，我们可以在模板中进行条件选择和优化，从而实现不同类型的定制化操作。


#### 5.4.2 常见的自定义实现的类型特征技术

除了标准库提供的类型特征，开发者还可以根据具体需求实现自定义类型特征。常见的自定义实现包括：

- **检查类型是否为容器类型**：我们可以通过模板特征检查一个类型是否是容器类型（如 `std::vector`, `std::list` 等），从而在不同容器类型上选择不同的操作。
  
  ```cpp
  template<typename T>
  struct is_container {
      template<typename U> static auto test(U*) -> decltype(std::declval<U>().begin(), std::declval<U>().end(), std::true_type());
      template<typename U> static std::false_type test(...);
      
      static constexpr bool value = std::is_same<decltype(test<T>(0)), std::true_type>::value;
  };
  ```

- **提取类型的首元素**：通过模板特化，提取容器类型的首元素类型。




## [SFINAE（Substitution Failure Is Not An Error）](https://en.cppreference.com/w/cpp/language/sfinae)

* SFINAE 用于禁止不相关函数模板在重载解析时造成错误，当替换返回类型无意义时，会忽略（SFINAE out）匹配而选择另一个更差的匹配

```cpp

```

* SFINAE 只发生于函数模板替换的即时上下文中，对于模板定义中不合法的表达式，不会使用 SFINAE 机制

```cpp
namespace jc {

template <typename T, typename U>
auto f(T t, U u) -> decltype(t + u) {
  return t + u;
}

void f(...) {}

template <typename T, typename U>
auto g(T t, U u) -> decltype(auto) {  // 必须实例化 t 和 u 来确定返回类型
  return t + u;  // 不是即时上下文，不会使用 SFINAE
}

void g(...) {}

struct X {};

using A = decltype(f(X{}, X{}));  // OK：A 为 void
using B = decltype(g(X{}, X{}));  // 错误：g<X, X> 的实例化非法

}  // namespace jc

int main() {}
```

* 一个简单的 SFINAE 技巧是使用尾置返回类型，用 devltype 和逗号运算符定义返回类型，在 decltype 中定义必须有效的表达式

```cpp
#include <cassert>
#include <string>

namespace jc {

template <typename T>
auto size(const T& t) -> decltype(t.size(), T::size_type()) {
  return t.size();
}

}  // namespace jc

int main() {
  std::string s;
  assert(jc::size(s) == 0);
}
```

* 如果替换时使用了类成员，则会实例化类模板，此期间发生的错误不在即时上下文中，即使另一个函数模板匹配无误也不会使用 SFINAE

```cpp
namespace jc {

template <typename T>
class Array {
 public:
  using iterator = T*;
};

template <typename T>
void f(typename Array<T>::iterator) {}

template <typename T>
void f(T*) {}

}  // namespace jc

int main() {
  jc::f<int&>(0);  // 错误：第一个模板实例化 Array<int&>，创建引用的指针是非法的
}
```

* SFINAE 最出名的应用是 [std::enable_if](https://en.cppreference.com/w/cpp/types/enable_if)

```cpp
#include <cassert>
#include <iostream>
#include <sstream>
#include <string>
#include <type_traits>

namespace jc {

template <
    typename K, typename V,
    std::enable_if_t<std::is_same_v<std::decay_t<V>, bool>, void*> = nullptr>
void append(std::ostringstream& os, const K& k, const V& v) {
  os << R"(")" << k << R"(":)" << std::boolalpha << v;
}

template <typename K, typename V,
          std::enable_if_t<!std::is_same_v<std::decay_t<V>, bool> &&
                               std::is_arithmetic_v<std::decay_t<V>>,
                           void*> = nullptr>
void append(std::ostringstream& os, const K& k, const V& v) {
  os << R"(")" << k << R"(":)" << v;
}

template <
    typename K, typename V,
    std::enable_if_t<std::is_constructible_v<std::string, std::decay_t<V>>,
                     void*> = nullptr>
void append(std::ostringstream& os, const K& k, const V& v) {
  os << R"(")" << k << R"(":")" << v << R"(")";
}

void kv_string_impl(std::ostringstream& os) {}

template <typename V, typename... Args>
std::void_t<decltype(std::cout << std::declval<std::decay_t<V>>())>
kv_string_impl(std::ostringstream& os, const std::string& k, const V& v,
               const Args&... args) {
  append(os, k, v);
  if constexpr (sizeof...(args) >= 2) {
    os << ",";
  }
  kv_string_impl(os, args...);
}

template <typename... Args>
std::string kv_string(const std::string& field, const Args&... args) {
  std::ostringstream os;
  os << field << ":{";
  kv_string_impl(os, args...);
  os << "}";
  return os.str();
}

}  // namespace jc

int main() {
  std::string a{R"(data:{})"};
  std::string b{R"(data:{"name":"jc","ID":1})"};
  std::string c{R"(data:{"name":"jc","ID":1,"active":true})"};
  assert(a == jc::kv_string("data"));
  assert(b == jc::kv_string("data", "name", "jc", "ID", 1));
  assert(c == jc::kv_string("data", "name", "jc", "ID", 1, "active", true));
}
```
