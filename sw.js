const CACHE = 'kinkeda-v5';
const ASSETS = [
  './',
  './index.html',
  './css/kinkeda.css',
  './manifest.webmanifest',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/og-image.png',
  './robots.txt',
  './sitemap.xml',
  './sounds/match_freesound_community-cheering-and-clapping-crowd-1-5995.mp3',
  './sounds/winner_freesound_community-group_yay_cheer-101509.mp3',
  './sounds/suspense_universfield-crowd-disappointment-reaction-352718.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
