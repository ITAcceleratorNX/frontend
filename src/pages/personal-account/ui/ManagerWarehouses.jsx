import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { warehouseApi } from '../../../shared/api/warehouseApi';
import { toast } from 'react-toastify';

const ManagerWarehouses = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('All');
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Загрузка складов при монтировании компонента
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await warehouseApi.getAllWarehouses();
        setWarehouses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Ошибка при загрузке складов:', error);
        setError('Не удалось загрузить список складов');
        toast.error('Не удалось загрузить список складов');
        setWarehouses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/personal-account/manager/warehouses/${id}`);
  };

  const handleEditClick = (e, id) => {
    e.stopPropagation();
    navigate(`/personal-account/manager/warehouses/${id}/edit`);
  };

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Фильтрация складов по статусу и поисковому запросу
  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesStatus = statusFilter === 'All' || warehouse.status === statusFilter;
    const matchesSearch = warehouse.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6 font-['Abhaya Libre SemiBold']">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Загрузка складов...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 font-['Abhaya Libre SemiBold']">
        <div className="text-red-500 text-center">{error}</div>
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
            placeholder="Поиск склада по адресу..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-64 p-2 border border-[#777777] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 text-gray-700 placeholder-gray-500"
          />
          <div className="relative">
            <select
              className="p-2 border border-[#777777] rounded-md appearance-none pr-8 text-[#000000] bg-white"
              value={statusFilter}
              onChange={handleFilterChange}
            >
              <option value="All">Все</option>
              <option value="AVAILABLE">Доступен</option>
              <option value="UNAVAILABLE">Недоступен</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.243 4.243z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {warehouses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Складов не найдено
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredWarehouses.map((warehouse) => (
          <div 
            key={warehouse.id} 
              className={`p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer relative ${
                warehouse.status === 'AVAILABLE' ? 'bg-white' : 'bg-[#DEE0E4]'
              }`}
            onClick={() => handleCardClick(warehouse.id)}
          >
              <button
                onClick={(e) => handleEditClick(e, warehouse.id)}
                className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs rounded-md transition-colors"
              >
                Изменить
              </button>
              <div
                className={`text-white text-xs px-7 font-['Abhaya Libre SemiBold'] py-1.5 rounded-full inline-block mb-2 ${
                  warehouse.status === 'AVAILABLE' ? 'bg-[#3A532D]' : 'bg-[#777777]'
                }`}
            >
                {warehouse.status === 'AVAILABLE' ? 'Доступен' : 'Недоступен'}
            </div>
            <h2 className="text-lg font-semibold mb-1">{warehouse.name}</h2>
              <p className="text-sm text-[#000000] mb-2">{warehouse.address}</p>
              <p className="text-xs text-gray-600 mb-4">
                Время работы: {warehouse.work_start} - {warehouse.work_end}
              </p>
              <div className="border-t border-[#263654] pt-4 flex items-center justify-between text-[#000000] text-sm">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h7A2.5 2.5 0 0 1 14 2.5v11a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-11zM4.5 1A1.5 1.5 0 0 0 3 2.5v11A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 11.5 1h-7z"/>
                    <path d="M5 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 3zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 5zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 7z"/>
</svg>
                  <span>{warehouse.storage ? warehouse.storage.length : 0}</span>
                </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default ManagerWarehouses; 