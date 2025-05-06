---
layout: post
title: c++ 中的不定长参数
categories: language
related_posts: True
tags: cpp template
toc:
  sidebar: left
---

## c++ 中的不定长参数

> Marco

c++的不定长参数主要是通过`...`运算符表示，而这个运算符又主要有三个语义。

### 1. c++省略号的三个语义

1. 不定长函数参数的表示：
   在 C 风格的函数中，省略号用于表示一个可变数量的参数。在这个例子中，`...`表示函数`print`可以接受任意数量的参数，这些参数的类型和数量在编译时期是未知的。`va_start`、`va_arg`和`va_end`是处理这些参数的宏。

   ```cpp
   #include <cstdarg>
   void print(const char* format, ...) {
       va_list args;
       va_start(args, format);
       va_end(args);
   }
   ```

2. 不定长模板参数（Variadic Templates）的表示：
   在模板编程中，省略号用于表示一个参数包（Parameter Pack），可以包含零个或多个参数。

   ```cpp
   template <typename... Args>
   void print(Args... args) {
       // ...
   }
   ```

   使用了`<typename...>`表明是类型参数包的类型，使用了`T...`表示是函数参数包的类型。
   在这个例子中，`Args` 是类型参数包，代表模板接受的一组类型（如 int, std::string）。
   `args` 是函数参数包（值参数包），代表函数接受的一组具体参数（如 42, "hello"）。
   在C++14的时候，参数包只能直接展开，不支持任何运算符，只能用于初始化列表、函数参数列表等场景中。

3. 折叠表达式的表示

```cpp
template<typename... Args>
auto sum(Args... args) {
  return (args + ...); // 使用折叠表达式展开参数包并求和
}
```

`(args + ...)`是一个折叠表达式，它会对参数包中的所有参数使用 `+` 运算符进行展开并求和。
除了`+`，还支持 `+`、`-`、`*`、`/` 等算术运算符，还有 `&&`、`||` 等等逻辑运算符，去展开参数包`args`。

### 2. c-style 不定长函数参数

```c++
void printNumbers(int count, ...)
{
    va_list args;
    va_start(args, count);

    for (int i = 0; i < count; i++) {
        int num = va_arg(args, int);
        printf("%d ", num);
    }

    va_end(args);
}
```

下面三个都是和 va_list 搭配使用的宏

- `va_start`:
  - 初始化，使其指向不定长参数列表的起始位置。
  - 它接受两个参数，第一个参数是一个`va_list`类型的变量，第二个是最后一个已知的固定参数.这个宏必须在访问不定长参数之前调用。
- `va_arg`: 该宏用于从不定长参数列表中获取下一个参数的值。
  - 它接受两个参数，第一个参数是一个`va_list`类型的变量，第二个参数是要获取的参数的类型.这个宏可以多次调用，每次调用都会返回下一个参数的
- `va_end`: 该宏用于清理`va_list`类型的变量。
  - 它接受一个参数，即要清理的`va_list`类型的变量。这个宏必须在长参数处理完毕后调用。

经典的`printf()`支持不定长参数的方式是这样子的：`va_start`获取`const char*`的`fmt`字符串，逐字符处理遇到`%`就通过一个`switch-case`去识别具体类型，然后再调用`va_arg`转到目标类型处理，获得对应的数值。这种方式类型容易不安全。
如果类型能够知道，就直接用`va_arg`获取。但是万一有一天翻车了，有个人传过来的不是目标类型，按照目标类型转过去了，就会有内存安全问题。

因此，C语言风格想安全实现不定长参数，就比较麻烦，得按照`printf()`这样子处理类型。

### 3. c++11-style 不定长模板参数

```c++
// c++11-style
int sum() {
    return 0;
}
template<typename T, typename... Args>
T sum(T first, Args... args) {
    return first + sum(args...);
}
```

这个写法是对`args`直接展开，然后继续实例化，继续展开。最后通过`int sum()`函数完成递归终止条件。
一般而言，在递归函数中，我们需要一个或多个基本情况（base case）来停止递归。
在这个例子中，`sum(T first, Args... args)`函数是一个可变参数模板，它会递归地调用自己，每次调用时都去掉一个参数，直到没有参数为止。当没有参数时，就会调用`int sum()`函数，返回 0，作为递归的终止条件。
如果没有这个`int sum()`函数，那么当参数列表为空时，编译器会找不到匹配的函数调用，导致编译错误。

### 4. c++11-style2 不定长模板参数

前面这种递归模板函数是一种标准的做法，但缺点显而易见的在于必须定义一个终止递归的函数。
而c++11还有另外一种黑魔法操作

