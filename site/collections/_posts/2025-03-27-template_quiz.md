---
date: 2025-03-27 19:40:36 +0800
project: language
title: template_quiz
image: /images/post/post-25.jpg
tags: template

---

## 9. 总结

从数学的角度出发，可以将编程中函数理解为给定一个输入，返回一个输出的行为，输入一定，输出也不一定一定，因为这个函数可以有一些内部状态变量。但这个抽象是没问题的。
那么模板元编程的输入则是一个必须在编译器给定，也就是运行之前给定的一个输入。

那对于应用开发层面使用模板元编程实现一个复杂的计算来说，这个能力则太弱了。如果输入是固定的，我算一次，记住即可，连编译器计算都可以省略。因此模板元编程主要还是应用于库开发，因为我知道某一个数值需要被计算和使用，但我不知道他人将要怎么使用，因此模板元编程是有意义的。

除此之外，模板元编程的还有一大意义在于类型计算。出于极致的性能考虑，c++代码运行时不一定都是存在类型信息的，且这个类型信息能力很弱，无法提供一些是否为引用，指针，常量等信息数据。这些类型信息的获取都得通过模板的方式，因为类型在编译器是一直存在的。也就是不管类型检查，类型比较，类型计算都得使用模板去做比较好。比如说通过类型比较，实现设计模式中的策略模式去选择调用方法。

### 99. quiz
#### 1. 怎么理解模板导致的代码膨胀？
不理解，似乎又说能保证odr(one-definition rule)
对于某一个普通函数，其代码文件只会存在于一个编译单元中；但如果使用了模板方法，则在不同的编译单元中，模板实例化的时候，都会有一个实例化代码。
使得增加了编译时间，和二进制文件的大小。


#### 2. 多个源文件中使用类模板
 在多个obj文件中可能产生多个重复的类模板对应的具体的实例化类，但链接的时候只会保留一个ATPL<int>类的实体，其余的会被忽略掉；
（3.1）虚函数的实例化
虚函数即使没有被调用，但也会被实例化出来，为什么？因为有虚函数，编译器就会产生虚函数表。虚函数表里是各个虚函数的地址，既然需要各个虚函数的地址，那么必须要实例化每个虚函数出来。
（3.2）显式实例化
显式实例化是指在代码中明确指定要实例化的模板参数，以确保模板类或函数在编译时生成特定类型的实例。这可以避免在多个源文件中重复实例化模板，并减少编译时间和二进制文件的大小。


#### 3. 类模板的实例化分析
如果程序代码中没有用到类模板ATPL，那么编译器对ATPL类模板视而不见，就好像从来没存在过一样；
（2.1）模板中的枚举类型，和类模板本身关系不大
（2.2）类模板中的静态成员变量
（2.3）类模板的实例化
1. 类模板指针不会实例化
2. 类模板引用会实例化
（2.4）成员函数的实例化
1. 实例化类模板，在不调用成员函数的情况下，不会实例化


#### 4. 注入类名
是说对类模板的作用域内，如果这个类型没有显式指定模板参数，默认都是用当前模板类型T的类型吗？

#### 5. 模板函数内联和不内联的区别是什么？

#### 6. 模板参数parameter和模板实参argument概念的区分

使用了 decltype(a)，各种莫名其妙报错，is_same_v 判断无效（因为 decltype(a) 会返回 A const & 而不是 A，用 std::decay_t<decltype(a)> 即可）

T::value_type 无法编译通过（由于缺乏 typename 前缀，用 typename T::value_type 即可）



#### 7. 将与参数无关的代码抽离模板（Factor Parameter-Independent Code Out of Templates）

在 C++ 模板编程中，模板参数的多样化可能导致生成冗余的二进制代码。为避免这种情况，可以将与模板参数无关的代码提取到模板外部。

* **原始代码**

```cpp
template<typename T, std::size_t n>
class SquareMatrix {
public:
    void invert(); // 求逆矩阵
};

SquareMatrix<double, 5> sm1;
SquareMatrix<double, 10> sm2;
sm1.invert();  // 编译器会为这两个调用生成两个完全不同的 invert 实现
sm2.invert();
```

* **改进后的代码**

将与模板参数 `n` 无关的代码提取到基类 `SquareMatrixBase` 中：

```cpp
template<typename T>
class SquareMatrixBase {
protected:
    void invert(std::size_t matrixSize);  // 在基类中实现实际的求逆算法
};

template<typename T, std::size_t n>
class SquareMatrix : private SquareMatrixBase<T> {
private:
    using SquareMatrixBase<T>::invert;  // 避免遮蔽基类的 invert 函数

public:
    void invert() {
        this->invert(n);  // 使用一个 inline 调用来调用基类的 invert
    }
};
```

* **增加矩阵数据存储**

使用指针存储矩阵数据，并在构造函数中传递给基类：

```cpp
template<typename T, std::size_t n>
class SquareMatrix : private SquareMatrixBase<T> {
public:
    SquareMatrix() : SquareMatrixBase<T>(n, 0), pData(new T[n * n]) {
        this->setDataPtr(pData.get());  // 设置矩阵数据指针
    }

private:
    std::unique_ptr<T[]> pData;  // 存储在堆上的矩阵数据
};
```

* **总结**
    1. **避免模板参数依赖：** 将与模板参数无关的代码抽离到基类中，减少冗余代码。
    2. **使用基类共享实现：** 通过基类共享实现，避免因模板实例化导致的代码膨胀。
    3. **通过成员变量替代模板参数：** 将非类型模板参数作为类成员变量传递，减少二进制膨胀。
    4. **使用指针和动态内存：** 动态分配存储数据，进一步减少代码膨胀。

通过这些技巧，可以有效减少模板参数导致的代码膨胀，优化编译时间和生成的二进制文件。
