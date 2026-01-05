---
layout: post
title: C++错误码与异常处理完全指南
categories: C++
related_posts: True
tags: Grammar
toc:
  sidebar: right
---

## C++错误码与异常处理完全指南

### 1. 错误处理概述

在程序运行过程中，错误处理是软件工程中的关键环节。错误可能源于多种原因：

- **外部数据问题**：输入数据格式错误、值超出范围
- **资源不可用**：文件不存在、网络连接失败、内存不足
- **程序逻辑错误**：空指针解引用、数组越界访问
- **系统级问题**：权限不足、硬件故障

针对这些问题，C++提供了两种主要的错误处理机制：

| 特性           | 错误码             | 异常机制           |
| -------------- | ------------------ | ------------------ |
| **性能开销**   | 低                 | 中等（抛出时较高） |
| **代码复杂度** | 高（需要层层检查） | 低（自动传播）     |
| **错误信息**   | 有限               | 丰富               |
| **控制流**     | 显式               | 隐式               |
| **跨语言兼容** | 好                 | 差                 |
| **RAII 支持**  | 需要手动管理       | 天然支持           |

### 2. 错误码机制详解

#### 2.1 错误码的基本概念

错误码是一种传统的错误处理方式，通过返回特定数值来标识函数执行状态：

```cpp
#include <iostream>
#include <fstream>
#include <string>

// 传统的错误码定义
enum class FileError {
    SUCCESS = 0,
    FILE_NOT_FOUND = 1,
    PERMISSION_DENIED = 2,
};

// 使用错误码的函数示例
FileError readFile(const std::string& filename, std::string& content) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        return FileError::FILE_NOT_FOUND;
    }
    if (!file.good()) {
        return FileError::PERMISSION_DENIED;
    }
    // ... 读取文件内容 ...
    return FileError::SUCCESS;
}

// 错误码的使用方式
void demonstrateErrorCode() {
    std::string content;
    FileError result = readFile("example.txt", content);

    switch (result) {
        case FileError::SUCCESS:
            std::cout << "File content: " << content << std::endl;
            break;
        case FileError::FILE_NOT_FOUND:
            std::cerr << "Error: File not found" << std::endl;
            break;
        case FileError::PERMISSION_DENIED:
            std::cerr << "Error: Permission denied" << std::endl;
            break;
        default:
            std::cerr << "Unknown error occurred" << std::endl;
    }
}
```

#### 2.2 现代 C++错误码设计

**std::expected (C++23)和第三方实现**：

```cpp
#include <expected>  // C++23
#include <string>
#include <fstream>

// 使用std::expected的现代错误处理
std::expected<std::string, FileError> readFileModern(const std::string& filename) {
    std::ifstream file(filename);

    if (!file.is_open()) {
        return std::unexpected(FileError::FILE_NOT_FOUND);
    }

    std::string content;
    std::string line;
    while (std::getline(file, line)) {
        content += line + "\n";
    }

    return content;
}

void demonstrateExpected() {
    auto result = readFileModern("example.txt");

    if (result) {
        std::cout << "File content: " << *result << std::endl;
    } else {
        std::cerr << "Error code: " << static_cast<int>(result.error()) << std::endl;
    }
}
```

**Result 模式实现**：

```cpp
template<typename T, typename E>
class Result {
private:
    bool success_;
    union {
        T value_;
        E error_;
    };

public:
    // 成功构造
    Result(const T& value) : success_(true), value_(value) {}
    Result(T&& value) : success_(true), value_(std::move(value)) {}

    // 错误构造
    Result(const E& error) : success_(false), error_(error) {}
    Result(E&& error) : success_(false), error_(std::move(error)) {}

    ~Result() {
        if (success_) {
            value_.~T();
        } else {
            error_.~E();
        }
    }

    bool isSuccess() const { return success_; }
    bool isError() const { return !success_; }

    const T& value() const {
        if (!success_) throw std::runtime_error("Accessing value of error result");
        return value_;
    }

    const E& error() const {
        if (success_) throw std::runtime_error("Accessing error of success result");
        return error_;
    }
};

// 使用Result的示例
Result<int, std::string> divide(int a, int b) {
    if (b == 0) {
        return Result<int, std::string>("Division by zero");
    }
    return Result<int, std::string>(a / b);
}
```

