---
layout: post
title: 错误码和异常处理
categories: cpp
related_posts: True
tags: cpp
toc:
  sidebar: left
---

## 错误码和异常处理

在程序运行过程中，出错几乎是难以避免的。这可能源于上游任务传递的数据存在错误，比如数据格式不符合预期、数据值超出合理范围等；也可能是程序内部实现存在漏洞，像逻辑判断失误、内存管理不当等。面对程序出错的情况，一套有效的机制对于定位错误根源以及妥善处理错误至关重要。

一般来说，常见的错误处理方式主要有以下两种：

1. `错误码`
   错误码是一种常用的错误处理方式。当程序执行过程中遇到错误时，函数或方法会返回一个特定的数值，这个数值就是错误码。每个错误码通常对应一种具体的错误类型或错误场景。例如，在文件操作中，如果尝试打开一个不存在的文件，相关函数可能返回一个表示“文件不存在”的错误码。调用者在获取到错误码后，可以根据预先定义的错误码表，查询出具体的错误信息，从而明确错误发生的原因。这种方式的优点在于简单直接，在一些对性能要求较高且错误情况较为明确的场景中应用广泛，如底层系统开发、嵌入式系统等。然而，它也存在一些局限性，比如错误码的传递可能会使代码逻辑变得复杂，尤其是在多层函数调用的情况下，需要层层传递错误码，增加了代码的编写和维护成本。

2. `异常机制`
   异常机制为错误处理提供了另一种思路。当程序执行到某个位置发生错误时，会抛出一个异常对象。这个异常对象包含了与错误相关的信息，如错误类型、错误发生的上下文等。异常抛出后，程序会暂停当前的执行流程，转而寻找能够处理该异常的代码块（通常是`try - catch`结构）。如果在当前函数中没有合适的`catch`块来处理异常，异常会继续向上层调用函数传递，直到被捕获并处理。异常机制的优势在于它能够清晰地分离正常业务逻辑和错误处理逻辑，使代码结构更加清晰，提高了代码的可读性和可维护性。同时，异常对象可以携带丰富的错误信息，有助于更准确地定位和处理错误。不过，异常机制也并非完美无缺，它在一定程度上会增加程序的性能开销，因为抛出和捕获异常涉及到栈的展开等操作，所以在性能敏感的应用中需要谨慎使用。

### 1. 错误码

错误码在各类程序运行场景中广泛存在。例如，网络请求返回的响应信息中的状态码（如常见的`404`等）就是一种错误码，它能直观地反映网络请求过程中出现的问题；宽带拨号上网失败时也会产生错误码，用于提示网络连接方面的故障；程序运行崩溃生成的日志里，同样可能携带错误码信息，帮助开发者定位崩溃原因。

常见的错误码设计方式通常有以下几种：

- `分模块处理`：不同模块的错误码划分在不同值域，这样可以清晰地区分错误来源，方便定位和处理特定模块的问题。
- `分正负处理`：一般将正值设定为表示上游服务出现问题，负值表示程序内部实现存在问题，零值则表示程序运行正常，这种方式有助于快速判断错误性质。
- `简单设计`：采用一种错误码对应一种类型，不区分上下游，也不区分模块，此方式简单直接，但在复杂系统中定位错误的精准度可能稍欠。

#### 1.1 C++没有提供统一的错误码

当前，C++虽提供了统一的异常机制，但并未提供统一的错误码机制。这是因为C++作为一种通用编程语言，广泛应用于各种不同领域，各领域可能需要处理的错误类型与数量差异较大。若标准库提供统一错误码，难以满足所有应用场景的多样化需求。

尽管如此，C++标准库提供了一些类和函数辅助处理错误。例如，`std::error_code`和`std::error_condition`类可用于表示和处理错误，`std::system_error`异常能够抛出包含错误码的异常。此外，许多C++标准库函数（如文件I/O函数）通过设置`errno`变量来表示错误，这也可视为一种错误码机制。

#### 1.2 错误码的优缺点

`优点`：

- `高性能`：相较于异常机制，错误码处理通常更为高效，它避免了异常处理所带来的额外开销。
- `明确的处理路径`：错误码使错误处理路径一目了然，开发者可在每个函数中显式检查并处理错误，增强了错误处理的可控性。
- `适用于可恢复错误`：对于那些能够预见且可恢复的错误，使用错误码处理更为适宜，调用者能直接知晓函数执行是否成功。

`缺点`：

- `代码冗长`：直接处理错误码会使代码变得冗长，因为每个函数都需显式检查和处理错误，增加了代码量。
- `易忽略处理`：开发者可能会因疏忽而忘记检查错误码，导致错误处理不全面，留下潜在风险。
- `传播复杂`：错误码需在调用链中层层传递与检查，这使得错误传播过程变得复杂繁琐，增加了代码维护难度。

值得注意的是，错误码的设计具有一定的“传染性”。一旦在代码中采用错误码处理错误，这种设计方式往往会在整个代码库中蔓延。原因在于，错误码需在调用链的每一层都进行检查和处理，所以一旦某个模块或函数使用了错误码机制，其调用方代码也必须相应地处理错误码，进而导致该设计方式在整个系统中扩散。

#### 1.3 错误码机制更适合以下情况

1. `可预见且可立即处理的错误`：例如打开文件失败、找不到指定元素等错误，这类错误能够预见，并且可以即时处理。使用错误码，调用者可直接判断函数执行是否成功，方便快捷地进行针对性处理。
2. `性能敏感的代码`：异常处理在频繁抛出异常时可能影响性能，而对于性能敏感的代码，采用错误码可避免这种性能损耗，确保系统高效运行。
3. `与C语言代码交互`：由于C++的异常无法跨越C++与C语言的边界，若C++代码需与C语言代码交互，使用错误码是更优选择，能确保不同语言间错误处理的兼容性。

