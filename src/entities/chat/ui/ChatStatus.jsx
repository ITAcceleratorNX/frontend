import React, { memo } from 'react';
import { CHAT_STATUS } from '../model';
import { useDeviceType } from '../../../shared/lib/hooks/useWindowWidth';
import chatIcon from '../../../assets/chat_icon.png';

const ChatStatus = memo(({ status, isConnected, isReconnecting, managerName }) => {
  const { isMobile } = useDeviceType();
  const getStatusText = () => {
    if (!isConnected) {
      return isReconnecting ? 'Переподключение...' : 'Не в сети';
    }
    
    switch (status) {
      case CHAT_STATUS.PENDING:
        return 'создание чата...';
      case CHAT_STATUS.ACTIVE:
        return managerName ? `Менеджер: ${managerName}` : 'Менеджер онлайн';
      case CHAT_STATUS.CLOSED:
        return 'Чат завершен';
      default:
        return 'Менеджер';
    }
  };

  const getStatusClass = () => {
    if (!isConnected) {
      return isReconnecting ? 'status-reconnecting' : 'status-offline';
    }
    
    switch (status) {
      case CHAT_STATUS.PENDING:
        return 'status-pending';
      case CHAT_STATUS.ACTIVE:
        return 'status-online';
      case CHAT_STATUS.CLOSED:
        return 'status-offline';
      default:
        return 'status-online';
    }
  };

  return (
    <div className="flex items-center">
      <div className={`
        rounded-full flex items-center justify-center status-indicator overflow-hidden
        ${isMobile ? 'w-[20px] h-[20px] mr-2' : 'w-[24px] h-[24px] mr-3'}
        ${getStatusClass()}
      `}>
        <img 
          src={chatIcon} 
          alt="ExtraSpace" 
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h3 className={`
          header-title font-normal tracking-[1px] text-[#1e2c4f] capitalize
          ${isMobile 
            ? 'text-[16px] leading-[20px]' 
            : 'text-[20px] leading-[26px]'
          }
        `}>
          ExtraSpace
        </h3>
        <h3 className={`
          font-normal text-[#1e2c4f]
          ${isMobile 
            ? 'text-[9px] leading-[9px]' 
            : 'text-[10px] leading-[10px]'
          }
        `}>
          {getStatusText()}
        </h3>
      </div>
    </div>
  );
});

ChatStatus.displayName = 'ChatStatus';

export default ChatStatus; 