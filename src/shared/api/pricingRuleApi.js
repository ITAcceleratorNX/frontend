import api from './axios';

const isDevelopment = import.meta.env.DEV;

export const pricingRuleApi = {
  /**
   * Get all pricing rules (admin/manager only)
   * @param {object} filters - Optional filters { is_active, warehouse_id, price_type, search }
   * @returns {Promise<Array>}
   */
  getAll: async (filters = {}) => {
    try {
      if (isDevelopment) {
        console.log('PricingRuleAPI: Fetching all rules with filters:', filters);
      }
      const response = await api.get('/pricing-rules', { params: filters });
      if (isDevelopment) {
        console.log('PricingRuleAPI: Fetched', response.data?.length || 0, 'rules');
      }
      return response.data;
    } catch (error) {
      console.error('PricingRuleAPI: Error fetching rules:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get a single pricing rule by ID
   * @param {number} id
   * @returns {Promise<object>}
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/pricing-rules/${id}`);
      return response.data;
    } catch (error) {
      console.error('PricingRuleAPI: Error fetching rule:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Create a new pricing rule (admin only)
   * @param {object} data
   * @returns {Promise<object>}
   */
  create: async (data) => {
    try {
      if (isDevelopment) {
        console.log('PricingRuleAPI: Creating rule:', data);
      }
      const response = await api.post('/pricing-rules', data);
      if (isDevelopment) {
        console.log('PricingRuleAPI: Rule created:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PricingRuleAPI: Error creating rule:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Update a pricing rule (admin only)
   * @param {number} id
   * @param {object} data
   * @returns {Promise<object>}
   */
  update: async (id, data) => {
    try {
      if (isDevelopment) {
        console.log('PricingRuleAPI: Updating rule:', id, data);
      }
      const response = await api.put(`/pricing-rules/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('PricingRuleAPI: Error updating rule:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Deactivate a pricing rule (admin only)
   * @param {number} id
   * @returns {Promise<object>}
   */
  deactivate: async (id) => {
    try {
      const response = await api.delete(`/pricing-rules/${id}`);
      return response.data;
    } catch (error) {
      console.error('PricingRuleAPI: Error deactivating rule:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Activate a pricing rule (admin only)
   * @param {number} id
   * @returns {Promise<object>}
   */
  activate: async (id) => {
    try {
      const response = await api.post(`/pricing-rules/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error('PricingRuleAPI: Error activating rule:', error.response?.data || error.message);
      throw error;
    }
  },
};
