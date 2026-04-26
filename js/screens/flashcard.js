import { speak } from "../tts.js";
import { rateCard } from "../sr.js";
import { recordReview, markMastered } from "../state.js";
import { navigate } from "../router.js";

let _session = null;

export function startSession(words, source) {
  _session = { words, source, mode: null, index: 0, reviewed: [] };
  renderModeSelect();
}

export function renderFlashcard() {
  if (!_session) { navigate("home"); return; }
  if (!_session.mode) { renderModeSelect(); return; }
  renderCard();
}

// ── helpers ──────────────────────────────────────────────────────────────────

function getRoot() {
  return document.getElementById("flashcard-body");
}

function clearRoot() {
  const root = getRoot();
  root.textContent = "";
  return root;
}

// ── Mode select ───────────────────────────────────────────────────────────────

function renderModeSelect() {
  const root = clearRoot();

  const container = document.createElement("div");
  container.className = "session-mode-select";

  const title = document.createElement("h2");
  title.textContent = "Choose a mode";
  container.appendChild(title);

  const deBtn = document.createElement("button");
  deBtn.className = "mode-btn";
  deBtn.textContent = "DE \u2192 EN";
  deBtn.onclick = () => { _session.mode = "de-en"; renderCard(); };
  container.appendChild(deBtn);

  const enBtn = document.createElement("button");
  enBtn.className = "mode-btn";
  enBtn.textContent = "EN \u2192 DE";
  enBtn.onclick = () => { _session.mode = "en-de"; renderCard(); };
  container.appendChild(enBtn);

  root.appendChild(container);
}

// ── Card rendering ────────────────────────────────────────────────────────────

function renderCard() {
  if (_session.index >= _session.words.length) {
    renderComplete();
    return;
  }

  const root = clearRoot();
  const today = new Date().toISOString().slice(0, 10);
  const word = _session.words[_session.index];
  const isDeEn = _session.mode === "de-en";

  // Outer session wrapper
  const session = document.createElement("div");
  session.className = "flashcard-session";

  // Progress bar
  const progressWrap = document.createElement("div");
  progressWrap.className = "session-progress";

  const bar = document.createElement("div");
  bar.className = "progress-bar";

  const fill = document.createElement("div");
  fill.className = "progress-fill";
  const pct = Math.round((_session.index / _session.words.length) * 100);
  fill.style.width = pct + "%";

  bar.appendChild(fill);

  const progressText = document.createElement("div");
  progressText.className = "progress-text";
  progressText.textContent =
    (_session.index + 1) + " / " + _session.words.length;

  progressWrap.appendChild(bar);
  progressWrap.appendChild(progressText);
  session.appendChild(progressWrap);

  // Flip card
  const flipCard = document.createElement("div");
  flipCard.className = "flip-card";

  const flipInner = document.createElement("div");
  flipInner.className = "flip-card-inner";

  // ── Front face ──
  const front = document.createElement("div");
  front.className = "flip-card-front";

  const frontPrompt = document.createElement("div");
  frontPrompt.className = "prompt";
  frontPrompt.textContent = isDeEn ? word.german : word.english;
  front.appendChild(frontPrompt);

  if (isDeEn) {
    const speakBtn = document.createElement("button");
    speakBtn.className = "speak-btn";
    speakBtn.textContent = "\uD83D\uDD0A";
    speakBtn.setAttribute("aria-label", "Speak");
    speakBtn.onclick = (e) => { e.stopPropagation(); speak(word.german); };
    front.appendChild(speakBtn);
  }

  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = "Tap to reveal";
  front.appendChild(hint);

  // ── Back face ──
  const back = document.createElement("div");
  back.className = "flip-card-back";

  const backAnswer = document.createElement("div");
  backAnswer.className = "answer";
  backAnswer.textContent = isDeEn ? word.english : word.german;
  back.appendChild(backAnswer);

  // Speak button on back (always plays German)
  const backSpeakBtn = document.createElement("button");
  backSpeakBtn.className = "speak-btn";
  backSpeakBtn.textContent = "\uD83D\uDD0A";
  backSpeakBtn.setAttribute("aria-label", "Speak");
  backSpeakBtn.onclick = (e) => { e.stopPropagation(); speak(word.german); };
  back.appendChild(backSpeakBtn);

  // Examples (first 2)
  if (word.examples && word.examples.length) {
    const examplesEl = document.createElement("div");
    examplesEl.className = "examples";

    word.examples.slice(0, 2).forEach((ex) => {
      const exEl = document.createElement("div");
      exEl.className = "example";

      const deEl = document.createElement("div");
      deEl.className = "de";
      deEl.textContent = ex.de || ex.german || "";

      const enEl = document.createElement("div");
      enEl.className = "en";
      enEl.textContent = ex.en || ex.english || "";

      exEl.appendChild(deEl);
      exEl.appendChild(enEl);
      examplesEl.appendChild(exEl);
    });

    back.appendChild(examplesEl);
  }

  // Rating buttons (hidden until flipped)
  const ratingButtons = document.createElement("div");
  ratingButtons.className = "rating-buttons hidden";

  const ratings = [
    { label: "Again", quality: 1, cls: "again" },
    { label: "Hard",  quality: 3, cls: "hard"  },
    { label: "Good",  quality: 4, cls: "good"  },
    { label: "Easy",  quality: 5, cls: "easy"  },
  ];

  ratings.forEach(({ label, quality, cls }) => {
    const btn = document.createElement("button");
    btn.className = "rating-btn " + cls;
    btn.textContent = label;
    btn.onclick = (e) => {
      e.stopPropagation();
      rateCard(word.id, quality, today);
      _session.reviewed.push(word.id);
      if (quality >= 4) markMastered(word.id);
      _session.index++;
      renderCard();
    };
    ratingButtons.appendChild(btn);
  });

  back.appendChild(ratingButtons);

  // Tap-to-flip handler
  flipCard.onclick = () => {
    if (!flipCard.classList.contains("flipped")) {
      flipCard.classList.add("flipped");
      ratingButtons.classList.remove("hidden");
    }
  };

  flipInner.appendChild(front);
  flipInner.appendChild(back);
  flipCard.appendChild(flipInner);
  session.appendChild(flipCard);
  root.appendChild(session);
}

// ── Complete screen ───────────────────────────────────────────────────────────

function renderComplete() {
  const today = new Date().toISOString().slice(0, 10);
  recordReview(_session.reviewed, today);

  const reviewed = _session.reviewed.length;
  const root = clearRoot();

  const container = document.createElement("div");
  container.className = "session-complete";

  const emoji = document.createElement("div");
  emoji.className = "big";
  emoji.textContent = "\uD83C\uDF89";
  container.appendChild(emoji);

  const title = document.createElement("h2");
  title.textContent = "Session complete!";
  container.appendChild(title);

  const count = document.createElement("p");
  count.textContent = reviewed + " card" + (reviewed !== 1 ? "s" : "") + " reviewed";
  container.appendChild(count);

  const homeBtn = document.createElement("button");
  homeBtn.className = "mode-btn";
  homeBtn.textContent = "Back to home";
  homeBtn.onclick = () => { _session = null; navigate("home"); };
  container.appendChild(homeBtn);

  root.appendChild(container);
}
