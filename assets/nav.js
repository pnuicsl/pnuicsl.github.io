/* Robust navbar loader + dropdown (desktop & mobile)
   - Loads /partials/nav.html (base from script[data-base])
   - Delegated handlers: pointerup + touchend + click (with ghost-click suppression)
   - ARIA expanded, outside click close, ESC close, resize/orientation close
*/
(function () {
  "use strict";

  // 1) Load nav.html
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

      // Keep a CSS var with the nav height for mobile overlay positioning
      updateNavHeight();
      wireDelegatedDropdowns();
      window.addEventListener("resize", updateNavHeight);
      window.addEventListener("orientationchange", updateNavHeight);
    })
    .catch(err => console.error("Nav load error:", err));

  function updateNavHeight() {
    const nav = document.querySelector("#site-nav .nav");
    const h = nav ? Math.round(nav.getBoundingClientRect().height) : 56;
    document.documentElement.style.setProperty("--nav-height", h + "px");
  }

  // 2) Dropdown logic (delegated)
  function wireDelegatedDropdowns() {
    if (document.documentElement.__navWired) return;
    document.documentElement.__navWired = true;

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

    // Ghost click suppression window
    let lastTouchTs = 0;

    function activateFromBtn(btn, e) {
      // Toggle the parent .dropdown
      const dd = btn.closest(".dropdown");
      if (!dd) return;
      const willOpen = !dd.classList.contains("open");
      closeAll(dd);
      setExpanded(dd, willOpen);
    }

    // --- pointerup (primary path on modern browsers)
    document.addEventListener("pointerup", function (e) {
      const btn = e.target.closest && e.target.closest(".dropbtn");
      const link = e.target.closest && e.target.closest(".dropdown-menu a");

      if (btn) {
        e.preventDefault();   // .dropbtn default is not needed
        e.stopPropagation();
        activateFromBtn(btn, e);
        return;
      }
      if (link) {
        // Close menu but DO NOT block navigation
        const dd = link.closest(".dropdown");
        if (dd) setExpanded(dd, false);
        return;
      }
      if (!e.target.closest(".dropdown")) closeAll();
    }, true); // capture to win over other handlers

    // --- touchend (fallback for iOS variants where pointer may be flaky)
    document.addEventListener("touchend", function (e) {
      lastTouchTs = Date.now();
      const btn = e.target.closest && e.target.closest(".dropbtn");
      const link = e.target.closest && e.target.closest(".dropdown-menu a");

      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        activateFromBtn(btn, e);
        return;
      }
      if (link) {
        const dd = link.closest(".dropdown");
        if (dd) setExpanded(dd, false);
        return; // let link navigate
      }
      if (!e.target.closest(".dropdown")) closeAll();
    }, { passive: false, capture: true });

    // --- click (fallback for devices without pointer/touch or desktop)
    document.addEventListener("click", function (e) {
      // Ignore synthetic clicks right after a touch
      if (Date.now() - lastTouchTs < 500) return;

      const btn = e.target.closest && e.target.closest(".dropbtn");
      const link = e.target.closest && e.target.closest(".dropdown-menu a");

      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        activateFromBtn(btn, e);
        return;
      }
      if (link) {
        const dd = link.closest(".dropdown");
        if (dd) setExpanded(dd, false);
        return;
      }
      if (!e.target.closest(".dropdown")) closeAll();
    }, true);

    // Keyboard accessibility
    document.addEventListener("keydown", function (e) {
      const isBtn = e.target && e.target.closest && e.target.closest(".dropbtn");
      if ((e.key === "Enter" || e.key === " ") && isBtn) {
        e.preventDefault();
        activateFromBtn(e.target.closest(".dropbtn"), e);
      }
      if (e.key === "Escape") closeAll();
    });

    // Close on viewport change
    window.addEventListener("resize", () => closeAll());
    window.addEventListener("orientationchange", () => closeAll());
  }
})();