### 3. 异常机制深入解析

#### 3.1 异常的基本概念与语法

C++异常处理通过 try、catch、throw 三个关键字实现：

```cpp
#include <stdexcept>
#include <iostream>
#include <memory>

class FileException : public std::exception {
private:
    std::string message_;
    int errorCode_;

public:
    FileException(const std::string& msg, int code = 0)
        : message_(msg), errorCode_(code) {}

    const char* what() const noexcept override {
        return message_.c_str();
    }

    int getErrorCode() const { return errorCode_; }
};

std::string readFileWithException(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        throw FileException("Failed to open file: " + filename, 404);
    }

    std::string content;
    std::string line;
    while (std::getline(file, line)) {
        content += line + "\n";
    }

    if (file.bad()) {
        throw FileException("Error reading file: " + filename, 500);
    }

    return content;
}

void demonstrateExceptionHandling() {
    try {
        std::string content = readFileWithException("example.txt");
        std::cout << "File content: " << content << std::endl;
    }
    catch (const FileException& e) {
        std::cerr << "File error [" << e.getErrorCode() << "]: "
                  << e.what() << std::endl;
    }
    catch (const std::exception& e) {
        std::cerr << "Standard exception: " << e.what() << std::endl;
    }
    catch (...) {
        std::cerr << "Unknown exception occurred" << std::endl;
    }
}
```

#### 3.2 异常安全等级

异常等级有分为四个等级：

1. 无异常保证 (No-throw guarantee)
   - 函数保证不会抛出异常。如果函数内部发生异常，程序会终止或调用 `std::terminate`。
   - 一般就是在函数声明后面加上 `noexcept` 关键字，表示该函数不会抛出异常。
2. 强异常安全保证 (Strong exception safety)
   - 函数在抛出异常时，程序状态保持不变。也就是说，如果函数失败，程序的状态就像函数从未被调用过一样。
   - 这种保证通常通过使用临时对象或副本来实现，只有在操作成功后才会修改实际数据。
   ```C++
   void strongSafetyExample() {
       auto temp = data_;      // 创建临时副本（可能抛出异常）
       temp.push_back(value);  // 如果这里抛出异常，原数据不变
       data_ = std::move(temp);  // 这个操作是noexcept的
       // 不管成功与否，data_要么保持原样，要么完全更新
   }
   ```
3. 基本异常安全保证 (Basic exception safety)
   - 函数在抛出异常时，程序状态仍然是有效的，但可能已经部分修改。也就是说，程序不会崩溃或进入不一致状态，但数据可能已经被部分更改。
   - 这种保证通常通过确保在异常发生时，资源不会泄漏，并且对象保持有效状态来实现。
   ```C++
   void basicSafetyExample() {
       auto newData = std::make_unique<int[]>(newSize); // 分配新内存（可能抛出）
       size_t copySize = std::min(size_, newSize);      // 复制现有数据（可能抛出，但不会泄漏）
       std::copy(data_.get(), data_.get() + copySize, newData.get());
       // 提交更改
       data_ = std::move(newData);
       size_ = newSize;
       // 即使抛出异常，data_仍然是有效的
   }
   ```
4. 无异常安全保证 (No exception safety)
   - 函数在抛出异常时，程序状态可能变得不一致或无效。也就是说，函数可能会导致资源泄漏、数据损坏或程序崩溃。
   ```C++
   void unsafeOperation() {
       delete[] data_;  // 释放旧内存
       data_ = new int[100];  // 如果这里抛出异常，data_变成悬挂指针
   }
   ```

很多时候开发都不会去区分这四个等级。问题是在于，当一个函数抛出异常时，当前程序上下文的状态时需要去维护的，如果自己抛的异常，就需要在catch的时候去维护状态；其中，RAII是一个非常好的方法去维护状态的方式。

