import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../widgets';
import Sidebar from './ui/Sidebar';
import PersonalData from './ui/PersonalData';
import Contracts from './ui/Contracts';
import Settings from './ui/Settings';
import { useAuth } from '../../shared/context/AuthContext';
import Footer from '../../widgets/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PersonalAccountPage = () => {
  const [activeNav, setActiveNav] = useState('personal');
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // После завершения загрузки, проверяем аутентификацию
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Пока идет проверка аутентификации, показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-1">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        <main className="flex-1 flex flex-col items-start justify-center py-12 px-10 bg-white">
          {activeNav === 'personal' && <PersonalData />}
          {activeNav === 'contracts' && <Contracts />}
          {activeNav === 'settings' && <Settings />}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default PersonalAccountPage; 