import React, { memo } from 'react';
import { CHAT_STATUS } from '../model';
import chatIcon from '../../../assets/chat_icon.png';

const ChatStatus = memo(({ status, isConnected, isReconnecting, managerName }) => {
  const getStatusText = () => {
    if (!isConnected) {
      return isReconnecting ? 'Переподключение...' : 'Не в сети';
    }
    
    switch (status) {
      case CHAT_STATUS.PENDING:
        return 'ожидание менеджера...';
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
      <div className={`w-[24px] h-[24px] rounded-[12px] flex items-center justify-center mr-3 status-indicator overflow-hidden ${getStatusClass()}`}>
        <img 
          src={chatIcon} 
          alt="ExtraSpace" 
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h3 className="header-title text-[20px] font-normal leading-[26px] tracking-[1px] text-[#1e2c4f] capitalize">
          ExtraSpace
        </h3>
        <h3 className="text-[10px] font-normal leading-[10px] text-[#1e2c4f]">
          {getStatusText()}
        </h3>
      </div>
    </div>
  );
});

ChatStatus.displayName = 'ChatStatus';

export default ChatStatus; 