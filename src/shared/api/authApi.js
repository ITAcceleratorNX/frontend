import axios from 'axios';

const API_URL = 'https://extraspace-backend.onrender.com';

// Создаем настроенный экземпляр axios для всех запросов
const axiosApi = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Включаем отправку cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export const authApi = {
  checkEmail: async (email) => {
    try {
      const response = await axiosApi.post(`/auth/email`, { email });
      return response;
    } catch (error) {
      console.error('Ошибка при проверке email:', error);
      throw error;
    }
  },
  
  login: async (email, password) => {
    try {
      const response = await axiosApi.post(`/auth/login`, { email, password });
      return response;
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      throw error;
    }
  },
  
  register: async (email, unique_code, password) => {
    try {
      const response = await axiosApi.post(`/auth/register`, { 
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
