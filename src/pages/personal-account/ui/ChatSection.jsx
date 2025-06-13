import React from 'react';
import { ChatWindow } from '../../../features/chat';
import { useAuth } from '../../../shared/context/AuthContext';

const ChatSection = () => {
  const { user } = useAuth();

  // Проверяем, имеет ли пользователь доступ к чату (только USER и MANAGER)
  const hasAccess = user && (user.role === 'USER' || user.role === 'MANAGER');

  if (!hasAccess) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8">
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Доступ ограничен
          </h2>
          <p className="text-gray-500">
            Чат доступен только для пользователей и менеджеров
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#273655] mb-2">
          Чат поддержки
        </h1>
        <p className="text-gray-600">
          {user.role === 'MANAGER' 
            ? 'Управление чатами и поддержка пользователей'
            : 'Получите помощь от наших специалистов'
          }
        </p>
      </div>
      
      <div className="h-[600px]">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatSection; 