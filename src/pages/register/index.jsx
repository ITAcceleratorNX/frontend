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
      {/* Выбор типа регистрации - показываем только если тип не указан в URL */}
      {!new URLSearchParams(location.search).get('type') && (
        <div className="w-full max-w-[520px] mx-auto pt-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[25px] border border-[#DFDFDF] shadow-[0px_4px_8.8px_rgba(0,0,0,0.25)] p-6 mb-6">
            <h2 className="text-[18px] sm:text-[20px] font-medium text-center text-[#363636] mb-6">
              Выберите тип регистрации
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setUserType('INDIVIDUAL')}
                className={`flex-1 h-[56px] rounded-lg text-[16px] font-bold transition-colors ${
                  userType === 'INDIVIDUAL'
                    ? 'bg-gradient-to-br from-[#26B3AB] to-[#104D4A] text-white'
                    : 'bg-white text-[#363636] border border-[#DFDFDF]'
                }`}
                style={userType === 'INDIVIDUAL' ? {} : { boxShadow: '4px 4px 8px 0 #B0B0B0' }}
              >
                Физическое лицо
              </button>
              <button
                onClick={() => setUserType('LEGAL')}
                className={`flex-1 h-[56px] rounded-lg text-[16px] font-bold transition-colors ${
                  userType === 'LEGAL'
                    ? 'bg-gradient-to-br from-[#26B3AB] to-[#104D4A] text-white'
                    : 'bg-white text-[#363636] border border-[#DFDFDF]'
                }`}
                style={userType === 'LEGAL' ? {} : { boxShadow: '4px 4px 8px 0 #B0B0B0' }}
              >
                Юридическое лицо
              </button>
            </div>
          </div>
        </div>
      )}
      
      {userType === 'LEGAL' ? <RegisterLegalForm /> : <RegisterForm />}
    </div>
  );
};

export default RegisterPage; 