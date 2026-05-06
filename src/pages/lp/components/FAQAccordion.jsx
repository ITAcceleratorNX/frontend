import React, { memo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/**
 * FAQ accordion shared by all 3 LPs. Pass `items: [{ q, a }]`.
 */
function FAQAccordion({
  items = [],
  title = 'Частые вопросы',
  subtitle,
  id = 'faq',
}) {
  return (
    <section id={id} className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="font-soyuz-grotesk text-3xl font-bold text-[#202422] sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-sm text-[#555A65] sm:text-base">{subtitle}</p>
          )}
        </header>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {items.map((item, idx) => (
              <AccordionItem
                key={item.q}
                value={`faq-${idx}`}
                className="overflow-hidden rounded-2xl border border-[#e5e9ed] bg-white px-5 my-3 shadow-sm border-b"
              >
                <AccordionTrigger className="py-4 text-left text-[15px] font-semibold text-[#273655] hover:no-underline sm:text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm leading-relaxed text-[#4b5563] sm:text-[15px]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export default memo(FAQAccordion);
