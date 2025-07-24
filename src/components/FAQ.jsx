import React, { useState, useMemo, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../shared/api/axios';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

const FAQ_QUERY_KEY = 'faq';

const FAQ = memo(() => {
  const [openItems, setOpenItems] = useState({});

  const { data: faqItems = [], isLoading, error } = useQuery({
    queryKey: [FAQ_QUERY_KEY],
    queryFn: async () => {
      const response = await api.get('/faq');
      return response.data.slice(0, 6);
    },
    staleTime: 60 * 60 * 1000,
    cacheTime: 120 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const toggleItem = useMemo(() => (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const renderFAQItems = (items) =>
      items.map((faq) => (
          <div
              key={faq.id}
              className="mb-6 w-full rounded-lg bg-white p-4 sm:p-6 lg:px-6 xl:px-8"
          >
            <button
                className="faq-btn flex w-full text-left"
                onClick={() => toggleItem(faq.id)}
            >
              <div className="mr-5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                {openItems[faq.id] ? (
                    <MinusIcon className="w-5 h-5 stroke-2 text-[#273655]" />
                ) : (
                    <PlusIcon className="w-5 h-5 stroke-2 text-[#273655]" />
                )}
              </div>
              <div className="w-full">
                <h4 className="mt-1 text-lg font-semibold text-[#222] font-['Montserrat']">
                  {faq.question}
                </h4>
              </div>
            </button>

            {openItems[faq.id] && (
                <div className="pl-[62px] pt-4 mt-4 text-[16px] font-['Montserrat'] text-[#666] leading-relaxed">
                  {faq.answer}
                </div>
            )}
          </div>
      ));

  return (
      <section className="w-full flex flex-col items-center justify-center mb-24 font-['Montserrat']">
        <h2 className="text-[30px] font-bold text-[#273655] text-center mb-10">
          Часто задаваемые вопросы:
        </h2>

        {isLoading ? (
            <div className="w-full max-w-[800px] flex justify-center py-8">
              <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-[#273655]"></div>
            </div>
        ) : error ? (
            <div className="w-full max-w-[820px] text-center text-red-500 py-4">
              Не удалось загрузить вопросы. Пожалуйста, попробуйте позже.
            </div>
        ) : (
            <div className="w-full max-w-[820px]">{renderFAQItems(faqItems)}</div>
        )}
      </section>
  );
});

FAQ.displayName = 'FAQ';

export default FAQ;