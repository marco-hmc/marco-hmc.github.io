---
date: 2025-04-06 14:41:55 +0800
project: language
title: smartPointer
image: /images/post/post-5.jpg
tags: std smartPointer

---

## 智能指针

### 1. concepts

1. 为什么要有智能指针？

   智能指针（Smart Pointer）是 C++中的一种对象，它像原始指针一样可以指向堆上的对象，但是它们有一个额外的特性：当没有任何指针指向一个对象时，该对象会被自动删除。这样可以避免内存泄漏，使得内存管理更加方便，因此被称为“智能”指针。

   简单来说，就是通过 RAII 保证作用域外自动被析构。

2. 为什么 auto_ptr 被淘汰了？

   `auto_ptr`是 C++98 中的一种智能指针，但是它有一些问题。最大的问题是，`auto_ptr`在复制或赋值时会改变所有权，这意味着原始的`auto_ptr`会失去对对象的所有权，这通常不是预期的行为。因此，在 C++11 中，`auto_ptr`被`unique_ptr`替代，`unique_ptr`提供了更清晰的所有权语义。

   简单来说，`auto_ptr`对所有权没有管理。指针彼此之间赋值，或者像函数传递的时候，所有权的管理有问题。

   > 什么是指针的所有权？拥有指针所有权的实体负责在适当的时候释放（delete）该指针指向的内存。简单来说，就是谁拥有，谁释放。拥有指针所有权的，需要负责释放。

   > 具体所有权的管理，是类似于移动语义，原始对象会失去对对对象的所有权，但是`auto_ptr`是 c98 标准，又没有正式的移动语义。具体表现就不深究了。

3. 有什么智能指针，分别怎么用？
   在 C++中，有三种主要的智能指针：`std::unique_ptr`，`std::shared_ptr`和`std::weak_ptr`。

   1. `std::unique_ptr`：这是一种独占所有权的智能指针，也就是说，同一时间只能有一个`unique_ptr`指向给定的对象。当`unique_ptr`离开其作用域时，它会自动删除其所指向的对象。你可以使用`std::move`来转移所有权。例如：

   ```cpp
   std::unique_ptr<int> ptr1(new int(5));
   std::unique_ptr<int> ptr2 = std::move(ptr1); // 所有权从ptr1转移到ptr2
   ```

   2. `std::shared_ptr`：这是一种共享所有权的智能指针。可以有多个`shared_ptr`指向同一个对象，对象会在最后一个指向它的`shared_ptr`被销毁时自动删除。例如：

   ```cpp
   std::shared_ptr<int> ptr1(new int(5));
   std::shared_ptr<int> ptr2 = ptr1; // ptr1和ptr2都指向同一个对象
   ```

   3. `std::weak_ptr`：这是一种不拥有所有权的智能指针，它指向一个由`shared_ptr`管理的对象。`weak_ptr`主要用于防止`shared_ptr`的循环引用问题。例如，如果你有两个`shared_ptr`对象互相引用，那么它们都不会被删除，这会导致内存泄漏。`weak_ptr`可以打破这种循环引用。例如：

   ```cpp
   std::shared_ptr<int> ptr1(new int(5));
   std::weak_ptr<int> ptr2 = ptr1; // ptr2是一个weak_ptr，不会增加ptr1的引用计数
   ```

4. 为什么要有 weak_ptr？

   `weak_ptr`是一种特殊的智能指针，它可以指向`shared_ptr`所管理的对象，但是它不会增加该对象的引用计数。这意味着`weak_ptr`不会阻止对象被删除。`weak_ptr`要理解为不拥有所有权，不增加引用计数的一种指针。主要用于解决 std::shared_ptr 可能导致的循环引用问题，以及在不影响对象生命周期的情况下观察对象。

   - 解决`shared_ptr`的循环引用问题。例如，如果两个`shared_ptr`对象互相引用，那么它们都不会被删除，这会导致内存泄漏。通过使用`weak_ptr`，我们可以打破这种循环引用，避免内存泄漏；
   - 我某一个业务缓存了一份数据，业务这边不负责这个数据的生命周期，有就用，没有就重新创建，这个时候用`weak_ptr`就是很合适的。

### 2. unique_ptr

#### 2.1 unique_ptr 是怎么保证所有权唯一的？

`std::unique_ptr`通过以下几种方式保证所有权的唯一性：

