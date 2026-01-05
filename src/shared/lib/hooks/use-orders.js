import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api/ordersApi';
import { showOrderStatusUpdate, showOrderDeleteSuccess, showGenericError, showGenericSuccess } from '../utils/notifications';

// Ключи для React Query
export const ORDERS_QUERY_KEYS = {
  ALL: ['orders'],
  ALL_ORDERS: ['orders', 'all'],
  USER_ORDERS: ['orders', 'user'],
  ORDER_BY_ID: (id) => ['orders', 'detail', id]
};

/**
 * Хук для получения всех заказов (для MANAGER и ADMIN)
 */
export const useAllOrders = (page = 1, options = {}) => {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEYS.ALL_ORDERS, page],
    queryFn: () => ordersApi.getAllOrders(page),
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    ...options
  });
};
export const useSearchOrders = (query) => {
  return useQuery({
    queryKey: ['orders', 'search', query],
        queryFn: () => ordersApi.searchOrders(query),
    enabled: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};
/**
 * Хук для получения заказов текущего пользователя
 */
export const useUserOrders = (options = {}) => {
  return useQuery({
    queryKey: ORDERS_QUERY_KEYS.USER_ORDERS,
    queryFn: ordersApi.getUserOrders,
    staleTime: 3 * 60 * 1000, // 3 минуты
    cacheTime: 10 * 60 * 1000, // 10 минут
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    ...options
  });
};

/**
 * Хук для обновления статуса заказа
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }) => ordersApi.updateOrderStatus(orderId, status),
    onSuccess: (data, variables) => {
      // Инвалидируем кеш заказов (все страницы) и статистики
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.ALL_ORDERS });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.USER_ORDERS });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
      
      // Показываем уведомление через централизованную функцию
      showOrderStatusUpdate(variables.status);
    },
    onError: (error, variables) => {
      console.error('Ошибка при обновлении статуса заказа:', error);
      showGenericError(`Не удалось обновить статус заказа #${variables.orderId}`);
    }
  });
};

/**
 * Хук для удаления заказа
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => ordersApi.deleteOrder(orderId),
    onSuccess: (data, orderId) => {
      // Инвалидируем кеш заказов (все страницы) и статистики
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.ALL_ORDERS });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.USER_ORDERS });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
      
      // Показываем уведомление через централизованную функцию
      showOrderDeleteSuccess();
    },
    onError: (error, orderId) => {
      console.error('Ошибка при удалении заказа:', error);
      showGenericError(`Не удалось удалить заказ #${orderId}`);
    }
  });
};

/**
 * Хук для подтверждения заказа пользователем (PATCH /orders/:id/approve)
 */
export const useApproveOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => ordersApi.approveOrder(orderId),
    onSuccess: (data, orderId) => {
      // Инвалидируем кеш заказов (все страницы) и статистики
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.USER_ORDERS });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.ALL_ORDERS });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
      
      showGenericSuccess(`Заказ #${orderId} успешно подтвержден!`);
    },
    onError: (error, orderId) => {
      console.error('Ошибка при подтверждении заказа:', error);
      showGenericError(`Не удалось подтвердить заказ #${orderId}`);
    }
  });
};

/**
 * Хук для массового обновления заказов
 */
export const useBulkUpdateOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orders) => {
      const promises = orders.map(({ orderId, status }) => 
        ordersApi.updateOrderStatus(orderId, status)
      );
      return Promise.all(promises);
    },
    onSuccess: (data, orders) => {
      // Инвалидируем кеш заказов (все страницы) и статистики
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.ALL_ORDERS });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.USER_ORDERS });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
      
      showGenericSuccess(`Успешно обновлено ${orders.length} заказов`);
    },
    onError: (error, orders) => {
      console.error('Ошибка при массовом обновлении заказов:', error);
      showGenericError(`Не удалось обновить заказы`);
    }
  });
};

/**
 * Хук для получения статистики заказов
 */
export const useOrdersStats = () => {
  const { data: statsData, isLoading, error } = useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: ordersApi.getOrdersStats,
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  const stats = React.useMemo(() => {
    if (!statsData) {
      return {
        total: 0,
        inactive: 0,
        approved: 0,
        processing: 0,
        active: 0,
        paid: 0,
        unpaid: 0
      };
    }

    return {
      total: statsData.total || 0,
      inactive: statsData.inactive || 0,
      approved: statsData.approved || 0,
      processing: statsData.processing || 0,
      active: statsData.active || 0,
      paid: statsData.paid || 0,
      unpaid: statsData.unpaid || 0
    };
  }, [statsData]);

  return {
    stats,
    isLoading,
    error
  };
}; 

