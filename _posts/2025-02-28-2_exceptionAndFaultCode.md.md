---
layout: post
title: 错误码和异常处理
categories: language
related_posts: True
tags: cpp grammar
toc:
  sidebar: left
---

## 错误码和异常处理

程序出错几乎是必然事件，可能是由于上游任务提供的数据有误，也可能是程序内部实现出现了 bug。对于程序出错的情况，需要有一套机制能够帮助定位错误，并处理错误。

一般而言，错误处理方式有两种：

1. **错误码**
2. **异常机制**

### 1. 错误码

简单来说，网络请求返回的相应信息中的状态码其实也是一种错误码（`404`等）；宽带拨号上网失败也会产生错误码；程序运行崩溃生成日志，日志里面可能也带着错误码信息。

常见的错误码的设计，一般而言有这些：

- 错误码分模块处理：不同模块的错误码不是共同一个值域。
- 错误码分正负处理：正值为上游服务出问题；负值为程序内部实现出问题；零值表示没问题。
- 简单设计，一种错误码一种类型不区分上下游，不区分模块。

#### 1.1 C++没有提供统一的错误码

目前 C++提供了统一的异常机制机制，但是没有提供统一的错误码机制。

C++是一种通用的编程语言，用于各种不同的应用领域。在不同的应用领域中，可能需要处理的错误类型和数量都会有所不同。如果标准库提供了统一的错误码，可能无法满足所有应用领域的需求。

虽然 C++标准库没有提供统一的错误码，但是它提供了一些类和函数来处理错误。例如，`std::error_code`和`std::error_condition`类可以用来表示和处理错误，`std::system_error`异常可以用来抛出包含错误码的异常。此外，许多 C++标准库函数（如文件 I/O 函数）会设置`errno`变量来表示错误，这可以看作是一种错误码机制。

#### 1.2 错误码的优缺点

**优点**：

- 性能较高：错误码的处理通常比异常机制更高效，因为它避免了异常处理的开销。
- 明确的错误处理路径：错误码使得错误处理路径更加明确，开发者可以在每个函数中显式地检查和处理错误。
- 适用于可恢复的错误：对于那些可以预期和恢复的错误，使用错误码更加合适。

**缺点**：

- 代码冗长：直接处理错误码会导致代码冗长，因为每个函数都需要显式地检查和处理错误。
- 容易忽略错误处理：开发者可能会忘记检查错误码，导致错误处理不完整。
- 错误传播困难：错误码需要显式地传递和检查，错误传播可能会变得复杂和繁琐。

错误码的设计有一定的传染性，一旦在代码中开始使用错误码来处理错误，这种设计方式往往会在整个代码库中传播开来。原因在于，错误码需要在调用链的每一层都进行检查和处理，因此一旦某个模块或函数采用了错误码机制，调用它的代码也需要相应地处理错误码，从而导致这种设计方式在整个系统中扩散。

#### 1.3 错误码机制更适合以下情况:

1. **错误可以预见并立即处理**:例如，打开文件失败/找不到指定的元素等情况，这些错误可以预见，也可以立即处理，使用错误码可以让调用者直接知道函数是否成功。

2. **性能敏感的代码**:异常处理可能会对性能产生影响，尤其是当异常被频繁抛出时。对于性能敏感的代码，使用错误码可以避免这种性能损失。

3. **与 C 语言代码交互**:C++的异常不能跨越 C++和 C 语言的边界。如果你的 C++代码需要与 C 语言代码交互，使用错误码是更好的选择。

### 2. 异常

#### 2.1 怎么抛出异常？

异常是程序运行过程中出现的错误或意外情况。C++ 提供了异常处理机制，用于捕获和处理这些错误。异常处理机制包括 try、catch 和 throw。

- **try 块**：包含可能抛出异常的代码。
- **catch 块**：用于捕获和处理异常。
- **throw**：用于抛出异常。
  - **catch 块内的 `throw;`**：在 catch 块内使用 `throw;` 可以重新抛出当前捕获的异常，适用于需要将异常传播到更高层次的调用者的情况。

catch 的异常捕捉实现是基于类型比较的，使用类型比较而不是值比较的意义在于多态。另外 catch 的比较不是简单的类型相等比较，而是判断是不是在一个继承关系内，哪一个是最近的类型关系。在时间中，大部分异常都是派生自 `std::exception` 的，这个时候可以统一使用父类统一异常比较。
除了多态能力外，派生自 `std::exception` 的异常类会提供一个 `what()` 方法，用于描述异常类型，便于输出到日志中。
即能够提供更多的异常信息。

