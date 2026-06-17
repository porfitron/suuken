#!/usr/bin/env node
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'www');

const entries = [
  'index.html',
  'css',
  'js',
  'icons',
  'sounds',
  'sw.js',
  'manifest.webmanifest',
  'robots.txt',
  'sitemap.xml',
];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const entry of entries) {
  cpSync(join(root, entry), join(out, entry), { recursive: true });
}

console.log(`Copied web assets to ${out}`);
