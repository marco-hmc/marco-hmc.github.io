---
layout: post
title: 系统设计
categories: 程序设计
related_posts: True
tags: 系统设计
toc:
  sidebar: left
---

## 系统设计

系统设计一定是从业务出发的，将需求转换为计算机的抽象设计。

需求层次需要考虑：功能需求，以及性能需求。
计算机的抽象设计需要考虑：数据侧（数据库、文件）、交互侧（ui、前端、桌面端）、业务侧（具体功能）、技术选型

### 1. 需求考虑

- **功能需求**
  这些是最终用户明确要求的系统应提供的基本功能。例如：

  - “我们需要为这个系统设计哪些功能？”
  - “在我们的设计中需要考虑哪些边界情况？”

- **性能需求**
  这些是系统必须满足的质量约束，根据项目合同的要求。实现这些因素的优先级或程度因项目而异。它们也被称为非行为需求。例如，可移植性、可维护性、可靠性、可扩展性、安全性等。例如：

  - “这个系统需要处理的预期规模是多少？”
  - “我们的系统的读/写比是多少？”
  - “每秒需要处理多少请求？”
  - “需要多少存储空间？”
  - “负载分配如何处理？”
  - “我们应该使用缓存吗？”
  - “如何处理突发流量？”

### 2. 实现考虑

#### 2.1. 数据模型设计

一旦我们有了估算，我们可以开始定义数据库模式。在开发的早期阶段这样做有助于我们理解数据流，这是每个系统的核心。在这一步中，我们基本上定义了所有的实体及其之间的关系。

- “系统中有哪些不同的实体？”
- “这些实体之间的关系是什么？”
- “我们需要多少张表？”
- “在这里使用 NoSQL 是否更好？”

#### 2.2 交互设计

#### 2.3 业务设计

现在我们已经建立了数据模型和 API 设计，是时候确定解决问题所需的系统组件（如负载均衡器、API 网关等），并草拟系统的初步设计。

- “设计单体架构还是微服务架构更好？”
- “我们应该使用哪种类型的数据库？”

一旦我们有了基本的设计框架结构，就可以进一步细分模块，或者说系统主要组件的功能。

### 3. 技术选型

### 4. 思考层面

简易版本的则会强调4个S。即以下四个关键要素：

1. **场景（Scenario）**

   - 明确系统的 QPS（每秒请求数，特别是峰值时间的请求数）。这与我们设计的系统规模和架构密切相关。如果请求频率非常低，一个 Web 服务器可能就足够了；如果请求频率很高，则需要构建一个 Web 服务器集群，并且需要考虑部分服务器宕机时如何保持系统的可靠性。

2. **服务（Service）**

   - 根据任务需求，细分主要功能模块。明确每个模块的职责和边界，以便于系统的开发、维护和扩展。

3. **存储（Storage）**

   - 选择合适的存储结构和数据库。根据数据的特性和访问模式，选择关系型数据库、NoSQL 数据库或其他存储解决方案，以满足系统的性能和扩展需求。

4. **扩展性（Scale）**
   - 从优化的角度出发，添加新的功能以提升系统性能。
   - 从维护的角度出发，确保系统能够应对更大的流量和容灾需求。常见的扩展性措施包括：
     - **缓存（Cache）**：使用缓存技术减少数据库访问次数，提高系统响应速度。
     - **消息队列（Kafka 等）**：使用消息队列实现异步处理，提升系统的吞吐量和可靠性。
     - **负载均衡（Load Balancing）**：使用负载均衡技术分发请求，确保系统的高可用性和稳定性。

### 3. 客户端的架构设计

#### 3.1 广义客户端概念

**广义客户端**的概念包括多个端，如 Web 端、桌面端、移动端，实际上这些端都可以使用各种架构模式（如 MVC、MVVM、微服务等），但是每个平台的架构实现和框架支持有所不同。

架构模式的选择受限于**客户端程序框架的支持**。桌面端的框架相对稳定，但更新不够频繁，因此许多传统的架构模式（如 MVC）仍然占主导地位。而 Web 端和移动端的框架和技术栈的更新非常快，支持更多现代的架构模式。

