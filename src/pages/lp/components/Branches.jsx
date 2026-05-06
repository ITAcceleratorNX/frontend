import React, { memo } from 'react';
import { MapPin, Phone, Navigation, ExternalLink, Clock } from 'lucide-react';
import TwoGisMap, { BRANCHES } from './TwoGisMap.jsx';
import { trackEvent, LP_EVENTS } from '@/shared/lib/analytics.js';

/**
 * Geo block per ТЗ §3.7 — 2 branches with map, addresses, "Построить маршрут"
 * and "Открыть в 2GIS" buttons.
 */

const BRANCH_LINKS = [
  {
    id: 'kekilbayuly',
    twoGisUrl: 'https://2gis.kz/almaty/firm/70000001088113502',
    routeUrl:
      'https://2gis.kz/almaty/directions/points/%7C76.890647%2C43.201397%3B?m=76.890647%2C43.201397%2F18',
  },
  {
    id: 'serkebayev',
    twoGisUrl: 'https://2gis.kz/almaty/firm/70000001088113503',
    routeUrl:
      'https://2gis.kz/almaty/directions/points/%7C76.900575%2C43.201302%3B?m=76.900575%2C43.201302%2F18',
  },
];

const BRANCH_DETAILS = BRANCHES.map((b, idx) => ({
  ...b,
  ...BRANCH_LINKS[idx],
}));

function BranchesSection({
  title = 'Два филиала в Алматы',
  subtitle = 'Оба склада в черте города, ровно между Бостандыкским и Ауэзовским районами. Работаем круглосуточно.',
}) {
  return (
    <section className="w-full bg-[#F7FAF9] py-12 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-sm text-[#555A65] sm:text-base">{subtitle}</p>
        </header>

        <div className="mb-8 overflow-hidden rounded-3xl border border-[#e5e9ed] bg-white shadow-sm sm:mb-10">
          <TwoGisMap height={520} mobileHeight={300} />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {BRANCH_DETAILS.map((branch) => (
            <article
              key={branch.id}
              className="flex flex-col gap-4 rounded-3xl border border-[#e5e9ed] bg-white p-6 shadow-sm sm:p-7"
            >
              <header className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#31876D]/10 text-[#31876D]">
                  <MapPin size={20} aria-hidden />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#273655]">{branch.name}</h3>
                  <p className="text-sm text-[#6b7280]">{branch.address}</p>
                </div>
              </header>

              <dl className="grid gap-2 text-sm text-[#374151]">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-[#31876D]" aria-hidden />
                  <dt className="sr-only">Телефон</dt>
                  <dd>{branch.phone}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#31876D]" aria-hidden />
                  <dt className="sr-only">Часы работы</dt>
                  <dd>{branch.workingHours}</dd>
                </div>
              </dl>

              <div className="mt-auto grid gap-2 sm:grid-cols-2">
                <a
                  href={branch.routeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent(LP_EVENTS.CTA_ROUTE_BUILD, {
                      branch: branch.id,
                      landing_page:
                        typeof window !== 'undefined' ? window.location.pathname : '',
                    })
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#31876D] px-4 text-sm font-semibold text-white transition hover:bg-[#2a7260]"
                >
                  <Navigation size={15} aria-hidden /> Построить маршрут
                </a>
                <a
                  href={branch.twoGisUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d5d8e1] bg-white px-4 text-sm font-semibold text-[#273655] transition hover:bg-[#f7faf9]"
                >
                  <ExternalLink size={15} aria-hidden /> Открыть в 2GIS
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(BranchesSection);
