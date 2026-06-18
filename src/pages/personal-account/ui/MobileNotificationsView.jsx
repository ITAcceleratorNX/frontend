import React, { memo, useState, useMemo } from 'react';
import clsx from 'clsx';
import { Bell, Loader2, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../../shared/lib/hooks/use-notifications';
import { useTheme } from '../../../shared/context/ThemeContext';
import UserNotifications from './notifications/UserNotifications';

/**
 * Мобильный вид «Уведомления»: заголовок + список.
 * Хедер и кнопка «Назад» рисуются в MobileOrdersLayout.
 */
const MobileNotificationsView = memo(() => {
  const { notifications, isLoading, error, markAsRead } = useNotifications();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { isDark } = useTheme();

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    return showUnreadOnly
      ? notifications.filter((n) => !n.is_read)
      : notifications;
  }, [notifications, showUnreadOnly]);

  const total = notifications?.length ?? 0;
  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 text-[#00A991] animate-spin" />
          <p className={clsx(
            'text-sm min-[360px]:text-base',
            isDark ? 'text-[var(--staff-text-secondary)]' : 'text-gray-600',
          )}>Загрузка уведомлений...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] py-8 px-3 text-center">
        <div className={clsx(
          'w-12 h-12 min-[360px]:w-14 min-[360px]:h-14 rounded-full flex items-center justify-center mb-3',
          isDark ? 'bg-red-500/20' : 'bg-red-100',
        )}>
          <AlertCircle className="w-6 h-6 min-[360px]:w-7 min-[360px]:h-7 text-red-500" />
        </div>
        <p className={clsx(
          'text-sm min-[360px]:text-base font-medium mb-1',
          isDark ? 'text-[var(--staff-text)]' : 'text-gray-700',
        )}>Ошибка загрузки</p>
        <p className={clsx(
          'text-xs min-[360px]:text-sm mb-4 max-w-[260px]',
          isDark ? 'text-[var(--staff-text-muted)]' : 'text-gray-500',
        )}>Не удалось загрузить уведомления</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium rounded-xl bg-[#00A991] text-white hover:bg-[#00A991]/90 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h1 className={clsx(
          'text-base min-[360px]:text-xl sm:text-2xl font-semibold break-words',
          isDark ? 'text-[var(--staff-text)]' : 'text-[#363636]',
        )}>
          Уведомления
        </h1>

        {unread > 0 && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className={clsx(
              'text-xs min-[360px]:text-sm',
              isDark ? 'text-[var(--staff-text-secondary)]' : 'text-gray-700',
            )}>
              Только непрочитанные
            </span>

            <div className="relative">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={() => setShowUnreadOnly((prev) => !prev)}
                className="sr-only peer"
              />
              <div className={clsx(
                'w-9 h-5 rounded-full transition-colors',
                isDark ? 'bg-[var(--staff-surface-hover)] peer-checked:bg-[#00A991]' : 'bg-gray-300 peer-checked:bg-[#00A991]',
              )} />
              <div className={clsx(
                'absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4',
                isDark ? 'bg-[var(--staff-text)]' : 'bg-white',
              )} />
            </div>
          </label>
        )}
      </div>
      <p className={clsx(
        'text-xs min-[360px]:text-sm mb-3 min-[360px]:mb-4 break-words',
        isDark ? 'text-[var(--staff-text-muted)]' : 'text-gray-500',
      )}>
        {total === 0
          ? 'У вас пока нет уведомлений'
          : `Всего: ${total}${unread > 0 ? ` • Непрочитанных: ${unread}` : ''}`}
      </p>

      {filteredNotifications.length === 0 ? (
        <div className={clsx(
          'flex flex-col items-center justify-center py-10 min-[360px]:py-12 px-3 rounded-[25px]',
          isDark
            ? 'bg-[var(--staff-surface)] border border-[var(--staff-border)]'
            : 'bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)]',
        )}>
          <div className={clsx(
            'w-14 h-14 min-[360px]:w-16 min-[360px]:h-16 rounded-full flex items-center justify-center mb-3',
            isDark ? 'bg-[var(--staff-surface-hover)]' : 'bg-gray-100',
          )}>
            <Bell className={clsx(
              'w-7 h-7 min-[360px]:w-8 min-[360px]:h-8',
              isDark ? 'text-[var(--staff-text-muted)]' : 'text-gray-400',
            )} />
          </div>
          <p className={clsx(
            'text-sm min-[360px]:text-base font-medium mb-1',
            isDark ? 'text-[var(--staff-text)]' : 'text-gray-700',
          )}>
            {showUnreadOnly ? 'Нет непрочитанных уведомлений' : 'Пока нет уведомлений'}
          </p>
          <p className={clsx(
            'text-xs min-[360px]:text-sm text-center max-w-[260px]',
            isDark ? 'text-[var(--staff-text-muted)]' : 'text-gray-500',
          )}>
            Когда появятся новые уведомления, они отобразятся здесь
          </p>
        </div>
      ) : (
        <div className={clsx(
          'rounded-[25px] overflow-hidden',
          isDark
            ? 'bg-[var(--staff-surface)] border border-[var(--staff-border)]'
            : 'bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)]',
        )}>
          <div className="p-3 min-[360px]:p-4">
            <UserNotifications notifications={filteredNotifications} onMarkAsRead={markAsRead} />
          </div>
        </div>
      )}
    </div>
  );
});

MobileNotificationsView.displayName = 'MobileNotificationsView';

export default MobileNotificationsView;
