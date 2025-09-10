(function () {
  const thisScript = document.currentScript;
  const base = (thisScript && thisScript.dataset && thisScript.dataset.base) || "";
  const navUrl = base ? base.replace(/\/?$/, "/") + "partials/nav.html" : "partials/nav.html";

fetch(navUrl, { cache: 'no-store' })
    .then(r => r.text())
    .then(html => {
      const mount = document.getElementById("site-nav");
      if (!mount) return;
      mount.innerHTML = html;

      wireDropdown("people-dd");
      wireDropdown("publications-dd");
      wireDropdown("news-dd");
    })
    .catch(err => console.error("Nav load error:", err));

  function wireDropdown(id) {
    const dd = document.getElementById(id);
    if (!dd) return;

    const btn = dd.querySelector(".dropbtn");
    if (!btn) return;

    btn.addEventListener("click", e => {
      e.preventDefault();
      dd.classList.toggle("open");
    });

    document.addEventListener("click", e => {
      if (!dd.contains(e.target)) dd.classList.remove("open");
    });
  }
})();
