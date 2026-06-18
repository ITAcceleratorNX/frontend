import React, { memo } from 'react';
import clsx from 'clsx';
import { Bell, CheckCircle, MessageSquare } from 'lucide-react';
import { useTheme } from '@/shared/context/ThemeContext.jsx';

/**
 * Определяет раздел ЛК для перехода по типу уведомления
 */
export const getNotificationTarget = (notification) => {
  const type = (notification?.notification_type || notification?.type || '').toLowerCase();
  const orderId = notification?.order_id ?? notification?.related_order_id;

  let meta = notification?.metadata || notification?.meta || notification?.data;
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta);
    } catch {
      meta = null;
    }
  }
  if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    const section = meta.activeSection || meta.target_section || meta.section;
    if (section === 'lpleads' || section === 'lp_leads') {
      return { activeSection: 'lpleads' };
    }
  }

  const landingTypes = new Set([
    'landing_lead',
    'lp_lead',
    'lead_landing',
    'landing_page_lead',
    'lp_form',
    'submit_lead',
    'lead_submit',
    'extraspace_landing',
  ]);
  if (landingTypes.has(type)) {
    return { activeSection: 'lpleads' };
  }

  const text = `${notification?.title || ''} ${notification?.message || ''}`.toLowerCase();
  if (
    text.includes('лендинг') ||
    text.includes('landing') ||
    /lp[-\s]?[123]/.test(text) ||
    (text.includes('заявк') &&
      (text.includes('форм') || text.includes('сайт') || text.includes('реклам')))
  ) {
    return { activeSection: 'lpleads' };
  }

  switch (type) {
    case 'contract':
      return { activeSection: 'payments', orderId };
    case 'payment':
      return { activeSection: 'payments', orderId };
    case 'delivery':
      return { activeSection: 'delivery', deliveryId: orderId };
    case 'general':
    default:
      return { activeSection: 'orders' };
  }
};

const NotificationCard = memo(({ notification, onMarkAsRead, onNotificationClick }) => {
  const { isDark } = useTheme();

  const handleClick = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.notification_id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
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
      minute: '2-digit',
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

  return (
    <div
      className={clsx(
        'relative cursor-pointer border rounded-md p-3 transition-colors',
        isDark
          ? 'bg-[var(--staff-surface)] border-[var(--staff-border)] hover:bg-[var(--staff-surface-hover)]'
          : 'bg-white border-[#DFDFDF] hover:bg-gray-50',
        !notification.is_read && isDark && 'border-[var(--staff-accent)]/40',
        !notification.is_read && !isDark && 'border-[#00A991]/30',
      )}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div
            className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isDark ? 'bg-[var(--staff-accent)]/30' : 'bg-[#B0C6C5]',
            )}
          >
            {getNotificationIcon(notification.notification_type)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4
                className={clsx(
                  'font-semibold text-sm leading-tight mb-1 break-words',
                  isDark ? 'text-[var(--staff-text)]' : 'text-gray-900',
                )}
              >
                {notification.title}
              </h4>
              <p
                className={clsx(
                  'text-sm leading-relaxed break-words break-all',
                  isDark ? 'text-[var(--staff-text-secondary)]' : 'text-gray-600',
                )}
              >
                {notification.message}
              </p>
              {notification.sender_id && notification.recipients?.length > 0 && (
                <p
                  className={clsx(
                    'text-xs mt-1.5',
                    isDark ? 'text-[var(--staff-text-muted)]' : 'text-gray-500',
                  )}
                >
                  Кому: {notification.recipients.map((r) => r.name || r.email || `#${r.id}`).join(', ')}
                </p>
              )}
            </div>

            <div className="flex-shrink-0 flex flex-col items-end space-y-1">
              <span
                className={clsx(
                  'text-xs whitespace-nowrap',
                  isDark ? 'text-[var(--staff-text-muted)]' : 'text-gray-500',
                )}
              >
                {formatTime(notification.created_at)}
              </span>

              {notification.is_read && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-[#00A991] rounded-full" />
                  <span className="text-xs text-[#00A991] whitespace-nowrap">Прочитано</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

NotificationCard.displayName = 'NotificationCard';

export default NotificationCard;
