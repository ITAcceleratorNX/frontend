import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

// Query keys для уведомлений
export const NOTIFICATION_QUERY_KEYS = {
  all: ['notifications'],
  user: (userId) => ['notifications', 'user', userId],
  users: ['notifications', 'users'],
  stats: ['notifications', 'stats']
};

// Хук для получения уведомлений пользователя
export const useUserNotifications = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.user(userId),
    queryFn: () => notificationApi.getUserNotifications(userId),
    enabled: !!userId,
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения всех уведомлений (менеджеры/админы)
export const useAllNotifications = () => {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.all,
    queryFn: () => notificationApi.getAllNotifications(),
    enabled: isManagerOrAdmin,
    select: (data) => data.data,
    staleTime: 2 * 60 * 1000, // 2 минуты
    cacheTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для получения списка пользователей
export const useNotificationUsers = () => {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.users,
    queryFn: () => notificationApi.getUsers(),
    enabled: isManagerOrAdmin,
    select: (data) => data.data,
    staleTime: 10 * 60 * 1000, // 10 минут
    cacheTime: 15 * 60 * 1000, // 15 минут
  });
};

// Хук для отправки уведомления
export const useSendNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notification) => notificationApi.sendNotification(notification),
    onSuccess: (data) => {
      // Инвалидируем кеш уведомлений
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.stats });
      
      // Добавляем новое уведомление в кеш оптимистично
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.all, (oldData) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: [data.data, ...oldData.data]
        };
      });

      toast.success('Уведомление успешно отправлено!');
    },
    onError: (error) => {
      console.error('Error sending notification:', error);
      toast.error('Ошибка при отправке уведомления');
    }
  });
};

// Хук для пометки уведомления как прочитанного
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (notificationId) => notificationApi.markAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_QUERY_KEYS.user(user?.id) });
      
      // Получаем предыдущие данные для отката
      const previousData = queryClient.getQueryData(NOTIFICATION_QUERY_KEYS.user(user?.id));
      
      // Оптимистично обновляем кеш
      queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.user(user?.id), (oldData) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        };
      });
      
      return { previousData };
    },
    onError: (err, notificationId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousData) {
        queryClient.setQueryData(NOTIFICATION_QUERY_KEYS.user(user?.id), context.previousData);
      }
      toast.error('Ошибка при пометке уведомления как прочитанного');
    },
    onSettled: () => {
      // Перезапрашиваем данные после мутации
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.user(user?.id) });
    }
  });
};

// Хук для получения статистики уведомлений
export const useNotificationStats = () => {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.stats,
    queryFn: () => notificationApi.getNotificationStats(),
    enabled: isManagerOrAdmin,
    select: (data) => data.data,
    staleTime: 1 * 60 * 1000, // 1 минута
    cacheTime: 5 * 60 * 1000, // 5 минут
  });
};

// Композитный хук для уведомлений в зависимости от роли
export const useNotifications = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  
  const userNotifications = useUserNotifications();
  const allNotifications = useAllNotifications();
  const users = useNotificationUsers();
  const stats = useNotificationStats();
  
  const sendNotification = useSendNotification();
  const markAsRead = useMarkAsRead();

  // Возвращаем данные в зависимости от роли
  if (userRole === 'USER') {
    return {
      notifications: userNotifications.data || [],
      isLoading: userNotifications.isLoading,
      error: userNotifications.error,
      markAsRead: markAsRead.mutate,
      isMarkingAsRead: markAsRead.isPending,
      // Для пользователей не нужны эти функции
      users: [],
      sendNotification: null,
      stats: null
    };
  }

  // Для менеджеров и админов
  return {
    notifications: allNotifications.data || [],
    users: users.data || [],
    stats: stats.data || null,
    isLoading: allNotifications.isLoading || users.isLoading,
    error: allNotifications.error || users.error,
    sendNotification: sendNotification.mutate,
    isSending: sendNotification.isPending,
    markAsRead: markAsRead.mutate,
    isMarkingAsRead: markAsRead.isPending
  };
}; 