---
layout: post
title: （二）C++对象内存模型那些事儿：类的继承和多态
categories: C++
related_posts: True
tags: Class
toc:
  sidebar: right
---

## （二）C++对象内存模型那些事儿：类的继承和多态

### 1. 多态机制详解

多态是高级语言的核心特性之一，**它允许通过统一的接口处理不同类型的对象，或者说统一的接口但是被不同对象调用时有不同效果**，这显著提高代码的可重用性和可扩展性。因此，广义上来说多态主要有两种方式：静态多态（编译时多态）和动态多态（运行时多态）。但一般提到多态，通常指的就是动态多态。因为静态多态本质上是编译期的函数重载和模板实例化，不涉及运行时行为的变化，而动态多态则是运行时根据对象的实际类型决定调用哪个函数实现。前者是编译器在编译期完成的且非常好理解，而后者则需要在运行时通过某种机制来实现。

**重要提示**：只有指针和引用才能实现运行时多态，这是由于内存安全考虑——虚函数指针不会在对象拷贝时被复制。

#### 1.1 静态多态（编译时多态）

静态多态在编译期确定调用的具体函数，也称为静态绑定或早绑定。编译器在此阶段就能确定所有数据成员的确切类型、大小和内存位置。

##### 函数重载（Function Overloading）

允许在同一作用域内使用相同函数名，但参数列表必须不同（类型、数量或顺序）。

```cpp
#include <iostream>

class Calculator {
public:
    int add(int a, int b) {
        return a + b;
    }

    double add(double a, double b) {
        return a + b;
    }

    int add(int a, int b, int c) {
        return a + b + c;
    }
};

int main() {
    Calculator calc;
    std::cout << calc.add(1, 2) << std::endl;        // 调用int版本
    std::cout << calc.add(1.5, 2.5) << std::endl;   // 调用double版本
    std::cout << calc.add(1, 2, 3) << std::endl;    // 调用三参数版本
    return 0;
}
```

**编译器处理流程**：

1. **符号解析**：根据函数名和参数列表查找所有可能的函数定义
2. **重载决议**：根据参数类型和数量选择最佳匹配的函数
3. **代码生成**：生成调用选定函数的代码

#### 1.2 动态多态（运行时多态-虚函数）

动态多态在程序运行时决定调用的具体函数，也称为动态绑定或晚绑定，主要通过虚函数机制实现。

##### 动态多态的实现原理

C++通过虚函数表（vtable）和虚函数表指针（vptr）实现动态多态：

1. **虚函数表（vtable）**：每个包含虚函数的类都有一个虚函数表，存储该类所有虚函数的地址
2. **虚函数表指针（vptr）**：每个包含虚函数的对象都有一个指向其类虚函数表的指针
3. **动态绑定**：运行时通过 vptr 找到正确的虚函数表，再根据函数索引调用相应函数

##### 虚函数机制示例

```cpp
#include <iostream>
#include <memory>

class Shape {
public:
    virtual ~Shape() = default;  // 虚析构函数
    virtual void draw() const {
        std::cout << "Drawing a shape" << std::endl;
    }
    virtual double area() const = 0;  // 纯虚函数
};

class Circle : public Shape {
private:
    double radius;

public:
    Circle(double r) : radius(r) {}

    void draw() const override {
        std::cout << "Drawing a circle with radius " << radius << std::endl;
    }

    double area() const override {
        return 3.14159 * radius * radius;
    }
};

class Rectangle : public Shape {
private:
    double width, height;

public:
    Rectangle(double w, double h) : width(w), height(h) {}

    void draw() const override {
        std::cout << "Drawing a rectangle " << width << "x" << height << std::endl;
    }

    double area() const override {
        return width * height;
    }
};

void processShape(const Shape& shape) {
    shape.draw();  // 动态绑定
    std::cout << "Area: " << shape.area() << std::endl;
}

int main() {
    Circle circle(5.0);
    Rectangle rect(4.0, 6.0);

    processShape(circle);    // 调用Circle::draw()和Circle::area()
    processShape(rect);      // 调用Rectangle::draw()和Rectangle::area()

    // 通过指针的多态行为
    std::unique_ptr<Shape> shapePtr = std::make_unique<Circle>(3.0);
    shapePtr->draw();        // 调用Circle::draw()

    return 0;
}
```

