# AGENTS.md - Extra Space Frontend

_Инструкция для AI-агентов по работе с frontend проекта Extra Space_

## 📋 Общая информация

**Проект:** Extra Space - Сервис аренды складских помещений  
**Тип:** React SPA (Single Page Application)  
**Локальная папка:** `/root/.openclaw/workspace/projects/extra-space/frontend/`

## 🗂️ Структура проекта

```
frontend/
├── src/
│   ├── app/              # Глобальные настройки, роутинг
│   │   ├── index.jsx     # Корневой компонент
│   │   ├── routes.jsx    # Роуты приложения
│   │   └── styles/       # Глобальные стили
│   │
│   ├── pages/            # Страницы приложения
│   │   ├── home/         # Главная
│   │   ├── login/        # Авторизация
│   │   ├── register/     # Регистрация
│   │   ├── personal-account/  # Личный кабинет
│   │   ├── warehouse-order/   # Заказ склада
│   │   ├── online-payment/    # Оплата
│   │   ├── chat/              # Чат
│   │   └── ...
│   │
│   ├── features/         # Функциональные блоки (FSD)
│   │   ├── auth/         # Авторизация
│   │   │   ├── ui/       # Компоненты (LoginForm, RegisterForm)
│   │   │   └── model/    # Состояние, логика
│   │   └── chat/         # Чат
│   │       └── ui/       # ChatWindow, MessageInput
│   │
│   ├── entities/         # Бизнес-сущности
│   │   └── chat/         # Модели чата
│   │
│   ├── widgets/          # Композитные компоненты
│   │   ├── Header/       # Шапка
│   │   ├── Footer/       # Подвал
│   │   └── ChatWidget/   # Виджет чата
│   │
│   ├── components/       # Общие UI компоненты
│   │   └── ui/           # Button, Input, Modal, etc.
│   │
│   ├── shared/           # Переиспользуемые ресурсы
│   │   ├── api/          # API клиенты
│   │   ├── lib/          # Утилиты
│   │   ├── hooks/        # Кастомные хуки
│   │   └── context/      # React контексты
│   │
│   └── assets/           # Статические файлы
│       ├── images/
│       └── icons/
│
├── public/               # Публичные файлы
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Технологический стек

| Технология | Версия | Назначение |
|------------|--------|------------|
| React | 18.3.1 | UI библиотека |
| Vite | 6.3.1 | Сборщик |
| Tailwind CSS | 3.4.1 | Стилизация |
| Zustand | 5.0.9 | State management |
| React Query | 5.90.12 | Data fetching |
| React Hook Form | 7.69.0 | Формы |
| Radix UI | latest | Базовые компоненты |
| Axios | 1.13.2 | HTTP клиент |
| Leaflet | 1.9.4 | Карты |

## 🚀 Запуск

```bash
# Установка зависимостей
npm install

# Dev сервер (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview
npm run preview
```

## 📁 Где искать код

### Страницы → `src/pages/`
Каждая страница в отдельной папке с index.jsx

### Компоненты → `src/components/ui/`
Переиспользуемые UI компоненты

### API → `src/shared/api/`
Функции для работы с бэкендом

### Стили → `src/app/styles/`
Глобальные стили, Tailwind конфиг

## 🔗 API Endpoints

Бэкенд API находится по адресу (из .env):
```
VITE_API_URL=https://api.extraspace.kz
```

Основные эндпоинты:
- `POST /auth/login` - Авторизация
- `POST /auth/register` - Регистрация
- `GET /storages` - Спис складов
- `POST /orders` - Создание заказа
- `GET /chat` - Чат

## 📝 Правила работы

### Git
- Всегда от `main`
- Ветки: `feature/описание` или `bugfix/описание`
- После push → `git checkout main`

### Код
- Использовать ES6+
- Компоненты - функциональные
- Стили - Tailwind
- Иконы - Lucide React

## 🆘 Помощь

Если непонятно:
1. Смотреть примеры в `src/pages/`
2. Проверять `src/shared/api/` для запросов
3. Искать компоненты в `src/components/ui/`

---
_Создано через /init skill_ 🤖
