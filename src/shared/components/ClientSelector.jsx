import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, X, User, Mail, Phone, MapPin, Calendar, ArrowLeft, History } from 'lucide-react';
import { usersApi } from '../api/usersApi';
import { warehouseApi } from '../api/warehouseApi';
import { showSuccessToast, showErrorToast } from '../lib/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { getTodayLocalDateString, formatCalendarDate } from '../lib/utils/date';

/** Первый месяц графика: для YYYY-MM-DD — календарная дата в локальной зоне (без сдвига из‑за UTC). */
function parseScheduleAnchorDate(str) {
  if (!str) return null;
  const s = String(str).trim();
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    const d = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Для input type="date`: первый день месяца оплаты по полям строки (месяц 1–12, год). */
function firstDayOfPaymentMonthYmd(monthStr, yearStr) {
  const m = Number(String(monthStr ?? '').trim());
  const y = Number(String(yearStr ?? '').trim());
  if (!Number.isFinite(m) || m < 1 || m > 12 || !Number.isFinite(y) || y < 1900 || y > 2100) {
    return '';
  }
  const mm = String(m).padStart(2, '0');
  return `${y}-${mm}-01`;
}

/**
 * Равномерно делит сумму по месяцам от якорной даты (первый платёж — календарный месяц этой даты).
 * Последняя строка — остаток из‑за округления.
 * @returns {Array<ReturnType<typeof defaultOrderPaymentRow>>|null}
 */
function generateMonthlyPaymentRows(totalAmountInput, monthsCount, startDateStr) {
  const total = Number(String(totalAmountInput).replace(',', '.'));
  if (!Number.isFinite(total) || total <= 0 || !monthsCount || monthsCount < 1) return null;
  const start = parseScheduleAnchorDate(startDateStr);
  if (!start) return null;
  const n = Math.min(Math.floor(monthsCount), 120);
  const per = Math.floor((total * 100) / n) / 100;
  const rows = [];
  let sum = 0;
  for (let i = 0; i < n; i += 1) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);
    const isLast = i === n - 1;
    const amt = isLast ? Math.round((total - sum) * 100) / 100 : per;
    sum += amt;
    rows.push({
      amount: String(amt),
      month: String(d.getMonth() + 1),
      year: String(d.getFullYear()),
      status: 'UNPAID',
      paid_at: '',
      note: '',
    });
  }
  return rows;
}

const MODE = {
  SEARCH: 'search',
  CREATE: 'create',
  LEGACY: 'legacy',
};

const emptyClientForm = () => ({
  name: '',
  email: '',
  phone: '',
  iin: '',
  address: '',
  bday: '',
});

/** Полный график: оплаченные и будущие строки (как на бэкенде — без генератора) */
const defaultOrderPaymentRow = () => ({
  amount: '',
  month: '',
  year: '',
  status: 'UNPAID',
  paid_at: '',
  note: '',
});

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {object|null} props.selectedUser
 * @param {(user: object) => void} props.onUserSelect
 * @param {() => object|null} [props.legacyImportBuildOrderPayload] — данные брони со страницы (склад, срок, позиции)
 * @param {() => object|null} [props.legacyImportBookingSummary] — склад, бокс, адрес, месяцы, дата начала для подсказки в модалке
 * @param {(order: object) => void} [props.onLegacyImportSuccess]
 */
