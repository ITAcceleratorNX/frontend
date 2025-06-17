import { useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChatStore, USER_ROLES, CHAT_STATUS } from '../../../entities/chat/model';
import { chatApi } from '../../api/chatApi';

export const useUserChat = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    activeChat, 
    setActiveChat, 
    setChatStatus,
    setManagerId,
    setManagerName,
    isConnected 
  } = useChatStore();
  
  // Загрузка активного чата пользователя
  const loadUserChat = useCallback(async () => {
    if (!isAuthenticated || !user?.id || user.role === USER_ROLES.MANAGER) {
      return false;
    }
    
    try {
      const userChat = await chatApi.getUserChat();
      
      if (userChat) {
        // Устанавливаем активный чат
        setActiveChat({
          id: userChat.id,
          user_id: userChat.user_id,
          manager_id: userChat.manager_id,
          status: userChat.status
        });
        
        // Устанавливаем менеджера и его имя
        if (userChat.manager_id) {
          setManagerId(userChat.manager_id);
        }
        if (userChat.managerName) {
          setManagerName(userChat.managerName);
        }
        
        // Устанавливаем статус чата
        if (userChat.status === 'PENDING') {
          setChatStatus(CHAT_STATUS.PENDING);
        } else if (userChat.status === 'ACCEPTED') {
          setChatStatus(CHAT_STATUS.ACTIVE);
        }
        
        if (import.meta.env.DEV) {
          console.log('useUserChat: Загружен активный чат пользователя:', userChat);
        }
        
        return userChat;
      } else {
        // У пользователя нет активного чата
        setActiveChat(null);
        setChatStatus(CHAT_STATUS.IDLE);
        setManagerId(null);
        setManagerName(null);
        
        if (import.meta.env.DEV) {
          console.log('useUserChat: У пользователя нет активного чата');
        }
        
        return null;
      }
    } catch (error) {
      console.error('useUserChat: Ошибка при загрузке чата пользователя:', error);
      return false;
    }
  }, [isAuthenticated, user?.id, user?.role, setActiveChat, setChatStatus, setManagerId, setManagerName]);

  // Автоматическая загрузка чата при аутентификации и подключении
  useEffect(() => {
    if (isAuthenticated && isConnected && user?.role !== USER_ROLES.MANAGER) {
      loadUserChat();
    }
  }, [isAuthenticated, isConnected, user?.role, loadUserChat]);

  // Очистка чата при выходе пользователя
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveChat(null);
      setChatStatus(CHAT_STATUS.IDLE);
      setManagerId(null);
      setManagerName(null);
    }
  }, [isAuthenticated, setActiveChat, setChatStatus, setManagerId, setManagerName]);

  return {
    activeChat,
    loadUserChat,
    hasActiveChat: !!activeChat
  };
}; 