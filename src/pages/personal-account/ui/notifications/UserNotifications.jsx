import React, { memo, useMemo } from 'react';
import clsx from 'clsx';
import { Calendar, Bell, Inbox } from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext.jsx';
import NotificationCard from './NotificationCard';

const formatGroupDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const UserNotifications = memo(({
  notifications,
  onMarkAsRead,
  onNotificationClick,
  variant = 'default',
}) => {
  const { isDark } = useTheme();
  const isPanel = variant === 'panel';

  const sortedGroups = useMemo(() => {
    const groups = notifications.reduce((acc, notification) => {
      const date = formatGroupDate(notification.created_at);
      if (!acc[date]) acc[date] = [];
      acc[date].push(notification);
      return acc;
    }, {});

    return Object.entries(groups)
      .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
      .map(([date, items]) => [
        date,
        [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
      ]);
  }, [notifications]);

  const todayLabel = useMemo(() => formatGroupDate(new Date()), []);

  if (notifications.length === 0) {
    return (
      <div className={clsx('flex items-center justify-center', isPanel ? 'py-8' : 'py-16')}>
        <div className="text-center space-y-3 max-w-sm">
          <div
            className={clsx(
              'w-14 h-14 rounded-full flex items-center justify-center mx-auto',
              isDark ? 'bg-[var(--staff-surface-hover)]' : 'bg-gray-100',
            )}
          >
            <Inbox className={clsx('w-7 h-7', isDark ? 'text-[var(--staff-text-muted)]' : 'text-gray-400')} />
          </div>
          <div className="space-y-1">
            <h3
              className={clsx(
                'text-base font-semibold',
                isDark ? 'text-[var(--staff-text)]' : 'text-gray-900',
              )}
            >
              Пока нет уведомлений
            </h3>
            <p className={clsx('text-sm', isDark ? 'text-[var(--staff-text-muted)]' : 'text-gray-500')}>
              Когда у вас появятся новые уведомления, они будут отображаться здесь
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isPanel ? 'space-y-3' : 'space-y-6'}>
      {sortedGroups.map(([date, dateNotifications], groupIndex) => {
        const unreadCount = dateNotifications.filter((n) => !n.is_read).length;
        const isToday = date === todayLabel;

        return (
          <div key={date} className={isPanel ? 'space-y-2' : 'space-y-4'}>
            <div
              className={clsx(
                'sticky top-0 z-10 border-b pb-2 mb-2',
                isPanel ? 'pt-0' : 'pb-3 mb-4',
                isDark
                  ? 'bg-[var(--staff-surface-raised)] border-[var(--staff-border)]'
                  : isPanel
                    ? 'bg-white border-gray-200'
                    : 'bg-white border-gray-200',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={clsx(
                      'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                      isDark ? 'bg-[var(--staff-accent)]/25' : 'bg-[#B0C6C5]',
                    )}
                  >
                    <Calendar className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3
                      className={clsx(
                        'font-semibold truncate',
                        isPanel ? 'text-sm' : 'text-lg',
                        isDark ? 'text-[var(--staff-text)]' : 'text-gray-900',
                      )}
                    >
                      {isToday ? 'Сегодня' : date}
                    </h3>
                    <p
                      className={clsx(
                        'text-xs',
                        isDark ? 'text-[var(--staff-text-muted)]' : 'text-gray-600',
                      )}
                    >
                      {dateNotifications.length} уведомлений
                      {unreadCount > 0 && (
                        <span
                          className={clsx(
                            'ml-2 inline-flex items-center px-1.5 py-0.5 text-xs rounded-full',
                            isDark
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-blue-100 text-blue-800',
                          )}
                        >
                          {unreadCount} новых
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {!isPanel && unreadCount > 0 && (
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <Bell className="w-4 h-4 text-blue-500" />
                  </div>
                )}
              </div>
            </div>

            <div className={isPanel ? 'space-y-2' : 'space-y-3'}>
              {dateNotifications.map((notification) => (
                <NotificationCard
                  key={notification.notification_id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onNotificationClick={onNotificationClick}
                />
              ))}
            </div>

            {!isPanel && groupIndex < sortedGroups.length - 1 && (
              <div className="flex items-center my-6">
                <div className={clsx('flex-1 border-t', isDark ? 'border-[var(--staff-border)]' : 'border-gray-200')} />
                <div
                  className={clsx(
                    'mx-3 text-xs px-3 py-1 rounded-full border',
                    isDark
                      ? 'text-[var(--staff-text-muted)] bg-[var(--staff-surface)] border-[var(--staff-border)]'
                      : 'text-gray-500 bg-white border-gray-200',
                  )}
                >
                  Более ранние уведомления
                </div>
                <div className={clsx('flex-1 border-t', isDark ? 'border-[var(--staff-border)]' : 'border-gray-200')} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

UserNotifications.displayName = 'UserNotifications';

export default UserNotifications;
