import React, { memo } from 'react';
import { CHAT_STATUS } from '../model';

const ChatStatus = memo(({ status, isConnected, isReconnecting }) => {
  const getStatusText = () => {
    if (!isConnected) {
      return isReconnecting ? 'переподключение...' : 'не в сети';
    }
    
    switch (status) {
      case CHAT_STATUS.PENDING:
        return 'ожидание менеджера...';
      case CHAT_STATUS.ACTIVE:
        return 'менеджер онлайн';
      case CHAT_STATUS.CLOSED:
        return 'чат завершен';
      default:
        return 'менеджер';
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
      <div className={`w-[24px] h-[24px] bg-[#273655] rounded-[12px] flex items-center justify-center mr-3 status-indicator ${getStatusClass()}`}>
        <span className="text-white text-xs font-bold">ES</span>
      </div>
      <div>
        <h3 className="header-title text-[20px] font-normal leading-[26px] tracking-[1px] text-[#273655] capitalize">
          ExtraSpace
        </h3>
        <p className="text-[8px] font-normal leading-[10px] text-[#979797]">
          {getStatusText()}
        </p>
      </div>
    </div>
  );
});

ChatStatus.displayName = 'ChatStatus';

export default ChatStatus; 