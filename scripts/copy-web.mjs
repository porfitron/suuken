#!/usr/bin/env node
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'www');

const sharedEntries = ['css', 'js', 'icons', 'sounds', 'robots.txt', 'sitemap.xml'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const entry of sharedEntries) {
  cpSync(join(root, entry), join(out, entry), { recursive: true });
}

let appHtml = readFileSync(join(root, 'app', 'index.html'), 'utf8');
appHtml = appHtml.replace(/\.\.\//g, '');
writeFileSync(join(out, 'index.html'), appHtml);

let manifest = readFileSync(join(root, 'app', 'manifest.webmanifest'), 'utf8');
manifest = manifest
  .replaceAll('"/app/"', '"./"')
  .replaceAll('"/icons/', '"icons/');
writeFileSync(join(out, 'manifest.webmanifest'), manifest);

const nativeSw = `const CACHE = 'kinkeda-v6';
const ASSETS = [
  './',
  './index.html',
  './css/kinkeda.css',
  './manifest.webmanifest',
  './js/analytics.js',
  './js/orientation-lock.js',
  './js/native-loading.js',
  './js/match-haptics.js',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/og-image.png',
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
`;
writeFileSync(join(out, 'sw.js'), nativeSw);

console.log(`Copied web assets to ${out}`);
