import React, { memo, useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { getServerStatus, resetServerStatus } from '../api/axios';

const ServerStatus = memo(({ className = '' }) => {
  const [status, setStatus] = useState({
    isOnline: true,
    isChecking: false,
    lastError: null,
    lastCheck: null
  });

  // Проверка статуса сервера
  const checkServerStatus = async () => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      const serverStatus = getServerStatus();
      
      if (serverStatus.isUnavailable) {
        setStatus({
          isOnline: false,
          isChecking: false,
          lastError: 'Сервер недоступен',
          lastCheck: new Date()
        });
      } else {
        setStatus({
          isOnline: true,
          isChecking: false,
          lastError: null,
          lastCheck: new Date()
        });
      }
    } catch (error) {
      setStatus({
        isOnline: false,
        isChecking: false,
        lastError: error.message,
        lastCheck: new Date()
      });
    }
  };

  // Сброс статуса и повторная проверка
  const handleRetry = () => {
    resetServerStatus();
    checkServerStatus();
  };

  // Периодическая проверка статуса
  useEffect(() => {
    checkServerStatus();
    
    const interval = setInterval(checkServerStatus, 30000); // Каждые 30 секунд
    
    return () => clearInterval(interval);
  }, []);

  // Определяем конфигурацию отображения
  const getStatusConfig = () => {
    if (status.isChecking) {
      return {
        icon: RefreshCw,
        text: 'Проверка...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        animate: true
      };
    }
    
    if (status.isOnline) {
      return {
        icon: CheckCircle,
        text: 'Сервер доступен',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
    
    return {
      icon: AlertTriangle,
      text: status.lastError || 'Сервер недоступен',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Не показываем компонент, если все в порядке
  if (status.isOnline && !status.isChecking) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      <Icon 
        size={20} 
        className={`${config.color} ${config.animate ? 'animate-spin' : ''}`} 
      />
      
      <div className="flex-1">
        <div className={`font-medium ${config.color}`}>
          {config.text}
        </div>
        {status.lastCheck && (
          <div className="text-xs text-gray-500">
            Последняя проверка: {status.lastCheck.toLocaleTimeString('ru-RU')}
          </div>
        )}
      </div>
      
      {!status.isOnline && !status.isChecking && (
        <button
          onClick={handleRetry}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Повторить
        </button>
      )}
    </div>
  );
});

ServerStatus.displayName = 'ServerStatus';

export default ServerStatus; 