另外，实践中也有少部分直接使用枚举值作为异常的。因为 catch 的比较是类型比较，所以一般又会再接一个 switch-case 作为值比较。

#### 2.2 抛出异常，没有捕获会怎么样?

在 C++ 中，异常处理机制是通过栈展开（stack unwinding）来实现的。当一个异常被抛出时，程序会沿着调用栈向上查找，直到找到一个匹配的异常处理程序（`catch` 块）。如果在调用栈中没有找到匹配的异常处理程序，那么程序会调用函数 `std::terminate`，然后立即终止。这通常会导致程序的非正常退出。

在调用 `std::terminate` 之前，C++ 还会尝试调用一个名为 `std::unexpected` 的函数。你可以通过 `std::set_unexpected` 函数来设置 `std::unexpected` 的行为。如果 `std::unexpected` 函数没有调用 `std::terminate` 并且能够处理异常，那么程序可能会继续执行。但是，通常情况下，`std::unexpected` 函数会调用 `std::terminate`。

`std::terminate` 函数的默认行为是调用 `abort` 来终止程序，但你可以通过 `std::set_terminate` 函数来改变这个行为。

总的来说，如果抛出了异常但没有被捕获，那么程序通常会立即终止。这就是为什么在编写可能会抛出异常的代码时，应该总是提供一个异常处理机制，以防止程序的非正常退出。

### 3. 错误码和异常混用的情况

错误码和异常混用在某些情况下是正常的设计，但需要谨慎处理。以下是一些关于错误码和异常混用的详细解释和建议。

1. **历史遗留代码**：

   - 在一些老旧的代码库中，可能已经广泛使用了错误码来进行错误处理。在这种情况下，逐步引入异常处理机制可能是一个合理的过渡方案。

2. **跨语言边界**：

   - 当 C++ 代码需要与 C 代码或其他不支持异常处理的语言进行交互时，使用错误码可能是必要的。例如，C 语言不支持异常处理，因此在 C 和 C++ 混合编程时，通常需要在 C++ 代码中捕获异常并转换为错误码传递给 C 代码。

3. **性能考虑**：
   - 在一些性能关键的代码中，可能会选择使用错误码而不是异常，因为异常处理机制可能会带来额外的开销。在这种情况下，可以在性能关键路径上使用错误码，而在其他部分使用异常处理。

- **注意事项**

1. **一致性**：

   - 在同一个模块或库中，尽量保持一致的错误处理方式。如果选择使用异常处理，就尽量在整个模块中使用异常处理；如果选择使用错误码，就尽量在整个模块中使用错误码。

2. **文档说明**：

   - 清晰地记录函数的错误处理方式，说明函数是通过异常还是错误码来表示错误情况。这有助于调用者正确处理错误。

3. **性能考虑**：
   - 在性能关键的代码中，慎重选择错误处理方式。异常处理机制可能会带来额外的开销，因此在性能关键路径上可能更适合使用错误码。

### 99. quiz

#### 1. C/C++混用时，怎么处理异常？

由于 C 代码中没有异常处理机制，栈展开过程可能无法正确进行，导致未定义行为或程序崩溃。
因此为了避免 C++ 异常传递到没有异常处理机制的 C 代码中，可以采取以下措施：

> 使用`extern "C"`的 C++代码是可以使用 c++特性的，因为这个关键词只是让函数用了 name mangling 技术。而 C/C++本身都是用类似的编译器的。

1. **在 C++ 代码中捕获异常**：

   - 在 C++ 代码中捕获所有可能的异常，确保异常不会传递到 C 代码中。

   ```cpp
   extern "C" void c_function_wrapper() {
       try {
           // 调用实际的 C++ 函数
           cpp_function();
       } catch (const std::exception& e) {
           // 处理异常
           std::cerr << "Exception caught: " << e.what() << std::endl;
       } catch (...) {
           // 处理所有其他类型的异常
           std::cerr << "Unknown exception caught" << std::endl;
       }
   }
   ```

2. **使用 `noexcept` 进行函数声明**：
   ```cpp
   extern "C" void cpp_function() noexcept;
   ```

#### 2. 析构函数抛出异常会怎么样？

首先，回顾一下异常处理过程：

1. **栈展开（Stack Unwinding）**：

   - 当一个异常被抛出时，C++ 会开始栈展开过程。这意味着程序会回溯调用栈，寻找相应的 `catch`块来处理该异常。
   - 在栈展开过程中，所有在栈上的对象的析构函数都会被调用，以确保资源被正确释放。

2. **调用析构函数**：

   - 栈展开过程中，所有在栈上的对象的析构函数都会被调用。这是为了确保在异常处理过程中，所有资源都能被正确释放，避免资源泄漏。

