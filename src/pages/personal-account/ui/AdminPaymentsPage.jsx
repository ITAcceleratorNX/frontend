import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormSelect } from '@/shared/ui/FormSelect.jsx';
import { Switch } from '@/components/ui/switch';
import { useAdminPayments, useConfirmManualPayment, usePaymentSettings, useUpdatePaymentSettings } from '@/shared/lib/hooks/use-payments';
import { useDeviceType } from '@/shared/lib/hooks/useWindowWidth';
import { showOrderLoadError } from '@/shared/lib/utils/notifications';
import {
  STATUS_OPTIONS,
  MONTHS,
  YEARS,
  ConfirmManualModal,
  OrderPaymentsList,
  OrderPaymentsPagination,
} from '@/features/order-payments';

const AdminPaymentsPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterOrderId, setFilterOrderId] = useState('');
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
          <p className="text-sm text-[#8A8A8A]">Включение или отключение онлайн-оплаты (One Vision). При выключении клиенты видят контакты менеджера, оплату подтверждаете вручную в разделе ниже.</p>
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
                  <TabsTrigger key={String(opt.value)} value={opt.value}>
                    {opt.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormSelect
              label="Месяц"
              value={filterMonth}
              onChange={setFilterMonth}
              options={MONTHS}
              placeholder="Любой месяц"
              labelVariant="default"
              labelClassName="block mb-1 text-[#273655]"
            />
            <FormSelect
              label="Год"
              value={filterYear}
              onChange={setFilterYear}
              options={YEARS}
              placeholder="Любой год"
              labelVariant="default"
              labelClassName="block mb-1 text-[#273655]"
            />
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
      ) : (
        <>
          <Card className="bg-white rounded-2xl border border-[#E0F2FE]">
            <CardContent className="p-0">
              <OrderPaymentsList
                rows={rows}
                variant="full"
                isMobile={isMobile}
                onConfirmClick={handleConfirmClick}
                isConfirmPending={confirmManual.isPending}
              />
            </CardContent>
          </Card>
          <OrderPaymentsPagination page={page} meta={meta} onPageChange={setPage} />
        </>
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
