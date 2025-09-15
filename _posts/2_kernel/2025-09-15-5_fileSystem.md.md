---
layout: post
title: （六）内核那些事儿：文件系统
categories: OS
related_posts: True
tags: kernel
toc:
  sidebar: right
---

## （六）内核那些事儿：文件系统

- 请解释 Linux 下 ELF 文件的节结构，映射到进程地址空间后分别对应哪些段？
- 全局变量和静态变量存储在进程地址空间的哪里？

### 一、Linux 虚拟文件系统（VFS）

1. **概念与作用**

   - VFS（Virtual File System）是 Linux 内核中的抽象层，为各种底层文件系统（如 ext4、XFS、BtrFS、NTFS、FAT32 等）提供统一接口。
   - 应用程序通过标准系统调用（`open`、`read`、`write`、`stat`、`ioctl` 等）访问文件，而无需关心底层具体文件系统细节。

2. **VFS 结构**

   - **超块（super_block）**：代表一个文件系统实例，记录文件系统类型、挂载参数、缓存等信息。
   - **索引节点（inode）**：表示文件元数据（权限、属主、大小、时间戳、数据块指针等），不包含文件名。
   - **目录项（dentry）**：目录中的文件名到 inode 的映射，加速路径解析。
   - **文件对象（file）**：表示文件打开实例；包含文件偏移量、文件状态标志、指向 dentry 和 inode 的指针。

3. **/proc 文件系统**

   - 纯内存中生成的虚拟文件系统，不占用磁盘空间，主要提供内核和进程运行时信息。
   - `/proc` 下的常见目录和文件：

     - `/proc/[pid]/status`：进程状态；
     - `/proc/[pid]/cmdline`：启动命令行；
     - `/proc/[pid]/maps`：虚拟内存布局；
     - `/proc/cpuinfo`、`/proc/meminfo`：系统硬件与内存信息；
     - `/proc/sys`：内核参数接口。

4. **设计哲学：一切皆文件**

   - 将硬件、进程、网络、配置参数等都抽象成文件与目录，简化编程模型。

---

### 二、常见 Linux 虚拟文件目录

| 序号 | 目录             | 功能描述                                  |
| ---- | ---------------- | ----------------------------------------- |
| 1    | `/proc`          | 内核和进程信息接口                        |
| 2    | `/sys`           | sysfs：设备和驱动模型信息                 |
| 3    | `/dev`           | 设备节点（字符、块设备）                  |
| 4    | `/run`           | 运行时数据（PID 文件、锁文件、socket 等） |
| 5    | `/tmp`           | 临时文件（重启后可能清空）                |
| 6    | `/mnt`、`/media` | 临时挂载点                                |

---

### 三、文件操作相关系统调用

- **打开与关闭**：`open()`、`close()`
- **读写数据**：`read()`、`write()`
- **文件定位**：`lseek()`
- **文件属性**：`stat()`、`fstat()`、`lstat()`
- **控制操作**：`ioctl()`
- **创建与删除**：`creat()`、`unlink()`
- **链接与重命名**：`link()`（硬链接）、`symlink()`（软链接）、`rename()`

---

### 四、硬链接与软链接

| 特性           | 硬链接（Hard Link）                 | 软链接（Symbolic Link）                      |
| -------------- | ----------------------------------- | -------------------------------------------- |
| 底层机制       | 额外的目录项直接指向相同 inode      | 目录项指向一个独立的文件（存储原路径字符串） |
| 支持跨文件系统 | 否                                  | 是                                           |
| 删除行为       | 删除任何链接，只要引用计数 > 0 即可 | 删除原文件后，软链成为悬挂链接（dangling）   |
| 标识显示       | `ls -i` 显示相同 inode              | `ls -l` 首字符为 `l`，内容是路径             |

---

### 五、常见文件系统简介

1. **ext4**

   - 传统、成熟，广泛使用；支持大文件与延迟分配（delayed allocation）；拥有可选的日志校验与多块分配。

2. **XFS**

   - 高性能、大文件与并发写场景优异；基于 B+ 树的空间分配与日志；在线扩展。

3. **Btrfs**

   - 下一代文件系统；内置快照、校验与自修复、子卷、在线压缩；仍在不断完善中。

---

### 六、文件权限与时间戳

1. **权限位（rwx）**

   - 权限分为属主（user）、属组（group）、其他（others）三个维度；每个维度拥有读（r）、写（w）、执行（x）三个位。
   - 可通过 `chmod` 修改，通过 `ls -l` 查看（如 `-rwxr-xr--`）。

