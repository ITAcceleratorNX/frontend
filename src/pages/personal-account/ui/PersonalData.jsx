import React, { useState } from 'react';
import personalImg from '../../../assets/personal_account_image.png';
import shadowImg from '../../../assets/personal_account_shadow.png';
import cameraIcon from '../../../assets/personal_camera.svg';
import Input from '../../../shared/ui/Input';
import Button from '../../../shared/ui/Button';

const PersonalData = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
  };

  return (
    <div className="w-full max-w-[700px] flex flex-col items-center mx-auto font-['Nunito Sans']">
      {/* Аватар */}
      <div className="relative mb-4 w-[120px] h-[120px] rounded-full overflow-hidden">
        <img
          src={personalImg}
          alt="Аватар"
          className="w-[120px] h-[120px] rounded-full object-cover border-4 border-white shadow-lg scale-125"
        />
        <img
          src={shadowImg}
          alt="Тень"
          className="absolute left-1 top-20 w-[120px] h-[40px] pointer-events-none"
          style={{mixBlendMode:'multiply', opacity:1}}
        />
        <button className="absolute left-1/2 bottom-1.5 -translate-x-1/2 z-10 p-0 m-0 bg-transparent border-none shadow-none hover:bg-transparent focus:outline-none">
          <img src={cameraIcon} alt="Загрузить фото" className="w-8 h-8" />
        </button>
      </div>
      <span className="text-[#3B5B7C] text-xs mb-8 cursor-pointer hover:underline">Загрузите фото</span>
      {/* Форма личных данных */}
      <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={e => e.preventDefault()}>
        <Input label="Имя" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Имя" className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']" />
        <Input label="Фамилия" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Фамилия" className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']" />
        <Input label="Электронная почта" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@gmail.com" className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']" />
        <Input label="Телефон" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7" className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']" />
        <Input label="День Рождения" value={birthday} onChange={e => setBirthday(e.target.value)} placeholder="dd.mm.yyyy" className="md:col-span-2 bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']" />
      </form>
      <Button variant="secondary" size="lg" className="w-[240px] bg-[#C3C3C3] text-white font-['Nunito Sans'] hover:bg-[#C3C3C3] active:bg-[#C3C3C3] focus:bg-[#C3C3C3] border-none">Изменить</Button>
    </div>
  );
};

export default PersonalData; 