/**
 * Хук для расширенного обновления заказа с услугами и moving_orders
 */
export const useUpdateOrderWithServices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, orderData }) => ordersApi.updateOrderWithServices(orderId, orderData),
    onSuccess: (data, variables) => {
      // Инвалидируем кеш заказов (все страницы) и статистики
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.ALL_ORDERS });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.USER_ORDERS });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
      
      showGenericSuccess(`Заказ #${variables.orderId} успешно подтвержден с дополнительными услугами!`);
    },
    onError: (error, variables) => {
      console.error('Ошибка при расширенном обновлении заказа:', error);
      showGenericError(`Не удалось обновить заказ #${variables.orderId} с услугами`);
    }
  });
}; 

/**
 * Хук для получения договоров пользователя
 */
export const useContracts = (options = {}) => {
  return useQuery({
    queryKey: ['contracts', 'user'],
    queryFn: ordersApi.getContracts,
    staleTime: 5 * 60 * 1000, // 5 минут
    ...options
  });
}; 

/**
 * Хук для отмены договора
 */
export const useCancelContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, documentId, cancelReason, cancelComment }) =>
      ordersApi.cancelContract({ orderId, documentId, cancelReason, cancelComment }),
    onSuccess: () => {
      showGenericSuccess('Успешный запрос на отмену договора');
      queryClient.invalidateQueries({ queryKey: ['contracts', 'user'] });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.ALL_ORDERS });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.USER_ORDERS });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
    },
    onError: (error) => {
      console.error('Ошибка при отмене договора:', error);
      showGenericError(error.response?.data?.message || 'Не удалось отменить договор');
    }
  });
};

/**
 * Хук для расторжения заказа (для USER)
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, cancelReason, cancelComment }) =>
      ordersApi.cancelOrder({ orderId, cancelReason, cancelComment }),
    onSuccess: () => {
      showGenericSuccess('Запрос на расторжение контракта отправлен');
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.ALL_ORDERS });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.USER_ORDERS });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'user'] });
    },
    onError: (error) => {
      console.error('Ошибка при расторжении заказа:', error);
      showGenericError(error.response?.data?.message || 'Не удалось расторгнуть контракт');
    }
  });
};

/**
 * Хук для подтверждения возврата (для ADMIN/MANAGER)
 */
export const useApproveCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => ordersApi.approveCancelOrder(orderId),
    onSuccess: () => {
      showGenericSuccess('Возврат успешно подтвержден');
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.ALL_ORDERS });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEYS.USER_ORDERS });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'user'] });
    },
    onError: (error) => {
      console.error('Ошибка при подтверждении возврата:', error);
      showGenericError(error.response?.data?.message || 'Не удалось подтвердить возврат');
    }
  });
};

/**
 * Хук для скачивания файла договора
 */
export const useDownloadContract = () => {
  return useMutation({
    mutationFn: async (documentId) => {
      const blob = await ordersApi.downloadContractFile(documentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract-${documentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      showGenericSuccess('Файл договора успешно скачан');
    },
    onError: (error) => {
      console.error('Ошибка при скачивании файла договора:', error);
      showGenericError('Не удалось скачать файл договора');
    },
  });
}; 

/**
 * Хук для скачивания файла предмета заказа
 */
export const useDownloadItemFile = () => {
  return useMutation({
    mutationFn: async (itemId) => {
      const { blob, contentType, contentDisposition } = await ordersApi.downloadItemFile(itemId);
      
      // Извлекаем имя файла из Content-Disposition заголовка, если он есть
      let fileName = `order_item_${itemId}.docx`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Создаем blob с правильным MIME-типом
      const typedBlob = new Blob([blob], { 
        type: contentType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const url = window.URL.createObjectURL(typedBlob);
      
      // Создаем ссылку для скачивания и автоматически кликаем по ней
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Удаляем ссылку и освобождаем URL
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      showGenericSuccess('Файл предмета успешно скачан');
    },
    onError: (error) => {
      console.error('Ошибка при скачивании файла предмета:', error);
      showGenericError('Не удалось скачать файл предмета');
    },
  });
}; 

export const useExtendOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (extendData) => ordersApi.extendOrder(extendData),
    onSuccess: () => {
      // Инвалидируем кеш заказов пользователя, чтобы они загрузились заново
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
    },
  });
}; 

/**
 * Хук для получения деталей договора по order_id
 */
export const useContractDetails = (orderId, options = {}) => {
  return useQuery({
    queryKey: ['contracts', 'details', orderId],
    queryFn: () => ordersApi.getContractDetails(orderId),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 минут
    ...options
  });
}; 