```c++
// c++11-style2
template<typename... Args>
void print(Args... args) {
    (void)std::initializer_list<int>{(std::cout << args << " ", 0)...};
    std::cout << std::endl;
}
```

```c++
template<typename... Args>
void printArgs(Args... args) {
    (void)std::initializer_list{ (std::cout << args << (sizeof...(args) > 1 ? ", " : ""), 0)... };
    std::cout << std::endl;
}

```

这里也是对args参数包的展开。
这里的`int sum()`函数是一个递归终止条件。在递归函数中，我们需要一个或多个基本情况（base case）来停止递归。
在这个例子中，`sum(T first, Args... args)`函数是一个可变参数模板，它会递归地调用自己，每次调用时都去掉一个参数，直到没有参数为止。当没有参数时，就会调用`int sum()`函数，返回 0，作为递归的终止条件。
如果没有这个`int sum()`函数，那么当参数列表为空时，编译器会找不到匹配的函数调用，导致编译错误。

### 5. c++17-不定长模板参数与与折叠表达式

(args + ...)是 C++17 标准引入的一种新特性，叫做折叠表达式（Fold Expressions）。
折叠表达式可以将一个参数包（Parameter Pack）中的所有元素用某种运算符连接起来。(args + ...)就是一个折叠表达式，它将参数包 args 中的所有元素用加号（+）连接起来。

例如，如果调用 sum(1, 2, 3)，那么(args + ...)就会被展开为 1 + 2 + 3。

折叠表达式可以使用所有的二元运算符，包括+、-、\*、/、%、&&、||等等。此外，还可以使用一些特殊的运算符，如<<、>>、==、!=等等。
折叠表达式的工作原理是在编译时期将参数包展开，生成一个包含所有元素的表达式。这是在编译时期完成的，因此不会引入运行时开销。

```c++
// --1. fold expression c17-standard
template<typename... Args>
auto sum(Args... args) {
    return (args + ...);
}
```

### 98. quiz

#### 1. 变长参数实现的原理是什么？

首先，汇编语言是不支持变长参数的。C++的可变参数模板（Variadic Templates）和 C 语言的可变参数列表（Varargs）都是通过编译器在编译时期进行处理的，而不是在运行时期。
因此，它们并不依赖于汇编语言的支持。
而进一步地，汇编语言可以通过把变长的参数压在某一个栈中，pop 直至栈为空，来获取 args；也可以在编译器推导出参数个数，传入函数实现。
具体实现需要考虑性能，

#### 2. 具体是怎么处理...的

```c++
template<typename... Args>
auto sum(Args... args) {
    return (args + ...);
}
```

编译器处理 C++的可变参数模板（Variadic Templates）时，会将`...`视为一个参数包（Parameter Pack）。参数包可以包含零个或多个参数。
在这里的代码中，`Args... args`就是一个参数包。`Args...`表示参数的类型可以有多个，`args...`表示参数的值可以有多个。
当编译器遇到`...`时，它会对参数包进行展开（Unpack）。在你的代码中，`(args + ...)`就是一个折叠表达式（Fold Expression）。编译器会将其展开为`arg1 + arg2 + arg3 + ...`。
例如，如果调用`sum(1, 2, 3)`，那么编译器会将`(args + ...)`展开为`1 + 2 + 3`。

```c++
template <typename First, typename... Args>
auto sum3(const First first, const Args... args) -> decltype(first) {
  const auto values = {first, args...};
  return std::accumulate(values.begin(), values.end(), First{0});
}
```

这段代码是一个使用 C++可变参数模板（Variadic Templates）的函数模板，用于求和一系列数。
具体技巧为使用 C++的可变参数模板和初始化列表，以及 STL 的`std::accumulate`函数。

#### 3. 为什么用声明 first?

那么你需要找到一种方式来确定函数的返回类型，以及 std::accumulate 的初始值的类型。这是因为在 C++中，函数的返回类型和 std::accumulate 的初始值的类型都需要在编译时期确定。

如果你的函数只接受一个类型的参数，那么你可以直接使用这个类型作为返回类型和初始值的类型。例如：

```c++
template <typename... Args>
double sum3(const Args... args) {
  const auto values = {args...};
  return std::accumulate(values.begin(), values.end(), 0.0);
}
```

在这个例子中，函数的返回类型和初始值的类型都是 double。

### 99. 习题

#### 1. 理解这些实现

