---
layout: post
title: （四）模板那些事儿：不定长参数
categories: C++
related_posts: True
tags: template
toc:
  sidebar: right
---

## （四）模板那些事儿：不定长参数

c++的不定长参数主要是通过`...`运算符表示，在C语言风格的时候这种实现方式不是类型安全的，为了解决类型安全问题，势必要引入模板技巧，因为`c++`就只有模板能够对类型有足够的操作能力，判断能力。这也是为什么不定长参数在C++和类型实际上是关联的原因。

### 1. c-style 不定长函数参数

在C语言风格的函数中，可通过省略号来表示函数能够接受可变数量的参数。以下面的代码为例进行说明：

```c
#include <stdarg.h>
#include <stdio.h>

void print(const char* format, ...) {
    va_list args;
    va_start(args, format);
    // 使用va_arg依次获取可变参数并处理
    va_end(args);
}

void printNumbers(int count, ...) {
    va_list args;
    va_start(args, count);

    for (int i = 0; i < count; i++) {
        int num = va_arg(args, int);
        printf("%d ", num);
    }

    va_end(args);
}
```

上述代码展示了C风格不定长函数参数的典型使用方式。在处理可变参数时，需要借助`va_list`类型以及与之配合使用的三个宏：

- **`va_start`**：该宏用于初始化`va_list`类型的变量，使其指向不定长参数列表的起始位置。它接收两个参数，第一个参数为`va_list`类型的变量，第二个参数是函数中最后一个已知的固定参数。在访问不定长参数之前，必须调用此宏。例如在`printNumbers`函数中，`va_start(args, count)`使得`args`指向可变参数列表的起始处，其中`args`是`va_list`类型变量，`count`是函数中最后一个固定参数。
- **`va_arg`**：此宏用于从不定长参数列表中获取下一个参数的值。它接受两个参数，第一个参数为`va_list`类型的变量，第二个参数为要获取参数的类型。在函数中可多次调用该宏，每次调用将返回下一个参数的值。如在`printNumbers`函数中，`int num = va_arg(args, int)`从可变参数列表中获取下一个`int`类型的参数，并赋值给`num`。
- **`va_end`**：该宏用于清理`va_list`类型的变量，释放相关资源。它接受一个参数，即需要清理的`va_list`类型变量。在完成对不定长参数的处理后，必须调用此宏。在`printNumbers`函数处理完所有可变参数后，调用`va_end(args)`清理`args`变量。

以经典的`printf()`函数为例，其支持不定长参数的实现过程如下：首先通过`va_start`获取`const char*`类型的格式化字符串`fmt`，然后逐字符处理该字符串。当遇到`%`字符时，通过`switch - case`语句识别具体的数据类型，之后调用`va_arg`根据识别的类型获取对应数值。如果字符然而，这种方式存在类型安全隐患。因为在处理不定长参数时，如果实际传入参数的类型与预期不符，按照错误的目标类型进行转换，就可能引发内存安全问题。

因此，在C语言中，若要实现通用的不定长参数功能，需要像`printf()`函数那样，传入如`%d`之类指明类型的字符，并细致地处理参数类型，这无疑增加了实现的复杂性。

### 2. c++11-style 不定长模板参数

在模板编程领域，省略号用于定义参数包（Parameter Pack），此参数包能够容纳零个或多个参数。例如：

```cpp
template <typename... Args>
void print(Args... args) {
    // 在此处可对参数包args进行处理
}
```

在上述代码中，`typename... Args` 里的 `typename...` 表明 `Args` 是一个类型参数包，它意味着模板能够接受一组类型，像 `int`、`std::string` 等。而函数参数列表中的 `Args... args` 里的 `args` 则是函数参数包（值参数包），这表示函数可以接受一组具体的参数，例如 `42`、`"hello"`。

需要注意的是，在 C++14 标准下，参数包的展开存在一定限制。它只能直接展开，并不支持对参数包中的参数进行其他复杂运算。例如，不能像下面这样对参数包中的每个参数进行乘法运算后再展开：

```cpp
// 以下代码在C++14中是错误的，展示不支持的复杂运算
template <typename... Args>
void multiplyAndPrint(Args... args) {
    // 尝试对参数包中的每个参数乘以2后展开，C++14不支持
    int newArgs[] = { (args * 2)... };
    // 实际会报错，因为C++14不支持这种对参数包参数先运算再展开的操作
}
```

参数包主要应用于初始化列表、函数参数列表等特定场景。例如，在初始化列表中可以这样使用：`std::vector<int> vec{args...};`，它会将参数包 `args` 中的值依次作为 `std::vector<int>` 的初始值。或者在函数调用时传递参数包：`anotherFunction(args...);`，将参数包中的参数原封不动地传递给 `anotherFunction` 函数。

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

