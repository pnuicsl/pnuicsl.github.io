/* /assets/nav.js
   Stable navbar loader + dropdown (desktop & mobile)
   - Loads /partials/nav.html (path from script[data-base])
   - Per-button handlers: touchstart + click (double-toggle safe)
   - Document click to close when tapping outside
   - Never prevents default on links → menu selection always navigates
   - ESC/resize/orientation to close
   - Keeps --nav-height CSS var for mobile overlay positioning (used by CSS)
*/
(function () {
  "use strict";

  // -------- 1) Load nav.html into #site-nav --------
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

      // Sync nav height CSS var (for mobile overlay positioning)
      updateNavHeight();
      window.addEventListener("resize", updateNavHeight);
      window.addEventListener("orientationchange", updateNavHeight);

      // Wire dropdowns AFTER nav is in the DOM
      wireDropdowns(mount);
    })
    .catch(err => console.error("Nav load error:", err));

  function updateNavHeight() {
    const nav = document.querySelector("#site-nav .nav");
    const h = nav ? Math.round(nav.getBoundingClientRect().height) : 56;
    document.documentElement.style.setProperty("--nav-height", h + "px");
  }

  // -------- 2) Dropdown logic (per-button handlers) --------
  function wireDropdowns(root) {
    // Guard: avoid double wiring if script executes twice
    if (root.__wired) return;
    root.__wired = true;

    const dropdowns = Array.from(root.querySelectorAll(".dropdown"));

    function setExpanded(dd, open) {
      dd.classList.toggle("open", open);
      const btn = dd.querySelector(".dropbtn");
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function closeAll(except) {
      dropdowns.forEach(d => {
        if (d !== except && d.classList.contains("open")) {
          d.classList.remove("open");
          const b = d.querySelector(".dropbtn");
          if (b) b.setAttribute("aria-expanded", "false");
        }
      });
    }

    // Attach handlers to each dropdown's button
    dropdowns.forEach(dd => {
      const btn = dd.querySelector(".dropbtn");
      if (!btn) return;

      let touched = false; // suppress synthetic click after touch

      // Touch first: open/close immediately on mobile
      btn.addEventListener("touchstart", () => {
        touched = true;
        const willOpen = !dd.classList.contains("open");
        closeAll(dd);
        setExpanded(dd, willOpen);
        // reset the flag shortly after to ignore the follow-up click
        setTimeout(() => { touched = false; }, 350);
      }, { passive: true });

      // Click (desktop, or mobile fallback)
      btn.addEventListener("click", (e) => {
        if (touched) return; // ignore ghost click after touchstart
        // No preventDefault: it's a button, not a link; but keep it simple
        e.stopPropagation(); // avoid immediate outside-close
        const willOpen = !dd.classList.contains("open");
        closeAll(dd);
        setExpanded(dd, willOpen);
      });

      // Menu item click: close the menu (do NOT block navigation)
      dd.querySelectorAll(".dropdown-menu a").forEach(a => {
        a.addEventListener("click", () => setExpanded(dd, false));
      });
    });

    // Click outside any dropdown → close all (desktop & mobile)
    document.addEventListener("click", (e) => {
      if (!root.contains(e.target)) {
        closeAll();
      }
    });

    // Keyboard accessibility
    document.addEventListener("keydown", (e) => {
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

    // Close on viewport change
    window.addEventListener("resize", () => closeAll());
    window.addEventListener("orientationchange", () => closeAll());
  }
})();
