import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';
import { warehouseApi } from '../../../shared/api/warehouseApi';

const ManagerWarehouseEdit = () => {
  const navigate = useNavigate();
  const { warehouseId } = useParams();
  const [activeNav, setActiveNav] = useState('managerwarehouses');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  // Загрузка данных склада при монтировании
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await warehouseApi.getWarehouseById(warehouseId);
        
        // Заполняем форму данными склада
        setValue('name', data.name);
        setValue('address', data.address);
        setValue('latitude', data.latitude);
        setValue('longitude', data.longitude);
        setValue('work_start', data.work_start);
        setValue('work_end', data.work_end);
        setValue('status', data.status);
      } catch (error) {
        console.error('Ошибка при загрузке склада:', error);
        setError('Не удалось загрузить данные склада');
        toast.error('Не удалось загрузить данные склада');
      } finally {
        setIsLoading(false);
      }
    };

    if (warehouseId) {
      fetchWarehouse();
    }
  }, [warehouseId, setValue]);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Конвертируем данные в нужный формат
      const updateData = {
        ...data,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude)
      };

      await warehouseApi.updateWarehouse(warehouseId, updateData);
      toast.success('Данные склада успешно обновлены');
      
      // Возвращаемся на страницу данных склада
      navigate(`/personal-account/manager/warehouses/${warehouseId}`);
    } catch (error) {
      console.error('Ошибка при обновлении склада:', error);
      toast.error('Не удалось обновить данные склада');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/personal-account/manager/warehouses/${warehouseId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-lg">Загрузка данных склада...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-1">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        <main className="flex-1 mr-[110px]">
          <div className="w-full flex flex-col items-center pt-8">
            <div className="w-[1150px] ml-[80px] bg-white rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div 
                  onClick={handleCancel}
                  className="flex items-center text-[#000000] text-lg mr-2 cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  <span className="font-['Nunito Sans']">Редактирование склада</span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Название склада */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название склада *
                    </label>
                    <input
                      type="text"
                      {...register('name', { 
                        required: 'Название склада обязательно',
                        maxLength: { value: 100, message: 'Максимум 100 символов' }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Введите название склада"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  {/* Статус */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Статус *
                    </label>
                    <select
                      {...register('status', { required: 'Статус обязателен' })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="AVAILABLE">Доступен</option>
                      <option value="UNAVAILABLE">Недоступен</option>
                    </select>
                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                  </div>

                  {/* Время работы */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Время начала работы *
                    </label>
                    <input
                      type="time"
                      {...register('work_start', { required: 'Время начала работы обязательно' })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.work_start && <p className="text-red-500 text-sm mt-1">{errors.work_start.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Время окончания работы *
                    </label>
                    <input
                      type="time"
                      {...register('work_end', { required: 'Время окончания работы обязательно' })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.work_end && <p className="text-red-500 text-sm mt-1">{errors.work_end.message}</p>}
                  </div>

                  {/* Координаты */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Широта *
                    </label>
                    <input
                      type="number"
                      step="0.00000001"
                      {...register('latitude', { 
                        required: 'Широта обязательна',
                        valueAsNumber: true
                      })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Например: 43.2387"
                    />
                    {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Долгота *
                    </label>
                    <input
                      type="number"
                      step="0.00000001"
                      {...register('longitude', { 
                        required: 'Долгота обязательна',
                        valueAsNumber: true
                      })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Например: 76.9453"
                    />
                    {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude.message}</p>}
                  </div>
                </div>

                {/* Адрес */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Адрес *
                  </label>
                  <textarea
                    {...register('address', { required: 'Адрес обязателен' })}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите полный адрес склада"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                </div>

                {/* Кнопки */}
                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 text-white rounded-md transition-colors ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerWarehouseEdit; 