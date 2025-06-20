import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';
import Ellipse1 from '@/assets/Ellipse 1.png';
import User2 from '@/assets/User 2.png';

const orders = [
  { id: 127, date: 'Mar 3, 2025', status: 'wait' },
  { id: 128, date: 'Mar 3, 2025', status: 'wait' },
  { id: 129, date: 'Mar 3, 2025', status: 'wait' },
  { id: 125, date: 'Mar 3, 2025', status: 'active', user: Ellipse1 },
  { id: 122, date: 'Mar 3, 2025', status: 'active', user: Ellipse1 },
  { id: 124, date: 'Mar 3, 2025', status: 'active', user: User2 },
  { id: 126, date: 'Mar 3, 2025', status: 'active', user: User2 },
  { id: 123, date: 'Mar 3, 2025', status: 'done', user: User2 },
  { id: 121, date: 'Mar 3, 2025', status: 'done', user: Ellipse1 },
];

const ManagerMovingOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const order = orders.find(o => o.id === parseInt(orderId)) || {
    id: parseInt(orderId),
    date: 'Mar 3, 2025',
    status: 'wait'
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeNav="managermoving" setActiveNav={() => {}} />
        <main className="flex-1 mr-[110px]">
          <div className="max-w-5xl mx-auto py-12 px-10">
            <div className="flex items-center mb-8">
              <button onClick={() => navigate('/personal-account', { state: { activeSection: 'managermoving' } })} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.75 19.5L8.25 12L15.75 4.5" stroke="#273655" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="text-xl font-normal text-[#273655]">Назад</h1>
            </div>
            <div className="bg-white p-8">
              <div className="font-semibold text-base text-[#222] mb-2">
                Заказ <span className="font-bold">#{orderId}</span>
                {order.status === 'active' && (
                  <button className="bg-[#F0CA81] text-black text-xs font-medium rounded px-2 py-1 ml-[50px] w-fit">
                    Завершить
                  </button>
                )}
                {order.status === 'done' && (
                  <button className="bg-[#DE1D20] text-black text-xs font-medium rounded px-2 py-1 ml-[50px] w-fit">
                    Удалить
                  </button>
                )}
              </div>
              <div className="text-sm text-[#666666] mb-4">{order.date}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerMovingOrder;
