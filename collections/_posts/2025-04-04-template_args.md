---
date: 2025-04-04 10:24:28 +0800
project: language
title: template_args
image: /images/post/post-26.jpg
tags: template

---

## 2. 模板参数

### 2.1 类型模板参数

类型是模板参数的一种，用于指定模板的类型。类型模板参数允许你编写与类型无关的代码，从而提高代码的重用性和灵活性。类型模板参数通常使用 `typename` 或 `class` 关键字来声明。

```cpp
// 函数模板示例
template <typename T>
T add(T a, T b) {
    return a + b;
}

// 类模板示例
template <typename T>
class Pair {
public:
    Pair(T first, T second) : first(first), second(second) {}
    T getFirst() const { return first; }
    T getSecond() const { return second; }
private:
    T first;
    T second;
};

int main() {
    int result1 = add(3, 4);
    double result2 = add(3.5, 4.5);

    Pair<int> intPair(1, 2);
    Pair<double> doublePair(3.5, 4.5);

    return 0;
}
```

### 2.2 非类型模板参数

简单来说就是模板参数是非类型参数。

非类型模板参数是模板参数的一种，用于指定模板的常量值。非类型模板参数可以是整数、枚举、指针或引用等。非类型模板参数允许你在模板中使用常量值，从而提高代码的灵活性。

```cpp
// 函数模板示例
template <typename T, int N>
T arraySum(T (&arr)[N]) {
    T sum = 0;
    for (int i = 0; i < N; ++i) {
        sum += arr[i];
    }
    return sum;
}

// 类模板示例
template <typename T, int N>
class Array {
public:
    T& operator[](int index) {
        return data[index];
    }
    const T& operator[](int index) const {
        return data[index];
    }
private:
    T data[N];
};

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    int sum = arraySum(arr); // 使用 int 类型和大小为 5 的数组
    Array<int, 10> intArray; // 使用 int 类型和大小为 10 的数组
    intArray[0] = 42;

    return 0;
}
```

### 2.3 模板模板参数

模板本身也可以是模板参数的一种，用于指定模板的模板参数。模板模板参数允许你编写接受其他模板作为参数的模板，从而提高代码的灵活性和重用性。

```cpp
// 类模板示例
template <typename T>
class Container {
public:
    void add(const T& value) {
        data.push_back(value);
    }
    const T& get(int index) const {
        return data[index];
    }
private:
    std::vector<T> data;
};

// 模板参数还是模板的示例
template <template <typename> class ContainerType, typename T>
class Wrapper {
public:
    void add(const T& value) {
        container.add(value);
    }
    const T& get(int index) const {
        return container.get(index);
    }
private:
    ContainerType<T> container;
};

int main() {
    Wrapper<Container, int> intWrapper;
    intWrapper.add(42);
    int value = intWrapper.get(0);

    return 0;
}
```
其实实际上模板也可以看成是一种类型，只是一种编译时才能确定的类型。


### 99. quiz

#### 1. 模板参数支持默认参数，但模板默认参数不能用于推断

```cpp
namespace jc {

template <typename T>
void f(T x = 42) {}

}  // namespace jc

int main() {
  jc::f<int>();  // T = int
  jc::f();       // 错误：无法推断 T
}
```
