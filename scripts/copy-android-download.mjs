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
const manifestPath = join(downloadsDir, 'manifest.json');

let appStoreUrl = '';
let iosVersionName = versionName;
let iosBuildNumber = versionCode;
let iosReleasedAt = '';
try {
  const existing = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (existing.appStoreUrl) appStoreUrl = existing.appStoreUrl;
  else if (existing.testFlightUrl) appStoreUrl = existing.testFlightUrl;
  if (existing.iosVersionName) iosVersionName = existing.iosVersionName;
  if (existing.iosBuildNumber) iosBuildNumber = existing.iosBuildNumber;
  if (existing.iosReleasedAt) iosReleasedAt = existing.iosReleasedAt;
} catch {
  // First publish — set appStoreUrl and iOS fields in downloads/manifest.json manually.
}

const updatedAt = new Date().toISOString();
if (!iosReleasedAt) iosReleasedAt = updatedAt;

mkdirSync(downloadsDir, { recursive: true });
copyFileSync(apkSource, apkDest);

const manifest = {
  versionName,
  versionCode,
  applicationId: 'com.kinkeda.app',
  file: apkName,
  appStoreUrl,
  updatedAt,
  iosVersionName,
  iosBuildNumber,
  iosReleasedAt,
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Copied ${apkSource} → downloads/${apkName}`);
