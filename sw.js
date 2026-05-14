const CACHE    = "deutsch-v3";
const PRECACHE = [
  "/", "/index.html", "/style.css", "/manifest.json",
  "/js/app.js", "/js/sr.js", "/js/data.js", "/js/state.js",
  "/js/tts.js", "/js/router.js",
  "/js/screens/home.js", "/js/screens/browse.js",
  "/js/screens/flashcard.js", "/js/screens/stats-screen.js",
  "/js/screens/bookmarks-screen.js", "/js/screens/settings.js",
  "/data/p75-88.json", "/data/p89-102.json", "/data/extra-b1b2.json",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request))
      .catch(() => caches.match("/index.html"))
  );
});
