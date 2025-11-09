import React, { memo } from 'react';
import { MessageCircle } from 'lucide-react';

const ChatButton = memo(({ className = '', position = 'fixed' }) => {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.open('https://wa.me/77088241384', '_blank', 'noopener,noreferrer');
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