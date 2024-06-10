---
title: trivial grammar
date: 2024-06-05 21:22:45 +0800
image: /images/post/post-33.jpg
project: project_ccpp
tags: grammar

---

## trivial grammar

### 1. attribute
```c++
#include <iostream>

[[deprecated("This function is deprecated. Use newFunction() instead.")]] void
oldFunction() {
  std::cout << "This is the old function." << std::endl;
}

[[nodiscard]] int calculate() { return 42; }

int main() {
  oldFunction(); // Generates a deprecation warning
  int result =
      calculate(); // Generates a warning if the return value is ignored

  return 0;
}
```
这段代码展示了C++17标准中引入的两个新属性：`[[deprecated]]`和`[[nodiscard]]`。

- `[[deprecated]]`属性用于标记已经被废弃的函数。当你试图使用被`[[deprecated]]`标记的函数时，编译器会生成一个警告，告诉你这个函数已经被废弃，你应该使用其他函数代替。在这个例子中，`oldFunction`函数被标记为废弃，所以在`main`函数中调用`oldFunction`时，编译器会生成一个警告。

- `[[nodiscard]]`属性用于标记那些返回值不应该被忽略的函数。如果你调用了被`[[nodiscard]]`标记的函数，但没有使用它的返回值，编译器会生成一个警告。在这个例子中，`calculate`函数被标记为`[[nodiscard]]`，所以在`main`函数中调用`calculate`但没有使用它的返回值时，编译器会生成一个警告。

除了`[[deprecated]]`和`[[nodiscard]]`，C++还有其他的属性，如`[[maybe_unused]]`（用于标记可能未被使用的变量，以避免编译器生成未使用变量的警告）、`[[likely]]`和`[[unlikely]]`（用于给编译器提供分支预测的提示，这两个属性在C++20中引入）等。

### 2. literals

```c++
#include <cmath>
#include <iostream>
#include <string>

// 是使用字面量方式实现的.在C++中,字面量是表示固定值的文本形式.整数字面量可以加上后缀来指定其类型.
unsigned int x = 1u;
unsigned long y = 1ul; // 可以32位,一般64位
unsigned long z = 1LU;
unsigned long long w = 1ull; // 至少64位
unsigned long long v = 1LLU;
long a = 1l;
long b = 1L;
long long c = 1ll;
long long d = 1LL;

const char *utf8Str = u8"这是一个UTF-8字符串";
const char16_t *utf16Str = u"这是一个UTF-16字符串";
const char32_t *utf32Str = U"这是一个UTF-32字符串";
const wchar_t *wideStr = L"这是一个宽字符串";

// Usage: 24_celsius; // == 75
long long operator"" _celsius(unsigned long long tempCelsius) {
  return std::llround(tempCelsius * 1.8 + 32);
}

// Usage: "123"_int; // == 123, with type `int`
int operator"" _int(const char *str) { return std::stoi(str); }

int main() {
  // 使用_celsius字面量将摄氏温度转换为华氏温度
  long long tempFahrenheit = 24_celsius;
  std::cout << "24 degrees Celsius is " << tempFahrenheit
            << " degrees Fahrenheit.\n";

  // 使用_int字面量将字符串转换为整数
  int num = "123"_int;
  std::cout << "The integer value of the string \"123\" is " << num << ".\n";

  return 0;
}
```

### 3. Ref-qualified member functions

```c++
struct Bar {
  // ...
};

struct Foo {
  Bar getBar() & { return bar; }
  Bar getBar() const& { return bar; }
  Bar getBar() && { return std::move(bar); }
private:
  Bar bar;
};

Foo foo{};
Bar bar = foo.getBar(); // calls `Bar getBar() &`

const Foo foo2{};
Bar bar2 = foo2.getBar(); // calls `Bar Foo::getBar() const&`

Foo{}.getBar(); // calls `Bar Foo::getBar() &&`
std::move(foo).getBar(); // calls `Bar Foo::getBar() &&`

std::move(foo2).getBar(); // calls `Bar Foo::getBar() const&&`
```

```c++
auto x = 1;
auto f = [&r = x, x = x * 10] {
  ++r;
  return r + x;
};
f(); // sets x to 2 and returns 12
```

在C++11之前，成员函数只能根据是否修改了对象的状态（即是否为const）进行重载。C++11引入了引用限定的成员函数，允许你根据*this是左值引用还是右值引用来重载成员函数。

在这个例子中，Foo类有三个getBar成员函数，它们的区别在于*this的类型：

Bar getBar() &：当*this是非const左值引用时，调用这个版本的函数。
Bar getBar() const&：当*this是const左值引用时，调用这个版本的函数。
Bar getBar() &&：当*this是右值引用时，调用这个版本的函数。
这种特性在你需要根据对象是左值还是右值来选择不同的行为时非常有用。例如，当对象是右值时，你可能希望移动（而不是拷贝）它的成员，以提高性能。

在这个例子中，当Foo对象是右值时，getBar函数会返回bar成员的移动版本，而不是拷贝版本。这可以避免不必要的拷贝，从而提高性能。

此外，这段代码还展示了C++14引入的一种新特性：初始化捕获（Init capture）。这种特性允许你在lambda表达式的捕获列表中进行初始化。在这个例子中，lambda表达式捕获了x的引用和x * 10的值。