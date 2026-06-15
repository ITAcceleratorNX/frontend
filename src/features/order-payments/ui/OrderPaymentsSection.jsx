import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { FormSelect } from '@/shared/ui/FormSelect.jsx';
import { useAdminPayments, useConfirmManualPayment } from '@/shared/lib/hooks/use-payments';
import { useDeviceType } from '@/shared/lib/hooks/useWindowWidth';
import { STATUS_OPTIONS, MONTHS, YEARS, STATUS_LABEL, isUnpaidStatus } from '../model/constants';
import { formatAmount, formatDate, formatPeriod } from '../lib/formatters';
import ConfirmManualModal from './ConfirmManualModal';
import OrderPaymentsList from './OrderPaymentsList';
import OrderPaymentsPagination from './OrderPaymentsPagination';

const SummaryChips = ({ summary }) => (
  <div className="flex flex-wrap gap-2">
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-[#273655]">
      Всего: {summary.total}
    </span>
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#31876D]/10 text-[#31876D]">
      Оплачено: {summary.paid}
    </span>
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
      К оплате: {summary.unpaid}
    </span>
  </div>
);

const sortByPeriod = (a, b) => {
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
};

const CollapsedPreview = ({ rows, summary }) => {
  const sorted = [...rows].sort(sortByPeriod);
  const nextUnpaid = sorted.find((r) => isUnpaidStatus(r.status));
  const lastPaid = [...sorted].reverse().find((r) => r.status === 'PAID');

  if (rows.length === 0) {
    return <p className="text-sm text-[#6B6B6B]">Платежи по этому заказу не найдены</p>;
  }

  return (
    <div className="space-y-3">
      <SummaryChips summary={summary} />
      {nextUnpaid ? (
        <div className="flex justify-between items-center py-2.5 border-t border-gray-100">
          <span className="text-sm text-[#6B6B6B]">К оплате</span>
          <div className="text-right">
            <p className="text-sm font-medium text-[#273655]">
              {formatPeriod(nextUnpaid.month, nextUnpaid.year)} · {formatAmount(nextUnpaid.amount)}
            </p>
            <Badge variant="destructive" className="mt-1 font-medium">
              {STATUS_LABEL[nextUnpaid.status]}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center py-2.5 border-t border-gray-100">
          <span className="text-sm text-[#6B6B6B]">Статус</span>
          <Badge variant="outline" className="font-medium bg-[#31876D]/10 text-[#31876D] border-[#31876D]/20">
            Все платежи оплачены
          </Badge>
        </div>
      )}
      {lastPaid && (
        <div className="flex justify-between items-center py-2.5 border-t border-gray-100">
          <span className="text-sm text-[#6B6B6B]">Последняя оплата</span>
          <div className="text-right text-sm">
            <p className="font-medium text-[#273655]">
              {formatPeriod(lastPaid.month, lastPaid.year)} · {formatAmount(lastPaid.amount)}
            </p>
            <p className="text-xs text-[#6B6B6B] mt-0.5">{formatDate(lastPaid.paid_at)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderPaymentsSection = ({ orderId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [appliedMonth, setAppliedMonth] = useState('');
  const [appliedYear, setAppliedYear] = useState('');
  const [confirmRow, setConfirmRow] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { isMobile } = useDeviceType();

  const applyFilters = () => {
    setAppliedMonth(filterMonth);
    setAppliedYear(filterYear);
    setPage(1);
  };

  const resetFilters = () => {
    setFilterMonth('');
    setFilterYear('');
    setAppliedMonth('');
    setAppliedYear('');
    setPage(1);
  };

  const summaryFilters = useMemo(
    () => ({ status: 'all', orderId: String(orderId) }),
    [orderId]
  );

  const detailFilters = useMemo(() => {
    const f = { status: statusFilter, orderId: String(orderId) };
    if (appliedMonth) f.month = appliedMonth;
    if (appliedYear) f.year = appliedYear;
    return f;
  }, [statusFilter, appliedMonth, appliedYear, orderId]);

  const activeFilters = isExpanded ? detailFilters : summaryFilters;
  const activePage = isExpanded ? page : 1;

  const { data, isLoading, error, refetch } = useAdminPayments(activePage, activeFilters, {
    enabled: !!orderId,
    limit: 100,
  });

  const confirmManual = useConfirmManualPayment();

  const rows = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, pageSize: 100, totalPages: 1 };

  const summary = useMemo(() => {
    const paid = rows.filter((r) => r.status === 'PAID').length;
    const unpaid = rows.filter((r) => r.status === 'UNPAID' || r.status === 'MANUAL').length;
    return { total: meta.total, paid, unpaid };
  }, [rows, meta.total]);

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

  const hasPeriodFilters = filterMonth || filterYear || appliedMonth || appliedYear;

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  return (
    <Card className="border-gray-200 rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold text-[#202422] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#31876D]" />
            История оплат
          </CardTitle>
          <button
            type="button"
            onClick={toggleExpanded}
            className="text-sm text-[#31876D] hover:text-[#276b57] flex items-center gap-1 shrink-0"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                Скрыть
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Подробнее
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {isLoading ? (
          <div className="flex items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#31876D]" />
            <span className="ml-3 text-sm text-[#6B6B6B]">Загрузка платежей…</span>
          </div>
        ) : error ? (
          <div className="py-4 text-center">
            <p className="text-sm text-red-600 mb-3">
              {error?.message || 'Не удалось загрузить платежи'}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Попробовать снова
            </Button>
          </div>
        ) : !isExpanded ? (
          <CollapsedPreview rows={rows} summary={summary} />
        ) : (
          <>
            <div>
              <p className="text-sm font-medium text-[#6B6B6B] mb-2">Статус</p>
              <Tabs
                value={statusFilter}
                onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
                  {STATUS_OPTIONS.map((opt) => (
                    <TabsTrigger key={String(opt.value)} value={opt.value}>
                      {opt.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Месяц"
                value={filterMonth}
                onChange={setFilterMonth}
                options={MONTHS}
                placeholder="Любой месяц"
                labelVariant="default"
                labelClassName="block mb-1 text-[#6B6B6B] text-sm"
              />
              <FormSelect
                label="Год"
                value={filterYear}
                onChange={setFilterYear}
                options={YEARS}
                placeholder="Любой год"
                labelVariant="default"
                labelClassName="block mb-1 text-[#6B6B6B] text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl border-[#00A991] text-[#00A991] hover:bg-[#00A991]/10"
                onClick={applyFilters}
              >
                Применить
              </Button>
              {hasPeriodFilters && (
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

            {statusFilter === 'all' && rows.length > 0 && (
              <SummaryChips summary={summary} />
            )}

            <OrderPaymentsList
              rows={rows}
              variant="compact"
              isMobile={isMobile}
              onConfirmClick={handleConfirmClick}
              isConfirmPending={confirmManual.isPending}
              emptyMessage="Платежи по этому заказу не найдены"
            />

            <OrderPaymentsPagination
              page={page}
              meta={meta}
              onPageChange={setPage}
              compact
            />
          </>
        )}
      </CardContent>

      <ConfirmManualModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        row={confirmRow}
        onConfirm={handleConfirmSubmit}
        isSubmitting={confirmManual.isPending}
      />
    </Card>
  );
};

export default OrderPaymentsSection;
