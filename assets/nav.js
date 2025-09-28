/* /assets/nav.js
   Lightweight, robust navbar loader + dropdown controller
   - Loads /partials/nav.html (path is resolved from script[data-base])
   - Works on desktop & mobile (single 'pointerup' delegation → no ghost clicks)
   - Accessible: ARIA expanded state, keyboard open/close, ESC to close
   - Closes when clicking outside, on resize, or orientation change
   - Exposes no globals
*/
(function () {
  "use strict";

  /** -------------------------------------------------------
   * 1) Resolve base path and fetch nav.html into #site-nav
   * ------------------------------------------------------*/
  const thisScript = document.currentScript;
  const baseAttr = (thisScript && thisScript.dataset && thisScript.dataset.base) || "";
  // Normalize base to end with a single slash if present
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

      // After DOM is injected, wire handlers and sync CSS var for overlay position
      updateNavHeight();
      wireDelegatedDropdowns();
      // Keep --nav-height accurate on layout changes
      window.addEventListener("resize", updateNavHeight);
      window.addEventListener("orientationchange", updateNavHeight);
    })
    .catch(err => console.error("Nav load error:", err));

  /** ---------------------------------------------
   * Keep a CSS variable with current nav height.
   * Used by mobile overlay CSS (if you use it).
   * --------------------------------------------*/
  function updateNavHeight() {
    const nav = document.querySelector("#site-nav .nav");
    const h = nav ? Math.round(nav.getBoundingClientRect().height) : 56;
    document.documentElement.style.setProperty("--nav-height", h + "px");
  }

  /** -------------------------------------------------------
   * 2) Dropdown logic (delegated, pointer-based, accessible)
   * ------------------------------------------------------*/
  function wireDelegatedDropdowns() {
    // Avoid double-wiring if this script runs twice
    if (document.documentElement.__navWired) return;
    document.documentElement.__navWired = true;

    // Helpers
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

    // A) Single pointer handler for open/close (prevents touch+click double toggles)
    document.addEventListener(
      "pointerup",
      function (e) {
        const btn = e.target.closest(".dropbtn");
        if (btn) {
          // Toggle the parent .dropdown
          e.preventDefault();   // .dropbtn is a button; we don't want default click actions
          e.stopPropagation();
          const dd = btn.closest(".dropdown");
          if (!dd) return;
          const willOpen = !dd.classList.contains("open");
          closeAll(dd);
          setExpanded(dd, willOpen);
          return;
        }

        // If a dropdown item (link) was tapped: close the menu but DO NOT block navigation
        const item = e.target.closest(".dropdown-menu a");
        if (item) {
          const dd = item.closest(".dropdown");
          if (dd) setExpanded(dd, false);
          return; // let the link navigate
        }

        // Tap/click outside any dropdown → close all
        if (!e.target.closest(".dropdown")) closeAll();
      },
      true // capture phase to win over other handlers
    );

    // B) Keyboard accessibility: Enter/Space to toggle, ESC to close
    document.addEventListener("keydown", function (e) {
      const isActivator = e.target && e.target.closest && e.target.closest(".dropbtn");
      if ((e.key === "Enter" || e.key === " ") && isActivator) {
        e.preventDefault();
        const dd = e.target.closest(".dropdown");
        if (!dd) return;
        const willOpen = !dd.classList.contains("open");
        closeAll(dd);
        setExpanded(dd, willOpen);
      }
      if (e.key === "Escape") closeAll();
    });

    // C) Auto-close on viewport changes
    window.addEventListener("resize", () => closeAll());
    window.addEventListener("orientationchange", () => closeAll());
  }
})();
