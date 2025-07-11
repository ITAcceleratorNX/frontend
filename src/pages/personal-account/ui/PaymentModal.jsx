import React, { useState } from 'react';
import { useCreatePayment } from '../../../shared/lib/hooks/use-payments';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '../../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { CheckCircle, Info, Package } from 'lucide-react';
import { toast } from 'react-toastify';

const PaymentModal = ({ isOpen, order, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const createPaymentMutation = useCreatePayment();

  // Функция для получения иконки услуги по типу
  const getServiceIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return '💰'; // Залог
      case 'LOADER':
        return '💪'; // Грузчик
      case 'PACKER':
        return '📦'; // Упаковщик
      case 'FURNITURE_SPECIALIST':
        return '🪑'; // Мебельщик
      case 'GAZELLE':
        return '🚚'; // Газель
      case 'STRETCH_FILM':
        return '📜'; // Стрейч-пленка
      case 'BOX_SIZE':
        return '📦'; // Коробка
      case 'MARKER':
        return '🖊️'; // Маркер
      case 'UTILITY_KNIFE':
        return '🔪'; // Канцелярский нож
      case 'BUBBLE_WRAP_1':
      case 'BUBBLE_WRAP_2':
        return '🛡️'; // Воздушно-пузырчатая пленка
      default:
        return '⚙️'; // Общая услуга
    }
  };

  // Функция для получения русского названия типа услуги
  const getServiceTypeName = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Залог';
      case 'LOADER':
        return 'Грузчик';
      case 'PACKER':
        return 'Упаковщик';
      case 'FURNITURE_SPECIALIST':
        return 'Мебельщик';
      case 'GAZELLE':
        return 'Газель';
      case 'STRETCH_FILM':
        return 'Стрейч-пленка';
      case 'BOX_SIZE':
        return 'Коробка';
      case 'MARKER':
        return 'Маркер';
      case 'UTILITY_KNIFE':
        return 'Канцелярский нож';
      case 'BUBBLE_WRAP_1':
        return 'Воздушно-пузырчатая пленка 10м';
      case 'BUBBLE_WRAP_2':
        return 'Воздушно-пузырчатая пленка 120м';
      default:
        return 'Услуга';
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Простой вызов API для создания платежа
      const result = await createPaymentMutation.mutateAsync(order.id);
      
      // Получаем URL для оплаты из ответа API
      if (result.payment_page_url) {
        // Открываем страницу оплаты в новом окне/вкладке
        window.open(result.payment_page_url, '_blank');
        
        // Закрываем модальное окно и обновляем данные
        onSuccess();
      }
    } catch (error) {
      console.error('Ошибка создания платежа:', error);
      toast.error('Ошибка при обработке платежа');
    } finally {
      setIsProcessing(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
      });
    } catch (error) {
      return 'Некорректная дата';
    }
  };

  // Расчет общей стоимости услуг
  const getServicesTotal = () => {
    if (!order.services || order.services.length === 0) return 0;
    
    return order.services.reduce((total, service) => {
      if (service.price && service.OrderService) {
        return total + (parseFloat(service.price) * service.OrderService.count);
      }
      return total;
    }, 0);
  };

  // Общая сумма: аренда + услуги
  const getTotalPrice = () => {
    const basePrice = parseFloat(order.total_price) || 0;
    const servicesPrice = getServicesTotal();
    return basePrice + servicesPrice;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md w-full rounded-xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-base font-bold text-[#1e2c4f] flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Подтверждение оплаты
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            Проверьте детали перед оплатой
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Основная информация */}
          <Card className="border-gray-200 rounded-lg">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Заказ:</span>
                <Badge variant="outline" className="text-xs text-[#1e2c4f] h-5">#{order.id}</Badge>
              </div>
              
              {order.storage && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Бокс:</span>
                  <span className="text-xs font-medium truncate max-w-[120px]">{order.storage.name}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Объем:</span>
                <span className="text-xs font-semibold text-[#1e2c4f]">{order.total_volume} м³</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Период:</span>
                <span className="text-xs">
                  {formatDate(order.start_date)} — {formatDate(order.end_date)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Предметы */}
          {order.items && order.items.length > 0 && (
            <Card className="border-gray-200 rounded-lg">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Предметы для хранения</span>
                  <Badge variant="secondary" className="text-xs h-5">{order.items.length}</Badge>
                </div>
                <div className="space-y-1">
                  {order.items.slice(0, 1).map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center text-xs">
                      <span className="text-gray-700 truncate">{item.name}</span>
                      <span className="text-[#1e2c4f] font-medium">{item.volume} м³</span>
                    </div>
                  ))}
                  {order.items.length > 1 && (
                    <div className="text-xs text-gray-500 text-center">+{order.items.length - 1} ещё</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Заказанные услуги */}
          {order.services && order.services.length > 0 && (
            <>
              <Separator />
              <Card className="border-amber-200 rounded-lg bg-amber-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Заказанные услуги
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {order.services.map((service, index) => (
                    <div key={service.id || index} className="flex items-center justify-between bg-white rounded-lg p-2 border border-amber-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getServiceIcon(service.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-900">
                              {service.description || getServiceTypeName(service.type)}
                            </span>
                            {service.OrderService && service.OrderService.count > 1 && (
                              <Badge className="text-xs px-1 py-0 bg-[#1e2c4f] text-white">
                                ×{service.OrderService.count}
                              </Badge>
                            )}
                          </div>
                          {service.price && (
                            <div className="text-xs text-gray-500">
                              {formatPrice(service.price)} ₸ за единицу
                            </div>
                          )}
                        </div>
                      </div>
                      {service.price && service.OrderService && (
                        <div className="text-xs font-bold text-[#1e2c4f] text-right">
                          {formatPrice(parseFloat(service.price) * service.OrderService.count)} ₸
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Итого по услугам */}
                  <div className="pt-2 border-t border-amber-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-amber-800">
                        Услуг выбрано: {order.services.length}
                      </span>
                      <span className="text-xs font-bold text-amber-800">
                        Стоимость услуг: {formatPrice(getServicesTotal())} ₸
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Separator />

          {/* Расчет стоимости */}
          <Card className="border-[#1e2c4f] rounded-lg bg-gray-50">
            <CardContent className="p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Сумма аренды:</span>
                <span className="text-sm font-bold text-[#1e2c4f]">{formatPrice(order.total_price)} ₸</span>
              </div>

              {order.services && order.services.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Стоимость услуг:</span>
                  <span className="text-sm font-bold text-amber-600">{formatPrice(getServicesTotal())} ₸</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center p-2 bg-[#1e2c4f] rounded-md text-white">
                <span className="text-xs font-medium">Общая сумма:</span>
                <span className="text-base font-bold">
                  {formatPrice(getTotalPrice())} ₸
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Информация */}
          <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
            <Info className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-tight">
              После нажатия на кнопку вы будете перенаправлены на защищенную страницу для завершения оплаты.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 h-8 text-xs rounded-lg"
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className="flex-1 h-8 text-xs bg-[#1e2c4f] hover:bg-[#162540] text-white rounded-lg disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-white"></div>
                Обработка...
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Подтвердить оплату
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal; 