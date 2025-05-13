import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '../../features/auth';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/api/axios';

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Отладочный вывод для проверки передачи данных
  useEffect(() => {
    // Проверяем, есть ли код авторизации Google в URL
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    
    if (code) {
      console.log('Вход через Google: получен код авторизации');
      
      // Отправляем код на сервер для завершения аутентификации
      const completeGoogleAuth = async () => {
        try {
          const response = await api.get(`/auth/google/callback?code=${code}`);
          
          if (response.data && response.data.token) {
            console.log('Успешная авторизация через Google');
            // После успешного входа перенаправляем на главную страницу
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error('Ошибка при завершении авторизации через Google:', error);
        }
      };
      
      completeGoogleAuth();
    } else {
      if (location.state?.email) {
        console.log('Вход в систему: получен email:', location.state.email);
      } else {
        console.log('Вход в систему: email не получен через state');
        
        // Проверяем URL параметры
        const emailParam = params.get('email');
        if (emailParam) {
          console.log('Вход в систему: получен email из URL:', emailParam);
        }
      }
    }
  }, [location, navigate, login]);
  
  return <LoginForm />;
};

export default LoginPage; 