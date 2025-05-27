---
layout: post
title: （四）模板那些事儿：不定长参数
categories: cpp
related_posts: True
tags: cpp template
toc:
  sidebar: left
---

## （三）模板那些事儿：不定长参数

c++的不定长参数主要是通过`...`运算符表示，而这个运算符又主要有三个语义。

### 1. c++省略号的三个语义

1. **不定长函数参数的表示**：
   在C风格的函数里，省略号用于表明函数可接受可变数量的参数。以如下代码为例，`print`函数中的`...`表示该函数能够接收任意数量的参数，这些参数的类型和具体数量在编译期是不确定的。`va_start`、`va_arg` 和 `va_end` 是C标准库中用于处理这些可变参数的宏。

```cpp
#include <cstdarg>
void print(const char* format, ...) {
    va_list args;
    va_start(args, format);
    // 使用va_arg依次获取可变参数并处理
    va_end(args);
}
```

2. **不定长模板参数（Variadic Templates）的表示**：
   在模板编程场景下，省略号用于定义参数包（Parameter Pack），这个参数包能够容纳零个或多个参数。例如：

```cpp
template <typename... Args>
void print(Args... args) {
    // 在此处可对参数包args进行处理
}
```

在上述代码中，`typename... Args` 里的 `typename...` 表明 `Args` 是一个类型参数包，它代表模板可以接受一组类型，比如 `int`, `std::string` 等。而函数参数列表中的 `Args... args` 里的 `args` 则是函数参数包（值参数包），意味着函数能够接受一组具体的参数，例如 `42`, `"hello"`。

需要注意的是，在C++14标准下，参数包的展开存在一定限制，它只能直接展开，不支持对参数包中的参数进行其他复杂运算。参数包主要应用于初始化列表、函数参数列表等特定场景。例如，在初始化列表中可以这样使用：`std::vector<int> vec{args...};`，或者在函数调用时传递参数包：`anotherFunction(args...);`

3. **折叠表达式的表示**：
   折叠表达式是C++17引入的一种特性，它允许对参数包进行更灵活的操作。通过折叠表达式，可以方便地对参数包中的所有参数应用同一个运算符进行计算。例如：

```cpp
template<typename... Args>
auto sum(Args... args) {
    return (args + ...); // 使用折叠表达式展开参数包并求和
}
```

在上述代码中，`(args + ...)` 就是一个折叠表达式。它会将参数包 `args` 中的所有参数，依次应用 `+` 运算符进行展开并求和。除了加法运算符 `+`，折叠表达式还支持诸如 `-`、`*`、`/` 等算术运算符，以及 `&&`、`||` 等逻辑运算符，以便对参数包 `args` 进行不同类型的运算操作。例如，使用乘法运算符 `*` 进行折叠表达式的操作可以写成 `(args * ...)`，这样就能对参数包中的所有参数进行乘法运算。

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

在上述代码中，展示了C风格不定长函数参数的典型使用方式。以下是与`va_list`配合使用的三个宏的详细说明：

- **`va_start`**：该宏用于初始化`va_list`类型的变量，使其指向不定长参数列表的起始位置。它接收两个参数，第一个参数为`va_list`类型的变量，第二个参数是函数中最后一个已知的固定参数。在访问不定长参数之前，必须调用此宏。

- **`va_arg`**：此宏用于从不定长参数列表中获取下一个参数的值。它接受两个参数，第一个参数为`va_list`类型的变量，第二个参数为要获取参数的类型。在函数中可多次调用该宏，每次调用将返回下一个参数的值。

- **`va_end`**：该宏用于清理`va_list`类型的变量，释放相关资源。它接受一个参数，即需要清理的`va_list`类型变量。在完成对不定长参数的处理后，必须调用此宏。

以经典的`printf()`函数为例，其支持不定长参数的实现方式如下：首先通过`va_start`获取`const char*`类型的格式化字符串`fmt`，然后逐字符处理该字符串。当遇到`%`字符时，通过`switch - case`语句识别具体的数据类型，之后调用`va_arg`根据识别的类型获取对应数值。然而，这种方式存在类型安全隐患。因为在处理不定长参数时，若实际传入参数的类型与预期不符，按照错误的目标类型进行转换，就可能引发内存安全问题。

