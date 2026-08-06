import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ServiceShell from '../services/components/ServiceShell.jsx';
import UsefulGrid from '../services/components/UsefulGrid.jsx';
import OtherFormatsBlock from '../services/components/OtherFormatsBlock.jsx';
import FAQAccordion from '../lp/components/FAQAccordion.jsx';
import PageSeo from '../../shared/seo/PageSeo.jsx';
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
} from '../../shared/seo/pageMeta.js';
import { TOPIC_PAGES, TOPIC_NAV_LINKS } from './topicConfigs.js';
import NotFoundPage from '../not-found/index.jsx';

export default function TopicPage({ slug: slugProp }) {
  const params = useParams();
  const navigate = useNavigate();
  const slug = slugProp || params.slug;
  const topic = TOPIC_PAGES[slug];

  const jsonLd = useMemo(() => {
    if (!topic) return null;
    return [
      buildBreadcrumbJsonLd([
        { name: 'Главная', path: '/' },
        { name: topic.h1, path: topic.path },
      ]),
      buildFaqPageJsonLd(topic.faq),
    ];
  }, [topic]);

  if (!topic) {
    return <NotFoundPage />;
  }

  const otherTopics = TOPIC_NAV_LINKS.filter((item) => item.slug !== slug);

  return (
    <ServiceShell>
      <PageSeo
        title={topic.metaTitle}
        description={topic.metaDescription}
        path={topic.path}
        jsonLd={jsonLd}
        jsonLdId={`topic-${slug}`}
      />

      <section className="w-full bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <span className="mb-4 inline-flex items-center rounded-full bg-[#31876D]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#31876D]">
            {topic.badge}
          </span>
          <h1 className="max-w-3xl font-soyuz-grotesk text-3xl font-bold leading-tight text-[#202422] sm:text-4xl lg:text-5xl">
            {topic.h1}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5C625F] sm:text-base">
            {topic.description}
          </p>
          <button
            type="button"
            onClick={() => navigate(topic.ctaTo)}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#31876D] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2a7260] sm:h-14 sm:px-8 sm:text-base"
          >
            {topic.ctaLabel}
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      </section>

      <UsefulGrid
        id="preimuschestva"
        title="Почему Extra Space"
        items={topic.benefits}
        columns={4}
        background="bg-white"
      />

      <UsefulGrid
        id="kak-rabotaet"
        title="Как это работает"
        items={topic.steps}
        columns={3}
        background="bg-[#F7FAF9]"
        ordered
      />

      {topic.relatedFormat ? (
        <OtherFormatsBlock exclude={topic.relatedFormat} />
      ) : (
        <OtherFormatsBlock exclude={null} />
      )}

      <FAQAccordion
        items={topic.faq}
        title="Частые вопросы"
        subtitle="Не нашли ответ — напишите в WhatsApp или оставьте заявку на бронирование."
      />

      <section className="w-full bg-white py-10 sm:py-12 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="mb-5 text-base font-semibold text-[#5C625F] sm:text-lg">
            Смотрите также
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherTopics.map((item) => (
              <Link
                key={item.slug}
                to={item.to}
                className="rounded-full border border-gray-200 bg-[#F7FAF9] px-4 py-2 text-sm text-[#273655] hover:border-[#31876D]/40 hover:text-[#31876D] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/individual-storage"
              className="rounded-full border border-gray-200 bg-[#F7FAF9] px-4 py-2 text-sm text-[#273655] hover:border-[#31876D]/40 hover:text-[#31876D] transition-colors"
            >
              Индивидуальное хранение
            </Link>
            <Link
              to="/cloud-storage"
              className="rounded-full border border-gray-200 bg-[#F7FAF9] px-4 py-2 text-sm text-[#273655] hover:border-[#31876D]/40 hover:text-[#31876D] transition-colors"
            >
              Облачное хранение
            </Link>
          </div>
        </div>
      </section>
    </ServiceShell>
  );
}
