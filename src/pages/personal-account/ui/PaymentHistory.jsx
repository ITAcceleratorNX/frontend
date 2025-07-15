import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { paymentsApi } from '../../../shared/api/paymentsApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { Calendar, CreditCard, AlertCircle, CheckCircle, Clock, RefreshCw, ChevronDown, Receipt } from 'lucide-react';

const PaymentHistory = ({ payments = [], isLoading, error, onRefetch }) => {
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const createManualPaymentMutation = useMutation({
    mutationFn: paymentsApi.createManualPayment,
    onSuccess: (data) => {
      console.log('Ручная оплата создана:', data);
      
      // Получаем URL для оплаты из ответа API
      if (data.payment_page_url) {
        // Открываем страницу оплаты в новом окне/вкладке
        window.open(data.payment_page_url, '_blank');
        
        toast.success('Перенаправляем на страницу ручной оплаты...', {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Обновляем данные
        onRefetch();
      } else {
        toast.error('Ошибка: не получен URL для ручной оплаты');
      }
    },
    onError: (error) => {
      console.error('Ошибка создания ручной оплаты:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при создании ручной оплаты';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  });

  const downloadReceiptMutation = useMutation({
    mutationFn: paymentsApi.getPaymentReceipt,
    onSuccess: (blob, orderPaymentId) => {
      console.log('PDF-чек успешно получен:', orderPaymentId);
      
      // Создаем URL для blob и открываем в новой вкладке
      const fileUrl = window.URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
      
      // Очищаем URL через некоторое время
      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 1000);
      
      toast.success('PDF-чек открыт в новой вкладке', {
        position: "top-right",
        autoClose: 3000,
      });
    },
    onError: (error) => {
      console.error('Ошибка при получении PDF-чека:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при получении PDF-чека';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Некорректная дата';
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 font-semibold">
            <CheckCircle className="w-3 h-3 mr-1" />
            Оплачено
          </Badge>
        );
      case 'UNPAID':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200 font-semibold">
            <AlertCircle className="w-3 h-3 mr-1" />
            Не оплачено
          </Badge>
        );
      case 'MANUAL':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 font-semibold">
            <Clock className="w-3 h-3 mr-1" />
            Ручная оплата
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 font-semibold">
            <RefreshCw className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      default:
        return <Badge variant="outline" className="font-semibold">{status}</Badge>;
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleManualPayment = (orderPaymentId) => {
    createManualPaymentMutation.mutate(orderPaymentId);
  };

  const handleDownloadReceipt = (orderPaymentId) => {
    downloadReceiptMutation.mutate(orderPaymentId);
  };

  const getMonthName = (month) => {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[month - 1] || month;
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200 shadow-md rounded-2xl">
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1e2c4f]"></div>
            <span className="text-lg font-medium text-[#1e2c4f]">Загрузка истории платежей...</span>
      </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 shadow-md rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-4">Ошибка загрузки</h3>
          <p className="text-red-600 mb-6 text-lg">Ошибка при загрузке истории платежей: {error.message}</p>
          <Button 
          onClick={onRefetch}
            variant="outline" 
            className="border-red-300 text-red-700 hover:bg-red-50 rounded-xl px-6 py-3 text-lg"
        >
            <RefreshCw className="w-5 h-5 mr-2" />
          Попробовать снова
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="border-gray-200 shadow-md rounded-2xl">
        <CardContent className="text-center py-16">
          <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <CreditCard className="w-16 h-16 text-gray-400" />
      </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Нет истории платежей</h3>
          <p className="text-gray-500 text-lg">У вас пока нет записей о платежах</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        {payments.map((order) => (
        <Card key={order.id} className="border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
            {/* Заголовок заказа */}
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#1e2c4f] bg-opacity-10 rounded-2xl">
                  <CreditCard className="w-6 h-6 text-[#1e2c4f]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1e2c4f] mb-1">
                    Заказ №{order.id}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Создан: {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                  <div className="text-right">
                  <p className="text-2xl font-bold text-[#1e2c4f] mb-2">
                      {formatPrice(order.total_price)} ₸
                    </p>
                  <Badge variant="outline" className="border-[#1e2c4f] text-[#1e2c4f] font-semibold text-sm">
                    {order.status}
                  </Badge>
                  </div>
                <Button
                  variant="outline"
                  size="sm"
                    onClick={() => toggleOrderExpansion(order.id)}
                  className="border-gray-300 hover:bg-gray-50 rounded-xl p-3 transition-all"
                  >
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform duration-200 ${
                        expandedOrders.has(order.id) ? 'rotate-180' : ''
                      }`} 
                  />
                </Button>
              </div>
            </div>
          </CardHeader>

            {/* Детали платежей по месяцам */}
            {expandedOrders.has(order.id) && order.order_payment && (
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-5 h-5 text-[#1e2c4f]" />
                  <h4 className="text-lg font-semibold text-[#1e2c4f]">Платежи по месяцам</h4>
                </div>
                
                <div className="space-y-4">
                  {order.order_payment.map((payment) => (
                    <Card key={payment.id} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <h5 className="text-lg font-semibold text-gray-900">
                              {getMonthName(payment.month)} {payment.year}
                            </h5>
                              {getPaymentStatusBadge(payment.status)}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <Card className="bg-white border shadow-sm rounded-xl">
                                <CardContent className="p-4">
                                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Сумма</p>
                                  <p className="text-lg font-bold text-[#1e2c4f]">{formatPrice(payment.amount)} ₸</p>
                                </CardContent>
                              </Card>
                            
                            {payment.penalty_amount && parseFloat(payment.penalty_amount) > 0 && (
                                <Card className="bg-white border shadow-sm rounded-xl">
                                  <CardContent className="p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Штраф</p>
                                    <p className="text-lg font-bold text-red-600">+{formatPrice(payment.penalty_amount)} ₸</p>
                                  </CardContent>
                                </Card>
                            )}
                            
                            {payment.paid_at && (
                                <Card className="bg-white border shadow-sm rounded-xl">
                                  <CardContent className="p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Дата оплаты</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDate(payment.paid_at)}</p>
                                  </CardContent>
                                </Card>
                            )}
                            
                            {payment.payment_id && (
                                <Card className="bg-white border shadow-sm rounded-xl">
                                  <CardContent className="p-4">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">ID транзакции</p>
                                    <p className="text-xs font-mono text-gray-700 break-all">{payment.payment_id}</p>
                                  </CardContent>
                                </Card>
                            )}
                          </div>
                        </div>
                        
                        {/* Кнопки действий */}
                          <div className="ml-8 flex flex-col gap-3">
                          {payment.status === 'UNPAID' && order.status === 'APPROVED' && (
                              <Button
                              onClick={() => handleManualPayment(payment.id)}
                              disabled={createManualPaymentMutation.isLoading}
                                className="bg-[#1e2c4f] hover:bg-[#162540] text-white rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all"
                            >
                                {createManualPaymentMutation.isLoading ? (
                                  <div className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Обработка...
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Оплатить
                                  </div>
                                )}
                              </Button>
                          )}
                          
                          {payment.status === 'MANUAL' && (
                              <Button
                              onClick={() => handleManualPayment(payment.id)}
                              disabled={createManualPaymentMutation.isLoading}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all"
                            >
                                {createManualPaymentMutation.isLoading ? (
                                  <div className="flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Обработка...
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Ручная оплата
                                  </div>
                                )}
                              </Button>
                          )}
                          
                          {payment.status === 'PAID' && (
                              <div className="flex flex-col gap-3">
                                <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 px-4 py-2 rounded-xl font-semibold">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  ✓ Оплачено
                                </Badge>
                                <Button
                                  onClick={() => handleDownloadReceipt(payment.id)}
                                  disabled={downloadReceiptMutation.isLoading}
                                  className="bg-[#1e2c4f] hover:bg-[#162540] text-white rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all"
                                >
                                  {downloadReceiptMutation.isLoading ? (
                                    <div className="flex items-center gap-2">
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      Загрузка...
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Receipt className="w-4 h-4" />
                                      Скачать PDF-чек
                                    </div>
                                  )}
                                </Button>
                              </div>
                          )}
                        </div>
                      </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
            )}

            {/* Краткая информация при свернутом состоянии */}
            {!expandedOrders.has(order.id) && order.order_payment && (
            <CardContent className="p-6">
              <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-2xl">
                <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Всего платежей: {order.order_payment.length}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Оплачено: {order.order_payment.filter(p => p.status === 'PAID').length}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700 font-medium">Не оплачено: {order.order_payment.filter(p => p.status === 'UNPAID').length}</span>
                      </div>
                    </div>
                    <span className="text-gray-500 font-medium">Нажмите для подробностей</span>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
            )}
        </Card>
        ))}
    </div>
  );
};

export default PaymentHistory; 