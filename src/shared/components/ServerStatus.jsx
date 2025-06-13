import React, { useState, useEffect, memo } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const ServerStatus = memo(() => {
  const [status, setStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [lastCheck, setLastCheck] = useState(null);

  const checkServerStatus = async () => {
    try {
      setStatus('checking');
      
      // Пробуем разные эндпоинты для проверки доступности сервера
      const endpoints = ['/users/me', '/auth/check'];
      let serverOnline = false;
      
      for (const endpoint of endpoints) {
        try {
          await api.get(endpoint, { timeout: 8000 });
          serverOnline = true;
          break;
        } catch (error) {
          // Если получили ответ от сервера (даже ошибку) - сервер работает
          if (error.response && error.response.status) {
            serverOnline = true;
            break;
          }
          // Продолжаем проверку следующего эндпоинта
          continue;
        }
      }
      
      if (serverOnline) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
      
      setLastCheck(new Date());
    } catch (error) {
      console.log('Сервер недоступен:', error.message);
      setStatus('offline');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Проверяем статус при монтировании
    checkServerStatus();
    
    // Периодическая проверка каждые 30 секунд
    const interval = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          text: 'Сервер доступен',
          pulse: false
        };
      case 'offline':
        return {
          icon: WifiOff,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          text: 'Сервер недоступен',
          pulse: false
        };
      case 'checking':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          text: 'Проверка соединения...',
          pulse: true
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          text: 'Неизвестно',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${config.bgColor}`}>
      <Icon 
        size={12} 
        className={`${config.color} ${config.pulse ? 'animate-pulse' : ''}`} 
      />
      <span className={config.color}>
        {config.text}
      </span>
      {lastCheck && status !== 'checking' && (
        <span className="text-gray-400 text-xs">
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
});

ServerStatus.displayName = 'ServerStatus';

export default ServerStatus; 