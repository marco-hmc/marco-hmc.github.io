document.addEventListener("DOMContentLoaded", function () {
  'use strict';

  /* =======================
  // Menu
  ======================= */
  var body = document.querySelector("body"),
  menuOpenIcon = document.querySelector(".nav__icon-menu"),
  menuCloseIcon = document.querySelector(".nav__icon-close"),
  menuList = document.querySelector(".main-nav");

  menuOpenIcon.addEventListener("click", () => {
    menuOpen();
  });

  menuCloseIcon.addEventListener("click", () => {
    menuClose();
  });

  function menuOpen() {
    menuList.classList.add("is-open");
  }

  function menuClose() {
    menuList.classList.remove("is-open");
  }

  /* =======================
  // Animation Load Page
  ======================= */
  setTimeout(function(){
    body.classList.add("is-in");
  },150)

  /* ==================================
  // Stop Animations After All Have Run
  ================================== */
  setTimeout(function(){
    body.classList.add("stop-animations");
  },1500)

  /* ======================================
  // Stop Animations During Window Resizing
  ====================================== */
  let resizeTimer;
  window.addEventListener("resize", () => {
    document.body.classList.add("resize-animation-stopper");
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.body.classList.remove("resize-animation-stopper");
    }, 300);
  });


  /* =======================
  // Responsive Videos
  ======================= */
  reframe(".post__content iframe:not(.reframe-off), .page__content iframe:not(.reframe-off)");


  /* =======================
  // Zoom Image
  ======================= */
  const lightense = document.querySelector(".page img, .post img"),
  imageLink = document.querySelectorAll(".page a img, .post a img");

  if (imageLink) {
    for (var i = 0; i < imageLink.length; i++) imageLink[i].parentNode.classList.add("image-link");
    for (var i = 0; i < imageLink.length; i++) imageLink[i].classList.add("no-lightense");
  }

  if (lightense) {
    Lightense(".page img:not(.no-lightense), .post img:not(.no-lightense)", {
    padding: 60,
    offset: 30
    });
  }

  /* ============================
  // Testimonials Slider
  ============================ */
  if (document.querySelector(".my-slider")) {
    var slider = tns({
      container: ".my-slider",
      items: 3,
      slideBy: 1,
      gutter: 20,
      nav: false,
      mouseDrag: true,
      autoplay: false,
      controlsContainer: "#customize-controls",
      responsive: {
        1024: {
          items: 3,
        },
        768: {
          items: 2,
        },
        0: {
          items: 1,
        }
      }
    });
  }


  /* ============================
  // iTyped
  ============================ */
  if (document.querySelector(".c-subscribe")) {
    var options = {
      strings: itype_text,
      typeSpeed: 100,
      backSpeed: 50,
      startDelay: 200,
      backDelay: 1500,
      loop: true,
      showCursor: true,
      cursorChar: "|",
      onFinished: function(){}
    }

    ityped.init('#ityped', options);
  }


  /* ============================
  // Scroll to top
  ============================ */
  const btnScrollToTop = document.querySelector(".top");

  window.addEventListener("scroll", function () {
    window.scrollY > window.innerHeight ? btnScrollToTop.classList.add("is-active") : btnScrollToTop.classList.remove("is-active");
  });

  btnScrollToTop.addEventListener("click", function () {
    if (window.scrollY != 0) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      })
    }
  });

});

document.addEventListener("DOMContentLoaded", function () {
  const headings = document.querySelectorAll(
    ".post__content h1, .post__content h2, .post__content h3, .post__content h4, .post__content h5, .post__content h6"
  );
  const toc = document.getElementById("toc");
  const tocList = document.createElement("ul");
  let stack = [{ ul: tocList, level: 1 }]; // 初始化堆栈

  // 生成目录结构
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.slice(1));
    // 自动生成ID（若缺失）
    if (!heading.id) {
      heading.id = heading.textContent
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, "-");
    }
    // 动态创建层级目录
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    const parentUl = stack[stack.length - 1].ul;
    const listItem = document.createElement("li");
    listItem.className = `toc-item level-${level}`;
    // 创建链接和平滑滚动
    const anchor = document.createElement("a");
    anchor.className = "toc-link";
    anchor.textContent = heading.textContent.replace(/^#+\s*/, "");
    anchor.href = `#${heading.id}`;
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelector(anchor.getAttribute("href"))
        .scrollIntoView({ behavior: "smooth" });
    });
    listItem.appendChild(anchor);
    parentUl.appendChild(listItem);
    // 处理子层级
    if (level > stack[stack.length - 1].level) {
      const subUl = document.createElement("ul");
      listItem.appendChild(subUl);
      stack.push({ ul: subUl, level: level });
    }
  });

  toc.appendChild(tocList);

  // 高亮当前标题
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`a[href="#${entry.target.id}"]`);
        link?.classList.toggle("active", entry.isIntersecting);
      });
    },
    { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
  );
  headings.forEach((heading) => observer.observe(heading));
});