import React from 'react';
import { Bell, CheckCircle, Clock, MessageSquare } from 'lucide-react';

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
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'contract':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-[#1e2c4f]" />;
    }
  };

  const getNotificationStyle = (isRead) => {
    if (isRead) {
      return {
        cardClass: 'bg-white border-gray-200 hover:border-gray-300',
        indicatorClass: 'opacity-0',
        titleClass: 'text-gray-900',
        contentClass: 'text-gray-600',
        timeClass: 'text-gray-500'
      };
    }
    
    return {
      cardClass: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md',
      indicatorClass: 'opacity-100 bg-blue-500',
      titleClass: 'text-gray-900',
      contentClass: 'text-gray-700',
      timeClass: 'text-blue-600'
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
        relative group cursor-pointer border rounded-xl p-4 
        transition-all duration-300 ease-in-out
        ${styles.cardClass}
        hover:shadow-lg hover:scale-[1.02]
      `}
      onClick={handleClick}
      style={scaleStyle}
    >
      {/* Индикатор непрочитанного уведомления */}
      <div 
        className={`
          absolute top-4 left-4 w-2.5 h-2.5 rounded-full 
          transition-opacity duration-300 ${styles.indicatorClass}
        `}
      />
      
      <div className="flex items-start space-x-4 pl-4">
        {/* Иконка уведомления */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
            {getNotificationIcon(notification.notification_type)}
        </div>
      </div>
      
        {/* Контент */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
              <h4 className={`font-semibold text-sm leading-tight mb-1 ${styles.titleClass}`}>
              {notification.title}
            </h4>
              <p className={`text-sm leading-relaxed ${styles.contentClass}`}>
              {notification.message}
            </p>
          </div>
            
            {/* Время и статус */}
            <div className="flex-shrink-0 flex flex-col items-end space-y-1">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className={`text-xs font-medium ${styles.timeClass}`}>
              {formatTime(notification.created_at)}
            </span>
              </div>
              
              {notification.is_read && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Прочитано</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hover эффект */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e2c4f]/0 to-[#1e2c4f]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default NotificationCard; 