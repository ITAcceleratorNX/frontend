import React, { memo } from "react";

// Статичные данные FAQ
const faqItems = [
  {
    id: 1,
    question: "Какие размеры боксов есть?",
    answer: "От небольших (2 м², для коробок и мелких вещей) до крупных (10+ м², для мебели и техники)."
  },
  {
    id: 2,
    question: "Насколько безопасно хранение?",
    answer: "Территория под камерами, сигнализацией и охраной. Доступ только для арендаторов."
  },
  {
    id: 3,
    question: "Что запрещено хранить?",
    answer: "Продукты, жидкости, химикаты, оружие, горючие материалы, животных."
  },
  {
    id: 4,
    question: "Можно ли арендовать на короткий срок?",
    answer: "Минимальный срок хранения 1 месяц."
  },
  {
    id: 5,
    question: "Можно ли арендовать на юр.лицо?",
    answer: "Да, предоставляем чек или счёт-фактуру."
  },
  {
    id: 6,
    question: "Как попасть внутрь?",
    answer: "Вы получаете личный ключ или код доступа. Никто кроме вас не откроет бокс."
  }
];

const FAQ = memo(() => {

  return (
    <section className="mb-24 flex w-full flex-col items-center justify-center font-['Montserrat']">
      <h2 className="mb-2 text-center text-[28px] font-extrabold text-[#273655] sm:text-[32px]">
        Часто задаваемые вопросы
      </h2>
      <p className="mb-10 max-w-[720px] px-4 text-center text-sm text-[#6b7280]">
        Мы собрали ответы на популярные вопросы. Если не нашли нужное — напишите нам.
      </p>

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
            
            <div className="ml-10">
              <p className="text-[15px] leading-relaxed text-[#4b5563]">
                {faq.answer}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
});

FAQ.displayName = "FAQ";

export default FAQ;