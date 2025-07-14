import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';
import { warehouseApi } from '../../../shared/api/warehouseApi';

const ManagerWarehouseData = () => {
  const navigate = useNavigate();
  const { warehouseId } = useParams();
  const [activeNav, setActiveNav] = useState('managerwarehouses');
  const [warehouse, setWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных склада при монтировании
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await warehouseApi.getWarehouseById(warehouseId);
        setWarehouse(data);
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
  }, [warehouseId]);

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

  if (error || !warehouse) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-red-500 text-center">
            {error || 'Склад не найден'}
          </div>
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
                  onClick={() => navigate('/personal-account', { state: { activeSection: 'managerwarehouses' } })}
                  className="flex items-center text-[#000000] text-lg mr-2 cursor-pointer"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  <span className="font-['Nunito Sans']">Данные склада</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg shadow-md border border-gray-200 ${warehouse.status === 'AVAILABLE' ? 'bg-white' : 'bg-[#DEE0E4]'}`}>
                  <div
                    className={`text-white text-xs px-7 font-['Abhaya Libre SemiBold'] py-1.5 rounded-full inline-block mb-2 ${warehouse.status === 'AVAILABLE' ? 'bg-[#3A532D]' : 'bg-[#777777]'}`}
                  >
                    {warehouse.status === 'AVAILABLE' ? 'Доступен' : 'Недоступен'}
                  </div>
                  <h2 className="text-lg font-semibold mb-1">{warehouse.name}</h2>
                  <p className="text-sm text-[#000000] mb-2">{warehouse.address}</p>
                  <p className="text-xs text-gray-600 mb-2">
                    Время работы: {warehouse.work_start} - {warehouse.work_end}
                  </p>
                  <p className="text-xs text-gray-600 mb-4">
                    Координаты: {warehouse.latitude}, {warehouse.longitude}
                  </p>
                  <div className="border-t border-[#263654] pt-4 flex items-center justify-center text-[#000000] text-sm">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h7A2.5 2.5 0 0 1 14 2.5v11a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 13.5v-11zM4.5 1A1.5 1.5 0 0 0 3 2.5v11A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 11.5 1h-7z"/>
                        <path d="M5 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 3zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 5zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 7z"/>
                    </svg>
                      <span>Боксов: {warehouse.storage ? warehouse.storage.length : 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Информация о боксах */}
              {warehouse.storage && warehouse.storage.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Боксы склада</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {warehouse.storage.map((box) => (
                      <div 
                        key={box.id}
                        className={`p-3 rounded-lg border ${
                          box.status === 'VACANT' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <h4 className="font-medium">{box.name}</h4>
                        <p className="text-sm text-gray-600">
                          Статус: {box.status === 'VACANT' ? 'Свободен' : 'Занят'}
                        </p>
                        {box.storage_type && (
                          <p className="text-xs text-gray-500">
                            Тип: {box.storage_type}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerWarehouseData;