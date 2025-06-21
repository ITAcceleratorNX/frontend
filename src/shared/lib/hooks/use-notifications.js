import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useMemo } from 'react';

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
  const isUser = user?.role === 'USER';

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.user(userId),
    queryFn: () => notificationApi.getUserNotifications(userId),
    enabled: !!userId && isUser, // Включаем только для обычных пользователей
    select: (data) => {
      // Если data.data является объектом с полем notifications, извлекаем массив
      if (data.data && Array.isArray(data.data.notifications)) {
        return data.data.notifications;
      }
      // Если data.data уже массив, возвращаем его
      if (Array.isArray(data.data)) {
        return data.data;
      }
      // В остальных случаях возвращаем пустой массив
      return [];
    },
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
    select: (data) => {
      // Если data.data является объектом с полем notifications, извлекаем массив
      if (data.data && Array.isArray(data.data.notifications)) {
        return data.data.notifications;
      }
      // Если data.data уже массив, возвращаем его
      if (Array.isArray(data.data)) {
        return data.data;
      }
      // В остальных случаях возвращаем пустой массив
      return [];
    },
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
        if (!Array.isArray(oldData)) return oldData;
        return [data.data, ...oldData];
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
      const isUser = user?.role === 'USER';
      const queryKey = isUser 
        ? NOTIFICATION_QUERY_KEYS.user(user?.id)
        : NOTIFICATION_QUERY_KEYS.all;
      
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey });
      
      // Получаем предыдущие данные для отката
      const previousData = queryClient.getQueryData(queryKey);
      
      // Оптимистично обновляем кеш
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map(notification =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: true }
            : notification
        );
      });
      
      return { previousData, queryKey };
    },
    onError: (err, notificationId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast.error('Ошибка при пометке уведомления как прочитанного');
    },
    onSettled: (data, error, notificationId, context) => {
      // Перезапрашиваем данные после мутации
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
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
  
  // Мемоизируем роль для предотвращения ненужных ререндеров
  const memoizedUserRole = useMemo(() => userRole, [userRole]);
  
  const userNotifications = useUserNotifications();
  const allNotifications = useAllNotifications();
  const users = useNotificationUsers();
  const stats = useNotificationStats();
  
  const sendNotification = useSendNotification();
  const markAsRead = useMarkAsRead();

  // Мемоизируем результат для предотвращения ненужных ререндеров
  return useMemo(() => {
    // Возвращаем данные в зависимости от роли
    if (memoizedUserRole === 'USER') {
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
  }, [
    memoizedUserRole,
    userNotifications.data,
    userNotifications.isLoading,
    userNotifications.error,
    allNotifications.data,
    allNotifications.isLoading,
    allNotifications.error,
    users.data,
    users.isLoading,
    stats.data,
    sendNotification.mutate,
    sendNotification.isPending,
    markAsRead.mutate,
    markAsRead.isPending
  ]);
}; 