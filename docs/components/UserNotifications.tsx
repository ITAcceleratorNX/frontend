import React from 'react';
import { Notification } from '../types/notification';
import NotificationCard from './NotificationCard';

interface UserNotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const UserNotifications: React.FC<UserNotificationsProps> = ({ 
  notifications, 
  onMarkAsRead 
}) => {
  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = notification.timestamp.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-gray-400 text-lg mb-2">📫</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Нет уведомлений</h3>
        <p className="text-gray-600">Новые уведомления появятся здесь</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Мои уведомления</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {Object.entries(groupedNotifications).map(([date, notifications]) => (
            <div key={date} className="space-y-4">
              {/* Date Separator */}
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 text-gray-600 text-sm font-medium px-4 py-2 rounded-full">
                  {date}
                </div>
              </div>
              
              {/* Notifications for this date */}
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserNotifications;