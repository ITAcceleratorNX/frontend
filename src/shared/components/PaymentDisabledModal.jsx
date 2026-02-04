import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui';
import { Button } from '@/components/ui';
import { PAYMENT_DISABLED_CONTACT } from '../config/payment.js';

/**
 * Modal shown when online payment is disabled. Displays manager contact (phone, WhatsApp)
 * and the exact message from product. Used wherever "Оплатить" would normally open payment.
 */
const PaymentDisabledModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#273655]">
            Онлайн-оплата временно недоступна
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-left text-sm text-gray-600 space-y-3 pt-1">
              <p>
                Чтобы провести оплату, пожалуйста, обратитесь к нашему менеджеру:
              </p>
              <p>
                Телефон: <a href={`tel:${PAYMENT_DISABLED_CONTACT.phoneRaw}`} className="text-[#00A991] hover:underline">{PAYMENT_DISABLED_CONTACT.phone}</a>
              </p>
              <p>
                WhatsApp:{' '}
                <a
                  href={PAYMENT_DISABLED_CONTACT.whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00A991] hover:underline"
                >
                  {PAYMENT_DISABLED_CONTACT.whatsAppUrl}
                </a>
              </p>
              <p>
                Контактную информацию также можно найти на нашем сайте.
              </p>
              <p>
                Приносим извинения за временные неудобства. Онлайн-оплата временно не работает.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end pt-2">
          <Button type="button" variant="default" onClick={() => onOpenChange?.(false)}>
            Понятно
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDisabledModal;
