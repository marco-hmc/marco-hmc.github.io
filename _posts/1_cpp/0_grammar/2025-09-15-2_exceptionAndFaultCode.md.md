---
layout: post
title: C++错误码与异常处理完全指南
categories: C++
related_posts: True
tags: C++
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
    DISK_FULL = 3,
    INVALID_FORMAT = 4
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

    // 读取文件内容
    std::string line;
    while (std::getline(file, line)) {
        content += line + "\n";
    }

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

    // 链式操作支持
    template<typename F>
    auto map(F&& func) -> Result<decltype(func(value_)), E> {
        if (success_) {
            return Result<decltype(func(value_)), E>(func(value_));
        } else {
            return Result<decltype(func(value_)), E>(error_);
        }
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

#### 2.3 错误码的设计模式

**分层错误码设计**：

```cpp
// 系统级错误码
namespace SystemError {
    enum Code {
        SUCCESS = 0,
        MEMORY_ERROR = 1000,
        IO_ERROR = 2000,
        NETWORK_ERROR = 3000
    };
}

// 应用级错误码
namespace AppError {
    enum Code {
        VALIDATION_ERROR = 4000,
        BUSINESS_LOGIC_ERROR = 5000,
        USER_ERROR = 6000
    };
}

// 错误上下文信息
struct ErrorContext {
    int code;
    std::string message;
    std::string file;
    int line;
    std::string function;

    ErrorContext(int c, const std::string& msg,
                const std::string& f, int l, const std::string& func)
        : code(c), message(msg), file(f), line(l), function(func) {}
};

#define MAKE_ERROR(code, msg) \
    ErrorContext(code, msg, __FILE__, __LINE__, __FUNCTION__)
```

### 3. 异常机制深入解析

#### 3.1 异常的基本概念与语法

C++异常处理通过 try、catch、throw 三个关键字实现：

```cpp
#include <stdexcept>
#include <iostream>
#include <memory>

// 自定义异常类
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

// 使用异常的函数示例
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

// 异常处理示例
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

#### 3.2 异常安全性等级

C++定义了四个异常安全性等级：

**1. 无异常保证 (No-throw guarantee)**：

```cpp
class SafeClass {
private:
    int value_;

public:
    // 无异常保证的函数
    int getValue() const noexcept { return value_; }
    void setValue(int val) noexcept { value_ = val; }

    // 析构函数默认是noexcept的
    ~SafeClass() noexcept = default;
};
```

**2. 强异常安全保证 (Strong exception safety)**：

```cpp
class StrongSafetyExample {
private:
    std::vector<int> data_;

public:
    void addElement(int value) {
        // 创建临时副本（可能抛出异常）
        auto temp = data_;
        temp.push_back(value);  // 如果这里抛出异常，原数据不变

        // 只有成功后才提交更改
        data_ = std::move(temp);  // 这个操作是noexcept的
    }
};
```

**3. 基本异常安全保证 (Basic exception safety)**：

```cpp
class BasicSafetyExample {
private:
    std::unique_ptr<int[]> data_;
    size_t size_;

public:
    void resize(size_t newSize) {
        // 分配新内存（可能抛出）
        auto newData = std::make_unique<int[]>(newSize);

        // 复制现有数据（可能抛出，但不会泄漏）
        size_t copySize = std::min(size_, newSize);
        std::copy(data_.get(), data_.get() + copySize, newData.get());

        // 提交更改
        data_ = std::move(newData);
        size_ = newSize;
    }
};
```

**4. 无异常安全保证 (No exception safety)**：

```cpp
// 错误示例：可能导致资源泄漏
class UnsafeClass {
private:
    int* data_;

public:
    void unsafeOperation() {
        delete[] data_;  // 释放旧内存
        data_ = new int[100];  // 如果这里抛出异常，data_变成悬挂指针
    }
};
```

#### 3.3 RAII 与异常安全

**RAII 原理与实现**：

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

    // 禁止拷贝
    FileGuard(const FileGuard&) = delete;
    FileGuard& operator=(const FileGuard&) = delete;

    // 允许移动
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

// 使用RAII的异常安全函数
void processFile(const std::string& filename) {
    FileGuard file(filename.c_str(), "r");  // 自动管理文件资源

    // 即使下面的代码抛出异常，文件也会被正确关闭
    std::vector<std::string> lines;
    char buffer[1024];

    while (std::fgets(buffer, sizeof(buffer), file.get())) {
        lines.emplace_back(buffer);  // 可能抛出std::bad_alloc
    }

    // 处理数据...
} // FileGuard析构函数自动关闭文件
```

### 4. 异常处理进阶技术

#### 4.1 异常传播与栈展开

```cpp
#include <iostream>
#include <vector>

class DestructorDemo {
private:
    int id_;

public:
    DestructorDemo(int id) : id_(id) {
        std::cout << "构造对象 " << id_ << std::endl;
    }

    ~DestructorDemo() {
        std::cout << "析构对象 " << id_ << std::endl;
    }
};

void level3() {
    DestructorDemo obj3(3);
    throw std::runtime_error("Level 3 error");
}

void level2() {
    DestructorDemo obj2(2);
    level3();  // 抛出异常
}

void level1() {
    DestructorDemo obj1(1);
    try {
        level2();
    } catch (const std::exception& e) {
        std::cout << "捕获异常: " << e.what() << std::endl;
        // 观察栈展开过程中的析构函数调用
    }
}

// 演示栈展开过程
void demonstrateStackUnwinding() {
    std::cout << "=== 栈展开演示 ===" << std::endl;
    level1();
    std::cout << "=== 演示结束 ===" << std::endl;
}
```

#### 4.2 异常重新抛出与嵌套异常

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

#### 4.3 自定义异常层次结构

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

### 5. 异常开销

`try`的开销约等于没有，堆栈深度为1的时候抛出异常的开销大约是1微妙，堆栈深度为10的时候抛出异常的开销大约是3微妙，堆栈深度为50的时候抛出异常的开销大约是11微妙。

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
  这种方式不会出现上述作用域和内存管理的问题。然而，它存在性能和类型处理的弊端。当异常被抛出时，系统会将异常对象拷贝两次，这会带来一定的性能开销。此外，还会出现派生类和基类的切片问题（slicing problem）。当派生类的异常对象被作为基类异常对象捕获时，派生类特有的部分会被切掉，导致调用的函数是基类版本而非派生类版本。例如：

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

#### 7. C/C++混用时，怎么处理异常？

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
