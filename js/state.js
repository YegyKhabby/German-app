const STATS_KEY     = "stats";
const BOOKMARKS_KEY = "bookmarks";

function defaultStats() {
  return { streak: 0, last_review_date: null, mastered: [], daily_counts: {} };
}

export function loadStats() {
  try { return JSON.parse(localStorage.getItem(STATS_KEY)) || defaultStats(); }
  catch { return defaultStats(); }
}

export function saveStats(stats) { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); }

export function recordReview(wordIds, today) {
  const stats     = loadStats();
  const yesterday = addDays(today, -1);
  if      (stats.last_review_date === today)     { /* already counted */ }
  else if (stats.last_review_date === yesterday) { stats.streak += 1; }
  else                                           { stats.streak  = 1; }
  stats.last_review_date    = today;
  stats.daily_counts[today] = (stats.daily_counts[today] || 0) + wordIds.length;
  saveStats(stats);
}

export function markMastered(wordId) {
  const stats = loadStats();
  if (!stats.mastered.includes(wordId)) { stats.mastered.push(wordId); saveStats(stats); }
}

export function getDailyCountsLast14(today) {
  const stats = loadStats();
  return Array.from({ length: 14 }, (_, i) => {
    const date = addDays(today, i - 13);
    return { date, count: stats.daily_counts[date] || 0 };
  });
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function loadBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || []; } catch { return []; }
}

export function toggleBookmark(wordId) {
  const bm  = loadBookmarks();
  const idx = bm.indexOf(wordId);
  if (idx === -1) bm.push(wordId); else bm.splice(idx, 1);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bm));
  return bm.includes(wordId);
}

export function isBookmarked(wordId) { return loadBookmarks().includes(wordId); }

export function exportBackup() {
  return JSON.stringify({
    version:   1,
    sr_state:  JSON.parse(localStorage.getItem("sr_state")   || "{}"),
    stats:     JSON.parse(localStorage.getItem(STATS_KEY)    || "{}"),
    bookmarks: JSON.parse(localStorage.getItem(BOOKMARKS_KEY)|| "[]"),
  }, null, 2);
}

export function importBackup(json) {
  const data = JSON.parse(json);
  if (data.version !== 1) throw new Error("Unknown backup version");
  localStorage.setItem("sr_state",    JSON.stringify(data.sr_state  || {}));
  localStorage.setItem(STATS_KEY,     JSON.stringify(data.stats     || defaultStats()));
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(data.bookmarks || []));
}