3. **调用 `catch`块**：

   - 一旦找到相应的 `catch`块，程序会跳转到该 `catch`块，并执行其中的代码来处理异常。

4. **调用终止函数**：
   - 如果在栈展开过程中再次抛出异常（例如，析构函数抛出异常），程序将无法同时处理两个异常。根据 C++ 标准，程序必须立即调用 `std::terminate` 函数来终止程序。

一般情况下析构函数是可以抛出异常的。但会潜藏一种情况，即抛出某个异常，在栈展开过程中，需要对栈上所有对象调用析构。如果这个时候析构函数又再次抛出异常，就会导致程序直接调用 `std::terminate` 函数。所以不应该让异常传递到析构函数外面，而是应该在析构函数里面直接 `catch` 并且处理掉。

那为什么析构再次抛出异常就会导致程序直接调用 `std::terminate` 呢？因为 C++ 不允许同时处理多个异常，这是 C++ 标准规定的，如果有两个异常就会立刻调用 `std::terminate`。而 C++ 标准这么设定，则是因为考虑到以下原因：

1. **异常处理机制的复杂性**：同时处理多个异常会显著增加异常处理机制的复杂性，导致实现和维护变得更加困难。
2. **栈展开过程**：在栈展开过程中再次抛出异常会导致异常处理逻辑变得混乱，程序无法确定应该优先处理哪个异常。
3. **设计原则**：C++ 设计者选择了简单而一致的异常处理模型，即一次只处理一个异常，使得异常处理机制更加直观和易于理解。

因此，实际上 C++11 之后析构函数不需要声明，默认就是 `noexcept` 的。注意，`noexcept` 的意思是不对外抛出异常，内部还是可以使用 `try-catch` 语句的。

#### 3. 构造函数出现异常会怎么样？

```cpp
BookEntry::BookEntry() {
    theImage = new Image(imageFileName);
    theAudioClip = new AudioClip(audioClipFileName);
}

BookEntry::~BookEntry() {
    delete theImage;
    delete theAudioClip;
}
```

**问题**：如果在 `new AudioClip` 处抛出异常，`~BookEntry` 析构函数不会被调用，导致 `theImage` 永远不会被删除，资源泄露。

1. **对象未完全构造**：

   - 当构造函数抛出异常时，C++ 会认为对象的构造失败。此时，对象并未完全构造成功，因此不会调用该对象的析构函数。

2. **栈展开和资源释放**：
   - 在构造函数抛出异常时，C++ 会开始栈展开过程，调用已经成功构造的成员对象和基类对象的析构函数，以确保资源被正确释放。

但是`theImage`是堆上的数据，就永远不会被删除了。

**解决方案**：

- 通过在构造函数中使用 `try-catch` 块来捕获异常，并在 `catch` 块中释放已经分配的资源，以防止资源泄露。
- 更好的做法是使用智能指针（如 `std::auto_ptr`，尽管在现代 C++ 中推荐使用 `std::unique_ptr`）来管理资源，这样可以自动处理资源释放，避免手动管理资源带来的复杂性和错误。

##### 3.1 使用 `try-catch` 解决资源泄露

```cpp
BookEntry::BookEntry() {
    try {
        theImage = new Image(imageFileName);
        theAudioClip = new AudioClip(audioClipFileName);
    } catch (...) {
        cleanup();
        throw;
    }
}

BookEntry::~BookEntry() {
    cleanup();
}

void BookEntry::cleanup() {
    delete theImage;
    theImage = nullptr;
    delete theAudioClip;
    theAudioClip = nullptr;
}
```

- **解决方案**：在构造函数中使用 `try-catch` 块捕获异常，并在 `catch` 块中释放已经分配的资源。
- 注意：一般不会手动调用析构，所以 catch 的时候不要调用析构，构造如果出现异常，一般还是要接着往上抛出的。

##### 3.2 使用智能指针

```cpp
#include <memory>

class BookEntry {
public:
    BookEntry(const std::string& imageFileName, const std::string& audioClipFileName)
        : theImage(std::make_unique<Image>(imageFileName)),
          theAudioClip(std::make_unique<AudioClip>(audioClipFileName)) {
    }

private:
    std::unique_ptr<Image> theImage;
    std::unique_ptr<AudioClip> theAudioClip;
};
```

- **更好的做法**：使用智能指针（如 `std::unique_ptr`）来管理资源。智能指针会自动处理资源释放，避免手动管理资源带来的复杂性和错误。
  简单来说，就是如果 `theImage` 成功构造了，但是 `theAudioClip` 没有成功构造，抛出了异常。那 `BookEntry` 就会析构栈上的对象，而 `theImage` 通过栈上的智能指针管理了，析构这个栈上的 `theImage` 对象的时候，就会顺带析构到堆上去。这是 RAII 的原理。

