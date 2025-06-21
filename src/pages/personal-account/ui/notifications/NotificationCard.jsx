import React from 'react';
import chatIcon from '../../../../assets/chat_icon.png';

const NotificationCard = ({ notification, onMarkAsRead, scale = 1 }) => {
  const handleClick = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.notification_id);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Стили для масштабирования
  const scaleStyle = {
    '--title-size': `${20 * scale}px`,
    '--content-size': `${18 * scale}px`,
    '--time-size': `${16 * scale}px`,
    '--avatar-size': `${(40 * scale) > 80 ? 80 : (40 * scale)}px`,
    '--icon-size': `${(24 * scale) > 50 ? 50 : (24 * scale)}px`,
    padding: `${16 * scale}px`,
    borderRadius: `${8 * scale}px`,
    marginBottom: `${8 * scale}px`,
  };

  return (
    <div 
      className={`relative flex items-start space-x-3 border transition-all duration-200 cursor-pointer hover:shadow-sm ${
        notification.is_read 
          ? 'bg-white border-gray-200' 
          : 'bg-blue-50 border-blue-200 shadow-sm'
      }`}
      onClick={handleClick}
      style={scaleStyle}
    >

      
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="bg-[#1e2c4f] rounded-full flex items-center justify-center"
             style={{
               width: 'var(--avatar-size)',
               height: 'var(--avatar-size)',
             }}>
          <img 
            src={chatIcon} 
            alt="Notification" 
            className="filter invert"
            style={{
              width: 'var(--icon-size)',
              height: 'var(--icon-size)',
            }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1"
                style={{fontSize: 'var(--title-size)'}}>
              {notification.title}
            </h4>
            <p className="text-gray-700 leading-relaxed"
               style={{fontSize: 'var(--content-size)'}}>
              {notification.message}
            </p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <span className="text-gray-500"
                  style={{fontSize: 'var(--time-size)'}}>
              {formatTime(notification.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard; 