import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Header } from '../../widgets';
import Footer from '../../widgets/Footer';
import { warehouseApi } from '../../shared/api/warehouseApi';
import { useAuth } from '../../shared/context/AuthContext';
import ChatButton from '../../shared/components/ChatButton';
import InteractiveWarehouseCanvas from '../../components/InteractiveWarehouseCanvas';
import MainWarehouseCanvas from '../../components/MainWarehouseCanvas';

const WarehouseOrderPage = memo(() => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Состояния для данных
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояния для формы заказа
  const [orderItems, setOrderItems] = useState([
    { name: '', volume: '', cargo_mark: 'NO' }
  ]);
  const [months, setMonths] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Новые состояния для дополнительных услуг
  const [isSelectedMoving, setIsSelectedMoving] = useState(false);
  const [isSelectedPackage, setIsSelectedPackage] = useState(false);

  // Проверяем роль пользователя - функции заказа доступны только для USER
  const isUserRole = user?.role === 'USER';
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  // Загрузка складов при монтировании
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await warehouseApi.getAllWarehouses();
        setWarehouses(Array.isArray(data) ? data : []);
        
        if (import.meta.env.DEV) {
          console.log('Склады загружены:', data);
          
          // Детальная проверка данных боксов
          data.forEach(warehouse => {
            if (warehouse.storage && Array.isArray(warehouse.storage)) {
              console.log(`Склад "${warehouse.name}":`, {
                totalBoxes: warehouse.storage.length,
                vacantBoxes: warehouse.storage.filter(s => s.status === 'VACANT').length,
                occupiedBoxes: warehouse.storage.filter(s => s.status === 'OCCUPIED').length,
                boxStatuses: warehouse.storage.map(s => ({ name: s.name, status: s.status, type: s.storage_type }))
              });
            }
          });
        }
      } catch (error) {
        console.error('Ошибка при загрузке складов:', error);
        setError('Не удалось загрузить список складов. Попробуйте позже.');
        setWarehouses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  // Функция добавления товара
  const addOrderItem = () => {
    setOrderItems([...orderItems, { name: '', volume: '', cargo_mark: 'NO' }]);
  };

  // Функция удаления товара
  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  // Функция обновления товара
  const updateOrderItem = (index, field, value) => {
    const updatedItems = orderItems.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setOrderItems(updatedItems);
  };

  // Функция создания заказа
  const handleCreateOrder = async () => {
    if (!selectedStorage) {
      setError('Пожалуйста, выберите бокс для аренды');
      return;
    }

    // Валидация товаров
    const validItems = orderItems.filter(item => 
      item.name.trim() && item.volume && parseFloat(item.volume) > 0
    );

    if (validItems.length === 0) {
      setError('Добавьте хотя бы один товар с указанием названия и объема');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const orderData = {
        storage_id: selectedStorage.id,
        months: months,
        order_items: validItems.map(item => ({
          name: item.name.trim(),
          volume: parseFloat(item.volume),
          cargo_mark: item.cargo_mark
        })),
        is_selected_moving: isSelectedMoving,
        is_selected_package: isSelectedPackage
      };

      const result = await warehouseApi.createOrder(orderData);
      
      if (import.meta.env.DEV) {
        console.log('Заказ создан:', result);
      }

      // Показываем уведомление об успехе и перенаправляем в личный кабинет
      toast.success('Заказ успешно создан! Перенаправляем в личный кабинет...', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Задержка перед перенаправлением для показа уведомления
      setTimeout(() => {
        navigate('/personal-account');
      }, 1500);

          } catch (error) {
        console.error('Ошибка при создании заказа:', error);
        const errorMessage = error.response?.data?.message || 'Не удалось создать заказ. Попробуйте позже.';
        setError(errorMessage);
        
        // Показываем уведомление об ошибке
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
      setIsSubmitting(false);
    }
  };

  // Расчет общего объема товаров
  const totalVolume = orderItems.reduce((sum, item) => {
    const volume = parseFloat(item.volume) || 0;
    return sum + volume;
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#273655]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Montserrat']">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-[48px] font-bold text-[#273655] mb-4">
            {isUserRole ? 'ЗАКАЗ БОКСА' : 'ПРОСМОТР СКЛАДОВ И БОКСОВ'}
          </h1>
          <p className="text-[18px] text-[#6B6B6B]">
            {isUserRole 
              ? 'Выберите склад и бокс для аренды, добавьте ваши вещи'
              : 'Просмотр состояния складов и боксов'
            }
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-600 text-center">{error}</div>
          </div>
        )}

        {/* Список складов */}
        <div className="mb-8">
          <h2 className="text-[24px] font-bold text-[#273655] mb-4">
            1. Выберите склад
          </h2>
          
          {warehouses.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <div className="text-gray-500">
                Склады временно недоступны. Попробуйте позже.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {warehouses.map((warehouse) => (
                <div
                  key={warehouse.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    selectedWarehouse?.id === warehouse.id
                      ? 'border-[#273655] bg-blue-50'
                      : 'border-gray-200 hover:border-[#273655]'
                  }`}
                  onClick={() => {
                    setSelectedWarehouse(warehouse);
                    setSelectedStorage(null); // Сбрасываем выбранный бокс
                  }}
                >
                  <h3 className="text-[20px] font-bold text-[#273655] mb-2">
                    {warehouse.name}
                  </h3>
                  <p className="text-[#6B6B6B] mb-2">{warehouse.address}</p>
                  <p className="text-[#6B6B6B] text-sm">
                    Время работы: {warehouse.work_start} - {warehouse.work_end}
                  </p>
                  <p className="text-[#6B6B6B] text-sm">
                    Статус: <span className="text-green-600">{warehouse.status}</span>
                  </p>
                  {warehouse.storage && (
                    <p className="text-[#273655] font-medium mt-2">
                      Доступно боксов: {warehouse.storage.filter(s => s.status === 'VACANT').length}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Список боксов выбранного склада */}
        {selectedWarehouse && selectedWarehouse.storage && (
          <div className="mb-8">
            <h2 className="text-[24px] font-bold text-[#273655] mb-4">
              {isUserRole ? '2. Выберите бокс в складе' : '2. Боксы в складе'} "{selectedWarehouse.name}"
            </h2>
            
            {/* Проверяем, есть ли у склада интерактивная схема */}
            {selectedWarehouse.name === "EXTRA SPACE Мега" ? (
              // Интерактивная схема для склада "EXTRA SPACE Мега"
              <div className="flex justify-center">
                <InteractiveWarehouseCanvas
                  storageBoxes={selectedWarehouse.storage}
                  onBoxSelect={setSelectedStorage}
                  selectedStorage={selectedStorage}
                  userRole={user?.role}
                  isViewOnly={isAdminOrManager}
                />
              </div>
            ) : selectedWarehouse.name === "EXTRA SPACE Главный склад" ? (
              // Интерактивная схема для склада "EXTRA SPACE Главный склад"
              <div className="flex justify-center">
                <MainWarehouseCanvas
                  storageBoxes={selectedWarehouse.storage}
                  onBoxSelect={setSelectedStorage}
                  selectedStorage={selectedStorage}
                  userRole={user?.role}
                  isViewOnly={isAdminOrManager}
                />
              </div>
            ) : null}

          </div>
        )}

        {/* Форма добавления товаров */}
        {selectedStorage && isUserRole && (
          <div className="mb-8">
            <h2 className="text-[24px] font-bold text-[#273655] mb-4">
              3. Добавьте ваши вещи
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <p className="text-[#6B6B6B] mb-2">
                Выбранный бокс: <span className="font-medium text-[#273655]">{selectedStorage.name}</span>
              </p>
              <p className="text-[#6B6B6B] mb-2">
                Доступный объем: <span className="font-medium text-[#273655]">{selectedStorage.available_volume} м³</span>
              </p>
              <p className="text-[#6B6B6B]">
                Общий объем ваших вещей: <span className="font-medium text-[#273655]">{totalVolume.toFixed(2)} м³</span>
              </p>
              {totalVolume > parseFloat(selectedStorage.available_volume) && (
                <p className="text-red-600 font-medium mt-2">
                  ⚠️ Объем превышает доступное место в боксе!
                </p>
              )}
            </div>

            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#273655] mb-1">
                        Название вещи
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                        placeholder="Например: Диван"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#273655] mb-1">
                        Объем (м³)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={item.volume}
                        onChange={(e) => updateOrderItem(index, 'volume', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                        placeholder="1.5"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#273655] mb-1">
                        Тип груза
                      </label>
                      <select
                        value={item.cargo_mark}
                        onChange={(e) => updateOrderItem(index, 'cargo_mark', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                      >
                        <option value="NO">Обычный</option>
                        <option value="HEAVY">Тяжелый</option>
                        <option value="FRAGILE">Хрупкий</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      {orderItems.length > 1 && (
                        <button
                          onClick={() => removeOrderItem(index)}
                          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addOrderItem}
                className="w-full px-4 py-2 border-2 border-dashed border-[#273655] text-[#273655] rounded-lg hover:bg-blue-50 transition-colors"
              >
                + Добавить еще вещь
              </button>
            </div>
          </div>
        )}

        {/* Информация о выбранном боксе для ADMIN/MANAGER */}
        {selectedStorage && isAdminOrManager && (
          <div className="mb-8">
            <h2 className="text-[24px] font-bold text-[#273655] mb-4">
              Информация о выбранном боксе
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Название бокса:</span>
                  <p className="text-lg font-semibold text-[#273655]">{selectedStorage.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Тип хранения:</span>
                  <p className="text-lg font-semibold text-[#273655]">{selectedStorage.storage_type}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Статус:</span>
                  <p className={`text-lg font-semibold ${selectedStorage.status === 'VACANT' ? 'text-green-600' : selectedStorage.status === 'OCCUPIED' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {selectedStorage.status === 'VACANT' ? 'Свободен' : selectedStorage.status === 'OCCUPIED' ? 'Занят' : 'Ожидает'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Общий объем:</span>
                  <p className="text-lg font-semibold text-[#273655]">{selectedStorage.total_volume} м³</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Доступный объем:</span>
                  <p className="text-lg font-semibold text-[#273655]">{selectedStorage.available_volume} м³</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Высота:</span>
                  <p className="text-lg font-semibold text-[#273655]">{selectedStorage.height} м</p>
                </div>
              </div>
              {selectedStorage.description && (
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-600">Описание:</span>
                  <p className="text-gray-700 mt-1">{selectedStorage.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Дополнительные услуги */}
        {selectedStorage && isUserRole && (
          <div className="mb-8">
            <h2 className="text-[24px] font-bold text-[#273655] mb-4">
              5. Дополнительные услуги
            </h2>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
              {/* Moving услуга */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="text-[18px] font-semibold text-[#273655] mb-2">
                    Услуга перевозки (Moving)
                  </h3>
                  <p className="text-[#6B6B6B] text-sm">
                    Профессиональная перевозка ваших вещей на склад и обратно с использованием специального транспорта и грузчиков
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelectedMoving}
                      onChange={(e) => setIsSelectedMoving(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#273655]"></div>
                  </label>
                </div>
              </div>

              {/* Package услуга */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="text-[18px] font-semibold text-[#273655] mb-2">
                    Услуга упаковки (Package)
                  </h3>
                  <p className="text-[#6B6B6B] text-sm">
                    Профессиональная упаковка ваших вещей в специальные материалы для безопасного хранения
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelectedPackage}
                      onChange={(e) => setIsSelectedPackage(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#273655]"></div>
                  </label>
                </div>
              </div>

              {/* Информация о выбранных услугах */}
              {(isSelectedMoving || isSelectedPackage) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-[16px] font-semibold text-[#273655] mb-2">
                    Выбранные дополнительные услуги:
                  </h4>
                  <ul className="space-y-1 text-sm text-[#6B6B6B]">
                    {isSelectedMoving && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#273655] rounded-full mr-2"></span>
                        Услуга перевозки (Moving)
                      </li>
                    )}
                    {isSelectedPackage && (
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-[#273655] rounded-full mr-2"></span>
                        Услуга упаковки (Package)
                      </li>
                    )}
                  </ul>
                  <p className="text-xs text-[#6B6B6B] mt-2">
                    * Стоимость дополнительных услуг будет рассчитана после создания заказа
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Срок аренды и кнопка заказа */}
        {selectedStorage && isUserRole && (
          <div className="mb-8">
            <h2 className="text-[24px] font-bold text-[#273655] mb-4">
              {(isSelectedMoving || isSelectedPackage) ? '6' : '4'}. Укажите срок аренды
            </h2>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-2">
                    Срок аренды (месяцы)
                  </label>
                  <select
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655] text-lg"
                  >
                    <option value={1}>1 месяц</option>
                    <option value={2}>2 месяца</option>
                    <option value={3}>3 месяца</option>
                    <option value={6}>6 месяцев</option>
                    <option value={12}>12 месяцев</option>
                  </select>
                </div>
                
                <button
                  onClick={handleCreateOrder}
                  disabled={
                    isSubmitting || 
                    !selectedStorage || 
                    orderItems.filter(item => item.name.trim() && item.volume).length === 0 ||
                    totalVolume > parseFloat(selectedStorage.available_volume)
                  }
                  className="w-full h-[56px] bg-[#F86812] text-white text-[18px] font-bold rounded-lg hover:bg-[#d87d1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ boxShadow: "4px 4px 8px 0 #B0B0B0" }}
                >
                  {isSubmitting ? 'СОЗДАНИЕ ЗАКАЗА...' : 'СОЗДАТЬ ЗАКАЗ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatButton />
      <Footer />
    </div>
  );
});

WarehouseOrderPage.displayName = 'WarehouseOrderPage';

export default WarehouseOrderPage; 