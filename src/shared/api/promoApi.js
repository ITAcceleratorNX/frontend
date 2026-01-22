import api from './axios';

const isDevelopment = import.meta.env.DEV;

export const promoApi = {
  /**
   * Validate a promo code
   * @param {string} code - The promo code to validate
   * @param {number} orderAmount - The total order amount
   * @returns {Promise<{valid: boolean, promo_code?: object, discount_amount?: number, discount_percent?: number, error?: string}>}
   */
  validate: async (code, orderAmount) => {
    try {
      if (isDevelopment) {
        console.log('PromoAPI: Validating promo code:', code, 'for amount:', orderAmount);
      }
      const response = await api.post('/promo/validate', { 
        code, 
        order_amount: orderAmount 
      });
      if (isDevelopment) {
        console.log('PromoAPI: Validation result:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PromoAPI: Error validating promo code:', error.response?.data || error.message);
      return {
        valid: false,
        error: error.response?.data?.error || 'Ошибка при проверке промокода'
      };
    }
  },

  /**
   * Get all promo codes (admin/manager only)
   * @param {object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  getAll: async (filters = {}) => {
    try {
      if (isDevelopment) {
        console.log('PromoAPI: Fetching all promo codes with filters:', filters);
      }
      const response = await api.get('/promo', { params: filters });
      if (isDevelopment) {
        console.log('PromoAPI: Fetched', response.data?.length || 0, 'promo codes');
      }
      return response.data;
    } catch (error) {
      console.error('PromoAPI: Error fetching promo codes:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get a single promo code by ID (admin/manager only)
   * @param {number} id - Promo code ID
   * @returns {Promise<object>}
   */
  getById: async (id) => {
    try {
      if (isDevelopment) {
        console.log('PromoAPI: Fetching promo code:', id);
      }
      const response = await api.get(`/promo/${id}`);
      if (isDevelopment) {
        console.log('PromoAPI: Fetched promo code:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PromoAPI: Error fetching promo code:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get promo code statistics (admin/manager only)
   * @param {number} id - Promo code ID
   * @returns {Promise<object>}
   */
  getStatistics: async (id) => {
    try {
      if (isDevelopment) {
        console.log('PromoAPI: Fetching statistics for promo code:', id);
      }
      const response = await api.get(`/promo/${id}/statistics`);
      if (isDevelopment) {
        console.log('PromoAPI: Fetched statistics:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PromoAPI: Error fetching promo code statistics:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Create a new promo code (admin only)
   * @param {object} data - Promo code data
   * @returns {Promise<object>}
   */
  create: async (data) => {
    try {
      if (isDevelopment) {
        console.log('PromoAPI: Creating promo code:', data);
      }
      const response = await api.post('/promo', data);
      if (isDevelopment) {
        console.log('PromoAPI: Promo code created:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PromoAPI: Error creating promo code:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update a promo code (admin only)
   * @param {number} id - Promo code ID
   * @param {object} data - Updated data
   * @returns {Promise<object>}
   */
  update: async (id, data) => {
    try {
      if (isDevelopment) {
        console.log('PromoAPI: Updating promo code:', id, data);
      }
      const response = await api.put(`/promo/${id}`, data);
      if (isDevelopment) {
        console.log('PromoAPI: Promo code updated:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PromoAPI: Error updating promo code:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Deactivate a promo code (admin only)
   * @param {number} id - Promo code ID
   * @returns {Promise<object>}
   */
  deactivate: async (id) => {
    try {
      if (isDevelopment) {
        console.log('PromoAPI: Deactivating promo code:', id);
      }
      const response = await api.delete(`/promo/${id}`);
      if (isDevelopment) {
        console.log('PromoAPI: Promo code deactivated:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PromoAPI: Error deactivating promo code:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Activate a promo code (admin only)
   * @param {number} id - Promo code ID
   * @returns {Promise<object>}
   */
  activate: async (id) => {
    try {
      if (isDevelopment) {
        console.log('PromoAPI: Activating promo code:', id);
      }
      const response = await api.post(`/promo/${id}/activate`);
      if (isDevelopment) {
        console.log('PromoAPI: Promo code activated:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PromoAPI: Error activating promo code:', error.response?.data || error.message);
      throw error;
    }
  },
};
