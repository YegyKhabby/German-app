export function computeNext(card, quality, today) {
  let { interval, easiness, repetitions } = card;
  if (quality >= 3) {
    if (repetitions === 0)      interval = 1;
    else if (repetitions === 1) interval = 6;
    else                        interval = Math.round(interval * easiness);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval    = 1;
  }
  easiness = Math.max(1.3,
    easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );
  return {
    interval,
    easiness:    Math.round(easiness * 1000) / 1000,
    repetitions,
    next_review: addDays(today, interval),
  };
}

export function isDue(card, today) { return card.next_review <= today; }

export function newCard(today) {
  return { interval: 1, easiness: 2.5, repetitions: 0, next_review: today };
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function loadSRState() {
  try { return JSON.parse(localStorage.getItem("sr_state")) || {}; }
  catch { return {}; }
}

export function saveSRState(state) {
  localStorage.setItem("sr_state", JSON.stringify(state));
}

export function rateCard(wordId, quality, today) {
  const state   = loadSRState();
  const card    = state[wordId] || newCard(today);
  state[wordId] = computeNext(card, quality, today);
  saveSRState(state);
  return state[wordId];
}

export function getDueIds(allIds, today) {
  const state = loadSRState();
  return allIds.filter(id => { const c = state[id]; return !c || isDue(c, today); });
}
