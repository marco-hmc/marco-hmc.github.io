---
layout: post
title: （五）模板那些事儿：表达式模板
categories: C++
related_posts: True
tags: Template
toc:
  sidebar: right
---

## （五）模板那些事儿：表达式模板

表达式模板（Expression Templates）是一种高级的模板编程技术，主要用于优化复杂表达式的计算，尤其是在数值计算和矩阵运算等领域。它通过延迟计算（Lazy Evaluation）和避免中间结果的生成，显著提高了程序的性能。

### 1. 数值计算中的中间变量

在 C++ 中，简单的基本类型运算，如 `a = b + c + d;`（假设 `a`、`b`、`c`、`d` 为 `int` 类型），生成的汇编代码大致如下：

```asm
mov reg, [b] ; 将 b 的值移动到寄存器
add reg, [c] ; 寄存器的值与 c 相加，结果存于寄存器
add reg, [d] ; 寄存器的值再与 d 相加，结果仍存于寄存器
mov [a], reg ; 将寄存器的值移至 a 的内存位置
```

然而，当涉及自定义类型时，情况会变得复杂。以如下自定义的 `Vec3` 类型为例：

```c++
struct Vec3 {
    float x, y, z;
};

Vec3 operator+(const Vec3& lhs, const Vec3& rhs) {
    return Vec3{ lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z };
}
Vec3 a, b, c, d;
a = b + c + d;
```

对于 `a = b + c + d;` 这行代码，通常生成的汇编代码类似这样：

```asm
; tmp1 = b + c
movss xmm0, [b.x] ; 将 b.x 加载到 xmm0 浮点寄存器
addss xmm0, [c.x] ; xmm0 与 c.x 相加
movss [tmp1.x], xmm0 ; 将结果存到 tmp1.x

movss xmm1, [b.y]
addss xmm1, [c.y]
movss [tmp1.y], xmm1

movss xmm2, [b.z]
addss xmm2, [c.z]
movss [tmp1.z], xmm2

; tmp2 = tmp1 + d
movss xmm0, [tmp1.x]
addss xmm0, [d.x]
movss [tmp2.x], xmm0

movss xmm1, [tmp1.y]
addss xmm1, [d.y]
movss [tmp2.y], xmm1

movss xmm2, [tmp1.z]
addss xmm2, [d.z]
movss [tmp2.z], xmm2

; a = tmp2
movss xmm0, [tmp2.x]
movss [a.x], xmm0

movss xmm1, [tmp2.y]
movss [a.y], xmm1

movss xmm2, [tmp2.z]
movss [a.z], xmm2
```

在此过程中，由于每次 `+` 操作根据 `operator+` 的语义都会生成一个 `Vec3` 临时变量，即便开启了 `-O3` 优化选项，这些临时变量也不一定能被完全优化掉。

更优的汇编代码应类似这样：

```asm
; a.x = b.x + c.x + d.x
movss xmm0, [b.x]
addss xmm0, [c.x]
addss xmm0, [d.x]
movss [a.x], xmm0

; a.y = b.y + c.y + d.y
movss xmm1, [b.y]
addss xmm1, [c.y]
addss xmm1, [d.y]
movss [a.y], xmm1

; a.z = b.z + c.z + d.z
movss xmm2, [b.z]
addss xmm2, [c.z]
addss xmm2, [d.z]
movss [a.z], xmm2
```

对比两段汇编代码，后者没有中间变量，减少了频繁的内存写回操作，效率更高。

编译器不能直接优化成更优代码的原因：

- **语义一致性的保持**：编译器需要遵循 C++ 的语言标准和语义。在标准中，`operator+` 的定义会生成临时对象，编译器在优化时需要确保不改变程序的可观察行为。优化成无临时变量的形式可能会改变某些边界情况下程序的行为，例如在临时对象有副作用（如析构函数中有重要操作）时，直接去除临时对象会导致副作用无法执行。
- **数据流和控制流分析的局限性**：编译器的优化依赖于对代码数据流和控制流的分析。复杂的代码结构、指针运算、虚函数调用等因素会增加分析的难度。对于 `Vec3` 的例子，如果代码中存在对 `Vec3` 对象的复杂操作，或者 `operator+` 函数内有复杂逻辑，编译器可能难以确定去除临时对象是否安全，从而无法进行这种优化。

那么，怎样才能让编译器生成后者代码呢？这个时候就可以使用表达式模板了

### 2. 表达式模板的原理

正如前面`a = b + c + d;`这个例子中，如果是基本类型，则往往都能够在同一个寄存器操作完毕，然后不需要再写回到内存当中去，因为不涉及到临时变量的构造；

问题在于如果`a,b,c,d`是自定义类型的时候，编译器往往都会生成临时变量，这个临时变量编译器往往不好判断是否能优化掉，因此都倾向于不优化，选择生成临时变量。特别是临时变量如果是有构造函数的话。因此如果要砍掉这个中间变量的话，其实就是让自定义类型和自定义类型的运算，转变成基本类型之间的运算，即把`a = b + c + d;`这个表达式展开成`a.x = b.x + c.x + d.x; a.y = b.y + c.y + d.y; a.z = b.z + c.z + d.z;`这种形式，而不是`a = operator+(operator+(b, c), d);`这种形式。

