import React, { useCallback, useState } from 'react';
import {
  Info,
  ChevronRight,
  Plane,
  Briefcase,
  Home,
  PartyPopper,
  Luggage,
  Box,
  Package,
  Backpack,
} from 'lucide-react';

import LpLayout from '../components/LpLayout.jsx';
import LpHelmet from '../components/LpHelmet.jsx';
import PhoneGatingModal from '../components/PhoneGatingModal.jsx';
import {
  BookingCtaButton,
  PhoneGatingButton,
  WhatsAppButton,
} from '../components/CtaButtons.jsx';
import MiniFormSection from '../components/MiniFormSection.jsx';
import Branches from '../components/Branches.jsx';
import FAQAccordion from '../components/FAQAccordion.jsx';
import LpVideo from '../components/LpVideo.jsx';

// Один из самых лёгких WebP (≈1.4 MB) — баланс качества и скорости LCP.
import heroBg from '@/assets/komfort-city/20260226-IMG_5216.webp';

const SERVICE_TYPE = 'camera';
const CANONICAL = 'https://extraspace.kz/lp/kamera-hraneniya-almaty';

const USE_CASES = [
  {
    Icon: Plane,
    title: 'Туристам',
    text: 'Оставьте чемодан до заселения в отель или после выселения — гуляйте по городу налегке.',
  },
  {
    Icon: Briefcase,
    title: 'В командировке',
    text: 'Между встречами не нужно таскать сумки — оставьте у нас на час, на день или на неделю.',
  },
  {
    Icon: Home,
    title: 'Между квартирами',
    text: 'Переезжаете и не хотите забивать машину коробками? Сдайте часть вещей до новой квартиры.',
  },
  {
    Icon: PartyPopper,
    title: 'Для мероприятий',
    text: 'Реквизит, оборудование, костюмы — храним между мероприятиями посуточно.',
  },
];

const STORE_ITEMS = [
  { Icon: Luggage, label: 'Чемоданы' },
  { Icon: Backpack, label: 'Сумки и рюкзаки' },
  { Icon: Box, label: 'Коробки' },
  { Icon: Package, label: 'Личные вещи' },
];

const PRICING = [
  { volume: '0.25 м³', label: '1 чемодан', price: '1 000 ₸/сутки' },
  { volume: '0.5 м³', label: '2 чемодана + сумка', price: '2 000 ₸/сутки' },
  { volume: '1 м³', label: '3–4 коробки', price: '4 000 ₸/сутки' },
  { volume: '2 м³', label: 'Большой груз', price: '8 000 ₸/сутки' },
];

const STEPS = [
  {
    num: '1',
    title: 'Привозите вещи в филиал',
    text: 'Любой из двух филиалов в черте Алматы. Бронь места можно сделать заранее по телефону.',
  },
  {
    num: '2',
    title: 'Сотрудник принимает и выдаёт код',
    text: 'Маркируем ваши вещи, выдаём чек и одноразовый код для забора.',
  },
  {
    num: '3',
    title: 'Забираете когда нужно',
    text: 'По коду — без очередей и доплат. От 1 дня до 2 недель.',
  },
];

const FAQ_ITEMS = [
  { q: 'Какой минимальный срок?', a: 'От 1 дня (24 часа). Стоимость считаем посуточно.' },
  {
    q: 'Какой максимум?',
    a: 'До 2 недель. Если нужно дольше — переходите на индивидуальный бокс от 1 месяца, выйдет дешевле.',
  },
  {
    q: 'Что нельзя сдавать?',
    a: 'Скоропортящиеся продукты, легковоспламеняющиеся жидкости, оружие, наркотические вещества и живые организмы. Полный список — в договоре.',
  },
  {
    q: 'Как оплатить?',
    a: 'На месте при сдаче — картой или наличными. Юр.лицам — безналичный расчёт по договору.',
  },
  {
    q: 'Можно ли продлить хранение?',
    a: 'Да, в любой момент по телефону или непосредственно в филиале. Доплата только за дополнительные сутки.',
  },
];