- **桌面端的停滞和 MVC 主导**

  - 过去几年，桌面端应用的开发相对较为**停滞**，尤其是传统桌面应用（如基于 WinForms、WPF 等技术的应用）。这些平台大多以**MVC**或**MVVM**为主的设计模式，且大多数桌面开发框架的更新不如 Web 和移动端活跃。
  - 桌面端的开发框架（如 WPF、WinForms、Qt、Electron 等）确实仍然偏向于较为传统的架构模式，如 MVC 或 MVVM，尽管这些框架也有一些现代化的支持，但相较于 Web 端和移动端，它们的创新和更新的速度较慢。
  - 对于一些新兴桌面应用开发框架，如**Electron**（跨平台框架），它虽然支持现代化的架构设计（如 MVVM 等），但仍然需要进行一定的封装和适配，才能更好地支持现代前端架构（如 React、Vue 等框架）。
  - 对于桌面端而言，虽然框架更新缓慢，但开发者通常可以通过**封装和调整**现有的框架来支持现代的架构模式。例如，在桌面应用中使用类似于 React/Vue 的框架进行组件化开发，或者借助如 Electron 等跨平台框架来实现现代 Web 技术的支持。
  - **桌面端**的架构相对较为传统，主要依赖 MVC 等经典模式，且更新速度较慢，尽管可以通过封装进行现代化改进，但相对复杂。

- **Web 端和移动端的快速发展**
  - **Web 端**的技术和架构支持非常丰富，且发展迅速。从前端框架的支持（如 React、Vue、Angular 等）到后端架构（如微服务、GraphQL 等），都为 Web 应用提供了高度的灵活性和扩展性。
  - 在 Web 端，开发者可以选择更多适合特定应用需求的架构模式和工具。例如，Web 端的前后端分离、微前端架构等都在流行
  - 现代 Web 开发不仅支持传统的 MVC 架构，也提供了更复杂的架构模式，如**MVVM**、**Flux/Redux**等，甚至是更高级的组件化架构。由于 Web 应用的浏览器环境和网络特性，Web 端开发框架可以更方便地集成现代架构模式。
  - **移动端**（iOS、Android）的发展同样迅速。iOS（如 SwiftUI）和 Android（如 Jetpack Compose）已经提供了更为现代的架构支持（例如 MVVM、MVI、Redux 等），并且开发者可以灵活地选择符合需求的架构。
  - 移动端的更新频繁，许多框架和库的快速迭代，使得这些平台能够灵活地采用各种现代架构，支持更高效的开发和维护。
  - 移动端则有更多适合响应式和模块化开发的架构支持（如 MVVM、MVP 等）。
  - 对于 Web 端和移动端，由于这些平台本身就支持更多现代化的架构和框架，因此开发者不需要进行过多的封装，可以直接采用最新的技术栈和架构设计。
  - **Web 端和移动端**的架构和框架发展迅速，支持的架构模式更多、更灵活，可以较为容易地采用更现代化的架构模式（如 MVVM、微服务、组件化、Flux 等）。

#### 3.2 基本概念

![alt text](imgs/client_arch_patterns.png)

不管客户端的架构怎么确定，本质上都是为了解耦数据、ui、和业务三个部分。其中数据部分一般被抽象成为 model 模块，ui 部分被抽象成为 view 模块。

而数据变化了如何更新到显示上，如何从显示上获取数据等等业务逻辑层面上，则被抽象为 model 和 view 模块的交互方式。这个交互方式可能是以 controller 的模式，或者 presenter 的模式，各有各的好处，需要结合业务场景具体选择。

因此可以说，客户端的各种架构设计都是下面这种方式的变化。

- model - 数据
- view - ui/显示
- interaction - 业务
  相对而言 model 和 view 层的变化都比较少，集中讨论和设计的主要以 interaction 方式为主，比如 controller 和 presenter 方式等等。
  其好处在于：
  1. **分离关注点**：MVC 模式将数据、业务逻辑和用户界面分离开来，提高了代码的可维护性和可扩展性。
  2. **可测试性**：由于模型、视图和控制器是独立的组件，可以分别进行单元测试。
  3. **复用性**：视图和模型可以独立复用，视图可以用于不同的模型，模型也可以用于不同的视图。
  4. **实现解耦**：如分离关注点，提升可维护性，提升扩展性，提上可测试性等等。

