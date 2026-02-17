import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../widgets';
import Footer from '../../widgets/Footer';
import { CheckCircle } from 'lucide-react';

const ThankYouPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full text-center">
          {/* Иконка успеха */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Заголовок */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e2c4f] mb-4">
            Спасибо за заявку!
          </h1>

          {/* Описание */}
          <p className="text-gray-600 text-lg mb-3">
            Ваша заявка успешно отправлена!
          </p>
          <p className="text-gray-500 text-base mb-8">
            Наши менеджеры уже получили вашу заявку и свяжутся с вами в ближайшее время, чтобы обсудить все детали и ответить на вопросы.
          </p>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border bg-[#31876D] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              На главную
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYouPage;