在 C++ 中，虚函数的实现主要依赖于虚函数表（也称为 vtable）。每一个有虚函数的类，编译器都会为其生成一个虚函数表，表是一个函数指针数组，表中包含了该类及其基类的所有虚函数地址。每一个该类的对象，都会有一个指向虚函数表的指针（通常称为 vptr）。

虚表的构造和虚指针的初始化通常发生在对象构造时。当一个对象被创建时，编译器会自动将该对象的 vptr 初始化为指向该类的虚函数表。

当我们通过基类指针调用虚函数时，实际上是通过这个指针找到虚函数表，然后在表中查找并调用对应的函数。编译时就能确定这个虚函数的偏移地址，在运行时的时候，就会去查看当前对象的虚函数指针，根据虚函数指针找到对应的虚函数表，基于编译时确定的偏移地址去调用。

如果 Foo 类是父类，Bar1 和 Bar2 是子类，而 func()是 Foo 类非纯虚函数的时候。那么就会有分别对应的三个虚函数表（Foo, Bar1，Bar2 各一个）。对象实例化的时候就会有一个指针指向一个虚函数表，虚函数表里有一个 Foo 类函数地址。这个时候不管静态解析类型是什么，比如说是 Foo 类，但调用 func()方法的时候，因为编译器知道 func()是虚函数方法。就都是通过虚函数指针找到实际调用对象。

##### 虚函数表结构图示

```
Shape对象:        Circle对象:       Shape vtable:     Circle vtable:
+-----------+    +-----------+    +-------------+   +-------------+
| vptr      |    | vptr      |    | ~Shape()    |   | ~Circle()   |
| ...       |    | radius    |    | draw()      |   | draw()      |
+-----------+    | ...       |    | area()=0    |   | area()      |
    |            +-----------+    +-------------+   +-------------+
    |                |                 |                 |
    |                |                 v                 v
    |                |            Shape::draw()     Circle::draw()
    |                |                               Circle::area()
    v                v
Shape::vtable    Circle::vtable
```

在 C++ 中，虚函数的实现主要依赖于虚函数表（也称为 vtable）。每一个有虚函数的类，编译器都会为其生成一个虚函数表，表是一个函数指针数组，表中包含了该类及其基类的所有虚函数地址。每一个该类的对象，都会有一个指向虚函数表的指针（通常称为 vptr）。

虚表的构造和虚指针的初始化通常发生在对象构造时。当一个对象被创建时，编译器会自动将该对象的 vptr 初始化为指向该类的虚函数表。

当我们通过基类指针调用虚函数时，实际上是通过这个指针找到虚函数表，然后在表中查找并调用对应的函数。编译时就能确定这个虚函数的偏移地址，在运行时的时候，就会去查看当前对象的虚函数指针，根据虚函数指针找到对应的虚函数表，基于编译时确定的偏移地址去调用。

如果 Foo 类是父类，Bar1 和 Bar2 是子类，而 func()是 Foo 类非纯虚函数的时候。那么就会有分别对应的三个虚函数表（Foo, Bar1，Bar2 各一个）。对象实例化的时候就会有一个指针指向一个虚函数表，虚函数表里有一个 Foo 类函数地址。这个时候不管静态解析类型是什么，比如说是 Foo 类，但调用 func()方法的时候，因为编译器知道 func()是虚函数方法。就都是通过虚函数指针找到实际调用对象。

简单来说：

1. **共享性**：同一个类的所有对象共享同一个虚函数表
2. **存储位置**：虚函数表存储在程序的只读数据段（.rodata 段）
3. **继承性**：子类继承父类的虚函数，重写时更新虚函数表中的地址
4. **索引固定**：同一继承体系中相同虚函数的索引位置固定

虚函数表指针位置：虚函数表指针通常位于对象内存的开始位置（MSVC 和 GCC 的实现），这样设计有以下优势：

- 便于类型转换时的指针调整
- 简化多继承场景下的虚函数调用

##### 为什么只有指针和引用才能多态

