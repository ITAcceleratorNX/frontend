import api from './axios';

/**
 * Предпросмотр цены камеры хранения: months = сутки 1..14.
 * На бэкенде: total = volume × days × price_per_m3_per_day (тариф из строки по числу суток).
 */
export async function calculateCameraBulkPrice({
  warehouseId,
  volumeM3,
  days,
  services = [],
  signal,
}) {
  const response = await api.post(
    '/prices/calculate-bulk',
    {
      services,
      storageType: 'CAMERA',
      volume: volumeM3,
      months: days,
      warehouse_id: warehouseId,
    },
    signal ? { signal } : undefined
  );
  return response.data;
}

/**
 * Создание заказа камеры хранения (JWT).
 * @param {object} payload — см. CreateCameraStorageOrderDto на бэкенде
 */
export async function createCameraStorageOrder(payload) {
  const response = await api.post('/orders/camera-storage', payload);
  return response.data;
}

export const cameraStorageApi = {
  getConfig: async (warehouseId) => {
    const response = await api.get(`/camera-storage/config/${warehouseId}`);
    return response.data;
  },
  updateConfig: async (warehouseId, payload) => {
    const response = await api.put(`/camera-storage/config/${warehouseId}`, payload);
    return response.data;
  },
  calculateBulkPrice: calculateCameraBulkPrice,
  createOrder: createCameraStorageOrder,
};
