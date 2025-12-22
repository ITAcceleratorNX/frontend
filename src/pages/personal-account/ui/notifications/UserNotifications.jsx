import React from 'react';
import { Calendar, Bell, Inbox } from 'lucide-react';
import NotificationCard from './NotificationCard';

const UserNotifications = ({ notifications, onMarkAsRead, scale = 1 }) => {
  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  // Сортируем группы по дате (новые сверху)
  const sortedGroups = Object.entries(groupedNotifications).sort(([dateA], [dateB]) => {
    return new Date(dateB) - new Date(dateA);
  });

  if (notifications.length === 0) {
    return (
      <div 
        className="flex items-center justify-center py-16" 
        style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
      >
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Пока нет уведомлений</h3>
            <p className="text-gray-500">
              Когда у вас появятся новые уведомления, они будут отображаться здесь
        </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="space-y-6" 
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
    >
      {sortedGroups.map(([date, notifications]) => {
        const unreadCount = notifications.filter(n => !n.is_read).length;
        const isToday = date === new Date().toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });
        
        return (
            <div key={date} className="space-y-4">
            {/* Date Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#B0C6C5] rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {isToday ? 'Сегодня' : date}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {notifications.length} уведомлений
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {unreadCount} новых
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                {/* Индикатор активности */}
                {unreadCount > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <Bell className="w-4 h-4 text-blue-500" />
                  </div>
                )}
                </div>
              </div>
              
              {/* Notifications for this date */}
            <div className="space-y-4">
              {notifications
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((notification, index) => (
                  <div 
                    key={notification.notification_id}
                    className="relative"
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideIn 0.5s ease-out forwards'
                    }}
                  >
                    <NotificationCard
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                      scale={1}
                  />
                  </div>
                ))}
            </div>

            {/* Разделитель между днями */}
            {sortedGroups.indexOf([date, notifications]) < sortedGroups.length - 1 && (
              <div className="flex items-center my-8">
                <div className="flex-1 border-t border-gray-200"></div>
                <div className="mx-4 text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
                  Более ранние уведомления
                </div>
                <div className="flex-1 border-t border-gray-200"></div>
        </div>
            )}
      </div>
        );
      })}

      {/* Анимация для новых элементов */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default UserNotifications; 