/* /assets/nav.js — (previous working) pointer-based delegated dropdown
   - Loads /partials/nav.html using script[data-base] as base
   - Single 'pointerup' delegation (prevents touch/click double toggles)
   - Never prevents default on links → menu item navigation works
   - Close on outside tap/click, ESC, resize/orientation
   - Sets --nav-height CSS var once (for mobile overlay positioning)
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

      // Set CSS var with current nav height (used by mobile overlay CSS)
      const nav = mount.querySelector(".nav");
      const navH = nav ? Math.round(nav.getBoundingClientRect().height) : 56;
      document.documentElement.style.setProperty("--nav-height", navH + "px");

      wireDelegatedDropdowns();
    })
    .catch(err => console.error("Nav load error:", err));

  // 2) Dropdown logic: single 'pointerup' delegation
  function wireDelegatedDropdowns() {
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

    // A) Open/close via pointer (covers mobile + desktop without ghost clicks)
    document.addEventListener("pointerup", function (e) {
      // 1) Toggle when tapping the button
      const btn = e.target.closest && e.target.closest(".dropbtn");
      if (btn) {
        e.preventDefault();   // button default not needed
        e.stopPropagation();
        const dd = btn.closest(".dropdown");
        if (!dd) return;
        const willOpen = !dd.classList.contains("open");
        closeAll(dd);
        setExpanded(dd, willOpen);
        return;
      }

      // 2) Clicking a menu item: close menu, allow navigation
      const link = e.target.closest && e.target.closest(".dropdown-menu a");
      if (link) {
        const dd = link.closest(".dropdown");
        if (dd) setExpanded(dd, false);
        return; // do NOT preventDefault → navigate
      }

      // 3) Tap outside: close all
      if (!e.target.closest(".dropdown")) closeAll();
    }, true); // capture phase → more reliable on mobile

    // B) Keyboard accessibility
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

    // C) Close on viewport change
    window.addEventListener("resize", () => closeAll());
    window.addEventListener("orientationchange", () => closeAll());
  }
})();
