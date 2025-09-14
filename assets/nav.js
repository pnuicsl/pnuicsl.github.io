(function () {
  // Get the base path for nav.html
  const thisScript = document.currentScript;
  const base = (thisScript && thisScript.dataset && thisScript.dataset.base) || "";
  const navUrl = base ? base.replace(/\/?$/, "/") + "partials/nav.html" : "partials/nav.html";

  // Load nav.html dynamically into #site-nav
  fetch(navUrl, { cache: "no-store" })
    .then(r => r.text())
    .then(html => {
      const mount = document.getElementById("site-nav");
      if (!mount) return;
      mount.innerHTML = html;

      // Initialize dropdown menus
      wireDropdown("people-dd");
      wireDropdown("publications-dd");
      wireDropdown("news-dd");
    })
    .catch(err => console.error("Nav load error:", err));

  /**
   * Attach event handlers to a dropdown
   * @param {string} id - The dropdown element id
   */
  function wireDropdown(id) {
    const dd = document.getElementById(id);
    if (!dd) return;

    const btn = dd.querySelector(".dropbtn");
    if (!btn) return;

    /**
     * Toggle dropdown open/close
     */
    function toggleDropdown(e) {
      e.preventDefault();
      const isOpen = dd.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen);
    }

    // Listen for both click (desktop) and touchstart (mobile Safari)
    btn.addEventListener("click", toggleDropdown);
    btn.addEventListener("touchstart", toggleDropdown, { passive: true });

    /**
     * Close dropdown when clicking/tapping outside
     */
    function closeDropdown(e) {
      if (!dd.contains(e.target)) {
        dd.classList.remove("open");
        btn.setAttribute("aria-expanded", false);
      }
    }

    document.addEventListener("click", closeDropdown);
    document.addEventListener("touchstart", closeDropdown, { passive: true });
  }
})();
