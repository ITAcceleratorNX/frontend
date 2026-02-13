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
            Ваш заказ успешно создан.
          </p>
          <p className="text-gray-500 text-base mb-8">
            СМС от TrustMe для подписания договора придёт после подтверждения заказа менеджером.
            Оплата будет доступна сразу после подписания договора.
          </p>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/personal-account', { state: { activeSection: 'orders' } })}
              className="px-6 py-3 bg-[#1e2c4f] text-white rounded-xl font-medium hover:bg-[#2a3d6b] transition-colors"
            >
              Мои заказы
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-[#1e2c4f] text-[#1e2c4f] rounded-xl font-medium hover:bg-gray-50 transition-colors"
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
