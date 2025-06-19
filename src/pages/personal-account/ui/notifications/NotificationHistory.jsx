import React, { useState } from 'react';
import NotificationCard from './NotificationCard';

const NotificationHistory = ({ notifications = [], scale = 1 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, read, unread

  // Стили для масштабирования
  const scaleStyle = {
    fontSize: `${16 * scale}px`,
    '--heading-size': `${24 * scale}px`,
    '--text-size': `${18 * scale}px`,
    '--button-size': `${18 * scale}px`,
    '--input-size': `${18 * scale}px`,
    '--button-height': `${50 * scale}px`,
    '--spacing': `${20 * scale}px`,
    '--input-padding': `${16 * scale}px`,
    '--border-radius': `${8 * scale}px`,
  };

  // Filter notifications based on search and filter type
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'read' && notification.isRead) ||
      (filterType === 'unread' && !notification.isRead);
    
    return matchesSearch && matchesFilter;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {});

  const getFilterCount = (type) => {
    if (type === 'all') return notifications.length;
    if (type === 'read') return notifications.filter(n => n.isRead).length;
    if (type === 'unread') return notifications.filter(n => !n.isRead).length;
    return 0;
  };

  return (
    <div className="max-w-4xl mx-auto" style={scaleStyle}>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="font-semibold text-gray-900" style={{fontSize: 'var(--heading-size)'}}>
              История уведомлений
            </h2>
            
            {/* Search */}
            <div className="relative max-w-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e2c4f] focus:border-transparent"
                placeholder="Поиск уведомлений..."
                style={{
                  fontSize: 'var(--input-size)',
                  height: 'var(--button-height)',
                }}
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setFilterType('all')}
              className={`px-6 py-3 rounded text-center transition-colors ${
                filterType === 'all'
                  ? 'bg-[#1e2c4f] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                fontSize: 'var(--button-size)',
                minWidth: `${100 * scale}px`,
              }}
            >
              Все ({getFilterCount('all')})
            </button>
            <button
              onClick={() => setFilterType('unread')}
              className={`px-6 py-3 rounded text-center transition-colors ${
                filterType === 'unread'
                  ? 'bg-[#1e2c4f] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                fontSize: 'var(--button-size)',
                minWidth: `${160 * scale}px`,
              }}
            >
              Непрочитанные ({getFilterCount('unread')})
            </button>
            <button
              onClick={() => setFilterType('read')}
              className={`px-6 py-3 rounded text-center transition-colors ${
                filterType === 'read'
                  ? 'bg-[#1e2c4f] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                fontSize: 'var(--button-size)',
                minWidth: `${160 * scale}px`,
              }}
            >
              Прочитанные ({getFilterCount('read')})
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="font-medium text-gray-900 mb-2" style={{fontSize: 'var(--heading-size)'}}>
                {searchTerm || filterType !== 'all' 
                  ? 'Ничего не найдено' 
                  : 'История пуста'
                }
              </h3>
              <p className="text-gray-600" style={{fontSize: 'var(--text-size)'}}>
                {searchTerm || filterType !== 'all'
                  ? 'Попробуйте изменить параметры поиска'
                  : 'Отправленные уведомления появятся здесь'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(([date, notifications]) => (
                <div key={date} className="space-y-4">
                  {/* Date Separator */}
                  <div className="flex items-center justify-center">
                    <div className="bg-gray-100 text-gray-600 font-medium px-6 py-3 rounded-full"
                         style={{fontSize: 'var(--text-size)'}}>
                      {date}
                    </div>
                  </div>
                  
                  {/* Notifications for this date */}
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="relative">
                        <NotificationCard
                          notification={notification}
                          onMarkAsRead={() => {}} // History mode - no marking as read
                          scale={scale}
                        />
                        {/* Recipients info */}
                        <div className="mt-2 ml-13 text-gray-500"
                             style={{
                               marginLeft: `${52 * scale}px`,
                               fontSize: 'var(--text-size)'
                             }}>
                          Получатели: {notification.recipients?.length || 0} пользователей
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationHistory; 