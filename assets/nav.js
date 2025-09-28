(function () {
  // Resolve base path for nav.html
  const thisScript = document.currentScript;
  const base = (thisScript && thisScript.dataset && thisScript.dataset.base) || "";
  const navUrl = (base ? base.replace(/\/?$/, "/") : "") + "partials/nav.html";

  // Render nav and then wire dropdowns via delegated events
  fetch(navUrl, { cache: "no-store" })
    .then(r => r.text())
    .then(html => {
      const mount = document.getElementById("site-nav");
      if (!mount) return;
      mount.innerHTML = html;
      wireDropdownsDelegated();
    })
    .catch(err => console.error("Nav load error:", err));

  function wireDropdownsDelegated() {
    // Helpers
    function setExpanded(dd, open) {
      dd.classList.toggle("open", open);
      const btn = dd.querySelector(".dropbtn");
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    function closeAll(except) {
      document.querySelectorAll(".dropdown.open").forEach(d => {
        if (d !== except) {
          d.classList.remove("open");
          const b = d.querySelector(".dropbtn");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });
    }

    // ---- Delegated pointer & click logic (모바일 고스트 클릭 방지 포함)
    let fromPointer = false;

    // 1) pointerdown: 버튼을 터치/마우스로 눌렀을 때 즉시 토글 (링크는 막지 않음)
    document.addEventListener("pointerdown", function (e) {
      const btn = e.target.closest(".dropbtn");
      if (btn) {
        fromPointer = true;             // 이 포인터 다운이 곧 click을 유발할 수 있으니 표시
        e.preventDefault();             // 버튼 기본동작 없음(링크 아님), 고스트 클릭 억제에 도움
        const dd = btn.closest(".dropdown");
        const willOpen = !dd.classList.contains("open");
        closeAll(dd);
        setExpanded(dd, willOpen);
        return;
      }
      // 바깥 클릭은 닫기
      if (!e.target.closest(".dropdown")) closeAll();
    }, true); // 캡처 단계에서 선제 처리

    // 2) click: 포인터다운에 의해 생성된 합성 클릭은 무시
    document.addEventListener("click", function (e) {
      if (fromPointer) { fromPointer = false; return; }

      const btn = e.target.closest(".dropbtn");
      if (btn) {
        // 버튼 클릭으로도 토글 (마우스-only 환경 대비)
        e.preventDefault();
        const dd = btn.closest(".dropdown");
        const willOpen = !dd.classList.contains("open");
        closeAll(dd);
        setExpanded(dd, willOpen);
        return;
      }

      // 드롭다운 메뉴 항목 클릭 시: 닫기만 하고 링크 네비게이션은 막지 않음
      const link = e.target.closest(".dropdown-menu a");
      if (link) {
        const dd = link.closest(".dropdown");
        if (dd) setExpanded(dd, false);
        // link 기본동작(네비게이션)은 그대로 진행
      }

      // 메뉴나 버튼이 아닌 바깥 영역 클릭: 닫기
      if (!e.target.closest(".dropdown")) closeAll();
    }, true);

    // 3) 키보드 접근성: Enter/Space로 열기, ESC로 닫기
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

    // 4) 리사이즈/회전 시 닫기
    window.addEventListener("resize", () => closeAll());
    window.addEventListener("orientationchange", () => closeAll());
  }
})();
