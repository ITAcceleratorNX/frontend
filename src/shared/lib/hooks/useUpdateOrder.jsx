import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/axios.js'

export const useUpdateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const response = await api.put(`/orders/${data.id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userOrders'] });
            queryClient.invalidateQueries({ queryKey: ['order', 'details'] });
        },
        onError: (error) => {
            console.error('Ошибка обновления заказа:', error);
        },
    });
};