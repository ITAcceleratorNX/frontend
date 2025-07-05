
Если вышеописанные предложения (например: логика по оплате, подтверждению заказов и т.д.) относятся к менеджерам и администраторам,
то их нужно добавить в файл personal-account.md, в раздел:

"Разделы для администраторов и менеджеров" → подраздел "Запросы".
Если же предложения касаются обычных пользователей,
то их нужно добавить в этот же файл personal-account.md, но в другой раздел:
"Разделы для обычных пользователей" → подраздел "Платежи".
--
3.Получить все заказы(эти роли используют: MANAGER and ADMIN)!
  GET:/orders:
Responses:
  200:Список заказов:
[
    {
        "id": 39,
        "storage_id": 28,
        "user_id": 9,
        "total_volume": "2",
        "total_price": "60.00",
        "start_date": "2025-06-21T17:10:53.857Z",
        "end_date": "2025-07-21T17:10:53.857Z",
        "contract_status": "UNSIGNED", // есть дви разных статуса: ['SIGNED','UNSIGNED']
        "payment_status": "PAID",  // есть дви разных статуса: ['PAID','UNPAID']
        "status": "PROCESSING", // есть четыре разных статуса: ['ACTIVE','INACTIVE','APPROVED','PROCESSING']
        "created_at": "2025-06-21",
        "storage": {
            "id": 28,
            "warehouse_id": 2,
            "name": "0C",
            "storage_type": "INDIVIDUAL",
            "description": "individual storage",
            "image_url": "https://",
            "height": "3",
            "total_volume": "2.00",
            "available_volume": "0.00",
            "status": "PENDING"  // есть три разных статуса: [VACANT,OCCUPIED,PENDING]
        },
        "items": [
            {
                "id": 9,
                "order_id": 39,
                "name": "Wooden Crate",
                "volume": "1.00",
                "cargo_mark": "HEAVY"
            },
            {
                "id": 10,
                "order_id": 39,
                "name": "Glass Vase",
                "volume": "1.00",
                "cargo_mark": "FRAGILE"
            }
        ],
        "user": {
            "name": "Zhubanysh Zharylkassynov",
            "phone": "77783500808",
            "email": "zhubanysh.zharylkassynov@narxoz.kz"
        }
    },
]
--
4.Получить заказы текущего пользователя!
  GET:/orders/me:
Responses:
 200:Список заказов:
 [
  {
    "id": 29,
    "storage_id": 12,
    "user_id": 2,
    "total_volume": "5",
    "total_price": "500.00",
    "start_date": "2025-06-19T12:19:33.670Z",
    "end_date": "2025-07-19T12:19:33.670Z",
    "contract_status": "UNSIGNED", // есть дви разных статуса: ['SIGNED','UNSIGNED']
    "payment_status": "UNPAID", // есть дви разных статуса: ['PAID','UNPAID']
    "status": "INACTIVE", // есть четыре разных статуса: ['ACTIVE','INACTIVE','APPROVED','PROCESSING']
    "created_at": "2025-06-19",
    "storage": {
      "id": 12,
      "warehouse_id": 2,
      "name": "11A",
      "storage_type": "INDIVIDUAL",
      "description": "individual storage",
      "image_url": "https://",
      "height": "3",
      "total_volume": "5.00",
      "available_volume": "0.00",
      "status": "PENDING"  // есть три разных статуса: [VACANT,OCCUPIED,PENDING]
    },
    "items": [
      {
        "id": 4,
        "order_id": 29,
        "name": "Wooden Crate",
        "volume": "1.00",
        "cargo_mark": "HEAVY"
      }
    ]
  }
]
--
Если у пользователя заказ со статусом "INACTIVE",
то менеджер или админ должны изменить его статус на "APPROVED",
чтобы пользователь получил доступ к дальнейшей оплате.

💬 То есть:

Пользователю будет доступна оплата только если status === "APPROVED"

Заказы со статусом "INACTIVE" — это «неактивные» и их нужно вручную переводить в "APPROVED"

🔸 Логика действий MANAGER и ADMIN:
2. Если MANAGER или ADMIN не согласны с заказом пользователя,
то на фронте для них должна отображаться кнопка "Удалить заказ".
3. На странице отображения заказов (для MANAGER и ADMIN) должно быть:
✅ Кнопка "Подтвердить заказ" — отправляет PUT /orders/{id}/status
✅ Кнопка "Удалить заказ" — отправляет DELETE /orders/{id}

🟡 Обе кнопки должны находиться рядом, чтобы менеджер/админ мог принять или отклонить решение удобно.

📦 Что нужно сделать на фронте:
Для MANAGER и ADMIN:
Получить список всех заказов:
GET /orders
 И "user": {
            "name": "Zhubanysh Zharylkassynov",
            "phone": "77783500808",
            "email": "zhubanysh.zharylkassynov@narxoz.kz"
        }

