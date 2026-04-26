const BATCHES = [
  { id: "p47-60", label: "p.47-60", file: "data/p47-60.json" },
  { id: "p61-74", label: "p.61-74", file: "data/p61-74.json" },
  { id: "p75-88", label: "p.75-88", file: "data/p75-88.json" },
];

let _cache = {};
let _index = null;

export function getBatches() { return BATCHES; }

export async function loadBatch(batchId) {
  if (_cache[batchId]) return _cache[batchId];
  const entry = BATCHES.find(b => b.id === batchId);
  if (!entry) throw new Error("Unknown batch: " + batchId);
  const res  = await fetch(entry.file);
  if (!res.ok) throw new Error("Failed to load " + entry.file);
  const days = await res.json();
  _cache[batchId] = days.map(day => ({
    ...day, words: day.words.map(w => ({ ...w, batchId })),
  }));
  return _cache[batchId];
}

export async function loadAllBatches() {
  await Promise.all(BATCHES.map(b => loadBatch(b.id)));
}

export function getAllWords() {
  return BATCHES.flatMap(b => (_cache[b.id] || []).flatMap(day => day.words));
}

export function buildSearchIndex() {
  _index = getAllWords().map(w => ({
    id: w.id, german: w.german.toLowerCase(), english: w.english.toLowerCase(), batchId: w.batchId,
  }));
}

export function search(query) {
  if (!_index || !query.trim()) return [];
  const q = query.toLowerCase().trim();
  return _index.filter(w => w.german.includes(q) || w.english.includes(q)).slice(0, 30);
}

export function getWordById(id) {
  for (const days of Object.values(_cache))
    for (const day of days) { const w = day.words.find(w => w.id === id); if (w) return w; }
  return null;
}
