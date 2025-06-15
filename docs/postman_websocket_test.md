# 🧪 Postman WebSocket Chat Testing Guide

## 📋 Тест-сценарий для ExtraSpace Chat

### 🔧 Подготовка к тестированию

**Участники:**
- USER: id = 6
- MANAGER: id = 4

**Сервер:** `wss://extraspace-backend.onrender.com`

---

## 🚀 Этап 1: Подключение к WebSocket

### 1.1 Подключение USER (id: 6)

**WebSocket URL:** `wss://extraspace-backend.onrender.com?userId=6`

**В Postman:**
1. Создайте новый WebSocket Request
2. URL: `wss://extraspace-backend.onrender.com?userId=6`
3. Нажмите "Connect"

**Ожидаемый результат:** Соединение установлено

### 1.2 Подключение MANAGER (id: 4)

**WebSocket URL:** `wss://extraspace-backend.onrender.com?userId=4`

**В Postman:**
1. Откройте новую вкладку WebSocket
2. URL: `wss://extraspace-backend.onrender.com?userId=4`
3. Нажмите "Connect"

**Ожидаемый результат:** Соединение установлено

---

## 🎯 Этап 2: Инициация чата (USER)

### 2.1 USER начинает чат

**Отправить через WebSocket USER (id: 6):**
```json
{
  "type": "START_CHAT",
  "userId": 6
}
```

### 2.2 Ожидаемые ответы

**USER получает:**
```json
{
  "type": "WAITING_FOR_MANAGER",
  "message": "Пожалуйста, подождите. Один из свободных менеджеров скоро ответит."
}
```z

**MANAGER получает:**
```json
{
  "type": "NEW_CHAT",
  "chatId": 1,
  "userId": 6
}
```

---

## ✅ Этап 3: Принятие чата (MANAGER)

### 3.1 MANAGER принимает чат

**Отправить через WebSocket MANAGER (id: 4):**
```json
{
  "type": "ACCEPT_CHAT",
  "chatId": 1,
  "managerId": 4
}
```

### 3.2 Ожидаемый ответ

**USER получает:**
```json
{
  "type": "CHAT_ACCEPTED",
  "chatId": 1,
  "managerId": 4
}
```

---

## 💬 Этап 4: Обмен сообщениями

### 4.1 USER отправляет сообщение

**Отправить через WebSocket USER (id: 6):**
```json
{
  "type": "SEND_MESSAGE",
  "chatId": 1,
  "senderId": 6,
  "message": "Привет! У меня вопрос по аренде склада.",
  "isFromUser": true
}
```

**MANAGER получает:**
```json
{
  "type": "NEW_MESSAGE",
  "message": {
    "id": 1,
    "chat_id": 1,
    "sender_id": 6,
    "text": "Привет! У меня вопрос по аренде склада.",
    "is_from_user": true
  }
}
```

### 4.2 MANAGER отвечает

**Отправить через WebSocket MANAGER (id: 4):**
```json
{
  "type": "SEND_MESSAGE",
  "chatId": 1,
  "senderId": 4,
  "message": "Здравствуйте! Буду рад помочь. Какой размер площади вас интересует?",
  "isFromUser": false
}
```

**USER получает:**
```json
{
  "type": "NEW_MESSAGE",
  "message": {
    "id": 2,
    "chat_id": 1,
    "sender_id": 4,
    "text": "Здравствуйте! Буду рад помочь. Какой размер площади вас интересует?",
    "is_from_user": false
  }
}
```

### 4.3 Продолжение диалога

**USER отправляет:**
```json
{
  "type": "SEND_MESSAGE",
  "chatId": 1,
  "senderId": 6,
  "message": "Мне нужно около 50 квадратных метров на 3 месяца.",
  "isFromUser": true
}
```

**MANAGER отвечает:**
```json
{
  "type": "SEND_MESSAGE",
  "chatId": 1,
  "senderId": 4,
  "message": "Отлично! У нас есть несколько вариантов. Могу предложить склад в центральном районе за 15000 руб/месяц.",
  "isFromUser": false
}
```

---

## 🔍 Этап 5: Тестирование REST API

### 5.1 Получить сообщения чата

**HTTP Request:**
```
GET https://extraspace-backend.onrender.com/chats/1/messages?limit=20
```

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ожидаемый ответ:**
```json
{
  "messages": [
    {
      "id": 1,
      "chat_id": 1,
      "sender_id": 6,
      "text": "Привет! У меня вопрос по аренде склада.",
      "is_from_user": true
    },
    {
      "id": 2,
      "chat_id": 1,
      "sender_id": 4,
      "text": "Здравствуйте! Буду рад помочь. Какой размер площади вас интересует?",
      "is_from_user": false
    },
    {
      "id": 3,
      "chat_id": 1,
      "sender_id": 6,
      "text": "Мне нужно около 50 квадратных метров на 3 месяца.",
      "is_from_user": true
    },
    {
      "id": 4,
      "chat_id": 1,
      "sender_id": 4,
      "text": "Отлично! У нас есть несколько вариантов. Могу предложить склад в центральном районе за 15000 руб/месяц.",
      "is_from_user": false
    }
  ],
  "hasMore": false
}
```

