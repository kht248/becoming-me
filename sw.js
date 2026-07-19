// Minimal service worker: caches ONLY the wrapper shell (html, manifest,
// icons) so the app is installable and launches instantly. It never
// touches Apps Script traffic — the Google Sheet stays the single
// source of truth, exactly as in the main app.
const CACHE = 'becoming-me-shell-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Never intercept the Apps Script app itself.
  if (url.includes('script.google.com') || url.includes('googleusercontent.com')) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request))
  );
});
