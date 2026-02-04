import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminPayments, useConfirmManualPayment } from '@/shared/lib/hooks/use-payments';
import { useDeviceType } from '@/shared/lib/hooks/useWindowWidth';
import { showOrderLoadError } from '@/shared/lib/utils/notifications';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'UNPAID', label: 'Не оплачено' },
  { value: 'MANUAL', label: 'Ручная оплата' },
  { value: 'PAID', label: 'Оплачено' },
];

const STATUS_LABEL = {
  UNPAID: 'Не оплачено',
  MANUAL: 'Ручная оплата',
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

const AdminPaymentsPage = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const { isMobile } = useDeviceType();

  const filters = useMemo(() => ({ status: statusFilter }), [statusFilter]);
  const { data, isLoading, error, refetch } = useAdminPayments(page, filters, {
    onError: () => showOrderLoadError(),
  });
  const confirmManual = useConfirmManualPayment();

  const rows = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, pageSize: 20, totalPages: 1 };

  const handleConfirm = (orderPaymentId) => {
    confirmManual.mutate({ orderPaymentId });
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
          <CardTitle className="text-[#273655]">Статус</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
              {STATUS_OPTIONS.map((opt) => (
                <TabsTrigger key={opt.value} value={opt.value}>
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
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
                    onClick={() => handleConfirm(row.id)}
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
                          onClick={() => handleConfirm(row.id)}
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
    </div>
  );
};

export default AdminPaymentsPage;
