import React, { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../shared/api/axios";

const FAQ_QUERY_KEY = "faq";

const Skeleton = () => (
  <div className="w-full max-w-[820px] space-y-4 px-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 h-4 w-5/6 animate-pulse rounded bg-gray-100" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-gray-100" />
      </div>
    ))}
  </div>
);

const FAQ = memo(() => {
  const { data: faqItems = [], isLoading, error } = useQuery({
    queryKey: [FAQ_QUERY_KEY],
    queryFn: async () => {
      const { data } = await api.get("/faq");
      return data.slice(0, 6);
    },
    staleTime: 60 * 60 * 1000,
    cacheTime: 120 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return (
    <section className="mb-24 flex w-full flex-col items-center justify-center font-['Montserrat']">
      <h2 className="mb-2 text-center text-[28px] font-extrabold text-[#273655] sm:text-[32px]">
        Часто задаваемые вопросы
      </h2>
      <p className="mb-10 max-w-[720px] px-4 text-center text-sm text-[#6b7280]">
        Мы собрали ответы на популярные вопросы. Если не нашли нужное — напишите нам.
      </p>

      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <div className="w-full max-w-[820px] px-3 text-center text-red-500">
          Не удалось загрузить вопросы. Пожалуйста, попробуйте позже.
        </div>
      ) : (
        <div className="w-full max-w-[820px] space-y-5 px-3">
          {faqItems.map((faq) => (
            <article
              key={faq.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              {/* тонкая цветная полоса сверху */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 opacity-80" />

              <header className="mb-3 flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-7 select-none items-center justify-center rounded-md bg-indigo-50 px-2 text-xs font-semibold text-indigo-700">
                  ?
                </div>
                <h3 className="text-[17px] font-semibold leading-snug text-[#1f2937]">
                  {faq.question}
                </h3>
              </header>


            </article>
          ))}
        </div>
      )}
    </section>
  );
});

FAQ.displayName = "FAQ";

export default FAQ;