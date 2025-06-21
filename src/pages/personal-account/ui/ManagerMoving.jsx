import React from 'react';
import { useNavigate } from 'react-router-dom';
import Ellipse1 from '../../../assets/image_84.png';
import User2 from '../../../assets/image_84.png';

const avatarImages = import.meta.glob('../../../../assets/*.png', { eager: true });

console.log('Загруженные изображения:', avatarImages);

const getAvatarPath = (filename) => {
  if (!filename) return null;
  return avatarImages[`../../../../assets/${filename}`]?.default || null;
};

const orders = [
  { id: 127, date: '2025-03-03', status: 'wait' },
  { id: 128, date: '2025-03-03', status: 'wait' },
  { id: 129, date: '2025-03-03', status: 'wait' },
  { id: 125, date: '2025-03-03', status: 'active', user: Ellipse1 },
  { id: 122, date: '2025-03-03', status: 'active', user: Ellipse1 },
  { id: 124, date: '2025-03-03', status: 'active', user: User2 },
  { id: 126, date: '2025-03-03', status: 'active', user: User2 },
  { id: 123, date: '2025-03-03', status: 'done', user: User2 },
  { id: 121, date: '2025-03-03', status: 'done', user: Ellipse1 },
];

const columns = [
  {
    title: 'Ожидает грузчика',
    status: 'wait',
  },
  {
    title: 'Активные',
    status: 'active',
  },
  {
    title: 'Завершённые заказы',
    status: 'done',
  },
];

const OrderCard = ({ order }) => {
  const navigate = useNavigate();
  const avatarSrc = order.user;
  const cardStyles = order.status === 'wait' ? 'min-h-[80px] h-[40px]' : 'min-h-[120px] h-[150px]';

  const handleCardClick = () => {
    navigate(`/manager/moving/order/${order.id}`);
  };

  return (
    <div onClick={handleCardClick} className={`relative border border-black rounded-sm bg-white gap-1 px-2 py-2 mb-4 flex flex-col min-w-[260px] w-[290px] ${cardStyles} shadow-sm hover:shadow transition-all cursor-pointer`}>
      <div className="font-semibold text-base text-[#222] mb-1">Заказ <span className="font-bold">#{order.id}</span></div>
      {order.status === 'active' && (
        <button className="bg-[#F0CA81] text-white text-xs font-medium rounded px-2 py-1 mb-1 w-fit">Завершить</button>
      )}
      {order.status === 'done' && (
        <button className="bg-[#DE1D20] text-white text-xs font-medium rounded px-2 py-1 mb-1 w-fit">Удалить</button>
      )}
      <div className="text-sm text-[#666666] mb-1">Mar 3, 2025</div>
      {order.user && order.status !== 'wait' && (
        <div className="absolute bottom-2 right-2">
          <img src={avatarSrc} alt="avatar" className="w-8 h-8 rounded-full border-black object-cover" />
        </div>
      )}
    </div>
  );
};

const ManagerMoving = () => {
  return (
    <div className="flex flex-col md:flex-row items-start justify-center gap-12 w-full h-full px-4 py-8 bg-white min-h-[calc(100vh-80px)] font-['Poppins']">
      {columns.map((col) => (
        <div key={col.status} className="min-w-[280px] max-w-[340px] w-full md:w-[320px] bg-[#F9F9F9] border border-[#E5E5E5] rounded-sm p-3.5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-[#222]">{col.title}</h2>
          {orders.filter((o) => o.status === col.status).map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ManagerMoving;