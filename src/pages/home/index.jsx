import React from 'react';
import { Header } from '../../widgets';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
          
      {/* Пустая главная страница без контента */}
      <div className="flex-1"></div>
    </div>
  );
};

export default HomePage; 