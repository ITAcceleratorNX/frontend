import React from 'react';
import { Calendar, Users, User } from 'lucide-react';
import { Notification } from '../types/notification';

interface NotificationHistoryProps {
  notifications: Notification[];
}

const NotificationHistory: React.FC<NotificationHistoryProps> = ({ notifications }) => {
  const sortedNotifications = [...notifications].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">История пуста</h3>
        <p className="text-gray-600">Отправленные уведомления появятся здесь</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        История уведомлений ({notifications.length})
      </h3>
      
      <div className="space-y-4">
        {sortedNotifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {notification.title}
                </h4>
                <p className="text-gray-700 text-sm mb-3">
                  {notification.content}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {notification.timestamp.toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })} в {notification.timestamp.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {notification.recipients.length === 1 ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                    <span>
                      {notification.recipients.length === 1 
                        ? '1 получатель' 
                        : `${notification.recipients.length} получателей`
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Отправлено
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationHistory;