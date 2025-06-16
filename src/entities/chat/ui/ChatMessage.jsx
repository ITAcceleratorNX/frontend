import React, { memo } from 'react';

const ChatMessage = memo(({ message, isFromUser, showAvatar = true }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp || Date.now()).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isFromUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[370px] bg-[#fee2b2] rounded-[16px_16px_16px_0] p-4">
          <p className="text-[14px] font-normal leading-[20px] text-[#333131] whitespace-pre-line">
            {message.text}
          </p>
          <div className="mt-2 text-right">
            <span className="text-[12px] font-normal leading-[17px] text-[#202224]">
              {formatTime(message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <div className="max-w-[720px] bg-[#f5f5f5] rounded-[16px_16px_16px_0] p-4">
        <p className="text-[14px] font-normal leading-[26px] text-[#202224] whitespace-pre-line">
          {message.text}
        </p>
        <div className="text-right mt-2">
          <span className="text-[12px] font-normal leading-[17px] text-[#757575]">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage; 