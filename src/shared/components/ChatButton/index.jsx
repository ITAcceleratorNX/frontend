import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ChatButton = memo(({ className = '', position = 'fixed' }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    if (isAuthenticated) {
      // Если пользователь авторизован, перенаправляем в личный кабинет на раздел чата
      navigate('/personal-account', { state: { activeSection: 'chat' } });
    } else {
      // Если не авторизован, перенаправляем на страницу входа
      navigate('/login');
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
        bg-[#273655] hover:bg-[#1e2c4f] 
        text-white 
        rounded-full 
        shadow-lg hover:shadow-xl 
        transition-all duration-300 
        flex items-center justify-center
        hover:scale-110
        group
        ${className}
      `}
      aria-label="Открыть чат"
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