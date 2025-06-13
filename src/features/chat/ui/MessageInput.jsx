import React, { memo, useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Mic, Smile } from 'lucide-react';
import { toast } from 'react-toastify';

const MessageInput = memo(({ 
  onSend, 
  disabled = false, 
  placeholder = 'Написать сообщение...' 
}) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // Отправка сообщения
  const handleSend = useCallback(() => {
    if (!message.trim() || disabled) return;
    
    const success = onSend(message.trim());
    if (success) {
      setMessage('');
    }
  }, [message, disabled, onSend]);

  // Обработка нажатия Enter
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Обработка выбора файла
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (import.meta.env.DEV) {
        console.log('MessageInput: Файл выбран:', file.name);
      }
      // TODO: Добавить логику загрузки файла
      toast.info(`Файл ${file.name} выбран (функция загрузки будет добавлена позже)`);
    }
  }, []);

  // Обработка записи голоса
  const handleVoiceRecord = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('MessageInput: Запись голоса');
    }
    // TODO: Добавить логику записи голоса
    toast.info('Функция записи голоса будет добавлена позже');
  }, []);

  // Обработка выбора эмодзи
  const handleEmojiSelect = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('MessageInput: Выбор эмодзи');
    }
    // TODO: Добавить логику выбора эмодзи
    toast.info('Функция выбора эмодзи будет добавлена позже');
  }, []);

  return (
    <div className="border-t border-[#e0e0e0] p-4">
      <div className="flex items-center space-x-3">
        {/* Кнопка прикрепления файла */}
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="icon-btn text-[#757575] hover:text-[#263554] transition-colors p-2 rounded-md hover:bg-gray-100"
          disabled={disabled}
        >
          <Paperclip className="w-[21px] h-[13px]" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx"
        />
        
        {/* Поле ввода сообщения */}
        <div className="flex-1">
          <input
            type="text"
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="w-full border-none focus:ring-0 text-[16px] font-normal leading-[22px] text-[#333] placeholder-[#9d9d9d] outline-none bg-transparent"
          />
        </div>
        
        {/* Кнопка записи голоса */}
        <button 
          onClick={handleVoiceRecord}
          className="icon-btn text-[#757575] hover:text-[#263554] transition-colors p-2 rounded-md hover:bg-gray-100"
          disabled={disabled}
        >
          <Mic className="w-[21px] h-[17px]" />
        </button>
        
        {/* Кнопка эмодзи */}
        <button 
          onClick={handleEmojiSelect}
          className="icon-btn text-[#757575] hover:text-[#263554] transition-colors p-2 rounded-md hover:bg-gray-100"
          disabled={disabled}
        >
          <Smile className="w-[21px] h-[14px]" />
        </button>
        
        {/* Кнопка отправки */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="send-btn bg-[#263554] text-white px-6 py-2 rounded-[6px] flex items-center space-x-2 hover:bg-[#1e2a42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-[12px] font-semibold leading-[17px]">
            Отправить
          </span>
          <Send className="w-[14px] h-[12px]" />
        </button>
      </div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export { MessageInput }; 