#!/usr/bin/env node
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apkSource = join(root, 'android/app/release/app-release.apk');
const metadataPath = join(root, 'android/app/release/output-metadata.json');
const downloadsDir = join(root, 'downloads');

let versionName = '1.0';
let versionCode = 1;

try {
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
  const element = metadata.elements?.[0];
  if (element?.versionName) versionName = element.versionName;
  if (element?.versionCode) versionCode = element.versionCode;
} catch {
  console.warn('Could not read output-metadata.json; using default version 1.0');
}

const apkName = `kinkeda-android-${versionName}.apk`;
const apkDest = join(downloadsDir, apkName);

mkdirSync(downloadsDir, { recursive: true });
copyFileSync(apkSource, apkDest);

const manifest = {
  versionName,
  versionCode,
  applicationId: 'com.kinkeda.app',
  file: apkName,
  updatedAt: new Date().toISOString(),
};

writeFileSync(join(downloadsDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Copied ${apkSource} → downloads/${apkName}`);
