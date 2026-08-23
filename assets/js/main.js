/* Period Hugo Theme — 原生 JS 交互（零依赖）
 * 1. 移动端汉堡菜单展开
 * 2. 移动端子菜单手风琴
 * 3. 页眉搜索展开
 * 4. 返回顶部按钮
 */
(function () {
  "use strict";

  // 1. Mobile menu toggle
  var toggleNav = document.getElementById("toggle-navigation");
  var menuContainer = document.getElementById("menu-primary-container");
  if (toggleNav && menuContainer) {
    var openText = toggleNav.getAttribute("data-open-text") || "open menu";
    var closeText = toggleNav.getAttribute("data-close-text") || "close menu";
    toggleNav.addEventListener("click", function () {
      var open = menuContainer.classList.toggle("open");
      toggleNav.setAttribute("aria-expanded", open ? "true" : "false");
      var sr = toggleNav.querySelector(".screen-reader-text");
      if (sr) { sr.textContent = open ? closeText : openText; }
    });
  }

  // 2. Mobile submenu accordion
  var dropdowns = document.querySelectorAll(".menu-primary .toggle-dropdown");
  Array.prototype.forEach.call(dropdowns, function (btn) {
    btn.addEventListener("click", function () {
      var li = btn.parentNode;
      var open = li.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  // 3. Header search toggle
  var searchIcon = document.getElementById("search-icon");
  var searchContainer = searchIcon ? searchIcon.closest(".search-form-container") : null;
  if (searchIcon && searchContainer) {
    searchIcon.addEventListener("click", function (e) {
      e.preventDefault();
      var field = searchContainer.querySelector(".search-field");
      if (searchContainer.classList.contains("open")) {
        // 已展开：再次点击图标 = 执行搜索（有内容时提交，空则收起）
        if (field && field.value.trim()) {
          field.form.submit();
        } else {
          searchContainer.classList.remove("open");
          searchIcon.classList.remove("open");
          searchIcon.setAttribute("aria-expanded", "false");
        }
        return;
      }
      // 未展开：展开并聚焦输入框
      searchContainer.classList.add("open");
      searchIcon.classList.add("open");
      searchIcon.setAttribute("aria-expanded", "true");
      if (field) { field.focus(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && searchContainer.classList.contains("open")) {
        searchContainer.classList.remove("open");
        searchIcon.classList.remove("open");
        searchIcon.setAttribute("aria-expanded", "false");
      }
    });
  }

  // 4. Scroll to top
  var scrollBtn = document.getElementById("scroll-to-top");
  if (scrollBtn) {
    window.addEventListener("scroll", function () {
      scrollBtn.classList.toggle("visible", window.scrollY > 300);
    });
    scrollBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 5. Code block copy button（Chroma 代码高亮）
  var isZh = (document.documentElement.lang || "zh-cn").toLowerCase().indexOf("zh") === 0;
  var copyText = isZh ? "复制" : "Copy";
  var copiedText = isZh ? "已复制" : "Copied";
  var preBlocks = document.querySelectorAll(".highlight pre");
  Array.prototype.forEach.call(preBlocks, function (pre) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-code-button";
    btn.textContent = copyText;
    btn.setAttribute("aria-label", copyText);
    pre.parentNode.insertBefore(btn, pre);
    btn.addEventListener("click", function () {
      var text = pre.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
      function done() {
        btn.textContent = copiedText;
        setTimeout(function () { btn.textContent = copyText; }, 1500);
      }
    });
  });
})();
