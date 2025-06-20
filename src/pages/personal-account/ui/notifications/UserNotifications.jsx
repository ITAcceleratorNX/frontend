import React from 'react';
import NotificationCard from './NotificationCard';

const UserNotifications = ({ notifications, onMarkAsRead, scale = 1 }) => {
  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  // Стили для масштабирования
  const scaleStyle = {
    fontSize: scale ? `${16 * scale}px` : 'inherit',
    '--heading-size': `${22 * scale}px`,
    '--text-size': `${18 * scale}px`,
  };

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center" style={scaleStyle}>
        <div className="text-gray-400 text-4xl mb-4">📫</div>
        <h3 className="font-medium text-gray-900 mb-2" style={{fontSize: 'var(--heading-size)'}}>
          Нет уведомлений
        </h3>
        <p className="text-gray-600" style={{fontSize: 'var(--text-size)'}}>
          Новые уведомления появятся здесь
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto" style={scaleStyle}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900" style={{fontSize: 'var(--heading-size)'}}>
            Мои уведомления
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          {Object.entries(groupedNotifications).map(([date, notifications]) => (
            <div key={date} className="space-y-4">
              {/* Date Separator */}
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 text-gray-600 font-medium px-4 py-2 rounded-full"
                     style={{fontSize: 'var(--text-size)'}}>
                  {date}
                </div>
              </div>
              
              {/* Notifications for this date */}
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.notification_id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    scale={scale}
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