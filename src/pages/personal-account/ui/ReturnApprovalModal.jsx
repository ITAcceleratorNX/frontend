import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import ReturnApprovalPanel from './ReturnApprovalPanel';

/**
 * Модалка подтверждения возврата для заказов с cancel_status === 'PENDING'.
 * Оборачивает ReturnApprovalPanel в Dialog.
 */
const ReturnApprovalModal = ({
  isOpen,
  order,
  onClose,
  onApproveReturn,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const showPanel = order && order.cancel_status === 'PENDING' && typeof onApproveReturn === 'function';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#202422]">
            Подтверждение возврата
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            {order ? `Заказ #${order.id} ожидает подтверждения возврата` : 'Загрузка...'}
          </DialogDescription>
        </DialogHeader>
        <div className="pt-2">
          {showPanel ? (
            <ReturnApprovalPanel
              order={order}
              onApproveReturn={onApproveReturn}
              isLoading={isLoading}
              className="pt-0 border-t-0"
            />
          ) : (
            <p className="text-sm text-gray-500">Нет данных для подтверждения возврата.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnApprovalModal;