```c++
struct Vec3 {
    float x, y, z;
};

Vec3 operator+(const Vec3& lhs, const Vec3& rhs) {
    return Vec3{ lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.z };
}
Vec3 a, b, c, d;
a = b + c + d;

// bad way
auto tmp = b + c; // 会生成中间变量
a = tmp + d;

// ideal way
a.x, a.y, a.z = [b.x + c.x + d.x], [b.y + c.y + d.y], [b.z + c.z + d.z]
```

而`[b.x + c.x + d.x]`的时候是相当于这种的，因此就没有中间变量了。

```asm
movss xmm0, [b.x]
addss xmm0, [c.x]
addss xmm0, [d.x]
movss [a.x], xmm0
```

而要达到这种目的，需要一种延迟计算的能力，即`a = b + c + d;`的时候不要算出来具体的值，只是存储这个表达式，知道是哪些基本类型相加，最后的时候求值的时候才展开计算，这个时候就是多个基本类型相加，就不需要中间变量了。而获得表达式这个的开销实际上是和具体数值无关的，因此这部分开销应该通过模板元变成挪到编译时进行。最后，基于上述想法的叠加，最终得到的一个实现就如下了：

```cpp
#include <vector>
#include <iostream>

template <typename T>
class Vector {
public:
    std::vector<T> data;

    Vector(size_t size) : data(size) {}

    // 重载加法运算符，返回表达式模板
    template <typename E>
    Vector& operator=(const E& expr) {
        for (size_t i = 0; i < data.size(); ++i) {
            data[i] = expr[i];
        }
        return *this;
    }

    T& operator[](size_t i) { return data[i]; }
    const T& operator[](size_t i) const { return data[i]; }
};

// 表达式模板类
template <typename L, typename R>
class AddExpr {
    const L& lhs;
    const R& rhs;

public:
    AddExpr(const L& l, const R& r) : lhs(l), rhs(r) {}

    auto operator[](size_t i) const { return lhs[i] + rhs[i]; }
};

// 重载加法运算符，返回表达式模板
template <typename L, typename R>
auto operator+(const L& lhs, const R& rhs) {
    return AddExpr<L, R>(lhs, rhs);
}

int main() {
    Vector<int> a(3), b(3), c(3);
    a.data = {1, 2, 3};
    b.data = {4, 5, 6};
    c = a + b; // 使用表达式模板
    for (const auto& val : c.data) {
        std::cout << val << " "; // 输出：5 7 9
    }
}
```

其优点在于：

- **性能优化**：通过延迟计算避免了中间结果的生成，减少了临时对象的创建和拷贝。
- **灵活性**：可以轻松扩展支持更多的操作符和表达式类型。
- **编译期优化**：表达式模板利用了模板的静态多态性，允许编译器在编译期生成高效的代码。

应用场景在于：

- **数值计算库**：如 Eigen、Blaze 等矩阵运算库。
- **符号计算**：如符号代数库。
- **嵌入式开发**：在资源受限的环境中，通过表达式模板优化性能。

但是这东西都非常看编译器优化，我试过开不同编译优化等级、是否开`-ffast-math` `-funroll-loops`这些都对性能影响很大，特别是如果这些都开了，表达式模板能比传统方式快非常非常多。

### 99. appendix

