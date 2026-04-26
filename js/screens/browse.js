import { loadBatch } from "../data.js";
import { speak } from "../tts.js";
import { isBookmarked, toggleBookmark } from "../state.js";
import { navigate } from "../router.js";

const BATCH_LABELS = { "p47-60": "p.47-60", "p61-74": "p.61-74", "p75-88": "p.75-88" };

export async function renderBrowse() {
  const batchId = window._activeBatch;
  if (!batchId) { navigate("home"); return; }
  const days = await loadBatch(batchId);
  document.getElementById("browse-title").textContent = BATCH_LABELS[batchId] || batchId;
  renderDayTabs(days);
  showDay(days[0]);
  document.getElementById("quiz-batch-btn").onclick = () => {
    window._pendingSession = { words: days.flatMap(d => d.words), source: batchId };
    navigate("flashcard");
  };
}

function renderDayTabs(days) {
  const container = document.getElementById("day-tabs");
  container.textContent = "";
  days.forEach((day, i) => {
    const btn = document.createElement("button");
    btn.className = "day-tab" + (i === 0 ? " active" : "");
    btn.textContent = "Day " + day.day;
    btn.onclick = () => {
      container.querySelectorAll(".day-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showDay(day);
    };
    container.appendChild(btn);
  });
}

function showDay(day) {
  const list = document.getElementById("word-list");
  list.textContent = "";

  if (day.insight) {
    const box = document.createElement("div");
    box.className = "language-notes-box";
    box.style.cssText = [
      "background-color:var(--surface)",
      "border:1px solid var(--surface2)",
      "border-left:3px solid var(--cyan)",
      "border-radius:var(--radius)",
      "padding:12px 14px",
      "margin-bottom:16px",
    ].join(";");

    const label = document.createElement("div");
    label.className = "section-label";
    label.style.marginBottom = "6px";
    label.textContent = "Language notes";

    const text = document.createElement("div");
    text.style.cssText = "font-size:0.875rem;color:var(--subtle);line-height:1.6";
    text.textContent = day.insight;

    box.appendChild(label);
    box.appendChild(text);
    list.appendChild(box);
  }

  day.words.forEach(word => {
    list.appendChild(buildWordCard(word));
  });

  const scrollTarget = window._scrollToWord;
  if (scrollTarget) {
    window._scrollToWord = null;
    const card = document.getElementById("card-" + scrollTarget);
    if (card) {
      requestAnimationFrame(() => card.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }
}

function buildWordCard(word) {
  const card = document.createElement("div");
  card.className = "word-card";
  card.id = "card-" + word.id;

  // --- Header ---
  const header = document.createElement("div");
  header.className = "card-header";

  const headerLeft = document.createElement("div");

  const german = document.createElement("div");
  german.className = "german";
  german.textContent = word.german;

  const pron = document.createElement("div");
  pron.className = "pron";
  pron.textContent = word.pronunciation || "";

  headerLeft.appendChild(german);
  headerLeft.appendChild(pron);

  const headerRight = document.createElement("div");
  headerRight.className = "card-actions";

  const speakBtn = document.createElement("button");
  speakBtn.className = "icon-btn";
  speakBtn.title = "Pronounce";
  speakBtn.textContent = "\uD83D\uDD0A";
  speakBtn.onclick = () => speak(word.german);

  const bookmarkBtn = document.createElement("button");
  bookmarkBtn.className = "icon-btn" + (isBookmarked(word.id) ? " bookmarked" : "");
  bookmarkBtn.title = "Bookmark";
  bookmarkBtn.textContent = isBookmarked(word.id) ? "\u2605" : "\u2606";
  bookmarkBtn.onclick = () => {
    const nowBookmarked = toggleBookmark(word.id);
    bookmarkBtn.textContent = nowBookmarked ? "\u2605" : "\u2606";
    bookmarkBtn.classList.toggle("bookmarked", nowBookmarked);
  };

  headerRight.appendChild(speakBtn);
  headerRight.appendChild(bookmarkBtn);

  header.appendChild(headerLeft);
  header.appendChild(headerRight);
  card.appendChild(header);

  // --- English + pos ---
  const english = document.createElement("div");
  english.className = "english";
  english.textContent = word.english;
  card.appendChild(english);

  if (word.pos) {
    const pos = document.createElement("span");
    pos.className = "pos-tag";
    pos.textContent = word.pos;
    card.appendChild(pos);
  }

  // --- Tab pills ---
  const tabDefs = buildTabDefs(word);

  const tabBar = document.createElement("div");
  tabBar.className = "card-tabs";

  const panels = document.createElement("div");
  panels.className = "card-tab-panels";

  tabDefs.forEach((tabDef, i) => {
    const pill = document.createElement("button");
    pill.className = "card-tab" + (i === 0 ? " active" : "");
    pill.textContent = tabDef.label;

    const panel = document.createElement("div");
    panel.className = "card-tab-panel" + (i === 0 ? " active" : "");
    panel.appendChild(buildTabContent(tabDef.id, word));

    pill.onclick = () => {
      tabBar.querySelectorAll(".card-tab").forEach(p => p.classList.remove("active"));
      panels.querySelectorAll(".card-tab-panel").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      panel.classList.add("active");
    };

    tabBar.appendChild(pill);
    panels.appendChild(panel);
  });

  card.appendChild(tabBar);
  card.appendChild(panels);

  return card;
}

function buildTabDefs(word) {
  const tabs = [
    { id: "breakdown", label: "Breakdown" },
  ];
  if (word.grammar_notes) {
    tabs.push({ id: "grammar", label: "Grammar" });
  }
  if (word.word_family && word.word_family.length > 0) {
    tabs.push({ id: "word-family", label: "Word Family" });
  }
  if (word.mnemonic) {
    tabs.push({ id: "mnemonic", label: "Mnemonic" });
  }
  tabs.push({ id: "examples", label: "Examples" });
  return tabs;
}

function buildTabContent(tabId, word) {
  const container = document.createElement("div");

  if (tabId === "breakdown") {
    const parts = document.createElement("div");
    parts.className = "breakdown-parts";

    (word.breakdown || []).forEach(item => {
      const row = document.createElement("div");
      row.className = "breakdown-part";

      const partEl = document.createElement("span");
      partEl.className = "part-word";
      partEl.textContent = item.part;

      const meaning = document.createElement("span");
      meaning.className = "part-meaning";
      meaning.textContent = item.meaning;

      row.appendChild(partEl);
      row.appendChild(meaning);
      parts.appendChild(row);
    });

    container.appendChild(parts);

    if (word.breakdown_note) {
      const note = document.createElement("div");
      note.className = "breakdown-note";
      note.textContent = word.breakdown_note;
      container.appendChild(note);
    }

  } else if (tabId === "grammar") {
    const gt = document.createElement("div");
    gt.className = "grammar-text";
    gt.textContent = word.grammar_notes;
    container.appendChild(gt);

  } else if (tabId === "word-family") {
    const list = document.createElement("div");
    list.className = "word-family-list";

    (word.word_family || []).forEach(item => {
      const row = document.createElement("div");
      row.className = "word-family-item";

      if (typeof item === "string") {
        const span = document.createElement("span");
        span.className = "wf-word";
        span.textContent = item;
        row.appendChild(span);
      } else {
        const wordEl = document.createElement("span");
        wordEl.className = "wf-word";
        wordEl.textContent = item.word || item.german || "";

        const meaningEl = document.createElement("span");
        meaningEl.className = "wf-meaning";
        meaningEl.textContent = item.meaning || item.english || "";

        row.appendChild(wordEl);
        row.appendChild(meaningEl);
      }

      list.appendChild(row);
    });

    container.appendChild(list);

  } else if (tabId === "mnemonic") {
    const mt = document.createElement("div");
    mt.className = "mnemonic-text";
    const icon = document.createTextNode("\uD83D\uDCA1 ");
    mt.appendChild(icon);
    mt.appendChild(document.createTextNode(word.mnemonic));
    container.appendChild(mt);

  } else if (tabId === "examples") {
    const allExamples = [
      ...(word.examples || []),
      ...(word.present_examples || []),
    ];

    if (allExamples.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "font-size:0.85rem;color:var(--subtle);font-style:italic";
      empty.textContent = "No examples available.";
      container.appendChild(empty);
    } else {
      allExamples.forEach(ex => {
        const block = document.createElement("div");
        block.className = "example";

        const de = document.createElement("div");
        de.className = "de";
        de.textContent = ex.de;

        const en = document.createElement("div");
        en.className = "en";
        en.textContent = ex.en;

        block.appendChild(de);
        block.appendChild(en);
        container.appendChild(block);
      });
    }
  }

  return container;
}