```cpp
#include <iostream>

class Animal {
public:
    Animal() { std::cout << "Animal constructor" << std::endl; }
    Animal(const Animal& other) {
        std::cout << "Animal copy constructor" << std::endl; }
    virtual void speak() { std::cout << "Animal speaks" << std::endl; }
};

class Dog : public Animal {
public:
    Dog() { std::cout << "Dog constructor" << std::endl; }
    void speak() override { std::cout << "Dog barks" << std::endl; }
};

int main() {
    // 1. 多态行为（通过指针和引用）
    Animal* animalPtr = new Dog();
    animalPtr->speak();  // 输出: Dog barks（动态绑定）

    Dog dog;
    Animal& animalRef = dog;
    animalRef.speak();   // 输出: Dog barks（动态绑定）

    // 2. 对象切片（Object Slicing）
    Animal animal = Dog();  // 发生对象切片
    animal.speak();         // 输出: Animal speaks（静态绑定）

    delete animalPtr;
    return 0;
}

/*
对象切片的原因：
1. Animal animal = Dog() 会调用Animal的拷贝构造函数
2. Dog对象被隐式转换为Animal对象，Dog特有的部分被"切掉"。
    因为dog在栈上申请内存的时候是按照Animal的大小申请的，dog的内存布局是按照Animal来的。

3. 这个过程中，包括虚函数指针也被切掉了，或者说虚函数指针也被重置为指向Animal的虚函数表（安全考虑）
4. 如果保留Dog的虚函数指针，这个时候子类的虚函数有可能是使用了子类特有的类成员变量的，可能导致访问Dog特有成员变量时出错
*/
```

如果说允许普通类型的对象也能多态的话，那么就会出现以下问题：

1. `Animal animal = Dog()` 会调用Animal的拷贝构造函数
2. animal按照`Animal`类型申请内存空间，animal对象持有`Dog`类型的虚函数指针
3. 当调用`animal.speak()`时，会通过animal的虚函数指针去调用Dog::speak()，但是此时animal对象并没有Dog类型的成员变量，可能会访问到未定义的内存区域，导致程序崩溃或行为异常。
   因此基于这个考虑，C++设计成只有通过指针和引用才能实现多态行为，以确保内存安全性。
   那指针和引用怎么就可以呢？
   `Animal* animalPtr = new Dog();` 这里animalPtr申请的是一个指针空间，而且`Animal*`和`Dog*`指针大小是一样的。

##### 动态多态导致类对象的内存布局改变

- **无动态多态时的内存布局（即当一个类不包含虚函数时）**

* 对象头部：通常只包含直接的数据成员。对象的大小直接由其数据成员的总大小决定，加上可能的 padding（用于对齐）。
* 访问速度：因为函数调用是静态绑定的，编译器在编译时期就能确定调用哪个函数，因此访问速度快。

- **含有动态多态时的内存布局** 当一个类包含虚函数或继承自含有虚函数的基类时：

* 虚函数表指针（vptr）：对象内存布局中会额外包含一个指向虚函数表（vtbl）的指针。这个 vptr 通常位于对象的最开始位置，但这也取决于具体的编译器实现。
* 虚函数表（vtbl）：不在对象实例内，而是在类的内存区域。它存储了该类及其基类中所有虚函数的地址。
* 对象大小：由于增加了 vptr，对象的总大小会比无多态时增加（通常是一个指针大小，如 4 字节或 8 字节）。
* 访问速度：虚函数调用需要通过 vptr 间接访问虚函数表，再根据表中地址调用实际函数，因此相对于静态绑定，动态调用会有一定的性能开销。
* 多态行为：通过基类指针或引用来调用虚函数时，能够根据对象的实际类型执行相应的派生类函数，实现了运行时的多态性。

#### 1.3 总结

- **虚函数表指针与虚函数表**

  1. 虚函数表指针（vptr）：每个包含至少一个虚函数的类的实例对象中，都会有一个隐含的指针，这个指针称为虚函数表指针。它通常位于对象内存布局的起始位置。这个指针指向该对象所属类的虚函数表。
  2. 虚函数表：虚函数表是一个存储函数指针的数组，这些函数指针分别指向类中声明为虚的成员函数。这些函数可以是本类定义的，也可以是从基类继承而来并通过虚继承覆盖的。虚函数表中的函数地址按照声明的顺序排列。
  3. 虚函数地址存储：在编译阶段，编译器会为每个包含虚函数的类生成一个虚函数表，并将这些虚函数的地址填入表中相应的位置。当对象实例化时(对象创建时)，其虚函数表指针会被初始化为指向正确的虚函数表。

