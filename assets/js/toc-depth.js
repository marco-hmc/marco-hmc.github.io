$(document).ready(function () {
  // 为侧边栏TOC
  if ($("#toc-sidebar").length > 0) {
    // 清除任何现有的目录内容
    $("#toc-sidebar").empty();

    // 重新创建目录，包括所有级别的标题
    $("#toc-sidebar").toc({
      minimumHeaders: 1,
      headers: "h1, h2, h3, h4, h5, h6", // 包含所有级别的标题
      listType: "ul",
      showEffect: "show",
      classes: {
        list: "toc-list",
        item: "toc-item",
      },
    });

    // 为不同级别的标题设置类
    $("#toc-sidebar li a").each(function () {
      var tag = $(this).attr("href").replace("#", "");
      var heading = $("[id='" + tag + "']");

      if (heading.length > 0) {
        var tagName = heading.prop("tagName").toLowerCase();
        $(this).addClass("toc-" + tagName);

        // 为更深层级的标题添加缩进
        if (tagName === "h3") {
          $(this).css("padding-left", "1rem");
        } else if (tagName === "h4") {
          $(this).css("padding-left", "2rem");
        } else if (tagName === "h5") {
          $(this).css("padding-left", "3rem");
        } else if (tagName === "h6") {
          $(this).css("padding-left", "4rem");
        }
      }
    });
  }

  // 为页面开始处的TOC
  if ($("#table-of-contents").length > 0) {
    $("#table-of-contents").toc({
      minimumHeaders: 1,
      headers: "h1, h2, h3, h4, h5, h6", // 包含所有级别的标题
      listType: "ul",
      showEffect: "show",
      classes: {
        list: "toc-list",
        item: "toc-item",
      },
    });
  }
});
