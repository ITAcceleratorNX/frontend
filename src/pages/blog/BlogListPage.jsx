import React from 'react';
import { Link } from 'react-router-dom';
import ServiceShell from '../services/components/ServiceShell.jsx';
import PageSeo from '../../shared/seo/PageSeo.jsx';
import { buildBreadcrumbJsonLd } from '../../shared/seo/pageMeta.js';
import { BLOG_POSTS } from './posts.js';

export default function BlogListPage() {
  return (
    <ServiceShell>
      <PageSeo
        title="Блог Extra Space — хранение вещей в Алматы"
        description="Советы по аренде бокса, хранению шин и мебели, переезду и складу для бизнеса в Алматы."
        path="/blog"
        jsonLd={buildBreadcrumbJsonLd([
          { name: 'Главная', path: '/' },
          { name: 'Блог', path: '/blog' },
        ])}
        jsonLdId="blog-list"
      />

      <section className="w-full bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <span className="mb-4 inline-flex items-center rounded-full bg-[#31876D]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#31876D]">
            Блог
          </span>
          <h1 className="max-w-3xl font-soyuz-grotesk text-3xl font-bold leading-tight text-[#202422] sm:text-4xl lg:text-5xl">
            Блог Extra Space
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#5C625F] sm:text-base">
            Практические материалы про хранение вещей, переезд и аренду бокса в Алматы.
          </p>
        </div>
      </section>

      <section className="w-full bg-white py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {BLOG_POSTS.map((post) => (
              <li key={post.slug}>
                <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-[#F7FAF9] p-5 transition-colors hover:border-[#31876D]/40 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <time className="text-xs text-[#6B7280]" dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString('ru-KZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                    {post.tags?.[0] && (
                      <span className="rounded-full bg-[#31876D]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#31876D]">
                        {post.tags[0]}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-lg font-bold leading-snug text-[#202422]">
                    <Link to={`/blog/${post.slug}`} className="hover:text-[#31876D]">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5C625F]">
                    {post.excerpt}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="mt-4 inline-flex text-sm font-semibold text-[#31876D] hover:underline"
                  >
                    Читать →
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </ServiceShell>
  );
}
