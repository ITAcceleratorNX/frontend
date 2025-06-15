import React, { memo } from 'react';
import { useChat } from '../../../shared/lib/hooks/use-chat';
import { useChatMessages } from '../../../shared/lib/hooks/use-chat-messages';
import { useAuth } from '../../../shared/context/AuthContext';

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

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h4 className="font-bold mb-2">🐛 Chat Debug Info</h4>
      
      <div className="space-y-1">
        <div><strong>User:</strong> {user?.id} ({user?.role})</div>
        <div><strong>Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}</div>
        <div><strong>Connected:</strong> {isConnected ? '✅' : '❌'}</div>
        <div><strong>Is Manager:</strong> {isManager ? '✅' : '❌'}</div>
        <div><strong>Chat Status:</strong> {chatStatus}</div>
        <div><strong>Active Chat:</strong> {activeChat?.id || 'None'}</div>
        <div><strong>Can Start Chat:</strong> {canStartChat ? '✅' : '❌'}</div>
        <div><strong>Can Send Message:</strong> {canSendMessage ? '✅' : '❌'}</div>
        <div><strong>Messages Count:</strong> {messages.length}</div>
        <div><strong>Grouped Messages:</strong> {groupedMessages.length}</div>
      </div>
      
      {activeChat && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div><strong>Active Chat Details:</strong></div>
          <pre className="text-xs overflow-auto max-h-20">
            {JSON.stringify(activeChat, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
});

ChatDebugInfo.displayName = 'ChatDebugInfo';

export { ChatDebugInfo }; 