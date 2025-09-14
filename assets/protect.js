/**
 * project.js
 * Global protection script to prevent copying, right-click and dragging
 * Note: This only prevents casual copying. Screenshots or dev tools can still capture content.
 */

// Disable right-click context menu
document.addEventListener("contextmenu", e => e.preventDefault());

// Disable drag (useful for images)
document.addEventListener("dragstart", e => e.preventDefault());

// Disable text selection
document.addEventListener("selectstart", e => e.preventDefault());

// Optionally block copy event (e.g., Ctrl+C / Command+C)
document.addEventListener("copy", e => {
  e.preventDefault();
  alert("Copying is disabled on this site.");
});
