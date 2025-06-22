// CourierRequestOrder.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';
import { api } from '../../../shared/api/axios';

const CourierRequestOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/moving/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Ошибка при загрузке заказа:', err);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleActionClick = async () => {
    try {
      if (order.status === 'DELIVERED') {
        await api.delete(`/moving/${orderId}`);
        navigate('/personal-account', { state: { activeSection: 'courierrequests' } });
        return;
      }

      const newStatus = order.status === 'PENDING_FROM' ? 'IN_PROGRESS' : 'DELIVERED';

      await api.put(`/moving/${orderId}`, {
        id: orderId,
        status: newStatus,
      });

      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Ошибка при обновлении или удалении заказа:', err);
    }
  };

  const getActionText = () => {
    if (order.status === 'PENDING_FROM') return 'Принять';
    if (order.status === 'IN_PROGRESS') return 'Завершить';
    if (order.status === 'DELIVERED') return 'Удалить';
    return '';
  };

  if (!order) return <div className="text-center mt-10 text-gray-500">Загрузка...</div>;

  return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav="adminmoving" setActiveNav={() => {}} />
          <main className="flex-1 mr-[110px]">
            <div className="max-w-5xl mx-auto py-12 px-10">
              <div className="flex items-center mb-8">
                <button
                    onClick={() => navigate('/personal-account', { state: { activeSection: 'courierrequests' } })}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15.75 19.5L8.25 12L15.75 4.5" stroke="#273655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <h1 className="text-xl font-normal text-[#273655]">Назад</h1>
              </div>

              <div className="bg-white p-8 rounded shadow-sm">
                <div className="font-semibold text-base text-[#222] mb-2">
                  Заказ <span className="font-bold">#{orderId}</span>
                  <button
                      onClick={handleActionClick}
                      className={`ml-6 ${order.status === 'DELIVERED' ? 'bg-[#DE1D20]' : 'bg-[#263554]'} text-white text-xs font-medium rounded px-3 py-1`}
                  >
                    {getActionText()}
                  </button>
                </div>
                <div className="text-sm text-[#666666] mb-4">Статус: {order.status}</div>
                <div className="mb-4">
                  <p><strong>Адрес клиента:</strong> {order.userAddress}</p>
                  <p><strong>Склад:</strong> {order.warehouseAddress}</p>
                  <p><strong>Хранилище:</strong> {order.storageName}</p>
                </div>
                {order.serviceDescriptions?.length > 0 && (
                    <div className="mb-4">
                      <strong>Услуги:</strong>
                      <ul className="list-disc ml-6 text-sm text-[#444]">
                        {order.serviceDescriptions.map((desc, i) => <li key={i}>{desc}</li>)}
                      </ul>
                    </div>
                )}
                {order.items?.length > 0 && (
                    <div>
                      <strong>Предметы:</strong>
                      <table className="w-full mt-2 text-sm border">
                        <thead>
                        <tr className="bg-gray-100 text-left">
                          <th className="border p-2">Название</th>
                          <th className="border p-2">Объём</th>
                          <th className="border p-2">Маркировка</th>
                        </tr>
                        </thead>
                        <tbody>
                        {order.items.map((item) => (
                            <tr key={item.id}>
                              <td className="border p-2">{item.name}</td>
                              <td className="border p-2">{item.volume} м³</td>
                              <td className="border p-2">{item.cargo_mark}</td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default CourierRequestOrder;