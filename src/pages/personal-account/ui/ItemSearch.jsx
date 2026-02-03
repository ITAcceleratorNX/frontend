import React, { useState } from 'react';
import { Search, Package, MapPin, User, Phone, Truck, Clock, Edit } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../../shared/lib/toast';
import { ordersApi } from '../../../shared/api/ordersApi';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import EditLocationModal from './EditLocationModal';

const ItemSearch = () => {
  const [filters, setFilters] = useState({
    itemId: '',
    clientName: '',
    boxNumber: '',
    orderId: '',
    phone: '',
    email: '',
    iin: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMeta, setSearchMeta] = useState(null);
  const [searchPage, setSearchPage] = useState(1);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const getCargoMarkText = (mark) => {
    const cargoMap = { NO: 'Обычный', HEAVY: 'Тяжёлый', FRAGILE: 'Хрупкий' };
    return cargoMap[mark] || mark;
  };

  const getMovingStatusText = (status, direction) => {
    if (status === 'PENDING') return direction === 'TO_CLIENT' ? 'В ожидании (со склада)' : 'В ожидании (от клиента)';
    if (status === 'IN_PROGRESS') return direction === 'TO_CLIENT' ? 'В пути к клиенту' : 'В пути к складу';
    if (status === 'DELIVERED') return direction === 'TO_CLIENT' ? 'Доставлено клиенту' : 'Доставлено на склад';
    const statusMap = { COURIER_ASSIGNED: 'Курьер назначен', COURIER_IN_TRANSIT: 'Курьер в пути', COURIER_AT_CLIENT: 'Курьер у клиента', FINISHED: 'Завершено', CANCELLED: 'Отменено' };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      PENDING: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      IN_PROGRESS: 'text-purple-600 bg-purple-50 border-purple-200',
      DELIVERED: 'text-green-600 bg-green-50 border-green-200',
      COURIER_ASSIGNED: 'text-blue-600 bg-blue-50 border-blue-200',
      COURIER_IN_TRANSIT: 'text-purple-600 bg-purple-50 border-purple-200',
      COURIER_AT_CLIENT: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const hasActiveFilters = Object.values(filters).some(v => v != null && String(v).trim() !== '');

  const handleSearchItems = async (page = 1) => {
    setSearchPerformed(true);
    setIsLoading(true);
    try {
      const result = await ordersApi.searchItems(filters, page, 20);
      setSearchResults(result.data || []);
      setSearchMeta(result.meta || null);
      setSearchPage(page);
      if ((result.data || []).length > 0) showSuccessToast('Найдены вещи');
      else if (hasActiveFilters) showErrorToast('Вещи не найдены');
    } catch (error) {
      console.error('Ошибка при поиске вещей:', error);
      showErrorToast('Не удалось выполнить поиск вещей');
      setSearchResults([]);
      setSearchMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      itemId: '',
      clientName: '',
      boxNumber: '',
      orderId: '',
      phone: '',
      email: '',
      iin: '',
    });
    setSearchResults([]);
    setSearchMeta(null);
    setSearchPage(1);
    setSearchPerformed(false);
  };

  const handleEditLocation = (item) => {
    setSelectedItem(item);
    setIsLocationModalOpen(true);
  };

  const handleLocationUpdated = (updatedItem) => {
    setSearchResults(prev => prev.map(r =>
      r.item?.id === updatedItem?.id ? { ...r, item: { ...r.item, location: updatedItem.physical_location } } : r
    ));
  };

  const renderItemCard = (data) => {
    const d = data;
    const item = d.item || {};
    return (
      <Card key={item.id || d.order_id + '-' + item.public_id} className="p-4 sm:p-6 shadow-sm border border-gray-100 rounded-xl hover:border-[#00A991]/30 transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-[#00A991] border-b border-gray-200 pb-2">Информация о вещи</h3>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#00A991]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A991]" />
              </div>
              <div><p className="text-xs sm:text-sm text-gray-500">ID вещи</p><p className="font-semibold">{item.public_id}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#00A991]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A991]" />
              </div>
              <div><p className="text-xs sm:text-sm text-gray-500">Название</p><p className="font-semibold">{item.name}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#00A991]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A991]" />
              </div>
              <div><p className="text-xs sm:text-sm text-gray-500">Объём</p><p className="font-semibold">{item.volume} м³</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#00A991]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A991]" />
              </div>
              <div><p className="text-xs sm:text-sm text-gray-500">Тип груза</p><p className="font-semibold">{getCargoMarkText(item.cargo_mark)}</p></div>
            </div>
            {d.status != null && (
              <div className="pt-2">
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Статус доставки</p>
                <div className={`inline-flex items-center px-3 py-2 rounded-full border text-xs sm:text-sm font-medium ${getStatusColor(d.status)}`}>
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {getMovingStatusText(d.status, d.direction)}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-[#00A991] border-b border-gray-200 pb-2">Доставка и заказ</h3>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#00A991]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A991]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-500">Склад</p>
                <p className="font-semibold text-sm sm:text-base">{d.warehouseAddress || '—'}</p>
                {d.storageName && <p className="text-xs sm:text-sm text-gray-600">Бокс: {d.storageName}</p>}
                {d.storage_type === 'CLOUD' && (
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <p className="text-xs sm:text-sm text-gray-600">Расположение: {item.location || 'Пока не определен'}</p>
                    <Button variant="ghost" size="sm" onClick={() => handleEditLocation(item)} className="h-6 w-6 p-0 text-gray-500 hover:text-[#00A991]">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#00A991]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A991]" />
              </div>
              <div><p className="text-xs sm:text-sm text-gray-500">Клиент</p><p className="font-semibold">{d.userName || '—'}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#00A991]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A991]" />
              </div>
              <div><p className="text-xs sm:text-sm text-gray-500">Телефон</p><p className="font-semibold">{d.userPhone || '—'}</p></div>
            </div>
            <div className="bg-[#00A991]/5 border border-[#00A991]/20 rounded-lg p-3 sm:p-4 mt-3">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Принадлежит заказу</p>
              <p className="font-semibold text-[#00A991]">Заказ #{d.order_id}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 min-w-0">
      <h2 className="text-lg sm:text-xl font-bold text-[#00A991] mb-4">Поиск вещей</h2>

      {/* Фильтры поиска вещей */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
        <p className="text-sm text-gray-600 mb-4">Используйте один или несколько параметров для поиска вещей</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">ID вещи</label>
            <input
              type="text"
              placeholder="ID вещи..."
              value={filters.itemId}
              onChange={(e) => setFilters(f => ({ ...f, itemId: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Имя или фамилия клиента</label>
            <input
              type="text"
              placeholder="Поиск по имени..."
              value={filters.clientName}
              onChange={(e) => setFilters(f => ({ ...f, clientName: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Номер бокса</label>
            <input
              type="text"
              placeholder="Номер бокса..."
              value={filters.boxNumber}
              onChange={(e) => setFilters(f => ({ ...f, boxNumber: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">ID заказа (номер заявки)</label>
            <input
              type="text"
              placeholder="ID заказа..."
              value={filters.orderId}
              onChange={(e) => setFilters(f => ({ ...f, orderId: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input
              type="text"
              placeholder="Номер телефона..."
              value={filters.phone}
              onChange={(e) => setFilters(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="text"
              placeholder="Почта..."
              value={filters.email}
              onChange={(e) => setFilters(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">ИИН</label>
            <input
              type="text"
              placeholder="ИИН..."
              value={filters.iin}
              onChange={(e) => setFilters(f => ({ ...f, iin: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleSearchItems(1)}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#00A991] hover:bg-[#008c75] rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Поиск...</span>
            ) : (
              <><Search className="w-4 h-4 mr-2" /> Найти вещи</>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#00A991] bg-[#00A991]/10 hover:bg-[#00A991]/20 rounded-lg transition-colors"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      {/* Результаты поиска вещей по фильтрам */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-3">
            Найдено: <span className="font-semibold text-[#00A991]">{searchMeta?.total ?? searchResults.length}</span> вещей
          </p>
          <div className="space-y-4">
            {searchResults.map(renderItemCard)}
          </div>
          {searchMeta && searchMeta.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleSearchItems(searchPage - 1)}
                disabled={searchPage <= 1}
                className="px-3 py-2 text-sm font-medium text-[#00A991] bg-[#00A991]/10 rounded-lg hover:bg-[#00A991]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </button>
              <span className="text-sm text-gray-600 px-2">{searchPage} / {searchMeta.totalPages}</span>
              <button
                onClick={() => handleSearchItems(searchPage + 1)}
                disabled={searchPage >= searchMeta.totalPages}
                className="px-3 py-2 text-sm font-medium text-[#00A991] bg-[#00A991]/10 rounded-lg hover:bg-[#00A991]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперед
              </button>
            </div>
          )}
        </div>
      )}

      {!isLoading && searchPerformed && searchResults.length === 0 && (
        <div className="text-center py-8 bg-white rounded-xl border border-gray-200 text-gray-500 text-sm sm:text-base mb-8">
          Вещи не найдены. Измените параметры поиска или сбросьте фильтры.
        </div>
      )}

      <EditLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        item={selectedItem}
        onLocationUpdated={handleLocationUpdated}
      />
    </div>
  );
};

export default ItemSearch;
