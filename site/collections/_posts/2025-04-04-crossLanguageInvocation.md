---
date: 2025-04-04 10:27:01 +0800
project: language
title: crossLanguageInvocation
image: /images/post/post-7.jpg
tags: 跨语言调用

---

#### 1. extern"C"里面可以使用C++语法吗？有什么限制？
extern“C”{}只是让C++按照C语言的函数调用约定去生成汇编，C语言的函数调用约定无法实现成员函数的调用，模板的使用，重载函数，以及异常的抛出，而其他的c++能力都能够支持。

C 语言调用 C++语法函数怎么做？
那 C++调用 C 语法的函数怎么做？
Extern “C”是什么意思？

#### 1.16 extern"C"的作用?有什么注意事项？

`extern "C"`在C++中的主要作用是实现C和C++的混合编程。它告诉C++编译器按照C语言的规则来编译和链接代码。

C++支持函数重载，所以C++编译器会对函数名进行名字修饰（name mangling）以区分重载函数。然而，C语言不支持函数重载，也就不进行名字修饰。因此，如果你想在C++代码中调用C语言编写的函数，或者反过来，你需要告诉C++编译器不要对这些函数进行名字修饰。这就是`extern "C"`的作用。

那如果c++代码中有函数重载的部分，也希望这部分代码能够被C语言使用，我还可以使用extern c吗？

不幸的是，你不能这样做。C语言不支持函数重载，这意味着在C语言中，你不能有两个或更多的函数具有相同的名字，即使它们的参数类型或数量不同。

当你在C++中使用`extern "C"`时，你告诉C++编译器按照C语言的规则来处理被`extern "C"`修饰的代码。这意味着，如果你尝试在`extern "C"`块中定义两个或更多的重载函数，你会得到一个编译错误，因为这违反了C语言的规则。

不同编程语言之间的相互调用通常被称为“语言互操作性”（Language Interoperability）或“跨语言调用”（Cross-Language Invocation）。这种技术允许一个语言编写的代码调用另一个语言编写的代码，从而实现不同语言之间的协作和集成。

### 相关术语和概念

1. **语言互操作性（Language Interoperability）**：

   - 这是一个广义的术语，指的是不同编程语言之间能够相互调用和协作的能力。它包括跨语言调用、数据类型转换、错误处理等方面。

2. **跨语言调用（Cross-Language Invocation）**：

   - 这是指在一个编程语言中调用另一个编程语言中的函数或方法。例如，在 C++ 中调用 Python 函数，或者在 C 中调用 C++ 函数。

3. **外部函数接口（Foreign Function Interface, FFI）**：

   - 这是一个允许一种编程语言调用另一种编程语言函数的机制。FFI 通常用于跨语言调用，例如在 C++ 中调用 C 函数，或者在 Python 中调用 C 函数。

4. **名称修饰（Name Mangling）**：
   - 这是 C++ 编译器用来支持函数重载的一种技术。名称修饰会将函数名转换为包含参数类型信息的唯一名称，以便在链接时区分不同的重载函数。在跨语言调用时，通常需要使用 `extern "C"` 来禁用名称修饰，以便 C 代码能够正确调用 C++ 函数。

### 相关技术和工具

1. **C++ 调用 C**：

   - 使用 `extern "C"` 关键字来禁用名称修饰，使得 C++ 函数可以被 C 代码调用。

   ```cpp
   // C++ 代码
   extern "C" void cpp_function() {
       // 函数实现
   }
   ```

   ```c
   // C 代码
   extern void cpp_function();

   int main() {
       cpp_function();
       return 0;
   }
   ```

2. **C++ 调用 Python**：

   - 使用 Python 的 C API 或者 Boost.Python 库来实现 C++ 调用 Python 函数。

   ```cpp
   // 使用 Python C API
   #include <Python.h>

   void call_python_function() {
       Py_Initialize();
       PyRun_SimpleString("print('Hello from Python!')");
       Py_Finalize();
   }
   ```

3. **Python 调用 C++**：

   - 使用 ctypes 或 cffi 库来调用 C++ 函数，或者使用 SWIG（Simplified Wrapper and Interface Generator）生成包装代码。

   ```python
   # 使用 ctypes 调用 C++ 函数
   import ctypes

   cpp_lib = ctypes.CDLL('./cpp_lib.so')
   cpp_lib.cpp_function()
   ```

### 相关知识

1. **数据类型转换**：

   - 在跨语言调用中，不同语言的数据类型可能不兼容，需要进行数据类型转换。例如，将 C++ 的 `std::string` 转换为 C 的 `char*`，或者将 Python 的 `str` 转换为 C 的 `char*`。

2. **错误处理**：

   - 不同语言的错误处理机制可能不同。在跨语言调用中，需要处理好错误和异常。例如，将 C++ 的异常转换为 C 的错误码，或者将 Python 的异常转换为 C 的错误码。