### 100. appendix

#### 1. 异常的开销

有异常处理和无异常处理的开销差距还是很明显的，但由于开销基数较小，可能与业务代码相比微不足道。所以如果不是频繁调用，异常处理导致的开销也可以忽略不计。

```c++
#include <chrono>
#include <iostream>
#include <stdexcept>

void functionWithException() { throw std::runtime_error("Exception thrown"); }

void functionWithoutException() {
    // 正常执行路径
}

int main() {
    auto start = std::chrono::high_resolution_clock::now();
    try {
        functionWithException();
    } catch (const std::exception &e) {
        std::cerr << "Caught exception: " << e.what() << std::endl;
    }
    auto end = std::chrono::high_resolution_clock::now();

    // 0.05 ms
    auto elapsed =
        std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
    double milliseconds = elapsed.count() / 1'000'000.0;
    std::cout << "Time taken with exception: " << milliseconds << " ms"
              << std::endl;

    start = std::chrono::high_resolution_clock::now();
    functionWithoutException();
    end = std::chrono::high_resolution_clock::now();

    // 0.00005 ms
    elapsed = std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
    milliseconds = elapsed.count() / 1'000'000.0;
    std::cout << "Time taken without exception: " << milliseconds << " ms"
              << std::endl;

    return 0;
}
```

#### 2. try 的开销，catch 的开销

异常的开销主要来自 catch 上，理论上而言，try 的开销在编译器生成计算机指令的时候，会多一些额外的代码来支持异常处理；除此之外还会影响编译器优化能力。但实际上而言，try 的开销整体上还是可以忽略的。
在没有异常抛出的情况下，try 块的开销通常很小，可以忽略不计。编译器会生成一些额外的代码来支持异常处理，但这些代码在正常执行路径上不会带来显著的性能影响。
在某些特定的 CPU 或嵌入式单片机上，可能会有特殊的操作导致 try 块的开销有所不同。但在一般的服务器和家用电脑上，这种开销通常是可以忽略的。

```c++
#include <chrono>
#include <iomanip>
#include <iostream>
#include <stdexcept>

// 时间测量函数
std::chrono::nanoseconds measure_time(void (*func)()) {
    auto start = std::chrono::high_resolution_clock::now();
    func();
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration_cast<std::chrono::nanoseconds>(end - start);
}

void functionWithTry() {
    try {
        // 正常执行路径
    } catch (...) {
        // 异常处理
    }
}

void functionWithException() { throw std::runtime_error("Exception thrown"); }

void functionWithoutException() {
    // 正常执行路径
}

void benchmark() {
    // 测量 functionWithTry 的执行时间
    auto elapsed = measure_time([]() {
        for (int i = 0; i < 1000000; ++i) {
            functionWithTry();
        }
    });
    // 0.677733 ms
    std::cout << "Time taken with try block: " << std::fixed
              << std::setprecision(6) << elapsed.count() / 1'000'000.0 << " ms"
              << std::endl;

    // 测量 functionWithException 的执行时间
    elapsed = measure_time([]() {
        for (int i = 0; i < 1000; ++i) {
            try {
                functionWithException();
            } catch (const std::exception &e) {
                // 异常处理
            }
        }
    });
    // 1.184 ms
    std::cout << "Time taken with exception: " << std::fixed
              << std::setprecision(6) << elapsed.count() / 1'000'000.0 << " ms"
              << std::endl;

    // 测量 functionWithoutException 的执行时间
    elapsed = measure_time([]() {
        for (int i = 0; i < 1000000; ++i) {
            functionWithoutException();
        }
    });
    // 0.677710ms
    std::cout << "Time taken without exception: " << std::fixed
              << std::setprecision(6) << elapsed.count() / 1'000'000.0 << " ms"
              << std::endl;
}

int main() {
    benchmark();
    return 0;
}
```

#### 3. new 失败不需要调用 delete

```c++
#include <iostream>
#include <stdexcept>

class MyClass {
   public:
    MyClass() {
        std::cout << "MyClass constructor\n";
        throw std::runtime_error("Exception in MyClass constructor");
    }

    ~MyClass() { std::cout << "MyClass destructor\n"; }
};

int main() {
    try {
        MyClass* obj = new MyClass();
    } catch (const std::exception& e) {
        // delete obj; // new失败，不需要delete
        std::cerr << "Caught exception: " << e.what() << std::endl;
    }
    return 0;
}
```
