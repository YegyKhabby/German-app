const handlers = {};

export function register(screenId, onEnter) { handlers[screenId] = onEnter; }

export function navigate(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  const screen = document.getElementById("screen-" + screenId);
  if (screen) screen.classList.add("active");
  const btn = document.querySelector(".nav-btn[data-screen='" + screenId + "']");
  if (btn) btn.classList.add("active");
  if (handlers[screenId]) handlers[screenId]();
  window.location.hash = screenId;
}

export function initRouter(defaultScreen) {
  const hash = window.location.hash.slice(1);
  navigate(hash && document.getElementById("screen-" + hash) ? hash : defaultScreen);
  window.addEventListener("hashchange", () => {
    const id = window.location.hash.slice(1);
    if (id && document.getElementById("screen-" + id)) navigate(id);
  });
}
