import api from './axios';

const buildBase = (orderId) => `/orders/${orderId}/documents`;

export const orderDocumentsApi = {
  list: async (orderId) => {
    const { data } = await api.get(buildBase(orderId));
    return Array.isArray(data?.documents) ? data.documents : [];
  },

  upload: async (orderId, file, { document_type, visible_to_client } = {}) => {
    const form = new FormData();
    form.append('file', file);
    if (document_type !== undefined && document_type !== null && document_type !== '') {
      form.append('document_type', document_type);
    }
    if (typeof visible_to_client === 'boolean') {
      form.append('visible_to_client', String(visible_to_client));
    }
    const { data } = await api.post(buildBase(orderId), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data?.document;
  },

  update: async (orderId, documentId, patch) => {
    const { data } = await api.patch(`${buildBase(orderId)}/${documentId}`, patch);
    return data?.document;
  },

  delete: async (orderId, documentId) => {
    await api.delete(`${buildBase(orderId)}/${documentId}`);
  },

  open: async (orderId, documentId) => {
    const { data } = await api.get(`${buildBase(orderId)}/${documentId}/open`);
    return data;
  },

  download: async (orderId, documentId) => {
    const { data } = await api.get(`${buildBase(orderId)}/${documentId}/download`);
    return data;
  },
};

export default orderDocumentsApi;
