# Frontend проект

Фронтенд часть проекта, разработанная с использованием React и Vite.

## Технологии
- React
- Vite
- Zustand (state manager)
- React Query (для работы с серверными данными и кешированием)
- React Hook Form (для работы с формами)
- Shadcn/ui (основана на Tailwind CSS)
- React Toastify

## Архитектура
Проект разработан с использованием подхода Feature-Sliced Design.

## Установка и запуск

```bash
# Клонирование репозитория
git clone https://github.com/ITAcceleratorNX/frontend.git
cd frontend

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## Используемые библиотеки

```bash
# Библиотеки форм и валидации
npm i @hookform/resolvers
npm i react-hook-form
npm i zod

# UI компоненты
npm i @radix-ui/react-dialog
npm i @radix-ui/react-label
npm i @radix-ui/react-slot
npm i class-variance-authority
npm i clsx
npm i lucide-react
npm i tailwind-merge

# Анимации и эффекты
npm i framer-motion

# Карты
npm i leaflet
npm i react-leaflet

# Работа с данными
npm i @tanstack/react-query
npm i axios

# Основные React библиотеки
npm i react
npm i react-dom
npm i react-router-dom

# Уведомления и тосты
npm i react-hot-toast
npm i react-toastify

# Управление состоянием
npm i zustand
```

## Структура проекта
```
src/
├── app/          # Глобальные настройки приложения
├── processes/    # Бизнес-процессы
├── pages/        # Страницы приложения
├── widgets/      # Композиционные компоненты
├── features/     # Функциональные блоки
├── entities/     # Бизнес-сущности
└── shared/       # Переиспользуемые ресурсы
```

## Деплой
Проект развернут на Vercel.com  
https://frontend-nu-sepia-48.vercel.app