#### 3.3 异常安全

##### 3.3.1 RAII

```cpp
#include <mutex>
#include <fstream>

// RAII文件管理器
class FileGuard {
private:
    std::FILE* file_;

public:
    explicit FileGuard(const char* filename, const char* mode) {
        file_ = std::fopen(filename, mode);
        if (!file_) {
            throw std::runtime_error("Failed to open file");
        }
    }

    ~FileGuard() {
        if (file_) {
            std::fclose(file_);
        }
    }

    FileGuard(const FileGuard&) = delete;
    FileGuard& operator=(const FileGuard&) = delete;

    FileGuard(FileGuard&& other) noexcept : file_(other.file_) {
        other.file_ = nullptr;
    }

    FileGuard& operator=(FileGuard&& other) noexcept {
        if (this != &other) {
            if (file_) std::fclose(file_);
            file_ = other.file_;
            other.file_ = nullptr;
        }
        return *this;
    }

    std::FILE* get() const { return file_; }
};

void processFile(const std::string& filename) {
    FileGuard file(filename.c_str(), "r");  // 自动管理文件资源

    std::vector<std::string> lines;
    char buffer[1024];

    while (std::fgets(buffer, sizeof(buffer), file.get())) {
        lines.emplace_back(buffer);
    }
}
```

##### 3.3.2 复制-交换

若需要“操作要么全成，要么全不影响”（如修改配置、更新对象状态），核心技术是 **复制-交换（Copy-Swap Idiom）**，无需手动 catch 重置。

1. 先复制一份“原始状态”的副本；
2. 在副本上执行修改操作（修改过程中即使抛异常，原始状态不受影响）；
3. 若修改成功，用「无抛异常操作（`noexcept`）」将副本与原始状态交换（交换后副本析构，原始状态更新）。

```cpp
#include <utility>

class Config {
private:
    int timeout_;
    std::string ip_;

    void swap(Config& other) noexcept {
        std::swap(timeout_, other.timeout_);
        std::swap(ip_, other.ip_);
    }
public:

    Config(int timeout = 30, std::string ip = "127.0.0.1")
        : timeout_(timeout), ip_(ip) {}
    Config(const Config& other)
        : timeout_(other.timeout_), ip_(other.ip_) {}
    Config& operator=(Config other) {
        swap(other);
        return *this;
    }
    void update(int new_timeout, const std::string& new_ip) {
        Config temp = *this;
        temp.timeout_ = new_timeout;
        temp.ip_ = new_ip;
        swap(temp);
    }

    int timeout() const { return timeout_; }
    std::string ip() const { return ip_; }
};
```

### 4. 异常处理进阶技术

#### 4.1 异常传播与栈展开

异常传播是指当一个异常被抛出时，程序会沿着调用栈向上查找匹配的 `catch` 块。这个过程称为栈展开（stack unwinding）。在栈展开过程中，所有在异常发生点之后创建的局部对象都会被销毁，其析构函数会被调用，以确保资源正确释放。

### 5. 异常开销!!!

`try`的开销约等于没有，堆栈深度为1的时候抛出异常的开销大约是1微妙，堆栈深度为10的时候抛出异常的开销大约是3微妙，堆栈深度为50的时候抛出异常的开销大约是11微妙。

异常确实不应该当作正常控制流的一部分来使用，但在错误处理场景下，异常的开销通常是可以接受的，尤其是当错误发生频率较低时。

### 98. appendix

#### 1. 异常重新抛出与嵌套异常