2. **三种时间戳**

   - **mtime**（Modify Time）：文件内容最后修改时间；调用 `write()` 或者重命名等会更新。
   - **atime**（Access Time）：最后访问时间；调用 `read()`、`stat()` 等会更新（可通过挂载选项 `noatime`、`relatime` 控制）。
   - **ctime**（Change Time）：inode 元数据最后变更时间；权限修改、链接操作、truncate 等会更新。

### 八、进程地址空间布局

1. **典型的进程地址空间结构（从低地址到高地址）**

   ```
   高地址 0xFFFFFFFF ┌─────────────────┐
                    │      内核空间     │ ← 只有内核可访问
                    ├─────────────────┤
                    │       栈         │ ← 局部变量、函数参数
                    │        ↓        │   （向下增长）
                    ├─────────────────┤
                    │    内存映射区     │ ← 共享库、mmap区域
                    │  (shared libs)  │
                    ├─────────────────┤
                    │        ↑        │
                    │       堆         │ ← 动态分配内存
                    ├─────────────────┤   （向上增长）
                    │      .bss       │ ← 未初始化全局/静态变量
                    ├─────────────────┤
                    │      .data      │ ← 已初始化全局/静态变量
                    ├─────────────────┤
                    │     .rodata     │ ← 只读常量数据
                    ├─────────────────┤
                    │      .text      │ ← 程序代码
   低地址 0x00000000 └─────────────────┘
   ```

2. **ELF 节到进程段的映射关系**

   | ELF 节    | 进程段     | 权限 | 说明                         |
   | --------- | ---------- | ---- | ---------------------------- |
   | `.text`   | 代码段     | r-x  | 程序指令                     |
   | `.rodata` | 只读数据段 | r--  | 字符串常量、只读全局变量     |
   | `.data`   | 数据段     | rw-  | 已初始化的全局变量和静态变量 |
   | `.bss`    | BSS 段     | rw-  | 未初始化的全局变量和静态变量 |
   | 动态分配  | 堆段       | rw-  | malloc、new 等动态分配的内存 |
   | 函数调用  | 栈段       | rw-  | 局部变量、函数参数、返回地址 |

3. **全局变量和静态变量的存储位置**

   - **已初始化的全局变量和静态变量**：存储在 `.data` 段

     ```c
     int global_var = 42;        // 存储在.data段
     static int static_var = 10; // 存储在.data段
     ```

   - **未初始化的全局变量和静态变量**：存储在 `.bss` 段

     ```c
     int global_array[1000];          // 存储在.bss段
     static char static_buffer[512];  // 存储在.bss段
     ```

   - **局部变量**：存储在栈中

     ```c
     void func() {
         int local_var = 5;  // 存储在栈中
         char buffer[100];   // 存储在栈中
     }
     ```

   - **动态分配的变量**：存储在堆中
     ```c
     int *ptr = malloc(sizeof(int) * 100);  // 分配在堆中
     ```

### 七、ELF 文件节（Section）结构

1. **ELF 概述**

   - ELF（Executable and Linkable Format）是 Linux 下可执行文件、目标文件及共享库的标准格式。
   - 主要结构：ELF 头（Elf Header）、程序头表（Program Header Table）、节头表（Section Header Table）和各节数据。

2. **主要节（Section）**

   | 节名      | 类型             | 功能描述                                |
   | --------- | ---------------- | --------------------------------------- |
   | `.text`   | SHT_PROGBITS     | 可执行代码段                            |
   | `.data`   | SHT_PROGBITS     | 已初始化全局/静态变量数据               |
   | `.bss`    | SHT_NOBITS       | 未初始化全局/静态变量（不占文件空间）   |
   | `.rodata` | SHT_PROGBITS     | 只读常量（字符串字面量、查表数据等）    |
   | `.symtab` | SHT_SYMTAB       | 符号表，用于链接（可被 `.strtab` 辅助） |
   | `.strtab` | SHT_STRTAB       | 符号表中的字符串（符号名）              |
   | `.rela*`  | SHT_RELA/SHT_REL | 重定位信息                              |
   | `.debug*` | SHT\_\*          | 调试信息（仅在带 debug 的文件中）       |
   | `.plt`    | SHT_PROGBITS     | 过程链接表（动态链接时的跳转表）        |
   | `.got`    | SHT_PROGBITS     | 全局偏移表（动态链接时的地址表）        |
   | `.init`   | SHT_PROGBITS     | 初始化代码段                            |
   | `.fini`   | SHT_PROGBITS     | 终止代码段                              |