1. **禁止复制**：`std::unique_ptr`禁止复制构造和复制赋值，这意味着你不能将一个`unique_ptr`直接赋值给另一个`unique_ptr`。这样可以防止有两个`unique_ptr`同时拥有同一个对象的所有权。
2. **允许移动**：虽然`unique_ptr`禁止复制，但是它允许移动。这意味着你可以将一个`unique_ptr`的所有权转移给另一个`unique_ptr`。在所有权转移之后，原始的`unique_ptr`不再拥有任何对象，这样可以确保任何时候都只有一个`unique_ptr`拥有对象的所有权。
3. **自动删除**：当`unique_ptr`被销毁（例如离开其作用域）时，它会自动删除其所拥有的对象。这意味着你不需要手动删除对象，可以防止因忘记删除对象而导致的内存泄漏。

通过这三种方式，`std::unique_ptr`可以保证所有权的唯一性，从而避免内存泄漏和悬挂指针等问题。

### 3. shared_ptr

#### 3.1 shared_ptr 是怎么控制所有权的？

`shared_ptr`是 C++中的一种智能指针，它通过引用计数来控制所有权。每当一个新的`shared_ptr`指向某个对象，这个对象的引用计数就会增加。当`shared_ptr`被销毁或者重新指向其他对象时，原对象的引用计数就会减少。当引用计数变为 0 时，`shared_ptr`就会自动删除所指向的对象。

#### 3.2 多线程下的 shared_ptr 需要注意什么？

需要在复制构造函数和赋值运算符中正确地增加引用计数。
需要在析构函数中正确地减少引用计数，并在引用计数为 0 时删除原始指针。
需要处理自我赋值的情况。如果一个对象赋值给它自己，那么在减少引用计数并删除原始指针之前，必须先增加引用计数。
这个简单的实现不是线程安全的。在多线程环境中，可能需要使用互斥锁或原子操作来保证线程安全。
在多线程环境下使用`shared_ptr`时，需要注意的主要问题是线程安全。虽然`shared_ptr`的引用计数操作是线程安全的，但是这并不意味着使用`shared_ptr`的所有操作都是线程安全的。

例如，两个线程可能同时读取同一个`shared_ptr`，然后试图修改它所指向的对象。这种情况下，就需要额外的同步机制（如互斥锁）来保证操作的原子性。

另外，如果一个线程正在读取`shared_ptr`，而另一个线程正在修改`shared_ptr`（例如，使其指向另一个对象），那么也可能会出现问题。为了避免这种情况，可以使用`std::atomic_load`和`std::atomic_store`等函数。

简单来说，`std::shared_ptr`在 C++标准库中的实现确实提供了线程安全的引用计数。这是通过原子操作实现的。

但是外部使用的时候，还是外部需要上锁。

#### 3.3 如何实现一个引用计数指针,以及其中要注意的点?

1. 需要在复制构造函数和赋值运算符中正确地增加引用计数。
2. 需要在析构函数中正确地减少引用计数，并在引用计数为 0 时删除原始指针。
3. 需要处理自我赋值的情况。如果一个对象赋值给它自己，那么在减少引用计数并删除原始指针之前，必须先增加引用计数。
4. 在多线程环境中，可能需要使用互斥锁或原子操作来保证线程安全。

### 4. weak_ptr

#### 4.1 weak_ptr 是怎么解决循环引用计数问题的？

`std::weak_ptr`是一种特殊的智能指针，它被设计用来解决`std::shared_ptr`的循环引用问题。

循环引用发生在两个或更多的`std::shared_ptr`实例互相引用，形成一个闭环。在这种情况下，即使没有任何外部的`std::shared_ptr`指向这些对象，它们的引用计数也永远不会变为 0，因此这些对象永远不会被删除，导致内存泄露。

`std::weak_ptr`可以打破这个循环。它是一种弱引用，不会增加引用计数。你可以将`std::weak_ptr`看作是一种安全的观察者，它可以观察`std::shared_ptr`所管理的对象，但不会阻止这个对象被删除。

当你需要使用`std::weak_ptr`所观察的对象时，可以调用`std::weak_ptr::lock`方法。这个方法会返回一个新的`std::shared_ptr`实例，如果对象还存在的话。如果对象已经被删除，`lock`方法就会返回一个空的`std::shared_ptr`。

通过这种方式，`std::weak_ptr`可以安全地解决`std::shared_ptr`的循环引用问题。

#### 4.2 weak_ptr 的特点

