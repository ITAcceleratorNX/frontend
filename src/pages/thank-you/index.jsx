import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '../../widgets';
import Footer from '../../widgets/Footer';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { ordersApi } from '../../shared/api/ordersApi';

const ThankYouPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('order_id');
  const { user, isAuthenticated } = useAuth();

  const { data: deliveries = [] } = useQuery({
    queryKey: ['userDeliveries', user?.id],
    queryFn: ordersApi.getUserDeliveries,
    enabled: Boolean(orderIdParam && user?.id && isAuthenticated),
    staleTime: 0,
  });

  const orderId = orderIdParam ? parseInt(orderIdParam, 10) : null;
  const hasDeliveryForOrder =
    Number.isInteger(orderId) &&
    deliveries.some((d) => d.order_id === orderId || d.order?.id === orderId);

  useEffect(() => {
    if (!orderIdParam || !isAuthenticated || !user?.id) return;
    if (!hasDeliveryForOrder) return;
    navigate('/personal-account', { state: { activeSection: 'delivery' }, replace: true });
  }, [orderIdParam, hasDeliveryForOrder, isAuthenticated, user?.id, navigate]);

  const isPaymentSuccess = Boolean(orderIdParam && isAuthenticated);

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
          <h1 className="text-3xl md:text-4xl font-bold text-[#202422] mb-4">
            {isPaymentSuccess ? 'Спасибо за оплату!' : 'Спасибо за заявку!'}
          </h1>

          <p className="text-gray-600 text-lg mb-3">
            {isPaymentSuccess
              ? 'Оплата прошла успешно.'
              : 'Ваша заявка успешно отправлена!'}
          </p>
          <p className="text-gray-500 text-base mb-8">
            {isPaymentSuccess
              ? 'Вы можете управлять заказами и доставкой в личном кабинете.'
              : 'Наши менеджеры уже получили вашу заявку и свяжутся с вами в ближайшее время, чтобы обсудить все детали и ответить на вопросы.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isPaymentSuccess && (
              <button
                onClick={() =>
                  navigate('/personal-account', {
                    state: { activeSection: hasDeliveryForOrder ? 'delivery' : 'orders' },
                  })
                }
                className="px-6 py-3 border bg-[#31876D] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasDeliveryForOrder ? 'Раздел доставки' : 'В личный кабинет'}
              </button>
            )}
            <button
              onClick={() => navigate(isPaymentSuccess ? '/personal-account' : '/')}
              className="px-6 py-3 border bg-[#31876D] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPaymentSuccess ? 'В личный кабинет' : 'На главную'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYouPage;
