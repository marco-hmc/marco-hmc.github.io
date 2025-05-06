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
        },{id: "post-总线",
        
          title: "总线",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_%E6%80%BB%E7%BA%BF.md/";
          
        },
      },{id: "post-coroutine了解",
        
          title: "coroutine了解",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_coroutine.md/";
          
        },
      },{id: "post-进程",
        
          title: "进程",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_process.md/";
          
        },
      },{id: "post-磁盘结构",
        
          title: "磁盘结构",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_io.md/";
          
        },
      },{id: "post-c-的多线程",
        
          title: "c++的多线程",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_threads.md/";
          
        },
      },{id: "post-指针",
        
          title: "指针",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_pointer.md/";
          
        },
      },{id: "post-内存的链接方式",
        
          title: "内存的链接方式",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_%E5%86%85%E5%AD%98%E9%93%BE%E6%8E%A5%E4%B8%8E%E5%86%85%E5%AD%98%E8%A3%85%E5%85%A5.md/";
          
        },
      },{id: "post-c-guideline",
        
          title: "c++ guideline",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_cpp_guideLine.md/";
          
        },
      },{id: "post-关于网络的一些quiz",
        
          title: "关于网络的一些quiz",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/99_network_quiz.md/";
          
        },
      },{id: "post-网络安全",
        
          title: "网络安全",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/6_%E7%BD%91%E7%BB%9C%E5%AE%89%E5%85%A8.md/";
          
        },
      },{id: "post-l5-应用层",
        
          title: "L5-应用层",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/5_%E5%BA%94%E7%94%A8%E5%B1%82.md/";
          
        },
      },{id: "post-l5-cdn",
        
          title: "L5-CDN",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/5.5_CDN.md/";
          
        },
      },{id: "post-l5-dns",
        
          title: "L5-DNS",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/5.2_DNS%E5%8D%8F%E8%AE%AE.md/";
          
        },
      },{id: "post-l5-http",
        
          title: "L5-http",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/5.1_HTTP_HTTPS.md/";
          
        },
      },{id: "post-l4-传输层",
        
          title: "L4-传输层",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/4_%E4%BC%A0%E8%BE%93%E5%B1%82.md/";
          
        },
      },{id: "post-l4-udp",
        
          title: "L4-UDP",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/4.2_UDP.md/";
          
        },
      },{id: "post-l4-tcp",
        
          title: "L4-TCP",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/4.1_TCP.md/";
          
        },
      },{id: "post-l3-网络层",
        
          title: "L3-网络层",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_%E7%BD%91%E7%BB%9C%E5%B1%82.md/";
          
        },
      },{id: "post-l2-链路层",
        
          title: "L2-链路层",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_%E9%93%BE%E8%B7%AF%E5%B1%82.md/";
          
        },
      },{id: "post-系统和程序的交互",
        
          title: "系统和程序的交互",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_interaction.md/";
          
        },
      },{id: "post-l1-物理层",
        
          title: "L1-物理层",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_%E7%89%A9%E7%90%86%E5%B1%82.md/";
          
        },
      },{id: "post-1-signal-md",
        
          title: "1_signal.md",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_signal.md/";
          
        },
      },{id: "post-引用",
        
          title: "引用",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_reference.md/";
          
        },
      },{id: "post-计算机系统中的开发需知",
        
          title: "计算机系统中的开发需知",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_os.md/";
          
        },
      },{id: "post-内存交换和虚拟内存",
        
          title: "内存交换和虚拟内存",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_%E5%86%85%E5%AD%98%E4%BA%A4%E6%8D%A2%E4%B8%8E%E8%99%9A%E6%8B%9F%E5%86%85%E5%AD%98.md/";
          
        },
      },{id: "post-模板的进阶使用",
        
          title: "模板的进阶使用",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_template_advanced.md/";
          
        },
      },{id: "post-cpu-工作原理",
        
          title: "CPU 工作原理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_cpu.md/";
          
        },
      },{id: "post-内存高级功能与优化",
        
          title: "内存高级功能与优化",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/4_%E5%86%85%E5%AD%98%E9%AB%98%E7%BA%A7%E5%8A%9F%E8%83%BD%E4%B8%8E%E4%BC%98%E5%8C%96.md/";
          
        },
      },{id: "post-内存分配管理",
        
          title: "内存分配管理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_%E5%86%85%E5%AD%98%E5%88%86%E9%85%8D%E4%B8%8E%E7%AE%A1%E7%90%86.md/";
          
        },
      },{id: "post-编译过程与原理",
        
          title: "编译过程与原理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_compile.md/";
          
        },
      },{id: "post-内存运行的基本原理",
        
          title: "内存运行的基本原理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_%E5%86%85%E5%AD%98%E8%BF%90%E8%A1%8C.md/";
          
        },
      },{id: "post-性能优化",
        
          title: "性能优化",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_optimize.md/";
          
        },
      },{id: "post-c-数据内存布局-amp-amp-内存分配",
        
          title: "c++ 数据内存布局 &amp;&amp; 内存分配",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_cppData.md/";
          
        },
      },{id: "post-行为型设计模式",
        
          title: "行为型设计模式",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_behaviouralPatterns.md/";
          
        },
      },{id: "post-结构型模式",
        
          title: "结构型模式",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_structuralPatterns.md/";
          
        },
      },{id: "post-创建型模式",
        
          title: "创建型模式",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_creationalPatterns.md/";
          
        },
      },{id: "post-系统设计",
        
          title: "系统设计",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_systemDesign.md/";
          
        },
      },{id: "post-cpp设计模式-入门",
        
          title: "cpp设计模式-入门",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_designPattern.md/";
          
        },
      },{id: "post-设计",
        
          title: "设计",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_design.md/";
          
        },
      },{id: "post-c-中的不定长参数",
        
          title: "c++ 中的不定长参数",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_template_ellipsis.md/";
          
        },
      },{id: "post-模板的入门使用",
        
          title: "模板的入门使用",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_template_introduction.md/";
          
        },
      },{id: "post-计算机网络",
        
          title: "计算机网络",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_networks.md/";
          
        },
      },{id: "post-迈向c-语言律师指路",
        
          title: "迈向c++语言律师指路",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_cppQuiz.md/";
          
        },
      },{id: "post-特殊成员函数",
        
          title: "特殊成员函数",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_cppMemFunc.md/";
          
        },
      },{id: "post-类的继承和多态",
        
          title: "类的继承和多态",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_cppVirtual.md/";
          
        },
      },{id: "post-openmp",
        
          title: "openmp",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_openmp.md/";
          
        },
      },{id: "post-并发编程",
        
          title: "并发编程",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_multiThread_multiProcess.md/";
          
        },
      },{id: "post-c-对象的内存模型设计",
        
          title: "C++对象的内存模型设计",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_cppMemModel.md/";
          
        },
      },{id: "post-lambda-演算",
        
          title: "Lambda 演算",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_lambda_calculus.md/";
          
        },
      },{id: "post-函数对象和函数式编程",
        
          title: "函数对象和函数式编程",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_functionalProgamming.md/";
          
        },
      },{id: "post-4-pc-arichtecture-md",
        
          title: "4_pc_arichtecture.md",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/4_pc_arichtecture.md/";
          
        },
      },{id: "post-c-函数调用方式与栈原理",
        
          title: "C 函数调用方式与栈原理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_%E5%87%BD%E6%95%B0%E8%B0%83%E7%94%A8%E6%96%B9%E5%BC%8F%E4%B8%8E%E6%A0%88%E5%8E%9F%E7%90%86.md/";
          
        },
      },{id: "post-汇编",
        
          title: "汇编",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_assembly.md/";
          
        },
      },{id: "post-错误码和异常处理",
        
          title: "错误码和异常处理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_exceptionAndFaultCode.md/";
          
        },
      },{id: "post-二进制兼容和-abi-兼容",
        
          title: "二进制兼容和 abi 兼容",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_binaryCompatbility.md/";
          
        },
      },{id: "post-计算机组成",
        
          title: "计算机组成",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BB%84%E6%88%90%E5%8E%9F%E7%90%86.md/";
          
        },
      },{id: "projects-2025-annual-goat",
          title: '2025 Annual Goat',
          description: "Updating from to to time...",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2025_annual_project/";
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
