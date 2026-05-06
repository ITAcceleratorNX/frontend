import React, { useEffect, useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import LeadForm from './LeadForm.jsx';
import { trackEvent, LP_EVENTS } from '@/shared/lib/analytics.js';

/**
 * Phone-gating modal per ТЗ §3.4.
 * Two states:
 *  1. form  — collect name + phone + agreement (LeadForm).
 *  2. reveal — show real phone number + "Позвонить" + "Написать в WhatsApp".
 *
 * On open we DO NOT show the number. Only after a successful submit we flip to state 2,
 * which simultaneously fires `phone_revealed` GTM event.
 *
 * Note: We display Russian phone with explicit dashes for readability while
 * the tel:/wa.me hrefs use raw E.164 digits.
 */

export const DISPLAY_PHONE = '+7 778 391-14-25';
export const TEL_LINK = 'tel:+77783911425';
const WHATSAPP_DIGITS = '77783911425';

function buildWhatsAppLink(serviceType) {
  const messages = {
    individual: 'Здравствуйте! Хочу подобрать индивидуальный бокс в ExtraSpace.',
    camera: 'Здравствуйте! Хочу узнать про камеру хранения ExtraSpace.',
    cloud: 'Здравствуйте! Хочу узнать про облачное хранение ExtraSpace.',
  };
  const msg = encodeURIComponent(messages[serviceType] || messages.individual);
  return `https://wa.me/${WHATSAPP_DIGITS}?text=${msg}`;
}

export default function PhoneGatingModal({
  open,
  onOpenChange,
  serviceType,
  pageSection = 'phone_gating',
  title = 'Покажем номер сразу — оставьте контакт',
  description = 'Заполните форму. Менеджер ExtraSpace перезвонит в течение 15 минут, а номер для звонка появится здесь же.',
  showClientType = false,
  initialClientType = 'b2c',
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => setRevealed(false), 200);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [open]);

  const handleSuccess = () => {
    setRevealed(true);
    trackEvent(LP_EVENTS.PHONE_REVEALED, {
      landing_page: typeof window !== 'undefined' ? window.location.pathname : '',
      service_type: serviceType,
      page_section: pageSection,
    });
  };

  const whatsAppLink = buildWhatsAppLink(serviceType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md overflow-hidden rounded-3xl border-none p-0 sm:w-full">
        <div className="flex flex-col gap-5 bg-white p-5 sm:p-7">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-bold text-[#273655] sm:text-2xl">
              {revealed ? 'Готово! Вот наш номер' : title}
            </DialogTitle>
            <p className="text-sm text-[#6b7280]">
              {revealed
                ? 'Заявка ушла менеджеру. Можете сразу позвонить или написать в WhatsApp.'
                : description}
            </p>
          </DialogHeader>

          {!revealed ? (
            <LeadForm
              serviceType={serviceType}
              pageSection={pageSection}
              formId="phone-gating"
              variant="modal"
              submitLabel="Показать номер"
              showClientType={showClientType}
              initialClientType={initialClientType}
              onSuccess={handleSuccess}
            />
          ) : (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-[#F5F6FA] p-4 text-center">
                <p className="text-xs uppercase tracking-[0.12em] text-[#6B6B6B]">Звоните</p>
                <a
                  href={TEL_LINK}
                  className="block text-2xl font-bold text-[#00A991] transition hover:text-[#008a7a]"
                  onClick={() =>
                    trackEvent(LP_EVENTS.PHONE_REVEALED, {
                      landing_page: typeof window !== 'undefined' ? window.location.pathname : '',
                      service_type: serviceType,
                      action: 'tel_click',
                    })
                  }
                >
                  {DISPLAY_PHONE}
                </a>
              </div>

              <a
                href={TEL_LINK}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#31876D] text-sm font-semibold text-white transition hover:bg-[#2a7260]"
              >
                <Phone size={16} aria-hidden /> Позвонить
              </a>

              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent(LP_EVENTS.WHATSAPP_CLICK, {
                    landing_page: typeof window !== 'undefined' ? window.location.pathname : '',
                    section: pageSection,
                    service_type: serviceType,
                  })
                }
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#128C7E] text-sm font-semibold text-white transition hover:bg-[#0e7568]"
              >
                <MessageCircle size={16} aria-hidden /> Написать в WhatsApp
              </a>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d5d8e1] text-sm font-medium text-[#273655] transition hover:bg-[#f7faf9]"
              >
                <X size={14} aria-hidden /> Закрыть
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
