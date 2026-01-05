---
layout: post
title: （一）C++对象内存模型那些事儿：基本概念
categories: C++
related_posts: True
tags: Class
toc:
  sidebar: right
---

## （一）C++对象内存模型那些事儿：基本概念

### 0. 引言：为什么需要对象？

在 C/C++的发展历程中，逐渐形成了三种主要的编程范式，每种范式都是为了解决特定的问题：

#### 面向过程编程

面向过程编程以 C 语言为代表，程序被看作是一系列函数的集合，强调执行的过程和步骤。数据和操作是分离的，最多通过`struct`封装一些成员变量。

```c
#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    int num1 = 5, num2 = 3;
    int result = add(num1, num2);
    printf("两数之和为: %d\n", result);
    return 0;
}
```

这种方式适用于简单程序，但随着业务复杂度增加，维护和复用变得困难。

#### 抽象数据类型模型（ADT）

ADT 将数据结构和操作该数据的函数封装在一起，形成独立单元，对外隐藏实现细节，只暴露必要接口。

```cpp
#include <iostream>

class Stack {
private:
    int data[100];
    int topIndex;

public:
    Stack() : topIndex(-1) {}

    void push(int value) {
        if (topIndex < 99) {
            data[++topIndex] = value;
        }
    }

    int pop() {
        if (topIndex >= 0) {
            return data[topIndex--];
        }
        return -1; // 栈空错误
    }
};
int main() {
    Stack stack;
    stack.push(10);
    stack.push(20);
    std::cout << "弹出元素: " << stack.pop() << std::endl;
    return 0;
}
```

在这个栈的 ADT 实现中，数据（`data`数组和`topIndex`）和操作它们的函数（`push`和`pop`）被封装在`Stack`类中，使用者无需了解栈的内部实现细节，只需通过提供的接口进行操作。

#### 面向对象模型

面向对象在 ADT 基础上增加了继承和多态特性，通过指针和引用支持动态绑定。

```cpp
#include <iostream>

class Animal {
public:
    virtual void speak() {
        std::cout << "动物发出声音" << std::endl;
    }
    virtual ~Animal() = default; // 虚析构函数
};

class Dog : public Animal {
public:
    void speak() override {
        std::cout << "汪汪汪" << std::endl;
    }
};

class Cat : public Animal {
public:
    void speak() override {
        std::cout << "喵喵喵" << std::endl;
    }
};

void makeSound(Animal& animal) {
    animal.speak(); // 多态调用
}

int main() {
    Dog dog;
    Cat cat;
    makeSound(dog); // 输出: 汪汪汪
    makeSound(cat); // 输出: 喵喵喵
    return 0;
}
```

面向对象编程通过继承和多态进一步增强了代码的灵活性和扩展性。

这三种范式的演进反映了随着业务需求的变化，对数据结构的不同要求。面向过程编程适用于简单的程序逻辑，随着业务复杂度增加，ADT 通过封装和抽象，将数据和相关业务函数绑定起来，提升了代码的可维护性和复用性，而面向对象编程则在 ADT 的基础上，通过继承和多态进一步增强了代码的灵活性和扩展性，更好地应对复杂的业务场景。

封装，继承和多态实际上都是为了适应变化快，业务复杂的场景下逐渐总结出来的一种范式。

虽然现代语言（如 Go、Rust）更倾向于组合而非继承（在Go中，通过组合实现成员的继承；通过接口实现多态。）。那怎么理解组合和继承的区别呢？但理解 C++的 OOP 实现机制仍然很有价值。

本文将深入探讨编译器如何在底层支持 OOP 特性，实现零抽象成本的封装、继承和多态。

### 1. 对象内存模型的设计原理

C++对象内存模型的核心目标是以零抽象成本实现封装、继承和多态。由于 C++是编译型语言，需要转换为汇编语言执行，因此理解 OOP 的零成本实现，实际上就是理解编译器如何实现以下功能：

