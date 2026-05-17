import { getBatches, loadAllBatches, loadBatch, getAllWords, buildSearchIndex, search, getWordById } from "../data.js";
import { loadStats, localDateStr } from "../state.js";
import { getDueIds } from "../sr.js";
import { navigate } from "../router.js";

export async function renderHome() {
  await loadAllBatches();
  buildSearchIndex();
  updateStats();
  renderBatchPills();
  setupSearch();
  setupReviewButton();
}

function updateStats() {
  const stats  = loadStats();
  const allIds = getAllWords().map(w => w.id);
  const today  = localDateStr();
  document.getElementById("stat-streak").textContent   = stats.streak;
  document.getElementById("stat-mastered").textContent = stats.mastered.length;
  document.getElementById("stat-due").textContent      = getDueIds(allIds, today).length;
}

function renderBatchPills() {
  const container = document.getElementById("batch-pills");
  container.textContent = "";
  getBatches().forEach(batch => {
    const row = document.createElement("div");
    row.className = "batch-row";

    const browseBtn = document.createElement("button");
    browseBtn.className   = "batch-pill";
    browseBtn.textContent = batch.label;
    browseBtn.onclick = () => { window._activeBatch = batch.id; navigate("browse"); };

    const quizBtn = document.createElement("button");
    quizBtn.className   = "batch-quiz-btn";
    quizBtn.title       = "Quiz this batch";
    quizBtn.textContent = "🎯";
    quizBtn.onclick = async () => {
      quizBtn.disabled = true;
      quizBtn.textContent = "…";
      const days = await loadBatch(batch.id);
      const words = days.flatMap(d => d.words);
      window._pendingSession = { words, source: batch.label };
      navigate("flashcard");
    };

    row.appendChild(browseBtn);
    row.appendChild(quizBtn);
    container.appendChild(row);
  });
}

function setupReviewButton() {
  document.getElementById("start-review-btn").onclick = () => {
    const allWords = getAllWords();
    const today    = localDateStr();
    const dueIds   = getDueIds(allWords.map(w => w.id), today);
    const dueWords = dueIds.map(id => allWords.find(w => w.id === id)).filter(Boolean);
    if (!dueWords.length) { alert("No cards due today!"); return; }
    window._pendingSession = { words: dueWords, source: "due today" };
    navigate("flashcard");
  };
}

function setupSearch() {
  const toggleBtn = document.getElementById("search-toggle-btn");
  const container = document.getElementById("search-bar-container");
  const homeMain  = document.getElementById("home-main");
  const input     = document.getElementById("search-input");
  const resultsEl = document.getElementById("search-results");

  toggleBtn.onclick = () => {
    const isOpen = !container.classList.contains("hidden");
    container.classList.toggle("hidden", isOpen);
    homeMain.classList.toggle("hidden", !isOpen);
    if (!isOpen) input.focus();
  };

  input.addEventListener("input", () => {
    resultsEl.textContent = "";
    search(input.value).forEach(r => {
      const item = document.createElement("div"); item.className = "search-result-item";
      const de   = document.createElement("div"); de.className = "de"; de.textContent = getWordById(r.id)?.german || r.id;
      const en   = document.createElement("div"); en.className = "en"; en.textContent = getWordById(r.id)?.english || "";
      item.append(de, en);
      item.onclick = () => {
        window._activeBatch  = r.batchId;
        window._scrollToWord = r.id;
        navigate("browse");
      };
      resultsEl.appendChild(item);
    });
  });
}
