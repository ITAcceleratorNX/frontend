import React, { useState, useRef, useEffect } from 'react';
import { useContracts, useCancelContract, useDownloadContract, useContractDetails, useDownloadItemFile } from '../../../shared/lib/hooks/use-orders';
import { useCreateMoving, useCreateAdditionalServicePayment } from '../../../shared/lib/hooks/use-payments';
import { 
  Check, 
  Download, 
  FileText, 
  Package, 
  Truck, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  X,
  RefreshCcw, 
  Clock, 
  Ban, 
  FileCheck 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useDeviceType } from '../../../shared/lib/hooks/useWindowWidth';
import {useNavigate} from "react-router-dom";
import DatePicker from '../../../shared/ui/DatePicker';

const CANCEL_REASON_OPTIONS = [
  { value: 'no_longer_needed', label: 'Вещи больше не нужно хранить' },
  { value: 'too_expensive', label: 'Слишком дорого' },
  { value: 'moving_to_new_location', label: 'Переезжаю в другой район / город / страну' },
  { value: 'using_other_storage', label: 'Пользуюсь другим местом хранения' },
  { value: 'ordered_by_mistake', label: 'Оформил(а) заказ по ошибке' },
  { value: 'service_quality_issues', label: 'Есть замечания по качеству услуги' },
  { value: 'not_satisfied_with_terms', label: 'Не устроили условия или сервис' },
  { value: 'rarely_use', label: 'Редко пользуюсь, бокс пустует' },
  { value: 'other', label: 'Другая причина (укажите ниже)', requiresComment: true },
];

const getContractStatusInfo = (statusText) => {
  const statusMap = {
    // Активные статусы
    'Подписан компанией': { 
      style: 'success',
      icon: <Clock className="mr-1.5 h-3.5 w-3.5" />,
      message: 'Подписан компанией'
    },
    'Подписан клиентом': { 
      style: 'success',
      icon: <Clock className="mr-1.5 h-3.5 w-3.5" />,
      message: 'Подписан клиентом'
    },
    'Полностью подписан': { 
      style: 'success',
      icon: <Check className="mr-1.5 h-3.5 w-3.5" />,
      message: 'Полностью подписан'
    },
    // Ожидающие подтверждения
    'Не подписан': { 
      style: 'info',
      icon: <Clock className="mr-1.5 h-3.5 w-3.5" />,
      message: 'Не подписан'
    },
    // Процесс расторжения
    'Компания инициировала расторжение': { 
      style: 'warning',
      icon: <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />,
      message: 'Компания инициировала расторжение'
    },
    'Клиент инициировал расторжение': { 
      style: 'warning',
      icon: <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />,
      message: 'Клиент инициировал расторжение'
    },
    'Клиент отказался от расторжения': { 
      style: 'info',
      icon: <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />,
      message: 'Клиент отказался от расторжения'
    },
    // Отрицательные статусы
    'Отозван компанией': { 
      style: 'danger',
      icon: <Ban className="mr-1.5 h-3.5 w-3.5" />,
      message: 'Отозван компанией'
    },
    'Расторгнут': { 
      style: 'danger',
      icon: <X className="mr-1.5 h-3.5 w-3.5" />,
      message: 'Расторгнут'
    },
    'Клиент отказался подписывать договор': { 
      style: 'danger',
      icon: <X className="mr-1.5 h-3.5 w-3.5" />,
      message: 'Клиент отказался подписывать договор'
    },
    // Завершенные статусы
    'Завершён': { 
      style: 'purple',
      icon: <FileCheck className="mr-1.5 h-3.5 w-3.5" />,
      message: 'Завершён'
    },
  };
  
  return statusMap[statusText] || { style: 'default', icon: null, message: statusText };
};
function StatusBadge({ status, type = 'order' }) {
  if (!status) return null;

  const info =
      type === 'order'
          ? getOrderStatusInfo(status)
          : type === 'contract'
              ? getContractStatusInfo(status)
              : getPaymentStatusInfo(status);

  return (
      <Badge className={`${statusStyles[info.style]} justify-center py-1.5 px-2.5 text-xs`}>
        {info.message || status}
      </Badge>
  );
}

