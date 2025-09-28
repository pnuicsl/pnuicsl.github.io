/* /assets/nav.js — pointer-based dropdown (links left to default navigation)
   - Loads /partials/nav.html via script[data-base]
   - Button toggle: pointerup(모바일/데스크톱) + 키보드 접근성
   - 링크(a)는 절대 가로막지 않음( preventDefault / stopPropagation 안 함 )
   - 바깥 클릭/ESC/리사이즈/회전 시 닫기
   - --nav-height CSS 변수 갱신(모바일 오버레이 위치)
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

      updateNavHeight();
      wireDropdowns();

      window.addEventListener("resize", updateNavHeight);
      window.addEventListener("orientationchange", updateNavHeight);
    })
    .catch(err => console.error("Nav load error:", err));

  function updateNavHeight() {
    const nav = document.querySelector("#site-nav .nav");
    const h = nav ? Math.round(nav.getBoundingClientRect().height) : 56;
    document.documentElement.style.setProperty("--nav-height", h + "px");
  }

  // 2) Dropdown logic (single 'pointerup' delegation for buttons)
  function wireDropdowns() {
    const setExpanded = (dd, open) => {
      dd.classList.toggle("open", open);
      const btn = dd.querySelector(".dropbtn");
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    };

    const closeAll = (except = null) => {
      document.querySelectorAll(".dropdown.open").forEach(d => {
        if (d !== except) {
          d.classList.remove("open");
          const b = d.querySelector(".dropbtn");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });
    };

    // 버튼만 처리: 링크는 건드리지 않습니다(네비게이션 100% 보장)
    document.addEventListener("pointerup", function (e) {
      const btn = e.target.closest && e.target.closest(".dropbtn");
      if (btn) {
        e.preventDefault();   // 버튼의 기본 클릭 동작은 필요 없음
        e.stopPropagation();
        const dd = btn.closest(".dropdown");
        if (!dd) return;
        const willOpen = !dd.classList.contains("open");
        closeAll(dd);
        setExpanded(dd, willOpen);
        return;
      }

      // 바깥 탭 → 모두 닫기
      if (!e.target.closest(".dropdown")) closeAll();
      // 링크(a)는 여기서 일절 처리하지 않음 → 클릭 이벤트가 정상적으로 페이지 이동 처리
    }, true);

    // 키보드 접근성
    document.addEventListener("keydown", function (e) {
      const isBtn = e.target && e.target.closest && e.target.closest(".dropbtn");
      if ((e.key === "Enter" || e.key === " ") && isBtn) {
        e.preventDefault();
        const dd = e.target.closest(".dropdown");
        if (!dd) return;
        const willOpen = !dd.classList.contains("open");
        closeAll(dd);
        setExpanded(dd, willOpen);
      }
      if (e.key === "Escape") closeAll();
    });

    // 화면 변화 시 닫기
    window.addEventListener("resize", () => closeAll());
    window.addEventListener("orientationchange", () => closeAll());
  }
})();
