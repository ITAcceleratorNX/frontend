import React, { memo } from 'react';
import { MessageCircle } from 'lucide-react';
import {TEL_LINK} from "/src/shared/components/CallbackRequestModal.jsx";

const ChatButton = memo(({ className = '', position = 'fixed' }) => {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      const phoneNumber = TEL_LINK.substring(5); // Убираем "tel:" префикс
      const message = encodeURIComponent('Здравствуйте! Хочу забронировать бокс.');
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
    }
  };

  const positionClasses = position === 'fixed' 
    ? 'fixed bottom-6 right-6' 
    : 'relative';

  return (
    <button
      onClick={handleClick}
      className={`
        ${positionClasses}
        z-50 
        w-14 h-14 
        bg-[#25D366] hover:bg-[#1fb65a] 
        text-white 
        rounded-full 
        shadow-lg hover:shadow-xl 
        transition-all duration-300 
        flex items-center justify-center
        hover:scale-110
        group
        ${className}
      `}
      aria-label="Написать в WhatsApp"
    >
      <MessageCircle 
        size={24} 
        className="transition-transform duration-300 group-hover:scale-110" 
      />
    </button>
  );
});

ChatButton.displayName = 'ChatButton';

export default ChatButton; 