- **虚函数表指针位置** 虚函数表指针位于对象的内存的开头还是末尾取决于编译器的实现。但主流实践和预期是 vptr 位于对象内存的开始位置，如 MSVC 和 g++。

- **虚函数表分析**
  1. 一个类只有包含虚函数才会存在虚函数表，同属于一个类的实例化对象共享同一个虚函数表。每个对象的 vptr（虚函数表指针），所指向的地址（虚函数表首地址）相同。
  2. 虚函数表存储在程序的只读数据段（.rodata 段）中。这是因为虚函数表的内容在程序运行期间是不变的，它包含了类中虚函数的地址，这些地址在编译时期就已经确定，并且不会随着程序的运行而改变。将虚函数表置于只读数据段有助于保护其不被意外修改，同时也有利于内存管理，因为这部分内存通常被映射为不可写，提升了程序的安全性。
  3. 子类会继承父类中的虚函数，即在父类是虚函数，子类不显示声明为虚函数，依然是虚函数。
  4. 当一个子类继承自一个具有虚函数的父类时，编译器会为子类生成一个新的虚函数表，其中包含父类虚函数的地址（如果没有被子类重写的话）。如果子类重写了父类的某个或某些虚函数，子类的虚函数表中对应项会被更新，指向子类中重写后函数的地址，以确保多态行为能正确实现——即通过基类指针或引用来调用函数时，会调用到子类中实际重写的方法。

### 2. 继承机制详解

#### 2.1 普通继承的内存布局

```cpp
class Base {
public:
    int baseData;
    void baseFunction() { /* ... */ }
};

class Derived : public Base {
public:
    int derivedData;
    void derivedFunction() { /* ... */ }
};

// Derived对象的内存布局：
// [baseData][derivedData]
```

基类的成员变量直接嵌入派生类对象中，访问控制（public、private、protected）仅在编译期生效，在汇编层面没有区别。

#### 2.2 对象切片问题详解

对象切片是指将派生类对象赋值给基类对象时，派生类特有的部分被"切掉"的现象。

```cpp
#include <iostream>

class Animal {
public:
    virtual void makeSound() { std::cout << "Animal sound" << std::endl; }
    virtual ~Animal() = default;
};

class Dog : public Animal {
private:
    std::string breed;

public:
    Dog(const std::string& b) : breed(b) {}
    void makeSound() override {
        std::cout << "Woof! I'm a " << breed << std::endl;
    }
};

int main() {
    Dog dog("Golden Retriever");

    // 对象切片发生
    Animal animal = dog;  // Dog对象被切片为Animal对象
    animal.makeSound();   // 输出: Animal sound

    // 正确的多态调用
    Animal& animalRef = dog;
    animalRef.makeSound(); // 输出: Woof! I'm a Golden Retriever

    return 0;
}
```

**对象切片的原因**：

1. 内存布局差异：Animal 对象只分配 Animal 大小的内存
2. 安全考虑：防止访问不存在的派生类成员
3. 虚函数指针重置：指向基类的虚函数表

#### 2.3 多继承中的虚函数处理

```cpp
// cpp
#include <iostream>
struct A {
    virtual void a() {}
    int ai = 1;
};
struct B {
    virtual void b() {}
    int bi = 2;
};
struct C : A, B {
    virtual void c() {}
    int ci = 3;
};

int main() {
    C obj;
    std::cout << "obj addr: " << &obj << "\n";
    // A 子对象的 vptr（位于 obj 起始）
    void** vptrA = reinterpret_cast<void**>(&obj);
    std::cout << "vptrA = " << vptrA << ", *vptrA = " << *vptrA << "\n";
    // B 子对象在 C 内的偏移：转换到 B* 再读取 vptr
    B* bp = static_cast<B*>(&obj);
    void** vptrB = reinterpret_cast<void**>(bp);
    std::cout << "B subobj addr: " << bp << ", vptrB = " << vptrB
              << ", *vptrB = " << *vptrB << "\n";
    return 0;
}
/*
obj addr: 0x7fff310b1a40
vptrA = 0x7fff310b1a40, *vptrA = 0x556e78cd9d10
B subobj addr: 0x7fff310b1a50, vptrB = 0x7fff310b1a50, *vptrB = 0x556e78cd9d30
*/
```