```cpp
#include <exception>

// 异常重新抛出
void processWithRetry() {
    int retryCount = 0;
    const int maxRetries = 3;

    while (retryCount < maxRetries) {
        try {
            // 尝试执行可能失败的操作
            if (retryCount < 2) {
                throw std::runtime_error("模拟暂时性错误");
            }
            std::cout << "操作成功!" << std::endl;
            break;
        }
        catch (const std::exception& e) {
            ++retryCount;
            std::cout << "重试 " << retryCount << "/" << maxRetries
                      << ": " << e.what() << std::endl;

            if (retryCount >= maxRetries) {
                std::cout << "重试次数耗尽，重新抛出异常" << std::endl;
                throw;  // 重新抛出当前异常
            }
        }
    }
}

// 嵌套异常处理
void nestedExceptionExample() {
    try {
        try {
            throw std::runtime_error("内层错误");
        }
        catch (const std::exception& e) {
            std::throw_with_nested(
                std::logic_error("外层错误: 处理内层错误时发生问题")
            );
        }
    }
    catch (const std::exception& e) {
        std::cout << "外层异常: " << e.what() << std::endl;

        // 展开嵌套异常
        try {
            std::rethrow_if_nested(e);
        }
        catch (const std::exception& nested) {
            std::cout << "嵌套异常: " << nested.what() << std::endl;
        }
    }
}
```

#### 2. 自定义异常层次结构

```cpp
#include <sstream>
#include <source_location>  // C++20

// 基础异常类
class ApplicationException : public std::exception {
protected:
    std::string message_;
    std::string details_;
    std::source_location location_;

public:
    ApplicationException(const std::string& message,
                        const std::source_location& loc = std::source_location::current())
        : message_(message), location_(loc) {

        std::ostringstream oss;
        oss << message_ << " ["
            << location_.file_name() << ":" << location_.line()
            << " in " << location_.function_name() << "]";
        details_ = oss.str();
    }

    const char* what() const noexcept override {
        return details_.c_str();
    }

    const std::source_location& where() const { return location_; }
};

// 具体异常类
class ValidationException : public ApplicationException {
private:
    std::string fieldName_;

public:
    ValidationException(const std::string& field, const std::string& message,
                       const std::source_location& loc = std::source_location::current())
        : ApplicationException("Validation error in field '" + field + "': " + message, loc),
          fieldName_(field) {}

    const std::string& getFieldName() const { return fieldName_; }
};

class BusinessLogicException : public ApplicationException {
private:
    int errorCode_;

public:
    BusinessLogicException(int code, const std::string& message,
                          const std::source_location& loc = std::source_location::current())
        : ApplicationException("Business logic error [" + std::to_string(code) + "]: " + message, loc),
          errorCode_(code) {}

    int getErrorCode() const { return errorCode_; }
};

// 使用示例
void validateUser(const std::string& username, const std::string& email) {
    if (username.empty()) {
        throw ValidationException("username", "Username cannot be empty");
    }

    if (email.find('@') == std::string::npos) {
        throw ValidationException("email", "Invalid email format");
    }
}

void processUserRegistration(const std::string& username, const std::string& email) {
    try {
        validateUser(username, email);

        // 模拟业务逻辑错误
        if (username == "admin") {
            throw BusinessLogicException(1001, "Admin username is reserved");
        }

        std::cout << "用户注册成功: " << username << std::endl;
    }
    catch (const ValidationException& e) {
        std::cerr << "验证错误: " << e.what() << std::endl;
        std::cerr << "字段: " << e
    }
}
```

### 99. quiz

#### 1. 如何理解异常的开销？

在C++中，异常处理开销主要体现在以下几个方面：

- `栈展开开销`：当异常发生时，程序需要进行栈展开操作，即解除函数调用栈，以确定要调用的异常处理程序。这涉及到对栈上对象的析构等操作，是一个相对耗时的过程。
- `异常对象开销`：异常是通过对象传递的，这些对象通常被分配在堆内存中，会增加内存开销，包括对象的创建和析构。
- `额外代码路径开销`：异常处理机制会使程序增加额外的代码路径，导致编译生成后的程序尺寸偏大，也会在一定程度上降低程序执行速度。
- `性能开销`：异常的跳转会打乱程序的正常执行流程，使编译器难以进行一些优化，可能导致程序性能下降。同时，为保证写出异常安全的代码，往往需要借用C++其它特性，如智能指针，这又进一步加剧了程序的时空开销，包括编译时间延长和运行效率降低。

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

