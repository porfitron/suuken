#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const iconsDir = join(root, 'icons');
const fontsDir = join(iconsDir, 'fonts');

const fontFiles = [
  join(fontsDir, 'Anybody-BlackItalic.ttf'),
  join(fontsDir, 'HankenGrotesk-Regular.ttf'),
  join(fontsDir, 'JetBrainsMono-Bold.ttf'),
];

const resvgOpts = {
  font: {
    fontFiles,
    loadSystemFonts: false,
    defaultFontFamily: 'Anybody',
  },
};

function renderSvg(svgPath, outPath, width, height) {
  const svg = readFileSync(svgPath, 'utf8');
  const resvg = new Resvg(svg, {
    ...resvgOpts,
    fitTo: { mode: 'width', value: width },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  writeFileSync(outPath, pngBuffer);
  console.log(`Wrote ${outPath} (${width}${height && height !== width ? `×${height}` : ''})`);
}

const exports_ = [
  { svg: 'icon.svg', out: 'icon-192.png', width: 192 },
  { svg: 'icon.svg', out: 'icon-512.png', width: 512 },
  { svg: 'icon-maskable.svg', out: 'icon-512-maskable.png', width: 512 },
  { svg: 'icon.svg', out: 'apple-touch-icon.png', width: 180 },
  { svg: 'icon.svg', out: 'favicon-32.png', width: 32 },
  { svg: 'og-image.svg', out: 'og-image.png', width: 1200 },
];

for (const item of exports_) {
  renderSvg(join(iconsDir, item.svg), join(iconsDir, item.out), item.width);
}

// Keep scaled SVG sources in sync for browsers that prefer SVG.
writeFileSync(
  join(iconsDir, 'icon-192.svg'),
  readFileSync(join(iconsDir, 'icon.svg'), 'utf8').replace('viewBox="0 0 512 512"', 'viewBox="0 0 512 512" width="192" height="192"')
);
writeFileSync(
  join(iconsDir, 'icon-512.svg'),
  readFileSync(join(iconsDir, 'icon.svg'), 'utf8').replace('viewBox="0 0 512 512"', 'viewBox="0 0 512 512" width="512" height="512"')
);

console.log('Done.');