3. **内存管理**：
   - 不同语言的内存管理机制可能不同。在跨语言调用中，需要注意内存的分配和释放。例如，在 C++ 中分配的内存需要在 C++ 中释放，避免内存泄漏。

### 总结

语言互操作性和跨语言调用是现代软件开发中常见的需求。通过使用外部函数接口（FFI）、名称修饰（Name Mangling）等技术，可以实现不同编程语言之间的相互调用和协作。在实际开发中，需要注意数据类型转换、错误处理和内存管理等问题，以确保跨语言调用的正确性和稳定性。

你的理解基本正确，但可以进一步细化和澄清一些细节。以下是对 C++ 调用 Python 函数的详细解释：

### C++ 调用 Python 函数的基本步骤

1. **嵌入 Python 解释器**：

   - C++ 需要嵌入 Python 解释器，以便能够执行 Python 代码。这通常通过初始化 Python 解释器来实现。

2. **数据类型转换**：

   - C++ 需要依赖一个库（如 Python C API 或 pybind11）来实现 C++ 数据类型与 Python 数据类型之间的转换。这包括将 C++ 数据转换为 Python 对象，以及将 Python 对象转换为 C++ 数据。

3. **加载和解析 Python 文件**：

   - C++ 需要提供一个机制来加载和解析 Python 文件，以便能够调用 Python 文件中的函数和方法。这通常通过 Python C API 提供的模块加载功能来实现。

4. **调用 Python 函数**：

   - C++ 需要调用 Python 函数，并传递转换后的参数。这通常通过 Python C API 提供的函数调用功能来实现。

5. **处理返回值**：
   - Python 函数处理完数据后，返回值需要转换回 C++ 数据类型，以便在 C++ 代码中使用。

### 详细步骤

1. **嵌入 Python 解释器**：

   - 使用 `Py_Initialize()` 函数初始化 Python 解释器，使其可以在 C++ 程序中运行。

2. **数据类型转换**：

   - 使用 Python C API 提供的函数（如 `PyLong_FromLong`、`PyFloat_FromDouble` 等）将 C++ 数据转换为 Python 对象。
   - 使用 Python C API 提供的函数（如 `PyLong_AsLong`、`PyFloat_AsDouble` 等）将 Python 对象转换为 C++ 数据。

3. **加载和解析 Python 文件**：

   - 使用 `PyImport_ImportModule` 函数加载 Python 模块。例如，加载名为 `myscript` 的模块。
   - 使用 `PyObject_GetAttrString` 函数从模块对象中获取目标函数的引用。

4. **调用 Python 函数**：

   - 使用 `PyObject_CallObject` 函数调用目标函数，并传递参数。

5. **处理返回值**：
   - 使用 `PyLong_AsLong` 或其他类型转换函数将 Python 对象转换为 C++ 数据类型。

### 示例代码

以下是一个示例，展示了如何在 C++ 中调用 Python 函数：

#### Python 脚本（myscript.py）

```python
# myscript.py
def my_function(x, y):
    return x + y
```

#### C++ 代码

```cpp
#include <Python.h>
#include <iostream>

void call_python_function() {
    // 初始化 Python 解释器
    Py_Initialize();

    // 加载 Python 脚本
    PyObject* pName = PyUnicode_DecodeFSDefault("myscript");
    PyObject* pModule = PyImport_Import(pName);
    Py_DECREF(pName);

    if (pModule != nullptr) {
        // 获取 Python 函数
        PyObject* pFunc = PyObject_GetAttrString(pModule, "my_function");
        if (pFunc && PyCallable_Check(pFunc)) {
            // 准备参数
            PyObject* pArgs = PyTuple_Pack(2, PyLong_FromLong(3), PyLong_FromLong(5));
            // 调用 Python 函数
            PyObject* pValue = PyObject_CallObject(pFunc, pArgs);
            Py_DECREF(pArgs);

            if (pValue != nullptr) {
                std::cout << "Result of call: " << PyLong_AsLong(pValue) << std::endl;
                Py_DECREF(pValue);
            } else {
                PyErr_Print();
            }
            Py_XDECREF(pFunc);
        } else {
            PyErr_Print();
        }
        Py_DECREF(pModule);
    } else {
        PyErr_Print();
    }

    // 终止 Python 解释器
    Py_Finalize();
}

int main() {
    call_python_function();
    return 0;
}
```

### 总结

你的理解基本正确，C++ 调用 Python 函数的确需要以下几个关键步骤：

1. **嵌入 Python 解释器**：初始化 Python 解释器，使其可以在 C++ 程序中运行。
2. **数据类型转换**：使用 Python C API 或第三方库（如 pybind11）实现 C++ 数据类型与 Python 数据类型之间的转换。
3. **加载和解析 Python 文件**：加载 Python 模块，并获取目标函数的引用。
4. **调用 Python 函数**：调用 Python 函数，并传递参数。
5. **处理返回值**：将 Python 函数的返回值转换为 C++ 数据类型。

通过实现这些步骤，C++ 可以成功调用 Python 函数，实现跨语言的互操作性。


