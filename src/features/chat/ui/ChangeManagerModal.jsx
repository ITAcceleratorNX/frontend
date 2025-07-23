import React, { memo, useState, useEffect } from 'react';
import { X, Users, ArrowRight, Check } from 'lucide-react';
import { chatApi } from '../../../shared/api/chatApi';
import { toast } from 'react-toastify';

const ChangeManagerModal = memo(({ 
  isOpen, 
  onClose, 
  chat,
  currentManager,
  onManagerChanged 
}) => {
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
        const response = await fetch('https://backend.shakyrty.kz/users/manager', {
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
    return manager.name || manager.email?.split('@')[0] || `Менеджер #${manager.id}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeInUp">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#1e2c4f] rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Сменить менеджера</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Содержимое */}
        <div className="p-6">
          {/* Текущий менеджер */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Текущий менеджер:
            </label>
            <div className="bg-[#1e2c4f]/10 border border-[#1e2c4f]/20 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#1e2c4f] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {formatManagerName(currentManager || {}).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-[#1e2c4f]">
                    {formatManagerName(currentManager || {})}
                  </div>
                  <div className="text-sm text-[#1e2c4f]/70">
                    ID: {currentManager?.id || chat?.manager_id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Выбор нового менеджера */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Выберите нового менеджера:
            </label>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1e2c4f]"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {managers
                  .filter(manager => manager.id !== (currentManager?.id || chat?.manager_id))
                  .map((manager) => (
                  <div
                    key={manager.id}
                    onClick={() => setSelectedManagerId(manager.id)}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-all duration-200
                      ${selectedManagerId === manager.id
                        ? 'border-[#1e2c4f] bg-[#1e2c4f]/10 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          ${selectedManagerId === manager.id
                            ? 'bg-[#1e2c4f]'
                            : 'bg-gray-400'
                          }
                        `}>
                          <span className="text-white text-sm font-bold">
                            {formatManagerName(manager).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatManagerName(manager)}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {manager.id}
                          </div>
                        </div>
                      </div>
                      
                      {selectedManagerId === manager.id && (
                        <Check className="w-5 h-5 text-[#1e2c4f]" />
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