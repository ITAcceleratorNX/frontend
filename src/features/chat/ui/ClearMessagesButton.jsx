import React, { memo, useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = memo(({ isOpen, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeInUp">
        <div className="p-6">
          {/* Заголовок */}
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Очистить историю чата?
              </h3>
              <p className="text-sm text-gray-500">
                Это действие нельзя отменить
              </p>
            </div>
          </div>

          {/* Описание */}
          <div className="mb-6">
            <p className="text-gray-700">
              Все сообщения в этом чате будут удалены безвозвратно. 
              Вы уверены, что хотите продолжить?
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
                         flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Очистка...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Очистить</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ConfirmationModal.displayName = 'ConfirmationModal';

const ClearMessagesButton = memo(({ 
  onClear, 
  disabled = false, 
  className = '',
  variant = 'icon', // 'icon', 'button', 'text'
  showConfirmation = true 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClick = () => {
    if (showConfirmation) {
      setShowModal(true);
    } else {
      handleClear();
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      await onClear();
      setShowModal(false);
    } catch (error) {
      console.error('Ошибка при очистке сообщений:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  // Вариант - только иконка
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={disabled || isClearing}
          className={`
            p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 
            rounded-lg transition-all duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed
            group relative
            ${className}
          `}
          title="Очистить историю чата"
        >
          <Trash2 className="w-5 h-5" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Очистить сообщения
          </div>
        </button>

        <ConfirmationModal
          isOpen={showModal}
          onConfirm={handleClear}
          onCancel={handleCancel}
          isLoading={isClearing}
        />
      </>
    );
  }

  // Вариант - кнопка с текстом
  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={disabled || isClearing}
          className={`
            flex items-center space-x-2 px-3 py-2 
            text-gray-600 hover:text-red-600 hover:bg-red-50 
            border border-gray-300 hover:border-red-300
            rounded-lg transition-all duration-200 
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Очистить чат</span>
        </button>

        <ConfirmationModal
          isOpen={showModal}
          onConfirm={handleClear}
          onCancel={handleCancel}
          isLoading={isClearing}
        />
      </>
    );
  }

  // Вариант - только текст
  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || isClearing}
        className={`
          text-sm text-gray-500 hover:text-red-500 
          transition-colors duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        Очистить историю
      </button>

      <ConfirmationModal
        isOpen={showModal}
        onConfirm={handleClear}
        onCancel={handleCancel}
        isLoading={isClearing}
      />
    </>
  );
});

ClearMessagesButton.displayName = 'ClearMessagesButton';

export { ClearMessagesButton }; 