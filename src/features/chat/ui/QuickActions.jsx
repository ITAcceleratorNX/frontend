import React, { memo } from 'react';
import { MessageCircle, Phone, Mail, HelpCircle } from 'lucide-react';

const QuickActions = memo(({ onStart, canStart = false, className = '' }) => {
  const quickActionButtons = [
    {
      id: 'start-chat',
      label: 'Начать чат',
      icon: MessageCircle,
      action: onStart,
      primary: true,
      disabled: !canStart
    },
    {
      id: 'support',
      label: 'Поддержка',
      icon: HelpCircle,
      action: () => console.log('Открыть раздел поддержки'),
      disabled: true // Пока неактивно
    },
    {
      id: 'call',
      label: 'Звонок',
      icon: Phone,
      action: () => console.log('Инициировать звонок'),
      disabled: true // Пока неактивно
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      action: () => window.open('mailto:support@extraspace.com'),
      disabled: false
    }
  ];

  const handleAction = (action, disabled) => {
    if (disabled || !action) return;
    action();
  };

  return (
    <div className={`${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-[#273655] mb-2">
          Как мы можем помочь?
        </h3>
        <p className="text-gray-600 text-sm">
          Выберите удобный способ связи с нашей службой поддержки
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {quickActionButtons.map((button) => {
          const Icon = button.icon;
          const isPrimary = button.primary && !button.disabled;
          
          return (
            <button
              key={button.id}
              onClick={() => handleAction(button.action, button.disabled)}
              disabled={button.disabled}
              className={`
                group relative p-6 rounded-xl border-2 transition-all duration-300
                flex flex-col items-center space-y-3 min-h-[120px]
                ${isPrimary 
                  ? 'border-[#273655] bg-[#273655] text-white hover:bg-[#1e2c4f] hover:border-[#1e2c4f] hover:scale-105' 
                  : button.disabled
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#273655] hover:bg-[#f8f9fa] hover:scale-105'
                }
              `}
              title={button.disabled ? 'Скоро будет доступно' : `${button.label}`}
            >
              <div className={`
                p-3 rounded-full transition-colors
                ${isPrimary 
                  ? 'bg-white bg-opacity-20' 
                  : button.disabled 
                    ? 'bg-gray-200' 
                    : 'bg-[#273655] bg-opacity-10 group-hover:bg-[#273655] group-hover:bg-opacity-20'
                }
              `}>
                <Icon 
                  size={24} 
                  className={isPrimary ? 'text-white' : button.disabled ? 'text-gray-400' : 'text-[#273655]'} 
                />
              </div>
              
              <span className={`
                font-medium text-sm
                ${isPrimary ? 'text-white' : button.disabled ? 'text-gray-400' : 'text-gray-700'}
              `}>
                {button.label}
              </span>

              {button.disabled && (
                <span className="absolute top-2 right-2 text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                  Скоро
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-blue-700">
            <MessageCircle size={16} />
            <span className="text-sm font-medium">
              Среднее время ответа: 2-5 минут
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Мы работаем круглосуточно, чтобы помочь вам
          </p>
        </div>
      </div>
    </div>
  );
});

QuickActions.displayName = 'QuickActions';

export { QuickActions }; 