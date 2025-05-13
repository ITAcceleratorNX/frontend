import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { Button } from '../../shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../shared/ui/card';
import { LogOut, User, Mail, Calendar, X, Home, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button 
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
            onClick={onClose}
          >
            Отмена
          </button>
          <button 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
            onClick={onConfirm}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
};

const CabinetPage = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, user, isLoading } = useAuth();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutType, setLogoutType] = useState('');
  
  // Проверяем авторизацию пользователя
  useEffect(() => {
    console.log('CabinetPage: Проверка авторизации', {
      isAuthenticated,
      isLoading,
      user
    });
    
    if (!isAuthenticated && !isLoading) {
      console.log('CabinetPage: Пользователь не авторизован, перенаправляем на главную');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate, user, isLoading]);
  
  const handleLogoutToHome = () => {
    setLogoutType('home');
    setShowLogoutConfirm(true);
  };
  
  const handleLogoutToLogin = () => {
    setLogoutType('login');
    setShowLogoutConfirm(true);
  };
  
  const confirmLogout = async () => {
    console.log('CabinetPage: Выход из системы');
    await logout();
    
    if (logoutType === 'home') {
      toast.success('Вы успешно вышли из аккаунта');
      navigate('/', { replace: true });
    } else {
      toast.success('Вы успешно вышли из аккаунта');
      navigate('/login', { replace: true });
    }
    
    setShowLogoutConfirm(false);
  };
  
  const handleReturnHome = () => {
    navigate('/');
  };
  
  // Если пользователь не авторизован, ничего не рендерим (будет редирект)
  if (!isAuthenticated || isLoading) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#273551]">ЛИЧНЫЙ КАБИНЕТ</h1>
        <button
          onClick={handleReturnHome}
          className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          title="Вернуться на главную"
        >
          <X size={20} className="text-gray-700" />
        </button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Левая колонка - навигация */}
        <div className="md:col-span-1">
          <Card className="shadow-md">
            <CardHeader className="bg-[#F8F9FA] border-b">
              <CardTitle className="text-xl font-semibold text-[#273551]">Меню</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                <button className="text-left px-6 py-4 border-b hover:bg-purple-50 flex items-center gap-2 bg-purple-50">
                  <User size={18} className="text-[#273551]" />
                  <span className="font-medium">Личные данные</span>
                </button>
                <button className="text-left px-6 py-4 border-b hover:bg-purple-50 flex items-center gap-2">
                  <Calendar size={18} className="text-[#273551]" />
                  <span>История заказов</span>
                </button>
                <button
                  onClick={handleLogoutToHome}
                  className="text-left px-6 py-4 text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={18} />
                  <span>Выйти</span>
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Правая колонка - личные данные */}
        <div className="md:col-span-2">
          <Card className="shadow-md">
            <CardHeader className="bg-[#F8F9FA] border-b">
              <CardTitle className="text-xl font-semibold text-[#273551]">ЛИЧНЫЕ ДАННЫЕ</CardTitle>
              <CardDescription>Информация о вашей учетной записи</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-32 h-32 rounded-full bg-[#FEE2B2] flex items-center justify-center">
                    <User size={64} className="text-[#273551]" />
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-medium">Email</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail size={16} className="text-gray-500" />
                      <span className="text-lg font-medium">
                        {user?.email || 'user@example.com'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-medium">Имя пользователя</span>
                    <div className="flex items-center gap-2 mt-1">
                      <User size={16} className="text-gray-500" />
                      <span className="text-lg font-medium">
                        {user?.name || 'Пользователь'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex space-x-3">
                    <Button
                      onClick={handleReturnHome}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Home size={16} className="mr-2" />
                      На главную
                    </Button>
                    
                    <Button
                      onClick={handleLogoutToLogin}
                      variant="destructive"
                      className="w-full sm:w-auto bg-[#C73636] hover:bg-red-700"
                    >
                      <LogOut size={16} className="mr-2" />
                      Выйти из аккаунта
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ConfirmDialog 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Подтверждение выхода"
        message="Вы действительно хотите выйти из аккаунта?"
      />
    </div>
  );
};

export default CabinetPage; 