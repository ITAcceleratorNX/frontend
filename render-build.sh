#!/bin/bash
# Скрипт для сборки проекта на Render.com

# Выводим версию node и npm
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Очищаем кэш npm и удаляем node_modules
echo "Cleaning npm cache and node_modules..."
npm cache clean --force
rm -rf node_modules

# Устанавливаем зависимости
echo "Installing dependencies..."
npm install

# Очищаем директорию dist
echo "Cleaning dist directory..."
rm -rf dist

# Запускаем сборку
echo "Building project..."
GENERATE_SOURCEMAP=false npm run build

# Проверяем результат сборки
echo "Checking build result..."
ls -la dist

# Создаем файл для проверки версии и времени сборки
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "Build completed at: $TIMESTAMP" > dist/build-info.txt
echo "Build version: $(date +%s)" >> dist/build-info.txt

echo "Build script completed." 