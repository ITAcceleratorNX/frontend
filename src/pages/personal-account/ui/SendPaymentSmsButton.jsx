import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSendPaymentSms } from '../../../shared/lib/hooks/use-orders';

const STAFF_ROLES = ['ADMIN', 'MANAGER'];

/**
 * Кнопка «Отправить SMS на оплату» для админа/менеджера.
 * Видна только сотрудникам, требует подтверждения (предотвращаем случайные нажатия).
 * Сама проверка телефона и неоплаченных периодов — на бэке (B3-эндпоинт).
 */
const SendPaymentSmsButton = ({ order, className = '', size = 'sm', variant = 'outline' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const sendMutation = useSendPaymentSms();

  const isStaff = STAFF_ROLES.includes(user?.role);
  if (!isStaff || !order?.id) {
    return null;
  }

  const phone = order.user?.phone;

  const handleConfirm = async () => {
    try {
      await sendMutation.mutateAsync(order.id);
      setIsOpen(false);
    } catch {
      // Ошибки уже показаны в onError хука
    }
  };

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        onClick={() => setIsOpen(true)}
        disabled={sendMutation.isPending}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Отправить SMS на оплату
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отправить SMS-напоминание</DialogTitle>
            <DialogDescription>
              Клиенту будет отправлено SMS с просьбой оплатить заказ №{order.id}
              {phone ? ` на номер ${phone}` : ''}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={sendMutation.isPending}
            >
              Отмена
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={sendMutation.isPending}>
              {sendMutation.isPending ? 'Отправка…' : 'Отправить SMS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SendPaymentSmsButton;
