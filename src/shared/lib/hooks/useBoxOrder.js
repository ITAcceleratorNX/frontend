import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccessToast, showErrorToast } from '../toast';
import { useProfileCheck } from './useProfileCheck';

// Пример API для заказа бокса (нужно будет создать отдельно)
const orderBoxApi = {
  createOrder: async (orderData) => {
    // Здесь будет реальный API вызов
    const response = await fetch('/api/orders/box', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      throw new Error('Ошибка при создании заказа');
    }
    
    return response.json();
  }
};

// Хук для заказа бокса с проверкой профиля
export const useBoxOrder = () => {
  const { validateAndRedirect, user, isProfileComplete } = useProfileCheck();
  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: orderBoxApi.createOrder,
    onSuccess: (data) => {
      showSuccessToast('Заказ бокса успешно создан!');
      // Обновляем кэш заказов
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      showErrorToast(`Ошибка при создании заказа: ${error.message}`);
    }
  });

  // Функция для создания заказа с проверкой профиля
  const createBoxOrder = async (boxData) => {
    // Сначала проверяем профиль
    if (!validateAndRedirect('Для заказа бокса необходимо заполнить все данные профиля.')) {
      return;
    }

    // Если профиль заполнен, создаем заказ
    const orderData = {
      ...boxData,
      userProfile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        iin: user.iin,
        address: user.address,
        bday: user.bday
      }
    };

    orderMutation.mutate(orderData);
  };

  return {
    createBoxOrder,
    isLoading: orderMutation.isPending,
    error: orderMutation.error,
    isProfileComplete,
    user
  };
};