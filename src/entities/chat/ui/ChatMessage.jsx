import React, { memo, useState } from 'react';
import { MoreHorizontal, Trash2, Check, CheckCheck, Clock } from 'lucide-react';
import chatIcon from '../../../assets/chat_icon.png';
import ConfirmModal from '../../../shared/components/ConfirmModal';

const ChatMessage = memo(({ message, isFromUser, showAvatar = true, onDeleteMessage, currentUserId }) => {
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Проверяем, является ли текущий пользователь автором сообщения
  // Приводим к числу для корректного сравнения
  const isOwnMessage = currentUserId && Number(message.sender_id) === Number(currentUserId);
  
  // Отладочная информация
  if (import.meta.env.DEV) {
    console.log('ChatMessage: Отладка статуса сообщения:', {
      messageId: message.id,
      sender_id: message.sender_id,
      currentUserId: currentUserId,
      isOwnMessage: isOwnMessage,
      isFromUser: isFromUser,
      isTemporary: message.isTemporary,
      is_read: message.is_read,
      delivered_at: message.delivered_at
    });
  }
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

  // Определяем статус сообщения
  const getMessageStatus = () => {
    if (!isOwnMessage) {
      if (import.meta.env.DEV) {
        console.log('ChatMessage: Статус не показывается - не собственное сообщение');
      }
      return null; // Статус только для собственных сообщений
    }
    
    if (import.meta.env.DEV) {
      console.log('ChatMessage: Определяем статус для собственного сообщения:', {
        isTemporary: message.isTemporary,
        is_read: message.is_read,
        delivered_at: message.delivered_at
      });
    }
    
    // Если сообщение временное (отправляется)
    if (message.isTemporary) {
      return { icon: Clock, text: 'Отправляется', color: 'text-gray-400' };
    }
    
    // Если сообщение прочитано
    if (message.is_read) {
      return { icon: CheckCheck, text: 'Прочитано', color: 'text-blue-500' };
    }
    
    // Если сообщение доставлено, но не прочитано
    if (message.delivered_at) {
      return { icon: Check, text: 'Доставлено', color: 'text-gray-500' };
    }
    
    // По умолчанию - отправлено
    return { icon: Check, text: 'Отправлено', color: 'text-gray-400' };
  };

  const messageStatus = getMessageStatus();
  
  // Отладочная информация для статуса
  if (import.meta.env.DEV && isOwnMessage) {
    console.log('ChatMessage: Финальный статус сообщения:', {
      messageId: message.id,
      messageStatus: messageStatus,
      willShowStatus: !!messageStatus,
      statusIcon: messageStatus?.icon?.toString(),
      statusText: messageStatus?.text,
      statusColor: messageStatus?.color
    });
  }

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
              <div className="flex items-center space-x-1">
                <span className="text-[12px] font-normal leading-[17px] text-[#202224]">
                  {formatTime(messageTime)}
                </span>
                {messageStatus && (
                  <div className="flex items-center space-x-1" title={messageStatus.text}>
                    <messageStatus.icon className={`w-3 h-3 ${messageStatus.color}`} />
                  </div>
                )}
                {import.meta.env.DEV && isOwnMessage && !messageStatus && (
                  <span className="text-xs text-red-400 ml-1">
                    НЕТ СТАТУСА
                  </span>
                )}
              </div>
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
            <div className="flex items-center space-x-1">
              <span className="text-[12px] font-normal leading-[17px] text-[#757575]">
                {formatTime(messageTime)}
              </span>
              {messageStatus && (
                <div className="flex items-center space-x-1" title={messageStatus.text}>
                  <messageStatus.icon className={`w-3 h-3 ${messageStatus.color}`} />
                </div>
              )}
            </div>
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