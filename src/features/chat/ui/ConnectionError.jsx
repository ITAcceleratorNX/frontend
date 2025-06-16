import React, { memo } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const ConnectionError = memo(({ 
  isConnected, 
  isReconnecting, 
  onRetry, 
  onRefresh,
  className = ''
}) => {
  // Если подключение есть, ничего не отображаем
  if (isConnected) {
    return null;
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {isReconnecting ? (
            <RefreshCw className="h-5 w-5 text-orange-500 animate-spin" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">
            {isReconnecting ? 'Переподключение...' : 'Нет соединения'}
          </h4>
          
          <p className="text-sm text-red-700 mt-1">
            {isReconnecting 
              ? 'Восстанавливаем соединение с сервером'
              : 'Связь с сервером прервана. Проверьте подключение к интернету.'
            }
          </p>
          
          {!isReconnecting && (
            <div className="mt-3 flex space-x-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Попробовать снова
                </button>
              )}
              
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="inline-flex items-center px-3 py-1 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Обновить страницу
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Статус индикатор */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-red-600">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isReconnecting ? 'bg-orange-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span>{isReconnecting ? 'Подключение...' : 'Офлайн'}</span>
          </div>
        </div>
        
        <div className="text-xs text-red-500">
          {isReconnecting ? 'Подождите...' : 'Требуется подключение'}
        </div>
      </div>
    </div>
  );
});

ConnectionError.displayName = 'ConnectionError';

export { ConnectionError }; 