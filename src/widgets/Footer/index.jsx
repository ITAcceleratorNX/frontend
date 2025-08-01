// frontend/src/components/Footer.jsx
import React, { useState } from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '@/shared/api/axios.js'

const Footer = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      const response = await api.post('/submit-lead', formData);

      if (response.data.success) {
        toast.success('Данные успешно отправлены!');
        setFormData({ name: '', phone: '' });
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
            <div className="flex flex-col md:flex-row justify-between items-center text-xs text-[#A6A6A6]">
              <p>© 2025 extraspace.kz</p>
              <p className="mt-2 md:mt-0">Все права защищены.</p>
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