import React, { useState, useEffect } from 'react';
import {
  getContractStatusText,
  getCargoMarkText 
} from '../../../shared/lib/types/orders';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '../../../components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { useExtendOrder, useDownloadContract, useCancelContract, useContractDetails } from '../../../shared/lib/hooks/use-orders';
import { useCreateMoving, useCreateAdditionalServicePayment } from '../../../shared/lib/hooks/use-payments';
import { EditOrderModal } from '@/pages/personal-account/ui/EditOrderModal.jsx';
import { Zap, CheckCircle, Star, Download, Plus, Truck, Package, ChevronDown, ChevronUp, FileText, AlertTriangle, MapPin, Eye, Tag } from 'lucide-react';
import { showExtendOrderSuccess, showCancelExtensionSuccess, showExtendOrderError } from '../../../shared/lib/utils/notifications';
import OrderDeleteModal from './OrderDeleteModal';
import {useNavigate} from "react-router-dom";
import OrderCancelTimer from '../../../shared/components/OrderCancelTimer';
import { ordersApi } from '../../../shared/api/ordersApi';
import DatePicker from '../../../shared/ui/DatePicker';
import sumkaImg from '../../../assets/cloud-tariffs/sumka.png';
import motorcycleImg from '../../../assets/cloud-tariffs/motorcycle.png';
import bicycleImg from '../../../assets/cloud-tariffs/bicycle.png';
import furnitureImg from '../../../assets/cloud-tariffs/furniture.png';
import shinaImg from '../../../assets/cloud-tariffs/shina.png';
import sunukImg from '../../../assets/cloud-tariffs/sunuk.png';
import garazhImg from '../../../assets/cloud-tariffs/garazh.png';
import skladImg from '../../../assets/cloud-tariffs/sklad.png';

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

const getStorageTypeText = (type) => {
  if (type === 'INDIVIDUAL') {
    return 'Индивидуальное';
  } else if (type === 'CLOUD') {
    return 'Облачное'
  }
  return type;
};

const getVolumeUnit = (storageType) => {
  return storageType === 'INDIVIDUAL' ? 'м²' : 'м³';
};