```c++
// 1. recursive parameter unpack
template <typename T0> void printf1(T0 value) {
  std::cout << value << std::endl;
}
template <typename T, typename... Ts> void printf1(T value, Ts... args) {
  std::cout << value << std::endl;
  printf1(args...);
}

// 2. variadic template parameter unfold
template <typename T0, typename... T> void printf2(T0 t0, T... t) {
  std::cout << t0 << std::endl;
  if constexpr (sizeof...(t) > 0)
    printf2(t...);
}

// 3. parameter unpack using initializer_list
template<typename... Args>
void print(Args... args) {
    (void)std::initializer_list<int>{(std::cout << args << " ", 0)...};
    std::cout << std::endl;
}

// 4. parameter unpack using folder expression
template <typename T, typename... Ts>
auto printf4(T value, Ts... args) {
    std::cout << value << std::endl;
    ((std::cout << args << std::endl), ...);
}
```

p.s. : 第三种写法是用了 lambda 函数接`()`表示调用, 后面用一个`, 0`是作为逗号表达式用的。

#### 2. 无需指定类型，自动获取 [std::variant](https://en.cppreference.com/w/cpp/utility/variant)值

```cpp
#include <array>
#include <cassert>
#include <functional>
#include <string>
#include <type_traits>
#include <variant>

namespace jc {

template <typename F, std::size_t... N>
constexpr auto make_array_impl(F f, std::index_sequence<N...>)
    -> std::array<std::invoke_result_t<F, std::size_t>, sizeof...(N)> {
  return {std::invoke(f, std::integral_constant<decltype(N), N>{})...};
}

template <std::size_t N, typename F>
constexpr auto make_array(F f)
    -> std::array<std::invoke_result_t<F, std::size_t>, N> {
  return make_array_impl(f, std::make_index_sequence<N>{});
}

template <typename T, typename Dst, typename... List>
bool get_value_impl(const std::variant<List...>& v, Dst& dst) {
  if (std::holds_alternative<T>(v)) {
    if constexpr (std::is_convertible_v<T, Dst>) {
      dst = static_cast<Dst>(std::get<T>(v));
      return true;
    }
  }
  return false;
}

template <typename Dst, typename... List>
bool get_value(const std::variant<List...>& v, Dst& dst) {
  using Variant = std::variant<List...>;
  using F = std::function<bool(const Variant&, Dst&)>;
  static auto _list = make_array<sizeof...(List)>([](auto i) -> F {
    return &get_value_impl<std::variant_alternative_t<i, Variant>, Dst,
                           List...>;
  });
  return std::invoke(_list[v.index()], v, dst);
}

}  // namespace jc

int main() {
  std::variant<int, std::string> v = std::string{"test"};
  std::string s;
  assert(jc::get_value(v, s));
  assert(s == "test");
  v = 42;
  int i;
  assert(jc::get_value(v, i));
  assert(i == 42);
}
```

#### 3. 字节序转换

```cpp
// https://en.cppreference.com/w/cpp/language/fold
#include <cstdint>
#include <type_traits>
#include <utility>

namespace jc {

template <typename T, size_t... N>
constexpr T bswap_impl(T t, std::index_sequence<N...>) {
  return (((t >> N * 8 & 0xFF) << (sizeof(T) - 1 - N) * 8) | ...);
}

template <typename T, typename U = std::make_unsigned_t<T>>
constexpr U bswap(T t) {
  return bswap_impl<U>(t, std::make_index_sequence<sizeof(T)>{});
}

}  // namespace jc

static_assert(jc::bswap<std::uint32_t>(0x12345678u) == 0x78563412u);
static_assert((0x12345678u >> 0) == 0x12345678u);
static_assert((0x12345678u >> 8) == 0x00123456u);
static_assert((0x12345678u >> 16) == 0x00001234u);
static_assert((0x12345678u >> 24) == 0x00000012u);
static_assert(jc::bswap<std::uint16_t>(0x1234u) == 0x3412u);

int main() {}
```

#### 4. TraverseNodeByEllipse

```c++
    namespace TraverseNodeByEllipse {

        struct Node {
            Node(int i) : val(i) {}

            int val = 0;
            Node* left = nullptr;
            Node* right = nullptr;
        };

        // 使用 operator->* 的折叠表达式，用于遍历指定的二叉树路径
        template <typename T, typename... Args>
        Node* traverse(T root, Args... paths) {
            return (root->*...->*paths);  // root ->* paths1 ->* paths2 ...
        }

        void test() {
            Node* root = new Node{0};
            root->left = new Node{1};
            root->left->right = new Node{2};
            root->left->right->left = new Node{3};

            auto left = &Node::left;
            auto right = &Node::right;
            Node* node1 = traverse(root, left);
            assert(node1->val == 1);
            Node* node2 = traverse(root, left, right);
            assert(node2->val == 2);
            Node* node3 = traverse(node2, left);
            assert(node3->val == 3);
        }
    }  // namespace TraverseNodeByEllipse
```
