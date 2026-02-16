import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAdminPayments, useConfirmManualPayment, usePaymentSettings, useUpdatePaymentSettings } from '@/shared/lib/hooks/use-payments';
import { useDeviceType } from '@/shared/lib/hooks/useWindowWidth';
import { showOrderLoadError } from '@/shared/lib/utils/notifications';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: ['UNPAID', 'MANUAL'], label: 'Не оплачено' },
  { value: 'PAID', label: 'Оплачено' },
];

const MONTHS = [
  { value: '', label: 'Любой месяц' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1).padStart(2, '0') })),
];

const STATUS_LABEL = {
  UNPAID: 'Не оплачено',
  MANUAL: 'Не оплачено',
  PAID: 'Оплачено',
  CANCELED: 'Отменён',
};

const formatAmount = (v) => (v != null ? Number(v).toLocaleString('ru-RU') + ' ₸' : '—');
const formatPeriod = (month, year) => (month && year ? `${String(month).padStart(2, '0')}/${year}` : '—');
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('ru-RU') : '—');
const formatClient = (user) => {
  if (!user) return '—';
  const parts = [user.phone, user.name].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
};

const currentYear = new Date().getFullYear();
const YEARS = [
  { value: '', label: 'Любой год' },
  ...Array.from({ length: 6 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) })),
];