在 C++的多继承中，每个基类都有自己的虚函数表。当一个类从多个基类继承时，它会有多个虚函数表指针，每个指针指向一个基类的虚函数表。当我们通过基类指针调用虚函数时，会根据指针的类型找到对应的虚函数表，然后在表中查找并调用对应的函数。编译器在编译时就能确定使用哪个 vptr，因此多继承的虚函数调用开销与单继承基本相同。

### 3. 虚继承机制

虚继承是 C++中的一种特殊的继承方式，主要用于解决多继承中的菱形继承问题。在菱形继承中，如果不使用虚继承，那么最底层的派生类会继承多份基类的数据和方法，这会导致资源的浪费和访问的歧义。而解决菱形继承的，关键思想在于保证父类数据的唯一。 为了实现父类数据的唯一，派生类都不直接持有父类数据，而是通过一个指针找到父类数据。 这个指针就是 vbptr，父类数据则存储在 vbtable 表中。当出现菱形继承的时候，则会有两个 vbptr 指针。编译器会发现这两个指针指向同一个表地址，就优化为一个指针。 这样子就可以保证数据唯一了。

#### 3.1 菱形继承问题

```cpp
// 不使用虚继承的菱形继承问题
class Animal {
public:
    int age;
    void eat() { /* ... */ }
};

class Mammal : public Animal {
public:
    bool warmBlooded = true;
};

class Bird : public Animal {
public:
    bool canFly = true;
};

class Bat : public Mammal, public Bird {
public:
    void echolocate() { /* ... */ }
};

int main() {
    Bat bat;
    // bat.age = 5;      // 编译错误：歧义，不知道访问哪个Animal::age
    bat.Mammal::age = 5; // 必须明确指定作用域
    bat.Bird::age = 3;   // 这是另一个Animal::age
    return 0;
}
```

#### 3.2 虚继承解决方案

在 C++ 中，虚继承是一种用于解决多重继承中菱形继承问题（即一个派生类从多个直接或间接基类继承相同基类成员，导致数据冗余和访问歧义）的机制。

虚继承的核心原理在于，当一个类虚继承某个基类时，虚继承的基类子对象会被共享，而不是在每个派生类中都复制一份。为实现这种共享，编译器会引入虚基表（vbtable）和虚基指针（vbptr）。

对于虚继承的类，编译器会在对象内存布局中添加一个虚基指针，该指针指向虚基表。虚基表存储了虚继承基类子对象相对于派生类对象起始地址的偏移量。通过这种方式，不同派生类对象中的虚基指针都指向同一个虚基表，进而访问到共享的虚基类子对象，保证了虚基类子对象在内存中只有一份。

```c++
class A { int a; };
class B : virtual A { int b; };
class C : virtual A { int c; };
class D : public B, public C { int d; };
```

当 `B` 和 `C` 都虚继承自 `A` 时，`B` 和 `C` 并不直接持有 `A` 的数据，而是各自拥有一个虚基指针（vbptr），这两个虚基指针分别指向一个虚基表（vbtable）。这个虚基表中记录着 `A` 子对象相对于 `B` 和 `C` 对象起始地址的偏移量。此时，`D` 类对象不会有两份 `A` 的数据，而是拥有分别来自 `B` 和 `C` 的两个虚基指针，它们都指向同一个存储 `A` 数据的区域（通过虚基表的偏移量定位），从而解决了菱形继承问题。

当访问 `objD.a` 时，实际过程如下：假设 `objD` 是 `D` 类的对象，`objD` 中的 `vBasePtrB`（从 `B` 继承而来的虚基指针）通过指向的虚基表获取 `A` 子对象相对于 `B` 子对象起始地址的偏移量，再结合 `B` 子对象在 `objD` 中的起始地址，经过一次偏移定位到 `A` 子对象的起始地址，最终访问到 `a` 成员；同理，`objD.vBasePtrC.a` 也是类似过程，由于 `vBasePtrB` 和 `vBasePtrC` 指向的虚基表都对应同一个 `A` 子对象，所以两者结果一致。

