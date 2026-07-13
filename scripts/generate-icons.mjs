#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ANDROID_RES = join(dirname(fileURLToPath(import.meta.url)), '..', 'android', 'app', 'src', 'main', 'res');
// Adaptive foreground: 108 dp canvas, 66 dp safe zone, 12% inset inside safe zone per side.
const ADAPTIVE_CANVAS = 108;
const ADAPTIVE_SAFE_ZONE = 66;
const ADAPTIVE_INSET = 0.12;
const ADAPTIVE_BOX_ORIGIN =
  (ADAPTIVE_CANVAS - ADAPTIVE_SAFE_ZONE) / 2 + ADAPTIVE_SAFE_ZONE * ADAPTIVE_INSET;
const ADAPTIVE_BOX_SIZE = ADAPTIVE_SAFE_ZONE * (1 - 2 * ADAPTIVE_INSET);
const ADAPTIVE_SCALE = ADAPTIVE_BOX_SIZE / 512;
const ANDROID_DENSITIES = [
  { folder: 'mipmap-mdpi', launcher: 48, foreground: 108 },
  { folder: 'mipmap-hdpi', launcher: 72, foreground: 162 },
  { folder: 'mipmap-xhdpi', launcher: 96, foreground: 216 },
  { folder: 'mipmap-xxhdpi', launcher: 144, foreground: 324 },
  { folder: 'mipmap-xxxhdpi', launcher: 192, foreground: 432 },
];

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

function buildAdaptiveForegroundSvg(iconSvgPath) {
  const iconSvg = readFileSync(iconSvgPath, 'utf8');
  const defsMatch = iconSvg.match(/<defs>[\s\S]*?<\/defs>/);
  const contentMatch = iconSvg.match(/<\/defs>\s*([\s\S]*?)<\/svg>/);
  if (!defsMatch || !contentMatch) {
    throw new Error(`Could not parse icon SVG: ${iconSvgPath}`);
  }

  const foregroundContent = contentMatch[1]
    .replace(/<rect\b[^>]*\/>/g, '')
    .trim();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ADAPTIVE_CANVAS} ${ADAPTIVE_CANVAS}" fill="none">
  ${defsMatch[0]}
  <g transform="translate(${ADAPTIVE_BOX_ORIGIN} ${ADAPTIVE_BOX_ORIGIN}) scale(${ADAPTIVE_SCALE})">
    ${foregroundContent}
  </g>
</svg>
`;
}

function renderSvgString(svg, outPath, width, height) {
  const resvg = new Resvg(svg, {
    ...resvgOpts,
    fitTo: { mode: 'width', value: width },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  writeFileSync(outPath, pngBuffer);
  console.log(`Wrote ${outPath} (${width}${height && height !== width ? `×${height}` : ''})`);
}

function renderSvg(svgPath, outPath, width, height) {
  renderSvgString(readFileSync(svgPath, 'utf8'), outPath, width, height);
}

const exports_ = [
  { svg: 'icon.svg', out: 'icon-192.png', width: 192 },
  { svg: 'icon.svg', out: 'icon-512.png', width: 512 },
  { svg: 'icon.svg', out: 'app-icon-1024.png', width: 1024 },
  { svg: 'icon-maskable.svg', out: 'icon-512-maskable.png', width: 512 },
  { svg: 'icon.svg', out: 'apple-touch-icon.png', width: 180 },
  { svg: 'icon.svg', out: 'favicon-32.png', width: 32 },
  { svg: 'og-image.svg', out: 'og-image.png', width: 1200 },
];

for (const item of exports_) {
  renderSvg(join(iconsDir, item.svg), join(iconsDir, item.out), item.width);
}

const iconSvg = join(iconsDir, 'icon.svg');
const adaptiveForegroundSvg = join(iconsDir, 'icon-adaptive-foreground.svg');
const adaptiveForeground = buildAdaptiveForegroundSvg(iconSvg);
writeFileSync(adaptiveForegroundSvg, adaptiveForeground);
for (const { folder, launcher, foreground } of ANDROID_DENSITIES) {
  const dir = join(ANDROID_RES, folder);
  renderSvg(iconSvg, join(dir, 'ic_launcher.png'), launcher);
  renderSvg(iconSvg, join(dir, 'ic_launcher_round.png'), launcher);
  renderSvgString(adaptiveForeground, join(dir, 'ic_launcher_foreground.png'), foreground);
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