- 成员变量和成员函数的存储与访问
- 静态成员变量和静态成员函数的存储以及使用
- 继承关系的内存布局
- 多态的虚函数机制

但我们不是从编译器实现角度来讲解这些内容，而是从编译器为了做到这些功能，要做了哪些设计和实现入手，来理解 C++对象内存模型的设计原理。因此说，符号解析，重载决议，代码生成等编译器技术细节并不是本文的重点。

#### 1.1 成员变量和成员函数的存储机制

##### 成员变量的内存布局

```cpp
class Foo {
    int a;      // 偏移量: 0
    int b;      // 偏移量: 4 (假设int为4字节)
};

int main(){
    Foo foo;    // foo对象在栈上分配
    foo.a = 10; // 访问偏移量0处的数据
    return 0;
}
```

编译器处理成员变量访问的机制：

1. `foo`对象在栈上有固定地址
2. 成员变量按声明顺序存储，编译器计算每个成员的偏移量
3. 访问`foo.a`时，编译器使用`foo地址 + 偏移量`的方式定位数据

##### 访问控制的实现

`public`、`private`、`protected`等访问控制符只在编译期生效：

- 编译器在语法分析阶段检查访问权限
- 违反访问控制的代码会产生编译错误
- 在汇编层面不存在访问控制概念

**注意**：理论上可以通过计算偏移量访问`private`成员，但这严重违反封装原则，在实际编程中不应使用。

#### 1.2 成员函数的存储和调用机制

```cpp
class Foo {
public:
    void func1() { /* ... */ }
    void func2() { /* ... */ }
};

int main() {
    Foo foo;
    foo.func1(); // 等价于 Foo::func1(&foo)
    return 0;
}
```

从编译器角度看，成员函数与非成员函数的处理有相似之处，但存在关键区别。成员函数并非为每个对象实例单独存储一份副本，而是所有对象共享同一份代码，这些代码存储在程序的代码段中，这一点和普通的非成员函数无区别。

只是成员函数调用时，会隐式携带一个`this`指针。例如，调用`foo.func1()`实际上等价于调用经过编译器特殊处理的类似非成员函数形式，如`_Z3foo4func1EP3Foo`（这里`_Z3foo4func1EP3Foo`是编译器为支持函数重载及标识函数所属类而生成的修饰后的函数名，不同编译器生成规则不同）。编译器在处理函数重载时，会对函数名进行修饰，添加类名、参数类型等信息，以确保同名函数在符号表中的唯一性。

成员函数的特点：

1. **共享存储**：所有对象共享同一份成员函数代码，存储在程序代码段
2. **隐式 this 指针**：编译器为非静态成员函数隐式添加`this`参数
3. **名称修饰**：编译器对函数名进行修饰以支持重载和命名空间

当成员函数访问成员变量时，编译器使用`this`指针：

```cpp
void Foo::func1() {
    a = 10; // 编译器转换为: this->a = 10;
}
```

**建议**：对于不访问成员变量的函数，使用`static`修饰可避免不必要的`this`指针传递。

#### 1.3 静态成员的存储机制

静态成员变量静态成员变量与普通静态变量非常相似性，它们都存放在静态存储区。只是静态成员变量的作用域、访问方式不同而已。静态成员变量是类的成员变量，但它们不属于类的某个具体对象，而是属于整个类本身。所有对象共享同一个静态成员变量，这使得它们在内存中只占用一份空间。

静态成员函数将静态成员函数与普通静态函数其实也比较相似。静态函数的`static`表示的是静态函数的作用域被限制在定义它的源文件内，其他源文件无法访问该函数。

而静态成员函数的`static`表明的是，函数在这个类的内部，但是不会传 this 指针的。注意的是，因为静态成员函数在内部，所以其实这个函数是可以访问私有成员的。

```cpp
class Foo {
public:
    static int count;           // 类级别变量
    static void printCount();   // 类级别函数
private:
    int value;
};

int Foo::count = 0; // 静态成员需要类外定义
```

静态成员的特点：

