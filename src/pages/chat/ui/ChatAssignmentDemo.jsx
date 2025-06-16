import React, { memo } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { ChatWindow } from '../../../features/chat';
import { PendingChatsPanel, PendingChatCard } from '../../../features/chat';
import { usePendingChats } from '../../../shared/lib/hooks/use-pending-chats';
import { useManagerChats } from '../../../shared/lib/hooks/use-manager-chats';
import { Users, MessageSquare, Settings, ArrowRight } from 'lucide-react';

const ChatAssignmentDemo = memo(() => {
  const { user, isAuthenticated } = useAuth();
  const { 
    pendingChats, 
    pendingChatsCount, 
    hasWebSocketConnection 
  } = usePendingChats();
  
  const { 
    counts,
    acceptChat 
  } = useManagerChats();

  // Демонстрационные данные для показа
  const demoChats = [
    { id: 1, user_id: 101, status: 'PENDING', createdAt: new Date(Date.now() - 2 * 60 * 1000) },
    { id: 2, user_id: 102, status: 'PENDING', createdAt: new Date(Date.now() - 5 * 60 * 1000) },
    { id: 3, user_id: 103, status: 'PENDING', createdAt: new Date(Date.now() - 10 * 60 * 1000) }
  ];

  const handleDemoAccept = (chatId) => {
    console.log('Demo: Принимаем чат', chatId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Требуется авторизация
          </h2>
          <p className="text-gray-600">
            Войдите в систему для просмотра демонстрации
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                Система назначения чатов
              </h1>
              <p className="mt-2 text-gray-600">
                Демонстрация новой системы управления чатами для менеджеров
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">
                  Роль: {user?.role || 'Неизвестно'}
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${hasWebSocketConnection ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-sm font-medium ${hasWebSocketConnection ? 'text-green-600' : 'text-red-600'}`}>
                  WebSocket: {hasWebSocketConnection ? 'Подключен' : 'Отключен'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {pendingChatsCount || demoChats.length}
                </h3>
                <p className="text-sm text-gray-600">Ожидающие чаты</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {counts?.active || 0}
                </h3>
                <p className="text-sm text-gray-600">Активные чаты</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {counts?.total || 3}
                </h3>
                <p className="text-sm text-gray-600">Всего чатов</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Real-time
                </h3>
                <p className="text-sm text-gray-600">Обновления</p>
              </div>
            </div>
          </div>
        </div>

        {/* Основное содержимое */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка - Ожидающие чаты */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2 text-yellow-600" />
                  Ожидающие чаты
                </h2>
                <p className="mt-1 text-gray-600">
                  Клиенты, ожидающие назначения менеджера
                </p>
              </div>
              
              <div className="p-6">
                {user?.role === 'MANAGER' ? (
                  <PendingChatsPanel 
                    onAcceptChat={acceptChat}
                    className="border-0 shadow-none"
                  />
                ) : (
                  <div className="space-y-4">
                    {demoChats.map((chat) => (
                      <PendingChatCard
                        key={chat.id}
                        chat={chat}
                        onAccept={handleDemoAccept}
                        className="pending-chat-card"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Правая колонка - Описание функций */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Ключевые особенности
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Автоматическое назначение</h3>
                    <p className="text-gray-600">Менеджеры могут принимать чаты в один клик</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-time обновления</h3>
                    <p className="text-gray-600">WebSocket для мгновенных уведомлений</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Индикаторы ожидания</h3>
                    <p className="text-gray-600">Визуальные подсказки о времени ожидания</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Красивый дизайн</h3>
                    <p className="text-gray-600">Современный интерфейс с анимациями</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Инструкция */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">
                Как использовать
              </h3>
              <ol className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  Пользователь нажимает "Начать чат"
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  Чат появляется в списке ожидающих
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  Менеджер нажимает "Принять чат"
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  Чат становится активным для общения
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ChatAssignmentDemo.displayName = 'ChatAssignmentDemo';

export default ChatAssignmentDemo; 