/**
 * Кадр из src/video/extraspace.mp4 → public/videos/extraspace-poster.jpg
 * Использует ffmpeg-static (не нужен ffmpeg в PATH).
 * Запуск: npm run hero:poster
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const input = path.join(root, 'src', 'video', 'extraspace.mp4');
const outDir = path.join(root, 'public', 'videos');
const output = path.join(outDir, 'extraspace-poster.jpg');

if (!ffmpegPath || typeof ffmpegPath !== 'string') {
  console.error('ffmpeg-static: бинарник недоступен для этой платформы.');
  process.exit(1);
}

if (!existsSync(input)) {
  console.error('Нет файла:', input);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const args = ['-y', '-i', input, '-ss', '00:00:00.5', '-vframes', '1', '-q:v', '2', output];
const r = spawnSync(ffmpegPath, args, { stdio: 'inherit', shell: false });

if (r.status !== 0) {
  process.exit(r.status ?? 1);
}

console.log('Готово:', output);
