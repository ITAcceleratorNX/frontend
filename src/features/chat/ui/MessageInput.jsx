import React, { memo, useState, useRef, useCallback } from 'react';
import { Send, Paperclip } from 'lucide-react';

const MessageInput = memo(({ 
  onSend, 
  disabled = false, 
  placeholder = "Напишите сообщение...",
  className = ""
}) => {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

  // Автоматическое изменение высоты textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, []);

  // Обработка изменения текста
  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  // Обработка отправки сообщения
  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || disabled || !onSend) {
      return;
    }

    const success = onSend(trimmedMessage);
    if (success !== false) {
      setMessage('');
      // Сбрасываем высоту после отправки
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }, 0);
    }
  }, [message, disabled, onSend]);

  // Обработка нажатия клавиш
  const handleKeyDown = useCallback((e) => {
    // Если пользователь не в процессе ввода (IME) и нажал Enter без Shift
    if (!isComposing && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [isComposing, handleSend]);

  // Обработка начала/конца ввода (для IME)
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  return (
    <div className={`p-4 border-t border-[#e0e0e0] bg-white ${className}`}>
      <div className="flex items-end space-x-3">
        {/* Кнопка прикрепления (пока неактивна) */}
        <button
          type="button"
          disabled
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 cursor-not-allowed"
          title="Прикрепить файл (скоро)"
        >
          <Paperclip size={20} />
        </button>

        {/* Поле ввода */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`
              w-full resize-none rounded-[20px] border border-[#e0e0e0] 
              px-4 py-3 pr-12 text-[14px] leading-[20px] 
              placeholder-[#757575] focus:outline-none focus:border-[#263554] 
              transition-colors min-h-[50px] max-h-[120px]
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
            `}
            style={{ overflowY: 'auto' }}
          />
          
          {/* Счетчик символов (показываем при приближении к лимиту) */}
          {message.length > 200 && (
            <div className="absolute -top-6 right-0 text-xs text-gray-500">
              {message.length}/500
            </div>
          )}
        </div>

        {/* Кнопка отправки */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className={`
            flex-shrink-0 w-10 h-10 flex items-center justify-center 
            rounded-full transition-all duration-200
            ${disabled || !message.trim() 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-[#263554] text-white hover:bg-[#1e2c4f] hover:scale-105 active:scale-95'
            }
          `}
          title="Отправить сообщение"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Подсказка для быстрых действий */}
      {!disabled && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          <span>Enter - отправить, Shift+Enter - новая строка</span>
        </div>
      )}
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export { MessageInput }; 