# API Warehouse Box Selection Documentation

## Warehouse API:
1. Get all warehouses!
  GET:/warehouses:
  Responses: 200 List of all warehouses:
  {
         "id": 3,
    "name": "EXTRA SPACE Главный склад",
    "address": "Касымова улица, 32, Алматы",
    "latitude": "14.14000000",
    "longitude": "14.14000000",
    "work_start": "09:00:00",
    "work_end": "18:00:00",
    "status": "AVAILABLE",
    "storage": [
        {
            "id": 38,
            "warehouse_id": 3,
            "name": "2a",
            "storage_type": "INDIVIDUAL",
            "description": "individual storage",
            "image_url": "https://",
            "height": "3",
            "total_volume": "15.00",
            "available_volume": "15.00",
                "status": "VACANT"  // есть три разных статуса: [VACANT,OCCUPIED,PENDING]
            },
            {
                "id": 25,
                "warehouse_id": 2,
                "name": "11B",
                "storage_type": "INDIVIDUAL",
                "description": "individual storage",
                "image_url": "https://",
                "height": "3",
                "total_volume": "4.00",
                "available_volume": "4.00",
                "status": "PENDING"  // есть три разных статуса: [VACANT,OCCUPIED,PENDING]
            },
        ]    
    }

---

## Order API:
2. Создать новый заказ!
  POST:/orders:
  Request body -> Example Value
POST /orders
{
  "storage_id": 7,
  "months": 2,
  "order_items": [
    {
      "name": "Wooden Crate",
      "volume": 2,
      "cargo_mark": "HEAVY"
    },
    {
      "name": "Glass Vase",
      "volume": 1,
      "cargo_mark": "FRAGILE" //есть три разных cargo_mark:[NO,HEAVY,FRAGILE].
    }
  ],
  "is_selected_moving": false, //есть дви разных: false и true.
  "is_selected_package": true, //есть дви разных: false и true
  "moving_orders": [
    {
      "moving_date": "2025-07-15T00:00:00.000Z",
      "status": "PENDING_FROM", //есть дви разных status:PENDING_FROM и PENDING_TO.
      "address": "almaty"
    },
    {
      "moving_date": "2025-07-20T00:00:00.000Z",
      "status": "PENDING_TO",
      "address": "astana"
    }
  ],
  "services": [
    {
      "service_id": 9,
      "count": 1
    },
    {
      "service_id": 10,
      "count": 1
    }
  ]
}  


--
Responses: 201 Заказ успешно создан:
 Example Value:
  {
  "id": 29,
  "storage_id": 12,
  "user_id": 2,
  "total_volume": "5",
  "total_price": "500.00",
  "start_date": "2025-06-19T12:19:33.670Z",
  "end_date": "2025-07-19T12:19:33.670Z",
  "contract_status": "UNSIGNED",  
  "payment_status": "UNPAID",
  "status": "INACTIVE",
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
    "status": "PENDING" 
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
5.Обновить статус заказа Что бы Подтвердить заказы пользователя!что бы пользователя Доступ оплата ещё другое!(эти роли используют: MANAGER and ADMIN)
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
      }
    ]
  }
]
--
9.Создать ручную оплату:
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


