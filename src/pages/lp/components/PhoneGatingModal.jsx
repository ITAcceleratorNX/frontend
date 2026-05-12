import React from 'react';
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
 * After a successful submit we fire `phone_revealed` and redirect to /thank-you
 * (номер и WhatsApp — на странице «Спасибо», удобно для конверсий и аналитики).
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

export { buildWhatsAppLink };

export default function PhoneGatingModal({
  open,
  onOpenChange,
  serviceType,
  pageSection = 'phone_gating',
  title = 'Покажем номер сразу — оставьте контакт',
  description = 'Заполните форму. Менеджер ExtraSpace перезвонит в течение 15 минут, номер для звонка откроется на следующей странице.',
  showClientType = false,
  initialClientType = 'b2c',
}) {
  const handleFormSuccess = () => {
    trackEvent(LP_EVENTS.PHONE_REVEALED, {
      landing_page: typeof window !== 'undefined' ? window.location.pathname : '',
      service_type: serviceType,
      page_section: pageSection,
    });
  };

  const thankYouState = {
    from: 'lp',
    revealPhone: true,
    serviceType,
    pageSection,
    landingPath: typeof window !== 'undefined' ? window.location.pathname : '',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100%-0.75rem)] max-w-none flex-col gap-0 overflow-hidden rounded-3xl border-none p-0 sm:w-full sm:max-w-md">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-white p-5 sm:gap-5 sm:p-7">
          <DialogHeader className="space-y-1.5 pr-6 text-left sm:space-y-2">
            <DialogTitle className="text-lg font-bold text-[#273655] sm:text-2xl">{title}</DialogTitle>
            <p className="text-sm text-[#6b7280]">{description}</p>
          </DialogHeader>

          <LeadForm
            serviceType={serviceType}
            pageSection={pageSection}
            formId="phone-gating"
            variant="modal"
            submitLabel="Показать номер"
            showClientType={showClientType}
            initialClientType={initialClientType}
            onSuccess={handleFormSuccess}
            successNavigate={{ to: '/thank-you', state: thankYouState }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
