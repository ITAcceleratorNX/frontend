import React from 'react';
import { ChatWindow } from '../../../features/chat';
import { useAuth } from '../../../shared/context/AuthContext';

const ChatSection = () => {
  const { user } = useAuth();

  // Проверяем, имеет ли пользователь доступ к чату (только USER и MANAGER)
  const hasAccess = user && (user.role === 'USER' || user.role === 'MANAGER');

  if (!hasAccess) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold text-gray-600 mb-3">
            Доступ ограничен
          </h2>
          <p className="text-gray-500 text-sm">
            Чат доступен только для пользователей и менеджеров
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Заголовок - компактный */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#273655] mb-2">
          {user.role === 'MANAGER' ? 'Управление чатами' : 'Чат поддержки'}
        </h1>
        <p className="text-gray-600 text-sm">
          {user.role === 'MANAGER' 
            ? 'Управление чатами и поддержка пользователей'
            : 'Получите помощь от наших специалистов'
          }
        </p>
      </div>
      
      {/* Чат окно - адаптивное */}
      <div className="flex justify-center">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatSection; 