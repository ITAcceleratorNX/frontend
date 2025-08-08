import React, { useState, useRef, useEffect } from 'react';
import smallBox from '../../../assets/small_box.png';
import { useContracts, useCancelContract, useDownloadContract, useContractDetails, useDownloadItemFile } from '../../../shared/lib/hooks/use-orders';
import { 
  Check, 
  Download, 
  FileText, 
  Package, 
  Truck, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  X, 
  RefreshCcw, 
  Clock, 
  Ban, 
  FileCheck 
} from 'lucide-react';
import image46 from '../../../assets/image_46.png';
import documentImg from '../../../assets/Document.png';
import zavoz1 from '../../../assets/zavoz1.png';
import zavoz2 from '../../../assets/zavoz2.png';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useDeviceType } from '../../../shared/lib/hooks/useWindowWidth';

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
    'PENDING_FROM': 'В ожидании (отправка)',
    'PENDING_TO': 'В ожидании (доставка)',
    'IN_PROGRESS': 'В процессе',
    'DELIVERED': 'Доставлено',
    'CANCELLED': 'Отменено'
  };
  return statusMap[status] || status;
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
  const [selected, setSelected] = useState('АВГУСТ');
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

const ContractDetailsModal = ({ isOpen, onClose, contract, details, isLoading, error, onDownloadItemFile, isDownloadingItem }) => {
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
                <p className="text-sm font-medium text-gray-600">Статус договора:</p>
                <Badge 
                  className={`${statusStyles[getContractStatusInfo(contract.contract_status).style]} justify-center py-2 px-3`}
                >
                  {getContractStatusInfo(contract.contract_status).icon}
                  {contract.contract_status}
                </Badge>
              </div>
              
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
            </div>
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
                        const statusVariant = 
                          moving.status === 'DELIVERED' ? 'success' : 
                          moving.status === 'CANCELLED' ? 'danger' :
                          moving.status === 'IN_PROGRESS' ? 'info' : 'warning';

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
                            const statusVariant = 
                              moving.status === 'DELIVERED' ? 'success' : 
                              moving.status === 'CANCELLED' ? 'danger' :
                              moving.status === 'IN_PROGRESS' ? 'info' : 'warning';

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

const Contracts = () => {
  const { data: contracts, isLoading, error } = useContracts();
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
    selectedContract?.order_id,
    { enabled: !!selectedContract && isDetailModalOpen }
  );

  const handleCancelContract = (orderId, documentId) => {
    cancelContractMutation.mutate({ orderId, documentId });
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

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ru-RU');
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
                  <th className="text-left px-6 py-4 font-medium">НАЗВАНИЕ</th>
                  <th className="text-left px-6 py-4 font-medium">ЛОКАЦИЯ-НОМЕР БОКСА</th>
                  <th className="text-left px-6 py-4 font-medium">ВРЕМЯ</th>
                  <th className="text-left px-6 py-4 text-center font-medium">ДЕЙСТВИЯ</th>
                </tr>
              </thead>
              <tbody>
                {contracts && contracts.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleRowClick(row)}
                  >
                    <td className="flex items-center gap-3 px-6 py-5 font-medium text-gray-900 text-base">
                      <img src={smallBox} alt="box" className="w-9 h-9 flex-shrink-0" />
                      <span className="text-blue-600 hover:text-blue-800 transition-colors">{`Individual Storage (${row.total_volume} м²)`}</span>
                    </td>
                    <td className="px-6 py-5 text-gray-600 text-sm">{row.warehouse_address}</td>
                    <td className="px-6 py-5 text-gray-600 text-sm">{`${formatDate(row.rental_period.start_date)} - ${formatDate(row.rental_period.end_date)}`}</td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadContract(row.contract_data.document_id);
                          }}
                          disabled={downloadContractMutation.isPending}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1e2c4f] hover:bg-[#162540] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <Download size={16} className="mr-2" />
                          {downloadContractMutation.isPending ? 'Загрузка...' : 'Скачать'}
                        </button>
                        {row.order_status === 'ACTIVE' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelContract(row.order_id, row.contract_data.document_id);
                            }}
                            disabled={cancelContractMutation.isPending}
                            className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md shadow-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {cancelContractMutation.isPending ? 'Отмена...' : 'Отменить'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        {isMobile && (
          <div className="space-y-4">
            {contracts && contracts.map((row, idx) => (
              <div
                key={idx}
                className="border rounded-2xl p-4 bg-white shadow-sm"
                onClick={() => handleRowClick(row)}
                role="button"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img src={smallBox} alt="box" className="w-9 h-9 flex-shrink-0" />
                  <div className="text-base font-semibold text-[#1e2c4f]">
                    {`Individual Storage (${row.total_volume} м²)`}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                    <span>{row.warehouse_address}</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-700">
                    <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                    <span>{`${formatDate(row.rental_period.start_date)} - ${formatDate(row.rental_period.end_date)}`}</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadContract(row.contract_data.document_id);
                    }}
                    disabled={downloadContractMutation.isPending}
                    className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-[#1e2c4f] text-white font-medium hover:bg-[#162540] transition-colors disabled:opacity-50"
                  >
                    {downloadContractMutation.isPending ? 'Загрузка…' : (
                      <span className="inline-flex items-center gap-2"><Download className="w-4 h-4" /> Скачать</span>
                    )}
                  </button>
                  {row.order_status === 'ACTIVE' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelContract(row.order_id, row.contract_data.document_id);
                      }}
                      disabled={cancelContractMutation.isPending}
                      className="w-full h-11 inline-flex items-center justify-center rounded-lg border border-red-600 text-red-600 bg-white font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {cancelContractMutation.isPending ? 'Отмена…' : 'Отменить'}
                    </button>
                  )}
                </div>
              </div>
            ))}
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
      />
    </div>
  );
};

export default Contracts; 