/* /assets/nav.js
   Simple & stable navbar loader + dropdown (the version that worked)
   - Loads /partials/nav.html (base from script[data-base])
   - Single 'pointerup' delegation (prevents touch/click double toggles)
   - Never prevents default on links → menu selection always navigates
   - Close on outside tap/click, ESC, resize/orientation
   - Keeps --nav-height CSS var for mobile overlay positioning
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

  // 2) Dropdown logic (single 'pointerup' delegation)
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

      // 2) Clicking an item: close menu, let link navigate
      const link = e.target.closest && e.target.closest(".dropdown-menu a");
      if (link) {
        const dd = link.closest(".dropdown");
        if (dd) setExpanded(dd, false);
        return; // DO NOT preventDefault → navigation proceeds
      }

      // 3) Tap outside: close all
      if (!e.target.closest(".dropdown")) closeAll();
    }, true); // capture phase to run reliably on mobile

    // Keyboard accessibility
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

    // Close on viewport change
    window.addEventListener("resize", () => closeAll());
    window.addEventListener("orientationchange", () => closeAll());
  }
})();
