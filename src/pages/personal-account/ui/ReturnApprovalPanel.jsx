import React from 'react';
import { Button } from '../../../components/ui/button';
import { formatCalendarDate } from '../../../shared/lib/utils/date';

const formatDate = (dateString) => {
  if (!dateString) return 'Не указана';
  return formatCalendarDate(dateString);
};

/**
 * Панель подтверждения возврата для заказов с cancel_status === 'PENDING'.
 * Показывает причину, комментарий, дату самовывоза и кнопку подтверждения.
 */
const ReturnApprovalPanel = ({ order, onApproveReturn, isLoading = false, className = '' }) => {
  if (!order || order.cancel_status !== 'PENDING' || typeof onApproveReturn !== 'function') {
    return null;
  }

  return (
    <div className={`space-y-4 pt-6 border-t border-gray-200 ${className}`}>
      <div className="bg-[#31876D]/5 border border-[#31876D]/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#31876D]/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#31876D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-[#273655] mb-1">Ожидает подтверждения возврата</h4>
            <p className="text-sm text-[#6B6B6B]">
              Клиент запросил возврат заказа. Подтвердите возврат, чтобы продолжить процесс расторжения контракта.
            </p>
            {order.cancel_reason && (
              <div className="mt-2 pt-2 border-t border-[#31876D]/20 space-y-1">
                <p className="text-xs text-[#6B6B6B]">
                  <span className="font-medium text-[#273655]">Причина:</span> {order.cancel_reason}
                </p>
                {order.cancel_reason_comment && (
                  <p className="text-xs text-[#6B6B6B]">
                    <span className="font-medium text-[#273655]">Комментарий:</span> {order.cancel_reason_comment}
                  </p>
                )}
                {order.self_pickup_date && (
                  <p className="text-xs text-[#6B6B6B]">
                    <span className="font-medium text-[#273655]">Дата самовывоза:</span> {formatDate(order.self_pickup_date)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={() => onApproveReturn(order.id)}
          disabled={isLoading}
          className="bg-[#31876D] hover:bg-[#31876D]/90 text-white rounded-xl flex items-center justify-center gap-2 min-w-[180px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Подтвердить возврат
        </Button>
      </div>
    </div>
  );
};

export default ReturnApprovalPanel;