const statusStyles = {
  success: 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200',
  danger: 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200',
  warning: 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200',
  info: 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200',
  purple: 'bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-200',
  default: 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200',
};

// Функция для преобразования статусов перемещения
const getMovingStatusText = (status) => {
  const statusMap = {
    PENDING_FROM:  'В ожидании (от клиента)',
    PENDING_TO:    'В ожидании (со склада)',
    IN_PROGRESS:   'В пути к складу',
    IN_PROGRESS_TO:'В пути к клиенту',
    DELIVERED:     'Доставлено на склад',
    DELIVERED_TO:  'Доставлено клиенту',
    CANCELLED:     'Отменено',
  };
  return statusMap[status] || status;
};
const getMovingStatusVariant = (status) => {
  if (status === 'CANCELLED') return 'danger';
  if (status === 'DELIVERED' || status === 'DELIVERED_TO') return 'success';
  if (status === 'IN_PROGRESS' || status === 'IN_PROGRESS_TO') return 'info';
  if (status === 'PENDING_FROM' || status === 'PENDING_TO') return 'warning';
  return 'default';
};


// Функция для преобразования типа транспорта
const getVehicleTypeText = (type) => {
  const typeMap = {
    'SMALL': 'Малый',
    'MEDIUM': 'Средний',
    'LARGE': 'Большой'
  };
  return typeMap[type] || type;
};

// Функция для преобразования типа груза
const getCargoMarkText = (mark) => {
  const markMap = {
    'HEAVY': 'Тяжелый',
    'FRAGILE': 'Хрупкий',
    'DANGEROUS': 'Опасный',
    'STANDARD': 'Стандартный'
  };
  return markMap[mark] || mark;
};

// Функция для получения информации о статусе заказа
const getOrderStatusInfo = (status) => {
  const statusMap = {
    'APPROVED': { 
      style: 'success',
      message: 'Одобрен'
    },
    'PROCESSING': { 
      style: 'warning',
      message: 'В обработке'
    },
    'ACTIVE': { 
      style: 'info',
      message: 'Активный'
    },
    'CANCELED': {
      style: 'danger',
      message: 'Расторгнут'
    }
  };
  
  return statusMap[status] || { style: 'default', message: status };
};


// Функция для получения информации о статусе оплаты
const getPaymentStatusInfo = (status) => {
  const statusMap = {
    'PAID': { 
      style: 'success',
      message: 'Оплачен'
    },
    'UNPAID': { 
      style: 'danger',
      message: 'Не оплачен'
    }
  };
  
  return statusMap[status] || { style: 'default', message: status };
};

function MonthSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-medium text-[#273655] ml-12">ДОГОВОРЫ</h2>
    </div>
  );
}

