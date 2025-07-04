
Warehouse API:
1.Get all warehouses!
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
            "image_url": "https://hips.hearstapps.com/hmg-prod/images/self-storage-facility-interior-with-tools-royalty-free-image-1727987323.jpg?crop=0.821xw:0.824xh;0.179xw,0.0648xh&resize=1200:*",
            "height": "3",
            "total_volume": "15.00",
            "available_volume": "15.00",
                "status": "VACANT"  // есть дви разных статуса: [ VACANT, OCCUPIED ]
            },
            {
                "id": 25,
                "warehouse_id": 2,
                "name": "11B",
                "storage_type": "INDIVIDUAL",
                "description": "individual storage",
                "image_url": "https://hips.hearstapps.com/hmg-prod/images/self-storage-facility-interior-with-tools-royalty-free-image-1727987323.jpg?crop=0.821xw:0.824xh;0.179xw,0.0648xh&resize=1200:*",
                "height": "3",
                "total_volume": "4.00",
                "available_volume": "4.00",
                "status": "VACANT"  // есть две разных статуса: [ VACANT, OCCUPIED ]
            },
        ]    
    }

---

Order API:
2.Создать новый заказ!
  POST:/orders:
  Request body -> Example Value
  {
  "storage_id": 0,
  "months": 1,
  "order_items": [
    {
      "name": "string",
      "volume": 0,
      "cargo_mark": "NO"    //есть три разных cargo_mark:[ NO, HEAVY, FRAGILE ]
    }
  ]
}

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

