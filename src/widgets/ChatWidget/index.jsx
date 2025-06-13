import React, { memo } from 'react';
import { ChatWindow } from '../../features/chat';
import './styles.css';

const ChatWidget = memo(({ className = '' }) => {
  return (
    <ChatWindow className={className} />
  );
});

ChatWidget.displayName = 'ChatWidget';

export default ChatWidget;