- **静态成员变量**：存储在静态存储区，所有对象共享，不占用对象空间
- **静态成员函数**：无`this`指针，可访问类的私有成员，体现了封装层次

#### 1.4 继承的内存布局

##### 普通继承

```cpp
class Base {
    int baseData;
};

class Derived : public Base {
    int derivedData;
};
// Derived对象内存布局: [baseData][derivedData]
```

基类成员变量直接嵌入派生类对象中，派生类可直接调用基类的非虚函数。

在 C++的继承体系中，对于基类的成员变量，基类的数据成员会直接放置在派生类对象中。这意味着派生类对象的内存布局包含了基类成员变量的空间，就如同派生类自身的成员变量一样。

对于基类的非虚成员函数，在派生类中也没有特别的额外操作。派生类对象可以直接调用这些非虚成员函数，其调用机制与普通成员函数调用类似，遵循常规的函数调用规则。

然而，在菱形继承场景下，会出现一些问题。例如：

##### 虚继承解决菱形继承问题

```cpp
class A {
public:
    int a;
};

class B : virtual public A {  // 虚继承
public:
    int b;
};

class C : virtual public A {  // 虚继承
public:
    int c;
};

class D : public B, public C {
public:
    int d;
};
/*
    D 对象内存（简化示意，偏移按字节）：
    [ D.B 子对象 (包含 vbptr_B, B 成员 b) ]
    [ D.C 子对象 (包含 vbptr_C, C 成员 c) ]
    [ 共享虚基 A 子对象 (成员 a) ]
    [ D 的其它成员 d ]
*/
```

如果不使用虚继承，从`B`和`C`继承而来的`A`类子对象会在`D`类对象中存在两份，这不仅浪费内存，还可能导致访问`A`类成员时的歧义。为了解决菱形继承问题，使基类不管被派生多少次，都只存在一个子对象实例，C++引入了虚继承。

当使用虚继承时（如上述代码中`B`和`C`对`A`的虚继承），派生类（`B`和`C`）会添加一个虚基类指针（`vbptr`），该指针指向一个虚基类表（`vbtable`），通过这个表再指向虚基类（`A`）的数据。在`D`类对象中，只有一个指向虚基类`A`数据的`vbptr`。

虚基类表（`vbtable`）记录了虚基类相对于派生类对象起始地址的偏移量等信息。当访问`D`类对象中的虚基类成员（如`D.a`）时，编译器会根据`vbptr`找到对应的虚基类表（`vbtable`），然后依据表中的偏移量信息，准确地定位到虚基类`A`的成员变量`a`在`D`类对象内存中的位置，从而实现对虚基类成员的正确访问。这种机制保证了在菱形继承结构中，虚基类子对象的唯一性，避免了数据冗余和访问歧义问题。

虚继承的实现机制：

1. **虚基类指针（vbptr）**：派生类对象包含指向虚基类表的指针
2. **虚基类表（vbtable）**：记录虚基类相对于对象起始地址的偏移量
3. **唯一性保证**：确保虚基类在最终派生类中只有一个实例

#### 1.5 多态的虚函数机制

```cpp
class Animal {
public:
    virtual int getType() { return 0; }  // 虚函数
    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    int getType() override { return 1; }  // 重写虚函数
};

int main() {
    Animal* animal = new Dog();
    animal->getType(); // 动态绑定，调用Dog::getType()
    delete animal;
    return 0;
}
/*
Animal的虚函数表：
void* vtable_Animal[] = {
    &Animal_getType,    // index 0
    &Animal_destructor  // index 1  (ABI相关，析构器/RTTI顺序可能不同)
};

Dog的虚函数表：
void* vtable_Dog[] = {
    &Dog_getType,       // index 0  (覆盖)
    &Dog_destructor
};

Animal/Dob对象的内存布局：
   [ vptr (pointer to vtable) ]  <- 对象起始地址
   [ 成员数据... ]
*/

```

