(function () {
  // 1) nav.html 로드
  const thisScript = document.currentScript;
  const base = (thisScript && thisScript.dataset && thisScript.dataset.base) || "";
  const navUrl = (base ? base.replace(/\/?$/, "/") : "") + "partials/nav.html";

  fetch(navUrl, { cache: "no-store" })
    .then(r => r.text())
    .then(html => {
      const mount = document.getElementById("site-nav");
      if (!mount) return;
      mount.innerHTML = html;

      // nav 높이를 CSS 변수로 등록(모바일 오버레이 위치 잡기)
      const nav = mount.querySelector(".nav");
      const navH = nav ? nav.getBoundingClientRect().height : 56;
      document.documentElement.style.setProperty("--nav-height", navH + "px");

      wireDelegatedDropdowns();
    })
    .catch(err => console.error("Nav load error:", err));

  function wireDelegatedDropdowns() {
    // 상태 보조 함수
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

    // 포인터 기반 단일 위임: 모바일/데스크톱 공통 (touch/click 이중 바인딩 제거)
    document.addEventListener("pointerup", function (e) {
      const btn = e.target.closest(".dropbtn");
      if (btn) {
        e.preventDefault();   // 버튼 기본동작 없음(링크 아님)
        e.stopPropagation();
        const dd = btn.closest(".dropdown");
        const willOpen = !dd.classList.contains("open");
        closeAll(dd);
        setExpanded(dd, willOpen);
        return;
      }

      // 메뉴 항목 클릭 시: 닫기만, 링크 네비게이션은 그대로
      const link = e.target.closest(".dropdown-menu a");
      if (link) {
        const dd = link.closest(".dropdown");
        if (dd) setExpanded(dd, false);
        return; // 링크 동작 유지
      }

      // 바깥 터치: 모두 닫기
      if (!e.target.closest(".dropdown")) closeAll();
    }, true); // 캡처 단계에서 선제 처리해 간섭 최소화

    // 키보드 접근성
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target.closest(".dropbtn")) {
        e.preventDefault();
        const dd = e.target.closest(".dropdown");
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
