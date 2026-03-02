import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../../../components/ui/dialog';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { CheckCircle, Package, Tag } from 'lucide-react';
import { useApproveOrder } from '../../../shared/lib/hooks/use-orders';
import { getCargoMarkText } from '../../../shared/lib/types/orders';
import { formatServiceDescription } from '@/shared/lib/utils/serviceNames';
import { showErrorToast } from '../../../shared/lib/toast';
// Импортируем иконки дополнительных услуг
import streychPlenkaIcon from '../../../assets/стрейч_пленка.png';
import bubbleWrap100Icon from '../../../assets/Воздушно-пузырчатая_плёнка_(100 м).png';
import bubbleWrap10Icon from '../../../assets/Пузырчатая_плёнка_(10 м).png';
import korobkiIcon from '../../../assets/коробки.png';
import markerIcon from '../../../assets/маркер.png';
import rackRentalIcon from '../../../assets/Аренда_стелажей.png';
import uslugiMuveraIcon from '../../../assets/услуги_мувера.png';
import uslugiUpakovkiIcon from '../../../assets/услуги_упаковки.png';
import { formatCalendarDate } from '../../../shared/lib/utils/date';

const OrderConfirmModal = ({ isOpen, order, onClose }) => {
  const approveOrderMutation = useApproveOrder();

  // Функция для получения иконки услуги по типу
  const getServiceIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return '💰';
      case 'LOADER':
        return uslugiMuveraIcon;
      case 'PACKER':
        return uslugiUpakovkiIcon;
      case 'FURNITURE_SPECIALIST':
        return '🪑';
      case 'GAZELLE':
        return '🚚';
      case 'STRETCH_FILM':
        return streychPlenkaIcon;
      case 'BOX_SIZE':
        return korobkiIcon;
      case 'MARKER':
        return markerIcon;
      case 'UTILITY_KNIFE':
        return '🔪';
      case 'BUBBLE_WRAP_1':
        return bubbleWrap10Icon;
      case 'BUBBLE_WRAP_2':
        return bubbleWrap100Icon;
      case 'RACK_RENTAL':
        return rackRentalIcon;
      default:
        return '⚙️';
    }
  };

  // Функция для получения русского названия типа услуги
  const getServiceTypeName = (type) => {
    switch (type) {
      case 'LOADER':
        return 'Грузчик';
      case 'PACKER':
        return 'Упаковщик';
      case 'FURNITURE_SPECIALIST':
        return 'Мебельщик';
      case 'GAZELLE':
        return 'Газель';
      case 'GAZELLE_FROM':
        return 'Газель - Доставка';
      case 'GAZELLE_TO':
        return 'Газель - возврат вещей';
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
      case 'RACK_RENTAL':
        return 'Аренда стеллажей';
      default:
        return 'Услуга';
    }
  };

  const handleConfirmOrder = async () => {
    try {

      // Выполняем запрос на подтверждение заказа
      await approveOrderMutation.mutateAsync(order.id);

      onClose();


    } catch (error) {
      console.error('Ошибка при подтверждении заказа:', error);

      // Показываем ошибку пользователю
      showErrorToast('Не удалось подтвердить заказ. Пожалуйста, попробуйте позже.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

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
    return formatCalendarDate(dateString, { day: '2-digit', month: 'short' });
  };

  // Расчет общей стоимости услуг
  const getServicesTotal = () => {
    if (!order.services || order.services.length === 0) return 0;
    
    return order.services.reduce((total, service) => {
      if (service.OrderService && service.OrderService.total_price) {
        return total + (parseFloat(service.OrderService.total_price));
      }
      return total;
    }, 0);
  };

  // Общая сумма: аренда + услуги - скидка
  const getTotalPrice = () => {
    const basePrice = parseFloat(order.total_price) || 0;
    const servicesPrice = getServicesTotal();
    const discount = parseFloat(order.discount_amount) || 0;
    return Math.max(0, basePrice + servicesPrice - discount);
  };
  
  // Сумма до скидки
  const getTotalBeforeDiscount = () => {
    const basePrice = parseFloat(order.total_price) || 0;
    const servicesPrice = getServicesTotal();
    return basePrice + servicesPrice;
  };

  if (!isOpen || !order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full rounded-xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-lg font-bold text-[#1e2c4f] flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Подтверждение заказа
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Проверьте детали заказа:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Основная информация */}
          <Card className="border-gray-200 rounded-lg">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Заказ:</span>
                <Badge variant="outline" className="text-sm text-[#1e2c4f]">#{order.id}</Badge>
              </div>
              
              {order.storage && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Бокс:</span>
                  <span className="text-sm font-medium">{order.storage.name}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Объем:</span>
                <span className="text-sm font-semibold text-[#1e2c4f]">{order.total_volume} м³</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Период:</span>
                <span className="text-sm">
                  {formatDate(order.start_date)} — {formatDate(order.end_date)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Предметы для хранения — скрываем для индивидуального хранения */}
          {order.items && order.items.length > 0 && order.storage?.storage_type !== 'INDIVIDUAL' && (
            <Card className="border-gray-200 rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Предметы для хранения:</span>
                  <Badge variant="secondary" className="text-sm">{order.items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2">
                      <div>
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="text-gray-500 ml-2">({getCargoMarkText(item.cargo_mark)})</span>
                      </div>
                      <span className="text-[#1e2c4f] font-medium">{item.volume} м³</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Заказанные услуги */}
          {order.services && order.services.length > 0 && (
            <Card className="border-amber-200 rounded-lg bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-amber-800" />
                  <span className="text-sm font-medium text-amber-800">Заказанные услуги:</span>
                </div>
                
                <div className="space-y-2">
                  {order.services.map((service, index) => {
                    const serviceIcon = getServiceIcon(service.type);
                    const isImage = typeof serviceIcon === 'string' && (serviceIcon.endsWith('.png') || serviceIcon.endsWith('.jpg') || serviceIcon.endsWith('.jpeg') || serviceIcon.endsWith('.webp'));
                    return (
                    <div key={service.id || index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center gap-2">
                        {isImage ? (
                          <img src={serviceIcon} alt="" className="h-5 w-5 object-contain" />
                        ) : (
                          <span className="text-lg">{serviceIcon}</span>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatServiceDescription(service.description) || getServiceTypeName(service.type)}
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
                      {service.OrderService && service.OrderService.total_price && (
                        <div className="text-sm font-bold text-[#1e2c4f] text-right">
                          {formatPrice(parseFloat(service.OrderService.total_price))} ₸
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
                
                {/* Итого по услугам */}
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-amber-800">
                      Услуг выбрано: {order.services.length}
                    </span>
                    <span className="text-sm font-bold text-amber-800">
                      Стоимость услуг: {formatPrice(getServicesTotal())} ₸
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Расчет стоимости */}
          <Card className="border-[#1e2c4f] rounded-lg bg-gray-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Сумма аренды:</span>
                <span className="text-lg font-bold text-[#1e2c4f]">{formatPrice(order.total_price)} ₸</span>
              </div>

              {order.services && order.services.length > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Стоимость услуг:</span>
                    <span className="text-lg font-bold text-amber-600">{formatPrice(getServicesTotal())} ₸</span>
                  </div>
                </>
              )}
              
              <Separator />
              
              {/* Промокод и скидка */}
              {order.promo_code && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Промокод:
                  </span>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {order.promo_code.code} (-{order.promo_code.discount_percent}%)
                  </Badge>
                </div>
              )}
              
              {order.discount_amount && Number(order.discount_amount) > 0 && (
                <>
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm">Скидка:</span>
                    <span className="text-lg font-bold">-{formatPrice(order.discount_amount)} ₸</span>
                  </div>
                  <Separator />
                </>
              )}
              
              <div className="flex justify-between items-center p-3 bg-[#1e2c4f] rounded-md text-white">
                <span className="text-sm font-medium">Общая сумма:</span>
                <div className="text-right">
                  {order.discount_amount && Number(order.discount_amount) > 0 && (
                    <span className="text-gray-300 line-through text-sm mr-2">
                      {formatPrice(getTotalBeforeDiscount())} ₸
                    </span>
                  )}
                  <span className="text-xl font-bold">
                    {formatPrice(getTotalPrice())} ₸
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={approveOrderMutation.isPending}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirmOrder}
            disabled={approveOrderMutation.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {approveOrderMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Подтверждение...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Подтвердить
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmModal;