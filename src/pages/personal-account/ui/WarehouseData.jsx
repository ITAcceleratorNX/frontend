import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import { warehouseApi } from '../../../shared/api/warehouseApi';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';

const WarehouseData = () => {
  const navigate = useNavigate();
  const { warehouseId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [warehouse, setWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeNav, setActiveNav] = useState('warehouses');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm();

  // Определяем режим редактирования из URL параметров
  useEffect(() => {
    const editMode = searchParams.get('edit') === 'true';
    setIsEditing(editMode);
  }, [searchParams]);

  // Загрузка данных склада
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await warehouseApi.getWarehouseById(warehouseId);
        setWarehouse(data);
        
        // Заполняем форму данными склада
        reset({
          name: data.name || '',
          address: data.address || '',
          work_start: data.work_start || '',
          work_end: data.work_end || '',
          status: data.status || 'AVAILABLE'
        });

        if (import.meta.env.DEV) {
          console.log('Данные склада загружены:', data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке склада:', error);
        setError('Не удалось загрузить данные склада. Попробуйте позже.');
        toast.error('Ошибка загрузки данных склада');
      } finally {
        setIsLoading(false);
      }
    };

    if (warehouseId) {
      fetchWarehouse();
    }
  }, [warehouseId, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      
      // Обрезаем секунды от времени (09:00:00 -> 09:00)
      const formatTime = (timeString) => {
        if (!timeString) return timeString;
        return timeString.substring(0, 5); // Берем только HH:MM
      };

      const updateData = {
        name: data.name,
        address: data.address,
        work_start: formatTime(data.work_start),
        work_end: formatTime(data.work_end),
        status: data.status
      };

      if (import.meta.env.DEV) {
        console.log('Отправляемые данные для обновления склада:', updateData);
      }

      await warehouseApi.updateWarehouse(warehouseId, updateData);

      // Обновляем локальные данные
      setWarehouse(prev => ({ ...prev, ...updateData }));
      
      toast.success('Данные склада успешно обновлены');
      
      if (import.meta.env.DEV) {
        console.log('Склад успешно обновлен:', updateData);
      }

      // Автоматическое перенаправление на список складов после успешного сохранения
      setTimeout(() => {
        navigate('/personal-account', { state: { activeSection: 'warehouses' } });
      }, 1000);
    } catch (error) {
      console.error('Ошибка при обновлении склада:', error);
      
      // Показываем детали ошибки валидации если они есть
      if (error.response?.data?.details) {
        console.error('Детали ошибки валидации:', error.response.data.details);
        toast.error(`Ошибка валидации: ${error.response.data.details.map(d => d.message || d).join(', ')}`);
      } else {
        toast.error('Не удалось обновить данные склада');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToList = () => {
    navigate('/personal-account', { state: { activeSection: 'warehouses' } });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Убираем параметр edit из URL
    navigate(`/personal-account/${user?.role === 'ADMIN' ? 'admin' : 'manager'}/warehouses/${warehouseId}`, { replace: true });
    reset({
      name: warehouse.name || '',
      address: warehouse.address || '',
      work_start: warehouse.work_start || '',
      work_end: warehouse.work_end || '',
      status: warehouse.status || 'AVAILABLE'
    });
  };

  const getStatusDisplay = (status) => {
    return status === 'AVAILABLE' ? 'Active' : 'Inactive';
  };

  const getStatusClass = (status) => {
    return status === 'AVAILABLE' ? 'bg-[#3A532D]' : 'bg-[#777777]';
  };

  const getCardClass = (status) => {
    return status === 'AVAILABLE' ? 'bg-white' : 'bg-[#DEE0E4]';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
          <main className="flex-1 mr-[110px]">
            <div className="w-full flex flex-col items-center pt-8">
              <div className="w-[1150px] ml-[80px] bg-white rounded-2xl p-8">
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#273655]"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
          <main className="flex-1 mr-[110px]">
            <div className="w-full flex flex-col items-center pt-6">
              <div className="w-[1150px] ml-[80px] bg-white rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <button 
                    onClick={handleBackToList}
                    className="flex items-center text-[#000000] text-lg mr-2 cursor-pointer hover:text-[#273655]"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    <span className="font-['Nunito Sans']">Назад к списку</span>
                  </button>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                  <div className="text-red-600 mb-4">{error || 'Склад не найден'}</div>
                  <button
                    onClick={handleBackToList}
                    className="bg-[#263654] hover:bg-[#3b4352] text-white px-6 py-2 rounded-md"
                  >
                    Вернуться к списку
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        <main className="flex-1 mr-[110px]">
          <div className="w-full flex flex-col items-center pt-8">
            <div className="w-[1150px] ml-[80px] bg-white rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={handleBackToList}
                  className="flex items-center text-[#000000] text-lg cursor-pointer hover:text-[#273655]"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  <span className="font-['Nunito Sans']">Данные склада</span>
                </button>
              </div>

              {!isEditing ? (
                // Режим просмотра
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Карточка склада */}
                  <div className={`p-6 rounded-lg shadow-md border border-gray-200 ${getCardClass(warehouse.status)}`}>
                    <div
                      className={`text-white text-xs px-7 font-['Abhaya Libre SemiBold'] py-1.5 rounded-full inline-block mb-4 ${getStatusClass(warehouse.status)}`}
                    >
                      {getStatusDisplay(warehouse.status)}
                    </div>
                    <h2 className="text-2xl font-semibold mb-4">{warehouse.name}</h2>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Адрес:</span>
                        <p className="text-[#000000]">{warehouse.address}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Время работы:</span>
                        <p className="text-[#000000]">{warehouse.work_start} - {warehouse.work_end}</p>
                      </div>
                      {warehouse.latitude && warehouse.longitude && (
                        <div>
                          <span className="font-medium text-gray-600">Координаты:</span>
                          <p className="text-[#000000]">{warehouse.latitude}, {warehouse.longitude}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Статистика боксов */}
                  {warehouse.storage && (
                    <div className="p-6 rounded-lg shadow-md border border-gray-200 bg-white">
                      <h3 className="text-xl font-semibold mb-4">Статистика боксов</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Всего боксов:</span>
                          <span className="font-medium">{warehouse.storage.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Свободные:</span>
                          <span className="font-medium text-green-600">
                            {warehouse.storage.filter(s => s.status === 'VACANT').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Занятые:</span>
                          <span className="font-medium text-red-600">
                            {warehouse.storage.filter(s => s.status === 'OCCUPIED').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ожидающие:</span>
                          <span className="font-medium text-yellow-600">
                            {warehouse.storage.filter(s => s.status === 'PENDING').length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Режим редактирования
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Название склада
                      </label>
                      <input
                        type="text"
                        {...register('name', { required: 'Название обязательно' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#273655] focus:border-[#273655]"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Статус
                      </label>
                      <select
                        {...register('status')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#273655] focus:border-[#273655]"
                      >
                        <option value="AVAILABLE">Активный</option>
                        <option value="UNAVAILABLE">Неактивный</option>
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Адрес
                      </label>
                      <textarea
                        {...register('address', { required: 'Адрес обязателен' })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#273655] focus:border-[#273655]"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Время начала работы
                      </label>
                      <input
                        type="time"
                        {...register('work_start', { required: 'Время начала обязательно' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#273655] focus:border-[#273655]"
                      />
                      {errors.work_start && (
                        <p className="mt-1 text-sm text-red-600">{errors.work_start.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Время окончания работы
                      </label>
                      <input
                        type="time"
                        {...register('work_end', { required: 'Время окончания обязательно' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#273655] focus:border-[#273655]"
                      />
                      {errors.work_end && (
                        <p className="mt-1 text-sm text-red-600">{errors.work_end.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving || !isDirty}
                      className="px-6 py-2 bg-[#273655] text-white rounded-md hover:bg-[#1e2c4f] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </div>
                </form>
              )}

              {/* Кнопка "Подробно" - только в режиме просмотра */}
              {!isEditing && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => navigate('/warehouse-order')}
                    className="px-8 py-3 bg-[#273655] text-white text-lg font-medium rounded-lg hover:bg-[#1e2c4f] transition-colors"
                  >
                    Подробно боксов
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WarehouseData; 