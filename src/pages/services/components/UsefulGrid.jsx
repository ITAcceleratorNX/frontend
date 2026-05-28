import React from 'react';

/**
 * Generic 2-4 column card grid for "use cases", "what you can store", "how it works".
 * Pass `items: [{ Icon?, title, text, num? }]`.
 */
export default function UsefulGrid({
  id,
  title,
  subtitle,
  items = [],
  columns = 4,
  background = 'bg-[#F7FAF9]',
  ordered = false,
}) {
  const Tag = ordered ? 'ol' : 'ul';
  const colsClass =
    columns === 3
      ? 'sm:grid-cols-2 lg:grid-cols-3'
      : columns === 2
      ? 'sm:grid-cols-2'
      : 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section id={id} className={`w-full ${background} py-12 sm:py-16`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">{subtitle}</p>
          )}
        </header>

        <Tag className={`grid gap-4 grid-cols-1 ${colsClass}`}>
          {items.map((item, idx) => (
            <li
              key={item.title}
              className="flex flex-col gap-3 rounded-3xl border border-[#e5e9ed] bg-white p-6 shadow-sm"
            >
              {item.num ? (
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#31876D] font-soyuz-grotesk text-base font-bold text-white">
                  {item.num}
                </span>
              ) : item.Icon ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#31876D]/10 text-[#31876D]">
                  <item.Icon size={22} aria-hidden />
                </div>
              ) : null}
              <h3 className="text-base font-bold text-[#273655]">{item.title}</h3>
              {item.text && (
                <p className="text-sm leading-relaxed text-[#4b5563]">{item.text}</p>
              )}
            </li>
          ))}
        </Tag>
      </div>
    </section>
  );
}