```c++
#include <array>
#include <chrono>
#include <iostream>
#include <random>
#include <vector>

// ------------------------- 表达式模板基类 -------------------------
template <typename E>
class Expression {
  public:
    double operator[](size_t i) const {
        return static_cast<const E&>(*this)[i];
    }

    size_t size() const { return static_cast<const E&>(*this).size(); }
};

// ------------------------- std::array 实现 -------------------------
template <size_t N>
class VectorET_array : public Expression<VectorET_array<N>> {
  private:
    std::array<double, N> data;

  public:
    VectorET_array() = default;

    double& operator[](size_t i) { return data[i]; }
    double operator[](size_t i) const { return data[i]; }

    size_t size() const { return N; }

    template <typename E>
    VectorET_array& operator=(const Expression<E>& expr) {
        for (size_t i = 0; i < N; ++i) {
            data[i] = expr[i];
        }
        return *this;
    }
};

// ------------------------- std::vector 实现（表达式模板） -------------------------
class VectorET_vector : public Expression<VectorET_vector> {
  private:
    std::vector<double> data;

  public:
    VectorET_vector(size_t size) : data(size) {}

    double& operator[](size_t i) { return data[i]; }
    double operator[](size_t i) const { return data[i]; }

    size_t size() const { return data.size(); }

    template <typename E>
    VectorET_vector& operator=(const Expression<E>& expr) {
        for (size_t i = 0; i < data.size(); ++i) {
            data[i] = expr[i];
        }
        return *this;
    }
};

// ------------------------- std::vector 实现（传统计算） -------------------------
class VectorTraditional {
  private:
    std::vector<double> data;

  public:
    VectorTraditional(size_t size) : data(size) {}

    double& operator[](size_t i) { return data[i]; }
    const double& operator[](size_t i) const { return data[i]; }

    size_t size() const { return data.size(); }

    VectorTraditional operator+(const VectorTraditional& other) const {
        VectorTraditional result(size());
        for (size_t i = 0; i < size(); ++i) result[i] = data[i] + other[i];
        return result;
    }

    VectorTraditional operator-(const VectorTraditional& other) const {
        VectorTraditional result(size());
        for (size_t i = 0; i < size(); ++i) result[i] = data[i] - other[i];
        return result;
    }

    VectorTraditional operator*(double scalar) const {
        VectorTraditional result(size());
        for (size_t i = 0; i < size(); ++i) result[i] = data[i] * scalar;
        return result;
    }
};

// ------------------------- 表达式模板运算 -------------------------
template <typename E1, typename E2>
class AddExpr : public Expression<AddExpr<E1, E2>> {
  private:
    const E1& a;
    const E2& b;

  public:
    AddExpr(const E1& a, const E2& b) : a(a), b(b) {}
    double operator[](size_t i) const { return a[i] + b[i]; }
    size_t size() const { return a.size(); }
};

template <typename E1, typename E2>
class SubExpr : public Expression<SubExpr<E1, E2>> {
  private:
    const E1& a;
    const E2& b;

  public:
    SubExpr(const E1& a, const E2& b) : a(a), b(b) {}
    double operator[](size_t i) const { return a[i] - b[i]; }
    size_t size() const { return a.size(); }
};

template <typename E>
class MulExpr : public Expression<MulExpr<E>> {
  private:
    const E& a;
    double scalar;

  public:
    MulExpr(const E& a, double scalar) : a(a), scalar(scalar) {}
    double operator[](size_t i) const { return a[i] * scalar; }
    size_t size() const { return a.size(); }
};

// 运算符重载
template <typename E1, typename E2>
AddExpr<E1, E2> operator+(const Expression<E1>& a, const Expression<E2>& b) {
    return AddExpr<E1, E2>(static_cast<const E1&>(a),
                           static_cast<const E2&>(b));
}

template <typename E1, typename E2>
SubExpr<E1, E2> operator-(const Expression<E1>& a, const Expression<E2>& b) {
    return SubExpr<E1, E2>(static_cast<const E1&>(a),
                           static_cast<const E2&>(b));
}

template <typename E>
MulExpr<E> operator*(const Expression<E>& a, double scalar) {
    return MulExpr<E>(static_cast<const E&>(a), scalar);
}

template <typename E>
MulExpr<E> operator*(double scalar, const Expression<E>& a) {
    return MulExpr<E>(static_cast<const E&>(a), scalar);
}

// ------------------------- 初始化函数 -------------------------
template <typename Vec>
void initVector(Vec& vec) {
    std::mt19937 gen(std::random_device{}());
    std::uniform_real_distribution<> dis(0.0, 1.0);
    for (size_t i = 0; i < vec.size(); ++i) {
        vec[i] = dis(gen);
    }
}

// ------------------------- 测试 array -------------------------
void runArrayTest() {
    constexpr size_t N = 10000;
    constexpr int iterations = 100;
    using Vec = VectorET_array<N>;

    Vec a, b, c, d, result;
    initVector(a);
    initVector(b);
    initVector(c);
    initVector(d);

    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < iterations; ++i) {
        result = ((a + b) - (c * 2.0)) + (d * 3.0);
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "std::array + 表达式模板: "
              << std::chrono::duration<double, std::milli>(end - start).count()
              << " ms\n";
}

// ------------------------- 测试 vector + 表达式模板 -------------------------
void runVectorTemplateTest() {
    constexpr size_t N = 10000;
    constexpr int iterations = 100;
    using Vec = VectorET_vector;

    Vec a(N), b(N), c(N), d(N), result(N);
    initVector(a);
    initVector(b);
    initVector(c);
    initVector(d);

    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < iterations; ++i) {
        result = ((a + b) - (c * 2.0)) + (d * 3.0);
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "std::vector + 表达式模板: "
              << std::chrono::duration<double, std::milli>(end - start).count()
              << " ms\n";
}

// ------------------------- 测试 vector + 传统写法 -------------------------
void runVectorTraditionalTest() {
    constexpr size_t N = 10000;
    constexpr int iterations = 100;
    using Vec = VectorTraditional;

    Vec a(N), b(N), c(N), d(N), result(N);
    initVector(a);
    initVector(b);
    initVector(c);
    initVector(d);

    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < iterations; ++i) {
        result = (a + b - (c * 2.0) + (d * 3.0));
    }
    auto end = std::chrono::high_resolution_clock::now();
    std::cout << "std::vector + 传统写法: "
              << std::chrono::duration<double, std::milli>(end - start).count()
              << " ms\n";
}

// ------------------------- main -------------------------
int main() {
    std::cout << "表达式模板 vs 传统写法 性能对比:\n";
    runArrayTest();
    runVectorTemplateTest();
    runVectorTraditionalTest();
    return 0;
}

```
