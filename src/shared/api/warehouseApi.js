import api from './axios';

export const warehouseApi = {
    // Создание нового склада, warehouseData это обьект
    create: async (warehouseData) => {
        try {
            console.log('Создание склада:', warehouseData);
            const response = await api.post('/warehouses', warehouseData);
            console.log('Склад создан:', response.data);
            return response.data;
        } catch (error) {
            console.error('Ошибка при создании склада:', error);
            throw error;
        }
    },

    // Получение всех складов
    getAll: async () => {
        try {
            const response = await api.get('/warehouses');
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении складов:', error);
            throw error;
        }
    },

    // Получение одного склада по ID
    getById: async (id) => {
        try {
            const response = await api.get(`/warehouses/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при получении склада с id ${id}:`, error);
            throw error;
        }
    },

    // Обновление склада, updateData это обьект
    update: async (id, updateData) => {
        try {
            const response = await api.put(`/warehouses/${id}`, updateData);
            console.log('Склад обновлён:', response.data);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при обновлении склада с id ${id}:`, error);
            throw error;
        }
    },

    // Удаление склада
    delete: async (id) => {
        try {
            const response = await api.delete(`/warehouses/${id}`);
            console.log('Склад удалён');
            return response.data;
        } catch (error) {
            console.error(`Ошибка при удалении склада с id ${id}:`, error);
            throw error;
        }
    }
};
