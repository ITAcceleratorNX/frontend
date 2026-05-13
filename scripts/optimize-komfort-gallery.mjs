/**
 * Создаёт облегчённые копии фото галереи складов:
 * - thumbs/ — для сетки превью (~640px по ширине)
 * - display/ — для лайтбокса (~1280px)
 *
 * Запуск из папки frontend: npm run optimize:komfort-gallery
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'assets', 'komfort-city');
const THUMB_DIR = path.join(SRC, 'thumbs');
const DISPLAY_DIR = path.join(SRC, 'display');

const THUMB_WIDTH = 640;
const DISPLAY_WIDTH = 1280;
const THUMB_QUALITY = 82;
const DISPLAY_QUALITY = 80;

async function main() {
  const entries = await fs.readdir(SRC, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith('.webp'))
    .map((e) => e.name)
    .sort();

  if (files.length === 0) {
    console.error('Нет .webp в', SRC);
    process.exit(1);
  }

  await fs.mkdir(THUMB_DIR, { recursive: true });
  await fs.mkdir(DISPLAY_DIR, { recursive: true });

  for (const name of files) {
    const input = path.join(SRC, name);
    const outThumb = path.join(THUMB_DIR, name);
    const outDisplay = path.join(DISPLAY_DIR, name);

    await sharp(input)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY, effort: 4 })
      .toFile(outThumb);

    await sharp(input)
      .rotate()
      .resize({ width: DISPLAY_WIDTH, withoutEnlargement: true })
      .webp({ quality: DISPLAY_QUALITY, effort: 4 })
      .toFile(outDisplay);

    console.log('OK', name);
  }

  console.log('Готово:', files.length, 'файлов → thumbs/ и display/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
