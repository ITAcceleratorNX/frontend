import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui';
import { PAYMENT_DISABLED_CONTACT } from '../config/payment.js';

/**
 * Modal shown when online payment is disabled. Displays manager contact (phone, WhatsApp)
 * and the exact message from product. Used wherever "Оплатить" would normally open payment.
 * Styled like CancelSurveyModal (rounded-2xl, header/body/footer layout, gradient button).
 */
const PaymentDisabledModal = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[85vh] overflow-visible p-0 rounded-2xl">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-lg font-bold text-[#273655]">
            Онлайн-оплата временно недоступна
          </DialogTitle>
          <DialogDescription className="text-xs text-[#8A8A8A]">
            Обратитесь к менеджеру для проведения оплаты
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-3 max-h-[50vh] overflow-y-auto">
          <div className="text-left text-sm text-[#273655] space-y-3">
            <p>
              Чтобы провести оплату, пожалуйста, обратитесь к нашему менеджеру:
            </p>
            <p>
              Телефон:{' '}
              <a
                href={`tel:${PAYMENT_DISABLED_CONTACT.phoneRaw}`}
                className="text-[#00A991] hover:underline font-medium"
              >
                {PAYMENT_DISABLED_CONTACT.phone}
              </a>
            </p>
            <p className="flex items-center gap-2">
              WhatsApp:{' '}
              <a
                href={`https://wa.me/${PAYMENT_DISABLED_CONTACT.phoneRaw}?text=${encodeURIComponent(
                  'Здравствуйте! Обращаюсь по поводу временно недоступной онлайн-оплаты.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#00A991] hover:opacity-80 font-medium"
                aria-label="Написать в WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M12 2C6.477 2 2 6.335 2 11.687c0 1.9.57 3.664 1.553 5.157L2 22l5.352-1.503A10.23 10.23 0 0012 21.375c5.523 0 10-4.335 10-9.688C22 6.335 17.523 2 12 2zm0 17.625a8.43 8.43 0 01-4.318-1.18l-.31-.18-3.175.89.846-3.06-.2-.315A8.06 8.06 0 013.75 11.687C3.75 7.34 7.39 3.75 12 3.75s8.25 3.59 8.25 7.938-3.64 7.937-8.25 7.937zm4.508-5.146c-.245-.122-1.45-.71-1.674-.79-.224-.082-.388-.122-.552.122-.163.245-.632.79-.775.952-.143.163-.286.184-.53.061-.245-.122-1.033-.37-1.968-1.18-.728-.63-1.22-1.41-1.364-1.655-.143-.245-.015-.378.107-.5.11-.11.245-.286.368-.43.122-.143.163-.245.245-.408.082-.163.041-.306-.02-.43-.062-.122-.552-1.308-.756-1.79-.2-.48-.408-.41-.552-.418l-.47-.01c-.163 0-.43.061-.653.306-.224.245-.857.835-.857 2.04 0 1.205.878 2.37 1 2.535.122.163 1.728 2.69 4.19 3.77.586.245 1.044.39 1.4.5.588.184 1.124.158 1.548.096.472-.07 1.45-.59 1.654-1.16.204-.57.204-1.06.143-1.16-.061-.102-.224-.163-.47-.286z" />
                </svg>
                Написать
              </a>
            </p>
            <p>
              Контактную информацию также можно найти на нашем сайте.
            </p>
            <p className="text-[#8A8A8A]">
              Приносим извинения за временные неудобства. Онлайн-оплата временно не работает.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            className="w-full h-10 rounded-xl bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Понятно
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDisabledModal;
