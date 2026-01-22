import React, { memo } from 'react';
import { Bell, Loader2, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../../shared/lib/hooks/use-notifications';
import UserNotifications from './notifications/UserNotifications';

/**
 * Мобильный вид «Уведомления»: заголовок + список.
 * Хедер и кнопка «Назад» рисуются в MobileOrdersLayout.
 */
const MobileNotificationsView = memo(() => {
  const { notifications, isLoading, error, markAsRead } = useNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-10 h-10 min-[360px]:w-12 min-[360px]:h-12 text-[#00A991] animate-spin" />
          <p className="text-sm min-[360px]:text-base text-gray-600">Загрузка уведомлений...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] py-8 px-3 text-center">
        <div className="w-12 h-12 min-[360px]:w-14 min-[360px]:h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6 min-[360px]:w-7 min-[360px]:h-7 text-red-600" />
        </div>
        <p className="text-sm min-[360px]:text-base text-gray-700 font-medium mb-1">Ошибка загрузки</p>
        <p className="text-xs min-[360px]:text-sm text-gray-500 mb-4 max-w-[260px]">Не удалось загрузить уведомления</p>
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

  const total = notifications?.length ?? 0;
  const unread = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <div className="min-w-0">
      <h1 className="text-base min-[360px]:text-xl sm:text-2xl font-semibold text-[#363636] mb-1 break-words">
        Уведомления
      </h1>
      <p className="text-xs min-[360px]:text-sm text-gray-500 mb-3 min-[360px]:mb-4 break-words">
        {total === 0
          ? 'У вас пока нет уведомлений'
          : `Всего: ${total}${unread > 0 ? ` • Непрочитанных: ${unread}` : ''}`}
      </p>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 min-[360px]:py-12 px-3 bg-white rounded-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)]">
          <div className="w-14 h-14 min-[360px]:w-16 min-[360px]:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Bell className="w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 text-gray-400" />
          </div>
          <p className="text-sm min-[360px]:text-base font-medium text-gray-700 mb-1">Пока нет уведомлений</p>
          <p className="text-xs min-[360px]:text-sm text-gray-500 text-center max-w-[260px]">
            Когда появятся новые уведомления, они отобразятся здесь
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="p-3 min-[360px]:p-4">
            <UserNotifications notifications={notifications} onMarkAsRead={markAsRead} />
          </div>
        </div>
      )}
    </div>
  );
});

MobileNotificationsView.displayName = 'MobileNotificationsView';

export default MobileNotificationsView;
