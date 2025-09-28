/* /assets/nav.js
   Minimal & robust navbar loader + dropdown (desktop & mobile)
   - Loads /partials/nav.html (path from script[data-base])
   - Single 'click' delegation (no touch/pointer complexity)
   - Never prevents default on links -> menu selection always navigates
   - Close on outside click, ESC, resize/orientation
*/
(function () {
  "use strict";

  // 1) Load nav.html into #site-nav
  const thisScript = document.currentScript;
  const baseAttr = (thisScript && thisScript.dataset && thisScript.dataset.base) || "";
  const base = baseAttr ? baseAttr.replace(/\/?$/, "/") : "";
  const navUrl = base + "partials/nav.html";

  fetch(navUrl, { cache: "no-store" })
    .then(r => {
      if (!r.ok) throw new Error("Failed to load nav: " + r.status);
      return r.text();
    })
    .then(html => {
      const mount = document.getElementById("site-nav");
      if (!mount) return;
      mount.innerHTML = html;

      // Keep nav height CSS var for mobile overlay positioning (used in CSS)
      updateNavHeight();
      window.addEventListener("resize", updateNavHeight);
      window.addEventListener("orientationchange", updateNavHeight);

      // Wire dropdowns via delegated click handlers
      wireDropdowns(mount);
    })
    .catch(err => console.error("Nav load error:", err));

  function updateNavHeight() {
    const nav = document.querySelector("#site-nav .nav");
    const h = nav ? Math.round(nav.getBoundingClientRect().height) : 56;
    document.documentElement.style.setProperty("--nav-height", h + "px");
  }

  // 2) Dropdown logic (single 'click' delegation)
  function wireDropdowns(root) {
    // Avoid double wiring if the script gets executed twice
    if (root.__wired) return;
    root.__wired = true;

    function setExpanded(dd, open) {
      dd.classList.toggle("open", open);
      const btn = dd.querySelector(".dropbtn");
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function closeAll(except) {
      root.querySelectorAll(".dropdown.open").forEach(d => {
        if (d !== except) {
          d.classList.remove("open");
          const b = d.querySelector(".dropbtn");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });
    }

    // A) Click delegation (desktop & mobile 모두 동작)
    document.addEventListener("click", function (e) {
      // 범위를 navbar 내부로 한정
      const inNav = e.target.closest && e.target.closest("#site-nav");
      if (!inNav) {
        // 외부 클릭이면 열린 메뉴 닫기
        closeAll();
        return;
      }

      // 1) 버튼 클릭 → 토글 (다른 드롭다운은 닫기)
      const btn = e.target.closest(".dropbtn");
      if (btn && root.contains(btn)) {
        e.stopPropagation(); // 바깥 닫기 핸들러와 충돌 방지
        const dd = btn.closest(".dropdown");
        const willOpen = !dd.classList.contains("open");
        closeAll(dd);
        setExpanded(dd, willOpen);
        return; // 버튼은 링크가 아니므로 preventDefault 불필요
      }

      // 2) 메뉴 항목 클릭 → 닫기만, 네비게이션은 그대로 진행
      const link = e.target.closest(".dropdown-menu a");
      if (link && root.contains(link)) {
        const dd = link.closest(".dropdown");
        if (dd) setExpanded(dd, false);
        // 링크 이동은 기본 동작으로 진행
        return;
      }

      // 3) navbar 내부 다른 영역 클릭 → 필요 시 닫기
      const insideDropdown = e.target.closest(".dropdown");
      if (!insideDropdown) closeAll();
    });

    // B) Keyboard accessibility
    document.addEventListener("keydown", function (e) {
      const isBtn = e.target && e.target.closest && e.target.closest(".dropbtn");
      if (isBtn && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        const dd = e.target.closest(".dropdown");
        const willOpen = !dd.classList.contains("open");
        closeAll(dd);
        setExpanded(dd, willOpen);
      }
      if (e.key === "Escape") closeAll();
    });

    // C) Viewpor
