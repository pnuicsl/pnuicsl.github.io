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

      // Initialize dropdown menus (id가 있는 것 우선)
      wireDropdown("people-dd");
      wireDropdown("publications-dd");
      wireDropdown("news-dd");

      // 혹시 빠진 항목이 있으면 .dropdown 전체 보강
      document.querySelectorAll(".dropdown").forEach(dd => {
        if (!dd.__wired) wireDropdownEl(dd);
      });
    })
    .catch(err => console.error("Nav load error:", err));

  /** Attach event handlers to a dropdown by id */
  function wireDropdown(id) {
    const dd = document.getElementById(id);
    if (dd) wireDropdownEl(dd);
  }

  /** Wire a single dropdown element */
  function wireDropdownEl(dd) {
    const btn = dd.querySelector(".dropbtn");
    if (!btn) return;

    dd.__wired = true;

    function setExpanded(open) {
      dd.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function closeDropdown(e) {
      if (!e || !dd.contains(e.target)) setExpanded(false);
    }

    // 고스트 클릭 방지
    let touched = false;

    function toggleDropdown(e) {
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
    }

    // 터치: 즉시 토글 + 합성 click 무시
    btn.addEventListener("touchstart", function (e) {
      touched = true;
      toggleDropdown(e);
      setTimeout(() => { touched = false; }, 400);
    }, { passive: false });

    // 클릭: 직전 터치가 있으면(합성 click) 무시
    btn.addEventListener("click", function (e) {
      if (touched) return;
      toggleDropdown(e);
    });

    // 메뉴 항목 클릭 시 자동 닫기(선택)
    dd.querySelectorAll(".dropdown-menu a").forEach(a=>{
      a.addEventListener("click", ()=> setExpanded(false));
    });

    // 바깥 클릭/터치 시 닫기 (캡처 단계에서 선제 처리)
    document.addEventListener("click", closeDropdown, true);
    document.addEventListener("touchstart", closeDropdown, { passive: true, capture: true });

    // 키보드 접근성: Enter/Space로 열기, ESC로 닫기
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target === btn) {
        e.preventDefault();
        toggleDropdown(e);
      }
      if (e.key === "Escape") setExpanded(false);
    });

    // 리사이즈/회전 시 닫기
    window.addEventListener("resize", () => setExpanded(false));
    window.addEventListener("orientationchange", () => setExpanded(false));
  }
})();
