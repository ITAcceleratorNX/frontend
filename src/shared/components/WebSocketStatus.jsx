import React, { memo } from 'react';
import { Wifi, WifiOff, AlertCircle, Loader } from 'lucide-react';

const WebSocketStatus = memo(({ isConnected, isReconnecting, className = '' }) => {
  const getStatusConfig = () => {
    if (isReconnecting) {
      return {
        icon: Loader,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        text: 'Переподключение...',
        animate: 'animate-spin'
      };
    }
    
    if (isConnected) {
      return {
        icon: Wifi,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        text: 'Подключен',
        animate: ''
      };
    }
    
    return {
      icon: WifiOff,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      text: 'Отключен',
      animate: ''
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${config.bgColor} ${className}`}>
      <Icon 
        size={12} 
        className={`${config.color} ${config.animate}`} 
      />
      <span className={config.color}>
        {config.text}
      </span>
    </div>
  );
});

WebSocketStatus.displayName = 'WebSocketStatus';

export default WebSocketStatus; 