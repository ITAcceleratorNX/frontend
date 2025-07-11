у меня есть api crud изменения добавлены!

1.Создать новый заказ текущего пользователя!
POST:/orders
{
  "storage_id": 16,
  "months": 3,
  "order_items": [
    {
      "name": "Wooden Crate",
      "volume": 1,
      "cargo_mark": "HEAVY"
    },
    {
      "name": "Glass Vase",
      "volume": 1,
      "cargo_mark": "FRAGILE"
    }
  ],
  "is_selected_moving": true, //этот пользователь должен добавить к выбору дополнительного moving тарифа (Switch)!
  "is_selected_package": true //этот пользователь должен добавить к выбору дополнительного package (Switch)!
}
--

 // егер пользовательде услуги moving(is_selected_moving)  қосылмаған жағдайда(MANAGER and ADMIN) Switch(true или false) арқылы қосып бере алу керек! немесе услуги moving Switch(false) арқылы отмена жасай алу керек! және is_selected_package - Switch(true или false) арқылы қосып және отмена(false) жасай алу керек!.
  2.егер пользовательде услуги moving Switch(true) қосылған жағдайда (MANAGER and ADMIN) Добавить услуги (Button) арқылы "services" Select арқылы тағдап қосып бере алуы керек! ал "services" Select  керек api: Get:/prices арқылы services тип көре аласың! және маңызды ескерту: тек Get:/prices ішідегі services id:4 бастап ары қарай алып шық! және "services" Select атынің(type) орныма description көрсет!

  3.Маған (MANAGER and ADMIN) және moving_orders Добавить (Button) арқылы (moving_date и"status": "PENDING_FROM" или "PENDING_TO")қосал алыу керек!

  4.бәрін қосып біткен соңы "Подтвердить" коновкасын басу керек! 

--
2.**PUT** `/orders/{id}/status` - обновить статус заказа:Мне нужно, чтобы статус менялся только у тех заказов, у которых "status": "INACTIVE".
Только для них должен происходить переход на "status": "APPROVED". и Еще другое вещи!(эти роли используют: MANAGER and ADMIN) 
{
  "status": "APPROVED",
  "is_selected_moving": true, 
  "is_selected_package": true, 
  "moving_orders": [
    {
      "moving_date": "2025-07-15T00:00:00.000Z",
      "status": "PENDING_FROM" //
    },
    {
      "moving_date": "2025-07-20T00:00:00.000Z",
      "status": "PENDING_TO"
    }
  ],
  "services": [
    {
      "service_id": 11,
      "count": 1
    },
    {
      "service_id": 8,
      "count": 2
    },
    {
      "service_id": 18,
      "count": 2
    },
    {
      "service_id": 7,
      "count": 1
    }
  ]
}

--

3.Получить все заказы(эти роли используют: MANAGER and ADMIN)!
GET:/orders 
[
    {
        "id": 60,
        "storage_id": 27,
        "user_id": 9,
        "total_volume": "6",
        "total_price": "540.00",
        "start_date": "2025-07-10T02:03:06.200Z",
        "end_date": "2025-10-10T02:03:06.200Z",
        "contract_status": "UNSIGNED",
        "payment_status": "PAID",
        "status": "PROCESSING",
        "created_at": "2025-07-09",
        "is_selected_moving": true,
        "is_selected_package": true,
        "storage": {
            "id": 27,
            "warehouse_id": 2,
            "name": "13B",
            "storage_type": "INDIVIDUAL",
            "description": "individual storage",
            "image_url": "https:/",
            "height": "3",
            "total_volume": "6.00",
            "available_volume": "0.00",
            "status": "PENDING"
        },
        "items": [
            {
                "id": 37,
                "order_id": 60,
                "name": "Glass Vase",
                "volume": "1.00",
                "cargo_mark": "FRAGILE"
            },
            {
                "id": 36,
                "order_id": 60,
                "name": "Wooden Crate",
                "volume": "1.00",
                "cargo_mark": "HEAVY"
            }
        ],
        "user": {
            "name": "Zhubanysh Zharylkassynov",
            "phone": "77783500808",
            "email": "zhubanysh.zharylkassynov@narxoz.kz"
        },
         "services": [  
            {
                "id": 5,
                "type": "LOADER",
                "description": null,
                "price": "20.00",
                "OrderService": {
                    "id": 8,
                    "order_id": 60,
                    "service_id": 2,
                    "count": 2
                }
            },
            {
                "id": 3,
                "type": "DEPOSIT",  //В случае выбора DEPOSIT количество(count) должно быть одним!
                "description": null,
                "price": "15000.00",
                "OrderService": {
                    "id": 10,
                    "order_id": 60,
                    "service_id": 4,
                    "count": 1
                }
            }
        ]
    },
]
--

4.Получить заказы текущего пользователя!
GET:/orders/me :
[
    {
        "id": 60,
        "storage_id": 27,
        "user_id": 9,
        "total_volume": "6",
        "total_price": "540.00",
        "start_date": "2025-07-10T02:03:06.200Z",
        "end_date": "2025-10-10T02:03:06.200Z",
        "contract_status": "UNSIGNED",
        "payment_status": "PAID",
        "status": "PROCESSING",
        "created_at": "2025-07-09",
        "is_selected_moving": true,  // это необходимо для того, чтобы узнать, включен ли тариф moving или нет!
        "is_selected_package": true, // это необходимо для того, чтобы узнать, включен ли package или нет!
        "storage": {
            "id": 27,
            "warehouse_id": 2,
            "name": "13B",
            "storage_type": "INDIVIDUAL",
            "description": "individual storage",
            "image_url": "https://",
            "height": "3",
            "total_volume": "6.00",
            "available_volume": "0.00",
            "status": "PENDING"
        },
        "items": [
            {
                "id": 37,
                "order_id": 60,
                "name": "Glass Vase",
                "volume": "1.00",
                "cargo_mark": "FRAGILE"
            }
        ],
        "services": [  //services type: DEPOSIT,LOADER,PACKER,FURNITURE_SPECIALIST,GAZELLE,STRETCH_FILM,BOX_SIZE,MARKER,UTILITY_KNIFE,BUBBLE_WRAP_1,BUBBLE_WRAP_2.
            {
                "id": 5,
                "type": "LOADER",
                "description": null,
                "price": "20.00",
                "OrderService": {
                    "id": 8,
                    "order_id": 60,
                    "service_id": 2,
                    "count": 2
                }
            },
            {
                "id": 3,
                "type": "DEPOSIT",  //В случае выбора DEPOSIT количество(count) должно быть одним!
                "description": null,
                "price": "15000.00",
                "OrderService": {
                    "id": 10,
                    "order_id": 60,
                    "service_id": 4,
                    "count": 1
                }
            }
        ]
    },
]