#### 4. 通过引用捕获异常

```cpp
class MyException {
public:
    virtual const char* what() const noexcept {
        return "Base Exception";
    }
};

class DerivedException : public MyException {
public:
    const char* what() const noexcept override {
        return "Derived Exception";
    }
};

void someFunction() {
    if (true) {
        throw DerivedException();
    }
}

void doSomething() {
    try {
        someFunction();
    } catch (MyException& ex) {
        std::cerr << ex.what();
        // 这里调用的是 DerivedException 的 what 函数
    } catch (MyException ex) {
        std::cerr << ex.what();
        // 这里调用的是 MyException 的 what 函数，而非 DerivedException 的
    }
}
```

- **通过值捕获异常**
  这种方式不会出现上述作用域和内存管理的问题。然而，它存在性能和类型处理的弊端。当异常被抛出时，系统会将异常对象拷贝两次，这会带来一定的性能开销。此外，还会出现派生类和基类的切片问题（slicing problem）。当派生类的异常对象被作为基类异常对象捕获时，派生类特有的部分会被切掉，导致调用的函数是基类版本而非派生类版本。

- **通过引用捕获异常**
  通过引用捕获异常可以避免上述所有问题。异常对象只会被拷贝一次，既不会出现因作用域导致的异常失效问题，也不会出现切片问题。在捕获派生类异常时，能够正确调用派生类中重写的函数。例如：

综上所述，在C++ 异常处理中，通过引用捕获异常通常是最稳健和高效的选择，能够避免多种潜在问题，同时保证代码的可读性和可维护性。

#### 5. 抛出异常，没有捕获会怎么样?

在C++中，异常处理机制是通过栈展开（stack unwinding）来实现的。当一个异常被抛出时，程序会沿着调用栈向上查找，直到找到一个匹配的异常处理程序（catch块）。如果在调用栈中没有找到匹配的catch块，那么程序会调用函数`std::terminate`，通常会导致程序的非正常退出。

在调用`std::terminate`之前，C++还会尝试调用一个名为`std::unexpected`的函数。可以通过`std::set_unexpected`函数来设置`std::unexpected`的行为。如果`std::unexpected`函数没有调用`std::terminate`并且能够处理异常，那么程序可能会继续执行。不过，通常情况下，`std::unexpected`函数会调用`std::terminate`。

`std::terminate`函数的默认行为是调用`abort`来终止程序，但可以通过`std::set_terminate`函数来改变这个行为。

总的来说，如果抛出了异常但没有被捕获，程序通常会立即终止。因此，在编写可能会抛出异常的代码时，应该提供异常处理机制，以防止程序的非正常退出。

#### 6. new 失败不需要调用 delete

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

#### 7. `extern "C"抛出异常会怎样？

由于 C 代码中没有异常处理机制，栈展开过程可能无法正确进行，导致未定义行为或程序崩溃。
因此为了避免 C++ 异常传递到没有异常处理机制的 C 代码中，可以采取以下措施：

使用`extern "C"`的 C++代码是可以使用 c++特性的，因为这个关键词只是让函数用了 name mangling 技术。而 C/C++本身都是用类似的编译器的。

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

稍微进一步阐述一下，`extern "C"` 只是告诉编译器使用 C 的链接方式（name mangling），并不影响函数内部的实现细节。因此，在 `extern "C"` 声明的函数中，仍然可以使用 C++ 的特性，包括异常处理。

那问题来了，如果在 `extern "C"` 声明的函数中抛出异常且没处理，会发生什么呢？答案是：如果异常没有被捕获，它将会传播到调用该函数的 C 代码中，而 C 代码并没有异常处理机制，这将导致程序行为未定义，通常会导致程序崩溃。

那问题又来了，在上面这个场景下，虽然接口是 `extern "C"`，但是外部调用的代码还是 C++ 代码，那异常能够在外部 C++ 代码中传播吗？答案是看编译器选项。

msvc编译器的关于异常的选项有：