进一步来看，虽然从逻辑上有两次偏移（从 `objD` 到 `B` 子对象，再从 `B` 子对象到 `A` 子对象），但由于这些偏移信息在编译期就已确定，编译器可以在编译期直接计算出 `a` 相对于 `objD` 的实际偏移地址。因此，对 `a` 的访问开销与普通成员变量基本一致。需要明确的是，虚基表存储的是虚继承基类子对象（这里即 `A` 子对象）相对于派生类对象（如 `B` 或 `C`）起始地址的偏移量，并非 `vBasePtrB.a` 的值。

如此就避免了 `A` 子对象的重复存储，解决了菱形继承带来的数据冗余和访问歧义问题。

```cpp
class Animal {
public:
    int age;
    virtual void makeSound() = 0;
    virtual ~Animal() = default;
};

class Mammal : virtual public Animal {  // 虚继承
public:
    bool warmBlooded = true;
};

class Bird : virtual public Animal {    // 虚继承
public:
    bool canFly = true;
};

class Bat : public Mammal, public Bird {
public:
    void makeSound() override {
        std::cout << "Bat screeches" << std::endl;
    }
    void echolocate() { /* ... */ }
};

int main() {
    Bat bat;
    bat.age = 5;        // 正确：只有一个Animal::age
    bat.makeSound();    // 正确：调用Bat::makeSound()

    std::cout << "Age: " << bat.age << std::endl;
    std::cout << "Warm blooded: " << bat.warmBlooded << std::endl;
    std::cout << "Can fly: " << bat.canFly << std::endl;

    return 0;
}
```

#### 3.3 虚继承的实现原理

虚继承通过虚基类指针（vbptr）和虚基类表（vbtable）实现：

1. **虚基类指针（vbptr）**：派生类对象包含指向虚基类表的指针
2. **虚基类表（vbtable）**：存储虚基类相对于派生类对象的偏移量
3. **共享机制**：确保虚基类在最终派生类中只有一个实例

```
Bat对象内存布局（简化）:
+------------------+
| Mammal vbptr     | → 指向虚基类表
| Mammal数据       |
+------------------+
| Bird vbptr       | → 指向同一个虚基类表
| Bird数据         |
+------------------+
| Bat数据          |
+------------------+
| Animal数据       | ← 共享的虚基类实例
+------------------+
```

#### 3.4 虚继承下的虚函数

虚继承下的虚函数里涉及复杂的指针调整，浅尝辄止，了解即可。

在多重继承或虚继承中，派生类的虚函数实现可能需要调整调用时的 this（偏移）以得到期望的子对象布局。编译器会为这种情况生成“thunk”或在 vtable 中存储调整信息。

在 C++ 中，虚继承场景下虚函数的调用机制在本质上与常规虚函数调用机制一致，都是基于虚指针（vptr）和虚函数表（VTable）来实现动态多态。即通过对象的 vptr 找到对应的 VTable，再根据 VTable 中存储的虚函数地址来调用实际的虚函数。

然而，虚继承引入了虚基指针（vbptr）和虚基表（vbtable）来解决继承路径中的共享基类实例问题，这对虚函数调用过程以及基类数据成员的访问和构造/析构过程产生了特定影响。

在虚函数调用方面，由于虚继承改变了对象的内存布局，当通过派生类对象调用虚函数时，虽然最终仍是通过 vptr 和 VTable 来确定函数地址，但在获取 vptr 以及基于 vptr 定位 VTable 的过程中，可能会因为虚继承引入的内存布局变化而涉及指针调整。例如，在多继承且存在虚继承的复杂结构中，对象内存布局变得更为复杂，编译器需要根据虚继承的关系调整指针，以确保 vptr 能正确指向对应的 VTable。

