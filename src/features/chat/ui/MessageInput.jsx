import React, { memo, useState } from 'react';
import { Send } from 'lucide-react';

const MessageInput = memo(({ 
  onSend, 
  disabled = false, 
  placeholder = "Напишите сообщение...",
  className = '',
  isMobile = false
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && onSend) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`
      border-t border-gray-200 bg-white
      ${isMobile ? 'p-4' : 'p-3'} ${className}
    `}>
      <div className={`flex items-end ${isMobile ? 'space-x-3' : 'space-x-2'}`}>
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={`
              w-full border border-gray-300 rounded-lg resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder-gray-400 leading-5
              ${isMobile 
                ? 'px-4 py-3 text-base min-h-[48px] max-h-[144px]' 
                : 'px-3 py-2 text-sm min-h-[40px] max-h-[120px]'
              }
              ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}
            `}
            style={{
              height: 'auto',
              minHeight: isMobile ? '48px' : '40px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              const maxHeight = isMobile ? 144 : 120;
              e.target.style.height = Math.min(e.target.scrollHeight, maxHeight) + 'px';
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`
            rounded-lg transition-all duration-200 flex items-center justify-center
            ${isMobile 
              ? 'p-3 min-w-[48px] min-h-[48px]' 
              : 'p-2 min-w-[36px] min-h-[36px]'
            }
            ${disabled || !message.trim() 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-[#1e2c4f] text-white hover:bg-[#162540] shadow-sm hover:shadow-md'
            }
          `}
        >
          <Send className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
        </button>
      </div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export { MessageInput }; 