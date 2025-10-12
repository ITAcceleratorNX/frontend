import React, { memo, useState } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import chatIcon from '../../../assets/chat_icon.png';
import ConfirmModal from '../../../shared/components/ConfirmModal';

const ChatMessage = memo(({ message, isFromUser, showAvatar = true, onDeleteMessage, currentUserId }) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Проверяем, является ли текущий пользователь автором сообщения
  // Приводим к числу для корректного сравнения
  const isOwnMessage = currentUserId && Number(message.sender_id) === Number(currentUserId);
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

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteMessage) {
      onDeleteMessage(message.id);
    }
  };

  if (isFromUser) {
    return (
      <>
        <div className="flex justify-end">
          <div 
            className="max-w-[370px] bg-[#fee2b2] rounded-[16px_16px_16px_0] p-4 group relative"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
          >
            <p className="text-[14px] font-normal leading-[20px] text-[#333131] whitespace-pre-line">
              {message.text}
            </p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[12px] font-normal leading-[17px] text-[#202224]">
                {formatTime(messageTime)}
              </span>
              <div className="flex items-center space-x-2">
                {showActions && onDeleteMessage && isOwnMessage && (
                  <button
                    onClick={handleDeleteClick}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    title="Удалить сообщение"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                )}
                <MoreHorizontal className="w-[15px] h-[3px] text-[#757575]" />
              </div>
            </div>
          </div>
        </div>

        {/* Модальное окно подтверждения удаления */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Удалить сообщение?"
          message="Это действие нельзя будет отменить. Сообщение будет удалено у всех участников чата."
          confirmText="Удалить"
          cancelText="Отмена"
          icon={Trash2}
        />
      </>
    );
  }

  return (
    <>
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
        <div 
          className="max-w-[720px] bg-[#f5f5f5] rounded-[16px_16px_16px_0] p-4 relative group"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <p className="text-[14px] font-normal leading-[26px] text-[#202224] whitespace-pre-line">
            {message.text}
          </p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[12px] font-normal leading-[17px] text-[#757575]">
              {formatTime(messageTime)}
            </span>
            {onDeleteMessage && isOwnMessage && (
              <button
                onClick={handleDeleteClick}
                className={`p-1 hover:bg-red-100 rounded transition-all ml-2 ${
                  showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="Удалить сообщение"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить сообщение?"
        message="Это действие нельзя будет отменить. Сообщение будет удалено у всех участников чата."
        confirmText="Удалить"
        cancelText="Отмена"
        icon={Trash2}
      />
    </>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage; 