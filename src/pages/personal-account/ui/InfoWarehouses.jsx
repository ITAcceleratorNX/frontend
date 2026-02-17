import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { warehouseApi } from '../../../shared/api/warehouseApi';
import { useAuth } from '../../../shared/context/AuthContext';
import { showErrorToast } from '../../../shared/lib/toast';

const InfoWarehouses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Загрузка складов при монтировании и автоматическое перенаправление на первый склад
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await warehouseApi.getAllWarehouses();
        const warehousesArray = Array.isArray(data) ? data : [];
        setWarehouses(warehousesArray);
        setFilteredWarehouses(warehousesArray);
        
        if (import.meta.env.DEV) {
          console.log('Склады загружены для панели управления:', data);
        }

        // Автоматически перенаправляем на первый склад
        if (warehousesArray.length > 0) {
          const firstWarehouse = warehousesArray.find(w => w.type !== 'CLOUD') || warehousesArray[0];
          if (firstWarehouse) {
            const basePath = user?.role === 'ADMIN' ? 'admin' : 'manager';
            navigate(`/personal-account/${basePath}/warehouses/${firstWarehouse.id}`, { replace: true });
            return; // Выходим, чтобы не показывать карточки
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке складов:', error);
        setError('Не удалось загрузить список складов. Попробуйте позже.');
        showErrorToast('Ошибка загрузки складов');
        setWarehouses([]);
        setFilteredWarehouses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouses();
  }, [navigate, user?.role]);

  // Фильтрация складов
  useEffect(() => {
    let filtered = warehouses;

    // Фильтр по поиску
    if (searchTerm.trim()) {
      filtered = filtered.filter(warehouse =>
        warehouse?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(warehouse => {
        if (statusFilter === 'ACTIVE') {
          return warehouse.status === 'AVAILABLE';
        } else if (statusFilter === 'INACTIVE') {
          return warehouse.status !== 'AVAILABLE';
        }
        return true;
      });
    }

    setFilteredWarehouses(filtered);
  }, [warehouses, searchTerm, statusFilter]);

  const handleCardClick = (id) => {
    const basePath = user?.role === 'ADMIN' ? 'admin' : 'manager';
    navigate(`/personal-account/${basePath}/warehouses/${id}`);
  };

  const handleEditClick = (id, event) => {
    event.stopPropagation(); // Предотвращаем всплытие события клика
    const basePath = user?.role === 'ADMIN' ? 'admin' : 'manager';
    navigate(`/personal-account/${basePath}/warehouses/${id}?edit=true`);
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

  const getCardStyle = (status) => {
    return status === 'AVAILABLE' 
      ? 'border-green-200 hover:border-green-300 hover:shadow-lg' 
      : 'border-gray-200 hover:border-gray-300 hover:shadow-md opacity-75';
  };

  // Функция для форматирования времени (убираем секунды)
  const formatTime = (timeString) => {
    if (!timeString) return timeString;
    return timeString.substring(0, 5); // Берем только HH:MM
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Заголовок загрузки */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* Фильтры загрузки */}
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded-lg w-80 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
        </div>

        {/* Карточки загрузки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl border border-red-200 shadow-sm">
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-[#00A991] hover:bg-[#009882] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Повторить попытку
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Заголовок */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Управление складами</h1>
        <p className="text-gray-600">Просматривайте и управляйте всеми складами в системе</p>
      </div>

      {/* Поиск и фильтры */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Поиск */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Поиск по названию или адресу..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:border-transparent transition-colors"
              />
            </div>

            {/* Фильтр по статусу */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:border-transparent transition-colors"
              >
                <option value="ALL">Все склады</option>
                <option value="ACTIVE">Активные</option>
                <option value="INACTIVE">Неактивные</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Статистика */}
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Найдено: <span className="font-medium text-gray-900 ml-1">{filteredWarehouses.length}</span> из <span className="font-medium text-gray-900">{warehouses.length}</span>
          </div>
        </div>
      </div>

      {/* Список складов */}
      {filteredWarehouses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Склады не найдены</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Попробуйте изменить критерии поиска или фильтрации' 
                : 'В системе пока нет ни одного склада'
              }
            </p>
            {(searchTerm || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#004743] bg-[#00A991]/10 hover:bg-[#00A991]/15 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWarehouses.map((warehouse) => (
            <div 
              key={warehouse.id} 
              className={`group bg-white rounded-xl border shadow-sm cursor-pointer transition-all duration-200 ${getCardStyle(warehouse.status)}`}
              onClick={() => handleCardClick(warehouse.id)}
            >
              <div className="p-6">
                {/* Заголовок карточки */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(warehouse.status)}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${warehouse.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    {getStatusDisplay(warehouse.status)}
                  </div>
                  
                  <button
                    onClick={(e) => handleEditClick(warehouse.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-[#004743] hover:bg-gray-100 rounded-lg transition-all duration-200"
                    title="Редактировать склад"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>

                {/* Основная информация */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#004743] transition-colors">
                    {warehouse.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="line-clamp-2">{warehouse?.address}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatTime(warehouse.work_start)} - {formatTime(warehouse.work_end)}</span>
                    </div>
                  </div>

                  {/* Статистика боксов */}
                  {warehouse.storage && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Всего {warehouse.type === "CLOUD" ? 'мест:' : 'боксов:' }</span>
                        <span className="font-medium text-gray-900">{warehouse.type === "CLOUD" ? warehouse.storage[0].total_volume : warehouse.storage.length}</span>
                      </div>
                      {warehouse.storage.filter && (
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-600">Свободно:</span>
                          <span className="font-medium text-green-600">
                            {warehouse.type === "CLOUD" ? warehouse.storage[0].available_volume : warehouse.storage.filter(s => s.status === 'VACANT').length}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Индикатор hover */}
                <div className="absolute inset-0 rounded-xl ring-2 ring-[#00A991] ring-opacity-0 group-hover:ring-opacity-20 transition-all duration-200 pointer-events-none"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InfoWarehouses; 