对于基类数据成员的访问，虚继承使得基类子对象在内存中的位置和访问方式发生改变。因为虚继承实现了基类子对象的共享，所以在通过派生类对象访问基类数据成员时，需要借助 vbptr 和 vbtable 来定位共享的基类子对象。这与非虚继承下直接通过对象偏移量访问基类数据成员的方式不同，增加了访问的复杂性。

在构造和析构过程中，虚继承也带来了特殊的处理。由于共享基类子对象的存在，构造函数的调用顺序和初始化方式变得更为复杂。在构造派生类对象时，首先要初始化虚继承的基类子对象，且这个初始化过程需要通过虚基表来正确定位和初始化共享的基类子对象。析构过程则相反，先析构派生类部分，再析构虚继承的基类子对象。

### 4. quiz

#### 1. 普通成员函数 vs 虚函数的编译器处理

- **普通成员函数**：编译时确定函数地址，生成直接调用指令
- **虚函数**：编译时生成通过虚函数表的间接调用指令。对于虚函数，编译器在编译时不能确定函数的地址，因为虚函数的调用需要在运行时通过虚函数表来确定。所以在生成的汇编代码中，函数调用会转换为通过虚函数表来查找函数地址。

#### 2. 虚函数表大小对性能的影响

虚函数在表中的索引位置在编译时就已确定，因此虚函数表的大小不影响运行时性能。访问虚函数是 O(1)的直接索引访问，而非遍历查找。

#### 3. 虚函数调用的性能开销

非内联函数的直接调用大概是 45-90ns 级别。如果是虚函数则大概是 90-180ns 级别。除此之外，一般函数直接调用的时候分支预测和指令预取命中率会更高。虚函数的间接调用是不利于优化的。这部分的开销也需要考虑的。

但总的而言，这个开销是固定的，如果一个函数不考虑纳秒级别的优化，就不需要考虑虚函数带来的影响。如果是到了纳秒级别优化的时候，也建议实际测一下开销，测了才能知道虚函数的开销是否不可接受。

```cpp
// 性能对比示例
class TestClass {
public:
    void normalFunction() { /* 一些操作 */ }
    virtual void virtualFunction() { /* 相同的操作 */ }
};

// 典型性能差异：
// 普通函数调用：45-90ns
// 虚函数调用：90-180ns
// 额外考虑：分支预测和指令预取的影响
```

**何时需要考虑虚函数开销**：

- 纳秒级性能优化需求
- 高频调用的性能关键路径
- 建议：通过实际测试验证性能影响

#### 4. 对于非多态类型和多态类型，如何获取类型信息（type_info）？

- 对于**非多态类型**（即没有虚函数的类），类型信息（type_info）通常可以通过编译时的类型信息直接获取，不需要通过虚拟表（vtable）来访问。

- 对于**多态类型**（即包含至少一个虚函数的类），每个对象会有一个虚拟表（vtable），其中包含了指向该类型 type_info 对象的指针。这样，可以通过对象的虚拟表在运行时动态地访问到其类型信息。

```cpp
#include <iostream>
#include <typeinfo>

class Base {
public:
    virtual ~Base() = default;  // 多态类型
};

class NonPolymorphic {
public:
    int data;
};

int main() {
    Base* basePtr = new Base();
    NonPolymorphic nonPoly;

    // 多态类型：通过虚函数表获取类型信息
    std::cout << typeid(*basePtr).name() << std::endl;

    // 非多态类型：编译时确定类型信息
    std::cout << typeid(nonPoly).name() << std::endl;

    delete basePtr;
    return 0;
}
```

#### 5. C++多继承的时候，如何处理同名成员变量？同名成员函数？

如果两个基类有同名的成员变量或成员函数，那么在派生类中需要通过作用域解析运算符（::）来指定要访问哪个基类的成员。

如果是直接对派生类访问两个基类同名的成员变量，就会报错。

#### 6. 如果一个类多继承，且父类都有虚函数，那这个类有几个虚表？

虚表是一个抽象的概念，一般来说是虚函数指针会指向一段连续的内存区域，这段内存区域存储了虚函数的地址，这个内存区域我们称之为虚函数表。

当这个类多继承且父类都有虚函数时，是一定会有多个虚函数指针，但是这些指针指向的虚函数表可能是同一块内存区域，也可能是不同的内存区域，也有可能是相邻的两个内存区域，这取决于编译器的实现。

