import React, { useState, useEffect } from 'react';
import { useCreatePayment } from '../../../shared/lib/hooks/use-payments';
import { paymentsApi } from '../../../shared/api/paymentsApi';
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
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { CheckCircle, AlertCircle, CalendarClock, Package, Calculator, Info, Truck, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const PaymentModal = ({ isOpen, order, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Состояние для мувинга
  const [movingEnabled, setMovingEnabled] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [movingDate, setMovingDate] = useState('');
  const [movingTariffs, setMovingTariffs] = useState([]);
  const [loadingTariffs, setLoadingTariffs] = useState(false);

  const createPaymentMutation = useCreatePayment();

  // Загрузка тарифов мувинга при открытии модала
  useEffect(() => {
    if (isOpen) {
      loadMovingTariffs();
    }
  }, [isOpen]);

  const loadMovingTariffs = async () => {
    setLoadingTariffs(true);
    try {
      const prices = await paymentsApi.getPrices();
      const movingPrices = prices.filter(price => 
        ['LIGHT', 'STANDARD', 'HARD'].includes(price.type)
      );
      setMovingTariffs(movingPrices);
    } catch (error) {
      console.error('Ошибка загрузки тарифов мувинга:', error);
      toast.error('Ошибка загрузки тарифов мувинга');
    } finally {
      setLoadingTariffs(false);
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    try {
      let result;

      if (movingEnabled && selectedTariff && movingDate) {
        // Последовательность API вызовов для мувинга
        
        // 1. Добавляем услугу мувинга к заказу
        await paymentsApi.createOrderService(order.id, selectedTariff.id);
        toast.success('Услуга мувинга добавлена к заказу');

        // 2. Создаем заявку на мувинг
        await paymentsApi.createMoving(order.id, movingDate);
        toast.success('Заявка на мувинг создана');

        // 3. Создаем платеж
        result = await createPaymentMutation.mutateAsync(order.id);
      } else {
        // Обычный платеж без мувинга
        result = await createPaymentMutation.mutateAsync(order.id);
      }
      
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

  const getTotalPrice = () => {
    const basePrice = parseFloat(order.total_price) || 0;
    const deposit = 15000;
    const movingPrice = movingEnabled && selectedTariff ? parseFloat(selectedTariff.price) : 0;
    return basePrice + deposit + movingPrice;
  };

  const getMovingTariffInfo = (type) => {
    const tariffInfo = {
      LIGHT: { name: 'Легкий', icon: '📦', color: 'text-green-600' },
      STANDARD: { name: 'Стандартный', icon: '🚛', color: 'text-blue-600' },
      HARD: { name: 'Тяжелый', icon: '🏗️', color: 'text-red-600' }
    };
    return tariffInfo[type] || { name: type, icon: '📦', color: 'text-gray-600' };
  };

  const canProceedToPayment = () => {
    if (!movingEnabled) return true;
    return selectedTariff && movingDate;
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

          <Separator />

          {/* Мувинг секция */}
          <Card className="border-blue-200 rounded-lg bg-blue-50">
            <CardContent className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Добавить услугу мувинга</span>
                </div>
                <button
                  onClick={() => {
                    setMovingEnabled(!movingEnabled);
                    if (!movingEnabled) {
                      setSelectedTariff(null);
                      setMovingDate('');
                    }
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    movingEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      movingEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Выбор тарифа мувинга */}
              {movingEnabled && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-2 block">
                      Выберите тариф мувинга:
                    </Label>
                    {loadingTariffs ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {movingTariffs.map((tariff) => {
                          const info = getMovingTariffInfo(tariff.type);
                          return (
                            <div
                              key={tariff.id}
                              onClick={() => setSelectedTariff(tariff)}
                              className={`p-2 rounded-lg border cursor-pointer transition-all ${
                                selectedTariff?.id === tariff.id
                                  ? 'border-blue-500 bg-blue-100'
                                  : 'border-gray-200 bg-white hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      checked={selectedTariff?.id === tariff.id}
                                      onChange={() => setSelectedTariff(tariff)}
                                      className="w-3 h-3 text-blue-600"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium flex items-center gap-1">
                                      <span className="text-sm">{info.icon}</span>
                                      {info.name}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                      {tariff.description || 'Описание тарифа'}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs font-bold text-[#1e2c4f]">
                                  {formatPrice(tariff.price)} ₸
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Выбор даты */}
                  {selectedTariff && (
                    <div>
                      <Label className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Дата и время мувинга:
                      </Label>
                      <Input
                        type="datetime-local"
                        value={movingDate}
                        onChange={(e) => setMovingDate(e.target.value)}
                        className="h-8 text-xs"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Расчет стоимости */}
          <Card className="border-[#1e2c4f] rounded-lg bg-gray-50">
            <CardContent className="p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Сумма аренды:</span>
                <span className="text-sm font-bold text-[#1e2c4f]">{formatPrice(order.total_price)} ₸</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Депозит:</span>
                <span className="text-sm font-bold text-orange-600">15 000 ₸</span>
              </div>

              {movingEnabled && selectedTariff && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Мувинг:</span>
                  <span className="text-sm font-bold text-blue-600">{formatPrice(selectedTariff.price)} ₸</span>
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
            <div className="space-y-1">
              <p className="text-xs text-blue-700 leading-tight">
                После нажатия на кнопку вы будете перенаправлены на защищенную страницу для завершения оплаты.
              </p>
              {movingEnabled && selectedTariff && (
                <p className="text-xs text-blue-600 font-medium">
                  Мувинг: {getMovingTariffInfo(selectedTariff.type).name} - {formatPrice(selectedTariff.price)} ₸
                </p>
              )}
            </div>
          </div>

          {/* Предупреждение если мувинг не полностью настроен */}
          {movingEnabled && (!selectedTariff || !movingDate) && (
            <div className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
              <AlertCircle className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-orange-700 leading-tight">
                {!selectedTariff && 'Выберите тариф мувинга. '}
                {!movingDate && 'Укажите дату и время мувинга.'}
              </p>
            </div>
          )}
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
            disabled={isProcessing || !canProceedToPayment()}
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