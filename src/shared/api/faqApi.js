import api from './axios';

export const faqApi = {
    // Получить все FAQ
    getAll: async () => {
        try {
            const response = await api.get('/faq');
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении всех FAQ:', error);
            throw error;
        }
    },

    // Получить FAQ по ID
    getById: async (id) => {
        try {
            const response = await api.get(`/faq/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при получении FAQ с id ${id}:`, error);
            throw error;
        }
    },

    // Создать новый FAQ
    create: async (faqData) => {
        try {
            const response = await api.post('/faq', faqData);
            console.log('FAQ создан:', response.data);
            return response.data;
        } catch (error) {
            console.error('Ошибка при создании FAQ:', error);
            throw error;
        }
    },

    // Обновить существующий FAQ
    update: async (id, updateData) => {
        try {
            const response = await api.put(`/faq/${id}`, updateData);
            console.log('FAQ обновлён:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при обновлении FAQ с id ${id}:`, error);
            throw error;
        }
    },

    // Удалить FAQ по ID
    delete: async (id) => {
        try {
            const response = await api.delete(`/faq/${id}`);
            console.log('FAQ удалён');
            return response.data;
        } catch (error) {
            console.error(`Ошибка при удалении FAQ с id ${id}:`, error);
            throw error;
        }
    }
};
