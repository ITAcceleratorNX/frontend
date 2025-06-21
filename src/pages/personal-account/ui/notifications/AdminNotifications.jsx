import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../../shared/lib/hooks/use-notifications';
import { toast } from 'react-toastify';
import NotificationCard from './NotificationCard';
import CreateNotificationForm from './CreateNotificationForm';
import NotificationHistory from './NotificationHistory';

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [interfaceScale, setInterfaceScale] = useState(1); // Масштаб интерфейса (1 = 100%)
  
  // Загружаем сохраненный масштаб при монтировании
  useEffect(() => {
    const savedScale = localStorage.getItem('notificationScale');
    if (savedScale) {
      setInterfaceScale(parseFloat(savedScale));
    }
  }, []);
  
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

  // Функция для изменения масштаба интерфейса
  const changeScale = (newScale) => {
    setInterfaceScale(newScale);
    localStorage.setItem('notificationScale', newScale);
  };

  // Стили для масштабирования
  const scaleStyle = {
    fontSize: `${16 * interfaceScale}px`,
    '--card-width': `${650 * interfaceScale}px`,
    '--card-height': `${Math.min(700 * interfaceScale, 800)}px`,
    '--heading-size': `${26 * interfaceScale}px`,
    '--text-size': `${20 * interfaceScale}px`,
    '--button-height': `${50 * interfaceScale}px`,
    '--button-font': `${20 * interfaceScale}px`,
    '--spacing': `${20 * interfaceScale}px`,
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6" style={scaleStyle}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e2c4f] mx-auto mb-4"></div>
            <p className="text-gray-600" style={{fontSize: 'var(--text-size)'}}>Загрузка уведомлений...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6" style={scaleStyle}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600" style={{fontSize: 'var(--text-size)'}}>Ошибка загрузки уведомлений</p>
            <p className="text-gray-500 mt-2" style={{fontSize: 'var(--text-size)'}}>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={scaleStyle}>
      {/* Header with role indicator and scale controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900" style={{fontSize: 'var(--heading-size)'}}>
            Система уведомлений
          </h1>
          <p className="text-gray-600 mt-1" style={{fontSize: 'var(--text-size)'}}>
            Управляйте системой уведомлений
          </p>
        </div>
        
        {/* Scale Controls */}
        <div className="flex items-center space-x-4">
          <span className="text-gray-600" style={{fontSize: 'var(--text-size)'}}>Масштаб:</span>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => changeScale(0.8)} 
              className={`px-3 py-1 rounded ${interfaceScale === 0.8 ? 'bg-[#1e2c4f] text-white' : 'bg-gray-200'}`}
              style={{fontSize: 'var(--button-font)'}}
            >
              A-
            </button>
            <button 
              onClick={() => changeScale(1)} 
              className={`px-3 py-1 rounded ${interfaceScale === 1 ? 'bg-[#1e2c4f] text-white' : 'bg-gray-200'}`}
              style={{fontSize: 'var(--button-font)'}}
            >
              A
            </button>
            <button 
              onClick={() => changeScale(1.2)} 
              className={`px-3 py-1 rounded ${interfaceScale === 1.2 ? 'bg-[#1e2c4f] text-white' : 'bg-gray-200'}`}
              style={{fontSize: 'var(--button-font)'}}
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Simplified Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3 px-6 border-b-2 font-medium transition-colors ${
              activeTab === 'create'
                ? 'border-[#1e2c4f] text-[#1e2c4f]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={{fontSize: 'var(--button-font)'}}
          >
            Создать
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-6 border-b-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-[#1e2c4f] text-[#1e2c4f]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            style={{fontSize: 'var(--button-font)'}}
          >
            История
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'create' && (
          <CreateNotificationForm
            users={users || []}
            onSendNotification={handleSendNotification}
            scale={interfaceScale}
          />
        )}
        
        {activeTab === 'history' && (
          <NotificationHistory
            notifications={notifications || []}
            scale={interfaceScale}
          />
        )}
      </div>
    </div>
  );
};

export default AdminNotifications; 