因此，在C语言中，若要实现通用的不定长参数功能，需像`printf()`函数那样，传入`%d`之类的指明类型，并细致地处理参数类型，这无疑增加了实现的复杂性。

### 3. c++11-style 不定长模板参数

```c++
// C++11 - style
int sum() {
    return 0;
}
template<typename T, typename... Args>
T sum(T first, Args... args) {
    return first + sum(args...);
}
```

在上述C++11风格的代码示例中，展示了利用不定长模板参数实现递归求和的方法。这里，`sum(T first, Args... args)`是一个可变参数模板函数。在函数执行过程中，它会将参数包`args`直接展开，每次递归调用去掉一个参数`first`，并将剩余的参数包`args`继续传递给下一次递归调用。如此不断实例化新的函数调用并展开参数包，直至参数包为空。

此时，就会调用无参数的`int sum()`函数，它返回0，作为整个递归过程的终止条件。在递归函数设计中，必须有明确的终止条件，以避免无限递归。若缺少`int sum()`函数，当参数列表为空时，编译器将无法找到匹配的函数调用，从而导致编译错误。

### 4. c++11-style2 不定长模板参数

在C++11中，使用递归模板函数处理不定长模板参数是一种常见做法，但缺点是必须定义一个用于终止递归的函数。不过，C++11还有另一种巧妙的实现方式。

```c++
// C++11 - style2
template<typename... Args>
void print(Args... args) {
    (void)std::initializer_list<int>{(std::cout << args << " ", 0)...};
    std::cout << std::endl;
}
```

```c++
template<typename... Args>
void printArgs(Args... args) {
    (void)std::initializer_list{ (std::cout << args << (sizeof...(args) > 1? ", " : ""), 0)... };
    std::cout << std::endl;
}
```

在`print`函数中，利用了`std::initializer_list`结合逗号表达式来展开参数包`args`。`(std::cout << args << " ", 0)`这部分，首先将`args`中的每个参数输出并紧跟一个空格，然后逗号表达式返回0。`...`用于对参数包`args`进行展开，将每个参数对应的操作生成一个列表，再通过`std::initializer_list<int>`进行初始化（这里`(void)`用于避免未使用变量的警告）。最后换行输出。

`printArgs`函数原理类似，不同之处在于`(std::cout << args << (sizeof...(args) > 1? ", " : ""), 0)`，这里通过`sizeof...(args)`判断当前处理的是否是最后一个参数，如果不是最后一个参数，则在输出参数后紧跟一个逗号和空格，使得输出格式更符合列表形式，同样利用`std::initializer_list`结合逗号表达式展开参数包并完成输出操作。 这种方式无需像之前递归模板函数那样定义专门的终止递归函数，展现了C++11在处理不定长模板参数时的灵活性。

- **一般的参数包展开的原理是什么？和`std::initializer_list`是一样的吗？有什么不同？这个参数包展开是自己可实现的吗？**
  一般参数包展开与`std::initializer_list`中的参数包展开，原理有所不同。

一般参数包展开常采用递归模板展开的方式。在这种方式下，`...`是编译器在实例化阶段用于处理模板参数包的语法标识。通过递归调用模板函数，每次将参数包中的一个参数取出进行处理，直到参数包为空，完成整个展开过程。

而`std::initializer_list`的参数包展开则依赖于编译器的特殊实现。从其实现层面看，`std::initializer_list`的构造函数并没有采用`...`这种常见的不定长参数写法。在纯C++（不借助内嵌汇编）的环境下，无法直接编写`std::initializer_list`的构造函数。这是因为`std::initializer_list`能够接受编译时不定长的参数，是编译器底层特殊处理与`std::initializer_list`自身设计相结合的结果，从而在C++11中提供了一种有别于递归模板展开的参数包展开方式。

### 5. c++17-不定长模板参数与与折叠表达式

在C++17标准中，引入了一项新特性——折叠表达式（Fold Expressions），例如`(args + ...)`就是典型的折叠表达式。折叠表达式的作用是将一个参数包（Parameter Pack）中的所有元素，通过特定运算符连接起来。以`(args + ...)`为例，它会把参数包`args`中的所有元素用加号（`+`）连接。

