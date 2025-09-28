(function () {
  // Get the base path for nav.html
  const thisScript = document.currentScript;
  const base = (thisScript && thisScript.dataset && thisScript.dataset.base) || "";
  const navUrl = base ? base.replace(/\/?$/, "/") + "partials/nav.html" : "partials/nav.html";

  // Load nav.html dynamically into #site-nav
  fetch(navUrl, { cache: "no-store" })
    .then(r => r.text())
    .then(html => {
      const mount = document.getElementById("site-nav");
      if (!mount) return;
      mount.innerHTML = html;

      // Initialize dropdown menus (IDs exist in nav.html)
      wireDropdown("people-dd");
      wireDropdown("publications-dd");
      wireDropdown("news-dd");
    })
    .catch(err => console.error("Nav load error:", err));

  /**
   * Attach event handlers to a dropdown
   * @param {string} id - The dropdown element id
   */
  function wireDropdown(id) {
    const dd = document.getElementById(id);
    if (!dd) return;

    const btn = dd.querySelector(".dropbtn");
    if (!btn) return;

    // --- helpers
    function setExpanded(open) {
      dd.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    function closeIfOutside(e) {
      if (!dd.contains(e.target)) setExpanded(false);
    }

    // --- toggle (double-toggle 방지: 의도 상태로 강제)
    function toggleDropdown(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
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
    }

    // --- mobile 고스트 클릭 방지 (touchstart + click)
    let touched = false;

    // 터치: 즉시 토글 + 합성 click 무시 플래그
    btn.addEventListener("touchstart", function (e) {
      touched = true;
      e.preventDefault();          // passive:false 여야 동작
      toggleDropdown(e);
      setTimeout(() => { touched = false; }, 400);
    }, { passive: false });

    // 클릭: 직전 터치로 생성된 합성 클릭이면 무시
    btn.addEventListener("click", function (e) {
      if (touched) return;
      toggleDropdown(e);
    });

    // 메뉴 항목 클릭 시 자동 닫기(네비게이션은 막지 않음)
    dd.querySelectorAll(".dropdown-menu a").forEach(a => {
      a.addEventListener("click", () => setExpanded(false));
    });

    // 바깥 클릭/터치 시 닫기
    document.addEventListener("click", closeIfOutside, true);
    document.addEventListener("touchstart", closeIfOutside, { passive: true, capture: true });

    // ESC로 닫기
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setExpanded(false);
      if ((e.key === "Enter" || e.key === " ") && e.target === btn) {
        e.preventDefault();
        toggleDropdown(e);
      }
    });

    // 리사이즈/회전 시 닫기
    window.addEventListener("resize", () => setExpanded(false));
    window.addEventListener("orientationchange", () => setExpanded(false));
  }
})();
