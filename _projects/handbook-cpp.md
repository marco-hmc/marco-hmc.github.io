---
layout: page
title: All the things about C++
description: Grammar, functional, template, etc.
img: assets/img/3.jpg
importance: 1
category: Tutorial
---

## C++ 相关

[github link](https://github.com/marco-hmc/handbook_cpp)

关于 C++ 的系统性学习笔记：从语言细节、函数式编程、模板元编程，到标准库、CMake 工程模板、Qt 原理，以及配套的性能基准测试和小项目实践。每个主题都是「文档 + 可运行代码」的结构，文档讲原理，`_code` 目录放验证性代码。

### 1. 目录结构

| 目录                                                 | 内容                                                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`0_grammar`](0_grammar)                             | 语言细节与陷阱：C++ 对象内存模型、虚函数与继承、程序内存布局、指针与引用、异常处理，以及 SIMD、EBCO、隐式转换等冷门机制                                |
| [`1_functional`](1_functional)                       | 函数式编程：函数式思想在 C++ 中的落地，λ 演算入门，含 Y 组合子、map/filter、RPN 等练习代码                                                             |
| [`2_template`](2_template)                           | 模板与元编程：模板基础、元编程（MTP）、继承与模板、可变参数、表达式模板、类型擦除，以及各编译器实现差异                                                |
| [`3_std`](3_std)                                     | 标准库：`std` 基础、智能指针、迭代器、字符串与 Unicode，以小型工程方式组织                                                                             |
| [`4_cmake_template`](4_cmake_template)               | CMake 工程模板：两套开箱即用的模板工程（含 preset），文档覆盖 CMake 基础、第三方库集成、preset、加速技巧与 Conan                                       |
| [`5_qt`](5_qt)                                       | Qt 原理剖析：从事件循环、信号槽、MOC 元对象系统到资源管理，配有底层机制的手写实现                                                                      |
| [`6_performance_benchmark`](6_performance_benchmark) | 性能基准测试：独立 benchmark 工程，含优化笔记（`docs/0_optimize.md`）、一键环境脚本与报告生成工具                                                      |
| [`7_tinyProject`](7_tinyProject)                     | 小项目合集：RTTI 基准测试（1_rx）、fmt（2_fmt）、数独求解器（3_sudokuSolver）、日志库（4_log）、内存池系统（5_memory_pool_system）、tinyDb（6_tinyDb） |
| [`99_others`](99_others)                             | 杂项：跨语言互调（Python 调用 C++）、C++ 内联汇编等                                                                                                    |

### 2. 快速入口

- **语言细节**：从 [`0_grammar/1_class/0_cppObjectMemModel.md`](0_grammar/1_class/0_cppObjectMemModel.md) 开始理解 C++ 对象在内存中的真实布局
- **模板进阶**：核心是 [`2_template/1_template_mtp.md`](2_template/1_template_mtp.md) 的模板元编程
- **标准库**：从 [`3_std/docs/1_smartPointer.md`](3_std/docs/1_smartPointer.md) 的智能指针入手
- **工程实践**：直接克隆 [`4_cmake_template/01_cmake_template`](4_cmake_template/01_cmake_template) 作为新项目骨架
- **练手项目**：[`7_tinyProject`](7_tinyProject) 里的每个小项目都可以独立编译运行

---

## 版权与许可

本项目采用 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hans) 许可协议授权，完整条款见本目录下的 [LICENSE](LICENSE) 文件。

- **BY（署名）**：使用、分享、演绎时必须保留原作者署名，并注明原始许可协议。
- **NC（非商业性使用）**：不得将本材料用于商业目的。
