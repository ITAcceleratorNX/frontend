import React, { memo, useCallback, useState } from 'react';

const QuickActions = memo(({ onStart, canStart = true }) => {
  const [selectedAction, setSelectedAction] = useState('');

  // Быстрые сообщения
  const quickMessages = {
    consultation: 'Мне нужна консультация',
    booking: 'Ошибка в бронировании',
    technical: 'Техническая поддержка',
    pricing: 'Вопрос по тарифам'
  };

  // Обработка быстрого действия
  const handleQuickAction = useCallback((action) => {
    setSelectedAction(quickMessages[action] || '');
  }, []);

  // Начать чат с выбранным сообщением
  const handleStartChat = useCallback(() => {
    if (!canStart) return;
    
    const success = onStart();
    if (success && selectedAction) {
      // TODO: Отправить быстрое сообщение после подключения
      if (import.meta.env.DEV) {
        console.log('QuickActions: Выбранное сообщение:', selectedAction);
      }
    }
  }, [onStart, canStart, selectedAction]);

  return (
    <div className="flex flex-col items-center">
      {/* Быстрые действия в стиле designchat */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => handleQuickAction('consultation')}
          className={`quick-action-btn w-[225px] h-[69px] border rounded-[10px] flex flex-col items-start justify-center px-5 hover-effect transition-all ${
            selectedAction === quickMessages.consultation 
              ? 'border-[#263554] bg-blue-50' 
              : 'border-[#263554] hover:bg-gray-50'
          }`}
        >
          <span className="text-[14px] font-semibold leading-[18px] text-[#263554]">
            Мне нужна консультация
          </span>
          <span className="text-[12px] font-normal leading-[16px] text-[#263554]">
            Получить помощь специалиста
          </span>
        </button>
        
        <button
          onClick={() => handleQuickAction('booking')}
          className={`quick-action-btn w-[208px] h-[69px] border rounded-[10px] flex flex-col items-start justify-center px-5 hover-effect transition-all ${
            selectedAction === quickMessages.booking 
              ? 'border-[#263554] bg-blue-50' 
              : 'border-[#263554] hover:bg-gray-50'
          }`}
        >
          <span className="text-[14px] font-semibold leading-[18px] text-[#263554]">
            Ошибка в бронировании
          </span>
          <span className="text-[12px] font-normal leading-[16px] text-[#263554]">
            Решить проблему с заказом
          </span>
        </button>
        
        <button
          onClick={() => handleQuickAction('technical')}
          className={`quick-action-btn w-[225px] h-[69px] border rounded-[10px] flex flex-col items-start justify-center px-5 hover-effect transition-all ${
            selectedAction === quickMessages.technical 
              ? 'border-[#263554] bg-blue-50' 
              : 'border-[#263554] hover:bg-gray-50'
          }`}
        >
          <span className="text-[14px] font-semibold leading-[18px] text-[#263554]">
            Техническая поддержка
          </span>
          <span className="text-[12px] font-normal leading-[16px] text-[#263554]">
            Помощь с техническими вопросами
          </span>
        </button>
        
        <button
          onClick={() => handleQuickAction('pricing')}
          className={`quick-action-btn w-[208px] h-[69px] border rounded-[10px] flex flex-col items-start justify-center px-5 hover-effect transition-all ${
            selectedAction === quickMessages.pricing 
              ? 'border-[#263554] bg-blue-50' 
              : 'border-[#263554] hover:bg-gray-50'
          }`}
        >
          <span className="text-[14px] font-semibold leading-[18px] text-[#263554]">
            Вопрос по тарифам
          </span>
          <span className="text-[12px] font-normal leading-[16px] text-[#263554]">
            Узнать о ценах и условиях
          </span>
        </button>
      </div>

      {/* Показываем выбранное сообщение */}
      {selectedAction && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Будет отправлено: "{selectedAction}"
          </p>
        </div>
      )}
      
      {/* Кнопка начала чата */}
      <button
        onClick={handleStartChat}
        disabled={!canStart}
        className="bg-[#263554] text-white px-6 py-2 rounded-[6px] flex items-center space-x-2 hover:bg-[#1e2a42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-[12px] font-semibold leading-[17px]">
          Начать чат
        </span>
      </button>
    </div>
  );
});

QuickActions.displayName = 'QuickActions';

export { QuickActions }; 