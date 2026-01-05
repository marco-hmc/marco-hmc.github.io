---
layout: page
title: rtti-libs
description: Rtti impl and benchmark
img: assets/img/4.jpg
importance: 1
category: Codebase
---

# RTTI Benchmark

[Github Repo Link](https://github.com/marco-hmc/cpp_rx)

一个用于比较 `std::dynamic_cast` 和自定义 RTTI 实现性能的 C++ 基准测试库。

## 1. 概念

### 1.1 自己实现的 RTTI 比 std 实现快的 trade off 是什么？

**性能优势：**

- **更快的类型检查**：自定义实现通常使用简单的整数或指针比较，而 `std::dynamic_cast` 需要遍历类型层次结构
- **编译时优化**：可以在编译时生成类型 ID，减少运行时开销
- **缓存友好**：减少内存访问，提高缓存命中率

**Trade-offs（权衡）：**

- **类型安全性降低**：失去编译器提供的类型安全保证
- **可移植性问题**：无法跨模块边界或不同编译器工作
- **维护复杂度**：需要手动管理类型注册和 ID 分配
- **标准兼容性**：不遵循 C++ 标准，可能与其他库冲突
- **调试困难**：类型错误更难追踪和调试

### 1.2 自己实现 RTTI 的关键是什么？

**核心技术：**

1. **类型 ID 系统**

   ```cpp
   // 为每个类型分配唯一 ID
   template<typename T>
   struct TypeID {
       static const int value;
   };
   ```

2. **基类型信息存储**

   ```cpp
   class RTTIBase {
   protected:
       int type_id_;
   public:
       virtual int getTypeID() const = 0;
   };
   ```

3. **快速类型转换**
   ```cpp
   template<typename To, typename From>
   To* fast_cast(From* obj) {
       return (obj && obj->getTypeID() == TypeID<To>::value)
              ? static_cast<To*>(obj) : nullptr;
   }
   ```

## 2. 项目结构

```
├── include/
│   ├── rtti_base.h      # RTTI 基类定义
│   ├── fast_cast.h      # 快速类型转换实现
│   └── type_registry.h  # 类型注册系统
├── src/
│   ├── benchmark.cpp    # 基准测试代码
│   └── example.cpp      # 使用示例
├── tests/
│   └── test_rtti.cpp    # 单元测试
└── CMakeLists.txt       # 构建配置
```

## 3. 使用方法

### 3.1 定义支持自定义 RTTI 的类

```cpp
#include "rtti_base.h"

class Shape : public RTTIBase {
public:
    DECLARE_RTTI(Shape)
    virtual void draw() = 0;
};

class Circle : public Shape {
public:
    DECLARE_RTTI(Circle)
    void draw() override { /* 实现 */ }
};

class Rectangle : public Shape {
public:
    DECLARE_RTTI(Rectangle)
    void draw() override { /* 实现 */ }
};
```

### 3.2 使用快速类型转换

```cpp
#include "fast_cast.h"

Shape* shape = new Circle();

// 自定义 RTTI 转换
Circle* circle1 = fast_cast<Circle>(shape);

// 标准 dynamic_cast 转换
Circle* circle2 = dynamic_cast<Circle*>(shape);
```

## 4. 基准测试结果

### 4.1 测试环境

- **编译器**: GCC 11.2.0 / Clang 13.0.0
- **优化级别**: -O2
- **测试次数**: 1,000,000 次类型转换

### 4.2 性能对比

| 转换类型 | std::dynamic_cast | fast_cast | 性能提升 |
| -------- | ----------------- | --------- | -------- |
| 成功转换 | 45.2 ns           | 12.1 ns   | **3.7x** |
| 失败转换 | 38.7 ns           | 8.3 ns    | **4.7x** |
| 深层继承 | 89.4 ns           | 12.1 ns   | **7.4x** |

### 4.3 内存开销

| 实现方式          | 每对象开销        | 全局开销   |
| ----------------- | ----------------- | ---------- |
| std::dynamic_cast | 8 bytes (vtable)  | 类型信息表 |
| fast_cast         | 4 bytes (type_id) | 类型注册表 |

## 5. 限制和注意事项

### 5.1 已知限制

- **跨模块问题**：不同动态库中的相同类型可能有不同的类型 ID
- **多重继承**：复杂的多重继承场景下可能失效
- **虚继承**：不支持虚继承的复杂场景

### 5.2 最佳实践

- 仅在性能关键路径使用
- 保持类型层次结构简单
- 充分测试类型转换的正确性
- 考虑使用 `static_cast` 替代简单场景

## 6. 构建和运行

```bash
# 克隆项目
git clone <repository-url>
cd rtti-benchmark

# 构建项目
mkdir build && cd build
cmake ..
make

# 运行基准测试
./rtti_benchmark

# 运行单元测试
./test_rtti
```

## 7. 参考资料

Dynamic Cast 和 RTTI 的问题在于它不能跨越模块边界或不同的编译器。

- [C++ Tricks: Fast RTTI and Dynamic Cast](https://kahncode.com/2019/09/24/c-tricks-fast-rtti-and-dynamic-cast/)
- [elohim-meth/rtti](https://github.com/elohim-meth/rtti)
- [C++ Core Guidelines: Type Safety](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#SS-type)
