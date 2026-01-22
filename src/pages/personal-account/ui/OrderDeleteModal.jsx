import React from 'react';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { useDeleteOrder } from '../../../shared/lib/hooks/use-orders';

const OrderDeleteModal = ({ isOpen, order, onClose }) => {
  const deleteOrderMutation = useDeleteOrder();

  const handleDeleteOrder = async () => {
    try {
      await deleteOrderMutation.mutateAsync(order.id);
      onClose();
    } catch (error) {
      console.error('Ошибка при удалении заказа:', error);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-sm rounded-2xl border-none p-5 sm:p-6">
        {/* Заголовок */}
        <h2 className="text-lg sm:text-xl font-bold text-[#273655] text-center">
          Отменить заказ #{order.id}?
        </h2>
        
        {/* Описание */}
        <p className="text-sm text-[#6B6B6B] text-center mt-2">
          Это действие нельзя отменить
        </p>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={deleteOrderMutation.isPending}
            className="w-full sm:flex-1 h-11 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#273655] transition hover:bg-[#F9FAFB] active:bg-[#F3F4F6] disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleDeleteOrder}
            disabled={deleteOrderMutation.isPending}
            className="w-full sm:flex-1 h-11 rounded-xl bg-[#EF4444] text-sm font-medium text-white transition hover:bg-[#DC2626] active:bg-[#B91C1C] disabled:opacity-50 flex items-center justify-center"
          >
            {deleteOrderMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              'Подтвердить'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDeleteModal;