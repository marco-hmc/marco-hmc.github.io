---
layout: page
title: 计算机网络
description: 计算机网络和网络编程应用
img: assets/img/6.jpg
importance: 1
category: Tutorial
---

## 计算机网络

关于计算机网络和网络编程的笔记与练习：从物理层到应用层的协议梳理，socket 编程与 I/O 复用（select/poll/epoll）的渐进式案例，以及数据库、游戏服务器等上层应用主题。

### 1. 目录结构

| 目录                                       | 内容                                                                                                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/1_计算机网络`](docs/1_计算机网络)   | 网络协议分层笔记：物理层、链路层、网络层、传输层（TCP/UDP）、应用层（DNS、HTTP/HTTPS、身份认证、API），以及网络安全                                                                      |
| [`docs/2_socket`](docs/2_socket)           | socket 编程笔记：socket 基础、`select`/`poll`/`epoll` 三种 I/O 复用、网络事件处理模式、连接池、服务器优化与缓存，附网络面试题                                                            |
| [`docs/3_数据库`](docs/3_数据库)           | 数据库笔记与 MySQL 练习                                                                                                                                                                  |
| [`docs/4_gameServers`](docs/4_gameServers) | 游戏服务器（规划中）                                                                                                                                                                     |
| [`app/`](app)                              | 五个渐进式案例：`case1_socket_tcp` → `case2_socket_udp` → `case3_select` → `case4_poll` → `case5_epoll`，每个案例含 client/server 两端可运行代码；另附《Linux 高性能服务器编程》参考源码 |
| [`lib/`](lib)                              | 可复用组件：`Socket`（socket 封装）与 `Connector`（基于 select 的连接器），带测试                                                                                                        |
| [`utils/`](utils)                          | 公共工具                                                                                                                                                                                 |

### 2. 学习路径

1. **协议基础**：从 [`docs/1_计算机网络/0_networks.md`](docs/1_计算机网络/0_networks.md) 开始，按层次顺序阅读
2. **socket 入门**：阅读 [`docs/2_socket/1_socket.md`](docs/2_socket/1_socket.md)，跑通 `app/case1_socket_tcp` 的 TCP 回声服务器
3. **I/O 复用**：依次对照 `2.1_select`、`2.2_poll`、`2.3_epoll` 三篇笔记，运行 `case3` ~ `case5` 对应案例，对比三种方案的接口与性能差异
4. **进阶主题**：网络事件处理模式（Reactor/Proactor）、连接池、服务器优化

[Github Repo Link](https://github.com/marco-hmc/handbook_internet_programming)

wip

---

## 版权与许可

本项目采用 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hans) 许可协议授权，完整条款见本目录下的 [LICENSE](LICENSE) 文件。

- **BY（署名）**：使用、分享、演绎时必须保留原作者署名，并注明原始许可协议。
- **NC（非商业性使用）**：不得将本材料用于商业目的。
