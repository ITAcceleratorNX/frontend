import React, { memo, useState } from 'react';
import { Send } from 'lucide-react';

const MessageInput = memo(({ 
  onSend, 
  disabled = false, 
  placeholder = "Напишите сообщение...",
  className = '' 
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
    <div className={`border-t border-gray-200 p-3 bg-white ${className}`}>
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={`
              w-full px-3 py-2 border border-gray-300 rounded-lg resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder-gray-400 text-sm leading-5 min-h-[40px] max-h-[120px]
              ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'}
            `}
            style={{
              height: 'auto',
              minHeight: '40px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`
            p-2 rounded-lg transition-all duration-200 flex items-center justify-center
            ${disabled || !message.trim() 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
            }
          `}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export { MessageInput }; 