import React, { useCallback, useState } from 'react';
import {
  ShieldCheck,
  Thermometer,
  FileBadge,
  MapPin,
  Sparkles,
  ChevronRight,
  Check,
  Hammer,
  Truck,
  Sun,
  Briefcase,
  Star,
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
import VolumeCalculator from './VolumeCalculator.jsx';

// Самый лёгкий WebP из ассетов (≈850 KB) — критично для LCP.
import heroBg from '@/assets/komfort-city/20260226-IMG_5207.webp';

const SERVICE_TYPE = 'individual';
const CANONICAL = 'https://extraspace.kz/lp/arenda-boksa-almaty';

const TRUST = [
  { Icon: Thermometer, label: 'Климат-контроль', sub: 'Отопление зимой, без сырости' },
  { Icon: ShieldCheck, label: 'Охрана 24/7', sub: 'Видеонаблюдение и контроль доступа' },
  { Icon: FileBadge, label: 'Страхование вещей', sub: 'Базовая страховка включена' },
  { Icon: MapPin, label: 'В черте города', sub: '15 минут от центра Алматы' },
];

const USE_CASES = [
  {
    anchor: 'remont',
    Icon: Hammer,
    title: 'Ремонт квартиры',
    text: 'Освободите комнаты от мебели и коробок на время ремонта — от 1 месяца, удобный заезд и забор вещей.',
  },
  {
    anchor: 'pereezd',
    Icon: Truck,
    title: 'Переезд между квартирами',
    text: 'Храните вещи между съёмными квартирами или продажей-покупкой жилья — оплата по дням не нужна.',
  },
  {
    anchor: 'shiny',
    Icon: Sun,
    title: 'Сезонные вещи',
    text: 'Шины, велосипед, лыжи, садовый инвентарь — освободите балкон, кладовку и багажник.',
  },
  {
    anchor: 'biznes',
    Icon: Briefcase,
    title: 'Бизнес-товары',
    text: 'Остатки товаров, оборудование, документы — без своего склада и аренды коммерческого помещения.',
  },
];

const BOXES = [
  {
    size: '2 м²',
    sizeKey: '2',
    price: '12 000 ₸',
    note: 'от 1 мес.',
    fits: 'Чемоданы + коробки + сезонные вещи (1 комната)',
  },
  {
    size: '4 м²',
    sizeKey: '4',
    price: '24 000 ₸',
    note: 'от 1 мес.',
    fits: 'Содержимое 1-комнатной квартиры',
  },
  {
    size: '6 м²',
    sizeKey: '6',
    price: '36 000 ₸',
    note: 'от 1 мес.',
    fits: '2-комнатная квартира',
    badge: 'Популярное',
  },
  {
    size: '10 м²',
    sizeKey: '10',
    price: '60 000 ₸',
    note: 'от 1 мес.',
    fits: '3-комнатная квартира',
  },
  {
    size: '15 м²',
    sizeKey: '15',
    price: 'по запросу',
    note: 'индивидуально',
    fits: 'Большой переезд / товары для бизнеса',
  },
  {
    size: '25+ м²',
    sizeKey: '25',
    price: 'по запросу',
    note: 'безнал · договор',
    fits: 'Бизнес-склад · документы юр.лицу',
  },
];

const STEPS = [
  { num: '1', title: 'Бронируете онлайн', text: '5 минут, без визита — выбираете размер и срок.' },
  { num: '2', title: 'Подписываете договор по СМС', text: 'Электронный договор приходит на телефон.' },
  { num: '3', title: 'Оплачиваете онлайн', text: 'Картой, СМС-подтверждением, или безналом для юр.лиц.' },
  { num: '4', title: 'Заезжаете 24/7', text: 'Доступ только у вас — личный код и ключ.' },
];

const FAQ_ITEMS = [
  { q: 'Какой минимальный срок аренды?', a: 'От 1 месяца. Дальше можно продлевать в любой момент онлайн.' },
  {
    q: 'Что нельзя хранить в боксе?',
    a: 'Скоропортящиеся продукты, легковоспламеняющиеся жидкости, оружие, наркотические вещества, живые растения и животные. Полный список — в договоре.',
  },
  {
    q: 'Как заехать в бокс в первый раз?',
    a: 'После онлайн-брони и оплаты вы получаете код доступа на телефон. Приезжайте в любое удобное время — склад работает круглосуточно.',
  },
  {
    q: 'Как оплатить?',
    a: 'Картой онлайн, СМС-подтверждением, безналом для юридических лиц. Все варианты — без комиссии для клиента.',
  },
  {
    q: 'Застрахованы ли мои вещи?',
    a: 'Да, базовая страховка включена в стоимость аренды. При желании можно подключить расширенную — за доплату.',
  },
  {
    q: 'Кто имеет доступ к боксу?',
    a: 'Только вы. У сотрудников нет дубликата ключа — мы видим только периметр и общие коридоры по камерам.',
  },
  {
    q: 'Можно ли продлить аренду?',
    a: 'Да, продление онлайн в личном кабинете в любой момент. Никаких визитов и переподписаний.',
  },
];

export default function ArendaBoksaAlmatyPage() {
  const [gateOpen, setGateOpen] = useState(false);

  const handleBooking = useCallback(() => {
    setGateOpen(true);
  }, []);

  return (
    <LpLayout onHeaderCta={() => setGateOpen(true)} ctaLabel="Забронировать">
      <LpHelmet
        title="Аренда бокса в Алматы от 6 000 ₸/м² · ExtraSpace"
        description="Свой бокс с климат-контролем от 6 000 ₸/м²/мес. От 1 месяца. 2 филиала в черте Алматы. Бронь онлайн без визита."
        canonical={CANONICAL}
        ogTitle="Аренда бокса в Алматы · ExtraSpace"
        ogDescription="Свой бокс от 6 000 ₸/м²/мес. Климат контроль, охрана 24/7, в черте города. 2 филиала в Алматы."
        ogImage="https://extraspace.kz/og/lp-arenda-boksa.png"
        ogImageAlt="Аренда бокса в Алматы — ExtraSpace"
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
            <Sparkles size={12} aria-hidden />
            Индивидуальное хранение в Алматы
          </span>
          <h1 className="font-soyuz-grotesk text-[26px] font-bold leading-[1.1] xs:text-[28px] sm:text-4xl md:text-5xl lg:text-6xl">
            Аренда бокса в Алматы от 6 000 ₸/м²
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/85 sm:mt-5 sm:text-base md:text-lg">
            Свой ключ · доступ 24/7 · в черте города. От 1 месяца, бронь онлайн без визита.
          </p>

          <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
            <BookingCtaButton
              section="hero"
              serviceType={SERVICE_TYPE}
              onClick={handleBooking}
              variant="primary"
            >
              Забронировать бокс онлайн
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

      {/* TRUST STRIP */}
      <section className="border-y border-[#e5e9ed] bg-white py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {TRUST.map(({ Icon, label, sub }) => (
              <li
                key={label}
                className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#31876D]/10 text-[#31876D]">
                  <Icon size={20} aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#202422] sm:text-[15px]">{label}</p>
                  <p className="text-xs text-[#6b7280]">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* USE CASES */}
      <section className="w-full bg-[#F7FAF9] py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl lg:text-5xl">
              Кому подходит индивидуальное хранение
            </h2>
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">
              ExtraSpace — это «вторая кладовка» в черте города. Сценариев применения несколько, все они подходят под аренду от 1 месяца.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((card) => (
              <article
                id={card.anchor}
                key={card.anchor}
                className="group flex flex-col gap-3 rounded-3xl border border-[#e5e9ed] bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#31876D]/10 text-[#31876D]">
                  <card.Icon size={22} aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-[#273655]">{card.title}</h3>
                <p className="text-sm leading-relaxed text-[#4b5563]">{card.text}</p>
                <BookingCtaButton
                  section={`use_case_${card.anchor}`}
                  serviceType={SERVICE_TYPE}
                  variant="outline"
                  onClick={handleBooking}
                  className="mt-auto"
                >
                  Подобрать бокс
                  <ChevronRight size={14} aria-hidden />
                </BookingCtaButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* BOX SIZES */}
      <section id="razmery" className="w-full bg-white py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl lg:text-5xl">
              Размеры боксов и цены
            </h2>
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">
              Шесть популярных размеров с примерами «что помещается». От 12 000 ₸ за маленький бокс до индивидуальных решений 25+ м² для бизнеса.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BOXES.map((box) => (
              <article
                key={box.sizeKey}
                className={`relative flex flex-col gap-3 rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                  box.badge ? 'border-[#31876D] ring-1 ring-[#31876D]/30' : 'border-[#e5e9ed]'
                }`}
              >
                {box.badge && (
                  <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-[#31876D] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                    <Star size={12} className="fill-white" aria-hidden /> {box.badge}
                  </span>
                )}

                <div className="flex items-baseline justify-between">
                  <span className="font-soyuz-grotesk text-3xl font-bold text-[#202422]">
                    {box.size}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-[#6b7280]">{box.note}</span>
                </div>

                <p className="text-2xl font-bold text-[#31876D]">{box.price}</p>
                <p className="text-sm text-[#4b5563]">{box.fits}</p>

                <BookingCtaButton
                  section="box_sizes"
                  serviceType={SERVICE_TYPE}
                  boxSize={box.sizeKey}
                  variant="outline"
                  onClick={handleBooking}
                  className="mt-auto"
                >
                  Забронировать {box.size}
                </BookingCtaButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <VolumeCalculator onBook={handleBooking} />

      {/* HOW IT WORKS */}
      <section className="w-full bg-[#F7FAF9] py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl lg:text-5xl">
              Как работает
            </h2>
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">
              Никаких визитов в офис и подписей на бумаге — всё онлайн, занимает 5 минут.
            </p>
          </header>

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li
                key={step.num}
                className="flex flex-col gap-2 rounded-3xl border border-[#e5e9ed] bg-white p-6 shadow-sm"
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

      {/* BRANCHES */}
      <Branches />

      {/* MINI FORM */}
      <MiniFormSection
        serviceType={SERVICE_TYPE}
        title="Хотите подобрать бокс? Перезвоним за 15 минут"
        description="Заполните форму — менеджер ExtraSpace перезвонит, поможет с подбором размера и забронирует бокс на удобную дату."
      />

      {/* FAQ */}
      <FAQAccordion
        items={FAQ_ITEMS}
        title="Частые вопросы про аренду бокса"
        subtitle="Если не нашли ответ — оставьте контакт ниже, и мы перезвоним."
      />

      {/* FINAL CTA */}
      <section className="relative isolate w-full overflow-hidden bg-[#0e1729] py-12 text-white sm:py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e1729] via-[#142340] to-[#31876D]/40" aria-hidden />
        <div className="container relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-soyuz-grotesk text-2xl font-bold leading-tight xs:text-3xl sm:text-4xl lg:text-5xl">
            Бронируйте бокс онлайн — это занимает 5 минут
          </h2>
          <p className="mt-4 text-sm text-white/80 sm:text-base">
            Без визита на склад. Цена и доступный размер — сразу на экране. Не подойдёт — отменим без комиссии.
          </p>

          <ul className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
            {[
              'Бронь онлайн',
              'Договор по СМС',
              'Доступ 24/7',
            ].map((point) => (
              <li
                key={point}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 py-2.5 text-sm font-semibold text-white sm:py-2 sm:text-base"
              >
                <Check size={18} className="shrink-0 text-[#4ade80]" aria-hidden />
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <BookingCtaButton
              section="final_cta"
              serviceType={SERVICE_TYPE}
              variant="big"
              onClick={handleBooking}
            >
              Забронировать бокс онлайн
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
      />
    </LpLayout>
  );
}
