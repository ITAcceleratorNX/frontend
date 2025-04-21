import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/lib/hooks/use-auth';

// Заглушки иконок, которые будут использоваться по умолчанию
const DefaultPhoneIcon = (props) => <span className="inline-block">📞</span>;
const DefaultMailIcon = (props) => <span className="inline-block">✉️</span>;
const DefaultMenuIcon = (props) => <span className="inline-block">☰</span>;
const DefaultXIcon = (props) => <span className="inline-block">✕</span>;

const HomePage = () => {
  console.log('Рендеринг HomePage компонента');
  
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Используем useMemo для начальных значений иконок
  const [icons, setIcons] = useState(() => ({
    Phone: DefaultPhoneIcon,
    Mail: DefaultMailIcon,
    Menu: DefaultMenuIcon,
    X: DefaultXIcon
  }));

  // Логируем состояние аутентификации при монтировании и изменении
  useEffect(() => {
  console.log('HomePage: статус аутентификации =', isAuthenticated ? 'авторизован' : 'не авторизован');
  }, [isAuthenticated]);

  // Загружаем иконки асинхронно при монтировании компонента
  useEffect(() => {
    console.log('HomePage: загрузка иконок (только при монтировании)');
    
    let mounted = true; // Флаг для предотвращения обновления размонтированного компонента
    
    const loadIcons = async () => {
      try {
        const lucide = await import('lucide-react');
        
        // Проверяем, что компонент все еще смонтирован
        if (mounted) {
          console.log('HomePage: иконки успешно загружены');
          setIcons({
            Phone: lucide.Phone,
            Mail: lucide.Mail,
            Menu: lucide.Menu,
            X: lucide.X
          });
        }
      } catch (error) {
        console.error('HomePage: ошибка при загрузке иконок:', error);
      }
    };

    loadIcons();
    
    // Функция очистки, которая запустится при размонтировании
    return () => {
      mounted = false;
    };
  }, []); // Пустой массив зависимостей = выполнить только при монтировании

  // Мемоизированная функция переключения мобильного меню
  const toggleMobileMenu = useMemo(() => {
    return () => setMobileMenuOpen(prevState => !prevState);
  }, []);

  // Мемоизированная функция выхода из системы
  const handleLogout = useMemo(() => {
    return () => {
    console.log('HomePage: выполняется выход из системы');
    logout();
    console.log('HomePage: перенаправление на страницу проверки email');
    navigate('/email-verification');
  };
  }, [logout, navigate]);

  // Мемоизированная функция начала авторизации
  const handleStartAuth = useMemo(() => {
    return () => {
    console.log('HomePage: перенаправление на страницу проверки email для входа');
    navigate('/email-verification');
  };
  }, [navigate]);

  // Деструктуризация для удобства
  const { Phone, Mail, Menu, X } = icons;

  return (
    <div className="min-h-screen bg-white relative">
      {/* Фоновое изображение */}
      <div className="absolute inset-0 z-0 opacity-30 bg-cover bg-center" 
           style={{backgroundImage: `url('https://images.unsplash.com/photo-1580674285054-bed31e145f59?q=80&w=2070')`}} />

      <nav className="px-4 py-4 flex items-center justify-between bg-white/80 shadow-sm relative z-10">
        <div className="flex items-center space-x-8">
          <div className="text-2xl font-bold text-[#1e2c4f]">ExtraSpace</div>
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-[#1e2c4f] font-medium">ГЛАВНАЯ</Link>
            <Link to="#" className="text-gray-700 hover:text-[#1e2c4f] font-medium">ОБ АРЕНДЕ СКЛАДОВ</Link>
            <Link to="#" className="text-gray-700 hover:text-[#1e2c4f] font-medium">ОБЛАЧНОЕ ХРАНЕНИЕ</Link>
            <Link to="#" className="text-gray-700 hover:text-[#1e2c4f] font-medium">МУВИНГ</Link>
            <Link to="#" className="text-gray-700 hover:text-[#1e2c4f] font-medium">ТАРИФЫ</Link>
              </div>
            </div>
            
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <Phone className="h-5 w-5 text-[#1e2c4f]" />
            <Mail className="h-5 w-5 text-[#1e2c4f]" />
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-[#1e2c4f] focus:outline-none"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
          
          <div className="hidden md:block">
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout} 
                className="px-6 py-2 bg-[#d64b4b] text-white rounded-full hover:bg-[#c43d3d] transition-colors"
                >
                  Выйти
                </button>
              ) : (
                <button 
                  onClick={handleStartAuth} 
                className="px-6 py-2 bg-[#d64b4b] text-white rounded-full hover:bg-[#c43d3d] transition-colors"
                >
                  ВОЙТИ
                </button>
              )}
            </div>
        </div>
      </nav>
      
      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white p-4 shadow-md relative z-20">
          <div className="flex flex-col space-y-3">
            <Link to="/" className="text-gray-700 hover:text-[#1e2c4f] font-medium py-2">ГЛАВНАЯ</Link>
            <Link to="#" className="text-gray-700 hover:text-[#1e2c4f] font-medium py-2">ОБ АРЕНДЕ СКЛАДОВ</Link>
            <Link to="#" className="text-gray-700 hover:text-[#1e2c4f] font-medium py-2">ОБЛАЧНОЕ ХРАНЕНИЕ</Link>
            <Link to="#" className="text-gray-700 hover:text-[#1e2c4f] font-medium py-2">МУВИНГ</Link>
            <Link to="#" className="text-gray-700 hover:text-[#1e2c4f] font-medium py-2">ТАРИФЫ</Link>
            
            <div className="flex space-x-4 py-2">
              <Phone className="h-5 w-5 text-[#1e2c4f]" />
              <Mail className="h-5 w-5 text-[#1e2c4f]" />
              </div>
              
            {isAuthenticated ? (
              <button 
                onClick={handleLogout} 
                className="w-full px-6 py-2 bg-[#d64b4b] text-white rounded-full hover:bg-[#c43d3d] transition-colors"
              >
                Выйти
              </button>
            ) : (
              <button 
                onClick={handleStartAuth} 
                className="w-full px-6 py-2 bg-[#d64b4b] text-white rounded-full hover:bg-[#c43d3d] transition-colors"
              >
                ВОЙТИ
              </button>
            )}
                  </div>
                </div>
      )}

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-[#1e2c4f] leading-tight">
            БЕРЕЖНОЕ ХРАНЕНИЕ
            <br />
            <span className="relative">
              ВАШИХ ВЕЩЕЙ
            </span>
          </h1>
          
          <div className="bg-[#1e2c4f] text-white px-8 py-3 rounded-full inline-block">
            Теплые склады с охраной от 3 м²
                </div>
                
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1565891741441-64926e441838?q=80&w=2064" 
                alt="Хранение вещей" 
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">Индивидуальные боксы</h3>
                <p className="text-gray-600">Боксы разных размеров для хранения ваших вещей</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1605942170958-3770c73ffd2a?q=80&w=2030" 
                alt="Охраняемый склад" 
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">Охраняемый склад</h3>
                <p className="text-gray-600">Круглосуточная охрана и видеонаблюдение</p>
              </div>
              </div>
              
            <div className="bg-white p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105">
              <img 
                src="https://images.unsplash.com/photo-1610752444890-66759608d1e9?q=80&w=2070" 
                alt="Переезд" 
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">Помощь с переездом</h3>
                <p className="text-gray-600">Грузчики и транспорт для комфортного переезда</p>
              </div>
              </div>
            </div>
            
          <div className="mt-12">
            <button className="px-8 py-3 bg-[#d64b4b] text-white rounded-full hover:bg-[#c43d3d] transition-colors">
                Узнать больше
              </button>
            </div>
          </div>
      </main>
      
      {/* Футер */}
      <footer className="bg-[#1e2c4f] text-white py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">ExtraSpace</h3>
              <p className="text-gray-300">Надежное хранение ваших вещей в любое время года</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <p className="text-gray-300">Телефон: +7 (123) 456-78-90</p>
              <p className="text-gray-300">Email: info@extraspace.ru</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Адрес</h3>
              <p className="text-gray-300">г. Москва, ул. Складская, д. 10</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Режим работы</h3>
              <p className="text-gray-300">Пн-Пт: 9:00 - 20:00</p>
              <p className="text-gray-300">Сб-Вс: 10:00 - 18:00</p>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center">
            <p className="text-gray-300">© 2023 ExtraSpace. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 