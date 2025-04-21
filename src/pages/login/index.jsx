import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LoginForm } from '../../features/auth';

const LoginPage = () => {
  const location = useLocation();
  
  // Отладочный вывод для проверки передачи данных
  useEffect(() => {
    if (location.state?.email) {
      console.log('Вход в систему: получен email:', location.state.email);
    } else {
      console.log('Вход в систему: email не получен через state');
      
      // Проверяем URL параметры
      const params = new URLSearchParams(location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        console.log('Вход в систему: получен email из URL:', emailParam);
      }
    }
  }, [location]);
  
  return <LoginForm />;
};

export default LoginPage; 