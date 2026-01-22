import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { promoApi } from '../../../shared/api/promoApi';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Tag, 
  Search,
  Calendar,
  Users,
  Percent,
  BarChart3,
  RefreshCw,
  Eye,
  Power,
  PowerOff
} from 'lucide-react';

const PromoCodeManagement = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [promoStats, setPromoStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_percent: '',
    max_uses: '',
    max_uses_per_user: '1',
    min_order_amount: '',
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: '',
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загрузка промокодов
  const fetchPromoCodes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await promoApi.getAll();
      setPromoCodes(data);
    } catch (err) {
      console.error('Ошибка при загрузке промокодов:', err);
      setError('Не удалось загрузить промокоды');
      toast.error('Не удалось загрузить промокоды');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  // Фильтрация промокодов
  const filteredPromoCodes = useMemo(() => {
    return promoCodes.filter(promo => {
      const matchesSearch = promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (promo.description && promo.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && promo.is_active) ||
                           (statusFilter === 'inactive' && !promo.is_active);
      
      return matchesSearch && matchesStatus;
    });
  }, [promoCodes, searchQuery, statusFilter]);

  // Открытие модалки для создания
  const handleOpenCreateModal = () => {
    setSelectedPromo(null);
    setFormData({
      code: '',
      description: '',
      discount_percent: '',
      max_uses: '',
      max_uses_per_user: '1',
      min_order_amount: '',
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  // Открытие модалки для редактирования
  const handleOpenEditModal = (promo) => {
    setSelectedPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description || '',
      discount_percent: String(promo.discount_percent),
      max_uses: promo.max_uses ? String(promo.max_uses) : '',
      max_uses_per_user: String(promo.max_uses_per_user || 1),
      min_order_amount: promo.min_order_amount ? String(promo.min_order_amount) : '',
      valid_from: promo.valid_from ? new Date(promo.valid_from).toISOString().split('T')[0] : '',
      valid_until: promo.valid_until ? new Date(promo.valid_until).toISOString().split('T')[0] : '',
      is_active: promo.is_active
    });
    setIsModalOpen(true);
  };

  // Просмотр статистики
  const handleViewStats = async (promo) => {
    try {
      setIsLoadingStats(true);
      setIsStatsModalOpen(true);
      const stats = await promoApi.getStatistics(promo.id);
      setPromoStats(stats);
    } catch (err) {
      console.error('Ошибка при загрузке статистики:', err);
      toast.error('Не удалось загрузить статистику');
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Создание/редактирование промокода
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error('Введите код промокода');
      return;
    }
    
    if (!formData.discount_percent || Number(formData.discount_percent) <= 0 || Number(formData.discount_percent) > 100) {
      toast.error('Процент скидки должен быть от 0.01 до 100');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || null,
        discount_percent: Number(formData.discount_percent),
        max_uses: formData.max_uses ? Number(formData.max_uses) : null,
        max_uses_per_user: Number(formData.max_uses_per_user) || 1,
        min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : null,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : new Date().toISOString(),
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        is_active: formData.is_active
      };

      if (selectedPromo) {
        await promoApi.update(selectedPromo.id, payload);
        toast.success('Промокод обновлен');
      } else {
        await promoApi.create(payload);
        toast.success('Промокод создан');
      }

      setIsModalOpen(false);
      fetchPromoCodes();
    } catch (err) {
      console.error('Ошибка при сохранении промокода:', err);
      const message = err.response?.data?.error || err.message || 'Не удалось сохранить промокод';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Активация/деактивация промокода
  const handleToggleActive = async (promo) => {
    try {
      if (promo.is_active) {
        await promoApi.deactivate(promo.id);
        toast.success('Промокод деактивирован');
      } else {
        await promoApi.activate(promo.id);
        toast.success('Промокод активирован');
      }
      fetchPromoCodes();
    } catch (err) {
      console.error('Ошибка при изменении статуса промокода:', err);
      toast.error('Не удалось изменить статус промокода');
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Проверка валидности промокода
  const getPromoStatus = (promo) => {
    const now = new Date();
    const validFrom = promo.valid_from ? new Date(promo.valid_from) : null;
    const validUntil = promo.valid_until ? new Date(promo.valid_until) : null;

    if (!promo.is_active) {
      return { label: 'Неактивен', color: 'bg-gray-100 text-gray-600' };
    }
    
    if (validFrom && now < validFrom) {
      return { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-700' };
    }
    
    if (validUntil && now > validUntil) {
      return { label: 'Истек', color: 'bg-red-100 text-red-600' };
    }
    
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return { label: 'Исчерпан', color: 'bg-orange-100 text-orange-600' };
    }
    
    return { label: 'Активен', color: 'bg-green-100 text-green-600' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#273655]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#273655]">Управление промокодами</h1>
          <p className="text-sm text-gray-500 mt-1">
            Всего промокодов: {promoCodes.length} | Активных: {promoCodes.filter(p => p.is_active).length}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchPromoCodes}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Обновить</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#273655] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Создать промокод</span>
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по коду или описанию..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
        >
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="inactive">Неактивные</option>
        </select>
      </div>

      {/* Таблица промокодов */}
      {error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : filteredPromoCodes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Промокоды не найдены</p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 text-[#273655] hover:underline"
          >
            Создать первый промокод
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Код</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Скидка</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Использовано</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Срок действия</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Статус</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPromoCodes.map((promo) => {
                const status = getPromoStatus(promo);
                return (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#273655]" />
                        <div>
                          <div className="font-semibold text-[#273655]">{promo.code}</div>
                          {promo.description && (
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{promo.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Percent className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">{promo.discount_percent}%</span>
                      </div>
                      {promo.min_order_amount && (
                        <div className="text-xs text-gray-500">от {Number(promo.min_order_amount).toLocaleString()} ₸</div>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{promo.current_uses || 0}</span>
                        {promo.max_uses && <span className="text-gray-400">/ {promo.max_uses}</span>}
                      </div>
                      {promo.total_discount_given > 0 && (
                        <div className="text-xs text-gray-500">
                          Скидок: {Number(promo.total_discount_given).toLocaleString()} ₸
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(promo.valid_from)}</span>
                        {promo.valid_until && (
                          <>
                            <span className="text-gray-400">—</span>
                            <span>{formatDate(promo.valid_until)}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewStats(promo)}
                          className="p-2 text-gray-400 hover:text-[#273655] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Статистика"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(promo)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(promo)}
                          className={`p-2 rounded-lg transition-colors ${
                            promo.is_active 
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={promo.is_active ? 'Деактивировать' : 'Активировать'}
                        >
                          {promo.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Модальное окно создания/редактирования */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#273655]">
                  {selectedPromo ? 'Редактировать промокод' : 'Создать промокод'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#273655] mb-1">
                  Код промокода *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="PROMO2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#273655] mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Описание промокода..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">
                    Скидка (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    placeholder="10"
                    min="0.01"
                    max="100"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">
                    Мин. сумма заказа
                  </label>
                  <input
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    placeholder="50000"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">
                    Макс. использований
                  </label>
                  <input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Без лимита"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">
                    На пользователя
                  </label>
                  <input
                    type="number"
                    value={formData.max_uses_per_user}
                    onChange={(e) => setFormData({ ...formData, max_uses_per_user: e.target.value })}
                    placeholder="1"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#273655] border-gray-300 rounded focus:ring-[#273655]"
                />
                <label htmlFor="is_active" className="text-sm text-[#273655]">
                  Активен
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-[#273655] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#273655] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Сохранение...' : (selectedPromo ? 'Сохранить' : 'Создать')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно статистики */}
      {isStatsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#273655]">
                  Статистика промокода
                </h2>
                <button
                  onClick={() => {
                    setIsStatsModalOpen(false);
                    setPromoStats(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {isLoadingStats ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#273655]"></div>
                </div>
              ) : promoStats ? (
                <div className="space-y-6">
                  {/* Основная информация */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Tag className="w-8 h-8 text-[#273655]" />
                    <div>
                      <div className="text-2xl font-bold text-[#273655]">{promoStats.promo_code?.code}</div>
                      <div className="text-sm text-gray-500">{promoStats.promo_code?.description || 'Без описания'}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-2xl font-bold text-green-600">{promoStats.promo_code?.discount_percent}%</div>
                      <div className="text-sm text-gray-500">скидка</div>
                    </div>
                  </div>

                  {/* Статистика */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{promoStats.statistics?.total_usages || 0}</div>
                      <div className="text-sm text-blue-700">Использований</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{promoStats.statistics?.unique_users || 0}</div>
                      <div className="text-sm text-purple-700">Пользователей</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Number(promoStats.statistics?.total_discount_given || 0).toLocaleString()} ₸
                      </div>
                      <div className="text-sm text-green-700">Скидок выдано</div>
                    </div>
                  </div>

                  {/* Последние использования */}
                  {promoStats.recent_usages && promoStats.recent_usages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#273655] mb-3">Последние использования</h3>
                      <div className="space-y-2">
                        {promoStats.recent_usages.map((usage, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-[#273655]">
                                {usage.user?.name || usage.user?.email || 'Пользователь'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(usage.used_at)}
                              </div>
                            </div>
                            <div className="text-green-600 font-semibold">
                              -{Number(usage.discount_amount).toLocaleString()} ₸
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">Не удалось загрузить статистику</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeManagement;
