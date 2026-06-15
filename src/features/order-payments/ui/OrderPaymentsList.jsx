import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { STATUS_LABEL, isUnpaidStatus } from '../model/constants';
import { formatAmount, formatClient, formatDate, formatPeriod } from '../lib/formatters';

const StatusBadge = ({ status }) => {
  const label = STATUS_LABEL[status] ?? status;
  if (status === 'PAID') {
    return (
      <Badge variant="outline" className="font-medium bg-[#31876D]/10 text-[#31876D] border-[#31876D]/20">
        {label}
      </Badge>
    );
  }
  if (isUnpaidStatus(status)) {
    return (
      <Badge variant="destructive" className="font-medium">
        {label}
      </Badge>
    );
  }
  return <Badge variant="secondary">{label}</Badge>;
};

const OrderPaymentsList = ({
  rows,
  variant = 'full',
  isMobile,
  onConfirmClick,
  isConfirmPending,
  emptyMessage = 'Платежи не найдены. Измените фильтр или попробуйте позже.',
}) => {
  if (rows.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  const isCompact = variant === 'compact';

  if (isMobile) {
    return (
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id} className="bg-gray-50 rounded-xl border border-gray-100">
            <CardContent className="p-4 space-y-2 text-sm">
              {!isCompact && (
                <>
                  <div><span className="text-gray-500">ID:</span> {row.id}</div>
                  <div><span className="text-gray-500">Заказ:</span> №{row.order_id}</div>
                  <div><span className="text-gray-500">Клиент:</span> {formatClient(row.order?.user)}</div>
                </>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Период</span>
                <span className="font-medium text-[#273655]">{formatPeriod(row.month, row.year)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Сумма</span>
                <span className="font-medium text-[#273655]">{formatAmount(row.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Статус</span>
                <StatusBadge status={row.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Дата оплаты</span>
                <span className="text-[#273655]">{formatDate(row.paid_at)}</span>
              </div>
              {isUnpaidStatus(row.status) && (
                <Button
                  size="sm"
                  className={isCompact ? 'w-full mt-1 border-[#00A991] text-[#00A991] hover:bg-[#00A991]/10' : 'bg-[#00A991] hover:bg-[#009882] mt-2'}
                  variant={isCompact ? 'outline' : 'default'}
                  disabled={isConfirmPending}
                  onClick={() => onConfirmClick(row)}
                >
                  Подтвердить вручную
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={isCompact ? '' : 'rounded-2xl border border-[#E0F2FE] overflow-hidden'}>
      <Table>
        <TableHeader>
          <TableRow>
            {!isCompact && <TableHead className="text-[#273655]">ID</TableHead>}
            {!isCompact && <TableHead className="text-[#273655]">№ заказа</TableHead>}
            {!isCompact && <TableHead className="text-[#273655]">Клиент</TableHead>}
            <TableHead className="text-[#273655]">Период</TableHead>
            <TableHead className="text-[#273655]">Сумма</TableHead>
            <TableHead className="text-[#273655]">Статус</TableHead>
            <TableHead className="text-[#273655]">Дата оплаты</TableHead>
            <TableHead className="text-[#273655]">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {!isCompact && <TableCell>{row.id}</TableCell>}
              {!isCompact && <TableCell>№{row.order_id}</TableCell>}
              {!isCompact && <TableCell>{formatClient(row.order?.user)}</TableCell>}
              <TableCell>{formatPeriod(row.month, row.year)}</TableCell>
              <TableCell>{formatAmount(row.amount)}</TableCell>
              <TableCell><StatusBadge status={row.status} /></TableCell>
              <TableCell>{formatDate(row.paid_at)}</TableCell>
              <TableCell>
                {isUnpaidStatus(row.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#00A991] text-[#00A991] hover:bg-[#00A991]/10"
                    disabled={isConfirmPending}
                    onClick={() => onConfirmClick(row)}
                  >
                    Подтвердить вручную
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderPaymentsList;
