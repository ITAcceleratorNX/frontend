import React, { useState } from 'react';
import { CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import LeadForm from './LeadForm.jsx';
import { trackEvent, LP_EVENTS } from '@/shared/lib/analytics.js';
import { DISPLAY_PHONE, TEL_LINK } from './PhoneGatingModal.jsx';

const WHATSAPP_LINK = 'https://wa.me/77783911425';

/**
 * Inline phone-gating mini-form (no modal) — recommended for higher CR per
 * the LP-1 prompt §2.8. After submit, swaps with success state showing
 * phone + WhatsApp.
 */
export default function MiniFormSection({
  serviceType,
  pageSection = 'mini_form',
  title = 'Хотите подобрать бокс? Перезвоним за 15 минут',
  description = 'Заполните форму — менеджер ExtraSpace перезвонит и поможет с подбором. Никаких тел: ссылок до того, как мы получим ваш контакт.',
  showClientType = false,
  initialClientType = 'b2c',
  bgClassName = 'bg-[#F7FAF9]',
}) {
  const [done, setDone] = useState(false);

  const handleSuccess = () => {
    setDone(true);
    trackEvent(LP_EVENTS.PHONE_REVEALED, {
      landing_page: typeof window !== 'undefined' ? window.location.pathname : '',
      service_type: serviceType,
      page_section: pageSection,
    });
  };

  return (
    <section className={`w-full ${bgClassName} py-16 sm:py-20 lg:py-24`} id="mini-form">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.06)] sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-5">
              <h2 className="font-soyuz-grotesk text-3xl font-bold leading-tight text-[#202422] sm:text-4xl lg:text-5xl">
                {title}
              </h2>
              <p className="text-sm text-[#555A65] sm:text-base">{description}</p>
              <ul className="space-y-2 text-sm text-[#374151] sm:text-[15px]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#31876D]" aria-hidden />
                  Перезвоним и пришлём номер сразу после отправки заявки.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#31876D]" aria-hidden />
                  Подскажем оптимальный размер и стоимость без визита.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#31876D]" aria-hidden />
                  Без обязательств — если не подойдёт, ничего не списываем.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-[#F7FAF9] p-5 sm:p-6">
              {!done ? (
                <LeadForm
                  serviceType={serviceType}
                  pageSection={pageSection}
                  formId="mini-form"
                  variant="miniform"
                  showClientType={showClientType}
                  initialClientType={initialClientType}
                  onSuccess={handleSuccess}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                    <CheckCircle2 size={36} className="mx-auto text-[#31876D]" aria-hidden />
                    <p className="mt-2 text-base font-semibold text-[#273655]">
                      Заявка отправлена!
                    </p>
                    <p className="text-xs text-[#6b7280]">
                      Менеджер перезвонит в течение 15 минут.
                    </p>
                    <a
                      href={TEL_LINK}
                      className="mt-3 block text-2xl font-bold text-[#00A991] hover:text-[#008a7a]"
                    >
                      {DISPLAY_PHONE}
                    </a>
                  </div>
                  <a
                    href={TEL_LINK}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#31876D] text-sm font-semibold text-white transition hover:bg-[#2a7260]"
                  >
                    <Phone size={16} aria-hidden /> Позвонить сейчас
                  </a>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent(LP_EVENTS.WHATSAPP_CLICK, {
                        landing_page:
                          typeof window !== 'undefined' ? window.location.pathname : '',
                        section: pageSection,
                        service_type: serviceType,
                      })
                    }
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#128C7E] text-sm font-semibold text-white transition hover:bg-[#0e7568]"
                  >
                    <MessageCircle size={16} aria-hidden /> WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
