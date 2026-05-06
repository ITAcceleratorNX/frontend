import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Phone, MessageCircle } from 'lucide-react';
import { Header } from '../../widgets';
import Footer from '../../widgets/Footer';
import { useAuth } from '../../shared/context/AuthContext';
import { ordersApi } from '../../shared/api/ordersApi';
import { DISPLAY_PHONE, TEL_LINK } from '../../shared/components/CallbackRequestModal.jsx';
import { buildWhatsAppLink } from '@/pages/lp/components/PhoneGatingModal.jsx';

const ThankYouPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('order_id');
  const { user, isAuthenticated } = useAuth();

  const isPaymentSuccess = Boolean(orderIdParam && isAuthenticated);
  const lpState = !isPaymentSuccess && location.state?.from === 'lp' ? location.state : null;
  const showLpPhone = Boolean(lpState?.revealPhone);
  const landingPath =
    typeof lpState?.landingPath === 'string' && lpState.landingPath.startsWith('/')
      ? lpState.landingPath
      : '';
  const lpServiceType = lpState?.serviceType || 'individual';
  const whatsAppHref = buildWhatsAppLink(lpServiceType);

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
              : lpState
                ? 'Менеджер ExtraSpace свяжется с вами в ближайшее время. Ниже — номер, если хотите связаться сразу.'
                : 'Наши менеджеры уже получили вашу заявку и свяжутся с вами в ближайшее время, чтобы обсудить все детали и ответить на вопросы.'}
          </p>

          {showLpPhone && (
            <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left">
              <p className="mb-1 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
                Телефон ExtraSpace
              </p>
              <a
                href={TEL_LINK}
                className="mb-4 block text-center text-2xl font-bold text-[#00A991] transition hover:text-[#008a7a]"
              >
                {DISPLAY_PHONE}
              </a>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <a
                  href={TEL_LINK}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#31876D] px-4 text-sm font-semibold text-white transition hover:bg-[#2a7260]"
                >
                  <Phone size={16} aria-hidden /> Позвонить
                </a>
                <a
                  href={whatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#128C7E] px-4 text-sm font-semibold text-white transition hover:bg-[#0e7568]"
                >
                  <MessageCircle size={16} aria-hidden /> WhatsApp
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {lpState && landingPath && (
              <button
                type="button"
                onClick={() => navigate(landingPath)}
                className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-[#273655] font-medium hover:bg-gray-50 transition-colors"
              >
                Вернуться на страницу
              </button>
            )}
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