3. **加载与映射**

   - **Program Header** 决定哪些节被映射到进程地址空间：

     - 可执行段（`.text`, `.init`, `.fini`）映射为可读可执行页面；
     - 数据段（`.data`, `.bss`）映射为可读可写页面；
     - 只读段（`.rodata`）映射为只读页面；
     - `.bss` 在加载时分配并清零。

   - 链接器（ld）与动态链接器（ld-linux.so）处理符号解析、重定位与共享库加载。

---

---

### 七、ELF 文件节（Section）结构

1. **ELF 概述**

   - ELF（Executable and Linkable Format）是 Linux 下可执行文件、目标文件及共享库的标准格式。
   - 主要结构：ELF 头（Elf Header）、程序头表（Program Header Table）、节头表（Section Header Table）和各节数据。

2. **主要节（Section）**

   | 节名      | 类型             | 功能描述                                |
   | --------- | ---------------- | --------------------------------------- |
   | `.text`   | SHT_PROGBITS     | 可执行代码段                            |
   | `.data`   | SHT_PROGBITS     | 已初始化全局/静态变量数据               |
   | `.bss`    | SHT_NOBITS       | 未初始化全局/静态变量（不占文件空间）   |
   | `.rodata` | SHT_PROGBITS     | 只读常量（字符串字面量、查表数据等）    |
   | `.symtab` | SHT_SYMTAB       | 符号表，用于链接（可被 `.strtab` 辅助） |
   | `.strtab` | SHT_STRTAB       | 符号表中的字符串（符号名）              |
   | `.rela*`  | SHT_RELA/SHT_REL | 重定位信息                              |
   | `.debug*` | SHT\_\*          | 调试信息（仅在带 debug 的文件中）       |
   | `.plt`    | SHT_PROGBITS     | 过程链接表（动态链接时的跳转表）        |
   | `.got`    | SHT_PROGBITS     | 全局偏移表（动态链接时的地址表）        |
   | `.init`   | SHT_PROGBITS     | 初始化代码段                            |
   | `.fini`   | SHT_PROGBITS     | 终止代码段                              |

3. **加载与映射**

   - **Program Header** 决定哪些节被映射到进程地址空间：

     - 可执行段（`.text`, `.init`, `.fini`）映射为可读可执行页面；
     - 数据段（`.data`, `.bss`）映射为可读可写页面；
     - 只读段（`.rodata`）映射为只读页面；
     - `.bss` 在加载时分配并清零。

   - 链接器（ld）与动态链接器（ld-linux.so）处理符号解析、重定位与共享库加载。

---

### 八、进程地址空间布局

1. **典型的进程地址空间结构（从低地址到高地址）**

   ```
   高地址 0xFFFFFFFF ┌─────────────────┐
                    │      内核空间     │ ← 只有内核可访问
                    ├─────────────────┤
                    │       栈         │ ← 局部变量、函数参数
                    │        ↓        │   （向下增长）
                    ├─────────────────┤
                    │    内存映射区     │ ← 共享库、mmap区域
                    │  (shared libs)  │
                    ├─────────────────┤
                    │        ↑        │
                    │       堆         │ ← 动态分配内存
                    ├─────────────────┤   （向上增长）
                    │      .bss       │ ← 未初始化全局/静态变量
                    ├─────────────────┤
                    │      .data      │ ← 已初始化全局/静态变量
                    ├─────────────────┤
                    │     .rodata     │ ← 只读常量数据
                    ├─────────────────┤
                    │      .text      │ ← 程序代码
   低地址 0x00000000 └─────────────────┘
   ```

2. **ELF 节到进程段的映射关系**

   | ELF 节    | 进程段     | 权限 | 说明                         |
   | --------- | ---------- | ---- | ---------------------------- |
   | `.text`   | 代码段     | r-x  | 程序指令                     |
   | `.rodata` | 只读数据段 | r--  | 字符串常量、只读全局变量     |
   | `.data`   | 数据段     | rw-  | 已初始化的全局变量和静态变量 |
   | `.bss`    | BSS 段     | rw-  | 未初始化的全局变量和静态变量 |
   | 动态分配  | 堆段       | rw-  | malloc、new 等动态分配的内存 |
   | 函数调用  | 栈段       | rw-  | 局部变量、函数参数、返回地址 |

