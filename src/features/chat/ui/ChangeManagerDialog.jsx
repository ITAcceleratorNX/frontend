import React, { memo, useState } from 'react';
import { X, Users, ArrowRight, Check } from 'lucide-react';

const ChangeManagerDialog = memo(({ 
  isOpen, 
  onClose, 
  currentManager, 
  availableManagers = [], 
  onChangeManager,
  isChanging = false
}) => {
  const [selectedManager, setSelectedManager] = useState(null);

  const handleSubmit = () => {
    if (selectedManager && onChangeManager) {
      onChangeManager(selectedManager.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-fadeInUp">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Сменить менеджера
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Текущий менеджер */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Текущий менеджер:</h3>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {currentManager?.name || `Менеджер #${currentManager?.id}`}
              </p>
              <p className="text-sm text-gray-600">ID: {currentManager?.id}</p>
            </div>
          </div>
        </div>

        {/* Выбор нового менеджера */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Выберите нового менеджера:</h3>
          
          {availableManagers.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Нет доступных менеджеров</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableManagers.map((manager) => (
                <button
                  key={manager.id}
                  onClick={() => setSelectedManager(manager)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all
                    ${selectedManager?.id === manager.id
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${selectedManager?.id === manager.id 
                        ? 'bg-blue-500' 
                        : 'bg-gray-400'
                      }
                    `}>
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {manager.name || `Менеджер #${manager.id}`}
                      </p>
                      <p className="text-sm text-gray-600">ID: {manager.id}</p>
                    </div>
                  </div>
                  
                  {selectedManager?.id === manager.id && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Отмена
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!selectedManager || isChanging}
            className={`
              flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all
              ${!selectedManager || isChanging
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
              }
            `}
          >
            {isChanging ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Меняем...</span>
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

ChangeManagerDialog.displayName = 'ChangeManagerDialog';

export { ChangeManagerDialog }; 