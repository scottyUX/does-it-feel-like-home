document.addEventListener("DOMContentLoaded", function () {
  // Set current date in the top utility bar
  const dateEl = document.getElementById("current-date");
  if (dateEl) {
    const now = new Date();
    const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const formatted = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
    dateEl.textContent = formatted;
  }

  // Category Filtering on Category Page
  const filterBtns = document.querySelectorAll(".filter-btn");
  const newsItems = document.querySelectorAll(".filterable-item");

  if (filterBtns.length > 0 && newsItems.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const targetCat = btn.getAttribute("data-category");
        newsItems.forEach((item) => {
          const itemCat = item.getAttribute("data-category");
          if (targetCat === "all" || itemCat === targetCat) {
            item.style.display = "grid";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }

  // Article Font Size Switcher
  const fontBtns = document.querySelectorAll(".font-btn");
  const articleBody = document.getElementById("article-content");

  if (fontBtns.length > 0 && articleBody) {
    fontBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        fontBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const size = btn.getAttribute("data-size");
        articleBody.style.fontSize = size + "px";
      });
    });
  }

  // Interactive Comment Addition (Local Only)
  const commentForm = document.getElementById("comment-form");
  const commentInput = document.getElementById("comment-input");
  const commentList = document.getElementById("comment-list");

  if (commentForm && commentInput && commentList) {
    commentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const text = commentInput.value.trim();
      if (!text) return;

      const item = document.createElement("div");
      item.className = "comment-item";
      item.innerHTML = `
        <div class="comment-meta">
          <span class="comment-author">热心读者（刚刚发布）</span>
          <span>刚刚 · 来自网页端</span>
        </div>
        <p>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      `;
      commentList.prepend(item);
      commentInput.value = "";
    });
  }

  // Search box feedback
  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const query = searchForm.querySelector("input").value.trim();
      if (query) {
        window.location.href = "category.html";
      }
    });
  }
});
