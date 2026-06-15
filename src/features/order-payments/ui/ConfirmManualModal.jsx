import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatAmount, formatClient, formatPeriod } from '../lib/formatters';

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

export default ConfirmManualModal;
