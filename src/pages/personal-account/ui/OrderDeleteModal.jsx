import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
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
      <DialogContent className="max-w-md w-full rounded-xl">
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-gray-900 text-center">
            Удаление заказа
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Вы уверены, что хотите удалить этот заказ?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Заказ:</span>
              <span className="text-sm font-medium">#{order.id}</span>
            </div>
            {order.storage && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Бокс:</span>
                <span className="text-sm font-medium">{order.storage.name}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Объем:</span>
              <span className="text-sm font-medium">{order.total_volume} м³</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Сумма:</span>
              <span className="text-sm font-medium">{parseFloat(order.total_price).toLocaleString('ru-RU')} ₸</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteOrderMutation.isPending}
            className="flex-1"
          >
            Отмена
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteOrder}
            disabled={deleteOrderMutation.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {deleteOrderMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Удаление...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Удалить
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDeleteModal;