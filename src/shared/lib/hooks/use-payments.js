import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../../api/paymentsApi';
import { 
  showPaymentCreated, 
  showPaymentError, 
  showGenericError, 
  showGenericSuccess 
} from '../utils/notifications';

// Ключи для кеширования
export const PAYMENTS_QUERY_KEYS = {
  USER_PAYMENTS: 'user-payments',
  PAYMENT_DETAILS: 'payment-details',
  PRICES: 'prices',
};

/**
 * Хук для получения платежей текущего пользователя
 */
export const useUserPayments = (options = {}) => {
  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEYS.USER_PAYMENTS],
    queryFn: paymentsApi.getUserPayments,
    staleTime: 5 * 60 * 1000, // 5 минут
    cacheTime: 10 * 60 * 1000, // 10 минут
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

/**
 * Хук для создания платежа по заказу
 */
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentsApi.createPayment,
    onSuccess: (data, orderId) => {
      console.log('Платеж успешно создан:', data);
      
      // Инвалидируем кеш платежей и заказов пользователя
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEYS.USER_PAYMENTS] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      
      // Показываем уведомление об успехе
      if (data.payment_page_url) {
        showPaymentCreated();
      }
    },
    onError: (error) => {
      console.error('Ошибка при создании платежа:', error);
      
      const errorMessage = error.response?.data?.message || 'Ошибка при создании платежа';
      
      // Специальная обработка ошибки 409 (конфликт)
      if (error.response?.status === 409) {
        showGenericError('Заказ не подтвержден или уже оплачен');
      } else {
        showPaymentError(error);
      }
    },
  });
};

/**
 * Хук для создания ручной оплаты
 */
export const useCreateManualPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentsApi.createManualPayment,
    onSuccess: (data, orderPaymentId) => {
      console.log('Ручная оплата успешно создана:', data);
      
      // Инвалидируем кеш платежей пользователя
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEYS.USER_PAYMENTS] });
      
      // Показываем уведомление об успехе
      if (data.payment_page_url) {
        showGenericSuccess('Ручная оплата создана! Перенаправляем на страницу оплаты...');
      }
    },
    onError: (error) => {
      console.error('Ошибка при создании ручной оплаты:', error);
      
      const errorMessage = error.response?.data?.message || 'Ошибка при создании ручной оплаты';
      
      // Обработка специфических ошибок
      if (error.response?.status === 403) {
        showGenericError('Нет доступа к ручной оплате');
      } else if (error.response?.status === 404) {
        showGenericError('Платеж не найден');
      } else if (error.response?.status === 400) {
        showGenericError('Ошибка валидации или состояния оплаты');
      } else {
        showGenericError(errorMessage);
      }
    },
  });
};

/**
 * Хук для пакетного создания платежей (если понадобится)
 */
export const useBulkCreatePayments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderIds) => {
      const results = await Promise.allSettled(
        orderIds.map(orderId => paymentsApi.createPayment(orderId))
      );
      
      return {
        successful: results.filter(r => r.status === 'fulfilled').map(r => r.value),
        failed: results.filter(r => r.status === 'rejected').map(r => r.reason),
      };
    },
    onSuccess: (data) => {
      console.log('Пакетные платежи обработаны:', data);
      
      // Инвалидируем кеш
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEYS.USER_PAYMENTS] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      
      // Показываем результат
      const { successful, failed } = data;
      if (successful.length > 0) {
        showGenericSuccess(`Создано платежей: ${successful.length}`);
      }
      if (failed.length > 0) {
        showGenericError(`Ошибок при создании: ${failed.length}`);
      }
    },
    onError: (error) => {
      console.error('Ошибка при пакетном создании платежей:', error);
      showGenericError('Ошибка при создании платежей');
    },
  });
};

/**
 * Хук для получения статистики платежей пользователя
 */
export const usePaymentsStats = () => {
  const { data: payments = [] } = useUserPayments();

  const stats = React.useMemo(() => {
    const totalOrders = payments.length;
    const totalAmount = payments.reduce((sum, order) => {
      return sum + parseFloat(order.total_price || 0);
    }, 0);

    const paidOrders = payments.filter(order => order.payment_status === 'PAID').length;
    const unpaidOrders = payments.filter(order => order.payment_status === 'UNPAID').length;

    // Статистика по месячным платежам
    const monthlyPayments = payments.flatMap(order => order.order_payment || []);
    const paidMonths = monthlyPayments.filter(payment => payment.status === 'PAID').length;
    const unpaidMonths = monthlyPayments.filter(payment => payment.status === 'UNPAID').length;
    const manualMonths = monthlyPayments.filter(payment => payment.status === 'MANUAL').length;

    return {
      totalOrders,
      totalAmount,
      paidOrders,
      unpaidOrders,
      monthlyStats: {
        total: monthlyPayments.length,
        paid: paidMonths,
        unpaid: unpaidMonths,
        manual: manualMonths,
      },
    };
  }, [payments]);

  return stats;
}; 

/**
 * Хук для создания платежа для дополнительной услуги (для активных заказов)
 */
export const useCreateAdditionalServicePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, serviceType }) => paymentsApi.createAdditionalServicePayment(orderId, serviceType),
    onSuccess: (data, variables) => {
      console.log('Платеж для дополнительной услуги успешно создан:', data);
      
      // Инвалидируем кеш платежей и заказов пользователя
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEYS.USER_PAYMENTS] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'details'] });
    },
    onError: (error, variables) => {
      console.error('Ошибка при создании платежа для дополнительной услуги:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при создании платежа';
      showGenericError(errorMessage);
    }
  });
};

// Хук для добавления услуги к заказу
export const useCreateOrderService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, serviceId }) => paymentsApi.createOrderService(orderId, serviceId),
    onSuccess: (data) => {
      console.log('Услуга успешно добавлена к заказу:', data);
      showGenericSuccess('Услуга добавлена к заказу');
      
      // Обновляем кеш заказов
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
    },
    onError: (error) => {
      console.error('Ошибка добавления услуги к заказу:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при добавлении услуги';
      showGenericError(errorMessage);
    }
  });
};

// Хук для создания заявки на мувинг
export const useCreateMoving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, movingDate, status, address }) => 
      paymentsApi.createMoving(orderId, movingDate, { status, address }),
    onSuccess: (data) => {
      console.log('Заявка на мувинг успешно создана:', data);

      // Обновляем кеш
      queryClient.invalidateQueries({ queryKey: ['moving'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'details'] });
    },
    onError: (error) => {
      console.error('Ошибка создания заявки на мувинг:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при создании заявки на мувинг';
      showGenericError(errorMessage);
    }
  });
};

// Хук для получения тарифов
export const useGetPrices = (options = {}) => {
  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEYS.PRICES],
    queryFn: paymentsApi.getPrices,
    staleTime: 10 * 60 * 1000, // 10 минут - тарифы редко меняются
    cacheTime: 30 * 60 * 1000, // 30 минут
    ...options
  });
}; 