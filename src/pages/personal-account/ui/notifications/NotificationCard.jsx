import React from 'react';
import { Bell, CheckCircle, MessageSquare } from 'lucide-react';

const NotificationCard = ({ notification, onMarkAsRead, scale = 1 }) => {
  const handleClick = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.notification_id);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / 1000 / 60);
    
    if (diffInMinutes < 1) return 'Только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'contract':
        return <MessageSquare className="w-5 h-5 text-white" />;
      default:
        return <Bell className="w-5 h-5 text-white" />;
    }
  };

  const getNotificationStyle = (isRead) => {
    if (isRead) {
      return {
        cardClass: 'bg-white border border-[#DFDFDF]',
        indicatorClass: 'opacity-0',
        titleClass: 'text-gray-900',
        contentClass: 'text-gray-600',
        timeClass: 'text-gray-500'
      };
    }
    
    return {
      cardClass: 'bg-white border border-[#DFDFDF]',
      indicatorClass: 'opacity-0',
      titleClass: 'text-gray-900',
      contentClass: 'text-gray-700',
      timeClass: 'text-gray-500'
    };
  };

  const styles = getNotificationStyle(notification.is_read);

  // Стили для масштабирования
  const scaleStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    marginBottom: `${12 * scale}px`,
  };

  return (
    <div 
      className={`
        relative cursor-pointer border rounded-md p-3
        ${styles.cardClass}
      `}
      onClick={handleClick}
      style={scaleStyle}
    >
      <div className="flex items-start space-x-3">
        {/* Иконка уведомления */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-[#B0C6C5] rounded-full flex items-center justify-center">
            {getNotificationIcon(notification.notification_type)}
          </div>
        </div>
      
        {/* Контент */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm leading-tight mb-1 break-words ${styles.titleClass}`}>
                {notification.title}
              </h4>
              <p className={`text-sm leading-relaxed break-words break-all ${styles.contentClass}`}>
                {notification.message}
              </p>
            </div>
            
            {/* Время и статус */}
            <div className="flex-shrink-0 flex flex-col items-end space-y-1">
              <span className={`text-xs whitespace-nowrap ${styles.timeClass}`}>
                {formatTime(notification.created_at)}
              </span>
              
              {notification.is_read && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-[#00A991] rounded-full"></div>
                  <span className="text-xs text-[#00A991] whitespace-nowrap">Прочитано</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard; 