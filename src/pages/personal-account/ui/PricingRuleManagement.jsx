import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { pricingRuleApi } from '../../../shared/api/pricingRuleApi';
import { warehouseApi } from '../../../shared/api/warehouseApi';
import { showSuccessToast, showErrorToast } from '../../../shared/lib/toast';
import { formatCalendarDate, getTodayLocalDateString } from '../../../shared/lib/utils/date';
import {
  Plus,
  Edit2,
  X,
  Search,
  Calendar,
  RefreshCw,
  Power,
  PowerOff,
  DollarSign,
  Percent,
  Layers,
  Warehouse
} from 'lucide-react';

const PricingRuleManagement = () => {
  const [rules, setRules] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultFormData = {
    name: '',
    description: '',
    warehouse_id: '',
    tier: '',
    area_from: '0',
    area_to: '',
    rental_months_from: '0',
    rental_months_to: '',
    price_type: 'FIXED_PRICE',
    discount_percent: '',
    fixed_price: '',
    promo_months: '',
    priority: '0',
    valid_from: getTodayLocalDateString(),
    valid_until: '',
    is_active: true
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Загрузка данных
  const fetchRules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await pricingRuleApi.getAll();
      setRules(data);
    } catch (err) {
      console.error('Ошибка при загрузке правил:', err);
      setError('Не удалось загрузить правила ценообразования');
      showErrorToast('Не удалось загрузить правила');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWarehouses = useCallback(async () => {
    try {
      const data = await warehouseApi.getAllWarehouses();
      setWarehouses(data);
    } catch (err) {
      console.error('Ошибка при загрузке складов:', err);
    }
  }, []);

  useEffect(() => {
    fetchRules();
    fetchWarehouses();
  }, [fetchRules, fetchWarehouses]);

  // Фильтрация
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rule.description && rule.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && rule.is_active) ||
        (statusFilter === 'inactive' && !rule.is_active);
      const matchesWarehouse = warehouseFilter === 'all' ||
        (warehouseFilter === 'none' && !rule.warehouse_id) ||
        String(rule.warehouse_id) === warehouseFilter;
      return matchesSearch && matchesStatus && matchesWarehouse;
    });
  }, [rules, searchQuery, statusFilter, warehouseFilter]);

  // Модалка создания
  const handleOpenCreateModal = () => {
    setSelectedRule(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  // Модалка редактирования
  const handleOpenEditModal = (rule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name || '',
      description: rule.description || '',
      warehouse_id: rule.warehouse_id ? String(rule.warehouse_id) : '',
      tier: rule.tier ? String(rule.tier) : '',
      area_from: rule.area_from != null ? String(rule.area_from) : '0',
      area_to: rule.area_to != null ? String(rule.area_to) : '',
      rental_months_from: rule.rental_months_from != null ? String(rule.rental_months_from) : '0',
      rental_months_to: rule.rental_months_to != null ? String(rule.rental_months_to) : '',
      price_type: rule.price_type || 'FIXED_PRICE',
      discount_percent: rule.discount_percent != null ? String(rule.discount_percent) : '',
      fixed_price: rule.fixed_price != null ? String(rule.fixed_price) : '',
      promo_months: rule.promo_months != null ? String(rule.promo_months) : '',
      priority: rule.priority != null ? String(rule.priority) : '0',
      valid_from: rule.valid_from ? new Date(rule.valid_from).toISOString().split('T')[0] : '',
      valid_until: rule.valid_until ? new Date(rule.valid_until).toISOString().split('T')[0] : '',
      is_active: rule.is_active
    });
    setIsModalOpen(true);
  };

  // Сохранение
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showErrorToast('Введите название правила');
      return;
    }

    if (formData.price_type === 'FIXED_PRICE' && (!formData.fixed_price || Number(formData.fixed_price) <= 0)) {
      showErrorToast('Введите фиксированную цену за м²');
      return;
    }

    if (formData.price_type === 'DISCOUNT' && (!formData.discount_percent || Number(formData.discount_percent) <= 0)) {
      showErrorToast('Введите процент скидки');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        warehouse_id: formData.warehouse_id ? Number(formData.warehouse_id) : null,
        tier: formData.tier ? Number(formData.tier) : null,
        area_from: formData.area_from ? Number(formData.area_from) : 0,
        area_to: formData.area_to ? Number(formData.area_to) : null,
        rental_months_from: formData.rental_months_from ? Number(formData.rental_months_from) : 0,
        rental_months_to: formData.rental_months_to ? Number(formData.rental_months_to) : null,
        price_type: formData.price_type,
        discount_percent: formData.price_type === 'DISCOUNT' ? Number(formData.discount_percent) : null,
        fixed_price: formData.price_type === 'FIXED_PRICE' ? Number(formData.fixed_price) : null,
        promo_months: formData.promo_months ? Number(formData.promo_months) : null,
        priority: formData.priority ? Number(formData.priority) : 0,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : new Date(getTodayLocalDateString() + 'T00:00:00').toISOString(),
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        is_active: formData.is_active
      };

      if (selectedRule) {
        await pricingRuleApi.update(selectedRule.id, payload);
        showSuccessToast('Правило обновлено');
      } else {
        await pricingRuleApi.create(payload);
        showSuccessToast('Правило создано');
      }

      setIsModalOpen(false);
      fetchRules();
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      const message = err.response?.data?.error || err.message || 'Не удалось сохранить правило';
      showErrorToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Активация/деактивация
  const handleToggleActive = async (rule) => {
    try {
      if (rule.is_active) {
        await pricingRuleApi.deactivate(rule.id);
        showSuccessToast('Правило деактивировано');
      } else {
        await pricingRuleApi.activate(rule.id);
        showSuccessToast('Правило активировано');
      }
      fetchRules();
    } catch (err) {
      console.error('Ошибка:', err);
      showErrorToast('Не удалось изменить статус');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return formatCalendarDate(dateString);
  };

  const getRuleStatus = (rule) => {
    const now = new Date();
    if (!rule.is_active) return { label: 'Неактивен', color: 'bg-gray-100 text-gray-600' };
    if (rule.valid_from && now < new Date(rule.valid_from)) return { label: 'Ожидает', color: 'bg-yellow-100 text-yellow-700' };
    if (rule.valid_until && now > new Date(rule.valid_until)) return { label: 'Истек', color: 'bg-red-100 text-red-600' };
    return { label: 'Активен', color: 'bg-green-100 text-green-600' };
  };

  const getWarehouseName = (warehouseId) => {
    if (!warehouseId) return 'Все склады';
    const wh = warehouses.find(w => w.id === warehouseId);
    return wh ? wh.name : `Склад #${warehouseId}`;
  };

  const getPriceDisplay = (rule) => {
    if (rule.price_type === 'DISCOUNT') {
      return <span className="text-orange-600 font-semibold">Скидка {rule.discount_percent}%</span>;
    }
    return <span className="text-green-600 font-semibold">{Number(rule.fixed_price).toLocaleString()} ₸/м²</span>;
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
          <h1 className="text-2xl font-bold text-[#273655]">Тарифы и акции</h1>
          <p className="text-sm text-gray-500 mt-1">
            Всего правил: {rules.length} | Активных: {rules.filter(r => r.is_active).length}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchRules} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Обновить</span>
          </button>
          <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2 bg-[#273655] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors">
            <Plus className="w-4 h-4" />
            <span>Создать правило</span>
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" />
        </div>
        <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]">
          <option value="all">Все склады</option>
          <option value="none">Без склада (все)</option>
          {warehouses.map(wh => <option key={wh.id} value={String(wh.id)}>{wh.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]">
          <option value="all">Все статусы</option>
          <option value="active">Активные</option>
          <option value="inactive">Неактивные</option>
        </select>
      </div>

      {/* Таблица */}
      {error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : filteredRules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Правила не найдены</p>
          <button onClick={handleOpenCreateModal} className="mt-4 text-[#273655] hover:underline">
            Создать первое правило
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Название</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Склад / Ярус</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Площадь</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Срок</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Цена</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden xl:table-cell">Период</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Статус</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRules.map((rule) => {
                const status = getRuleStatus(rule);
                return (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-semibold text-[#273655]">{rule.name}</div>
                        {rule.description && <div className="text-xs text-gray-500 truncate max-w-[200px]">{rule.description}</div>}
                        {rule.promo_months && (
                          <div className="text-xs text-purple-600 mt-1">Промо: первые {rule.promo_months} мес.</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="text-sm">{getWarehouseName(rule.warehouse_id)}</div>
                      <div className="text-xs text-gray-500">Ярус: {rule.tier || 'Все'}</div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-sm">
                      {Number(rule.area_from) || 0} — {rule.area_to ? `${Number(rule.area_to)} м²` : 'без лимита'}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-sm">
                      {Number(rule.rental_months_from) || 0} — {rule.rental_months_to ? `${rule.rental_months_to} мес.` : 'любой'}
                    </td>
                    <td className="px-4 py-4">{getPriceDisplay(rule)}</td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(rule.valid_from)}</span>
                        {rule.valid_until && (<><span className="text-gray-400">—</span><span>{formatDate(rule.valid_until)}</span></>)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenEditModal(rule)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Редактировать">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleActive(rule)}
                          className={`p-2 rounded-lg transition-colors ${rule.is_active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                          title={rule.is_active ? 'Деактивировать' : 'Активировать'}>
                          {rule.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
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

      {/* Модалка создания/редактирования */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#273655]">
                  {selectedRule ? 'Редактировать правило' : 'Создать правило'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Название и описание */}
              <div>
                <label className="block text-sm font-medium text-[#273655] mb-1">Название *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Акция Comfort City до 3м²"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#273655] mb-1">Описание</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Описание правила..." rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655] resize-none" />
              </div>

              {/* Склад и Ярус */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">Склад</label>
                  <select value={formData.warehouse_id} onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]">
                    <option value="">Все склады</option>
                    {warehouses.map(wh => <option key={wh.id} value={String(wh.id)}>{wh.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">Ярус</label>
                  <select value={formData.tier} onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]">
                    <option value="">Все ярусы</option>
                    <option value="1">1 ярус</option>
                    <option value="2">2 ярус</option>
                    <option value="3">3 ярус</option>
                  </select>
                </div>
              </div>

              {/* Площадь */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">Площадь от (м²)</label>
                  <input type="number" value={formData.area_from} onChange={(e) => setFormData({ ...formData, area_from: e.target.value })}
                    placeholder="0" min="0" step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">Площадь до (м²)</label>
                  <input type="number" value={formData.area_to} onChange={(e) => setFormData({ ...formData, area_to: e.target.value })}
                    placeholder="Без лимита" min="0" step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" />
                </div>
              </div>

              {/* Срок аренды */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">Срок аренды от (мес.)</label>
                  <input type="number" value={formData.rental_months_from} onChange={(e) => setFormData({ ...formData, rental_months_from: e.target.value })}
                    placeholder="0 (любой)" min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">Срок аренды до (мес.)</label>
                  <input type="number" value={formData.rental_months_to} onChange={(e) => setFormData({ ...formData, rental_months_to: e.target.value })}
                    placeholder="Без лимита" min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" />
                </div>
              </div>

              {/* Тип цены */}
              <div>
                <label className="block text-sm font-medium text-[#273655] mb-2">Тип цены *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="price_type" value="FIXED_PRICE" checked={formData.price_type === 'FIXED_PRICE'}
                      onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
                      className="w-4 h-4 text-[#273655]" />
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Фиксированная цена</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="price_type" value="DISCOUNT" checked={formData.price_type === 'DISCOUNT'}
                      onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
                      className="w-4 h-4 text-[#273655]" />
                    <Percent className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">Скидка</span>
                  </label>
                </div>
              </div>

              {/* Цена / Скидка */}
              <div className="grid grid-cols-2 gap-4">
                {formData.price_type === 'FIXED_PRICE' ? (
                  <div>
                    <label className="block text-sm font-medium text-[#273655] mb-1">Цена за м² (₸) *</label>
                    <input type="number" value={formData.fixed_price} onChange={(e) => setFormData({ ...formData, fixed_price: e.target.value })}
                      placeholder="5990" min="0.01" step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" required />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-[#273655] mb-1">Скидка (%) *</label>
                    <input type="number" value={formData.discount_percent} onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                      placeholder="10" min="0.01" max="100" step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" required />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">Промо-месяцы</label>
                  <input type="number" value={formData.promo_months} onChange={(e) => setFormData({ ...formData, promo_months: e.target.value })}
                    placeholder="Без ограничений" min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" />
                  <p className="text-xs text-gray-500 mt-1">Спец.цена действует первые N месяцев, далее стандарт</p>
                </div>
              </div>

              {/* Приоритет */}
              <div>
                <label className="block text-sm font-medium text-[#273655] mb-1">Приоритет</label>
                <input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  placeholder="0" min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" />
                <p className="text-xs text-gray-500 mt-1">Чем выше число — тем выше приоритет при совпадении нескольких правил</p>
              </div>

              {/* Период действия */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">Дата начала</label>
                  <input type="date" value={formData.valid_from} onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#273655] mb-1">Дата окончания</label>
                  <input type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]" />
                </div>
              </div>

              {/* Активен */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_active" checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#273655] border-gray-300 rounded focus:ring-[#273655]" />
                <label htmlFor="is_active" className="text-sm text-[#273655]">Активен</label>
              </div>

              {/* Кнопки */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-[#273655] rounded-lg hover:bg-gray-50 transition-colors">
                  Отмена
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#273655] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Сохранение...' : (selectedRule ? 'Сохранить' : 'Создать')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingRuleManagement;
