import React from 'react';
import { Link } from 'react-router-dom';
import { Header, Footer } from '../../widgets';
import PageSeo from '../../shared/seo/PageSeo';
import { PAGE_SEO } from '../../shared/seo/pageMeta';

export default function NotFoundPage() {
  const seo = PAGE_SEO.notFound;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageSeo
        title={seo.title}
        description={seo.description}
        robots={seo.robots}
      />
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-sm font-semibold tracking-wide text-[#00A991] uppercase mb-3">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#273655] mb-3">
          Страница не найдена
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-md mb-8">
          Такой страницы нет или она была перемещена. Проверьте адрес или вернитесь на главную.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#00A991] text-white text-sm font-medium hover:bg-[#008f7a] transition-colors"
          >
            На главную
          </Link>
          <Link
            to="/individual-storage"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-[#00A991] text-[#00A991] text-sm font-medium hover:bg-[#00A991]/10 transition-colors"
          >
            Аренда бокса
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