/** Модалка подтверждения ручной оплаты с предупреждением */
const ConfirmManualModal = ({ open, onOpenChange, row, onConfirm, isSubmitting }) => {
  if (!row) return null;
  const handleConfirm = () => {
    onConfirm(row.id);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 rounded-2xl">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-lg font-bold text-[#273655]">Подтвердить ручную оплату</DialogTitle>
          <DialogDescription className="text-xs text-[#8A8A8A]">
            Убедитесь, что деньги от клиента действительно поступили на счёт (банк, касса, перевод). После подтверждения статус изменится на «Оплачено».
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-3 text-sm text-[#273655] space-y-2 border-t border-gray-100 pt-3">
          <p><span className="text-gray-500">Платёж ID:</span> {row.id}</p>
          <p><span className="text-gray-500">Заказ:</span> №{row.order_id}</p>
          <p><span className="text-gray-500">Клиент:</span> {formatClient(row.order?.user)}</p>
          <p><span className="text-gray-500">Сумма:</span> {formatAmount(row.amount)}</p>
          <p><span className="text-gray-500">Период:</span> {formatPeriod(row.month, row.year)}</p>
        </div>
        <DialogFooter className="px-5 py-4 border-t border-gray-100 rounded-b-2xl gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-10 rounded-xl border-gray-200 text-[#273655]"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            type="button"
            className="flex-1 h-10 rounded-xl bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-white hover:opacity-90"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Подтверждение…' : 'Подтвердить оплату'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AdminPaymentsPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterOrderId, setFilterOrderId] = useState('');
  // Применённые значения — уходят в API только после "Применить" или Enter (не при каждом вводе)
  const [appliedMonth, setAppliedMonth] = useState('');
  const [appliedYear, setAppliedYear] = useState('');
  const [appliedPhone, setAppliedPhone] = useState('');
  const [appliedOrderId, setAppliedOrderId] = useState('');
  const [confirmRow, setConfirmRow] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { isMobile } = useDeviceType();

  const applyFilters = () => {
    setAppliedMonth(filterMonth);
    setAppliedYear(filterYear);
    setAppliedPhone(filterPhone.trim());
    setAppliedOrderId(filterOrderId.trim());
    setPage(1);
  };

  const resetFilters = () => {
    setFilterMonth('');
    setFilterYear('');
    setFilterPhone('');
    setFilterOrderId('');
    setAppliedMonth('');
    setAppliedYear('');
    setAppliedPhone('');
    setAppliedOrderId('');
    setPage(1);
  };

  const filters = useMemo(() => {
    const f = { status: statusFilter };
    if (appliedMonth) f.month = appliedMonth;
    if (appliedYear) f.year = appliedYear;
    if (appliedPhone) f.phone = appliedPhone;
    if (appliedOrderId) f.orderId = appliedOrderId;
    return f;
  }, [statusFilter, appliedMonth, appliedYear, appliedPhone, appliedOrderId]);

  const { data, isLoading, error, refetch } = useAdminPayments(page, filters, {
    onError: () => showOrderLoadError(),
  });
  const confirmManual = useConfirmManualPayment();
  const { data: paymentSettings, isLoading: settingsLoading } = usePaymentSettings();
  const updateSettings = useUpdatePaymentSettings();

  const rows = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, pageSize: 20, totalPages: 1 };
  const onlinePaymentEnabled = paymentSettings?.online_payment_enabled;

  const handleConfirmClick = (row) => {
    setConfirmRow(row);
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = (orderPaymentId) => {
    confirmManual.mutate(
      { orderPaymentId },
      { onSettled: () => setConfirmModalOpen(false) }
    );
    setConfirmRow(null);
  };

  const handleOnlinePaymentToggle = (checked) => {
    updateSettings.mutate({ online_payment_enabled: checked });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8">
        <Card className="p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#273655]" />
            <span className="ml-3 text-[#273655] font-medium">Загрузка платежей...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-red-700 mb-4 font-medium">
              {error?.message || 'Произошла ошибка при загрузке платежей'}
            </div>
            <Button onClick={() => refetch()} className="bg-[#273655] hover:bg-[#273655]/90">
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-8 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#273655] mb-2">Оплаты</h1>
        <p className="text-gray-600">Платежи по заказам. Подтверждение ручной оплаты.</p>
      </div>

      <Card className="bg-white rounded-2xl border border-[#E0F2FE]">
        <CardHeader>
          <CardTitle className="text-[#273655]">Настройки оплаты</CardTitle>
          <p className="text-sm text-[#8A8A8A]">Включение или отключение онлайн-оплаты (TipTop Pay). При выключении клиенты видят контакты менеджера, оплату подтверждаете вручную в разделе ниже.</p>
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#00A991] border-t-transparent" />
              Загрузка настроек…
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <label htmlFor="online-payment-enabled" className="text-sm font-medium text-[#273655] cursor-pointer">
                Онлайн-оплата включена
              </label>
              <Switch
                id="online-payment-enabled"
                checked={onlinePaymentEnabled}
                onCheckedChange={handleOnlinePaymentToggle}
                disabled={updateSettings.isPending}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white rounded-2xl border border-[#E0F2FE]">
        <CardHeader>
          <CardTitle className="text-[#273655]">Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-[#273655] mb-2">Статус</p>
            <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }} className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 w-full">
                {STATUS_OPTIONS.map((opt) => (
                  <TabsTrigger key={opt.value} value={opt.value}>
                    {opt.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#273655] mb-1">Месяц</label>
              <Select value={filterMonth || ' '} onValueChange={(v) => setFilterMonth(v === ' ' ? '' : v)}>
                <SelectTrigger className="rounded-xl border-gray-200">
                  <SelectValue placeholder="Любой месяц" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value || 'any'} value={m.value || ' '}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#273655] mb-1">Год</label>
              <Select value={filterYear || ' '} onValueChange={(v) => setFilterYear(v === ' ' ? '' : v)}>
                <SelectTrigger className="rounded-xl border-gray-200">
                  <SelectValue placeholder="Любой год" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y.value || 'any'} value={y.value || ' '}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#273655] mb-1">Телефон клиента</label>
              <Input
                placeholder="+7 777 123 45 67"
                value={filterPhone}
                onChange={(e) => setFilterPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="rounded-xl border-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#273655] mb-1">ID заказа</label>
              <Input
                placeholder="Номер заказа"
                value={filterOrderId}
                onChange={(e) => setFilterOrderId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="rounded-xl border-gray-200"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl border-[#00A991] text-[#00A991] hover:bg-[#00A991]/10"
              onClick={applyFilters}
            >
              Применить фильтры
            </Button>
            {(filterMonth || filterYear || filterPhone.trim() || filterOrderId.trim() || appliedMonth || appliedYear || appliedPhone || appliedOrderId) && (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-xl text-gray-500"
                onClick={resetFilters}
              >
                Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <Card className="bg-white rounded-2xl border border-[#E0F2FE]">
          <CardContent className="p-12 text-center text-gray-500">
            Платежи не найдены. Измените фильтр или попробуйте позже.
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-4">
          {rows.map((row) => (
            <Card key={row.id} className="bg-white rounded-2xl border border-[#E0F2FE]">
              <CardContent className="p-4 space-y-2">
                <div><span className="text-gray-500">ID:</span> {row.id}</div>
                <div><span className="text-gray-500">Заказ:</span> №{row.order_id}</div>
                <div><span className="text-gray-500">Клиент:</span> {formatClient(row.order?.user)}</div>
                <div><span className="text-gray-500">Сумма:</span> {formatAmount(row.amount)}</div>
                <div><span className="text-gray-500">Период:</span> {formatPeriod(row.month, row.year)}</div>
                <div><span className="text-gray-500">Статус:</span> {STATUS_LABEL[row.status] ?? row.status}</div>
                <div><span className="text-gray-500">Дата оплаты:</span> {formatDate(row.paid_at)}</div>
                {(row.status === 'UNPAID' || row.status === 'MANUAL') && (
                  <Button
                    size="sm"
                    className="bg-[#00A991] hover:bg-[#009882] mt-2"
                    disabled={confirmManual.isPending}
                    onClick={() => handleConfirmClick(row)}
                  >
                    Подтвердить вручную
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white rounded-2xl border border-[#E0F2FE]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[#273655]">ID</TableHead>
                  <TableHead className="text-[#273655]">№ заказа</TableHead>
                  <TableHead className="text-[#273655]">Клиент</TableHead>
                  <TableHead className="text-[#273655]">Сумма</TableHead>
                  <TableHead className="text-[#273655]">Период</TableHead>
                  <TableHead className="text-[#273655]">Статус</TableHead>
                  <TableHead className="text-[#273655]">Дата оплаты</TableHead>
                  <TableHead className="text-[#273655]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>№{row.order_id}</TableCell>
                    <TableCell>{formatClient(row.order?.user)}</TableCell>
                    <TableCell>{formatAmount(row.amount)}</TableCell>
                    <TableCell>{formatPeriod(row.month, row.year)}</TableCell>
                    <TableCell>{STATUS_LABEL[row.status] ?? row.status}</TableCell>
                    <TableCell>{formatDate(row.paid_at)}</TableCell>
                    <TableCell>
                      {(row.status === 'UNPAID' || row.status === 'MANUAL') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#00A991] text-[#00A991] hover:bg-[#00A991]/10"
                          disabled={confirmManual.isPending}
                          onClick={() => handleConfirmClick(row)}
                        >
                          Подтвердить вручную
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {meta.totalPages > 1 && (
        <Card className="border border-[#E0F2FE]">
          <CardContent className="p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                  let pageNum;
                  if (meta.totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= meta.totalPages - 2) pageNum = meta.totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={page === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                    className={page >= meta.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="text-center text-sm text-gray-500 mt-2">
              Страница {page} из {meta.totalPages} • Всего {meta.total} платежей
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmManualModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        row={confirmRow}
        onConfirm={handleConfirmSubmit}
        isSubmitting={confirmManual.isPending}
      />
    </div>
  );
};

export default AdminPaymentsPage;
