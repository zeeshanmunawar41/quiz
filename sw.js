// sw.js — Service worker: cache app shell for offline PWA support
const CACHE_NAME = "quiz-platform-v1";
const ASSETS = [
  "./",
  "index.html",
  "css/styles.css",
  "js/config.js",
  "js/i18n.js",
  "js/storage.js",
  "js/auth.js",
  "js/quiz.js",
  "js/dashboard.js",
  "js/app.js",
  "manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  // Network-first for question JSON (always fresh), cache-first for shell.
  if (req.url.includes("/questions/")) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(req, copy));
      return res;
    }).catch(() => cached))
  );
});