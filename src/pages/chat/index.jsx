import React, { memo } from 'react';
import { Header } from '../../widgets';
import ChatWidget from '../../widgets/ChatWidget';
import Footer from '../../widgets/Footer';

const ChatPage = memo(() => {
  if (import.meta.env.DEV) {
    console.log('Рендеринг компонента ChatPage');
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#273655] mb-2">Чат поддержки</h1>
            <p className="text-gray-600">Свяжитесь с нашими менеджерами для получения помощи</p>
          </div>
          
          <ChatWidget />
        </div>
      </div>
      
      <Footer />
    </div>
  );
});

ChatPage.displayName = 'ChatPage';

export default ChatPage; 