在上述 C++11 风格的代码示例中，展示了利用不定长模板参数实现递归求和的方法。这里，`sum(T first, Args... args)` 是一个可变参数模板函数。在函数执行过程中，它会将参数包 `args` 直接展开，每次递归调用去掉一个参数 `first`，并将剩余的参数包 `args` 继续传递给下一次递归调用。如此不断实例化新的函数调用并展开参数包，直至参数包为空。

此时，就会调用无参数的 `int sum()` 函数，它返回 0，作为整个递归过程的终止条件。在递归函数设计中，必须有明确的终止条件，以避免无限递归。若缺少 `int sum()` 函数，当参数列表为空时，编译器将无法找到匹配的函数调用，从而导致编译错误。

### 3. c++11-style2 不定长模板参数

在C++11中，除了使用递归模板函数处理不定长模板参数外，还有另一种巧妙的实现方式。使用递归模板函数处理不定长模板参数虽然常见，但缺点是必须定义一个用于终止递归的函数。而下面这种方式则展现了C++11在处理不定长模板参数时的灵活性。

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

在`print`函数中，借助`std::initializer_list`结合逗号表达式来展开参数包`args`。具体来看，`(std::cout << args << " ", 0)`这部分，首先将`args`中的每个参数输出并紧跟一个空格，然后逗号表达式返回0。这里的`...`用于对参数包`args`进行展开，将每个参数对应的操作生成一个列表，再通过`std::initializer_list<int>`进行初始化（使用`(void)`是为了避免未使用变量的警告）。最后，通过`std::cout << std::endl;`实现换行输出。

`printArgs`函数的原理与之类似，区别在于`(std::cout << args << (sizeof...(args) > 1? ", " : ""), 0)`。这里通过`sizeof...(args)`判断当前处理的是否是最后一个参数，如果不是最后一个参数，则在输出参数后紧跟一个逗号和空格，使输出格式更符合列表形式。同样，利用`std::initializer_list`结合逗号表达式展开参数包并完成输出操作。这种方式无需像递归模板函数那样定义专门的终止递归函数。

**`std::initializer_list`展开原理**：`std::initializer_list`的参数包展开依赖于编译器的特殊实现。从其构造函数层面看，它并没有采用`...`这种常见的不定长参数写法。在纯C++（不借助内嵌汇编）的环境下，无法直接编写`std::initializer_list`的构造函数。`std::initializer_list`之所以能够接受编译时不定长的参数，是编译器底层特殊处理与`std::initializer_list`自身设计相结合的结果。它提供了一种在初始化列表语境下展开参数包的方式，例如在`print`和`printArgs`函数中，利用`std::initializer_list`将参数包展开成一个初始化列表，从而实现对参数包的处理。

**二者差异**：一般参数包展开（如递归模板展开）是通过递归调用逐步处理参数包中的参数，依赖于模板函数的递归机制和参数传递。而`std::initializer_list`展开是利用编译器对初始化列表的特殊处理，在初始化列表构建过程中展开参数包。前者更侧重于通过函数递归逻辑处理参数，后者则借助初始化列表的特性来展开参数包，是两种不同的参数包展开思路。

**参数包展开的可实现性**：一般参数包展开（如递归模板展开方式）可以由开发者根据需求在代码层面实现，通过合理设计递归模板函数来处理参数包。然而，`std::initializer_list`的参数包展开方式，由于其依赖编译器底层特殊实现，在纯C++环境下开发者无法直接实现其构造函数以模拟相同的参数包展开机制。

```c++
template <typename First, typename... Args>
auto sum(const First first, const Args... args) -> decltype(first) {
  const auto values = {first, args...};
  return std::accumulate(values.begin(), values.end(), First{0});
}
```

这是一个利用 C++可变参数模板实现求和功能的函数模板。这里使用了可变参数模板和初始化列表的技巧，将第一个参数`first`和参数包`args`组合成一个初始化列表`values`。`decltype(first)`用于推导函数的返回类型，使其与第一个参数的类型一致。而`std::accumulate`是 C++标准模板库（STL）中的函数，它会从初始化列表`values`的起始位置`begin()`到结束位置`end()`，以初始值`First{0}`开始，对列表中的所有元素进行累加操作，最终返回累加的结果。通过这种方式，实现了对一系列数的求和功能。

### 4. c++17-不定长模板参数与与折叠表达式

在C++17中，折叠表达式是一项重要的新特性，它极大地增强了对不定长模板参数（参数包）的操作灵活性。

折叠表达式允许在编译期对参数包中的所有参数应用同一个运算符进行计算。例如：

```cpp
template<typename... Args>
auto sum(Args... args) {
    return (args + ...); // 使用折叠表达式展开参数包并求和
}
```

