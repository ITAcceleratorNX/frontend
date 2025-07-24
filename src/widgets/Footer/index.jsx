import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const Footer = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
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

            {/* Навигация */}
            <div className="flex-1">
              <h4 className="text-lg font-semibold mb-4">Навигация</h4>
              <div className="flex flex-col space-y-2 text-sm">
                <Link to="/" className="hover:text-gray-300 transition-colors">ГЛАВНАЯ</Link>
                <Link to="/about-warehouse-rental" className="hover:text-gray-300 transition-colors">ОБ АРЕНДЕ СКЛАДОВ</Link>
                <Link to="/cloud-storage" className="hover:text-gray-300 transition-colors">ОБЛАЧНОЕ ХРАНЕНИЕ</Link>
                <Link to="/moving" className="hover:text-gray-300 transition-colors">МУВИНГ</Link>
                <Link to="/privacy-policy" className="hover:text-gray-300 transition-colors">ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ</Link>
              </div>
            </div>

            {/* Форма */}
            <div className="flex-1">
              <h4 className="text-lg font-semibold mb-4">Свяжитесь с нами</h4>
              <p className="text-sm mb-3">Мы вам поможем!</p>
              <Input
                  type="text"
                  placeholder="Ваше имя"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mb-3 bg-white text-[#0A142F] placeholder-gray-500"
              />
              <Input
                  type="text"
                  placeholder="+7(___)___-__"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mb-3 bg-white text-[#0A142F] placeholder-gray-500"
              />
              <Button className="w-full bg-white text-[#0A142F] font-bold hover:bg-gray-200 text-sm py-2 rounded-full">
                ОТПРАВИТЬ
              </Button>
            </div>
          </div>

          {/* Нижняя линия и копирайт */}
          <hr className="my-8 border-white opacity-30" />
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-[#A6A6A6]">
            <p>© 2025 · Lift Media Inc.</p>
            <p className="mt-2 md:mt-0">Все права защищены.</p>
          </div>
        </div>
      </footer>
  );
};

export default Footer;