### 2. 异常

#### 2.1怎么抛出异常？

异常是程序运行过程中出现的错误或意外情况。C++提供了异常处理机制，用于捕获和处理这些错误，主要通过try、catch和throw三个关键字实现。

- `try块`：用于包含可能抛出异常的代码。
- `catch块`：用于捕获和处理特定类型的异常，一个try块后可跟随多个catch块，以捕获不同类型的异常。
- `throw`：用于抛出异常。
  - `catch块内的`throw;``：在catch块内使用`throw;`可以重新抛出当前捕获的异常，适用于需要将异常传播到更高层次调用者的情况。

catch的异常捕捉是基于类型比较，而非值比较，这样做的主要意义在于支持多态。catch的比较并非简单的类型相等比较，而是判断异常类型是否在一个继承关系内，找到最匹配的类型。在实践中，大部分异常类都派生自`std::exception`，此时可统一使用父类进行异常比较。除了多态特性外，派生自`std::exception`的异常类还会提供一个`what()`方法，用于描述异常类型，方便输出到日志中，提供更多的异常信息。

另外，实践中也有少部分直接使用枚举值作为异常。由于catch是基于类型比较，所以一般需要再接一个switch-case进行值比较。

#### 2.2抛出异常，没有捕获会怎么样?

在C++中，异常处理机制是通过栈展开（stack unwinding）来实现的。当一个异常被抛出时，程序会沿着调用栈向上查找，直到找到一个匹配的异常处理程序（catch块）。如果在调用栈中没有找到匹配的catch块，那么程序会调用函数`std::terminate`，通常会导致程序的非正常退出。

在调用`std::terminate`之前，C++还会尝试调用一个名为`std::unexpected`的函数。可以通过`std::set_unexpected`函数来设置`std::unexpected`的行为。如果`std::unexpected`函数没有调用`std::terminate`并且能够处理异常，那么程序可能会继续执行。不过，通常情况下，`std::unexpected`函数会调用`std::terminate`。

`std::terminate`函数的默认行为是调用`abort`来终止程序，但可以通过`std::set_terminate`函数来改变这个行为。

总的来说，如果抛出了异常但没有被捕获，程序通常会立即终止。因此，在编写可能会抛出异常的代码时，应该提供异常处理机制，以防止程序的非正常退出。

#### 2.3如何理解异常的开销？

在C++中，异常处理开销主要体现在以下几个方面：

- `栈展开开销`：当异常发生时，程序需要进行栈展开操作，即解除函数调用栈，以确定要调用的异常处理程序。这涉及到对栈上对象的析构等操作，是一个相对耗时的过程。
- `异常对象开销`：异常是通过对象传递的，这些对象通常被分配在堆内存中，会增加内存开销，包括对象的创建和析构。
- `额外代码路径开销`：异常处理机制会使程序增加额外的代码路径，导致编译生成后的程序尺寸偏大，也会在一定程度上降低程序执行速度。
- `性能开销`：异常的跳转会打乱程序的正常执行流程，使编译器难以进行一些优化，可能导致程序性能下降。同时，为保证写出异常安全的代码，往往需要借用C++其它特性，如智能指针，这又进一步加剧了程序的时空开销，包括编译时间延长和运行效率降低。

todo: 实际数据对比：

### 3. 错误码和异常混用的情况

在软件开发中，错误码和异常混用在特定情况下是合理且常见的设计选择，但由于两种错误处理机制各有特点，混用过程需要谨慎对待，以确保代码的健壮性、可读性和可维护性。以下是对错误码和异常混用情况的详细解释及相关建议。

- **必须使用错误码的场景**

1. `历史遗留代码`：许多大型项目在开发初期采用错误码进行错误处理，经过长期迭代，代码库庞大且复杂。在这些项目中引入异常处理机制，意味着要对大量既有代码进行修改，不仅工作量巨大，还可能引入新的错误。例如，一些老的系统级软件，其底层模块经过多年维护和扩展，与其他部分紧密耦合。如果贸然将错误码改为异常处理，可能会影响整个系统的稳定性。因此，在与这些历史遗留代码交互或对其进行维护时，继续使用错误码是较为稳妥的选择，以保持代码的兼容性和稳定性。
2. `跨语言处理`：当C++代码需要与其他语言（如C语言）进行交互时，由于不同语言对错误处理的机制差异较大，异常处理可能无法跨越语言边界。例如，C语言本身没有异常处理机制，如果C++代码调用C语言函数，C语言函数产生的错误无法直接通过异常传递给C++调用者。在这种跨语言场景下，使用错误码作为统一的错误标识和传递方式，能确保不同语言之间的交互顺利进行，保证错误信息的有效传递和处理。
3. `关键性能点`：在一些对性能要求极高的关键代码段，异常处理可能带来不可忽视的性能开销。如前所述，异常处理涉及栈展开、异常对象的创建与销毁等操作，这些在频繁调用的性能敏感代码中会显著影响程序性能。例如，在实时系统、游戏引擎的核心渲染模块等场景中，每一毫秒的性能都至关重要。此时，使用错误码进行错误处理，虽然可能使代码略显冗长，但能避免异常处理带来的性能损耗，确保系统在高负载、高性能要求下稳定运行。

- **混用建议**
  在不得不混用错误码和异常的项目中，应制定清晰的规则。例如，明确哪些模块或功能使用错误码，哪些使用异常处理，并在不同处理机制之间进行合理的转换。同时，要注重代码的注释和文档说明，使后续开发者能够清晰理解错误处理逻辑，降低维护成本。

通过合理运用错误码和异常，并谨慎处理二者的混用情况，开发者可以在不同场景下充分发挥它们各自的优势，提升软件系统的整体质量。

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
