(function () {
  // Resolve base path for nav.html
  const thisScript = document.currentScript;
  const base = (thisScript && thisScript.dataset && thisScript.dataset.base) || "";
  const navUrl = (base ? base.replace(/\/?$/, "/") : "") + "partials/nav.html";

  // Load nav.html into #site-nav
  fetch(navUrl, { cache: "no-store" })
    .then(r => r.text())
    .then(html => {
      const mount = document.getElementById("site-nav");
      if (!mount) return;
      mount.innerHTML = html;
      wireAllDropdowns();
    })
    .catch(err => console.error("Nav load error:", err));

  function wireAllDropdowns() {
    document.querySelectorAll(".dropdown").forEach(dd => {
      const btn = dd.querySelector(".dropbtn");
      if (!btn) return;

      const setExpanded = (open) => {
        dd.classList.toggle("open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      };

      // 클릭으로만 토글 (모바일 포함) — touchstart 사용하지 않음
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const willOpen = !dd.classList.contains("open");

        // 다른 드롭다운 닫기
        document.querySelectorAll(".dropdown.open").forEach(d => {
          if (d !== dd) {
            d.classList.remove("open");
            const b = d.querySelector(".dropbtn");
            if (b) b.setAttribute("aria-expanded", "false");
          }
        });

        setExpanded(willOpen);
      });

      // 메뉴 항목 클릭 시 닫기(네비게이션은 그대로 진행)
      dd.querySelectorAll(".dropdown-menu a").forEach(a => {
        a.addEventListener("click", () => setExpanded(false));
      });

      // 바깥 클릭 시 닫기
      document.addEventListener("click", (e) => {
        if (!dd.contains(e.target)) setExpanded(false);
      }, true);

      // ESC로 닫기 + 화면 변경 시 닫기
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setExpanded(false);
      });
      window.addEventListener("resize", () => setExpanded(false));
      window.addEventListener("orientationchange", () => setExpanded(false));
    });
  }
})();
