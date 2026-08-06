import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, MapPin, Building2, Clock } from 'lucide-react';
import ServiceShell from '../services/components/ServiceShell.jsx';
import PageSeo from '../../shared/seo/PageSeo.jsx';
import { buildBreadcrumbJsonLd } from '../../shared/seo/pageMeta.js';

const BRANCHES = [
  {
    name: 'Mega Tower Almaty',
    address: 'Абиша Кекилбайулы, 270 блок 4, Алматы',
    maps2gis: 'https://2gis.kz/almaty/search/Extra%20Space%20Mega%20Tower',
    hours: 'Круглосуточно',
  },
  {
    name: 'ЖК «Комфорт Сити»',
    address: 'Алматы',
    maps2gis: 'https://2gis.kz/almaty/search/Extra%20Space%20Комфорт%20Сити',
    hours: 'Круглосуточно',
  },
];

const DIRECTORIES = [
  {
    name: '2ГИС',
    description: 'Филиалы Extra Space на карте Алматы — маршрут и контакты.',
    href: 'https://2gis.kz/almaty/search/Extra%20Space',
  },
  {
    name: 'Google Maps',
    description: 'Поиск складов Extra Space в Google Картах.',
    href: 'https://www.google.com/maps/search/Extra+Space+storage+Almaty',
  },
  {
    name: 'Instagram',
    description: 'Новости, фото складов и акции Extra Space.',
    href: 'https://www.instagram.com/extraspace.kz',
  },
  {
    name: 'WhatsApp',
    description: 'Быстрая связь для бронирования бокса.',
    href: 'https://api.whatsapp.com/send/?phone=77783911425&text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B7%D0%B0%D0%B1%D1%80%D0%BE%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%20%D0%B1%D0%BE%D0%BA%D1%81.&type=phone_number&app_absent=0',
  },
];

export default function CatalogsPage() {
  return (
    <ServiceShell>
      <PageSeo
        title="Где найти Extra Space — каталоги и карты Алматы"
        description="Филиалы Extra Space в 2ГИС и Google Maps, контакты складов в Алматы: Mega Tower и Комфорт Сити."
        path="/katalogi"
        jsonLd={buildBreadcrumbJsonLd([
          { name: 'Главная', path: '/' },
          { name: 'Каталоги', path: '/katalogi' },
        ])}
        jsonLdId="katalogi"
      />

      <section className="w-full bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <span className="mb-4 inline-flex items-center rounded-full bg-[#31876D]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#31876D]">
            Контакты
          </span>
          <h1 className="max-w-3xl font-soyuz-grotesk text-3xl font-bold leading-tight text-[#202422] sm:text-4xl lg:text-5xl">
            Где нас найти
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5C625F] sm:text-base">
            Склады Extra Space в Алматы на картах и в справочниках. Выберите филиал или откройте
            карточку в 2ГИС.
          </p>
        </div>
      </section>

      <section className="w-full bg-white py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-5 text-xl font-bold text-[#202422]">Филиалы</h2>
          <ul className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {BRANCHES.map((branch) => (
              <li
                key={branch.name}
                className="rounded-2xl border border-gray-200 bg-[#F7FAF9] p-5 sm:p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#31876D]/10 text-[#31876D]">
                  <Building2 className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-semibold text-[#202422]">{branch.name}</h3>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-[#5C625F]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#31876D]" aria-hidden />
                  {branch.address}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#5C625F]">
                  <Clock className="h-4 w-4 shrink-0 text-[#31876D]" aria-hidden />
                  {branch.hours}
                </p>
                <a
                  href={branch.maps2gis}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#31876D] hover:underline"
                >
                  Открыть в 2ГИС
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>

          <h2 className="mb-5 text-xl font-bold text-[#202422]">Каталоги и справочники</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {DIRECTORIES.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col rounded-2xl border border-gray-200 bg-[#F7FAF9] p-5 transition-colors hover:border-[#31876D]/40 sm:p-6"
                >
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#202422]">
                    {item.name}
                    <ExternalLink className="h-3.5 w-3.5 text-[#6B7280]" aria-hidden />
                  </span>
                  <span className="mt-1 text-sm leading-relaxed text-[#5C625F]">
                    {item.description}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-2">
            <Link
              to="/individual-storage"
              className="rounded-full border border-gray-200 bg-[#F7FAF9] px-4 py-2 text-sm text-[#273655] transition-colors hover:border-[#31876D]/40 hover:text-[#31876D]"
            >
              Индивидуальное хранение
            </Link>
            <Link
              to="/kk"
              className="rounded-full border border-gray-200 bg-[#F7FAF9] px-4 py-2 text-sm text-[#273655] transition-colors hover:border-[#31876D]/40 hover:text-[#31876D]"
            >
              Қазақша нұсқа
            </Link>
          </div>
        </div>
      </section>
    </ServiceShell>
  );
}