##### 3.2.1 模型

Model 掌管数据源，是应用程序的核心部分，负责处理应用程序的数据逻辑。Model 直接管理数据、逻辑和规则。它有对数据直接访问的权力，通常与数据库交互，执行数据的创建、读取、更新和删除（CRUD）操作。

- **职责**

  - **数据管理**：处理和管理数据。
  - **业务逻辑**：执行业务逻辑。
  - **数据交互**：与数据库或其他数据源交互。
  - **封装数据**：用于封装与应用程序的业务逻辑相关的数据以及对数据的处理方法。

- **数据**
  较现代的 Framework 都会建议使用独立的数据对象（DTO，POCO，POJO 等）来替代弱类型的集合对象。数据访问的代码会使用 Data Access 的代码或是 ORM-based Framework，也可以进一步使用 Repository Pattern 与 Unit of Works Pattern 来切割数据源的相依性。

- **monitor 机制**
  Model 中数据的变化一般会通过一种 monitor 机制被公布。为了实现这种机制，那些用于监视此 Model 的 View 必须事先在此 Model 上注册，从而，View 可以了解在数据 Model 上发生的改变。

##### 3.2.2 视图

View 负责显示数据并与用户交互。视图从模型中获取数据，并将其呈现给用户。视图不包含任何业务逻辑，只负责数据的展示。

- **职责**
  - **数据显示**：负责显示数据。
  - **用户交互**：提供用户交互界面。
  - 显示数据。
  - 提供用户交互界面。
    View 负责数据显示的职责分离原则，

* View 负责显示数据，这个部分多为前端应用，而 Controller 会有一个机制将处理的结果 (可能是 Model，集合或是状态等) 交给 View，然后由 View 来决定怎么显示。
  例如 Spring Framework 使用 JSP 或相应技术，ASP.NET MVC 则使用 Razor 处理数据的显示。
  视图是用户界面部分，负责显示数据。视图从模型中获取数据，并将其呈现给用户。视图不包含任何业务逻辑，只负责数据的展示。

能够实现数据有目的的显示(理论上,这不是必需的)。在 View 中一般没有程序上的逻辑。为了实现 View 上的刷新功能，View 需要访问它监视的数据模型(Model)，因此应该事先在被它监视的数据那里注册。

#### 3.3 常见客户端架构

##### 3.3.1 mvc 架构

- **定义**
  MVC（Model-View-Controller）是一种软件架构模式，用于分离应用程序的不同关注点。它将应用程序分为三个主要部分：模型（Model）、视图（View）和控制器（Controller）。这种分离有助于提高代码的可维护性和可扩展性。

  MVC 架构是一种将应用程序分为模型、视图和控制器三部分的架构模式。它通过分离关注点，提高了代码的可维护性和可扩展性。尽管 MVC 模式可能会引入一定的复杂性，但它在大型应用程序中具有显著的优势。

  - MVC 是最古老的模式，已有近 50 年的历史
  - 每种模式都有一个负责显示内容和接收用户输入的 "视图" (V)
  - 大多数模式包括一个管理业务数据的 "模型" (M)
  - "控制器"、"展示器" 和 "视图模型" 是在视图和模型（在 VIPER 模式中称为 "实体"）之间进行翻译的中介

