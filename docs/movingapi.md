

керек frontend api-лар:
1.post: https://extraspace-backend.onrender.com/order-services
{
  "order_id": 48,
  "service_id":6 
} 
--
2.post:https://extraspace-backend.onrender.com/moving
{
    "order_id": 48,
    "moving_date": "2025-07-10T14:00:00Z",
    "vehicle_type": "LARGE", // По умолчанию
    "status": "PENDING_FROM",// По умолчанию
    "availability": "AVAILABLE"// По умолчанию
}
--
3.POST:payments
{
  "order_id": 39
}
__
GET:/prices
[
    {
        "id": 1,
        "type": "INDIVIDUAL",
        "description": null,
        "price": "30.00"
    },
    
    {
        "id": 4,
        "type": "DEPOSIT",
        "description": null,
        "price": "15000.00"
    },
    {
        "id": 5,
        "type": "LIGHT", //service_id 
        "description": "Light moving description Light moving description",
        "price": "15000.00"
    },
    {
        "id": 6, //service_id 
        "type": "STANDARD",
        "description": "Standard moving description",
        "price": "20000.00"
    },
    {
        "id": 7,  //service_id 
        "type": "HARD",
        "description": "Hard moving description",
        "price": "40000.00"
    }
]