import axios from 'axios';

const API_URL = 'https://extraspace-backend.onrender.com';

export const authApi = {
  checkEmail: async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/email`, { email });
      return response;
    } catch (error) {
      console.error('Ошибка при проверке email:', error);
      throw error;
    }
  },
  
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      return response;
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      throw error;
    }
  },
  
  register: async (email, unique_code, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { 
      email, 
      unique_code, 
      password 
    });
      return response;
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  }
};