Для каждого заказа:
Если status === "INACTIVE" → показать кнопку "Подтвердить заказ"
→ при нажатии: PUT /orders/{id}/status с body { "status": "APPROVED" }
Также рядом должна быть кнопка "Удалить заказ"
→ при нажатии: DELETE /orders/{id}
5.Обновить статус заказа Что бы Подтвердить заказы пользователя!(эти роли используют: MANAGER and ADMIN)
 PUT:/orders/{id}/status:
  Example Value:
  {
  "status": "APPROVED" //Нужно изменить статус APPROVED!
}
Responses:
  200:Статус успешно обновлён
--
6.Удалить заказ!(эти роли используют: MANAGER and ADMIN)
 DELETE:/orders/{id}
 Responses:
  200:Успешное удаление
--
Payment api!

7.Создать оплату по заказу
  POST:/payments
  Request body> Example Value:
  {
   "order_id": 1
  }
Responses:
201:Успешное создание оплаты:
  Example Value:
{
  "payment_id": 0,
  "order_id": "string",
  "payment_type": "string",
  "payment_method": "string",
  "payment_status": "string",
  "recurrent_token": "string",
  "amount": 0,
  "amount_initial": 0,
  "currency": "string",
  "captured_details": {},
  "cancel_details": {},
  "created_date": "string",
  "payer_info": {
    "email": "string"
  },
  "payment_page_url": "string",  // Используйте только это поле: откройте страницу оплаты по этому URL!
  "wallet_identifier": {}
}
409:Заказ не подтвержден / другой конфликт
📌 Примечание:
Используйте только атрибут payment_page_url.
Перейдите на страницу оплаты по указанному URL.
Остальные поля — информационные.
--

8.Получить все оплаты текущего пользователя
GET:/payments/me
 Responses:
 200:Список заказов и платежей пользователя
[
  {
    "id": 0,
    "user_id": 0,
    "storage_id": 0,
    "total_volume": 0,
    "total_price": 0,
    "start_date": "2025-07-04T20:33:53.379Z",
    "end_date": "2025-07-04T20:33:53.379Z",
    "contract_status": "UNSIGNED", // есть дви разных статуса: ['SIGNED','UNSIGNED']
    "payment_status": "UNPAID", // есть дви разных статуса: ['PAID','UNPAID']
    "status": "INACTIVE", // есть четыре разных статуса: ['ACTIVE','INACTIVE','APPROVED','PROCESSING']
    "box_amount": 0,
    "cargo_mark": "NO",
    "product_names": "string",
    "created_at": "2025-07-04T20:33:53.379Z",
    "order_payment": [
      {
        "id": 0,
        "order_id": 0,
        "month": 0,
        "year": 0,
        "amount": 0,
        "status": "PAID", // есть три разных статуса: ['PAID','UNPAID','MANUAL']
        "paid_at": "2025-07-04T20:33:53.379Z",
        "payment_id": "string",
        "penalty_amount": 0
      },
       {
                "id": 2122,
                "order_id": 50,
                "month": 8,
                "year": 2025,
                "amount": "39.48",
                "status": "UNPAID",
                "paid_at": null,
                "payment_id": null,
                "penalty_amount": "0.00"
        }
    ]
  }
]
--
8.1:Почему, когда у объекта payments статус 'APPROVED', справа должна отображаться кнопка "Оплата"?
📌 Пояснение:
Когда payments.status имеет значение 'APPROVED', это означает, что платёж одобрен и готов к дальнейшим действиям.
Следовательно, в пользовательском интерфейсе логично отображать кнопку "Оплата" справа, чтобы пользователь мог перейти к выполнению или подтверждению оплаты.
8.2:Пользователь должен иметь возможность получить список всех своих оплат, включая предстоящие месяцы. В этом списке должна отображаться информация: какие оплаты уже оплачены, а какие — нет. Также должна быть возможность нажать на "Подробнее", чтобы увидеть всю информацию по каждой оплате.
- Что нужно показать на фронте:
Список всех заказов с датами и статусами

В каждом заказе — список всех месяцев:
Оплачено или нет (status)
Сумма и дата оплаты
Штраф, если есть
Кнопка или ссылка "Подробнее" под каждым заказом — при нажатии показывается полный список месячных платежей 
--
9.Создать ручную оплату: //Почему при значении status: 'MANUAL' у объекта order_payment справа должна отображаться кнопка "Ручная оплата"!
 POST:/payments/manual:
 Request body > Example Value:
{
  "order_payment_id": 1
}
200:Успешная ручная оплата
Example Value:
  {
  "payment_id": 0,
  "order_id": "string",
  "payment_type": "string",
  "payment_method": "string",
  "payment_status": "string",
  "recurrent_token": "string",
  "amount": 0,
  "amount_initial": 0,
  "currency": "string",
  "captured_details": {},
  "cancel_details": {},
  "created_date": "string",
  "payer_info": {
    "email": "string"
  },
  "payment_page_url": "string", // Используйте только это поле: откройте страницу оплаты по этому URL!
  "wallet_identifier": {}
}
400:Ошибка валидации или состояния оплаты
403:Нет доступа
404:Оплата не найдена
📌 Примечание:
Используйте только атрибут payment_page_url.
Перейдите на страницу оплаты по указанному URL.
Остальные поля — информационные.
--