const ClientSelector = ({
  isOpen,
  onClose,
  selectedUser,
  onUserSelect,
  legacyImportBuildOrderPayload,
  legacyImportBookingSummary,
  onLegacyImportSuccess,
}) => {
  const [mode, setMode] = useState(MODE.SEARCH);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState(emptyClientForm());
  const [formErrors, setFormErrors] = useState({});

  const [legacyPaymentType, setLegacyPaymentType] = useState('MONTHLY');
  const [legacyOrderPayments, setLegacyOrderPayments] = useState([defaultOrderPaymentRow()]);
  const [legacyGeneratorTotal, setLegacyGeneratorTotal] = useState('');
  /** Дата начала брони для генерации графика (можно отличаться от даты на странице) */
  const [legacyBookingStartDate, setLegacyBookingStartDate] = useState('');
  const [ignoreStorageAvailability, setIgnoreStorageAvailability] = useState(false);

  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await usersApi.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Ошибка при поиске пользователей:', error);
      showErrorToast('Не удалось выполнить поиск пользователей');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setMode(MODE.SEARCH);
      setFormData(emptyClientForm());
      setFormErrors({});
      setLegacyPaymentType('MONTHLY');
      setLegacyOrderPayments([defaultOrderPaymentRow()]);
      setLegacyGeneratorTotal('');
      setIgnoreStorageAvailability(false);
      const summaryOnOpen = legacyImportBookingSummary?.();
      const rawStart = summaryOnOpen?.startDate;
      if (rawStart) {
        const s = String(rawStart).trim();
        setLegacyBookingStartDate(/^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : '');
      } else {
        setLegacyBookingStartDate('');
      }
    }
  }, [isOpen]);

  const bookingSummary = legacyImportBookingSummary?.() ?? null;
  const isMonthlyLegacy = legacyPaymentType === 'MONTHLY';

  /** Якорь для генерации графика: дата из модалки или из сводки брони на странице */
  const getLegacyScheduleAnchorYmd = () => {
    const fromModal = legacyBookingStartDate?.trim();
    if (fromModal) return fromModal;
    const fromSummary = bookingSummary?.startDate;
    if (!fromSummary) return '';
    const s = String(fromSummary).trim();
    return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : '';
  };

  const handleLegacyPaymentTypeChange = (value) => {
    setLegacyPaymentType(value);
    const summary = legacyImportBookingSummary?.();
    if (value === 'FULL') {
      const anchorStr = legacyBookingStartDate?.trim() || summary?.startDate;
      const d = anchorStr ? parseScheduleAnchorDate(anchorStr) : null;
      if (d) {
        setLegacyOrderPayments([
          {
            amount: '',
            month: String(d.getMonth() + 1),
            year: String(d.getFullYear()),
            status: 'UNPAID',
            paid_at: '',
            note: '',
          },
        ]);
      } else {
        setLegacyOrderPayments([defaultOrderPaymentRow()]);
      }
      setLegacyGeneratorTotal('');
    }
  };

  const handleGenerateMonthlyPayments = () => {
    if (!bookingSummary) {
      showErrorToast('Сначала выберите склад, бокс и срок на странице бронирования.');
      return;
    }
    const anchor = getLegacyScheduleAnchorYmd();
    if (!anchor) {
      showErrorToast('Укажите дату начала брони для графика платежей.');
      return;
    }
    const rows = generateMonthlyPaymentRows(legacyGeneratorTotal, bookingSummary.months, anchor);
    if (!rows) {
      showErrorToast('Введите положительную общую сумму за весь срок аренды.');
      return;
    }
    setLegacyOrderPayments(rows);
    showSuccessToast(`Создано ${rows.length} строк графика`);
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Имя обязательно';
    }

    if (formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Некорректный email';
      }
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Телефон обязателен';
    }

    if (!formData.iin.trim()) {
      errors.iin = 'ИИН обязателен';
    } else if (formData.iin.length !== 12) {
      errors.iin = 'ИИН должен содержать 12 цифр';
    }

    if (!formData.address.trim()) {
      errors.address = 'Адрес обязателен';
    }

    if (!formData.bday.trim()) {
      errors.bday = 'Дата рождения обязательна';
    } else {
      const selectedDate = new Date(formData.bday);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        errors.bday = 'Дата рождения не может быть в будущем';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        iin: formData.iin.trim(),
        address: formData.address.trim(),
        bday: formData.bday.trim(),
      };
      const newUser = await usersApi.createUserByManager(payload);

      showSuccessToast('Пользователь успешно создан. Клиент сможет войти через Google OAuth.');
      onUserSelect(newUser);
      onClose();
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      const errorMessage =
        error.response?.data?.details?.[0]?.message ||
        error.response?.data?.error ||
        'Не удалось создать пользователя';
      showErrorToast(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const parseOrderPayments = () => {
    const rows = [];
    const seen = new Set();
    for (const row of legacyOrderPayments) {
      const amount = Number(String(row.amount).replace(',', '.'));
      const month = parseInt(row.month, 10);
      const year = parseInt(row.year, 10);
      const status = row.status === 'PAID' ? 'PAID' : 'UNPAID';

      if (!row.amount || !month || !year) {
        return { error: 'Заполните сумму, месяц и год в каждой строке графика' };
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        return { error: 'Некорректная сумма в графике платежей' };
      }

      const periodKey = `${year}-${month}`;
      if (seen.has(periodKey)) {
        return { error: `Период ${periodKey} указан дважды` };
      }
      seen.add(periodKey);

      const base = {
        amount,
        month,
        year,
        status,
        import_note: row.note?.trim() || null,
      };

      if (status === 'PAID') {
        if (!row.paid_at) {
          return { error: `Для оплаченного периода ${periodKey} укажите дату оплаты` };
        }
        rows.push({
          ...base,
          paid_at: new Date(row.paid_at).toISOString(),
          payment_source: 'OFFLINE_IMPORT',
        });
      } else {
        rows.push({
          ...base,
          paid_at: null,
          payment_source: 'ONLINE',
        });
      }
    }
    if (rows.length === 0) {
      return { error: 'Добавьте хотя бы одну строку графика платежей' };
    }
    return { rows };
  };

  const handleLegacyImport = async () => {
    if (!validateForm()) {
      return;
    }
    if (!legacyImportBuildOrderPayload) {
      showErrorToast('Сначала выберите склад, срок и параметры бронирования на странице.');
      return;
    }
    const base = legacyImportBuildOrderPayload();
    if (!base) {
      showErrorToast('Заполните бронирование (склад, сроки) на странице, затем повторите импорт.');
      return;
    }

    const parsed = parseOrderPayments();
    if (parsed.error) {
      showErrorToast(parsed.error);
      return;
    }

    setIsImporting(true);
    try {
      const payload = {
        ...base,
        client: {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim(),
          iin: formData.iin.trim(),
          address: formData.address.trim(),
          bday: formData.bday.trim(),
        },
        payment_type: legacyPaymentType,
        order_payments: parsed.rows,
        ignore_storage_availability: ignoreStorageAvailability,
      };

      const res = await warehouseApi.importOfflineOrder(payload);
      const order = res?.order;
      if (order?.user) {
        onUserSelect(order.user);
      }
      showSuccessToast(`Офлайн-заказ импортирован (№${order?.id ?? ''}).`);
      onLegacyImportSuccess?.(order);
      onClose();
    } catch (error) {
      console.error('Ошибка импорта офлайн-заказа:', error);
      const msg =
        error.response?.data?.details?.[0]?.message ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Не удалось создать импорт';
      showErrorToast(typeof msg === 'string' ? msg : 'Не удалось создать импорт');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSelectUser = (user) => {
    onUserSelect(user);
    onClose();
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    let formatted = raw;
    if (raw.startsWith('8')) {
      formatted = '7' + raw.slice(1);
    }
    if (raw && !raw.startsWith('7') && !raw.startsWith('8')) {
      formatted = '7' + raw;
    }
    let display = formatted;
    if (formatted.length > 0) {
      display = '+7';
      const rest = formatted.slice(1);
      if (rest.length > 0) display += ' (' + rest.slice(0, 3);
      if (rest.length > 3) display += ') ' + rest.slice(3, 6);
      if (rest.length > 6) display += '-' + rest.slice(6, 8);
      if (rest.length > 8) display += '-' + rest.slice(8, 10);
    }
    setFormData({ ...formData, phone: display });
  };

  const title =
    mode === MODE.SEARCH
      ? 'Выбор клиента'
      : mode === MODE.CREATE
        ? 'Создание нового клиента'
        : 'Офлайн-клиент (импорт)';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`w-[96vw] rounded-3xl border-none p-0 bg-white shadow-xl overflow-hidden flex flex-col ${
          mode === MODE.LEGACY
            ? 'max-w-[min(1280px,96vw)] xl:max-w-[1400px] max-h-[min(940px,96vh)]'
            : 'max-w-[420px] sm:max-w-3xl max-h-[85vh]'
        }`}
      >
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-[#202422]">{title}</DialogTitle>
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={() => setMode(MODE.SEARCH)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                mode === MODE.SEARCH
                  ? 'bg-[#31876D] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="inline h-4 w-4 mr-1 align-text-bottom" />
              Существующий
            </button>
            <button
              type="button"
              onClick={() => setMode(MODE.CREATE)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                mode === MODE.CREATE
                  ? 'bg-[#31876D] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserPlus className="inline h-4 w-4 mr-1 align-text-bottom" />
              Новый
            </button>
            <button
              type="button"
              onClick={() => setMode(MODE.LEGACY)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                mode === MODE.LEGACY
                  ? 'bg-[#31876D] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <History className="inline h-4 w-4 mr-1 align-text-bottom" />
              Офлайн-импорт
            </button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {mode === MODE.SEARCH && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Поиск по имени, email или телефону..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-2xl border-gray-200 text-[#202422] placeholder:text-gray-400 focus:ring-2 focus:ring-[#31876D]/30 focus:border-[#31876D]/50"
                />
              </div>

              {isSearching && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-t-transparent border-[#31876D] rounded-full animate-spin" />
                </div>
              )}

              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#31876D]/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-[#31876D]" />
                  </div>
                  <p className="text-base font-medium text-[#202422] mb-1">Пользователи не найдены</p>
                  <p className="text-sm text-gray-500">Попробуйте другой запрос или создайте нового пользователя</p>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedUser?.id === user.id
                          ? 'border-[#31876D] bg-[#31876D]/10 shadow-sm'
                          : 'border-gray-200 hover:border-[#31876D]/40 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                selectedUser?.id === user.id ? 'bg-[#31876D]' : 'bg-gray-100'
                              }`}
                            >
                              <User
                                className={`h-5 w-5 ${
                                  selectedUser?.id === user.id ? 'text-white' : 'text-gray-400'
                                }`}
                              />
                            </div>
                            <span className="font-semibold text-[#202422] text-base">
                              {user.name || 'Без имени'}
                            </span>
                          </div>
                          <div className="space-y-1.5 text-sm text-gray-600 ml-12">
                            {user.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            )}
                            {user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                            {user.address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{user.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedUser?.id === user.id && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-[#31876D] flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searchQuery && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Начните вводить имя, email или телефон для поиска</p>
                </div>
              )}
            </div>
          )}

          {(mode === MODE.CREATE || mode === MODE.LEGACY) && (
            <div className="space-y-5">
              {mode === MODE.CREATE && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMode(MODE.SEARCH)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                    Имя *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`h-12 rounded-2xl border transition-colors ${
                      formErrors.name
                        ? 'border-red-300 bg-red-50 focus:ring-red-300'
                        : 'border-gray-200 focus:ring-[#31876D]/30 focus:border-[#31876D]/50'
                    }`}
                    placeholder="Введите имя"
                  />
                  {formErrors.name && (
                    <p className="mt-1.5 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                    Email (необязательно)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`h-12 rounded-2xl border transition-colors ${
                      formErrors.email
                        ? 'border-red-300 bg-red-50 focus:ring-red-300'
                        : 'border-gray-200 focus:ring-[#31876D]/30 focus:border-[#31876D]/50'
                    }`}
                    placeholder="example@mail.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1.5 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Телефон *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`h-12 rounded-2xl border transition-colors ${
                      formErrors.phone
                        ? 'border-red-300 bg-red-50 focus:ring-red-300'
                        : 'border-gray-200 focus:ring-[#31876D]/30 focus:border-[#31876D]/50'
                    }`}
                    placeholder="+7 (___) ___-__-__"
                  />
                  {formErrors.phone && (
                    <p className="mt-1.5 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="iin" className="text-sm font-medium text-gray-700 mb-2 block">
                    ИИН (12 цифр) *
                  </Label>
                  <Input
                    id="iin"
                    type="text"
                    maxLength={12}
                    value={formData.iin}
                    onChange={(e) => setFormData({ ...formData, iin: e.target.value.replace(/\D/g, '') })}
                    className={`h-12 rounded-2xl border transition-colors ${
                      formErrors.iin
                        ? 'border-red-300 bg-red-50 focus:ring-red-300'
                        : 'border-gray-200 focus:ring-[#31876D]/30 focus:border-[#31876D]/50'
                    }`}
                    placeholder="123456789012"
                  />
                  {formErrors.iin && (
                    <p className="mt-1.5 text-sm text-red-600">{formErrors.iin}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                    Адрес *
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`h-12 rounded-2xl border transition-colors ${
                      formErrors.address
                        ? 'border-red-300 bg-red-50 focus:ring-red-300'
                        : 'border-gray-200 focus:ring-[#31876D]/30 focus:border-[#31876D]/50'
                    }`}
                    placeholder="г. Алматы, ул. Абая, д. 25"
                  />
                  {formErrors.address && (
                    <p className="mt-1.5 text-sm text-red-600">{formErrors.address}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bday" className="text-sm font-medium text-gray-700 mb-2 block">
                    Дата рождения *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#6B6B6B] h-5 w-5 pointer-events-none" />
                    <Input
                      id="bday"
                      type="date"
                      value={formData.bday}
                      onChange={(e) => setFormData({ ...formData, bday: e.target.value })}
                      max={getTodayLocalDateString()}
                      className={`h-12 rounded-2xl border pl-12 transition-colors ${
                        formErrors.bday
                          ? 'border-red-300 bg-red-50 focus:ring-red-300'
                          : 'border-gray-200 focus:ring-[#31876D]/30 focus:border-[#31876D]/50'
                      }`}
                    />
                  </div>
                  {formErrors.bday && (
                    <p className="mt-1.5 text-sm text-red-600">{formErrors.bday}</p>
                  )}
                </div>
              </div>

              {mode === MODE.CREATE && (
                <div className="bg-[#31876D]/10 border border-[#31876D]/20 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-[#31876D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#202422] mb-1">Вход через Google OAuth</p>
                      <p className="text-xs text-gray-600">
                        Клиент сможет войти в систему через Google аккаунт. Пароль не требуется.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {mode === MODE.LEGACY && (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600">
                    Сначала на странице бронирования выберите склад, бокс и срок. Задайте график платежей: при
                    помесячной оплате можно сгенерировать строки по сумме и дате начала брони (поле ниже) или
                    добавить вручную; при полной оплате — один платёж за весь период.
                  </p>

                  {bookingSummary ? (
                    <div className="rounded-2xl border border-[#31876D]/25 bg-[#31876D]/5 p-4 text-sm space-y-2">
                      <p className="font-semibold text-[#202422]">Выбранное бронирование</p>
                      <div className="grid gap-2 sm:grid-cols-2 text-[#273655]">
                        <div>
                          <span className="text-gray-500">Склад: </span>
                          {bookingSummary.warehouseName}
                        </div>
                        <div>
                          <span className="text-gray-500">Срок: </span>
                          {bookingSummary.months} мес.
                        </div>
                        {bookingSummary.warehouseAddress ? (
                          <div className="sm:col-span-2 flex gap-2 items-start">
                            <MapPin className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
                            <span>{bookingSummary.warehouseAddress}</span>
                          </div>
                        ) : null}
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">Бокс: </span>
                          {bookingSummary.storageLabel}
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">Дата начала аренды: </span>
                          {formatCalendarDate(bookingSummary.startDate)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      Выберите на странице склад, бокс и срок аренды — без этого импорт недоступен.
                    </div>
                  )}

                  {bookingSummary && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
                      <Label className="text-sm font-medium text-gray-700 block">
                        Дата начала брони (для графика платежей)
                      </Label>
                      <Input
                        type="date"
                        value={legacyBookingStartDate}
                        onChange={(e) => setLegacyBookingStartDate(e.target.value)}
                        className="h-12 rounded-2xl border-gray-200 max-w-xs"
                      />
                      <p className="text-xs text-gray-500">
                        По умолчанию подставляется дата из бронирования выше; при необходимости измените — генерация
                        помесячных платежей и режим «Полностью» используют эту дату как первый месяц графика.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">Тип оплаты</Label>
                      <select
                        value={legacyPaymentType}
                        onChange={(e) => handleLegacyPaymentTypeChange(e.target.value)}
                        className="w-full h-12 rounded-2xl border border-gray-200 px-3 text-[#202422]"
                      >
                        <option value="MONTHLY">Помесячно</option>
                        <option value="FULL">Полностью</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ignoreStorageAvailability}
                          onChange={(e) => setIgnoreStorageAvailability(e.target.checked)}
                          className="rounded border-gray-300 text-[#31876D] focus:ring-[#31876D]"
                        />
                        Бокс уже занят (офлайн), не проверять доступность
                      </label>
                    </div>
                  </div>

                  {isMonthlyLegacy && bookingSummary && (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 space-y-3">
                      <p className="text-sm font-medium text-[#202422]">Быстрое заполнение помесячного графика</p>
                      <p className="text-xs text-gray-600">
                        Укажите общую сумму за все {bookingSummary.months} мес. — строки создадутся помесячно от даты
                        начала брони (поле «Дата начала брони» выше; равные доли, последний месяц с корректировкой
                        округления).
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                        <div className="flex-1">
                          <Label className="text-xs text-gray-600 mb-1 block">Общая сумма за период (₸)</Label>
                          <Input
                            value={legacyGeneratorTotal}
                            onChange={(e) => setLegacyGeneratorTotal(e.target.value)}
                            className="h-11 rounded-2xl"
                            placeholder="Напр. 600000"
                            inputMode="decimal"
                          />
                        </div>
                        <Button
                          type="button"
                          className="rounded-2xl bg-[#31876D] hover:bg-[#276b57] text-white"
                          onClick={handleGenerateMonthlyPayments}
                        >
                          Сгенерировать платежи
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <Label className="text-sm font-medium text-gray-700">
                        {isMonthlyLegacy ? 'График платежей (по месяцам)' : 'Платёж (полностью за период)'}
                      </Label>
                      {isMonthlyLegacy && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-2xl"
                          onClick={() => setLegacyOrderPayments([...legacyOrderPayments, defaultOrderPaymentRow()])}
                        >
                          + Строка
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-[min(520px,52vh)] overflow-y-auto">
                      {legacyOrderPayments.map((row, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-2 gap-2 md:grid-cols-12 md:gap-2 items-end p-3 rounded-2xl bg-gray-50 border border-gray-100"
                        >
                          <div className="col-span-1 md:col-span-2">
                            <span className="text-xs text-gray-500">Сумма</span>
                            <Input
                              value={row.amount}
                              onChange={(e) => {
                                const next = [...legacyOrderPayments];
                                next[idx] = { ...next[idx], amount: e.target.value };
                                setLegacyOrderPayments(next);
                              }}
                              className="h-10 rounded-xl text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div className="col-span-1 md:col-span-2">
                            <span className="text-xs text-gray-500">Статус</span>
                            <select
                              value={row.status || 'UNPAID'}
                              onChange={(e) => {
                                const next = [...legacyOrderPayments];
                                const newStatus = e.target.value;
                                let paidAt = '';
                                if (newStatus === 'UNPAID') {
                                  paidAt = '';
                                } else if (newStatus === 'PAID') {
                                  paidAt =
                                    firstDayOfPaymentMonthYmd(next[idx].month, next[idx].year) ||
                                    next[idx].paid_at ||
                                    '';
                                }
                                next[idx] = {
                                  ...next[idx],
                                  status: newStatus,
                                  paid_at: paidAt,
                                };
                                setLegacyOrderPayments(next);
                              }}
                              className="w-full h-10 rounded-xl border border-gray-200 px-2 text-sm text-[#202422]"
                            >
                              <option value="PAID">Оплачено</option>
                              <option value="UNPAID">К оплате</option>
                            </select>
                          </div>
                          <div className="col-span-2 md:col-span-2">
                            <span className="text-xs text-gray-500">
                              Дата оплаты {row.status === 'PAID' ? '*' : '(только если оплачено)'}
                            </span>
                            <Input
                              type="date"
                              value={row.paid_at}
                              disabled={row.status !== 'PAID'}
                              onChange={(e) => {
                                const next = [...legacyOrderPayments];
                                next[idx] = { ...next[idx], paid_at: e.target.value };
                                setLegacyOrderPayments(next);
                              }}
                              className="h-10 rounded-xl text-sm disabled:opacity-50"
                            />
                          </div>
                          <div className="col-span-1 md:col-span-1">
                            <span className="text-xs text-gray-500">Месяц</span>
                            <Input
                              type="number"
                              min={1}
                              max={12}
                              value={row.month}
                              onChange={(e) => {
                                const next = [...legacyOrderPayments];
                                next[idx] = { ...next[idx], month: e.target.value };
                                setLegacyOrderPayments(next);
                              }}
                              className="h-10 rounded-xl text-sm"
                              placeholder="1-12"
                            />
                          </div>
                          <div className="col-span-1 md:col-span-1">
                            <span className="text-xs text-gray-500">Год</span>
                            <Input
                              type="number"
                              min={2000}
                              max={2100}
                              value={row.year}
                              onChange={(e) => {
                                const next = [...legacyOrderPayments];
                                next[idx] = { ...next[idx], year: e.target.value };
                                setLegacyOrderPayments(next);
                              }}
                              className="h-10 rounded-xl text-sm"
                              placeholder="2025"
                            />
                          </div>
                          <div className="col-span-2 md:col-span-3">
                            <span className="text-xs text-gray-500">Комментарий</span>
                            <Input
                              value={row.note}
                              onChange={(e) => {
                                const next = [...legacyOrderPayments];
                                next[idx] = { ...next[idx], note: e.target.value };
                                setLegacyOrderPayments(next);
                              }}
                              className="h-10 rounded-xl text-sm"
                            />
                          </div>
                          <div className="col-span-2 md:col-span-1 flex justify-end">
                            {isMonthlyLegacy && legacyOrderPayments.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600"
                                onClick={() => {
                                  setLegacyOrderPayments(legacyOrderPayments.filter((_, i) => i !== idx));
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 bg-white">
          {mode === MODE.SEARCH && (
            <Button
              type="button"
              onClick={() => setMode(MODE.CREATE)}
              className="w-full h-12 rounded-3xl bg-[#31876D] hover:bg-[#276b57] text-white font-semibold transition-colors"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Создать нового клиента
            </Button>
          )}

          {mode === MODE.CREATE && (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode(MODE.SEARCH)}
                className="flex-1 h-12 rounded-3xl border-gray-200 text-[#202422] hover:bg-gray-100"
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={handleCreateUser}
                disabled={isCreating}
                className="flex-1 h-12 rounded-3xl bg-[#31876D] hover:bg-[#276b57] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    <span>Создание...</span>
                  </div>
                ) : (
                  'Создать клиента'
                )}
              </Button>
            </div>
          )}

          {mode === MODE.LEGACY && (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode(MODE.SEARCH)}
                className="flex-1 h-12 rounded-3xl border-gray-200 text-[#202422] hover:bg-gray-100"
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={handleLegacyImport}
                disabled={isImporting || !legacyImportBuildOrderPayload}
                className="flex-1 h-12 rounded-3xl bg-[#31876D] hover:bg-[#276b57] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                    <span>Импорт...</span>
                  </div>
                ) : (
                  'Импортировать заказ'
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientSelector;
