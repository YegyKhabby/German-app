import { register, initRouter, navigate } from "./router.js";
import { renderHome } from "./screens/home.js";
import { renderBrowse } from "./screens/browse.js";
import { renderFlashcard, startSession } from "./screens/flashcard.js";
import { renderStats } from "./screens/stats-screen.js";
import { renderBookmarks } from "./screens/bookmarks-screen.js";
import { renderSettings } from "./screens/settings.js";

function goFlashcard() {
  if (window._pendingSession) {
    startSession(window._pendingSession.words, window._pendingSession.source);
    window._pendingSession = null;
  } else {
    renderFlashcard();
  }
}

register("home",      renderHome);
register("browse",    renderBrowse);
register("flashcard", goFlashcard);
register("stats",     renderStats);
register("bookmarks", renderBookmarks);
register("settings",  renderSettings);

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => navigate(btn.dataset.screen));
});
document.getElementById("flashcard-close-btn").addEventListener("click", () => navigate("home"));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(console.error));
}

initRouter("home");
