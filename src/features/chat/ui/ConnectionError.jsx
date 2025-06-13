import React, { memo } from 'react';
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react';

const ConnectionError = memo(({ 
  isConnected, 
  isReconnecting, 
  onRetry, 
  onRefresh,
  className = '' 
}) => {
  if (isConnected) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-500 mt-0.5" size={20} />
        
        <div className="flex-1">
          <h3 className="text-red-800 font-medium mb-1">
            Проблемы с подключением
          </h3>
          
          <p className="text-red-600 text-sm mb-3">
            {isReconnecting 
              ? 'Попытка восстановления соединения...' 
              : 'Нет соединения с сервером чата. Проверьте подключение к интернету.'
            }
          </p>
          
          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                disabled={isReconnecting}
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Wifi size={14} />
                {isReconnecting ? 'Подключение...' : 'Переподключиться'}
              </button>
            )}
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
              >
                <RefreshCw size={14} />
                Обновить страницу
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ConnectionError.displayName = 'ConnectionError';

export { ConnectionError }; 