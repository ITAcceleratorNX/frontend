import {useQuery, useMutation, useQueryClient, useInfiniteQuery} from '@tanstack/react-query';
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
  const isUser = user?.role === 'USER' || user?.role === 'COURIER'; // Добавляем поддержку курьеров

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.user(userId),
    queryFn: () => notificationApi.getUserNotifications(userId),
    enabled: !!userId && isUser, // Включаем для обычных пользователей и курьеров
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
  });
};

// Хук для получения всех уведомлений (менеджеры/админы)
export const useAllNotifications = () => {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 1 }) =>
        notificationApi.getAllNotifications(pageParam, 10),
    getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: isManagerOrAdmin,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
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
      const isUser = user?.role === 'USER' || user?.role === 'COURIER'; // Добавляем поддержку курьеров
      const queryKey = isUser 
        ? NOTIFICATION_QUERY_KEYS.user(user?.id)
        : NOTIFICATION_QUERY_KEYS.all;
      
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey });
      
      // Получаем предыдущие данные для отката
      const previousData = queryClient.getQueryData(queryKey);
      
      // Оптимистично обновляем кеш
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map(notification =>
            notification.notification_id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        };
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

  const memoizedUserRole = useMemo(() => userRole, [userRole]);

  const userNotifications = useUserNotifications();
  const allNotifications = useAllNotifications(); // теперь useInfiniteQuery
  const users = useNotificationUsers();
  const stats = useNotificationStats();

  const sendNotification = useSendNotification();
  const markAsRead = useMarkAsRead();

  return useMemo(() => {
    // --- Для USER / COURIER ---
    if (memoizedUserRole === 'USER' || memoizedUserRole === 'COURIER') {
      return {
        notifications: userNotifications.data || [],
        isLoading: userNotifications.isLoading,
        error: userNotifications.error,
        markAsRead: markAsRead.mutate,
        isMarkingAsRead: markAsRead.isPending,
        users: [],
        sendNotification: null,
        stats: null,
        fetchNextPage: null,
        hasNextPage: false,
        isFetchingNextPage: false,
      };
    }

    // --- Для MANAGER / ADMIN ---
    const notifications =
        allNotifications.data?.pages?.flatMap((page) => page.notifications || []) ||
        [];

    const total = allNotifications.data?.pages?.[0]?.total || 0;
    return {
      notifications,
      total,
      users: users.data || null,
      stats: stats.data || null,
      isLoading: allNotifications.isLoading || users.isLoading,
      error: allNotifications.error || users.error,
      sendNotification: sendNotification.mutate,
      isSending: sendNotification.isPending,
      markAsRead: markAsRead.mutate,
      isMarkingAsRead: markAsRead.isPending,
      fetchNextPage: allNotifications.fetchNextPage,
      hasNextPage: allNotifications.hasNextPage,
      isFetchingNextPage: allNotifications.isFetchingNextPage,
    };
  }, [
    memoizedUserRole,
    userNotifications.data,
    userNotifications.isLoading,
    userNotifications.error,
    allNotifications.data,
    allNotifications.isLoading,
    allNotifications.error,
    allNotifications.fetchNextPage,
    allNotifications.hasNextPage,
    allNotifications.isFetchingNextPage,
    users.data,
    users.isLoading,
    stats.data,
    sendNotification.mutate,
    sendNotification.isPending,
    markAsRead.mutate,
    markAsRead.isPending,
  ]);
};

// Хук для подсчета непрочитанных уведомлений
export const useUnreadNotificationsCount = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const isUser = user?.role === 'USER' || user?.role === 'COURIER';

  const { data: notifications } = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.user(userId),
    queryFn: () => notificationApi.getUserNotifications(userId),
    enabled: !!userId && isUser,
    select: (data) => data.data,
    staleTime: 1 * 60 * 1000, // Уменьшаем время кеширования
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true, // Обновляем при фокусе окна
    refetchOnMount: true, // Обновляем при монтировании компонента
  });

  const unreadCount = useMemo(() => {
    if (!notifications) return 0;
    return notifications.filter(notification => !notification.is_read).length;
  }, [notifications]);

  return unreadCount;
};

// Хук для подсчета доставок со статусом AWAITABLE
export const useAwaitableDeliveriesCount = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const isUser = user?.role === 'USER' || user?.role === 'COURIER';

  const { data: deliveries } = useQuery({
    queryKey: ['userDeliveries'],
    queryFn: async () => {
      // Импортируем ordersApi динамически
      const { ordersApi } = await import('../../api/ordersApi');
      return ordersApi.getUserDeliveries();
    },
    enabled: !!userId && isUser,
    select: (data) => data || [],
    staleTime: 1 * 60 * 1000, // Уменьшаем время кеширования
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true, // Обновляем при фокусе окна
    refetchOnMount: true, // Обновляем при монтировании компонента
  });

  const awaitableCount = useMemo(() => {
    if (!deliveries) return 0;
    return deliveries.filter(delivery => delivery.availability === 'AWAITABLE').length;
  }, [deliveries]);

  return awaitableCount;
};

// Хук для подсчета заказов с pending статусом
export const usePendingExtensionOrdersCount = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const isUser = user?.role === 'USER' || user?.role === 'COURIER';

  const { data: orders } = useQuery({
    queryKey: ['userOrders'],
    queryFn: async () => {
      // Импортируем ordersApi динамически
      const { ordersApi } = await import('../../api/ordersApi');
      return ordersApi.getUserOrders();
    },
    enabled: !!userId && isUser,
    select: (data) => data || [],
    staleTime: 1 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const pendingCount = useMemo(() => {
    if (!orders) return 0;
    return orders.filter(order => order.extension_status === 'PENDING').length;
  }, [orders]);

  return pendingCount;
};
