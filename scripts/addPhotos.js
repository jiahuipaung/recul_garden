#!/usr/bin/env node
/**
 * Add photos to Favorites.
 *
 * Usage:
 *   node scripts/addPhotos.js <source-dir>
 *   npm run photos:add -- <source-dir>
 *
 * Behavior:
 *   - Recursively scans <source-dir> for jpg/jpeg/png/heic/webp.
 *   - HEIC -> JPEG buffer -> WebP.
 *   - JPG/PNG/WebP -> resized (max 1920) WebP at quality 80.
 *   - Writes into src/assets/photos/ (the directory Favorites actually reads).
 *   - Skips files whose target name already exists.
 *   - Does NOT modify or delete source files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import heicConvert from 'heic-convert';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TARGET_DIR = path.join(__dirname, '../src/assets/photos');

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic']);

function usageAndExit() {
  console.error('Usage: node scripts/addPhotos.js <source-dir>');
  process.exit(1);
}

async function collectFiles(dir) {
  const out = [];
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectFiles(full)));
    } else if (entry.isFile()) {
      if (SUPPORTED.has(path.extname(entry.name).toLowerCase())) {
        out.push(full);
      }
    }
  }
  return out;
}

async function toWebpBuffer(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.heic') {
    const jpegBuffer = await heicConvert({
      buffer: await fs.promises.readFile(inputPath),
      format: 'JPEG',
      quality: 0.9,
    });
    return sharp(jpegBuffer)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  }
  return sharp(inputPath)
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

function targetPathFor(sourcePath) {
  const base = path.basename(sourcePath, path.extname(sourcePath));
  return path.join(TARGET_DIR, `${base}.webp`);
}

async function main() {
  const [sourceDirArg] = process.argv.slice(2);
  if (!sourceDirArg) usageAndExit();

  const sourceDir = path.resolve(sourceDirArg);
  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    console.error(`Not a directory: ${sourceDir}`);
    process.exit(1);
  }

  await fs.promises.mkdir(TARGET_DIR, { recursive: true });
  const files = await collectFiles(sourceDir);
  if (files.length === 0) {
    console.log('No supported images found.');
    return;
  }

  console.log(`Found ${files.length} image(s). Converting to ${TARGET_DIR}`);

  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const src of files) {
    const dst = targetPathFor(src);
    const rel = path.relative(sourceDir, src);
    if (fs.existsSync(dst)) {
      console.log(`  skip  ${rel}  (target exists)`);
      skipped++;
      continue;
    }
    try {
      const buf = await toWebpBuffer(src);
      await fs.promises.writeFile(dst, buf);
      console.log(`  ok    ${rel}  ->  ${path.basename(dst)}`);
      added++;
    } catch (err) {
      console.error(`  fail  ${rel}:`, err.message);
      failed++;
    }
  }

  console.log(`\nDone. added=${added}, skipped=${skipped}, failed=${failed}`);
  if (added > 0) {
    console.log('Restart dev server (npm run dev) so Vite picks up new files.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
