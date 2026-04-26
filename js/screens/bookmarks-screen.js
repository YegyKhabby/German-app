import { loadBookmarks } from "../state.js";
import { getAllWords } from "../data.js";
import { navigate } from "../router.js";

export function renderBookmarks() {
  const ids   = loadBookmarks();
  const all   = getAllWords();
  const words = ids.map(id => all.find(w => w.id === id)).filter(Boolean);
  const body  = document.getElementById("bookmarks-body");
  body.textContent = "";

  document.getElementById("review-bookmarks-btn").onclick = () => {
    if (!words.length) return;
    window._pendingSession = { words, source: "bookmarks" };
    navigate("flashcard");
  };

  if (!words.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No saved words yet. Tap the star on any card to save it.";
    body.appendChild(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "bookmark-list";
  words.forEach(w => {
    const item  = document.createElement("div");
    item.className = "bookmark-item";
    const left  = document.createElement("div");
    const de    = document.createElement("div");
    de.className = "de";
    de.textContent = w.german;
    const en    = document.createElement("div");
    en.className = "en";
    en.textContent = w.english;
    const arrow = document.createElement("span");
    arrow.style.color = "var(--subtle)";
    arrow.textContent = "\u203A";
    left.append(de, en);
    item.append(left, arrow);
    item.onclick = () => {
      window._activeBatch = w.batchId;
      window._scrollToWord = w.id;
      navigate("browse");
    };
    list.appendChild(item);
  });
  body.appendChild(list);
}