- **控制器（Controller）**
  Controller 负责处理用户输入，并将其转换为对模型的操作。它充当视图和模型之间的中介，处理用户输入并更新模型或视图。
  控制器起到不同层面间的组织作用，用于控制应用程序的流程。它处理事件并作出响应。"事件"包括用户的行为和数据 Model 上的改变。

  - **职责**
    - **用户输入处理**：处理用户输入。
    - **模型操作**：调用模型更新数据。
    - **视图选择**：选择视图来显示数据。
    - 处理用户输入。
    - 调用模型更新数据。
    - 选择视图来显示数据。

  * Controller 负责处理消息,较高端的 Framework 会有一个默认的实现来作为 Controller 的基础,例如 Spring 的 DispatcherServlet 或是 ASP.NET MVC 的 Controller 等,在职责分离原则的基础上,每个 Controller 负责的部分不同,因此会将各个 Controller 切割成不同的文件以利维护.
    控制器是应用程序的中介部分，负责处理用户输入。控制器从视图接收输入，处理这些输入并更新模型或视图。控制器将用户的动作转换为对模型的操作，并决定哪个视图来显示数据。
    起到不同层面间的组织作用,用于控制应用程序的流程.它处理事件并作出响应."事件"包括用户的行为和数据 Model 上的改变.

- **MVC 工作流程**

  1. 用户通过视图与应用程序交互（例如，点击按钮、输入数据）。
  2. 控制器接收用户输入，并将其转换为对模型的操作。
  3. 模型处理控制器的请求，更新数据或执行业务逻辑。
  4. 模型更新数据后，通知视图数据已更新/将更新后的数据返回给控制器。
  5. 视图获取最新数据，并将其呈现给用户。

  "Model"不依赖"View"和"Controller"，也就是说，Model 不关心它会被如何显示或是如何被操作。

##### 3.3.2 MVP 架构

- **定义**
  MVP（Model-View-Presenter）是一种软件架构模式，是对 MVC 模式的改进，旨在解决 MVC 中控制器与视图耦合过紧的问题。MVP 模式将应用程序分为三个主要部分：模型（Model）、视图（View）和展示器（Presenter）。这种分离有助于提高代码的可维护性和可扩展性。

- **展示器（Presenter）**：

  - **职责**：展示器负责处理用户输入，并将其转换为对模型的操作。它充当视图和模型之间的中介，处理业务逻辑并更新视图。
  - **示例**：在一个电商应用中，展示器可能包括处理用户添加商品到购物车、提交订单等操作。

- **工作原理**
  MVP 模式的工作原理如下：

  1. 用户通过视图与应用程序交互，触发某个事件（例如点击按钮）。
  2. 视图将用户输入传递给展示器。
  3. 展示器接收用户输入，并将其转换为对模型的操作。
  4. 模型处理展示器的请求，更新数据或执行业务逻辑。
  5. 模型将更新后的数据返回给展示器。
  6. 展示器将数据传递给视图，视图更新显示内容。

##### 3.3.3 mvvm 架构

- **定义**
  MVVM（Model-View-ViewModel）是一种软件架构模式，特别适用于双向数据绑定的框架。MVVM 模式将应用程序分为三个主要部分：模型（Model）、视图（View）和视图模型（ViewModel）。这种分离有助于提高代码的可维护性和可扩展性，并简化了视图和模型之间的数据绑定。

- **视图模型（ViewModel）**：

  - **职责**：视图模型负责处理用户输入，并将其转换为对模型的操作。它充当视图和模型之间的中介，处理业务逻辑并更新视图。视图模型通过数据绑定与视图进行通信。
  - **示例**：在一个电商应用中，视图模型可能包括处理用户添加商品到购物车、提交订单等操作。

- **工作原理**
  MVVM 模式的工作原理如下：

  1. 用户通过视图与应用程序交互，触发某个事件（例如点击按钮）。
  2. 视图将用户输入传递给视图模型。
  3. 视图模型接收用户输入，并将其转换为对模型的操作。
  4. 模型处理视图模型的请求，更新数据或执行业务逻辑。
  5. 模型将更新后的数据返回给视图模型。
  6. 视图模型将数据传递给视图，视图通过数据绑定自动更新显示内容。

##### 3.3.4 mvvm-c 架构

- **定义**
  MVVM-C（Model-View-ViewModel-Coordinator）是一种软件架构模式，是对 MVVM 模式的扩展。它引入了协调器（Coordinator）来管理视图之间的导航和流程控制。MVVM-C 模式将应用程序分为四个主要部分：模型（Model）、视图（View）、视图模型（ViewModel）和协调器（Coordinator）。这种分离有助于提高代码的可维护性和可扩展性，并简化了视图和模型之间的数据绑定和导航逻辑。

