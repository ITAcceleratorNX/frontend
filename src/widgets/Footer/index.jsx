import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RoundPlaceIcon from '../../assets/round-place-24px.svg';
import RoundPhoneIcon from '../../assets/round-phone-24px.svg';
import LinkedInIcon from '../../assets/linkedin black.1.svg';
import YouTubeIcon from '../../assets/youtube color.1.svg';
import InstagramIcon from '../../assets/instagram black.1.svg';
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
    <footer className="bg-[#0A142F] w-full h-[550px] text-white font-['Montserrat'] mt-14">
      <div className="container mx-auto px-4">
        <hr className="border-t border-[#FFFFFF] mt-20 mb-10 ml-20 mr-20 opacity-50"/>
        <div className="flex flex-col md:flex-row items-start justify-between py-8">
          <h2 className="text-7xl py-6 ml-20 font-bold font-['Audiowide'] mt-[-4px]">ExtraSpace</h2>
          <div className="flex flex-col font-['Montserrat'] space-y-6 md:items-start md:text-left mt-[-25px] mr-[10px] flex-shrink-0">
            <Link to="/" className="flex items-center mb-2 hover:text-gray-300 transition-colors">
              <span className="whitespace-nowrap">ГЛАВНАЯ</span>
            </Link>
            <Link to="/about-warehouse-rental" className="flex items-center mb-2 hover:text-gray-300 transition-colors">
              <span className="whitespace-nowrap">ОБ АРЕНДЕ СКЛАДОВ</span>
            </Link>
            <Link to="/cloud-storage" className="flex items-center mb-2 hover:text-gray-300 transition-colors">
              <span className="whitespace-nowrap">ОБЛАЧНОЕ ХРАНЕНИЕ</span>
            </Link>
            <Link to="/moving" className="flex items-center mb-2 hover:text-gray-300 transition-colors">
              <span className="whitespace-nowrap">МУВИНГ</span>
            </Link>
            <Link to="/privacy-policy" className="flex items-center mb-2 hover:text-gray-300 transition-colors">
              <span className="whitespace-nowrap">ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ</span>
            </Link>
          </div>
          <div className="flex flex-col mr-[100px] mt-[40px] space-y-2">
            <p className="text-base text-white font-['Montserrat']">Свяжитесь с нами — поможем!</p>
            <Input
              type="text"
              placeholder="Ваше имя"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-[#FFFFFF] border border-white/50 text-[#0A142F] placeholder-gray-500 py-2 px-4 rounded focus:outline-none focus:border-white w-[250px]"
            />
            <Input
              type="text"
              placeholder="+7(___)___-__"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="bg-[#FFFFFF] border border-white/50 text-[#0A142F] placeholder-gray-500 py-2 px-4 rounded focus:outline-none focus:border-white w-[250px]"
            />
            <div className="flex justify-center">
              <Button className="bg-white text-[#0A142F] font-['Montserrat'] py-1 px-4 rounded-full text-[12px] mt-[13px] font-bold hover:bg-gray-200 w-[150px]">ОТПРАВИТЬ</Button>
            </div>
          </div>
        </div>
        <div className="justify-between items-center mt-4">
          <nav className="flex space-x-8 uppercase text-xs ml-20">
            <p className="font-['Montserrat'] mt-[-170px] w-[280px]">ExtraSpace — надёжное решение для хранения.</p>
          </nav>
          <nav className="flex space-x-8 uppercase text-xs ml-20">
            <p className="font-['Montserrat'] mt-[-120px] w-[350px] mb-7 text-[#A6A6A6]">Мы предлагаем аренду складов в Алматы с круглосуточной охраной, удобным доступом и комфортными условиями хранения.</p>
          </nav>
          <div className="text-xs text-right py-2 text-[#A6A6A6] font-['Montserrat'] mb-[-15px] mr-[130px]">Copyright © 2025 · Lift Media Inc.</div>
        </div>
        <hr className="border-t border-[#FFFFFF] my-4 ml-20 mr-20 opacity-50"/>
      </div>
    </footer>
  );
};

export default Footer;