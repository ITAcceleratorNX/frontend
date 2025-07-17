import React, { useState, useEffect } from 'react';
import { Bell, Settings, Loader2, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../../../shared/lib/hooks/use-notifications';
import UserNotifications from './UserNotifications';

const UserNotificationsPage = () => {
  // Используем хук для получения данных уведомлений
  const {
    notifications,
    isLoading,
    error,
    markAsRead
  } = useNotifications();

  // Отладочный вывод для проверки структуры данных (только в development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('UserNotificationsPage - полученные данные:', notifications);
    }
  }, [notifications]);

  const unreadCount = notifications?.filter(n => !n.is_read)?.length || 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-12 h-12 text-[#1e2c4f] animate-spin" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Загрузка уведомлений
            </h3>
            <p className="text-sm text-muted-foreground">
              Пожалуйста, подождите...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">Ошибка загрузки</h3>
            <p className="text-gray-600">Не удалось загрузить уведомления</p>
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-[#1e2c4f] text-white rounded-lg hover:bg-[#1e2c4f]/90 transition-colors font-medium"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e2c4f] to-[#2d3f5f] rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
        <div>
              <h1 className="text-2xl font-bold mb-1">Мои уведомления</h1>
              <p className="text-white/80">
                {notifications?.length > 0 
                  ? `Всего уведомлений: ${notifications.length}${unreadCount > 0 ? ` • Непрочитанных: ${unreadCount}` : ''}`
                  : 'У вас пока нет уведомлений'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        {notifications?.length > 0 && (
          <div className="flex items-center mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-white/80">Непрочитанные: {unreadCount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white/80">Прочитанные: {notifications.length - unreadCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 min-h-[500px]">
        {notifications?.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Пока нет уведомлений</h3>
                <p className="text-gray-500 max-w-sm">
                  Когда у вас появятся новые уведомления, они будут отображаться здесь
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
        <UserNotifications 
          notifications={notifications || []}
          onMarkAsRead={markAsRead}

        />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNotificationsPage; 