例如，当调用`sum(1, 2, 3)`时，`(args + ...)`就会展开为`1 + 2 + 3`。

折叠表达式支持众多二元运算符，像常见的算术运算符`+`、`-`、`*`、`/`、`%`，逻辑运算符`&&`、`||`，以及位运算符`<<`、`>>`，比较运算符`==`、`!=`等。

折叠表达式的工作原理是在编译期将参数包展开，生成一个包含所有元素的表达式。这种在编译期完成的操作，不会给程序带来额外的运行时开销。

以下是一个使用折叠表达式实现求和功能的代码示例：

```c++
// --1. fold expression c17 - standard
template<typename... Args>
auto sum(Args... args) {
    return (args + ...);
}
```

### 98. quiz

#### 1. 变长参数实现的原理

首先需要明确，汇编语言本身并不直接支持变长参数。C++的可变参数模板（Variadic Templates）和C语言的可变参数列表（Varargs），都是由编译器在编译时期进行处理，而非运行时期，所以它们的实现并不依赖于汇编语言的支持。

对于汇编语言而言，若要处理变长参数，一种可行的方式是将变长的参数依次压入某个栈中，然后通过不断从栈中弹出元素，直至栈为空，以此来获取所有参数；另一种方式是借助编译器推导出参数个数，再将参数传入函数实现。不过在实际应用中，具体采用哪种实现方式需要综合考虑性能因素。例如，栈操作可能涉及较多的内存读写，频繁的压栈和弹栈操作可能会影响性能；而依赖编译器推导参数个数的方式，可能在编译器实现上需要更复杂的逻辑，但在运行时可能会有更好的性能表现。

#### 2. 具体是怎么处理`...`的

在C++中，编译器对可变参数模板（Variadic Templates）里的`...`有特定的处理方式。以以下代码为例：

```c++
template<typename... Args>
auto sum(Args... args) {
    return (args + ...);
}
```

编译器会把`...`所对应的部分视为一个参数包（Parameter Pack），参数包能够包含零个或多个参数。在这段代码里，`Args... args`就构成了一个参数包，其中`Args...`表示参数的类型可以有多个，`args...`表示对应参数的值也可以有多个。

当编译器遇到类似`(args + ...)`这样的折叠表达式（Fold Expression）时，会对参数包进行展开（Unpack）。例如，若调用`sum(1, 2, 3)`，编译器会将`(args + ...)`展开为`1 + 2 + 3`，从而实现对参数包中所有元素的运算。

再看下面这段代码：

```c++
template <typename First, typename... Args>
auto sum(const First first, const Args... args) -> decltype(first) {
  const auto values = {first, args...};
  return std::accumulate(values.begin(), values.end(), First{0});
}
```

这是一个利用C++可变参数模板实现求和功能的函数模板。这里使用了可变参数模板和初始化列表的技巧，将第一个参数`first`和参数包`args`组合成一个初始化列表`values`。`decltype(first)`用于推导函数的返回类型，使其与第一个参数的类型一致。而`std::accumulate`是C++标准模板库（STL）中的函数，它会从初始化列表`values`的起始位置`begin()`到结束位置`end()`，以初始值`First{0}`开始，对列表中的所有元素进行累加操作，最终返回累加的结果。通过这种方式，实现了对一系列数的求和功能。

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

#### 2. 无需指定类型，自动获取`std::variant`

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
#include <cstdint>
#include <type_traits>
#include <utility>

namespace {

    template <typename T, std::size_t... N>
    constexpr T bswap_impl(T t, std::index_sequence<N...>) {
        return (((t >> N * 8 & 0xFF) << (sizeof(T) - 1 - N) * 8) | ...);
    }

    template <typename T, typename U = std::make_unsigned_t<T>>
    constexpr U bswap(T t) {
        return bswap_impl<U>(t, std::make_index_sequence<sizeof(T)>{});
    }

}  // namespace

static_assert(bswap<std::uint32_t>(0x12345678u) == 0x78563412u);
static_assert(bswap<std::uint16_t>(0x1234u) == 0x3412u);

int main() {}
```

#### 4. TraverseNodeByEllipse

```c++
#include <cassert>
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

int main() { TraverseNodeByEllipse::test(); }
```