3. **全局变量和静态变量的存储位置**

   - **已初始化的全局变量和静态变量**：存储在 `.data` 段

     ```c
     int global_var = 42;        // 存储在.data段
     static int static_var = 10; // 存储在.data段
     ```

   - **未初始化的全局变量和静态变量**：存储在 `.bss` 段

     ```c
     int global_array[1000];          // 存储在.bss段
     static char static_buffer[512];  // 存储在.bss段
     ```

   - **局部变量**：存储在栈中

     ```c
     void func() {
         int local_var = 5;  // 存储在栈中
         char buffer[100];   // 存储在栈中
     }
     ```

   - **动态分配的变量**：存储在堆中
     ```c
     int *ptr = malloc(sizeof(int) * 100);  // 分配在堆中
     ```

---

### 九、内存管理相关概念

1. **虚拟内存与物理内存**

   - **虚拟地址空间**：每个进程都有独立的虚拟地址空间（通常 32 位系统为 4GB，64 位系统更大）
   - **物理内存**：实际的 RAM 内存
   - **内存映射单元（MMU）**：负责虚拟地址到物理地址的转换

2. **页面管理**

   - **页面大小**：通常为 4KB（x86 架构）
   - **页表**：记录虚拟页面到物理页面的映射关系
   - **页面错误（Page Fault）**：访问未映射或无权限的页面时触发

3. **内存保护机制**

   - **段保护**：不同段有不同的访问权限（读/写/执行）
   - **用户态/内核态隔离**：用户程序无法直接访问内核空间
   - **进程隔离**：进程间的虚拟地址空间相互独立

---

### 十、文件系统与进程的交互

1. **文件描述符（File Descriptor）**

   - 每个进程维护一个文件描述符表
   - 标准文件描述符：
     - 0：stdin（标准输入）
     - 1：stdout（标准输出）
     - 2：stderr（标准错误）

2. **内存映射文件（mmap）**

   ```c
   #include <sys/mman.h>

   // 将文件映射到内存
   void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);

   // 示例：映射文件到内存
   int fd = open("data.txt", O_RDONLY);
   void *mapped = mmap(NULL, file_size, PROT_READ, MAP_PRIVATE, fd, 0);
   ```

3. **共享内存**

   - 多个进程可以共享同一块内存区域
   - 通过 System V IPC 或 POSIX 共享内存实现
   - 需要同步机制（如信号量、互斥锁）来避免竞争条件

---

### 十一、实践示例

1. **查看进程内存布局**

   ```bash
   # 查看进程的内存映射
   cat /proc/[pid]/maps

   # 查看进程状态
   cat /proc/[pid]/status

   # 使用pmap命令
   pmap -x [pid]
   ```

2. **使用 readelf 查看 ELF 文件**

   ```bash
   # 查看ELF头信息
   readelf -h program

   # 查看节表
   readelf -S program

   # 查看程序头表
   readelf -l program

   # 查看符号表
   readelf -s program
   ```

3. **简单的 C 程序示例**

   ```c
   #include <stdio.h>
   #include <stdlib.h>

   // 全局变量（存储在.data段）
   int global_initialized = 100;

   // 全局变量（存储在.bss段）
   int global_uninitialized;

   // 静态变量（存储在.data段）
   static int static_var = 200;

   int main() {
       // 局部变量（存储在栈中）
       int local_var = 50;

       // 动态分配（存储在堆中）
       int *heap_var = malloc(sizeof(int));
       *heap_var = 300;

       printf("地址信息：\n");
       printf("global_initialized: %p\n", &global_initialized);
       printf("global_uninitialized: %p\n", &global_uninitialized);
       printf("static_var: %p\n", &static_var);
       printf("local_var: %p\n", &local_var);
       printf("heap_var: %p\n", heap_var);
       printf("main函数: %p\n", main);

       free(heap_var);
       return 0;
   }
   ```

---

### 十二、总结

1. **关键概念回顾**

   - **VFS**：提供统一的文件系统接口
   - **ELF 格式**：Linux 下可执行文件的标准格式
   - **进程地址空间**：代码段、数据段、堆、栈的组织结构
   - **内存管理**：虚拟内存、页面管理、内存保护

2. **重要记忆点**

   - 全局变量和静态变量根据是否初始化分别存储在`.data`段和`.bss`段
   - 局部变量存储在栈中，动态分配的内存在堆中
   - ELF 文件的节（Section）在加载时映射为进程的段（Segment）
   - 每个进程都有独立的虚拟地址空间，通过 MMU 进行地址转换

3. **进阶学习方向**

   - 深入理解虚拟内存管理机制
   - 学习不同文件系统的实现原理
   - 研究动态链接和加载过程
   - 掌握内存调试和性能优化技术

> 通过以上结构化内容，您可以全面了解 Linux 文件系统、ELF 文件格式、进程地址空间布局以及内存管理的核心概念。这些知识是理解操作系统内核工作原理的重要基础。
