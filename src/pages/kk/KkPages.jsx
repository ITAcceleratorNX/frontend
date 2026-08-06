import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ServiceShell from '../services/components/ServiceShell.jsx';
import PageSeo from '../../shared/seo/PageSeo.jsx';
import { KK_PAGES } from './kkContent.js';

function KkServiceLayout({ pageKey }) {
  const page = KK_PAGES[pageKey];
  const navigate = useNavigate();

  return (
    <ServiceShell>
      <PageSeo
        title={page.metaTitle}
        description={page.metaDescription}
        path={page.path}
        hreflang={page.hreflang}
        ogLocale="kk_KZ"
      />

      <section className="w-full bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="mb-4 inline-flex items-center gap-1 rounded-full border border-[#DCE7E3] bg-white px-1 py-1 text-sm">
            <Link
              to={page.ruPath}
              className="rounded-full px-3 py-1 text-[#5C625F] transition-colors hover:text-[#31876D]"
            >
              Рус
            </Link>
            <span className="rounded-full bg-[#31876D] px-3 py-1 font-semibold text-white">
              Қаз
            </span>
          </div>
          <span className="mb-4 inline-flex items-center rounded-full bg-[#31876D]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#31876D]">
            Extra Space
          </span>
          <h1 className="max-w-3xl font-soyuz-grotesk text-3xl font-bold leading-tight text-[#202422] sm:text-4xl lg:text-5xl">
            {page.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5C625F] sm:text-base">
            {page.lead}
          </p>
          <button
            type="button"
            onClick={() => navigate(page.ctaTo)}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#31876D] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2a7260] sm:h-14 sm:px-8 sm:text-base"
          >
            {page.cta}
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      </section>

      {page.points && (
        <section className="w-full bg-white py-10 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
              {page.points.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-gray-200 bg-[#F7FAF9] px-4 py-3.5 text-sm text-[#202422]"
                >
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-[#6B7280]">
              Толық брондау және төлем — орыс тілді интерфейсте:{' '}
              <Link to={page.ruPath} className="font-semibold text-[#31876D] hover:underline">
                {page.ruPath}
              </Link>
            </p>
          </div>
        </section>
      )}

      {page.formats && (
        <section className="w-full bg-white py-10 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 font-soyuz-grotesk text-2xl font-bold text-[#202422] sm:text-3xl">
              {page.formatsTitle}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {page.formats.map((f) => (
                <Link
                  key={f.to}
                  to={f.to}
                  className="rounded-2xl border border-gray-200 bg-[#F7FAF9] p-5 transition-colors hover:border-[#31876D]/40 sm:p-6"
                >
                  <h3 className="font-semibold text-[#202422]">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#5C625F]">{f.text}</p>
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Link
                to="/kk/moving"
                className="rounded-full border border-gray-200 bg-[#F7FAF9] px-4 py-2 text-sm text-[#273655] transition-colors hover:border-[#31876D]/40 hover:text-[#31876D]"
              >
                Көшіру қызметі
              </Link>
              <Link
                to="/blog"
                className="rounded-full border border-gray-200 bg-[#F7FAF9] px-4 py-2 text-sm text-[#273655] transition-colors hover:border-[#31876D]/40 hover:text-[#31876D]"
              >
                Блог
              </Link>
              <Link
                to="/katalogi"
                className="rounded-full border border-gray-200 bg-[#F7FAF9] px-4 py-2 text-sm text-[#273655] transition-colors hover:border-[#31876D]/40 hover:text-[#31876D]"
              >
                Каталогтар
              </Link>
            </div>
          </div>
        </section>
      )}
    </ServiceShell>
  );
}

export function KkHomePage() {
  return <KkServiceLayout pageKey="home" />;
}
export function KkIndividualPage() {
  return <KkServiceLayout pageKey="individual" />;
}
export function KkCloudPage() {
  return <KkServiceLayout pageKey="cloud" />;
}
export function KkStorageRoomPage() {
  return <KkServiceLayout pageKey="room" />;
}
export function KkMovingPage() {
  return <KkServiceLayout pageKey="moving" />;
}