- `/EHsc`：Enable C++ EH (synchronous) + Standard C++ → 严格遵循 **C++ 标准** 的同步异常处理，额外限制“异常只能来自 C++ 构造的代码”。
- `/EHs`：Enable C++ EH (synchronous) → 仅支持 **同步 C++ 异常**（由 `throw` 显式抛出的异常），不支持结构化异常（SEH，如访问冲突）。

说实话，每次看这种定义，我都头疼，感觉不是在说人话。因此这里给出表现上两者的区别：

1. 使用 `/EHsc` 编译选项时，如果在 `extern "C"` 声明的函数中抛出异常，且外部调用代码是 C++ 代码，是一个比较ub的行为。如果外部捕获了异常，一般是不会崩溃的。但是externC函数内部的raii对象的析构函数不会被调用，导致资源泄露。进一步扩展，如果raii的析构函数没有被调用，说明是函数栈没有被正确展开，可能损坏程序状态，导致进一步不可预期的行为。
2. 使用 `/EHs` 编译选项时，如果在 `extern "C"` 声明的函数中抛出异常且未捕获，异常将会传播到调用该函数的 C++ 代码中，允许 C++ 代码捕获并处理该异常。这个时候，raii对象的析构函数会被正确调用，资源不会泄露。

#### 8. 异常与多线程

在多线程环境中使用异常处理时，需要注意以下几点：

- 每个线程应独立处理其内部的异常。异常不应跨线程传播，因为这会导致未定义行为。因为每个线程都有自己的调用栈，异常只能在当前线程的栈上进行传播和处理。
- 在线程函数中使用 `try-catch` 块来捕获和处理异常，确保线程能够正确终止或继续运行。

c++是有并行库的，比如tbb和ppl等，这些并行库一般都会对异常进行捕获和处理，确保异常不会跨线程传播。
在ppl的表现则是，在执行parallelFor任务时，如果某个任务抛出异常，ppl会捕获该异常，并会传播一个异常到其余的任务中，来终止这些任务的执行。

```cpp
#include <ppl.h>

#include <chrono>
#include <iostream>
#include <stdexcept>
#include <thread>

struct Guard {
    const char* name;
    Guard(const char* n) : name(n) { std::cout << name << " constructed\n"; }
    ~Guard() { std::cout << name << " destructed\n"; }
};

extern "C" void extern_c_task(){
    Guard g("externC");
    try {
        Concurrency::parallel_for(0, 10, [](int j) {
            std::this_thread::sleep_for(std::chrono::milliseconds(100));
            std::cout << "  nested " << j << "\n";
        });
        std::this_thread::sleep_for(std::chrono::milliseconds(2000));

    } catch (const std::exception& e) {
        std::cout << "extern C excpetion: " << e.what() << "\n";
    }
}

int main() {
    try {
        Concurrency::parallel_for(0, 1500, [&](int i) {
            if (i == 0) {
                extern_c_task();
            } else {
                std::this_thread::sleep_for(std::chrono::milliseconds(200));
                std::cout << i << "\n";
                /*
                如果这里抛出异常，ppl会捕获该异常，并会传播一个异常到其余的任务中，来终止这些任务的执行。
                extern_c_task()的catch就会输出，但不是同一个异常。
                如果这里不抛出异常，extern_c_task()的catch是捕获不到异常的。

                说明ppl是会通过传播异常来终止其余任务的执行的。
                */
                throw std::runtime_error("exception from parallel task");
            }
        });
    } catch (const std::exception& e) {
        std::cout << "main caught exception: " << e.what() << "\n";
    } catch (...) {
        std::cout << "main caught unknown exception\n";
    }

    return 0;
}
```

好了，还有一个问题就是为什么`extern_c_task`里面有一个parallel_for呢？因为ppl终止任务是需要一个介入点的，只有插入ppl的任务，ppl才能够终止这些任务的执行。所以这里放一个nested的parallel_for作为介入点。去掉之后，类似于一个纯粹计算任务是不会被终止的。
