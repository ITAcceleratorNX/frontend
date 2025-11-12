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
  const [isCloud, setIsCloud] = useState(false);
  const [servicePrices, setServicePrices] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty }
  } = useForm();
  
  const [initialFormData, setInitialFormData] = useState(null);

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
        setIsCloud(data.type === "CLOUD");
        
        // Загружаем цены услуг для склада
        try {
          let pricesMap = {};
          
          // Определяем типы цен в зависимости от типа склада
          const priceTypes = data.type === 'CLOUD' 
            ? ['M3_UP_6M', 'M3_6_12M', 'M3_OVER_12M', 'M3_01_UP_6M', 'M3_01_6_12M', 'M3_01_OVER_12M']
            : ['M2_UP_6M', 'M2_6_12M', 'M2_OVER_12M', 'M2_01_UP_6M', 'M2_01_6_12M', 'M2_01_OVER_12M'];
          
          if (data.type === 'CLOUD') {
            // Для CLOUD складов получаем цены из /prices
            const allPrices = await warehouseApi.getAllServicePrices();
            // Фильтруем только нужные типы цен для CLOUD
            const cloudPrices = allPrices.filter(price => priceTypes.includes(price.type));
            // Преобразуем массив цен в объект для удобства
            cloudPrices.forEach(price => {
              pricesMap[price.type] = parseFloat(price.price);
            });
          } else {
            // Для INDIVIDUAL складов получаем цены из warehouse-service-prices
            const prices = await warehouseApi.getWarehouseServicePrices(warehouseId);
            // Преобразуем массив цен в объект для удобства
            prices.forEach(price => {
              pricesMap[price.service_type] = parseFloat(price.price);
            });
          }
          
          setServicePrices(pricesMap);
          
          // Заполняем форму данными склада и ценами
          const formData = {
            name: data.name || '',
            address: data.address || '',
            work_start: data.work_start || '',
            work_end: data.work_end || '',
            status: data.status || 'AVAILABLE',
            total_volume: data.storage?.[0]?.total_volume || '',
            ...priceTypes.reduce((acc, type) => {
              acc[type] = pricesMap[type] || '';
              return acc;
            }, {})
          };
          
          reset(formData);
          // Сохраняем исходные данные для сравнения
          setInitialFormData(formData);
        } catch (priceError) {
          console.warn('Не удалось загрузить цены склада:', priceError);
          // Если цены не загрузились, используем пустые значения
          const priceTypes = data.type === 'CLOUD' 
            ? ['M3_UP_6M', 'M3_6_12M', 'M3_OVER_12M', 'M3_01_UP_6M', 'M3_01_6_12M', 'M3_01_OVER_12M']
            : ['M2_UP_6M', 'M2_6_12M', 'M2_OVER_12M', 'M2_01_UP_6M', 'M2_01_6_12M', 'M2_01_OVER_12M'];
          
          const emptyFormData = {
            name: data.name || '',
            address: data.address || '',
            work_start: data.work_start || '',
            work_end: data.work_end || '',
            status: data.status || 'AVAILABLE',
            total_volume: data.storage?.[0]?.total_volume || '',
            ...priceTypes.reduce((acc, type) => {
              acc[type] = '';
              return acc;
            }, {})
          };
          reset(emptyFormData);
          // Сохраняем исходные данные для сравнения
          setInitialFormData(emptyFormData);
        }

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

      // Определяем типы цен в зависимости от типа склада
      const priceTypes = warehouse?.type === 'CLOUD' 
        ? ['M3_UP_6M', 'M3_6_12M', 'M3_OVER_12M', 'M3_01_UP_6M', 'M3_01_6_12M', 'M3_01_OVER_12M']
        : ['M2_UP_6M', 'M2_6_12M', 'M2_OVER_12M', 'M2_01_UP_6M', 'M2_01_6_12M', 'M2_01_OVER_12M'];

      // Сравниваем текущие значения с исходными и собираем только измененные поля
      const updateData = {};
      
      if (!initialFormData) {
        // Если исходные данные не загружены, отправляем все данные
        updateData.name = data.name;
        // Для CLOUD складов адрес может быть пустым
        updateData.address = isCloud && (!data.address || data.address.trim() === '') 
          ? null 
          : data.address;
        updateData.work_start = formatTime(data.work_start);
        updateData.work_end = formatTime(data.work_end);
        updateData.status = data.status;
        if (isCloud && data.total_volume !== undefined) {
          updateData.total_volume = data.total_volume;
        }
      } else {
        // Сравниваем и добавляем только измененные поля
        if (data.name !== initialFormData.name) {
          updateData.name = data.name;
        }
        
        // Для CLOUD складов адрес может быть пустым, для INDIVIDUAL - обязателен
        // Нормализуем значения для сравнения (пустая строка = null для CLOUD)
        const currentAddress = isCloud && (!data.address || data.address.trim() === '') 
          ? null 
          : data.address;
        const initialAddress = isCloud && (!initialFormData.address || initialFormData.address.trim() === '') 
          ? null 
          : initialFormData.address;
        
        if (currentAddress !== initialAddress) {
          updateData.address = currentAddress;
        }
        
        if (formatTime(data.work_start) !== formatTime(initialFormData.work_start)) {
          updateData.work_start = formatTime(data.work_start);
        }
        
        if (formatTime(data.work_end) !== formatTime(initialFormData.work_end)) {
          updateData.work_end = formatTime(data.work_end);
        }
        
        if (data.status !== initialFormData.status) {
          updateData.status = data.status;
        }
        
        if (isCloud && data.total_volume !== initialFormData.total_volume) {
          updateData.total_volume = data.total_volume;
        }
      }

      // Формируем массив измененных цен для отправки
      const changedPrices = [];
      if (initialFormData) {
        priceTypes.forEach(type => {
          const currentValue = data[type];
          const initialValue = initialFormData[type];
          
          // Проверяем, изменилась ли цена
          if (currentValue !== undefined && currentValue !== '' && currentValue !== null) {
            const currentPrice = parseFloat(currentValue);
            const initialPrice = initialValue ? parseFloat(initialValue) : null;
            
            if (currentPrice !== initialPrice) {
              changedPrices.push({
                service_type: type,
                price: currentPrice
              });
            }
          }
        });
      } else {
        // Если исходные данные не загружены, отправляем все цены
        priceTypes.forEach(type => {
          if (data[type] !== undefined && data[type] !== '' && data[type] !== null) {
            changedPrices.push({
              service_type: type,
              price: parseFloat(data[type])
            });
          }
        });
      }

      // Добавляем цены только если есть изменения
      if (changedPrices.length > 0) {
        updateData.service_prices = changedPrices;
      }

      // Проверяем, есть ли что отправлять
      if (Object.keys(updateData).length === 0) {
        toast.info('Нет изменений для сохранения');
        setIsSaving(false);
        return;
      }

      if (import.meta.env.DEV) {
        console.log('Отправляемые данные для обновления склада (только измененные):', updateData);
      }

      await warehouseApi.updateWarehouse(warehouseId, updateData);

      // Обновляем локальные данные только для измененных полей
      setWarehouse(prev => {
        const updated = { ...prev };
        if (updateData.name !== undefined) updated.name = updateData.name;
        if (updateData.address !== undefined) updated.address = updateData.address;
        if (updateData.work_start !== undefined) updated.work_start = updateData.work_start;
        if (updateData.work_end !== undefined) updated.work_end = updateData.work_end;
        if (updateData.status !== undefined) updated.status = updateData.status;
        if (updateData.total_volume !== undefined && updated.storage?.[0]) {
          updated.storage[0].total_volume = updateData.total_volume;
        }
        return updated;
      });
      
      // Обновляем локальные цены только для измененных
      if (updateData.service_prices) {
        const updatedPrices = { ...servicePrices };
        updateData.service_prices.forEach(sp => {
          updatedPrices[sp.service_type] = sp.price;
        });
        setServicePrices(updatedPrices);
      }
      
      // Обновляем исходные данные формы после успешного сохранения
      const currentValues = getValues();
      const updatedInitialData = { ...initialFormData };
      
      // Обновляем все поля, которые были изменены
      Object.keys(updateData).forEach(key => {
        if (key !== 'service_prices') {
          updatedInitialData[key] = currentValues[key];
        }
      });
      
      // Обновляем цены
      if (updateData.service_prices) {
        updateData.service_prices.forEach(sp => {
          updatedInitialData[sp.service_type] = sp.price.toString();
        });
      }
      
      setInitialFormData(updatedInitialData);
      
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
    
    // Определяем типы цен в зависимости от типа склада
    const priceTypes = warehouse?.type === 'CLOUD' 
      ? ['M3_UP_6M', 'M3_6_12M', 'M3_OVER_12M', 'M3_01_UP_6M', 'M3_01_6_12M', 'M3_01_OVER_12M']
      : ['M2_UP_6M', 'M2_6_12M', 'M2_OVER_12M', 'M2_01_UP_6M', 'M2_01_6_12M', 'M2_01_OVER_12M'];
    
    const cancelFormData = {
      name: warehouse.name || '',
      address: warehouse?.address || '',
      work_start: warehouse.work_start || '',
      work_end: warehouse.work_end || '',
      status: warehouse.status || 'AVAILABLE',
      total_volume: warehouse.storage?.[0]?.total_volume || '',
      ...priceTypes.reduce((acc, type) => {
        acc[type] = servicePrices[type] || '';
        return acc;
      }, {})
    };
    reset(cancelFormData);
    // Восстанавливаем исходные данные при отмене (если они были)
    if (initialFormData) {
      setInitialFormData(cancelFormData);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    const basePath = user?.role === 'ADMIN' ? 'admin' : 'manager';
    navigate(`/personal-account/${basePath}/warehouses/${warehouseId}?edit=true`, { replace: true });
  };

  const getStatusDisplay = (status) => {
    return status === 'AVAILABLE' ? 'Активный' : 'Неактивный';
  };

  const getStatusBadge = (status) => {
    if (status === 'AVAILABLE') {
      return 'bg-green-100 text-green-800 border border-green-200';
    }
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // Функция для форматирования времени (убираем секунды)
  const formatTime = (timeString) => {
    if (!timeString) return timeString;
    return timeString.substring(0, 5); // Берем только HH:MM
  };

  const getStatCard = (title, value, icon, color = 'text-gray-600') => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gray-50 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Заголовок загрузки */}
              <div className="flex items-center space-x-4">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>

              {/* Карточки загрузки */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  ))}
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl border border-red-200 shadow-sm">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
                  <p className="text-gray-600 mb-6">{error || 'Склад не найден'}</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleBackToList}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Назад к списку
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-4 py-2 bg-[#273655] hover:bg-[#1e2c4f] text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Повторить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Breadcrumb и заголовок */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleBackToList}
                  className="inline-flex items-center text-gray-600 hover:text-[#273655] transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Склады</span>
                </button>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <h1 className="text-2xl font-bold text-gray-900">{warehouse.name}</h1>
              </div>

              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="inline-flex items-center px-4 py-2 bg-[#273655] hover:bg-[#1e2c4f] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Редактировать
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Основная информация */}
              <div className="lg:col-span-2 space-y-6">
                {!isEditing ? (
                  // Режим просмотра
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Информация о складе</h2>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(warehouse.status)}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${warehouse.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                          {getStatusDisplay(warehouse.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Название</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{warehouse.name}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-500">Время работы</label>
                            <div className="flex items-center mt-1">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-gray-900">{formatTime(warehouse.work_start)} - {formatTime(warehouse.work_end)}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">Адрес</label>
                          <div className="flex items-start mt-1">
                            <svg className="w-4 h-4 mr-2 mt-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-900">{warehouse?.address}</p>
                          </div>
                        </div>
                      </div>

                      {warehouse.latitude && warehouse.longitude && (
                        <div className="pt-4 border-t border-gray-100">
                          <label className="text-sm font-medium text-gray-500">Координаты</label>
                          <p className="text-gray-900 mt-1">{warehouse.latitude}, {warehouse.longitude}</p>
                        </div>
                      )}

                      {/* Секция цен в режиме просмотра */}
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                          Цены за {isCloud ? '1 м³' : '1 м²'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">До 6 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_UP_6M' : 'M2_UP_6M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_UP_6M' : 'M2_UP_6M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">От 6 до 12 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_6_12M' : 'M2_6_12M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_6_12M' : 'M2_6_12M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">Свыше 12 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Секция цен за 0.1 м²/м³ в режиме просмотра */}
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                          Цены за {isCloud ? '0.1 м³' : '0.1 м²'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">До 6 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">От 6 до 12 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">Свыше 12 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Режим редактирования
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Редактирование склада</h2>
                      <p className="text-sm text-gray-600 mt-1">Внесите изменения в информацию о складе</p>
                    </div>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Название склада *
                            </label>
                            <input
                              type="text"
                              {...register('name', { required: 'Название обязательно' })}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Введите название склада"
                            />
                            {errors.name && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.name.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Статус
                            </label>
                            <select
                              {...register('status')}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors"
                            >
                              <option value="AVAILABLE">Активный</option>
                              <option value="UNAVAILABLE">Неактивный</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Адрес {!isCloud && '*'}
                          </label>
                          <textarea
                            {...register('address', { 
                              required: !isCloud ? 'Адрес обязателен' : false
                            })}
                            rows={3}
                            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors resize-none ${
                              errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder={isCloud ? "Адрес склада (необязательно)" : "Введите полный адрес склада"}
                          />
                          {errors.address && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {errors.address.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Время открытия *
                            </label>
                            <input
                              type="time"
                              {...register('work_start', { required: 'Время начала обязательно' })}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                errors.work_start ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                            {errors.work_start && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.work_start.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Время закрытия *
                            </label>
                            <input
                              type="time"
                              {...register('work_end', { required: 'Время окончания обязательно' })}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                errors.work_end ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                            {errors.work_end && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.work_end.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {isCloud && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Вместимость (м²) *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              {...register('total_volume', { required: 'Вместимость обязательна', valueAsNumber: true })}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                errors.total_volume ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Введите вместимость склада в м²"
                            />
                            {errors.total_volume && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.total_volume.message}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Секция цен */}
                        <div className="pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Цены за {isCloud ? '1 м³' : '1 м²'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Установите цены с учетом скидок за длительный период хранения
                          </p>
                          
                          <div className="space-y-4">
                            {/* Цена до 6 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена до 6 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_UP_6M' : 'M2_UP_6M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_UP_6M' : 'M2_UP_6M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_UP_6M' : 'M2_UP_6M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_UP_6M' : 'M2_UP_6M'].message}
                                </p>
                              )}
                            </div>

                            {/* Цена от 6 до 12 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена от 6 до 12 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_6_12M' : 'M2_6_12M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_6_12M' : 'M2_6_12M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_6_12M' : 'M2_6_12M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_6_12M' : 'M2_6_12M'].message}
                                </p>
                              )}
                            </div>

                            {/* Цена свыше 12 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена свыше 12 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M'].message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Секция цен за 0.1 м²/м³ */}
                        <div className="pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Цены за {isCloud ? '0.1 м³' : '0.1 м²'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Установите цены за 0.1 {isCloud ? 'м³' : 'м²'} с учетом скидок за длительный период хранения
                          </p>
                          
                          <div className="space-y-4">
                            {/* Цена до 6 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена до 6 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M'].message}
                                </p>
                              )}
                            </div>

                            {/* Цена от 6 до 12 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена от 6 до 12 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M'].message}
                                </p>
                              )}
                            </div>

                            {/* Цена свыше 12 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена свыше 12 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M'].message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Отмена
                          </button>
                          <button
                            type="submit"
                            disabled={isSaving || !isDirty}
                            className="px-6 py-2.5 bg-[#273655] text-white text-sm font-medium rounded-lg hover:bg-[#1e2c4f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isSaving ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Сохранение...
                              </div>
                            ) : (
                              'Сохранить изменения'
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Кнопка "Подробно боксов" - только в режиме просмотра */}
                {!isCloud && !isEditing && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-[#273655]/10 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-[#273655]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Управление боксами</h3>
                      <p className="text-gray-600 mb-6">Просмотрите детальную схему склада и состояние всех боксов</p>
                      <button
                        onClick={() => navigate('/warehouse-order')}
                        className="inline-flex items-center px-6 py-3 bg-[#273655] text-white text-sm font-medium rounded-lg hover:bg-[#1e2c4f] transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Подробно боксов
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Статистика боксов */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Статистика боксов</h3>
                
                {warehouse.storage ? (
                  <>
                    {getStatCard(
                      `Всего ${isCloud ? 'мест м2' : 'боксов'}`,
                        isCloud ? warehouse.storage[0]?.total_volume : warehouse.storage.length,
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>,
                      'text-gray-900'
                    )}
                    
                    {getStatCard(
                      'Свободные',
                      isCloud ? warehouse.storage[0]?.available_volume : warehouse.storage.filter(s => s.status === 'VACANT').length,
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>,
                      'text-green-600'
                    )}
                    
                    {getStatCard(
                      'Занятые',
                        isCloud ? warehouse.storage[0]?.total_volume - warehouse.storage[0]?.available_volume : warehouse.storage.filter(s => s.status === 'OCCUPIED').length,
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>,
                      'text-red-600'
                    )}
                    
                    {!isCloud && getStatCard(
                      'Ожидающие',
                      warehouse.storage.filter(s => s.status === 'PENDING').length,
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>,
                      'text-yellow-600'
                    )}
                  </>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Нет данных о боксах</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WarehouseData; 