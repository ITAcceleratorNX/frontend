import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../shared/api/axios';

const columns = [
  { title: 'Ожидает грузчика', status: 'PENDING' },
  { title: 'В процессе доставки', status: 'IN_PROGRESS' },
  { title: 'Завершённые заказы', status: 'DELIVERED' },
];

const OrderCard = ({ order, onStatusChange }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/personal-account/courier/order/${order.movingOrderId}`);
  };

  const handleAction = async () => {
    try {
      if (order.status === 'PENDING_FROM' || order.status === 'PENDING_TO') {
        await api.put(`/moving/${order.movingOrderId}`, {
          id: order.movingOrderId,
          status: 'IN_PROGRESS',
        });
      } else if (order.status === 'IN_PROGRESS') {
        await api.put(`/moving/${order.movingOrderId}`, {
          id: order.movingOrderId,
          status: 'DELIVERED',
        });
      } else if (order.status === 'DELIVERED') {
        await api.delete(`/moving/${order.movingOrderId}`);
      }
      onStatusChange();
    } catch (error) {
      console.error('Ошибка при изменении статуса заказа:', error);
    }
  };

  return (
      <div onClick={handleCardClick} className="relative border border-black rounded-sm bg-white gap-1 px-2 py-2 mb-4 flex flex-col min-w-[260px] w-[290px] min-h-[150px] shadow-sm hover:shadow transition-all cursor-pointer">
        <div className="font-semibold text-base text-[#222] mb-1">
          Заказ <span className="font-bold">#{order.movingOrderId}</span>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          {(order.status === 'PENDING_FROM' || order.status === 'PENDING_TO') && (
              <button onClick={handleAction} className="bg-[#263554] text-white text-xs font-medium rounded px-2 py-1 mb-1 w-fit">
                Принять
              </button>
          )}
          {order.status === 'IN_PROGRESS' && (
              <button onClick={handleAction} className="bg-[#F0CA81] text-white text-xs font-medium rounded px-2 py-1 mb-1 w-fit">
                Завершить
              </button>
          )}
          {order.status === 'DELIVERED' && (
              <button onClick={handleAction} className="bg-[#DE1D20] text-white text-xs font-medium rounded px-2 py-1 mb-1 w-fit">
                Удалить
              </button>
          )}
        </div>

        <div className="text-sm text-[#666666] mb-1">{order?.warehouseAddress || 'Дата не указана'}</div>
        <div className="text-xs text-[#444]">{order?.storageName} • {order?.userAddress}</div>
      </div>
  );
};

const CourierRequest = () => {
  const [orders, setOrders] = useState({
    PENDING: [],
    IN_PROGRESS: [],
    DELIVERED: [],
  });

  const fetchOrders = async () => {
    try {
      const results = await Promise.all([
        api.get('/moving/status/PENDING_FROM'),
        api.get('/moving/status/PENDING_TO'),
        api.get('/moving/status/IN_PROGRESS'),
        api.get('/moving/status/DELIVERED'),
      ]);

      // Фильтрация по availability
      const filterAvailable = (orders) =>
          orders.filter((order) => order.availability === 'AVAILABLE');

      const newOrders = {
        PENDING: filterAvailable([...results[0].data, ...results[1].data]),
        IN_PROGRESS: filterAvailable(results[2].data),
        DELIVERED: filterAvailable(results[3].data),
      };

      setOrders(newOrders);
    } catch (err) {
      console.error('Ошибка при загрузке заказов:', err);
    }
  };


  useEffect(() => {
    fetchOrders();
  }, []);

  return (
      <div className="flex flex-col md:flex-row items-start justify-center gap-12 w-full h-full px-4 py-8 bg-white min-h-[calc(100vh-80px)] font-['Poppins']">
        {columns.map((col) => (
            <div key={col.status} className="min-w-[280px] max-w-[340px] w-full md:w-[320px] bg-[#F9F9F9] border border-[#E5E5E5] rounded-sm p-3.5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-[#222]">{col.title}</h2>
              {orders[col.status]?.map((order) => (
                  <OrderCard key={order.movingOrderId} order={order} onStatusChange={fetchOrders} />
              ))}
            </div>
        ))}
      </div>
  );
};

export default CourierRequest;