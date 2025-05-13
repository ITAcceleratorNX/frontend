import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import personalImg from '../../../assets/personal_account_image.png';
import shadowImg from '../../../assets/personal_account_shadow.png';
import cameraIcon from '../../../assets/personal_camera.svg';
import Input from '../../../shared/ui/Input';
import Button from '../../../shared/ui/Button';
import api from '../../../shared/api/axios';

const PersonalData = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      iin: ''
    }
  });

  // Проверка аутентификации и получение данных пользователя
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users/me');
        
        if (response.status === 200) {
          const userData = response.data;
          setValue('name', userData.name || '');
          setValue('email', userData.email || '');
          setValue('phone', userData.phone || '');
          setValue('iin', userData.iin || '');
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        
        if (error.response && (error.response.status === 401 || error.response.status === 404)) {
          toast.error('Сессия истекла. Пожалуйста, войдите снова.');
          navigate('/login');
        } else {
          toast.error('Не удалось загрузить данные профиля');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, navigate, setValue]);

  // Обработка обновления данных пользователя
  const onSubmit = async (formData) => {
    try {
      setSaving(true);
      const response = await api.put('/users/me', formData);
      
      if (response.status === 200) {
        toast.success('Данные успешно обновлены');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных пользователя:', error);
      
      if (error.response && error.response.status === 401) {
        toast.error('Сессия истекла. Пожалуйста, войдите снова.');
        navigate('/login');
      } else if (error.response && error.response.status === 400) {
        toast.error('Ошибка валидации данных. Проверьте введенные данные.');
      } else {
        toast.error('Не удалось обновить данные профиля');
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  if (loading) {
    return <div className="w-full text-center py-10">Загрузка данных...</div>;
  }

  return (
    <div className="w-full max-w-[700px] flex flex-col items-center mx-auto font-['Nunito Sans']">
      <ToastContainer position="top-right" autoClose={3000} />
      
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
      <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full">
          <Input
            label="Имя и фамилия"
            placeholder="Иван Иванов"
            disabled={!isEditing}
            {...register('name', { required: 'Имя обязательно для заполнения' })}
            error={errors.name?.message}
            className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']"
          />
        </div>
        
        <div className="w-full">
          <Input
            label="Электронная почта"
            placeholder="email@example.com"
            disabled={!isEditing}
            {...register('email', { 
              required: 'Email обязателен для заполнения',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Некорректный email адрес'
              }
            })}
            error={errors.email?.message}
            className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']"
          />
        </div>
        
        <div className="w-full">
          <Input
            label="Телефон"
            placeholder="+7 (XXX) XXX-XX-XX"
            disabled={!isEditing}
            {...register('phone', { 
              pattern: {
                value: /^\+?[0-9]{10,15}$/,
                message: 'Некорректный номер телефона'
              }
            })}
            error={errors.phone?.message}
            className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']"
          />
        </div>
        
        <div className="w-full">
          <Input
            label="ИИН"
            placeholder="XXXXXXXXXXXX"
            disabled={!isEditing}
            {...register('iin', { 
              pattern: {
                value: /^[0-9]{12}$/,
                message: 'ИИН должен содержать 12 цифр'
              }
            })}
            error={errors.iin?.message}
            className="bg-[#F5F6FA] text-[#222] placeholder-[#A6A6A6] font-['Nunito Sans']"
          />
        </div>
      </form>
      
      {isEditing ? (
        <div className="flex gap-4">
          <Button 
            type="button"
            variant="secondary" 
            size="lg" 
            onClick={toggleEdit}
            className="w-[120px] bg-[#C3C3C3] text-white font-['Nunito Sans'] hover:bg-[#A3A3A3] border-none"
          >
            Отмена
          </Button>
          <Button 
            type="submit"
            variant="primary" 
            size="lg" 
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="w-[120px] bg-[#273655] text-white font-['Nunito Sans'] hover:bg-[#1d2742] border-none"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      ) : (
        <Button 
          variant="secondary" 
          size="lg" 
          onClick={toggleEdit}
          className="w-[240px] bg-[#273655] text-white font-['Nunito Sans'] hover:bg-[#1d2742] border-none"
        >
          Изменить
        </Button>
      )}
    </div>
  );
};

export default PersonalData; 