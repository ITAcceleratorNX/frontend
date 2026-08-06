/**
 * Сжимает тяжёлые marketing PNG/JPG в WebP рядом с оригиналом.
 * Запуск: npm run optimize:marketing-images
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ASSETS = path.join(ROOT, 'src', 'assets');

const TARGETS = [
  { name: 'image_23.png', width: 1600, quality: 78 },
  { name: 'image 17.png', width: 1600, quality: 78 },
  { name: 'Auto Layout Horizontal.png', width: 1400, quality: 80 },
  { name: 'image3.png', width: 1200, quality: 80 },
  { name: 'image4.png', width: 1200, quality: 80 },
  { name: 'image5.png', width: 1200, quality: 80 },
];

async function main() {
  for (const target of TARGETS) {
    const input = path.join(ASSETS, target.name);
    try {
      await fs.access(input);
    } catch {
      console.warn('skip (not found):', target.name);
      continue;
    }

    const outName = target.name.replace(/\.(png|jpe?g)$/i, '.webp');
    const output = path.join(ASSETS, outName);

    await sharp(input)
      .rotate()
      .resize({ width: target.width, withoutEnlargement: true })
      .webp({ quality: target.quality, effort: 4 })
      .toFile(output);

    const inStat = await fs.stat(input);
    const outStat = await fs.stat(output);
    const saved = (((inStat.size - outStat.size) / inStat.size) * 100).toFixed(1);
    console.log(
      `OK ${target.name} → ${outName} (${(inStat.size / 1024).toFixed(0)}KB → ${(outStat.size / 1024).toFixed(0)}KB, -${saved}%)`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