在上述代码中，`(args + ...)`就是一个折叠表达式。其工作原理是在编译期将参数包`args`展开，生成一个包含所有元素的表达式。以调用`sum(1, 2, 3)`为例，`(args + ...)`会展开为`1 + 2 + 3`，然后进行计算并返回结果。

折叠表达式支持多种二元运算符，包括：

- **算术运算符**：如`+`、`-`、`*`、`/`、`%`。例如，使用乘法运算符`*`进行折叠表达式操作可写成`(args * ...)`，它会对参数包中的所有参数进行乘法运算。
- **逻辑运算符**：如`&&`、`||`。
- **位运算符**：如`<<`、`>>`。
- **比较运算符**：如`==`、`!=`等。

以下是使用折叠表达式实现求和功能的代码示例：

```c++
// 1. fold expression c17 - standard
template<typename... Args>
auto sum(Args... args) {
    return (args + ...);
}
```

通过这种方式，开发者能够简洁高效地对参数包中的参数进行各种运算，而且由于操作在编译期完成，不会给程序带来额外的运行时开销。

```c++
template<typename... Args>
auto sum(Args... args) {
    return (args + ...);
}
```

编译器会把`...`所对应的部分视为一个参数包（Parameter Pack），参数包能够包含零个或多个参数。在这段代码里，`Args... args`就构成了一个参数包，其中`Args...`表示参数的类型可以有多个，`args...`表示对应参数的值也可以有多个。

当编译器遇到类似`(args + ...)`这样的折叠表达式（Fold Expression）时，会对参数包进行展开（Unpack）。例如，若调用`sum(1, 2, 3)`，编译器会将`(args + ...)`展开为`1 + 2 + 3`，从而实现对参数包中所有元素的运算。

### 99. quiz

#### 1. 变长参数实现的原理

C/C++ 中变长参数（如 `printf`）的实现，其核心依托于**栈帧结构**与**参数传递约定**，本质上是编译器层面的处理，并非依赖汇编语言的直接支持。以下从底层原理进行详细剖析：

- C语言风格实现（运行时）
  C 语言借助 `va_list`、`va_start`、`va_arg`、`va_end` 宏来达成变长参数的功能，其底层逻辑具体如下：

* **参数入栈顺序**：在 x86 架构的 C 语言环境里，参数按照**从右到左**的顺序压入栈中。例如，对于函数 `void func(int a, ...)`，若调用时传入参数 `func(1, 2, 3)`，那么入栈顺序依次为 `3`、`2`、`1`。
* **栈帧结构**：当函数被调用时，栈空间会依次存储**返回地址**、**调用者栈帧指针**（`ebp`）、**参数**以及**局部变量**。变长参数位于固定参数之后，通过栈指针的偏移量来实现对它们的访问。
* **`va_end(ap)`**：该宏并非无实际操作，它起着至关重要的作用。`va_end(ap)`用于清理`va_list`类型的变量`ap`，主要操作包括重置指针等相关资源，以此确保程序的正确性以及资源的合理释放，避免出现内存泄漏等问题。

- C++语言风格实现（编译时）
  C++11 引入的可变参数模板通过**编译期递归展开**来实现，与 C 语言在运行时处理变长参数的方式截然不同：

编译器在编译阶段能够确定参数的个数，并据此生成对应的函数实例。例如，对于函数调用 `print(1, "a", 3.14)`，编译器会将其展开为：

```cpp
print<int, const char*, double>(1, "a", 3.14);
```

C++可变参数模板在实现过程中无需像C语言那样进行栈操作。在参数传递方面，遵循常规的函数调用约定。以常见的 x64 架构为例，前 4 个整数/指针类型的参数通过寄存器传递，其余参数则通过栈传递。这种方式不仅在类型安全性上表现出色，而且相较于 C 语言的可变参数实现，在性能上也更具优势。

变长参数的实现核心要点在于**编译器对参数传递机制的抽象**：

- C 语言通过运行时的栈操作结合宏定义来实现变长参数，虽然灵活性较高，但类型安全方面相对薄弱。
- C++ 的可变参数模板借助编译期的模板展开实现，具备良好的类型安全性，同时性能更优。
- 汇编语言处理变长参数时，通常需要手动对栈进行操作，或者依赖编译器提供的辅助功能。在实际应用场景中，往往由高级语言进行封装后再调用汇编语言相关功能。

深入理解这些原理，有助于在高性能场景下对参数传递进行优化（比如规避不必要的栈操作），或者在底层开发工作中实现个性化的参数处理逻辑。

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

namespace {

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
}

int main() {
  std::variant<int, std::string> v = std::string{"test"};
  std::string s;
  assert(get_value(v, s));
  assert(s == "test");
  v = 42;
  int i;
  assert(get_value(v, i));
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
