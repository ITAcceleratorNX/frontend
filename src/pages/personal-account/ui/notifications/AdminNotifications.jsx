import React, { useState, useEffect } from 'react';
import { Settings, Plus, History, Loader2, AlertCircle, Shield, BarChart3 } from 'lucide-react';
import { useNotifications } from '../../../../shared/lib/hooks/use-notifications';
import { toast } from 'react-toastify';
import NotificationCard from './NotificationCard';
import CreateNotificationForm from './CreateNotificationForm';
import NotificationHistory from './NotificationHistory';

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState('history');
  
  // Используем хук для получения данных уведомлений
  const {
    notifications,
    users,
    stats,
    isLoading,
    error,
    sendNotification,
    isSending,
    markAsRead
  } = useNotifications();

  // Отладочный вывод для проверки структуры данных (только в development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('AdminNotifications - полученные данные:', notifications);
    }
  }, [notifications]);

  // Handle sending new notification
  const handleSendNotification = async (notification) => {
    try {
      await sendNotification(notification);
      setActiveTab('history');
      toast.success('Уведомление успешно отправлено!');
    } catch (error) {
      console.error('Send notification error:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-12 h-12 text-[#1e2c4f] animate-spin" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Загрузка системы уведомлений
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
            <p className="text-gray-600">Не удалось загрузить систему уведомлений</p>
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

  const totalNotifications = notifications?.length || 0;
  const totalUsers = users?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e2c4f] to-[#2d3f5f] rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
        <div>
              <h1 className="text-2xl font-bold mb-1">Система уведомлений</h1>
              <p className="text-white/80">
                Управление уведомлениями и коммуникацией с пользователями
          </p>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-white/80 text-sm">Всего уведомлений</p>
                <p className="text-xl font-bold text-white">{totalNotifications}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-white/80 text-sm">Пользователей</p>
                <p className="text-xl font-bold text-white">{totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <Plus className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-white/80 text-sm">Отправлено сегодня</p>
                <p className="text-xl font-bold text-white">{stats?.sentToday || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200">
          <nav className="flex">
          <button
            onClick={() => setActiveTab('create')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
              activeTab === 'create'
                  ? 'border-b-2 border-[#1e2c4f] text-[#1e2c4f] bg-blue-50'
                  : 'text-gray-600 hover:text-[#1e2c4f] hover:bg-gray-50'
            }`}
          >
              <Plus className="w-4 h-4" />
              <span>Создать уведомление</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
              activeTab === 'history'
                  ? 'border-b-2 border-[#1e2c4f] text-[#1e2c4f] bg-blue-50'
                  : 'text-gray-600 hover:text-[#1e2c4f] hover:bg-gray-50'
            }`}
            >
              <History className="w-4 h-4" />
              <span>История уведомлений</span>
              {totalNotifications > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {totalNotifications}
                </span>
              )}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'create' && (
            <div className="p-6">
          <CreateNotificationForm
            users={users || []}
            onSendNotification={handleSendNotification}
          />
            </div>
        )}
        
                  {activeTab === 'history' && (
            <div className="p-6">
          <NotificationHistory
            notifications={notifications || []}
          />
            </div>
        )}
        </div>
      </div>

      {/* Loading overlay для отправки */}
      {isSending && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 text-center">
            <Loader2 className="w-8 h-8 text-[#1e2c4f] animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Отправка уведомления</h3>
            <p className="text-gray-600">Пожалуйста, подождите...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications; 