import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ServiceShell from '../services/components/ServiceShell.jsx';
import PageSeo from '../../shared/seo/PageSeo.jsx';
import { buildBreadcrumbJsonLd } from '../../shared/seo/pageMeta.js';
import NotFoundPage from '../not-found/index.jsx';
import { getPostBySlug, buildBlogPostingJsonLd } from './posts.js';

export default function BlogArticlePage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) return <NotFoundPage />;

  return (
    <ServiceShell>
      <PageSeo
        title={post.metaTitle}
        description={post.metaDescription}
        path={`/blog/${post.slug}`}
        jsonLd={[
          buildBreadcrumbJsonLd([
            { name: 'Главная', path: '/' },
            { name: 'Блог', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
          buildBlogPostingJsonLd(post),
        ]}
        jsonLdId={`blog-${post.slug}`}
      />

      <article className="w-full bg-white">
        <header className="bg-stone-50">
          <div className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <Link
              to="/blog"
              className="text-sm font-semibold text-[#31876D] hover:underline"
            >
              ← Все статьи
            </Link>
            {post.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#31876D]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#31876D]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="mt-4 font-soyuz-grotesk text-3xl font-bold leading-tight text-[#202422] sm:text-4xl">
              {post.title}
            </h1>
            <time className="mt-3 block text-sm text-[#6B7280]" dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('ru-KZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>

        <div className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="space-y-4 text-sm leading-relaxed text-[#374151] sm:text-base sm:leading-7">
            {post.content.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          {post.relatedTo && (
            <div className="mt-10 rounded-2xl border border-gray-200 bg-[#F7FAF9] p-5 sm:p-6">
              <p className="mb-4 text-sm text-[#5C625F]">Смотрите также услугу:</p>
              <Link
                to={post.relatedTo}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#31876D] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2a7260]"
              >
                Перейти к услуге
                <ChevronRight size={16} aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </article>
    </ServiceShell>
  );
}
