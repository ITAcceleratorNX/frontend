import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RegisterForm, RegisterLegalForm } from '../../features/auth';

const RegisterPage = () => {
  const location = useLocation();
  const [userType, setUserType] = useState('INDIVIDUAL'); // 'INDIVIDUAL' или 'LEGAL'
  
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

    // Проверяем тип пользователя из URL параметров
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    if (typeParam === 'legal') {
      setUserType('LEGAL');
    }
  }, [location]);
  
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {userType === 'LEGAL' ? (
        <RegisterLegalForm 
          userType={userType} 
          setUserType={setUserType}
          showTypeSelector={!new URLSearchParams(location.search).get('type')}
        />
      ) : (
        <RegisterForm 
          userType={userType} 
          setUserType={setUserType}
          showTypeSelector={!new URLSearchParams(location.search).get('type')}
        />
      )}
    </div>
  );
};

export default RegisterPage; 