export default function KameraHraneniyaAlmatyPage() {
  const [gateOpen, setGateOpen] = useState(false);

  const handleBooking = useCallback(() => {
    setGateOpen(true);
  }, []);

  return (
    <LpLayout
      bookingServiceType={SERVICE_TYPE}
      onHeaderCta={() => setGateOpen(true)}
      ctaLabel="Привезу сегодня"
    >
      <LpHelmet
        title="Камера хранения в Алматы · от 1 дня · ExtraSpace"
        description="Хранение чемоданов и коробок от 24 часов до 2 недель. В черте Алматы — НЕ аэропорт. 4 000 ₸/м³ в сутки."
        canonical={CANONICAL}
        ogImage="/og/lp-kamera-hraneniya.png"
        ogImageAlt="Камера хранения в Алматы — ExtraSpace"
      />

      {/* HERO */}
      <section className="lp-hero-min-h relative isolate flex flex-col items-center justify-center overflow-hidden bg-[#0e1729] px-4 py-10 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <img
          src={heroBg}
          alt=""
          aria-hidden
          loading="eager"
          fetchpriority="high"
          decoding="async"
          width="1920"
          height="1280"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e1729]/80 via-[#0e1729]/60 to-[#31876D]/40" aria-hidden />

        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur sm:mb-5 sm:px-4 sm:text-xs sm:tracking-[0.2em]">
            <Luggage size={12} aria-hidden />
            Камера хранения · от 1 дня
          </span>
          <h1 className="font-soyuz-grotesk text-[26px] font-bold leading-[1.1] xs:text-[28px] sm:text-4xl md:text-5xl lg:text-6xl">
            Камера хранения в Алматы · от 1 дня
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/85 sm:mt-5 sm:text-base md:text-lg">
            Чемоданы, сумки, коробки — храним посуточно. От 4 000 ₸ за м³ в сутки.
          </p>

          {/* Disclaimer per ТЗ */}
          <div className="mt-5 inline-flex w-full items-start gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 text-left text-[12px] leading-snug backdrop-blur sm:mt-6 sm:w-auto sm:px-4 sm:py-3 sm:text-sm">
            <p>
              Это <strong>городская камера хранения</strong> в черте Алматы. Не аэропорт и не ЖД-вокзал.
            </p>
          </div>

          <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
            <BookingCtaButton
              section="hero"
              serviceType={SERVICE_TYPE}
              onClick={handleBooking}
              variant="primary"
            >
              Забронировать место
              <ChevronRight size={16} aria-hidden />
            </BookingCtaButton>
            <PhoneGatingButton
              section="hero"
              serviceType={SERVICE_TYPE}
              onClick={() => setGateOpen(true)}
            />
          </div>
        </div>
      </section>

      <LpVideo
        src="/videos/kamera-hraneniya.mp4"
        poster="/videos/kamera-hraneniya-poster.jpg"
        title="Камера хранения в Алматы — ExtraSpace"
      />

      {/* USE CASES */}
      <section id="komu" className="w-full bg-[#F7FAF9] py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl lg:text-5xl">
              Кому подходит
            </h2>
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">
              Городская камера хранения в Алматы — четыре главных сценария.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map(({ Icon, title, text }) => (
              <article
                key={title}
                className="flex flex-col gap-3 rounded-3xl border border-[#e5e9ed] bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#31876D]/10 text-[#31876D]">
                  <Icon size={22} aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-[#273655]">{title}</h3>
                <p className="text-sm leading-relaxed text-[#4b5563]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU CAN STORE */}
      <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl">
              Что можно сдать на хранение
            </h2>
          </header>

          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STORE_ITEMS.map(({ Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-3 rounded-3xl border border-[#e5e9ed] bg-[#F7FAF9] p-5 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#31876D] shadow-sm">
                  <Icon size={26} aria-hidden />
                </div>
                <span className="text-sm font-semibold text-[#273655] sm:text-base">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PRICING */}
      <section className="w-full bg-[#F7FAF9] py-12 sm:py-16 lg:py-24" id="ceny">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl lg:text-5xl">
              Цены
            </h2>
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">
              Базовый тариф — <strong className="text-[#273655]">4 000 ₸ за м³ в сутки</strong>. Платите ровно за объём, который занимаете.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING.map((row) => (
              <article
                key={row.volume}
                className="flex flex-col gap-3 rounded-3xl border border-[#e5e9ed] bg-white p-6 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">{row.volume}</p>
                <p className="font-soyuz-grotesk text-2xl font-bold text-[#202422]">{row.label}</p>
                <p className="mt-auto text-xl font-bold text-[#31876D]">{row.price}</p>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-2xl rounded-2xl bg-white/70 p-4 text-center text-xs text-[#6b7280]">
            Бронируете на 7–14 дней? Спросите менеджера про скидку — есть гибкие тарифы для длинных периодов.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="kak-rabotaet" className="w-full bg-white py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl lg:text-5xl">
              Как это работает
            </h2>
          </header>

          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((step) => (
              <li
                key={step.num}
                className="flex flex-col gap-2 rounded-3xl border border-[#e5e9ed] bg-[#F7FAF9] p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#31876D] font-soyuz-grotesk text-base font-bold text-white">
                  {step.num}
                </span>
                <h3 className="text-base font-bold text-[#273655]">{step.title}</h3>
                <p className="text-sm text-[#4b5563]">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Branches />

      <MiniFormSection
        serviceType={SERVICE_TYPE}
        title="Привезти сегодня?"
        description="Оставьте контакт — менеджер ExtraSpace согласует удобное время и адрес ближайшего филиала."
      />

      <FAQAccordion
        items={FAQ_ITEMS}
        title="Частые вопросы про камеру хранения"
        subtitle="Если не нашли ответ — оставьте контакт ниже, и мы перезвоним."
      />

      {/* FINAL CTA */}
      <section className="relative isolate w-full overflow-hidden bg-[#0e1729] py-12 text-white sm:py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e1729] via-[#142340] to-[#31876D]/40" aria-hidden />
        <div className="container relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-soyuz-grotesk text-2xl font-bold leading-tight xs:text-3xl sm:text-4xl lg:text-5xl">
            Привезу сегодня
          </h2>
          <p className="mt-4 text-sm text-white/80 sm:text-base">
            Оставьте заявку — забронируем место в филиале и пришлём адрес. Никаких очередей при сдаче.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <BookingCtaButton
              section="final_cta"
              serviceType={SERVICE_TYPE}
              variant="big"
              onClick={handleBooking}
            >
              Привезу сегодня
              <ChevronRight size={18} aria-hidden />
            </BookingCtaButton>
            <WhatsAppButton serviceType={SERVICE_TYPE} section="final_cta" variant="whatsapp" />
          </div>
        </div>
      </section>

      <PhoneGatingModal
        open={gateOpen}
        onOpenChange={setGateOpen}
        serviceType={SERVICE_TYPE}
        pageSection="phone_gating"
        title="Покажем номер сразу — оставьте контакт"
      />
    </LpLayout>
  );
}
