import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/lib/hooks/use-auth';
import { 
  Phone, 
  Mail, 
  Menu, 
  X, 
  Camera,
  Upload,
  Search,
  Heart,
  Cloud,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Отслеживаем скролл для изменения навигации
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);
  
  const handleLogout = () => {
    logout();
    navigate('/email-verification');
  };
  
  const handleStartAuth = () => {
    navigate('/email-verification');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Навигация */}
      <nav 
        className={clsx(
          "fixed top-0 w-full py-4 px-4 md:px-10 z-50 transition-all duration-300",
          isScrolled ? "bg-white shadow-md" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Логотип */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-indigo-950 p-2 rounded-lg">
              <span className="text-white font-bold text-sm">
                <span className="block leading-tight">PHOTO</span>
                <span className="block leading-tight">PLACE</span>
              </span>
              <span className="ml-1 bg-yellow-400 text-indigo-950 font-bold text-xs px-1 rounded">24</span>
            </div>
          </div>
          
          {/* Десктопное меню */}
          <div className="hidden md:flex space-x-6 text-sm">
            <Link to="/" className="py-2 px-4 rounded-full bg-indigo-50 text-indigo-900 font-medium">
              ГЛАВНАЯ
            </Link>
            <Link to="#" className="py-2 text-indigo-950 font-medium hover:text-indigo-600 transition-colors">
              ОБ АРЕНДЕ СКЛАДОВ
            </Link>
            <Link to="#" className="py-2 text-indigo-950 font-medium hover:text-indigo-600 transition-colors">
              ОБЛАЧНОЕ ХРАНЕНИЕ
            </Link>
            <Link to="#" className="py-2 text-indigo-950 font-medium hover:text-indigo-600 transition-colors">
              МУВИНГ
            </Link>
            <Link to="#" className="py-2 text-indigo-950 font-medium hover:text-indigo-600 transition-colors">
              ТАРИФЫ
            </Link>
          </div>
          
          {/* Кнопки действий */}
          <div className="flex items-center space-x-2">
            {/* Кнопка входа/выхода */}
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="hidden md:block px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                ВЫЙТИ
              </button>
            ) : (
              <button
                onClick={handleStartAuth}
                className="hidden md:block px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                ВОЙТИ
              </button>
            )}
            
            {/* Иконки контактов */}
            <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-indigo-950">
              <Phone className="h-5 w-5" />
            </button>
            <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-indigo-950">
              <Mail className="h-5 w-5" />
            </button>
            
            {/* Мобильное меню */}
            <button 
              onClick={toggleMobileMenu}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-indigo-950"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 pt-20 px-4 md:hidden">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="py-3 px-4 rounded-lg bg-indigo-50 text-indigo-900 font-medium">
              ГЛАВНАЯ
            </Link>
            <Link to="#" className="py-3 border-b border-gray-100 text-indigo-950 font-medium">
              ОБ АРЕНДЕ СКЛАДОВ
            </Link>
            <Link to="#" className="py-3 border-b border-gray-100 text-indigo-950 font-medium">
              ОБЛАЧНОЕ ХРАНЕНИЕ
            </Link>
            <Link to="#" className="py-3 border-b border-gray-100 text-indigo-950 font-medium">
              МУВИНГ
            </Link>
            <Link to="#" className="py-3 border-b border-gray-100 text-indigo-950 font-medium">
              ТАРИФЫ
            </Link>
            
            <div className="flex space-x-4 py-3">
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-indigo-950">
                <Phone className="h-5 w-5" />
              </button>
              <button className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-indigo-950">
                <Mail className="h-5 w-5" />
              </button>
            </div>
            
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="mt-4 w-full py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                ВЫЙТИ
              </button>
            ) : (
              <button
                onClick={handleStartAuth}
                className="mt-4 w-full py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                ВОЙТИ
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Главная секция */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        {/* Фоновое изображение с паттерном */}
        <div className="absolute inset-0 z-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1565891741441-64926e441838?q=80&w=2064" 
            alt="Фон" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Левая колонка с текстом */}
            <div className="space-y-6 text-center lg:text-left">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold text-indigo-950 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                БЕРЕЖНОЕ <span className="text-indigo-600">ХРАНЕНИЕ</span>
                <br />
                ВАШИХ <span className="text-indigo-600">ФОТОГРАФИЙ</span>
              </motion.h1>
              
              <motion.p
                className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Надежное облачное хранилище для фотографий с дополнительной защитой 
                и удобной организацией по альбомам.
              </motion.p>
              
              <motion.div
                className="flex flex-wrap gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors">
                  НАЧАТЬ БЕСПЛАТНО
                </button>
                <button className="px-8 py-3 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-600 rounded-full transition-colors">
                  УЗНАТЬ БОЛЬШЕ
                </button>
              </motion.div>
              
              <motion.div
                className="pt-6 flex items-center justify-center lg:justify-start space-x-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-indigo-600">10GB</span>
                  <span className="text-sm text-gray-500">Бесплатно</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-indigo-600">100%</span>
                  <span className="text-sm text-gray-500">Безопасность</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-indigo-600">24/7</span>
                  <span className="text-sm text-gray-500">Поддержка</span>
                </div>
              </motion.div>
            </div>
            
            {/* Правая колонка с изображением */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1609619385002-f40f1df9b7eb?q=80&w=1974&auto=format&fit=crop"
                  alt="Хранение фотографий" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <Camera className="w-5 h-5 text-indigo-600 mr-2" />
                      <h3 className="text-lg font-semibold text-indigo-950">Все ваши фото в одном месте</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Загружайте, организуйте и делитесь своими фотографиями безопасно
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Плавающие элементы вокруг основного изображения */}
              <div className="absolute -top-5 -right-5 bg-white p-3 rounded-xl shadow-lg">
                <Upload className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="absolute top-1/4 -left-5 bg-white p-3 rounded-xl shadow-lg">
                <Search className="w-10 h-10 text-indigo-600" />
              </div>
              <div className="absolute bottom-10 -right-5 bg-white p-3 rounded-xl shadow-lg">
                <Heart className="w-10 h-10 text-pink-500" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Секция преимуществ */}
      <section className="py-20 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-indigo-950 mb-4">Почему выбирают нас</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Наше приложение обеспечивает надежное хранение, быстрый доступ и продвинутые 
              инструменты для работы с фотографиями
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Карточка 1 */}
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                <Cloud className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-indigo-950 mb-2">Надежное хранение</h3>
              <p className="text-gray-600">
                Все ваши фотографии надежно хранятся в зашифрованном виде на наших защищенных серверах
              </p>
              <button className="mt-4 inline-flex items-center text-indigo-600 font-medium text-sm">
                Подробнее <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
            
            {/* Карточка 2 */}
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-indigo-950 mb-2">Автозагрузка фото</h3>
              <p className="text-gray-600">
                Настройте автоматическую загрузку фотографий с вашего устройства для мгновенного резервного копирования
              </p>
              <button className="mt-4 inline-flex items-center text-indigo-600 font-medium text-sm">
                Подробнее <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
            
            {/* Карточка 3 */}
            <motion.div 
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-indigo-950 mb-2">Двухфакторная защита</h3>
              <p className="text-gray-600">
                Дополнительный уровень безопасности с двухфакторной аутентификацией для защиты ваших данных
              </p>
              <button className="mt-4 inline-flex items-center text-indigo-600 font-medium text-sm">
                Подробнее <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Секция с призывом к действию */}
      <section className="py-20 bg-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Начните хранить свои фотографии уже сегодня</h2>
          <p className="text-indigo-200 max-w-2xl mx-auto mb-8">
            Присоединяйтесь к тысячам пользователей, которые доверили нам 
            самые ценные воспоминания в виде фотографий
          </p>
          <button 
            onClick={handleStartAuth}
            className="px-8 py-3 bg-white text-indigo-900 hover:bg-indigo-50 rounded-full font-medium transition-colors"
          >
            СОЗДАТЬ АККАУНТ
          </button>
        </div>
      </section>
      
      {/* Футер */}
      <footer className="bg-indigo-950 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center bg-white p-2 rounded-lg">
                  <span className="text-indigo-950 font-bold text-sm">
                    <span className="block leading-tight">PHOTO</span>
                    <span className="block leading-tight">PLACE</span>
                  </span>
                  <span className="ml-1 bg-yellow-400 text-indigo-950 font-bold text-xs px-1 rounded">24</span>
                </div>
              </div>
              <p className="text-indigo-300 text-sm">
                Надежное и безопасное хранение ваших фотографий с продвинутыми инструментами организации
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">О нас</h3>
              <ul className="space-y-2 text-indigo-300">
                <li><Link to="#" className="hover:text-white transition-colors">О компании</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Блог</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Контакты</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Карьера</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Сервисы</h3>
              <ul className="space-y-2 text-indigo-300">
                <li><Link to="#" className="hover:text-white transition-colors">Облачное хранение</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Фотопечать</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Фотокниги</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Для бизнеса</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <ul className="space-y-2 text-indigo-300">
                <li className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +7 (123) 456-78-90</li>
                <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> info@photoplace.ru</li>
                <li>г. Москва, ул. Фотографов, д. 24</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-indigo-800 pt-8 text-center text-indigo-400 text-sm">
            <p>© 2023 PhotoPlace. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 