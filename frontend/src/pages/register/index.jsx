import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RegisterForm } from '../../features/auth';

const RegisterPage = () => {
  const location = useLocation();
  
  // Отладочный вывод для проверки передачи данных
  useEffect(() => {
    if (location.state?.email) {
      console.log('Регистрация: получен email:', location.state.email);
    } else {
      console.log('Регистрация: email не получен через state');
      
      // Проверяем URL параметры
      const params = new URLSearchParams(location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        console.log('Регистрация: получен email из URL:', emailParam);
      }
    }
  }, [location]);
  
  return <RegisterForm />;
};

export default RegisterPage; 