当编译器处理这段代码时，会为包含虚函数的类（如`A`类）创建虚函数表（`virtual function table`，简称`vtable`）。在类`A`中，由于`foo`函数被声明为虚函数，编译器会在`A`类对应的虚函数表中为`foo`函数分配一个条目，记录其函数地址。对于派生类`B`，编译器同样会为其生成虚函数表，并且因为`B`重写了`A`中的虚函数`foo`，`B`的虚函数表中对应`foo`函数条目的地址将指向`B::foo`的实现。

当执行`A* b = new B();`时，`new B()`按照`B`类的构造函数进行对象构造，此时`b`指针虽然声明为`A*`类型，但实际指向的是`B`类对象。`B`类对象的内存布局中包含一个指向`B`类虚函数表的指针（通常称为虚函数表指针，`vptr`）。

当调用`b->foo();`时，编译器首先根据`b`指针找到`B`类对象，进而通过对象中的`vptr`找到`B`类的虚函数表（`vtable`）。由于编译器在编译阶段就确定了虚函数`foo`在虚函数表中的索引位置（假设为 0），所以`b->foo()`的调用过程实际上类似于通过`b`指针找到`B`类对象的虚函数表指针`vptr`，再由`vptr`找到`B`类的虚函数表`vtable`，然后根据索引 0 获取到`B::foo`函数的地址，即`vtable[0]`，最后调用该函数，也就是执行`vtable[0]()`。

虚函数的实现机制：

1. **虚函数表（vtable）**：每个包含虚函数的类都有一个虚函数表，存储虚函数地址
2. **虚函数表指针（vptr）**：每个对象包含指向其类虚函数表的指针
3. **动态绑定**：运行时通过 vptr 找到正确的虚函数表，再根据函数索引调用相应函数

虚函数调用过程：`animal->getType()` → `animal->vptr->vtable[index]()`

#### 1.6 类对象的内存占用

类对象的大小由以下因素决定：

1. **非静态成员变量**：直接占用对象空间
2. **虚函数表指针（vptr）**：如果有虚函数，占用一个指针大小
3. **虚基类指针（vbptr）**：如果有虚继承，占用一个指针大小
4. **内存对齐**：编译器按对齐规则调整内存布局
5. **不占用空间的成员**：
   - 成员函数（存储在代码段）
   - 静态成员变量（存储在静态区）

```cpp
class Empty {};                    // 大小: 1字节（保证唯一地址）
class WithData { int x; };        // 大小: 4字节
class WithVirtual {               // 大小: 8字节（64位系统）
    virtual void func() {}        // vptr占用8字节
};
```

<!-- ![alt text](./imgs/3_class_image.png) -->

### 99. quiz

#### 1. class 和 struct 的区别

**主要区别**：

- `struct`默认访问权限为`public`
- `class`默认访问权限为`private`

除此之外使用时没有区别。

**设计理念**：

- `class`体现 OOP 思想，强调封装和继承
- `struct`继承自 C 语言，更适合作为纯数据容器

**功能等价性**：两者都支持继承、多态和模板。

#### 2. 空类对象的大小

**答案**：1 字节

**原因**：确保每个对象都有唯一的内存地址，使得不同的空类对象在内存中可区分。

#### 3. 空指针能否调用成员函数

```cpp
class Foo {
public:
    void bar() {
        std::cout << "Bar method called." << std::endl;
    }

    void unsafeBar() {
        if (this == nullptr) {  // 编译器可能优化掉此判断
            return;
        }
        // 其他操作...
    }
};

int main() {
    static_cast<Foo*>(nullptr)->bar(); // 可以执行，但不安全
    return 0;
}
```

**答案**：理论上可以，但属于未定义行为（UB）。

**风险**：

- 如果函数内访问成员变量会导致程序崩溃
- 编译器可能基于"this 不为空"的假设进行优化，导致意外行为
- 实际开发中应避免这种用法

#### 4. 什么是空基类优化？

空基类优化（Empty Base Optimization, EBO）是一种编译器优化技术，允许空基类不占用派生类对象的额外空间。
