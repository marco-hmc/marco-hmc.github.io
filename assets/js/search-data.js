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
        },{id: "post-七-内核那些事儿-操作系统对网络包的处理",
        
          title: "（七）内核那些事儿：操作系统对网络包的处理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/6_internet.md/";
          
        },
      },{id: "post-六-内核那些事儿-文件系统",
        
          title: "（六）内核那些事儿：文件系统",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/5_fileSystem.md/";
          
        },
      },{id: "post-五-内核那些事儿-系统和程序的交互",
        
          title: "（五）内核那些事儿：系统和程序的交互",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/4_interaction.md/";
          
        },
      },{id: "post-四-内核那些事儿-设备管理与驱动开发",
        
          title: "（四）内核那些事儿：设备管理与驱动开发",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_device.md/";
          
        },
      },{id: "post-三-内核那些事儿-cpu中断和信号",
        
          title: "（三）内核那些事儿：CPU中断和信号",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_signal.md/";
          
        },
      },{id: "post-二-内核那些事儿-程序启动到运行的完整过程",
        
          title: "（二）内核那些事儿：程序启动到运行的完整过程",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_program.md/";
          
        },
      },{id: "post-操作系统知识体系-从硬件抽象到系统服务的完整框架",
        
          title: "操作系统知识体系：从硬件抽象到系统服务的完整框架",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_os.md/";
          
        },
      },{id: "post-二-汇编-c-函数调用方式与栈原理",
        
          title: "（二）汇编：C 函数调用方式与栈原理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_asm_func.md/";
          
        },
      },{id: "post-一-汇编-汇编基础",
        
          title: "（一）汇编：汇编基础",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_assembly.md/";
          
        },
      },{id: "post-五-qt-那些事儿-资源管理",
        
          title: "（五）Qt 那些事儿：资源管理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/5_resources.md/";
          
        },
      },{id: "post-四-qt-那些事儿-gui-编程",
        
          title: "（四）Qt 那些事儿：GUI 编程",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/4_qt_gui.md/";
          
        },
      },{id: "post-三-qt-那些事儿-qt的核心机制",
        
          title: "（三）Qt 那些事儿：Qt的核心机制",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_qt_mechanisim.md/";
          
        },
      },{id: "post-二-qt-那些事儿-事件循环机制",
        
          title: "（二）Qt 那些事儿：事件循环机制",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_qt_event.md/";
          
        },
      },{id: "post-一-qt-那些事儿-关于qt",
        
          title: "（一）Qt 那些事儿：关于Qt",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_qt_introduction.md/";
          
        },
      },{id: "post-0-designpattern-md",
        
          title: "0_designpattern.md",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_designPattern.md/";
          
        },
      },{id: "post-五-内存那些事儿-内存高级功能与优化",
        
          title: "（五）内存那些事儿：内存高级功能与优化",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/4_%E5%86%85%E5%AD%98%E9%AB%98%E7%BA%A7%E5%8A%9F%E8%83%BD%E4%B8%8E%E4%BC%98%E5%8C%96.md/";
          
        },
      },{id: "post-四-内存那些事儿-内存交换和虚拟内存",
        
          title: "（四）内存那些事儿：内存交换和虚拟内存",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_%E5%86%85%E5%AD%98%E4%BA%A4%E6%8D%A2%E4%B8%8E%E8%99%9A%E6%8B%9F%E5%86%85%E5%AD%98.md/";
          
        },
      },{id: "post-三-内存那些事儿-内存分配管理",
        
          title: "（三）内存那些事儿：内存分配管理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_%E5%86%85%E5%AD%98%E5%88%86%E9%85%8D%E4%B8%8E%E7%AE%A1%E7%90%86.md/";
          
        },
      },{id: "post-二-内存那些事儿-内存的装入和链接",
        
          title: "（二）内存那些事儿：内存的装入和链接",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_%E5%86%85%E5%AD%98%E9%93%BE%E6%8E%A5%E4%B8%8E%E5%86%85%E5%AD%98%E8%A3%85%E5%85%A5.md/";
          
        },
      },{id: "post-一-内存那些事儿-内存运行的基本原理",
        
          title: "（一）内存那些事儿：内存运行的基本原理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_%E5%86%85%E5%AD%98%E8%BF%90%E8%A1%8C.md/";
          
        },
      },{id: "post-六-模板那些事儿-类型擦除",
        
          title: "（六）模板那些事儿：类型擦除",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/5_template_typeErasure.md/";
          
        },
      },{id: "post-五-模板那些事儿-表达式模板",
        
          title: "（五）模板那些事儿：表达式模板",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/4_template_expressTpl.md/";
          
        },
      },{id: "post-四-模板那些事儿-不定长参数",
        
          title: "（四）模板那些事儿：不定长参数",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_template_ellipsis.md/";
          
        },
      },{id: "post-三-模板那些事儿-模板与继承",
        
          title: "（三）模板那些事儿：模板与继承",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_template_inherit.md/";
          
        },
      },{id: "post-二-模板那些事儿-模板元",
        
          title: "（二）模板那些事儿：模板元",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_template_mtp.md/";
          
        },
      },{id: "post-一-模板那些事儿-是什么",
        
          title: "（一）模板那些事儿：是什么？",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_template_introduction.md/";
          
        },
      },{id: "post-二-函数式那些事儿-lambda-演算",
        
          title: "（二）函数式那些事儿：Lambda 演算",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_lambda_calculus.md/";
          
        },
      },{id: "post-一-函数式那些事儿-什么是函数式",
        
          title: "（一）函数式那些事儿：什么是函数式？",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_functionalProgamming.md/";
          
        },
      },{id: "post-引用那些事儿",
        
          title: "引用那些事儿",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_reference.md/";
          
        },
      },{id: "post-指针那些事儿",
        
          title: "指针那些事儿",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_pointer.md/";
          
        },
      },{id: "post-c-的崩溃与core-dump调试指南",
        
          title: "C++的崩溃与Core Dump调试指南",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_coredump.md/";
          
        },
      },{id: "post-c-错误码与异常处理完全指南",
        
          title: "C++错误码与异常处理完全指南",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_exceptionAndFaultCode.md/";
          
        },
      },{id: "post-二进制兼容和-abi-兼容",
        
          title: "二进制兼容和 ABI 兼容",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_binaryCompatbility.md/";
          
        },
      },{id: "post-迈向-c-语言律师之路",
        
          title: "迈向 C++ 语言律师之路",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_cppQuiz.md/";
          
        },
      },{id: "post-四-c-对象内存模型详解-数据内存布局",
        
          title: "（四）C++对象内存模型详解：数据内存布局",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_cppData.md/";
          
        },
      },{id: "post-三-c-对象内存模型那些事儿-特殊成员函数",
        
          title: "（三）C++对象内存模型那些事儿：特殊成员函数",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_cppMemFunc.md/";
          
        },
      },{id: "post-二-c-对象内存模型那些事儿-类的继承和多态",
        
          title: "（二）C++对象内存模型那些事儿：类的继承和多态",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_cppVirtual.md/";
          
        },
      },{id: "post-一-c-对象内存模型那些事儿-基本概念",
        
          title: "（一）C++对象内存模型那些事儿：基本概念",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_cppMemModel.md/";
          
        },
      },{id: "projects-2025-annual-plan",
          title: '2025 Annual Plan',
          description: "Updating from to to time...",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2025_annual_project/";
            },},{id: "projects-gallery",
          title: 'Gallery',
          description: "Updating from to to time...",
          section: "Projects",handler: () => {
              window.location.href = "/projects/images/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%79%6F%75@%65%78%61%6D%70%6C%65.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-inspire',
        title: 'Inspire HEP',
        section: 'Socials',
        handler: () => {
          window.open("https://inspirehep.net/authors/1010907", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=qc6CJjYAAAAJ", "_blank");
        },
      },{
        id: 'social-custom_social',
        title: 'Custom_social',
        section: 'Socials',
        handler: () => {
          window.open("https://www.alberteinstein.com/", "_blank");
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