但狭义上来说，就是多个虚函数指针，多个虚函数表。

#### 7. 继承可以理解为两种，接口继承和实现继承？

- 接口继承：简单来说就是有虚函数，存在多态行为的；
- 实现继承：简单来说就是父类没有虚函数，是通过继承方式做组合的。当通过继承做组合的时候，和普通成员变量做组合的区别在于被组合函数是否需要直接对外。

#### 5. 多继承中的指针转换

```cpp
class A { virtual void f() {} };
class B { virtual void g() {} };
class C : public A, public B {};

int main() {
    C obj;
    C* cPtr = &obj;

    // static_cast会进行正确的指针调整
    A* aPtr = static_cast<A*>(cPtr);  // 安全转换
    B* bPtr = static_cast<B*>(cPtr);  // 需要指针调整

    // 危险的C风格转换（不推荐）
    B* bPtr2 = (B*)cPtr;  // 可能导致错误的指针值

    return 0;
}
```

#### 6. 虚拟构造函数模式

```cpp
#include <iostream>
#include <memory>
#include <vector>

// 抽象基类
class Document {
public:
    virtual ~Document() = default;
    virtual std::unique_ptr<Document> clone() const = 0;  // 虚拟拷贝构造函数
    virtual void print() const = 0;
};

// 具体文档类型
class TextDocument : public Document {
private:
    std::string content;

public:
    TextDocument(const std::string& text) : content(text) {}

    std::unique_ptr<Document> clone() const override {
        return std::make_unique<TextDocument>(*this);
    }

    void print() const override {
        std::cout << "Text: " << content << std::endl;
    }
};

class ImageDocument : public Document {
private:
    std::string filename;

public:
    ImageDocument(const std::string& file) : filename(file) {}

    std::unique_ptr<Document> clone() const override {
        return std::make_unique<ImageDocument>(*this);
    }

    void print() const override {
        std::cout << "Image: " << filename << std::endl;
    }
};

// 文档管理器
class DocumentManager {
private:
    std::vector<std::unique_ptr<Document>> documents;

public:
    void addDocument(std::unique_ptr<Document> doc) {
        documents.push_back(std::move(doc));
    }

    // 虚拟拷贝构造函数的应用
    DocumentManager(const DocumentManager& other) {
        for (const auto& doc : other.documents) {
            documents.push_back(doc->clone());  // 多态拷贝
        }
    }

    void printAll() const {
        for (const auto& doc : documents) {
            doc->print();
        }
    }
};

int main() {
    DocumentManager manager;
    manager.addDocument(std::make_unique<TextDocument>("Hello World"));
    manager.addDocument(std::make_unique<ImageDocument>("photo.jpg"));

    // 使用虚拟拷贝构造函数
    DocumentManager copy = manager;  // 调用拷贝构造函数

    std::cout << "Original:" << std::endl;
    manager.printAll();

    std::cout << "Copy:" << std::endl;
    copy.printAll();

    return 0;
}
```

### 5. 性能开销总结

#### 内存开销

1. **虚函数**：每个对象增加一个 vptr（8 字节，64 位系统）
2. **多重继承**：可能需要多个 vptr，增加内存和访问复杂度
3. **虚基类**：增加 vbptr 和虚基类表，额外的间接访问开销
4. **RTTI**：添加 type_info 信息，增加内存占用

#### 性能开销

```cpp
// 内联优化的影响
class Example {
public:
    // 在头文件中定义，编译器可能内联
    inline void inlineFunction() { /* ... */ }

    // 在源文件中定义，一般不会内联
    void normalFunction();

    // 虚函数很难被内联（除非编译器能确定实际类型）
    virtual void virtualFunction() { /* ... */ }
};
```

**优化建议**：

- 对性能敏感的代码，优先考虑普通函数和内联
- 虚函数开销固定，适用于不追求纳秒级优化的场景
- 通过 profile 工具验证实际性能影响
- 在设计阶段权衡灵活性与性能

通过理解这些机制的底层实现，我们可以更好地在代码灵活性和运行时性能之间做出权衡，编写出既高效又易维护的 C++代码。