### 5.2 Получить чаты менеджера

**HTTP Request:**
```
GET https://extraspace-backend.onrender.com/chats/manager
```

**Headers:**
```
Authorization: Bearer MANAGER_JWT_TOKEN
```

**Ожидаемый ответ:**
```json
[
  {
    "id": 1,
    "user_id": 6,
    "manager_id": 4,
    "status": "ACCEPTED"
  }
]
```

### 5.3 Пагинация сообщений

**HTTP Request:**
```
GET https://extraspace-backend.onrender.com/chats/1/messages?beforeId=3&limit=2
```

**Ожидаемый ответ:**
```json
{
  "messages": [
    {
      "id": 1,
      "chat_id": 1,
      "sender_id": 6,
      "text": "Привет! У меня вопрос по аренде склада.",
      "is_from_user": true
    },
    {
      "id": 2,
      "chat_id": 1,
      "sender_id": 4,
      "text": "Здравствуйте! Буду рад помочь. Какой размер площади вас интересует?",
      "is_from_user": false
    }
  ],
  "hasMore": false
}
```

---

## 🛠️ Этап 6: Дополнительные тесты

### 6.1 Очистка сообщений чата

**HTTP Request:**
```
DELETE https://extraspace-backend.onrender.com/chats/1/messages
```

**Headers:**
```
Authorization: Bearer MANAGER_JWT_TOKEN
```

**Ожидаемый ответ:**
```json
{
  "message": "Messages cleared successfully"
}
```

### 6.2 Смена менеджера чата

**HTTP Request:**
```
PUT https://extraspace-backend.onrender.com/chats/1/manager
```

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "newManagerId": 5
}
```

**Ожидаемый ответ:**
```json
{
  "id": 1,
  "user_id": 6,
  "manager_id": 5,
  "status": "ACCEPTED"
}
```

---

## 🧪 Сценарии для тестирования

### Сценарий 1: Полный цикл чата
1. ✅ USER подключается к WebSocket
2. ✅ MANAGER подключается к WebSocket  
3. ✅ USER инициирует чат
4. ✅ MANAGER получает уведомление о новом чате
5. ✅ MANAGER принимает чат
6. ✅ USER получает подтверждение принятия
7. ✅ Обмен сообщениями в обе стороны
8. ✅ Проверка REST API для получения истории

### Сценарий 2: Множественные менеджеры
1. Подключите 2-3 менеджера
2. USER инициирует чат
3. Все менеджеры получают уведомление
4. Первый менеджер принимает чат
5. Остальные менеджеры не могут принять (статус уже ACCEPTED)

### Сценарий 3: Отключение и переподключение
1. Во время активного чата отключите USER
2. MANAGER отправляет сообщение
3. Переподключите USER
4. Проверьте получение пропущенных сообщений через REST API

---

## ⚠️ Возможные ошибки и решения

### Ошибка подключения
```json
{
  "error": "Connection failed"
}
```
**Решение:** Проверьте URL и параметр userId

### Недостаточно прав
```json
{
  "error": "Insufficient permissions"
}
```
**Решение:** Проверьте JWT токен и роль пользователя

### Чат не найден
```json
{
  "error": "Chat not found"
}
```
**Решение:** Убедитесь что chatId существует в базе данных

---

## 📊 Чек-лист тестирования

- [ ] WebSocket подключение USER
- [ ] WebSocket подключение MANAGER
- [ ] Инициация чата (START_CHAT)
- [ ] Уведомление менеджера (NEW_CHAT)
- [ ] Принятие чата (ACCEPT_CHAT)
- [ ] Подтверждение принятия (CHAT_ACCEPTED)
- [ ] Отправка сообщения от USER
- [ ] Получение сообщения MANAGER
- [ ] Отправка сообщения от MANAGER
- [ ] Получение сообщения USER
- [ ] REST API: получение сообщений
- [ ] REST API: получение чатов менеджера
- [ ] REST API: пагинация сообщений
- [ ] REST API: очистка сообщений
- [ ] REST API: смена менеджера

---

## 🎯 Результат успешного теста

После выполнения всех шагов у вас должен быть:
1. ✅ Активный чат между USER (id: 6) и MANAGER (id: 4)
2. ✅ История сообщений в базе данных
3. ✅ Работающие WebSocket соединения
4. ✅ Корректные ответы от всех REST API endpoints

**Время выполнения теста:** ~15-20 минут 