- **视图模型（ViewModel）**：

  - **职责**：视图模型负责处理用户输入，并将其转换为对模型的操作。它充当视图和模型之间的中介，处理业务逻辑并更新视图。视图模型通过数据绑定与视图进行通信。
  - **示例**：在一个电商应用中，视图模型可能包括处理用户添加商品到购物车、提交订单等操作。

- **协调器（Coordinator）**：

  - **职责**：协调器负责管理视图之间的导航和流程控制。它处理视图之间的切换和传递数据。
  - **示例**：在一个电商应用中，协调器可能包括处理从商品列表页面到商品详情页面的导航，以及在不同视图之间传递数据。

- **工作原理**
  MVVM-C 模式的工作原理如下：

  1. 用户通过视图与应用程序交互，触发某个事件（例如点击按钮）。
  2. 视图将用户输入传递给视图模型。
  3. 视图模型接收用户输入，并将其转换为对模型的操作。
  4. 模型处理视图模型的请求，更新数据或执行业务逻辑。
  5. 模型将更新后的数据返回给视图模型。
  6. 视图模型将数据传递给视图，视图通过数据绑定自动更新显示内容。
  7. 协调器管理视图之间的导航和流程控制，处理视图之间的切换和数据传递。

  视图模型通过数据绑定与视图进行通信，协调器负责管理视图之间的导航和流程控制。

##### 3.3.5 viper 架构

- **定义**
  VIPER（View-Interactor-Presenter-Entity-Router）是一种软件架构模式，旨在实现高度解耦和可测试的代码。VIPER 模式将应用程序分为五个主要部分：视图（View）、交互器（Interactor）、展示器（Presenter）、实体（Entity）和路由器（Router）。这种分离有助于提高代码的可维护性和可扩展性，并简化了视图和模型之间的数据绑定和导航逻辑。

- **组成部分**

  1. **视图（View）**：

  - **职责**：视图负责显示数据并与用户交互。它从展示器中获取数据，并将用户的输入传递给展示器。
  - **示例**：在一个电商应用中，视图可能包括商品列表页面、购物车页面和订单详情页面。

  2. **交互器（Interactor）**：

  - **职责**：交互器负责处理业务逻辑和数据操作。它从展示器接收请求，操作实体并返回结果。
  - **示例**：在一个电商应用中，交互器可能包括处理用户添加商品到购物车、提交订单等操作。

  3. **展示器（Presenter）**：

  - **职责**：展示器负责处理用户输入，并将其转换为对交互器的操作。它充当视图和交互器之间的中介，处理业务逻辑并更新视图。
  - **示例**：在一个电商应用中，展示器可能包括处理用户添加商品到购物车、提交订单等操作。

  4. **实体（Entity）**：

  - **职责**：实体表示业务数据和模型。它们通常是简单的数据结构，用于存储和传输数据。
  - **示例**：在一个电商应用中，实体可能包括用户、商品和订单等数据结构。

  5. **路由器（Router）**：

  - **职责**：路由器负责管理视图之间的导航和流程控制。它处理视图之间的切换和传递数据。
  - **示例**：在一个电商应用中，路由器可能包括处理从商品列表页面到商品详情页面的导航，以及在不同视图之间传递数据。

- **工作原理**
  VIPER 模式的工作原理如下：

  1. 用户通过视图与应用程序交互，触发某个事件（例如点击按钮）。
  2. 视图将用户输入传递给展示器。
  3. 展示器接收用户输入，并将其转换为对交互器的操作。
  4. 交互器处理展示器的请求，操作实体并返回结果。
  5. 展示器将结果传递给视图，视图更新显示内容。
  6. 路由器管理视图之间的导航和流程控制，处理视图之间的切换和数据传递。

  通过这个示例，可以看到 VIPER 模式如何将应用程序分为视图、交互器、展示器、实体和路由器五部分，从而提高代码的可维护性和可扩展性。视图和展示器通过接口进行通信，交互器处理业务逻辑，路由器负责管理视图之间的导航和流程控制。
