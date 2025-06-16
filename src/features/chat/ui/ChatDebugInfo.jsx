import React, { memo } from 'react';
import { useChat } from '../../../shared/lib/hooks/use-chat';
import { useChatMessages } from '../../../shared/lib/hooks/use-chat-messages';
import { useAuth } from '../../../shared/context/AuthContext';
import { useChatStore } from '../../../entities/chat/model';

const ChatDebugInfo = memo(() => {
  const { user, isAuthenticated } = useAuth();
  const { 
    chatStatus, 
    isConnected, 
    activeChat, 
    canSendMessage, 
    canStartChat, 
    isManager 
  } = useChat();
  
  const { messages, groupedMessages } = useChatMessages(activeChat?.id);
  
  // Дополнительное состояние из store
  const { managerId, newChatNotifications } = useChatStore();

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm z-50 font-mono">
      <h4 className="font-bold mb-3 text-yellow-400">🐛 Chat Debug Info</h4>
      
      <div className="space-y-1">
        <div><strong className="text-blue-300">User:</strong> {user?.id} ({user?.role})</div>
        <div><strong className="text-blue-300">Authenticated:</strong> <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>{isAuthenticated ? '✅' : '❌'}</span></div>
        <div><strong className="text-blue-300">Connected:</strong> <span className={isConnected ? 'text-green-400' : 'text-red-400'}>{isConnected ? '✅' : '❌'}</span></div>
        <div><strong className="text-blue-300">Is Manager:</strong> <span className={isManager ? 'text-green-400' : 'text-gray-400'}>{isManager ? '✅' : '❌'}</span></div>
        <div><strong className="text-blue-300">Chat Status:</strong> <span className="text-yellow-400">{chatStatus}</span></div>
        <div><strong className="text-blue-300">Active Chat ID:</strong> <span className="text-yellow-400">{activeChat?.id || 'None'}</span></div>
        <div><strong className="text-blue-300">Manager ID:</strong> <span className="text-yellow-400">{managerId || activeChat?.manager_id || 'None'}</span></div>
        <div><strong className="text-blue-300">Can Start Chat:</strong> <span className={canStartChat ? 'text-green-400' : 'text-red-400'}>{canStartChat ? '✅' : '❌'}</span></div>
        <div><strong className="text-blue-300">Can Send Message:</strong> <span className={canSendMessage ? 'text-green-400' : 'text-red-400'}>{canSendMessage ? '✅' : '❌'}</span></div>
        <div><strong className="text-blue-300">Messages Count:</strong> <span className="text-green-400">{messages.length}</span></div>
        <div><strong className="text-blue-300">Grouped Count:</strong> <span className="text-green-400">{groupedMessages.length}</span></div>
        {isManager && (
          <div><strong className="text-blue-300">Notifications:</strong> <span className="text-orange-400">{newChatNotifications.length}</span></div>
        )}
      </div>
      
      {activeChat && (
        <details className="mt-3 pt-2 border-t border-gray-600">
          <summary className="cursor-pointer text-yellow-400 font-bold">Active Chat Details</summary>
          <pre className="text-xs overflow-auto max-h-24 mt-1 text-gray-300">
            {JSON.stringify(activeChat, null, 2)}
          </pre>
        </details>
      )}
      
      {messages.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-yellow-400 font-bold">Last Message</summary>
          <pre className="text-xs overflow-auto max-h-20 mt-1 text-gray-300">
            {JSON.stringify(messages[messages.length - 1], null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
});

ChatDebugInfo.displayName = 'ChatDebugInfo';

export { ChatDebugInfo }; 