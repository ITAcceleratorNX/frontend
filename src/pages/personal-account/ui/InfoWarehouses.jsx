import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { warehouseApi } from '../../../shared/api/warehouseApi';
import { useAuth } from '../../../shared/context/AuthContext';
import { toast } from 'react-toastify';

const InfoWarehouses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Загрузка складов при монтировании
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await warehouseApi.getAllWarehouses();
        setWarehouses(Array.isArray(data) ? data : []);
        setFilteredWarehouses(Array.isArray(data) ? data : []);
        
        if (import.meta.env.DEV) {
          console.log('Склады загружены для панели управления:', data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке складов:', error);
        setError('Не удалось загрузить список складов. Попробуйте позже.');
        toast.error('Ошибка загрузки складов');
        setWarehouses([]);
        setFilteredWarehouses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  // Фильтрация складов
  useEffect(() => {
    let filtered = warehouses;

    // Фильтр по поиску
    if (searchTerm.trim()) {
      filtered = filtered.filter(warehouse =>
        warehouse.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="p-6 font-['Abhaya Libre SemiBold']">
        <h1 className="text-3xl font-medium mb-6">Список складов</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#273655]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 font-['Abhaya Libre SemiBold']">
        <h1 className="text-3xl font-medium mb-6">Список складов</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#263654] hover:bg-[#3b4352] text-white px-6 py-2 rounded-md"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 font-['Abhaya Libre SemiBold']">
      <h1 className="text-3xl font-medium mb-6">Список складов</h1>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Поиск склада по названию или адресу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 p-2 border border-[#777777] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700 placeholder-gray-500"
          />
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-[#777777] rounded-md appearance-none pr-8 text-[#000000] bg-white"
            >
              <option value="ALL">Все склады</option>
              <option value="ACTIVE">Активные</option>
              <option value="INACTIVE">Неактивные</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.243 4.243z"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Найдено складов: {filteredWarehouses.length} из {warehouses.length}
        </div>
      </div>

      {filteredWarehouses.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-500">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Склады не найдены по заданным критериям' 
              : 'Склады не найдены'
            }
          </div>
          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="mt-4 text-[#273655] underline hover:no-underline"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredWarehouses.map((warehouse) => (
            <div 
              key={warehouse.id} 
              className={`relative p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer transition-all hover:shadow-lg ${getCardClass(warehouse.status)}`}
              onClick={() => handleCardClick(warehouse.id)}
            >
              <button
                onClick={(e) => handleEditClick(warehouse.id, e)}
                className="absolute top-3 right-3 p-2 text-gray-500 hover:text-[#273655] hover:bg-gray-100 rounded-full transition-all"
                title="Редактировать склад"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <div
                className={`text-white text-xs px-7 font-['Abhaya Libre SemiBold'] py-1.5 rounded-full inline-block mb-2 ${getStatusClass(warehouse.status)}`}
              >
                {getStatusDisplay(warehouse.status)}
              </div>
              <h2 className="text-lg font-semibold mb-1">{warehouse.name}</h2>
              <p className="text-sm text-[#000000] mb-2">{warehouse.address}</p>
              <p className="text-xs text-gray-600 mb-2">
                Время работы: {warehouse.work_start} - {warehouse.work_end}
              </p>
              {warehouse.storage && (
                <p className="text-xs text-[#273655] font-medium">
                  Боксов: {warehouse.storage.length} 
                  {warehouse.storage.filter && (
                    <span className="text-green-600">
                      {' '}(свободно: {warehouse.storage.filter(s => s.status === 'VACANT').length})
                    </span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InfoWarehouses; 