const ContractDetailsModal = ({ isOpen, onClose, contract, details, isLoading, error, onDownloadItemFile, isDownloadingItem, onDownloadContract }) => {
  const { isMobile } = useDeviceType();
  if (!contract) return null;
  
  // Форматируем дату для переездов
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#273655]">
            Детали договора
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="text-sm text-gray-600">ID заказа: <span className="font-medium">{contract.order_id}</span></span>
              <span className="text-sm text-gray-600">Бокс: <span className="font-medium">{contract.storage_name}</span></span>
              <span className="text-sm text-gray-600">Адрес: <span className="font-medium">{contract.warehouse_address}</span></span>
              <span className="text-sm text-gray-600">Объем: <span className="font-medium">{contract.total_volume} м²</span></span>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Блок статусов */}
        <Card className="bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#273655]" />
              Статусы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Статус заказа:</p>
                <Badge 
                  className={`${statusStyles[getOrderStatusInfo(contract.order_status).style]} justify-center py-2 px-3`}
                >
                  {getOrderStatusInfo(contract.order_status).message}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Статус оплаты:</p>
                <Badge 
                  className={`${statusStyles[getPaymentStatusInfo(contract.payment_status).style]} justify-center py-2 px-3`}
                >
                  {getPaymentStatusInfo(contract.payment_status).message}
                </Badge>
              </div>

              {contract.contracts && contract.contracts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Контракты:</p>
                  <Badge variant="outline" className="justify-center py-2 px-3">
                    {contract.contracts.length} {contract.contracts.length === 1 ? 'контракт' : 'контракта'}
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Список статусов всех контрактов */}
            {contract.contracts && contract.contracts.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-600 mb-2">Статусы контрактов:</p>
                <div className="space-y-2">
                  {contract.contracts.map((c, index) => {
                    const contractStatusInfo = getContractStatusInfo(c.status);
                    return (
                      <div key={c.contract_id || index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">#{index + 1}</span>
                          <Badge 
                            className={`${statusStyles[contractStatusInfo.style]} justify-center py-1 px-2 text-xs`}
                          >
                            {contractStatusInfo.icon}
                            {c.status}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadContract?.(c.document_id);
                          }}
                          disabled={isDownloadingItem}
                          className="text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Скачать
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#273655]"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки деталей</h3>
            <p className="text-sm text-gray-600">Не удалось получить информацию о договоре</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Предметы */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#273655]" />
                  Предметы
                  {details?.items?.length > 0 && (
                    <Badge variant="outline" className="ml-2">{details.items.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!details?.items || details.items.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Package className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p>Нет информации о предметах</p>
                  </div>
                ) : (
                  isMobile ? (
                    <div className="space-y-3">
                      {details.items.map((item) => (
                        <div key={item.id} className="border rounded-xl p-4 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-base font-semibold text-gray-900">{item.name}</div>
                            <Badge variant="outline" className="text-sm">{item.public_id}</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                            <div className="text-gray-600">Объём: <span className="font-medium text-gray-900">{item.volume} м³</span></div>
                            <div>
                              <Badge 
                                variant={item.cargo_mark === 'HEAVY' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {getCargoMarkText(item.cargo_mark)}
                              </Badge>
                            </div>
                          </div>
                          <button
                            onClick={() => onDownloadItemFile(item.id)}
                            disabled={isDownloadingItem}
                            className="mt-3 w-full h-11 inline-flex items-center justify-center rounded-lg bg-[#1e2c4f] text-white font-medium hover:bg-[#162540] transition-colors disabled:opacity-50"
                          >
                            {isDownloadingItem ? 'Загрузка…' : (
                              <span className="inline-flex items-center gap-2"><Download className="w-4 h-4" /> Скачать</span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">№</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Название</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Объём (м³)</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Маркировка</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Скачать</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.items.map((item) => (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm">{item.public_id}</td>
                              <td className="py-3 px-4 text-sm font-medium">{item.name}</td>
                              <td className="py-3 px-4 text-sm">
                                <Badge variant="outline">{item.volume}</Badge>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <Badge 
                                  variant={item.cargo_mark === 'HEAVY' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {getCargoMarkText(item.cargo_mark)}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => onDownloadItemFile(item.id)}
                                  disabled={isDownloadingItem}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                  title="Скачать файл предмета"
                                >
                                  {isDownloadingItem ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                                  ) : (
                                    <Download className="w-4 h-4 text-gray-600" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </CardContent>
            </Card>

            {/* Переезды */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#273655]" />
                  Переезды
                  {details?.movingOrders?.length > 0 && (
                    <Badge variant="outline" className="ml-2">{details.movingOrders.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!details?.movingOrders || details.movingOrders.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Truck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p>Нет информации о переездах</p>
                  </div>
                ) : (
                  isMobile ? (
                    <div className="space-y-3">
                      {details.movingOrders.map((moving) => {
                        const status = getMovingStatusText(moving.status);
                        const statusVariant = getMovingStatusVariant(moving.status);

                        return (
                          <div key={moving.id} className="border rounded-xl p-4 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-gray-600">Дата</div>
                              <div className="text-sm font-semibold text-gray-900">{formatDateTime(moving.moving_date)}</div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                              <div className="text-gray-600">Авто: <span className="font-medium text-gray-900">{getVehicleTypeText(moving.vehicle_type)}</span></div>
                              <div>
                                <Badge className={statusStyles[statusVariant]}>{status}</Badge>
                              </div>
                              <div className="flex items-start gap-1 text-gray-600">
                                <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                                <span className="font-medium text-gray-900">{moving.address || 'Не указан'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Дата</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Тип машины</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Статус</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Адрес</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.movingOrders.map((moving) => {
                            const status = getMovingStatusText(moving.status);
                            const statusVariant = getMovingStatusVariant(moving.status);

                            return (
                              <tr key={moving.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm">
                                  {formatDateTime(moving.moving_date)}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  {getVehicleTypeText(moving.vehicle_type)}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  <Badge 
                                    className={statusStyles[statusVariant]}
                                  >
                                    {status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-sm flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-gray-500" />
                                  {moving.address || 'Не указан'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto mt-4" 
            onClick={onClose}
          >
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Функция для определения названия склада из адреса
const getWarehouseName = (address) => {
  if (!address) return 'Облачное хранение';
  
  const addressLower = address.toLowerCase();
  
  // Проверяем по ключевым словам в адресе
  if (addressLower.includes('мега') || addressLower.includes('mega')) {
    return 'Мега';
  }
  if (addressLower.includes('есентай') || addressLower.includes('esentai')) {
    return 'Есентай';
  }
  if (addressLower.includes('комфорт') || addressLower.includes('komfort')) {
    return 'Комфорт Сити';
  }
  if (addressLower.includes('облач') || addressLower.includes('cloud')) {
    return 'Облачное хранение';
  }
  
  // Если не найдено, возвращаем адрес или "Облачное хранение" по умолчанию
  return 'Облачное хранение';
};

const CancelSurveyModal = ({
  isOpen,
  onClose,
  selectedReason,
  onSelectReason,
  comment,
  onCommentChange,
  onSubmit,
  isSubmitting,
  error,
  orderId,
  orderDetails,
  isLoadingDetails,
}) => {
  const [pickupMethod, setPickupMethod] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const createMovingMutation = useCreateMoving();
  const createAdditionalServicePaymentMutation = useCreateAdditionalServicePayment();

  // Проверяем, нужно ли показывать выбор способа получения вещей
  const needsPickupMethod = orderDetails && !orderDetails.hasGazelleTo && !orderDetails.hasPendingToMovingOrder;

  // Сбрасываем состояние при закрытии
  useEffect(() => {
    if (!isOpen) {
      setPickupMethod(null);
      setDeliveryDate('');
      setDeliveryAddress('');
    }
  }, [isOpen]);

  const handleDeliverySubmit = async () => {
    if (!deliveryDate) {
      return;
    }

    try {
      await createMovingMutation.mutateAsync({
        orderId,
        movingDate: deliveryDate,
        status: 'PENDING_TO',
        address: deliveryAddress || null
      });

      const paymentResult = await createAdditionalServicePaymentMutation.mutateAsync({
        orderId,
        serviceType: 'GAZELLE_TO'
      });
      
      // После успешной оплаты автоматически отправляем запрос на отмену
      if (paymentResult?.payment_page_url) {
        onSubmit();
        window.location.href = paymentResult.payment_page_url;
      }
    } catch (error) {
      console.error('Ошибка при создании доставки:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-[#273655]">Почему решили отменить?</DialogTitle>
          <DialogDescription>
            Ваш ответ поможет улучшить сервис и условия хранения. Пожалуйста, выберите подходящую причину.
          </DialogDescription>
        </DialogHeader>

        {isLoadingDetails ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#273655]"></div>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {CANCEL_REASON_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition ${
                    selectedReason === option.value
                      ? 'border-[#1e2c4f] bg-[#f5f7ff]'
                      : 'border-gray-200 hover:border-[#c7d2fe]'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancel-reason"
                    className="mt-1 h-4 w-4"
                    checked={selectedReason === option.value}
                    onChange={() => onSelectReason(option.value)}
                  />
                  <span className="text-sm text-gray-800">{option.label}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'other' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Расскажите подробнее</p>
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-[#1e2c4f] focus:outline-none"
                  rows={4}
                  placeholder="Например: хочу поделиться предложениями по улучшению..."
                  value={comment}
                  onChange={(e) => onCommentChange(e.target.value)}
                />
              </div>
            )}

            {/* Блок выбора способа получения вещей */}
            {selectedReason && needsPickupMethod && (
              <div className="mt-6 space-y-4 border-t pt-4">
                <p className="text-sm font-medium text-gray-700">Как вы хотите получить вещи?</p>
                
                <div className="space-y-3">
                  <label
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition ${
                      pickupMethod === 'self'
                        ? 'border-[#1e2c4f] bg-[#f5f7ff]'
                        : 'border-gray-200 hover:border-[#c7d2fe]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pickup-method"
                      className="mt-1 h-4 w-4"
                      checked={pickupMethod === 'self'}
                      onChange={() => setPickupMethod('self')}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800 block">Забрать вещи самому</span>
                      {orderDetails?.warehouseAddress && (
                        <span className="text-xs text-gray-600 mt-1 block">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {orderDetails.warehouseAddress}
                        </span>
                      )}
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition ${
                      pickupMethod === 'delivery'
                        ? 'border-[#1e2c4f] bg-[#f5f7ff]'
                        : 'border-gray-200 hover:border-[#c7d2fe]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="pickup-method"
                      className="mt-1 h-4 w-4"
                      checked={pickupMethod === 'delivery'}
                      onChange={() => setPickupMethod('delivery')}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800 block">Заказать доставку</span>
                      {orderDetails?.gazelleToPrice && (
                        <span className="text-xs text-gray-600 mt-1 block">
                          Стоимость: {orderDetails.gazelleToPrice.toLocaleString('ru-RU')} ₸
                        </span>
                      )}
                    </div>
                  </label>
                </div>

                {/* Форма для доставки */}
                {pickupMethod === 'delivery' && (
                  <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <DatePicker
                        label="Дата доставки"
                        value={deliveryDate}
                        onChange={setDeliveryDate}
                        placeholder="Выберите дату доставки"
                        minDate={new Date().toISOString().split('T')[0]}
                        allowFutureDates={true}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Адрес доставки (необязательно)
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-[#1e2c4f] focus:outline-none"
                        placeholder="Введите адрес доставки"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <DialogFooter className="gap-2 sm:gap-4">
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Закрыть
              </Button>
              {pickupMethod === 'delivery' && selectedReason ? (
                <Button
                  onClick={handleDeliverySubmit}
                  disabled={isSubmitting || !deliveryDate || createMovingMutation.isPending || createAdditionalServicePaymentMutation.isPending}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                  {(createMovingMutation.isPending || createAdditionalServicePaymentMutation.isPending)
                    ? 'Обработка…' 
                    : `Оплатить доставку (${orderDetails?.gazelleToPrice?.toLocaleString('ru-RU') || 0} ₸)`}
                </Button>
              ) : (
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitting || (needsPickupMethod && !pickupMethod)}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                  {isSubmitting ? 'Отправка…' : 'Подтвердить отмену'}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Contracts = () => {
  const navigate = useNavigate(); // <— добавь
  // ...
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isCancelSurveyOpen, setIsCancelSurveyOpen] = useState(false);
  const [pendingCancelData, setPendingCancelData] = useState(null);
  const [selectedCancelReason, setSelectedCancelReason] = useState('');
  const [cancelReasonComment, setCancelReasonComment] = useState('');
  const [cancelFormError, setCancelFormError] = useState('');
  const { data: contracts, isLoading } = useContracts();
  const cancelContractMutation = useCancelContract();
  const downloadContractMutation = useDownloadContract();
  const downloadItemFileMutation = useDownloadItemFile();
  
  // Состояние для модального окна деталей договора
  const [selectedContract, setSelectedContract] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Получаем детали выбранного договора
  const { 
    data: contractDetails, 
    isLoading: isLoadingDetails, 
    error: detailsError 
  } = useContractDetails(
    selectedContract?.order_id || pendingCancelData?.orderId,
    { enabled: (!!selectedContract && isDetailModalOpen) || (!!pendingCancelData?.orderId && isCancelSurveyOpen) }
  );

  const handleCancelContract = ({ orderId, documentId, cancelReason, cancelComment }, callbacks = {}) => {
    cancelContractMutation.mutate({ orderId, documentId, cancelReason, cancelComment }, callbacks);
  };

  const handleDownloadContract = (documentId) => {
    downloadContractMutation.mutate(documentId);
  };

  const handleDownloadItemFile = (itemId) => {
    downloadItemFileMutation.mutate(itemId);
  };
  
  const handleRowClick = (contract) => {
    setSelectedContract(contract);
    setIsDetailModalOpen(true);
  };
  
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
  };

  const resetCancelSurvey = () => {
    setPendingCancelData(null);
    setSelectedCancelReason('');
    setCancelReasonComment('');
    setCancelFormError('');
  };

  const openCancelSurvey = (row) => {
    // Получаем первый контракт для отмены
    const sortedContracts = (row.contracts || []).sort((a, b) => {
      return a.contract_id - b.contract_id;
    });
    const firstContract = sortedContracts.length > 0 ? sortedContracts[0] : null;

    if (!firstContract) {
      setCancelFormError('Не найдено контракта для отмены.');
      return;
    }

    setPendingCancelData({
      orderId: row.order_id,
      documentId: firstContract.document_id,
    });
    setIsCancelSurveyOpen(true);
    setSelectedCancelReason('');
    setCancelReasonComment('');
    setCancelFormError('');
  };

  const closeCancelSurvey = () => {
    setIsCancelSurveyOpen(false);
    resetCancelSurvey();
  };

  const handleSubmitCancelSurvey = () => {
    if (!pendingCancelData?.orderId || !pendingCancelData?.documentId) {
      setCancelFormError('Не удалось определить договор. Попробуйте ещё раз.');
      return;
    }

    if (!selectedCancelReason) {
      setCancelFormError('Пожалуйста, выберите причину отмены.');
      return;
    }

    if (selectedCancelReason === 'other' && !cancelReasonComment.trim()) {
      setCancelFormError('Пожалуйста, опишите причину в комментарии.');
      return;
    }

    setCancelFormError('');
    handleCancelContract(
      {
        orderId: pendingCancelData.orderId,
        documentId: pendingCancelData.documentId,
        cancelReason: selectedCancelReason,
        cancelComment: cancelReasonComment.trim(),
      },
      {
        onSuccess: () => {
          closeCancelSurvey();
        },
      }
    );
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ru-RU');
  };
  const handleCancelClick = (e, row) => {
    e.stopPropagation();
    const payment = (row?.payment_status || '').toUpperCase();
    if (payment !== 'PAID') {
      setIsDebtModalOpen(true);
      return;
    }
    
    // Если row уже содержит contract_data (из десктопа), используем его
    // Иначе получаем первый контракт из массива contracts
    if (row.contract_data?.document_id) {
      openCancelSurvey(row);
    } else {
      openCancelSurvey(row);
    }
  };

  const { isMobile } = useDeviceType();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#273655]"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-8 mt-[-50px]">
      <div className="w-full max-w-7xl bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <MonthSelector />

        {/* Desktop table */}
        {!isMobile && (
          <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-100">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-700 text-sm font-medium">
                  <th className="text-left px-6 py-4 font-medium">НОМЕР ЗАЯВКИ</th>
                  <th className="text-left px-6 py-4 font-medium">СКЛАД</th>
                  <th className="text-left px-6 py-4 font-medium">ТИП ПОМЕЩЕНИЯ</th>
                  <th className="text-left px-6 py-4 font-medium">ПЕРИОД АРЕНДЫ</th>
                  <th className="text-left px-6 py-4 font-medium">СТАТУС</th>
                  <th className="text-left px-6 py-4 font-medium">КОНТРАКТЫ</th>
                  <th className="text-left px-6 py-4 text-center font-medium">ДЕЙСТВИЯ</th>
                </tr>
              </thead>
              <tbody>
                {contracts && contracts.map((row, idx) => {
                  // Получаем первый контракт (самый ранний по created_at)
                  const sortedContracts = (row.contracts || []).sort((a, b) => {
                    // Сортируем по contract_id (меньший ID = раньше создан)
                    return a.contract_id - b.contract_id;
                  });
                  const firstContract = sortedContracts.length > 0 ? sortedContracts[0] : null;
                  const hasMultipleContracts = (row.contracts || []).length > 1;

                  return (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer"
                      onClick={() => handleRowClick(row)}
                    >
                      <td className="px-6 py-5 font-medium text-gray-900 text-base">
                        <div className="flex items-center gap-3">
                          <FileText className="w-9 h-9 flex-shrink-0 text-[#273655]" />
                          <span 
                            className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(row);
                            }}
                          >
                            {`Заявка № ${row.order_id}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-600 text-sm">{getWarehouseName(row.warehouse_address)}</td>
                      <td className="px-6 py-5 text-gray-600 text-sm">{row.storage_name || '-'}</td>
                      <td className="px-6 py-5 text-gray-600 text-sm">{`${formatDate(row.rental_period.start_date)} - ${formatDate(row.rental_period.end_date)}`}</td>
                      <td className="px-6 py-5">
                        <StatusBadge status={row.order_status} type="order" />
                      </td>
                      <td className="px-6 py-5 text-gray-600 text-sm">
                        <div className="flex flex-col gap-1">
                          {row.contracts && row.contracts.length > 0 ? (
                            <>
                              <Badge variant="outline" className="text-xs w-fit">
                                {row.contracts.length} {row.contracts.length === 1 ? 'контракт' : 'контракта'}
                              </Badge>
                              {hasMultipleContracts && (
                                <span className="text-xs text-gray-500">Нажмите для просмотра</span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">Нет контрактов</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          {firstContract && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadContract(firstContract.document_id);
                              }}
                              disabled={downloadContractMutation.isPending}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1e2c4f] hover:bg-[#162540] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              <Download size={16} className="mr-2" />
                              {downloadContractMutation.isPending ? 'Загрузка...' : 'Скачать'}
                            </button>
                          )}
                          {row.order_status === 'ACTIVE' && firstContract && row.cancel_status === 'NO' && (
                              <button
                                  onClick={(e) => handleCancelClick(e, { ...row, contract_data: { document_id: firstContract.document_id } })}
                                  disabled={cancelContractMutation.isPending}
                                  className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md shadow-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                              >
                                {cancelContractMutation.isPending ? 'Отмена...' : 'Отменить'}
                              </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        {isMobile && (
          <div className="space-y-4">
            {contracts && contracts.map((row, idx) => {
              // Получаем первый контракт (самый ранний по created_at)
              const sortedContracts = (row.contracts || []).sort((a, b) => {
                // Сортируем по contract_id (меньший ID = раньше создан)
                return a.contract_id - b.contract_id;
              });
              const firstContract = sortedContracts.length > 0 ? sortedContracts[0] : null;

              return (
                <div
                  key={idx}
                  className="border rounded-2xl p-4 bg-white shadow-sm"
                  onClick={() => handleRowClick(row)}
                  role="button"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-9 h-9 flex-shrink-0 text-[#273655]" />
                    <span 
                      className="text-base font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(row);
                      }}
                    >
                      {`Заявка № ${row.order_id}`}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                      <span><strong>Склад:</strong> {getWarehouseName(row.warehouse_address)}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-700">
                      <Package className="w-4 h-4 mt-0.5 text-gray-500" />
                      <span><strong>Тип помещения:</strong> {row.storage_name || '-'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                      <span><strong>Период аренды:</strong> {`${formatDate(row.rental_period.start_date)} - ${formatDate(row.rental_period.end_date)}`}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-700">
                      <FileText className="w-4 h-4 mt-0.5 text-gray-500" />
                      <span>
                        <strong>Контракты:</strong> {row.contracts && row.contracts.length > 0 
                          ? `${row.contracts.length} ${row.contracts.length === 1 ? 'контракт' : 'контракта'}`
                          : 'Нет контрактов'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={row.order_status} type="order" />
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {firstContract && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadContract(firstContract.document_id);
                        }}
                        disabled={downloadContractMutation.isPending}
                        className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-[#1e2c4f] text-white font-medium hover:bg-[#162540] transition-colors disabled:opacity-50"
                      >
                        {downloadContractMutation.isPending ? 'Загрузка…' : (
                          <span className="inline-flex items-center gap-2"><Download className="w-4 h-4" /> Скачать</span>
                        )}
                      </button>
                    )}
                    {row.order_status === 'ACTIVE' && firstContract && row.cancel_status === "NO" && (
                        <button
                            onClick={(e) => handleCancelClick(e, { ...row, contract_data: { document_id: firstContract.document_id } })}
                            disabled={cancelContractMutation.isPending}
                            className="w-full h-11 inline-flex items-center justify-center rounded-lg border border-red-600 text-red-600 bg-white font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {cancelContractMutation.isPending ? 'Отмена…' : 'Отменить'}
                        </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Модальное окно с деталями договора */}
      <ContractDetailsModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        contract={selectedContract}
        details={contractDetails}
        isLoading={isLoadingDetails}
        error={detailsError}
        onDownloadItemFile={handleDownloadItemFile}
        isDownloadingItem={downloadItemFileMutation.isPending}
        onDownloadContract={handleDownloadContract}
      />
      <CancelSurveyModal
        isOpen={isCancelSurveyOpen}
        onClose={closeCancelSurvey}
        selectedReason={selectedCancelReason}
        onSelectReason={setSelectedCancelReason}
        comment={cancelReasonComment}
        onCommentChange={setCancelReasonComment}
        onSubmit={handleSubmitCancelSurvey}
        isSubmitting={cancelContractMutation.isPending}
        error={cancelFormError}
        orderId={pendingCancelData?.orderId}
        orderDetails={contractDetails}
        isLoadingDetails={isLoadingDetails}
      />
      <Dialog open={isDebtModalOpen} onOpenChange={setIsDebtModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Нельзя отменить договор
            </DialogTitle>
            <DialogDescription>
              По данному заказу есть <b>неоплаченная задолженность</b>. Пожалуйста, оплатите долг, а затем повторите отмену.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDebtModalOpen(false)}>Понятно</Button>
            <Button
                onClick={() => {
                  setIsDebtModalOpen(false);
                  // Переход к оплатам в личном кабинете
                  navigate('/personal-account', { state: { activeSection: 'payments' } });
                }}
            >
              Перейти к оплате
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>


  );
};

export default Contracts; 