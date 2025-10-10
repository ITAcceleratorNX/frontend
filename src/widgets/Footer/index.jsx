// frontend/src/components/Footer.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ToastContainer, toast } from 'react-toastify';
import { UserLock, BookText } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import api from '@/shared/api/axios.js'

const Footer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPhoneNumber = (value) => {
    // Убираем все, кроме цифр
    const numbers = value.replace(/\D/g, '');
    
    // Если начинается с 8, заменяем на 7
    let cleaned = numbers;
    if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.slice(1);
    }
    
    // Если не начинается с 7, добавляем 7
    if (cleaned && !cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }
    
    // Ограничиваем до 11 цифр (7 + 10 цифр)
    cleaned = cleaned.slice(0, 11);
    
    // Форматируем с пробелами: +7 XXX XXX XX XX
    let formatted = '';
    if (cleaned.length > 0) {
      formatted = '+7';
      if (cleaned.length > 1) {
        formatted += ' ' + cleaned.slice(1, 4);
      }
      if (cleaned.length > 4) {
        formatted += ' ' + cleaned.slice(4, 7);
      }
      if (cleaned.length > 7) {
        formatted += ' ' + cleaned.slice(7, 9);
      }
      if (cleaned.length > 9) {
        formatted += ' ' + cleaned.slice(9, 11);
      }
    }
    
    return formatted;
  };

  const handleInputChange = (field, value) => {
    if (field === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        [field]: formatted,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validatePhone = (phone) => {
    const regex = /^\+7 \d{3} \d{3} \d{2} \d{2}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Введите имя');
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast.error('Введите номер в формате +7 777 777 77 77');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedData = {
        ...formData,
        name: formData.name.trim(),
        phone: formData.phone,
        storage_type: localStorage.getItem('prep_storage_type') || 'INDIVIDUAL',
        duration: localStorage.getItem('prep_duration') || '1',
        area: localStorage.getItem('prep_area') || '50',
        price: localStorage.getItem('calculated_price') || '',
      };
      const response = await api.post('/submit-lead', updatedData);

      if (response.data.success) {
        toast.success('Данные успешно отправлены!');
        setFormData({ name: '', phone: '', storage_type: '', area: '', duration: '', price: '', });
        localStorage.removeItem('prep_storage_type');
        localStorage.removeItem('prep_duration');
        localStorage.removeItem('prep_area');
        localStorage.removeItem('calculated_price');
      } else {
        throw new Error('Ошибка при отправке');
      }
    } catch (error) {
      toast.error('Не удалось отправить данные. Попробуйте позже.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <>
        <footer className="bg-[#0A142F] w-full text-white font-['Montserrat'] mt-16 pt-10 pb-6">
          <div className="max-w-[1240px] mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10">
              {/* Логотип и описание */}
              <div className="flex-1">
                <h2 className="text-4xl font-bold font-['Audiowide'] mb-4">ExtraSpace</h2>
                <p className="text-sm text-[#A6A6A6] max-w-sm leading-relaxed">
                  ExtraSpace — надёжное решение для хранения. Мы предлагаем аренду складов в Алматы с круглосуточной охраной, удобным доступом и комфортными условиями хранения.
                </p>
              </div>

              {/* Форма в футере */}
              <div className="flex-1 max-w-xs">
                <h4 className="text-lg font-semibold mb-4">Оставить заявку</h4>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                      type="text"
                      placeholder="Ваше имя"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-white text-black"
                  />
                  <Input
                      type="text"
                      placeholder="+7 777 777 77 77"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-white text-black"
                  />
                  <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-white text-black hover:bg-gray-200"
                  >
                    {isSubmitting ? 'Отправка...' : 'Отправить'}
                  </Button>
                </form>
              </div>
            </div>

            {/* Нижняя линия и копирайт */}
            <hr className="my-8 border-white opacity-30" />
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-[#A6A6A6] gap-2">
              <p>Все права защищены. © 2025 extraspace.kz</p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-8">
                <button
                  onClick={() => navigate("/online-payment")}
                  className="text-[#B0B0B0] hover:text-white hover:underline transition-colors duration-200 flex items-center gap-1"
                >
                  <svg width="22" height="22" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="1.5" width="15" height="9" rx="1.5" stroke="currentColor" strokeWidth="1"/>
                    <line x1="0.5" y1="4" x2="15.5" y2="4" stroke="currentColor" strokeWidth="1"/>
                    <line x1="3" y1="7.5" x2="5" y2="7.5" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="12" cy="7.5" r="1" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="14" cy="7.5" r="1" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                  Информация об оплате
                </button>
                <Link 
                  to="/offer" 
                  className="text-[#B0B0B0] hover:text-white hover:underline transition-colors duration-200 flex items-center gap-1"
                >
                  <span><BookText /></span>
                  Публичная оферта
                </Link>
                <Link 
                  to="/privacy-policy2" 
                  className="text-[#B0B0B0] hover:text-white hover:underline transition-colors duration-200 flex items-center gap-1"
                >
                  <span>
                  <UserLock />
                  </span>
                  Политика конфиденциальности
                </Link>
          
              </div>
            </div>
          </div>
        </footer>

        {/* Toast уведомления */}
        <ToastContainer
            position="bottom-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            draggable
        />
      </>
  );
};

export default Footer;