**std::weak_ptr** 是一个不控制资源生命周期的智能指针,是对对象的一种弱引用,只是提供了对其管理的资源的一个访问手段,引入它的目的为协助 **std::shared_ptr** 工作.
**std::weak_ptr** 可以从一个 **std::shared_ptr** 或另一个 **std::weak_ptr** 对象构造,**std::shared_ptr** 可以直接赋值给 **std::weak_ptr** ,也可以通过 **std::weak_ptr** 的 **lock()** 函数来获得 **std::shared_ptr**.它的构造和析构不会引起引用计数的增加或减少.**std::weak_ptr** 可用来解决 **std::shared_ptr** 相互引用时的死锁问题(即两个**std::shared_ptr** 相互引用,那么这两个指针的引用计数永远不可能下降为 0, 资源永远不会释放).

### 5. `std::enable_share_from_this`

c11 特性

- 为什么要用 `enable_shared_from_this`？

  - **需要在类对象的内部中获得一个指向当前对象的 shared_ptr 对象**
  - 如果在一个程序中，对象内存的生命周期全部由智能指针来管理。在这种情况下，**要在一个类的成员函数中，对外部返回 this 指针就成了一个很棘手的问题**

- 什么时候用？

  - 当一个类被 `share_ptr` 管理，且在**类的成员函数里需要把当前类对象作为参数传给其他函数时**，这时就需要传递一个指向自身的 `share_ptr`

- 如何安全地将 this 指针返回给调用者?

  - **一般来说，我们不能直接将 this 指针返回**。**如果函数将 this 指针返回到外部某个变量保存，然后这个对象自身已经析构了，但外部变量并不知道，此时如果外部变量再使用这个指针，就会使得程序崩溃**

### 6. 释放器

默认情况下,智能指针对象在析构时只会释放其持有的堆内存(调用 delete 或者 delete[]),但是假设这块堆内存代表的对象还对应一种需要回收的资源(如操作系统的套接字句柄/文件句柄等),我们可以通过自定义智能指针的资源释放函数.假设现在有一个 Socket 类,对应着操作系统的套接字句柄,在回收时需要关闭该对象,我们可以如下自定义智能指针对象的资源析构函数,这里以 **std::unique_ptr** 为例:

智能指针的释放器(Deleter)是一个函数或者函数对象,当智能指针不再需要其所管理的资源时,会调用这个释放器来释放资源.

在 C++的`std::unique_ptr`和`std::shared_ptr`中,你可以自定义释放器.这在管理非内存资源时非常有用,例如文件句柄/数据库连接等.

例如,你可以为`std::unique_ptr`定义一个释放器,用于关闭文件:

```cpp
struct FileDeleter
{
    void operator()(FILE* ptr) const
    {
        if (ptr)
        {
            fclose(ptr);
        }
    }
};

std::unique_ptr<FILE, FileDeleter> smartFile(fopen("file.txt", "r"));
```

在这个例子中,当`smartFile`离开其作用域时,它会自动调用`FileDeleter`来关闭文件.

同样,你也可以为`std::shared_ptr`定义一个释放器:

```cpp
std::shared_ptr<FILE> smartFile(fopen("file.txt", "r"), [](FILE* ptr){
    if (ptr)
    {
        fclose(ptr);
    }
});
```

### 99. quiz

#### 1. C++垃圾回收,shared_ptr 的引用计数出现循环引用怎么办

在 C++中，`std::shared_ptr`通过引用计数来管理内存，但是如果出现循环引用，就会导致内存泄漏。循环引用是指两个或更多的`std::shared_ptr`互相引用，形成一个闭环，这样每个`std::shared_ptr`的引用计数永远不会降到 0，导致内存无法被释放。

解决循环引用的一种方法是使用`std::weak_ptr`。`std::weak_ptr`是一种不控制所指向对象生命周期的智能指针，它指向一个由`std::shared_ptr`管理的对象。将循环引用中的一部分引用改为`std::weak_ptr`，可以打破循环引用，解决内存泄漏问题。

以下是一个例子：

```c++
#include <memory>

class B;

class A {
public:
    std::shared_ptr<B> b_ptr;
};

class B {
public:
    std::weak_ptr<A> a_ptr;  // 使用weak_ptr打破循环引用
};

int main() {
    std::shared_ptr<A> a = std::make_shared<A>();
    std::shared_ptr<B> b = std::make_shared<B>();
    a->b_ptr = b;
    b->a_ptr = a;
}
```

在这个例子中，`A`和`B`互相引用，但是`B`到`A`的引用是一个`std::weak_ptr`，这样就打破了循环引用，当`A`和`B`的生命周期结束时，内存可以被正确释放。

#### 2. 智能指针如何变为常量形式的？

```cpp
struct MyClass {
    int value;
};

std::shared_ptr<const MyClass> ptr = std::make_shared<MyClass>();

// 下面的代码将无法编译，因为ptr指向一个常量对象
// ptr->value = 42;
```
