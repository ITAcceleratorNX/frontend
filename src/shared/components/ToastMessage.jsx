import React from 'react';
import { Check, X, Info, Loader2 } from 'lucide-react';

const VARIANTS = {
  loading: {
    titleDefault: 'Загрузка',
    containerClass:
      'ea-toast bg-[#F5F9FF] border border-[#9DC0EE] shadow-[0_4px_16px_rgba(16,11,39,0.08)]',
    badgeClass: 'from-[#4DCAFF] to-[#4EA3E0]',
    titleClass: 'text-[#27303A]',
    messageClass: 'text-[#2F3F53]',
  },
  success: {
    titleDefault: 'Успешно',
    containerClass:
      'ea-toast bg-[#F6FFF9] border border-[#48C1B5] shadow-[0_4px_16px_rgba(16,11,39,0.08)]',
    badgeClass: 'from-[#48CA93] to-[#48BACA]',
    titleClass: 'text-[#27303A]',
    messageClass: 'text-[#2F3F53]',
  },
  error: {
    titleDefault: 'Ошибка',
    containerClass:
      'ea-toast bg-[#FFF5F3] border border-[#F4B0A1] shadow-[0_4px_16px_rgba(16,11,39,0.08)]',
    badgeClass: 'from-[#E88B76] to-[#CA5048]',
    titleClass: 'text-[#27303A]',
    messageClass: 'text-[#2F3F53]',
  },
  info: {
    titleDefault: 'Уведомление',
    containerClass:
      'ea-toast bg-[#F5F9FF] border border-[#9DC0EE] shadow-[0_4px_16px_rgba(16,11,39,0.08)]',
    badgeClass: 'from-[#4DCAFF] to-[#4EA3E0]',
    titleClass: 'text-[#27303A]',
    messageClass: 'text-[#2F3F53]',
  },
};

const ICONS = {
  loading: <Loader2 className="w-3.5 h-3.5 text-white animate-spin" strokeWidth={2.5} />,
  success: <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />,
  error: <X className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />,
  info: <Info className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />,
};

/**
 * Универсальный компонент тоста по макету Figma.
 *
 * type:
 *  - "success" — зелёная галочка: вход/регистрация, оплата, подтверждение заказа
 *  - "error"   — красный крестик: ошибки валидации, баги, отклонённый заказ
 *  - "info"    — синяя "i": статусы курьера, ожидание подтверждения, напоминания об оплате и выборе времени
 *
 * onClose:
 *  - функция закрытия тоста (передаётся из react-toastify)
 */
export function ToastMessage({ type = 'info', title, message, onClose }) {
  const variant = VARIANTS[type] || VARIANTS.info;

  return (
    <div
      className={`flex items-start gap-4 rounded-[12px] px-5 py-5 ${variant.containerClass}`}
    >
      {/* Иконка с градиентным фоном */}
      <div className="relative flex-shrink-0">
        <div className={`w-9 h-9 rounded-[6px] bg-gradient-to-b ${variant.badgeClass} flex items-center justify-center`}>
          <div className="w-6 h-6 rounded-full border border-white/70 flex items-center justify-center">
            {ICONS[type] || ICONS.info}
          </div>
        </div>
      </div>

      {/* Контент + крестик */}
      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold leading-[1.4] ${variant.titleClass}`}>
              {title || variant.titleDefault}
            </div>
            {message && (
              <div className={`mt-1 text-xs leading-[1.6] ${variant.messageClass} break-words whitespace-pre-line`}>
                {message}
              </div>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-2 mt-1 w-5 h-5 flex items-center justify-center rounded-full border border-[#979FA9] text-[#979FA9] text-[10px] leading-none hover:bg-[#f3f4f6] transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ToastMessage;