const UserOrderCard = ({ order, onPayOrder, depositPrice = 0 }) => {
  const navigate = useNavigate();
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [isCancelExtendDialogOpen, setIsCancelExtendDialogOpen] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState("1");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);
  const [downloadingItemId, setDownloadingItemId] = useState(null);
  const [isContractsExpanded, setIsContractsExpanded] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isCancelSurveyOpen, setIsCancelSurveyOpen] = useState(false);
  const [pendingCancelData, setPendingCancelData] = useState(null);
  const [selectedCancelReason, setSelectedCancelReason] = useState('');
  const [cancelReasonComment, setCancelReasonComment] = useState('');
  const [cancelFormError, setCancelFormError] = useState('');

  // Хук для работы с API продления заказа
  const extendOrderMutation = useExtendOrder();
  // Хук для скачивания договора
  const downloadContractMutation = useDownloadContract();
  // Хук для отмены договора
  const cancelContractMutation = useCancelContract();

  // Обработчик продления заказа
  const handleExtendOrder = async () => {
    try {
      await extendOrderMutation.mutateAsync({
        is_extended: true,
        order_id: order.id,
        months: parseInt(selectedMonths)
      });
      showExtendOrderSuccess();
      setIsExtendDialogOpen(false);
      // Обновляем страницу после успешного выполнения запроса
      window.location.reload();
    } catch (error) {
      showExtendOrderError();
      console.error('Ошибка при продлении заказа:', error);
    }
  };

  // Обработчик отмены продления заказа
  const handleCancelExtension = async () => {
    try {
      await extendOrderMutation.mutateAsync({
        is_extended: false,
        order_id: order.id
      });
      showCancelExtensionSuccess();
      setIsCancelExtendDialogOpen(false);
      // Обновляем страницу после успешного выполнения запроса
      window.location.reload();
    } catch (error) {
      showExtendOrderError();
      console.error('Ошибка при отмене продления заказа:', error);
    }
  };

  // Обработчик скачивания файла предмета
  const handleDownloadItem = async (itemId) => {
    if (!itemId) return;
    
    try {
      setDownloadingItemId(itemId);
      const { blob, contentType, contentDisposition } = await ordersApi.downloadItemFile(itemId);
      
      // Извлекаем имя файла из Content-Disposition заголовка, если он есть
      let fileName = `order_item_${itemId}.docx`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Создаем blob с правильным MIME-типом
      const typedBlob = new Blob([blob], { 
        type: contentType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Создаем временную ссылку для скачивания
      const url = window.URL.createObjectURL(typedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Очищаем
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при скачивании файла предмета:', error);
      alert('Не удалось скачать файл предмета');
    } finally {
      setDownloadingItemId(null);
    }
  };

  // Обработчик скачивания договора
  const handleDownloadContract = (documentId) => {
    if (!documentId) return;
    downloadContractMutation.mutate(documentId);
  };

  // Получаем детали заказа для модалки отмены
  const { 
    data: contractDetails, 
    isLoading: isLoadingDetails, 
    error: detailsError 
  } = useContractDetails(
    pendingCancelData?.orderId || order.id,
    { enabled: isCancelSurveyOpen }
  );

  // Обработчик отмены договора
  const handleCancelContract = ({ orderId, documentId, cancelReason, cancelComment, selfPickupDate }, callbacks = {}) => {
    cancelContractMutation.mutate({ orderId, documentId, cancelReason, cancelComment, selfPickupDate }, callbacks);
  };

  const resetCancelSurvey = () => {
    setPendingCancelData(null);
    setSelectedCancelReason('');
    setCancelReasonComment('');
    setCancelFormError('');
  };

  const openCancelSurvey = () => {
    // Получаем первый контракт для отмены
    const sortedContracts = (order.contracts || []).sort((a, b) => {
      const aId = a.contract_id || a.id || 0;
      const bId = b.contract_id || b.id || 0;
      return aId - bId;
    });
    const firstContract = sortedContracts.length > 0 ? sortedContracts[0] : null;

    if (!firstContract || !firstContract.document_id) {
      setCancelFormError('Не найдено контракта для отмены.');
      return;
    }

    setPendingCancelData({
      orderId: order.id,
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

  const handleSubmitCancelSurvey = (selfPickupDate) => {
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
        selfPickupDate: selfPickupDate || null,
      },
      {
        onSuccess: () => {
          closeCancelSurvey();
          window.location.reload();
        },
      }
    );
  };

  const handleCancelClick = () => {
    // Проверяем статус оплаты
    if (order.payment_status !== 'PAID') {
      setIsDebtModalOpen(true);
      return;
    }
    
    openCancelSurvey();
  };

// --- Moving statuses helpers (JS) ---
  const MOVING_STATUS_TEXT = {
    PENDING:  'Ожидает назначения курьера',
    COURIER_ASSIGNED: 'Курьер назначен',
    COURIER_IN_TRANSIT: 'Курьер в пути',
    COURIER_AT_CLIENT: 'Курьер у клиента',
    IN_PROGRESS:   'В пути',
    DELIVERED:     'Доставлено',
    FINISHED: 'Завершено',
    CANCELLED:     'Отменено',
  };

  function getMovingStatusText(s, direction) {
    const baseText = MOVING_STATUS_TEXT[s] || s;
    if (s === 'PENDING') {
      return direction === 'TO_CLIENT' ? 'Ожидает доставки' : 'Ожидает забора';
    }
    if (s === 'IN_PROGRESS') {
      return direction === 'TO_CLIENT' ? 'В пути к клиенту' : 'В пути к складу';
    }
    if (s === 'DELIVERED') {
      return direction === 'TO_CLIENT' ? 'Доставлено клиенту' : 'Доставлено на склад';
    }
    return baseText;
  }

  function getMovingStatusBadgeClass(s) {
    if (s === 'CANCELLED') return 'bg-red-100 text-red-700 border border-red-200';
    if (s === 'DELIVERED' || s === 'FINISHED') return 'bg-green-100 text-green-700 border border-green-200';
    if (s === 'IN_PROGRESS' || s === 'COURIER_IN_TRANSIT' || s === 'COURIER_AT_CLIENT') return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (s === 'PENDING' || s === 'COURIER_ASSIGNED') return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  }

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

  const totalPriceOfServices = order.services.reduce((total, service) => {
    if (order.storage?.storage_type === 'CLOUD' && service.type !== 'GAZELLE_TO') {
      return total;
    }
    if (service.OrderService) {
      return total + (parseFloat(service.OrderService.total_price));
    }
    return total;
  }, 0)

  // Функция для получения изображения и названия тарифа по tariff_type
  const getTariffInfo = (tariffType) => {
    if (!tariffType || tariffType === 'CUSTOM') return { image: null, name: 'Свои габариты' };
    
    const tariffMap = {
      'CLOUD_TARIFF_SUMKA': { image: sumkaImg, name: 'Хранения сумки / коробки вещей' },
      'CLOUD_TARIFF_SHINA': { image: shinaImg, name: 'Шины' },
      'CLOUD_TARIFF_MOTORCYCLE': { image: motorcycleImg, name: 'Хранение мотоцикла' },
      'CLOUD_TARIFF_BICYCLE': { image: bicycleImg, name: 'Хранение велосипед' },
      'CLOUD_TARIFF_SUNUK': { image: sunukImg, name: 'Сундук до 1 м³' },
      'CLOUD_TARIFF_FURNITURE': { image: furnitureImg, name: 'Шкаф до 2 м³' },
      'CLOUD_TARIFF_SKLAD': { image: skladImg, name: 'Кладовка до 3 м³' },
      'CLOUD_TARIFF_GARAZH': { image: garazhImg, name: 'Гараж до 9м³' }
    };
    
    return tariffMap[tariffType] || { image: null, name: 'Свои габариты' };
  };

  // Расчет количества месяцев
  const calculateMonths = () => {
    if (!order.start_date || !order.end_date) return 0;
    try {
      const start = new Date(order.start_date);
      const end = new Date(order.end_date);
      const yearsDiff = end.getFullYear() - start.getFullYear();
      const monthsDiff = end.getMonth() - start.getMonth();
      const daysDiff = end.getDate() - start.getDate();
      let totalMonths = yearsDiff * 12 + monthsDiff;
      if (daysDiff > 15) {
        totalMonths += 1;
      }
      return Math.max(1, totalMonths);
    } catch (error) {
      return 0;
    }
  };

  const months = calculateMonths();
  // total_price - это стоимость аренды (без скидки)
  // discount_amount - это скидка от полной суммы (аренда + услуги + депозит)
  // Исходная цена без скидки = аренда + услуги + депозит
  const originalPrice = Number(order.total_price) + Number(totalPriceOfServices) + Number(depositPrice);
  // Итоговая цена = исходная цена - скидка
  const discountAmount = Number(order.discount_amount || 0);
  const totalPrice = Math.max(0, originalPrice - discountAmount);
  const hasPromoDiscount = discountAmount > 0;
  
  // Проверяем, есть ли услуга доставки (GAZELLE_FROM)
  const hasDeliveryService = order.services && order.services.some(service => 
    service.type === 'GAZELLE_FROM' || service.type === 'GAZELLE_TO'
  );

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
      // Старые типы для совместимости
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
      case 'GAZELLE_FROM':
        return 'Доставка';
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
      default:
        return 'Услуга';
    }
  };


  const canPay = order.status === 'PROCESSING' && order.payment_status === 'UNPAID' && order.contract_status === 'SIGNED';

  // Проверяем наличие дополнительных услуг (включая новый массив services)
  const hasAdditionalServices = order.is_selected_moving || order.is_selected_package || (order.services && order.services.length > 0);

  // Определяем стили карточки в зависимости от статуса
  const isPendingExtension = order.extension_status === 'PENDING';
  
  // Определяем фон карточки: зеленый градиент для активных/оплаченных, серый для неоплаченных/в обработке
  const getCardBackground = () => {
    if (order.status === 'ACTIVE') {
      return 'bg-gradient-to-b from-[#00A991] to-[#004743]'; // Зеленый градиент для активных/оплаченных
    } else {
      return 'bg-[#999999]'; // Серый для неоплаченных/в обработке
    }
  };

  const cardBackground = getCardBackground();

  return (
    <div className={`${cardBackground} rounded-3xl p-6 text-white relative overflow-hidden shadow-lg`}>
      {/* Статусные бейджи вверху - белые кнопки */}
      <div className="flex items-center gap-2 mb-6">
        {order.status === 'ACTIVE' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700">
            <Zap className="w-3.5 h-3.5 text-gray-500" />
            Активный
          </span>
        )}
        {['APPROVED', 'PROCESSING'].includes(order.status) && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700">
            <CheckCircle className="w-4 h-4 text-gray-500" />
            Подтверждено
          </span>
        )}
        {['CANCELED', 'FINISHED'].includes(order.status) && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700">
            <FileText className="w-4 h-4 text-gray-500"/>
            В архиве
          </span>
        )}
        {order.status === 'INACTIVE' && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700">
            <Star className="w-4 h-4 text-gray-500" />
            В обработке у менеджера
          </span>
        )}
        {order.payment_status === 'PAID' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700">
            <CheckCircle className="w-3.5 h-3.5 text-gray-500" />
            Оплачен
          </span>
        )}
        {order.payment_status === 'UNPAID' && (
          <span className="inline-flex items-center px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-700">
            Не оплачено
          </span>
        )}
      </div>

      {/* Заголовок заказа и белый квадрат с идентификатором бокса */}
      <div className="flex items-start justify-between mb-10 relative">
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">Заказ №{order.id}</h3>
          <p className="text-white/90 text-xs mb-1">Создан: {formatDate(order.created_at)}</p>
          <p className="text-white/90 text-sm mb-1">Тип: {getStorageTypeText(order.storage?.storage_type || 'INDIVIDUAL')}</p>
          <p className="text-white/90 text-sm">Объем: {order.total_volume} {getVolumeUnit(order.storage?.storage_type || 'INDIVIDUAL')}</p>
        </div>
        {/* Белый квадрат с идентификатором бокса или иконка тарифа для облачного хранения */}
        {order.storage?.storage_type === 'CLOUD' ? (
          (() => {
            const tariffInfo = getTariffInfo(order.tariff_type);
            
            if (tariffInfo.image) {
              return (
                <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-4 p-4">
                  <img 
                    src={tariffInfo.image} 
                    alt={tariffInfo.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              );
            } else {
              // Для "Свои габариты" показываем текст вместо иконки
              return (
                <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-4 p-3">
                  <span className="text-xs font-bold text-gray-900 text-center leading-tight">Свои габариты</span>
                </div>
              );
            }
          })()
        ) : order.storage && order.storage.name ? (
          <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-4">
            <span className="text-4xl font-bold text-gray-900">{order.storage.name}</span>
          </div>
        ) : null}
      </div>

      {/* Информация о датах и оплате в двух колонках */}
      <div className="mb-10 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-white/90 text-xs">Дата начала:</p>
          <p className="text-white text-sm">{formatDate(order.start_date)}</p>
          <p className="text-white/90 text-xs">Дата окончания:</p>
          <p className="text-white text-sm">{formatDate(order.end_date)}</p>
        </div>
        <div className="space-y-2">
          <p className="text-white/90 text-xs">Стоимость аренды:</p>
          <p className="text-white text-sm">{formatPrice(order.total_price)} 〒</p>
          {/* Информация о промокоде */}
          {order.promo_code && (
            <div className="mt-2">
              <div className="flex items-center gap-1 text-white/90 text-xs">
                <Tag className="w-3 h-3" />
                Промокод:
              </div>
              <p className="text-white text-sm font-medium">{order.promo_code.code}</p>
              {discountAmount > 0 && (
                <p className="text-green-300 text-xs">
                  Скидка: -{formatPrice(discountAmount)} ({order.promo_code.discount_percent}%)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Договоры */}
      {order.contracts && order.contracts.length > 0 && (
        <div className="mb-10">
          <p className="text-white/90 text-sm mb-2">Договоры:</p>
          
          <div className="space-y-2">
            {(() => {
              const sortedContracts = [...order.contracts].sort((a, b) => {
                const aId = a.contract_id || a.id || 0;
                const bId = b.contract_id || b.id || 0;
                return aId - bId;
              });
              
              const displayedContracts = isContractsExpanded ? sortedContracts : sortedContracts.slice(0, 3);
              
              return displayedContracts.map((contract, index) => {
                const contractId = contract.contract_id || contract.id;
                
                return (
                  <div key={contractId || index} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Plus className="w-5 h-5 text-white/90 flex-shrink-0" />
                      <span className="text-white/90 text-sm">
                        #{index + 1}
                        {contract.status && (
                          <span className="ml-2 text-xs text-white/70">
                            ({typeof contract.status === 'string' ? contract.status : getContractStatusText(order.contract_status)})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {contract.url && (
                        <button
                          onClick={() => window.open(`https://${contract.url}`, '_blank')}
                          className="text-white/90 text-sm font-medium hover:text-white transition-colors underline flex items-center gap-1"
                          title="Посмотреть договор"
                        >
                          <Eye className="w-4 h-4" />
                          Посмотреть
                        </button>
                      )}
                      {contract.document_id && (
                        <button
                          onClick={() => handleDownloadContract(contract.document_id)}
                          disabled={downloadContractMutation.isPending}
                          className="text-white/90 text-sm font-medium hover:text-white transition-colors underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          title="Скачать договор"
                        >
                          {downloadContractMutation.isPending ? (
                            <>
                              <span className="animate-spin">⏳</span>
                              Загрузка...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Скачать
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
          
          {order.contracts.length > 3 && (
            <button
              onClick={() => setIsContractsExpanded(!isContractsExpanded)}
              className="mt-3 flex items-center gap-1 text-white/90 text-sm font-medium hover:text-white transition-colors underline"
            >
              {isContractsExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Свернуть
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Показать еще ({order.contracts.length - 3})
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Предметы */}
      {order.items && order.items.length > 0 && (
        <div className="mb-10">
          <p className="text-white/90 text-sm mb-2">Предметы:</p>
          
          <div className="space-y-2">
            {(isItemsExpanded ? order.items : order.items.slice(0, 3)).map((item, index) => (
              <div key={item.id || index} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <Plus className="w-5 h-5 text-white/90 flex-shrink-0" />
                  <span className="text-white/90 text-sm">
                    {item.name || 'Вещь'} {item.volume || order.total_volume} {getVolumeUnit(order.storage?.storage_type || 'INDIVIDUAL')} {item.cargo_mark ? getCargoMarkText(item.cargo_mark) : 'Обычный'}
                  </span>
                </div>
                {item.id && (
                  <button
                    onClick={() => handleDownloadItem(item.id)}
                    disabled={downloadingItemId === item.id}
                    className="text-white/90 text-sm font-medium hover:text-white transition-colors underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {downloadingItemId === item.id ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Скачать
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {order.items.length > 3 && (
            <button
              onClick={() => setIsItemsExpanded(!isItemsExpanded)}
              className="mt-3 flex items-center gap-1 text-white/90 text-sm font-medium hover:text-white transition-colors underline"
            >
              {isItemsExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Свернуть
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Показать еще ({order.items.length - 3})
                </>
              )}
            </button>
          )}
        </div>
      )}


      {/* Заказанные услуги */}
      {order.services && order.services.length > 0 && (
        <>
          <div className="mb-6">
            <p className="text-white/90 text-sm mb-3">Заказанные услуги:</p>
            <div className="bg-white rounded-2xl p-4">
              <div className="space-y-3">
                {order.services.map((service, index) => (
                  <div key={service.id || index}>
                    <div className="flex items-start gap-2">
                      {service.type === 'GAZELLE' || service.type === 'GAZELLE_FROM' || service.type === 'GAZELLE_TO' ? (
                        <Truck className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      ) : service.type === 'BOX_SIZE' ? (
                        <Package className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <span className="text-lg">{getServiceIcon(service.type)}</span>
                      )}
                      <div className="flex-1">
                        <p className="text-[#737373] font-medium text-sm">
                          {service.type === 'GAZELLE_FROM' || service.type === 'GAZELLE_TO' 
                            ? getServiceTypeName(service.type)
                            : (service.description || getServiceTypeName(service.type))}
                        </p>
                        {(order.storage?.storage_type === 'CLOUD' && service.type !== 'GAZELLE_TO') ? (
                          <p className="text-red-600 text-xs mt-1 font-semibold">Бесплатно</p>
                        ) : service.OrderService && service.OrderService.count > 1 ? (
                          <p className="text-gray-600 text-xs mt-1">
                            {formatPrice(service.price || 0)} 〒 * x{service.OrderService.count} = {formatPrice(parseFloat(service.OrderService.total_price))} 〒
                          </p>
                        ) : service.price ? (
                          <p className="text-gray-600 text-xs mt-1">{formatPrice(service.price)} 〒</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 ">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-gray-500 text-xs">Услуг выбрано: {order.services.length}</span>
                  <span className="text-gray-900 font-bold text-sm">Общая стоимость: {formatPrice(totalPriceOfServices)} 〒</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {order.status === 'INACTIVE' && (
        <div className="mb-8 flex justify-end">
          <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-white text-sm font-medium hover:text-white/80 transition-colors underline"
          >
            Редактировать
          </button>
        </div>
      )}

      {/* Итого и кнопки действий */}
      <div className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-white text-sm mb-1">ИТОГ</p>
            {hasPromoDiscount ? (
              <div>
                <p className="text-white/60 text-lg line-through">{formatPrice(originalPrice)} 〒</p>
                <p className="text-white text-3xl font-bold">{formatPrice(totalPrice)} 〒</p>
                <div className="flex items-center gap-1 mt-1">
                  <Tag className="w-3 h-3 text-green-300" />
                  <span className="text-green-300 text-xs">
                    Скидка {order.promo_code?.discount_percent}%: -{formatPrice(discountAmount)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-white text-3xl font-bold">{formatPrice(totalPrice)} 〒</p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {/* Кнопка Оплатить - показывается после подтверждения менеджером (APPROVED или PROCESSING) и если не оплачено */}
            {((order.status === 'PROCESSING' || order.status === 'ACTIVE') && order.payment_status === 'UNPAID' && order.contract_status === 'SIGNED') ? (
              <button
                onClick={() => onPayOrder(order)}
                className="px-6 py-2.5 bg-white text-gray-700 text-sm font-bold rounded-3xl hover:bg-white/90 transition-colors"
              >
                Оплатить
              </button>
            ) : null}
            
            {/* Кнопка Отменить заказ - показывается всегда, кроме активных оплаченных заказов */}
            {!(['ACTIVE', 'CANCELED', 'FINISHED'].includes(order.status) && order.payment_status === 'PAID') ? (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-white/80 text-xs font-medium hover:text-white transition-colors underline"
              >
                Отменить заказ
              </button>
            ) : null}
            
            {/* Кнопка Расторгнуть - для активных оплаченных заказов */}
            {order.status === 'ACTIVE' && order.payment_status === 'PAID' && order.cancel_status === 'NO' ? (
              <button
                onClick={handleCancelClick}
                disabled={cancelContractMutation.isPending}
                className="px-6 py-2.5 bg-[#B0E4DD] text-[#004743] text-sm font-medium rounded-3xl hover:bg-[#9DD4CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Расторгнуть
              </button>
            ) : null}
          </div>
        </div>
        {/* Таймер обратного отсчета до автоотмены */}
        <OrderCancelTimer order={order} />

        {/* Кнопки продления заказа - показываются только если extension_status === CANCELED */}
        {order.extension_status === "PENDING" && (
          <div className="mt-4 flex gap-3 justify-end">
            {/* Диалог для продления заказа */}
            <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-[#273655] text-[#273655] hover:bg-[#273655] hover:text-white transition-colors"
                >
                  Продление заказа
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Продление заказа</DialogTitle>
                  <DialogDescription>
                    Выберите количество месяцев для продления вашего заказа
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Количество месяцев
                    </label>
                    <Select value={selectedMonths} onValueChange={setSelectedMonths}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите количество месяцев" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(6)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i + 1 === 1 ? 'месяц' : (i + 1 < 5 ? 'месяца' : 'месяцев')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsExtendDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    className="bg-[#273655] hover:bg-[#1e2a4a]" 
                    onClick={handleExtendOrder}
                    disabled={extendOrderMutation.isPending}
                  >
                    {extendOrderMutation.isPending ? 'Обработка...' : 'Подтвердить'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Диалог для отмены продления */}
            <Dialog open={isCancelExtendDialogOpen} onOpenChange={setIsCancelExtendDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                >
                  Продление отменяется
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Отмена продления заказа</DialogTitle>
                  <DialogDescription>
                    Вы уверены, что хотите отменить продление заказа?
                  </DialogDescription>
                </DialogHeader>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCancelExtendDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleCancelExtension}
                    disabled={extendOrderMutation.isPending}
                  >
                    {extendOrderMutation.isPending ? 'Обработка...' : 'Да, отменить'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Модальные окна для удаления и подтверждения заказа */}
      <OrderDeleteModal
        isOpen={isDeleteModalOpen}
        order={order}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      <EditOrderModal
          isOpen={isEditModalOpen}
          order={order}
          onSuccess={() => {
            setIsEditModalOpen(false);
            window.location.reload();
            navigate("/personal-account", { state: { activeSection: "payments" } });
          }}
          onCancel={() => setIsEditModalOpen(false)}
      />

      {/* Модальное окно опроса при отмене */}
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

      {/* Модальное окно задолженности */}
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

// Компонент модального окна опроса при отмене
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
  const [selfPickupDate, setSelfPickupDate] = useState('');

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
      setSelfPickupDate('');
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
        status: 'PENDING',
        direction: 'TO_CLIENT',
        address: deliveryAddress || null
      });

      const paymentResult = await createAdditionalServicePaymentMutation.mutateAsync({
        orderId,
        serviceType: 'GAZELLE_TO'
      });
      
      // После успешной оплаты автоматически отправляем запрос на отмену
      if (paymentResult?.payment_page_url) {
        onSubmit(null); // Для доставки не передаём selfPickupDate
        window.location.href = paymentResult.payment_page_url;
      }
    } catch (error) {
      console.error('Ошибка при создании доставки:', error);
    }
  };

  const handleSelfPickupSubmit = () => {
    onSubmit(selfPickupDate || null);
  };

  // Проверка валидности для кнопки подтверждения
  const isSelfPickupValid = pickupMethod === 'self' && selfPickupDate;
  const isSubmitDisabled = isSubmitting || (needsPickupMethod && (!pickupMethod || (pickupMethod === 'self' && !selfPickupDate)));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] max-h-[85vh] overflow-visible p-0 rounded-2xl">
        {/* Заголовок */}
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-lg font-bold text-[#273655]">Расторжение договора</DialogTitle>
          <DialogDescription className="text-xs text-[#8A8A8A]">
            Укажите причину и способ получения вещей
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-3 max-h-[50vh] overflow-y-auto">
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#00A991]"></div>
            </div>
          ) : (
            <>
              {/* Причина отмены - компактные теги */}
              <div className="mb-4">
                <p className="text-sm font-medium text-[#273655] mb-2">Причина</p>
                <div className="flex flex-wrap gap-1.5">
                  {CANCEL_REASON_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onSelectReason(option.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedReason === option.value
                          ? 'bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-white'
                          : 'bg-gray-100 text-[#273655] hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedReason === 'other' && (
                <div className="mb-4">
                  <textarea
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-[#00A991] focus:outline-none resize-none"
                    rows={2}
                    placeholder="Опишите причину..."
                    value={comment}
                    onChange={(e) => onCommentChange(e.target.value)}
                  />
                </div>
              )}

              {/* Блок выбора способа получения вещей */}
              {selectedReason && needsPickupMethod && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-[#273655] mb-2">Как заберёте вещи?</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {/* Самовывоз */}
                    <button
                      type="button"
                      onClick={() => setPickupMethod('self')}
                      className={`p-3 rounded-xl text-left transition-all ${
                        pickupMethod === 'self'
                          ? 'bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Package className={`w-4 h-4 ${pickupMethod === 'self' ? 'text-white' : 'text-[#00A991]'}`} />
                        <span className={`font-medium text-sm ${pickupMethod === 'self' ? 'text-white' : 'text-[#273655]'}`}>Самовывоз</span>
                      </div>
                      <p className={`text-xs ${pickupMethod === 'self' ? 'text-white/80' : 'text-[#8A8A8A]'}`}>Бесплатно</p>
                    </button>

                    {/* Доставка */}
                    <button
                      type="button"
                      onClick={() => setPickupMethod('delivery')}
                      className={`p-3 rounded-xl text-left transition-all ${
                        pickupMethod === 'delivery'
                          ? 'bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-white'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className={`w-4 h-4 ${pickupMethod === 'delivery' ? 'text-white' : 'text-[#00A991]'}`} />
                        <span className={`font-medium text-sm ${pickupMethod === 'delivery' ? 'text-white' : 'text-[#273655]'}`}>Доставка</span>
                      </div>
                      <p className={`text-xs ${pickupMethod === 'delivery' ? 'text-white/80' : 'text-[#8A8A8A]'}`}>
                        {orderDetails?.gazelleToPrice 
                          ? `${orderDetails.gazelleToPrice.toLocaleString('ru-RU')} ₸`
                          : 'Платная'
                        }
                      </p>
                    </button>
                  </div>

                  {/* Форма для самовывоза */}
                  {pickupMethod === 'self' && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-[#26B3AB] to-[#104D4A] rounded-xl space-y-2">
                      {orderDetails?.warehouseAddress && (
                        <div className="flex items-start gap-2 text-white/90">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{orderDetails.warehouseAddress}</span>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-medium text-white/90 block mb-1">Когда заберёте?</label>
                        <input
                          type="date"
                          value={selfPickupDate}
                          onChange={(e) => setSelfPickupDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full h-9 rounded-xl border border-white/30 bg-transparent px-3 text-sm text-white focus:outline-none focus:border-white/60 [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Форма для доставки */}
                  {pickupMethod === 'delivery' && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-[#26B3AB] to-[#104D4A] rounded-xl space-y-2">
                      <div>
                        <label className="text-xs font-medium text-white/90 block mb-1">Дата доставки</label>
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full h-9 rounded-xl border border-white/30 bg-transparent px-3 text-sm text-white focus:outline-none focus:border-white/60 [color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-white/90 block mb-1">Адрес доставки</label>
                        <input
                          type="text"
                          className="w-full h-9 rounded-xl border border-white/30 bg-transparent px-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:border-white/60"
                          placeholder="г. Алматы, Абая 25"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Кнопки */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white rounded-b-2xl flex gap-2">
          <button 
            onClick={onClose} 
            className="flex-1 h-10 rounded-xl border border-gray-200 text-[#273655] text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          {pickupMethod === 'delivery' && selectedReason ? (
            <button
              onClick={handleDeliverySubmit}
              disabled={isSubmitting || !deliveryDate || createMovingMutation.isPending || createAdditionalServicePaymentMutation.isPending}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(createMovingMutation.isPending || createAdditionalServicePaymentMutation.isPending)
                ? 'Обработка…' 
                : `Оплатить ${orderDetails?.gazelleToPrice?.toLocaleString('ru-RU') || 0} ₸`}
            </button>
          ) : (
            <button
              onClick={handleSelfPickupSubmit}
              disabled={isSubmitDisabled}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Отправка…' : 'Подтвердить'}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserOrderCard; 