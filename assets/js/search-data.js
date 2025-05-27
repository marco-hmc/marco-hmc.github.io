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
        },{id: "post-六-模板那些事儿-类型擦除",
        
          title: "（六）模板那些事儿：类型擦除",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/5_template_typeErasure/";
          
        },
      },{id: "post-五-多线程那些事儿-并行库-openmp",
        
          title: "（五）多线程那些事儿：并行库 openmp",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/5_openmp/";
          
        },
      },{id: "post-五-模板那些事儿-模板元",
        
          title: "（五）模板那些事儿：模板元",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/4_template_expressTpl/";
          
        },
      },{id: "post-四-多线程那些事儿-并行库-tbb",
        
          title: "（四）多线程那些事儿：并行库 tbb",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/4_tbb/";
          
        },
      },{id: "post-三-多线程那些事儿-怎么用好",
        
          title: "（三）多线程那些事儿：怎么用好",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_threadUsage/";
          
        },
      },{id: "post-四-模板那些事儿-不定长参数",
        
          title: "（四）模板那些事儿：不定长参数",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_template_ellipsis/";
          
        },
      },{id: "post-四-c-对象内存模型那些事儿-数据内存布局",
        
          title: "（四）C++对象内存模型那些事儿：数据内存布局",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/3_cppData/";
          
        },
      },{id: "post-三-模板那些事儿-模板与继承",
        
          title: "（三）模板那些事儿：模板与继承",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_template_inherit/";
          
        },
      },{id: "post-错误码和异常处理",
        
          title: "错误码和异常处理",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_exceptionAndFaultCode/";
          
        },
      },{id: "post-三-c-对象内存模型那些事儿-特殊成员函数",
        
          title: "（三）C++对象内存模型那些事儿：特殊成员函数",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_cppMemFunc/";
          
        },
      },{id: "post-二-多线程那些事儿-原子类型数据和内存序",
        
          title: "（二）多线程那些事儿：原子类型数据和内存序",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/2_atomic/";
          
        },
      },{id: "post-一-多线程那些事儿-怎么用",
        
          title: "（一）多线程那些事儿：怎么用",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_threads/";
          
        },
      },{id: "post-二-模板那些事儿-模板元",
        
          title: "（二）模板那些事儿：模板元",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_template_mtp/";
          
        },
      },{id: "post-引用那些事儿",
        
          title: "引用那些事儿",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_reference/";
          
        },
      },{id: "post-二-c-对象内存模型那些事儿-类的继承和多态",
        
          title: "（二）C++对象内存模型那些事儿：类的继承和多态",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_cppVirtual/";
          
        },
      },{id: "post-二进制兼容和-abi-兼容",
        
          title: "二进制兼容和 abi 兼容",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/1_binaryCompatbility/";
          
        },
      },{id: "post-一-模板那些事儿-是什么",
        
          title: "（一）模板那些事儿：是什么？",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_template_introduction/";
          
        },
      },{id: "post-指针那些事儿",
        
          title: "指针那些事儿",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_pointer/";
          
        },
      },{id: "post-迈向-c-语言律师之路",
        
          title: "迈向 c++语言律师之路",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_cppQuiz/";
          
        },
      },{id: "post-一-c-对象内存模型那些事儿-基本概念",
        
          title: "（一）C++对象内存模型那些事儿：基本概念",
        
        description: "",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/0_cppMemModel/";
          
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
