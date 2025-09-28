(function () {
  // Resolve base path for nav.html
  const thisScript = document.currentScript;
  const base = (thisScript && thisScript.dataset && thisScript.dataset.base) || "";
  const navUrl = (base ? base.replace(/\/?$/, "/") : "") + "partials/nav.html";

  // Render nav and wire dropdowns
  fetch(navUrl, { cache: "no-store" })
    .then(r => r.text())
    .then(html => {
      const mount = document.getElementById("site-nav");
      if (!mount) return;
      mount.innerHTML = html;

      // 1) 우선 id 기반(기존 동작 유지)
      ["people-dd", "publications-dd", "news-dd"].forEach(id => {
        const el = document.getElementById(id);
        if (el) wireDropdownEl(el);
      });

      // 2) 누락된 것이 있으면 .dropdown 전체 스캔하여 보강
      document.querySelectorAll(".dropdown").forEach(el => {
        if (!el.__wired) wireDropdownEl(el);
      });
    })
    .catch(err => console.error("Nav load error:", err));

  /**
   * Wire a single dropdown element
   * @param {HTMLElement} dd
   */
  function wireDropdownEl(dd) {
    const btn = dd.querySelector(".dropbtn");
    if (!btn) return;

    dd.__wired = true;

    // 상태 토글 함수
    const setExpanded = (open) => {
      dd.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    };
    const toggle = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      const willOpen = !dd.classList.contains("open");
      closeAll(dd);
      setExpanded(willOpen);
    };
    const close = () => setExpanded(false);

    // 고스트 클릭 방지 플래그
    let touched = false;

    // 터치: 즉시 토글 + 고스트 클릭 무시
    btn.addEventListener("touchstart", function (e) {
      touched = true;
      toggle(e);
      // iOS에서 생성되는 click 무시 타이머
      setTimeout(() => { touched = false; }, 400);
    }, { passive: false });

    // 클릭: 터치 직후 발생한 합성 클릭이면 무시
    btn.addEventListener("click", function (e) {
      if (touched) return;
      toggle(e);
    });

    // 바깥 클릭/터치 시 닫기
    function onDocPointer(e) {
      if (!dd.contains(e.target)) close();
    }
    document.addEventListener("click", onDocPointer, true);
    document.addEventListener("touchstart", onDocPointer, { passive: true, capture: true });

    // 키보드 접근성
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      if ((e.key === "Enter" || e.key === " ") && e.target === btn) {
        e.preventDef
