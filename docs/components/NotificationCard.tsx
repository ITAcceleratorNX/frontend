import React from 'react';
import { Notification } from '../types/notification';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onMarkAsRead 
}) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  const timeString = notification.timestamp.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div 
      className={`relative flex items-start space-x-4 p-4 rounded-lg transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
        !notification.isRead ? 'bg-blue-50 border-l-4 border-[#1e2c4f]' : 'bg-gray-50'
      }`}
      onClick={handleClick}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-[#1e2c4f] rounded-full flex items-center justify-center text-white font-medium text-sm">
          ES
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {notification.content}
            </p>
          </div>
          
          {/* Time */}
          <div className="flex items-center space-x-2 ml-4">
            {!notification.isRead && (
              <div className="w-2 h-2 bg-[#1e2c4f] rounded-full animate-pulse"></div>
            )}
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {timeString}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;