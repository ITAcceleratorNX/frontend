import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import LeadForm from './LeadForm.jsx';
import { trackEvent, LP_EVENTS } from '@/shared/lib/analytics.js';

/**
 * Inline lead form on LP-1. После отправки — редирект на /thank-you с номером (как phone gating).
 */
export default function MiniFormSection({
  serviceType,
  pageSection = 'mini_form',
  title = 'Хотите подобрать бокс? Перезвоним за 15 минут',
  description = 'Заполните форму — менеджер ExtraSpace перезвонит и поможет с подбором. Номер для связи откроется на следующей странице.',
  showClientType = false,
  initialClientType = 'b2c',
  bgClassName = 'bg-[#F7FAF9]',
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
    <section className={`w-full ${bgClassName} py-12 sm:py-16 lg:py-24`} id="mini-form">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-5 shadow-[0_24px_64px_rgba(15,23,42,0.06)] sm:p-8 lg:p-12">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4 sm:space-y-5">
              <h2 className="font-soyuz-grotesk text-2xl font-bold leading-tight text-[#202422] xs:text-3xl sm:text-4xl lg:text-5xl">
                {title}
              </h2>
              <p className="text-sm text-[#555A65] sm:text-base">{description}</p>
              <ul className="space-y-2 text-sm text-[#374151] sm:text-[15px]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#31876D]" aria-hidden />
                  После отправки откроется страница с номером — можно сразу позвонить или написать в WhatsApp.
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

            <div className="rounded-2xl bg-[#F7FAF9] p-4 sm:p-6">
              <LeadForm
                serviceType={serviceType}
                pageSection={pageSection}
                formId="mini-form"
                variant="miniform"
                showClientType={showClientType}
                initialClientType={initialClientType}
                onSuccess={handleFormSuccess}
                successNavigate={{ to: '/thank-you', state: thankYouState }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
