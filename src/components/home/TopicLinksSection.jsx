import React from 'react';
import { Link } from 'react-router-dom';
import { TOPIC_NAV_LINKS } from '@/pages/topics/topicConfigs.js';

/**
 * Internal SEO links block for the home page (demand cluster landings).
 */
export default function TopicLinksSection() {
  return (
    <section className="w-full bg-white py-12 sm:py-16 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] sm:text-3xl mb-3">
          Популярные задачи хранения
        </h2>
        <p className="text-sm text-[#5C625F] mb-6 max-w-2xl">
          Отдельные страницы под частые запросы: кладовка, шины, мебель, переезд и хранение для бизнеса.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOPIC_NAV_LINKS.map((item) => (
            <li key={item.slug}>
              <Link
                to={item.to}
                className="flex h-full flex-col rounded-2xl border border-gray-200 bg-[#F7FAF9] p-4 hover:border-[#31876D]/40 transition-colors"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-[#31876D] mb-1">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-[#202422]">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link to="/blog" className="font-semibold text-[#31876D] hover:underline">
            Блог Extra Space
          </Link>
          <Link to="/katalogi" className="font-semibold text-[#31876D] hover:underline">
            Где нас найти
          </Link>
          <Link to="/kk" className="font-semibold text-[#31876D] hover:underline">
            Қазақша нұсқа
          </Link>
        </div>
      </div>
    </section>
  );
}
