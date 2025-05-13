<<<<<<< HEAD
# frontend
=======
# ExtraSpace - Frontend

Фронтенд для сервиса аренды индивидуальных боксов и хранения вещей.

## Технологии

- React 19
- Vite
- Zustand
- React Query
- React Router
- React Hook Form
- Tailwind CSS

## Структура проекта

Проект организован по методологии Feature-Sliced Design:

```
/src
├── app/          # Глобальные настройки приложения
├── processes/    # Бизнес-процессы
├── pages/        # Страницы приложения
├── widgets/      # Композиционные компоненты
├── features/     # Функциональные блоки
├── entities/     # Бизнес-сущности
└── shared/       # Переиспользуемые ресурсы
```

## Запуск проекта

### Требования

- Node.js v18+
- npm v9+

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка для продакшена

```bash
npm run build
```

## Основные функции

- Аутентификация пользователей (вход, регистрация)
- Проверка email перед входом/регистрацией


>>>>>>> 99b9e32 (Initial frontend commit, excluding node_modules, backend-main, .idea, etc.)
