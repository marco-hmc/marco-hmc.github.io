// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "A growing collection of my cool projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "Just something about me.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-三-内核那些事儿-cpu中断和信号",
        
          title: "（三）内核那些事儿：CPU中断和信号",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/signal/";
          
        },
      },{id: "post-二-内核那些事儿-程序启动到运行的完整过程",
        
          title: "（二）内核那些事儿：程序启动到运行的完整过程",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/program/";
          
        },
      },{id: "post-一-内核那些事儿-从硬件抽象到系统服务的完整框架",
        
          title: "（一）内核那些事儿：从硬件抽象到系统服务的完整框架",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/os/";
          
        },
      },{id: "post-七-内核那些事儿-操作系统对网络包的处理",
        
          title: "（七）内核那些事儿：操作系统对网络包的处理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/internet/";
          
        },
      },{id: "post-五-内核那些事儿-系统和程序的交互",
        
          title: "（五）内核那些事儿：系统和程序的交互",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/interaction/";
          
        },
      },{id: "post-六-内核那些事儿-文件系统",
        
          title: "（六）内核那些事儿：文件系统",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/fileSystem/";
          
        },
      },{id: "post-四-内核那些事儿-设备管理与驱动开发",
        
          title: "（四）内核那些事儿：设备管理与驱动开发",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/device/";
          
        },
      },{id: "post-一-汇编-汇编基础",
        
          title: "（一）汇编：汇编基础",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/assembly/";
          
        },
      },{id: "post-二-汇编-c-函数调用方式与栈原理",
        
          title: "（二）汇编：C 函数调用方式与栈原理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/asm_func/";
          
        },
      },{id: "post-五-qt-那些事儿-qt的核心机制-控件管理机制",
        
          title: "（五）Qt 那些事儿：Qt的核心机制-控件管理机制",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/widgetMechanisim/";
          
        },
      },{id: "post-七-qt-那些事儿-资源管理",
        
          title: "（七）Qt 那些事儿：资源管理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/resources/";
          
        },
      },{id: "post-一-qt-那些事儿-关于qt",
        
          title: "（一）Qt 那些事儿：关于Qt",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/qt_introduction/";
          
        },
      },{id: "post-三-qt-那些事儿-gui-编程",
        
          title: "（三）Qt 那些事儿：GUI 编程",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/qt_gui/";
          
        },
      },{id: "post-二-qt-那些事儿-事件循环机制",
        
          title: "（二）Qt 那些事儿：事件循环机制",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/qt_event/";
          
        },
      },{id: "post-qtothers",
        
          title: "Qtothers",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/qtOthers/";
          
        },
      },{id: "post-六-qt-那些事儿-qt的核心机制-其他机制",
        
          title: "（六）Qt 那些事儿：Qt的核心机制-其他机制",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/othersMechanism/";
          
        },
      },{id: "post-四-qt-那些事儿-qt的核心机制-moc-机制",
        
          title: "（四）Qt 那些事儿：Qt的核心机制-MOC 机制",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/mocMechanism/";
          
        },
      },{id: "post-一-程序设计那些事儿-什么是程序设计",
        
          title: "（一）程序设计那些事儿：什么是程序设计？",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/design/";
          
        },
      },{id: "post-二-编译那些事儿-编译器优化",
        
          title: "（二）编译那些事儿：编译器优化",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/compile_optimize/";
          
        },
      },{id: "post-一-编译那些事儿-编译过程与原理",
        
          title: "（一）编译那些事儿：编译过程与原理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/compile/";
          
        },
      },{id: "post-三-编译那些事儿-编译-c",
        
          title: "（三）编译那些事儿：编译 c++",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/c_compile/";
          
        },
      },{id: "post-二-程序设计那些事儿-经典设计模式",
        
          title: "（二）程序设计那些事儿：经典设计模式",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/designPattern/";
          
        },
      },{id: "post-五-内存那些事儿-内存高级功能与优化",
        
          title: "（五）内存那些事儿：内存高级功能与优化",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/%E5%86%85%E5%AD%98%E9%AB%98%E7%BA%A7%E5%8A%9F%E8%83%BD%E4%B8%8E%E4%BC%98%E5%8C%96/";
          
        },
      },{id: "post-二-内存那些事儿-内存的装入和链接",
        
          title: "（二）内存那些事儿：内存的装入和链接",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/%E5%86%85%E5%AD%98%E9%93%BE%E6%8E%A5%E4%B8%8E%E5%86%85%E5%AD%98%E8%A3%85%E5%85%A5/";
          
        },
      },{id: "post-一-内存那些事儿-内存运行的基本原理",
        
          title: "（一）内存那些事儿：内存运行的基本原理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/%E5%86%85%E5%AD%98%E8%BF%90%E8%A1%8C/";
          
        },
      },{id: "post-三-内存那些事儿-内存分配管理",
        
          title: "（三）内存那些事儿：内存分配管理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/%E5%86%85%E5%AD%98%E5%88%86%E9%85%8D%E4%B8%8E%E7%AE%A1%E7%90%86/";
          
        },
      },{id: "post-四-内存那些事儿-内存交换和虚拟内存",
        
          title: "（四）内存那些事儿：内存交换和虚拟内存",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/%E5%86%85%E5%AD%98%E4%BA%A4%E6%8D%A2%E4%B8%8E%E8%99%9A%E6%8B%9F%E5%86%85%E5%AD%98/";
          
        },
      },{id: "post-六-模板那些事儿-类型擦除",
        
          title: "（六）模板那些事儿：类型擦除",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/template_typeErasure/";
          
        },
      },{id: "post-二-模板那些事儿-模板元",
        
          title: "（二）模板那些事儿：模板元",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/template_mtp/";
          
        },
      },{id: "post-一-模板那些事儿-是什么",
        
          title: "（一）模板那些事儿：是什么？",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/template_introduction/";
          
        },
      },{id: "post-三-模板那些事儿-模板与继承",
        
          title: "（三）模板那些事儿：模板与继承",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/template_inherit/";
          
        },
      },{id: "post-五-模板那些事儿-表达式模板",
        
          title: "（五）模板那些事儿：表达式模板",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/template_expressTpl/";
          
        },
      },{id: "post-四-模板那些事儿-不定长参数",
        
          title: "（四）模板那些事儿：不定长参数",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/template_ellipsis/";
          
        },
      },{id: "post-七-模板那些事儿-编译器差异",
        
          title: "（七）模板那些事儿：编译器差异",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/template_compiler_diff/";
          
        },
      },{id: "post-二-函数式那些事儿-lambda-演算",
        
          title: "（二）函数式那些事儿：Lambda 演算",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/lambda_calculus/";
          
        },
      },{id: "post-一-函数式那些事儿-什么是函数式",
        
          title: "（一）函数式那些事儿：什么是函数式？",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/functionalProgamming/";
          
        },
      },{id: "post-引用那些事儿",
        
          title: "引用那些事儿",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/reference/";
          
        },
      },{id: "post-指针那些事儿",
        
          title: "指针那些事儿",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/pointer/";
          
        },
      },{id: "post-c-错误码与异常处理完全指南",
        
          title: "C++错误码与异常处理完全指南",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/exceptionAndFaultCode/";
          
        },
      },{id: "post-迈向-c-语言律师之路",
        
          title: "迈向 C++ 语言律师之路",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/cppQuiz/";
          
        },
      },{id: "post-二进制兼容和-abi-兼容",
        
          title: "二进制兼容和 ABI 兼容",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/binaryCompatbility/";
          
        },
      },{id: "post-二-c-对象内存模型那些事儿-类的继承和多态",
        
          title: "（二）C++对象内存模型那些事儿：类的继承和多态",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/cppVirtual/";
          
        },
      },{id: "post-一-c-对象内存模型那些事儿-基本概念",
        
          title: "（一）C++对象内存模型那些事儿：基本概念",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/cppMemModel/";
          
        },
      },{id: "post-三-c-对象内存模型那些事儿-特殊成员函数",
        
          title: "（三）C++对象内存模型那些事儿：特殊成员函数",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/cppMemFunc/";
          
        },
      },{id: "post-四-c-对象内存模型详解-数据内存布局",
        
          title: "（四）C++对象内存模型详解：数据内存布局",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/cppData/";
          
        },
      },{id: "post-三-计算机组成那些事儿-总线系统",
        
          title: "（三）计算机组成那些事儿：总线系统",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/%E6%80%BB%E7%BA%BF/";
          
        },
      },{id: "post-二-计算机组成那些事儿-io系统",
        
          title: "（二）计算机组成那些事儿：IO系统",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/io/";
          
        },
      },{id: "post-一-计算机组成那些事儿-cpu",
        
          title: "（一）计算机组成那些事儿：CPU",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/cpu/";
          
        },
      },{id: "projects-parallel-programming",
          title: 'parallel-programming',
          description: "Threads, processes, coroutines and more...",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Codebase/parallel-programing/";
            },},{id: "projects-rtti-libs",
          title: 'rtti-libs',
          description: "Rtti impl and benchmark",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Codebase/rtti-lib/";
            },},{id: "projects-rtti-libs",
          title: 'rtti-libs',
          description: "A tiny memory pool system implementation",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Codebase/tiny-mps/";
            },},{id: "projects-rtti-libs",
          title: 'rtti-libs',
          description: "A tiny std library implementation",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Codebase/tiny-std/";
            },},{id: "projects-gallery",
          title: 'Gallery',
          description: "Updating from to to time...",
          section: "Projects",handler: () => {
              window.location.href = "/projects/Gallery/images/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6D%61%72%63%6F.%68%6D%63%68%75%6E@%67%6D%61%69%6C.%63%6F%6D", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
