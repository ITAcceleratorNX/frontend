import React, { memo, useState, useEffect } from 'react';
import { X, Users, ArrowRight, Check } from 'lucide-react';
import { useDeviceType } from '../../../shared/lib/hooks/useWindowWidth';
import { chatApi } from '../../../shared/api/chatApi';
import { toast } from 'react-toastify';

const ChangeManagerModal = memo(({ 
  isOpen, 
  onClose, 
  chat,
  currentManager,
  onManagerChanged 
}) => {
  const { isMobile } = useDeviceType();
  const [managers, setManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // Загрузка списка менеджеров
  useEffect(() => {
    const loadManagers = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('https://api.extraspace.kz/users/manager', {
          credentials: 'include'
        });
        const data = await response.json();
        setManagers(data || []);
      } catch (error) {
        console.error('Ошибка загрузки менеджеров:', error);
        toast.error('Не удалось загрузить список менеджеров');
      } finally {
        setIsLoading(false);
      }
    };

    loadManagers();
  }, [isOpen]);

  // Смена менеджера
  const handleChangeManager = async () => {
    if (!selectedManagerId || !chat) return;

    try {
      setIsChanging(true);
      await chatApi.changeManager(chat.id, selectedManagerId);
      
      const selectedManager = managers.find(m => m.id === selectedManagerId);
      toast.success(`Менеджер изменен на ${selectedManager?.name || selectedManager?.email || 'Неизвестно'}`);
      
      onManagerChanged?.(selectedManagerId, selectedManager);
      onClose();
    } catch (error) {
      console.error('Ошибка смены менеджера:', error);
      toast.error('Не удалось сменить менеджера');
    } finally {
      setIsChanging(false);
    }
  };

  const formatManagerName = (manager) => {
    if (!manager) return 'Неизвестно';
    return manager.name || manager.email?.split('@')[0] || `Менеджер #${manager.id}`;
  };

  // Получаем данные текущего менеджера
  const getCurrentManagerData = () => {
    if (currentManager && currentManager.id) {
      return currentManager;
    }
    // Если currentManager не передан или не имеет id, ищем в списке менеджеров
    if (chat?.manager_id) {
      return managers.find(m => m.id === chat.manager_id) || { id: chat.manager_id };
    }
    return { id: 'неизвестен' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeInUp">
      <div className={`
        bg-white shadow-2xl w-full
        ${isMobile 
          ? 'h-full max-w-full m-0 rounded-none' 
          : 'max-w-md mx-4 rounded-xl'
        }
      `}>
        {/* Заголовок */}
        <div className={`
          flex items-center justify-between border-b border-gray-200
          ${isMobile ? 'p-4 pt-8' : 'p-6'}
        `}>
          <div className="flex items-center space-x-3">
            <div className={`
              bg-[#1e2c4f] rounded-lg flex items-center justify-center
              ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}
            `}>
              <Users className={`text-white ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </div>
            <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              Сменить менеджера
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`
              text-gray-400 hover:text-gray-600 transition-colors
              ${isMobile ? 'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center' : ''}
            `}
          >
            <X className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
          </button>
        </div>

        {/* Содержимое */}
        <div className={`${isMobile ? 'p-4 flex-1 overflow-y-auto' : 'p-6'}`}>
          {/* Текущий менеджер */}
          <div className={`${isMobile ? 'mb-8' : 'mb-6'}`}>
            <label className={`
              block font-medium text-gray-700 mb-2
              ${isMobile ? 'text-base' : 'text-sm'}
            `}>
              Текущий менеджер:
            </label>
            <div className={`
              bg-[#1e2c4f]/10 border border-[#1e2c4f]/20 rounded-lg
              ${isMobile ? 'p-4' : 'p-3'}
            `}>
              <div className={`flex items-center ${isMobile ? 'space-x-4' : 'space-x-3'}`}>
                <div className={`
                  bg-[#1e2c4f] rounded-full flex items-center justify-center
                  ${isMobile ? 'w-10 h-10' : 'w-8 h-8'}
                `}>
                  <span className={`text-white font-bold ${isMobile ? 'text-base' : 'text-sm'}`}>
                    {formatManagerName(getCurrentManagerData()).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className={`font-medium text-[#1e2c4f] ${isMobile ? 'text-base' : 'text-sm'}`}>
                    {formatManagerName(getCurrentManagerData())}
                  </div>
                  <div className={`text-[#1e2c4f]/70 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                    ID: {getCurrentManagerData().id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Выбор нового менеджера */}
          <div className={`${isMobile ? 'mb-8' : 'mb-6'}`}>
            <label className={`
              block font-medium text-gray-700 mb-3
              ${isMobile ? 'text-base' : 'text-sm'}
            `}>
              Выберите нового менеджера:
            </label>
            
            {isLoading ? (
              <div className={`flex items-center justify-center ${isMobile ? 'py-12' : 'py-8'}`}>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1e2c4f]"></div>
              </div>
            ) : (
              <div className={`
                overflow-y-auto
                ${isMobile 
                  ? 'space-y-3 max-h-96' 
                  : 'space-y-2 max-h-60'
                }
              `}>
                {managers
                  .filter(manager => manager.id !== getCurrentManagerData().id)
                  .map((manager) => (
                  <div
                    key={manager.id}
                    onClick={() => setSelectedManagerId(manager.id)}
                    className={`
                      border rounded-lg cursor-pointer transition-all duration-200
                      ${isMobile ? 'p-4 min-h-[60px]' : 'p-3'}
                      ${selectedManagerId === manager.id
                        ? 'border-[#1e2c4f] bg-[#1e2c4f]/10 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center ${isMobile ? 'space-x-4' : 'space-x-3'}`}>
                        <div className={`
                          rounded-full flex items-center justify-center
                          ${isMobile ? 'w-10 h-10' : 'w-8 h-8'}
                          ${selectedManagerId === manager.id
                            ? 'bg-[#1e2c4f]'
                            : 'bg-gray-400'
                          }
                        `}>
                          <span className={`text-white font-bold ${isMobile ? 'text-base' : 'text-sm'}`}>
                            {formatManagerName(manager).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className={`font-medium text-gray-900 ${isMobile ? 'text-base' : 'text-sm'}`}>
                            {formatManagerName(manager)}
                          </div>
                          <div className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                            ID: {manager.id}
                          </div>
                        </div>
                      </div>
                      
                      {selectedManagerId === manager.id && (
                        <Check className={`text-[#1e2c4f] ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Отмена
          </button>
          
          <button
            onClick={handleChangeManager}
            disabled={!selectedManagerId || isChanging}
            className={`
              flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all duration-200
              ${selectedManagerId && !isChanging
                ? 'bg-[#1e2c4f] text-white hover:bg-[#1e2c4f]/90 hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isChanging ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Изменяю...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Сменить менеджера</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ChangeManagerModal.displayName = 'ChangeManagerModal';

export { ChangeManagerModal }; 