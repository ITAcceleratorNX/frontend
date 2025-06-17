import React, { memo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import chatIcon from '../../../assets/chat_icon.png';

const ChatMessage = memo(({ message, isFromUser, showAvatar = true }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    // Используем created_at в ISO формате из API
    const messageDate = new Date(timestamp);
    
    // Проверяем валидность даты
    if (isNaN(messageDate.getTime())) {
      if (import.meta.env.DEV) {
        console.warn('ChatMessage: Invalid date format:', timestamp);
      }
      return '';
    }
    
    // Возвращаем только время в формате HH:mm
    return messageDate.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Используем created_at из API (ISO формат)
  const messageTime = message.created_at;

  if (isFromUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[370px] bg-[#fee2b2] rounded-[16px_16px_16px_0] p-4">
          <p className="text-[14px] font-normal leading-[20px] text-[#333131] whitespace-pre-line">
            {message.text}
          </p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[12px] font-normal leading-[17px] text-[#202224]">
              {formatTime(messageTime)}
            </span>
            <MoreHorizontal className="w-[15px] h-[3px] text-[#757575]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      {showAvatar && (
        <div className="w-[40px] h-[40px] rounded-[15px] flex items-center justify-center mt-2 overflow-hidden">
          <img 
            src={chatIcon} 
            alt="Chat" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="max-w-[720px] bg-[#f5f5f5] rounded-[16px_16px_16px_0] p-4">
        <p className="text-[14px] font-normal leading-[26px] text-[#202224] whitespace-pre-line">
          {message.text}
        </p>
        <div className="text-right mt-2">
          <span className="text-[12px] font-normal leading-[17px] text-[#757575]">
            {formatTime(messageTime)}
          </span>
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage; 