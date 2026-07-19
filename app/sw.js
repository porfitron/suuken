const CACHE = 'kinkeda-v8';
const ASSETS = [
  '/app/',
  '/app/index.html',
  '/app/manifest.webmanifest',
  '/css/fonts.css',
  '/css/tailwind.css',
  '/css/kinkeda.css',
  '/js/analytics.js',
  '/js/orientation-lock.js',
  '/js/native-loading.js',
  '/js/native-share.js',
  '/js/match-haptics.js',
  /* fonts:start */
  '/fonts/anybody-5a30992816.woff2',
  '/fonts/anybody-5bd1aa5ec5.woff2',
  '/fonts/anybody-c518cc83a9.woff2',
  '/fonts/anybody-c74634c6fa.woff2',
  '/fonts/hanken-grotesk-7579623a5e.woff2',
  '/fonts/hanken-grotesk-c95efb8735.woff2',
  '/fonts/jetbrains-mono-98f7dd64bf.woff2',
  '/fonts/jetbrains-mono-9a6a56f9ea.woff2',
  '/fonts/material-symbols-f9287acd13.woff2',
  /* fonts:end */
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32.png',
  '/icons/og-image.png',
  '/sounds/match_freesound_community-cheering-and-clapping-crowd-1-5995.mp3',
  '/sounds/winner_freesound_community-group_yay_cheer-101509.mp3',
  '/sounds/suspense_universfield-crowd-disappointment-reaction-352718.mp3',
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
