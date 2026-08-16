// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "Blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-projects",
          title: "Projects",
          description: "A growing collection of my cool projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-resume",
          title: "Resume",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "projects-all-the-things-about-c",
          title: 'All the things about C++',
          description: "Grammar, functional, template, etc.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/handbook-cpp/";
            },},{id: "projects-design",
          title: 'Design',
          description: "The things about design, including design pattern, system design, module design, optimization design and development specification design.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/handbook-design/";
            },},{id: "projects-计算机网络",
          title: '计算机网络',
          description: "计算机网络和网络编程应用",
          section: "Projects",handler: () => {
              window.location.href = "/projects/handbook-internet-programming/";
            },},{id: "projects-parallel-programming",
          title: 'parallel programming',
          description: "notes about parallel programming in cpp, including threads, process, coroutine",
          section: "Projects",handler: () => {
              window.location.href = "/projects/handbook-parallel-programming/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6D%61%72%63%6F.%68%6D%63%68%75%6E@%67%6D%61%69%6C.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/marco-hmc", "_blank");
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
