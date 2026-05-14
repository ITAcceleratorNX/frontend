import React, { useCallback, useState } from 'react';
import {
  ChevronRight,
  Truck,
  Camera,
  Package,
  Smartphone,
  Building2,
  Home,
  CloudUpload,
  Check,
  Disc,
  Bike,
  Ruler,
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

// Один из самых лёгких WebP (≈1.5 MB) вместо тяжёлого 5210 (3.1 MB) — LCP.
import heroBg from '@/assets/komfort-city/20260226-IMG_5215.webp';

const SERVICE_TYPE = 'cloud';
const CANONICAL = 'https://extraspace.kz/lp/oblachnoe-hranenie-almaty';

const TARIFFS = [
  {
    Icon: Package,
    title: 'Сумка / коробка вещей',
    volume: '0.25 м³',
    price: '6 000 ₸/мес',
    description: 'Сезонная одежда, обувь, личные архивы — то, что не помещается в шкаф.',
  },
  {
    Icon: Disc,
    title: 'Шины (комплект)',
    volume: '0.5 м³',
    price: '5 000 ₸/мес',
    description: 'Заберём, упакуем, вернём перед сезоном — без багажника и кладовки.',
  },
  {
    Icon: Bike,
    title: 'Мотоцикл',
    volume: '1.8 м³',
    price: '25 000 ₸/мес',
    description: 'Отапливаемый склад с охраной — идеально для зимней консервации мотоцикла.',
  },
  {
    Icon: Ruler,
    title: 'Свой объём',
    volume: 'от 1 м³',
    price: 'от 9 500 ₸/м³ в мес',
    description: 'Платите ровно за объём вещей. Менеджер посчитает после визита курьера.',
  },
];

const COMPARISON = [
  {
    label: 'Кто привозит на склад',
    individual: 'Клиент сам',
    cloud: 'Курьер ExtraSpace',
  },
  {
    label: 'Кто размещает в боксе',
    individual: 'Клиент сам',
    cloud: 'Сотрудники',
  },
  {
    label: 'Доступ к вещам',
    individual: 'Клиент 24/7',
    cloud: 'По запросу через приложение',
  },
  {
    label: 'Платите за',
    individual: 'Целый бокс',
    cloud: 'Только за объём вещей',
  },
  {
    label: 'Минимальный срок',
    individual: '1 месяц',
    cloud: '1 месяц',
  },
];

const B2C_BENEFITS = [
  'Занятые люди — нет времени ехать на склад',
  'Маленькие квартиры — нужно освободить место',
  'Сезонная одежда — летние/зимние вещи на полгода',
  'Детские вещи — коляски, кроватки, одежда «на вырост»',
  'Архивы и документы — редко нужны, но выбросить жалко',
];

const B2B_BENEFITS = [
  'Интернет-магазины — товар, упаковка',
  'Продавцы маркетплейсов (Wildberries, Kaspi) — возвраты, остатки',
  'Офисы — архив документов, мебель, техника',
  'Event-агентства — реквизит между мероприятиями',
];

const B2B_OFFERINGS = [
  'Договор на юридическое лицо, акт приёма-передачи',
  'Фото-каталог содержимого через приложение',
  'Отправка коробок по запросу — день в день или на следующий',
];

const STEPS = [
  {
    num: '1',
    Icon: CloudUpload,
    title: 'Оформляете заявку на сайте',
    text: 'Указываете ориентировочный объём и удобное время визита курьера.',
  },
  {
    num: '2',
    Icon: Truck,
    title: 'Курьер забирает коробки',
    text: 'Приезжает на адрес, помогает упаковать и подписывает приёмо-передаточный акт.',
  },
  {
    num: '3',
    Icon: Camera,
    title: 'Маркируем и фотографируем',
    text: 'Каждая коробка с QR-меткой и фото — видно в приложении в любой момент.',
  },
  {
    num: '4',
    Icon: Package,
    title: 'Доставка обратно по запросу',
    text: 'Стандартно — на следующий день. Срочно — день в день за доплату.',
  },
];

const FAQ_ITEMS = [
  { q: 'Минимальный срок?', a: 'От 1 месяца. Дальше — гибкое продление с любого числа месяца.' },
  {
    q: 'Как платить — картой или безналом?',
    a: 'Физлица — картой онлайн или СМС-подтверждением. Юр.лица — безналом по счёту, договор и акт высылаем сразу после первой доставки.',
  },
  {
    q: 'Что нельзя сдавать?',
    a: 'Скоропортящиеся продукты, легковоспламеняющиеся жидкости, оружие, наркотические вещества, живые растения и животные. Полный список — в договоре.',
  },
  {
    q: 'Я могу приехать на склад и забрать сам?',
    a: 'Нет, в облачном формате доступ только у сотрудников. Если нужен прямой доступ — выбирайте Индивидуальное хранение от 1 месяца.',
  },
  {
    q: 'Сколько занимает доставка обратно?',
    a: 'Стандартно — на следующий день после запроса. Срочно — в день обращения за дополнительную плату.',
  },
  {
    q: 'Есть ли договор для юр.лиц?',
    a: 'Да: договор + акт приёма-передачи + ежемесячный счёт. Подключение «как офис» — только безнал.',
  },
];

export default function OblachnoeHranenieAlmatyPage() {
  const [gateOpen, setGateOpen] = useState(false);
  const [clientType, setClientType] = useState('b2c');

  const openGating = useCallback((nextClientType) => {
    if (nextClientType) setClientType(nextClientType);
    setGateOpen(true);
  }, []);

  return (
    <LpLayout
      bookingServiceType={SERVICE_TYPE}
      onHeaderCta={() => openGating('b2c')}
      ctaLabel="Забронировать"
    >
      <LpHelmet
        title="Облачное хранение в Алматы · мы заберём и привезём · ExtraSpace"
        description="Заберём вещи у вас, упакуем, привезём обратно по запросу. От 6 000 ₸ за коробку в месяц. Для частных лиц и бизнеса."
        canonical={CANONICAL}
        ogImage="/og/lp-oblachnoe.png"
        ogImageAlt="Облачное хранение в Алматы — ExtraSpace"
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
            <Truck size={12} aria-hidden />
            Облачное хранение · Алматы
          </span>
          <h1 className="font-soyuz-grotesk text-[26px] font-bold leading-[1.1] xs:text-[28px] sm:text-4xl md:text-5xl lg:text-6xl">
            Облачное хранение · мы заберём и привезём обратно
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-white/85 sm:mt-5 sm:text-base md:text-lg">
            Платите за объём, не за бокс. Курьер забирает у вас, мы храним и возвращаем по запросу — от 1 месяца.
          </p>

          <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:mt-8 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
            <BookingCtaButton
              section="hero"
              serviceType={SERVICE_TYPE}
              onClick={() => openGating('b2c')}
              variant="primary"
            >
              Забронировать место
              <ChevronRight size={16} aria-hidden />
            </BookingCtaButton>
            <PhoneGatingButton
              section="hero"
              serviceType={SERVICE_TYPE}
              onClick={() => openGating(clientType)}
            />
          </div>
        </div>
      </section>

      <LpVideo
        src="/videos/oblachnoe-hranenie.mp4"
        poster="/videos/oblachnoe-hranenie-poster.jpg"
        title="Облачное хранение — ExtraSpace"
      />

      {/* TARIFFS */}
      <section id="tarify" className="w-full bg-white py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl lg:text-5xl">
              Готовые тарифы
            </h2>
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">
              Выбирайте подходящий формат — или закажите расчёт под свой объём.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TARIFFS.map((t) => (
              <article
                key={t.title}
                className="flex flex-col gap-3 rounded-3xl border border-[#e5e9ed] bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#31876D]/10 text-[#31876D]">
                  <t.Icon size={22} aria-hidden />
                </div>
                <h3 className="text-base font-bold text-[#273655]">{t.title}</h3>
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">{t.volume}</p>
                <p className="text-2xl font-bold text-[#31876D]">{t.price}</p>
                <p className="text-sm text-[#4b5563]">{t.description}</p>
                <BookingCtaButton
                  section="tariffs"
                  serviceType={SERVICE_TYPE}
                  boxSize={t.volume}
                  variant="outline"
                  onClick={() => openGating('b2c')}
                  className="mt-auto"
                >
                  Забронировать
                </BookingCtaButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section id="sravnenie" className="w-full bg-[#F7FAF9] py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl">
              Чем отличается от обычного хранения
            </h2>
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">
              Облачное хранение — это сервис «под ключ». Сравните с индивидуальным боксом, чтобы выбрать подходящий формат.
            </p>
          </header>

          {/* Mobile: cards layout */}
          <div className="mx-auto grid max-w-4xl gap-3 sm:hidden">
            {COMPARISON.map((row) => (
              <div
                key={row.label}
                className="overflow-hidden rounded-2xl border border-[#e5e9ed] bg-white shadow-sm"
              >
                <div className="border-b border-[#e5e9ed] bg-[#F7FAF9] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#273655]">
                  {row.label}
                </div>
                <div className="divide-y divide-[#eef1f4] text-sm">
                  <div className="flex flex-col gap-0.5 px-4 py-3">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-[#94a0a8]">Индивидуальный бокс</span>
                    <span className="text-[#6b7280]">{row.individual}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 px-4 py-3">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-[#31876D]">Облачное хранение</span>
                    <span className="font-semibold text-[#202422]">{row.cloud}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table layout */}
          <div className="mx-auto hidden max-w-4xl overflow-hidden rounded-3xl border border-[#e5e9ed] bg-white shadow-sm sm:block">
            <div className="grid grid-cols-3 border-b border-[#e5e9ed] bg-[#F7FAF9] text-sm font-semibold text-[#273655]">
              <div className="p-4 sm:p-5">Параметр</div>
              <div className="p-4 sm:p-5">Индивидуальный бокс</div>
              <div className="p-4 sm:p-5 text-[#31876D]">Облачное хранение</div>
            </div>
            {COMPARISON.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 text-sm text-[#374151] sm:text-[15px] ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FBFA]'
                }`}
              >
                <div className="p-4 font-medium sm:p-5">{row.label}</div>
                <div className="p-4 text-[#6b7280] sm:p-5">{row.individual}</div>
                <div className="p-4 font-semibold text-[#202422] sm:p-5">{row.cloud}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR HOME / FOR BUSINESS */}
      <section className="w-full bg-white py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl lg:text-5xl">
              Для дома и для бизнеса
            </h2>
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">
              Один сервис — два сценария использования. Выберите свой и оставьте заявку.
            </p>
          </header>

          <div className="grid gap-5 lg:grid-cols-2">
            <article id="dlya-doma" className="flex flex-col gap-4 rounded-3xl border border-[#e5e9ed] bg-[#F7FAF9] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#31876D]/10 text-[#31876D]">
                  <Home size={22} aria-hidden />
                </div>
                <h3 className="font-soyuz-grotesk text-2xl font-bold text-[#273655]">Для дома</h3>
              </div>
              <p className="text-sm text-[#4b5563]">
                Идеально, если квартира маленькая, а ехать на склад каждый раз — лень. Курьер сделает всё за вас.
              </p>
              <ul className="space-y-2 text-sm text-[#374151]">
                {B2C_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-[#31876D]" aria-hidden /> {b}
                  </li>
                ))}
              </ul>
              <BookingCtaButton
                section="b2c_block"
                serviceType={SERVICE_TYPE}
                onClick={() => openGating('b2c')}
                variant="primary"
                className="mt-2"
              >
                Забронировать бокс
                <ChevronRight size={16} aria-hidden />
              </BookingCtaButton>
            </article>

            <article id="dlya-biznesa" className="flex flex-col gap-4 rounded-3xl border border-[#31876D]/30 bg-[#0e1729] p-6 text-white sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Building2 size={22} aria-hidden />
                </div>
                <h3 className="font-soyuz-grotesk text-2xl font-bold">Для бизнеса</h3>
              </div>
              <p className="text-sm text-white/80">
                Сократите расходы на офис и склад. Платите за реальный объём, заказывайте отгрузки по запросу.
              </p>
              <ul className="space-y-2 text-sm">
                {B2B_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-[#31876D]" aria-hidden /> {b}
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl bg-white/5 p-4 text-sm">
                <p className="mb-2 font-semibold text-white">Что предлагаем юр.лицам:</p>
                <ul className="space-y-1.5 text-white/80">
                  {B2B_OFFERINGS.map((o) => (
                    <li key={o} className="flex items-start gap-2">
                      <Smartphone size={14} className="mt-0.5 shrink-0 text-[#31876D]" aria-hidden /> {o}
                    </li>
                  ))}
                </ul>
              </div>
              <BookingCtaButton
                section="b2b_block"
                serviceType={SERVICE_TYPE}
                enableBookingAnalytics={false}
                onClick={() => openGating('b2b')}
                variant="primary"
                className="mt-2"
              >
                Запросить КП
                <ChevronRight size={16} aria-hidden />
              </BookingCtaButton>
            </article>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="kak-rabotaet" className="w-full bg-[#F7FAF9] py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl lg:text-5xl">
              Как работает
            </h2>
          </header>

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li
                key={step.num}
                className="flex flex-col gap-3 rounded-3xl border border-[#e5e9ed] bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#31876D] font-soyuz-grotesk text-base font-bold text-white">
                    {step.num}
                  </span>
                  <step.Icon size={22} className="text-[#31876D]" aria-hidden />
                </div>
                <h3 className="text-base font-bold text-[#273655]">{step.title}</h3>
                <p className="text-sm text-[#4b5563]">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* EXTRA SERVICES */}
      <section className="w-full bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] sm:text-3xl">
              Дополнительные услуги
            </h2>
          </header>

          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-3xl border border-[#e5e9ed] bg-[#F7FAF9] p-5">
              <Truck size={22} className="mt-1 shrink-0 text-[#31876D]" aria-hidden />
              <div>
                <p className="font-semibold text-[#273655]">Перевозка к нам</p>
                <p className="text-sm text-[#6b7280]">Тариф уточнит менеджер по объёму и адресу.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-3xl border border-[#e5e9ed] bg-[#F7FAF9] p-5">
              <Package size={22} className="mt-1 shrink-0 text-[#31876D]" aria-hidden />
              <div>
                <p className="font-semibold text-[#273655]">Упаковка вещей</p>
                <p className="text-sm text-[#6b7280]">Коробки, плёнка, маркировка — тариф у менеджера.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Branches />

      <MiniFormSection
        serviceType={SERVICE_TYPE}
        title="Заберём вещи у вас — оставьте контакт"
        description="Напишем в WhatsApp в течение 15 минут, согласуем удобное время и адрес. Менеджер посчитает точный объём после визита курьера."
        showClientType
        initialClientType="b2c"
      />

      <FAQAccordion
        items={FAQ_ITEMS}
        title="Частые вопросы про облачное хранение"
        subtitle="Если не нашли ответ — оставьте контакт ниже, и мы перезвоним."
      />

      {/* FINAL CTA */}
      <section className="relative isolate w-full overflow-hidden bg-[#0e1729] py-12 text-white sm:py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e1729] via-[#142340] to-[#31876D]/40" aria-hidden />
        <div className="container relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-soyuz-grotesk text-2xl font-bold leading-tight xs:text-3xl sm:text-4xl lg:text-5xl">
            Заберём вещи сегодня — вернём по запросу
          </h2>
          <p className="mt-4 text-sm text-white/80 sm:text-base">
            Курьер ExtraSpace приедет к вам, упакует и вывезет. Вы платите только за объём вещей.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <BookingCtaButton
              section="final_cta_b2c"
              serviceType={SERVICE_TYPE}
              variant="big"
              onClick={() => openGating('b2c')}
            >
              Забронировать место
              <ChevronRight size={18} aria-hidden />
            </BookingCtaButton>
            <BookingCtaButton
              section="final_cta_b2b"
              serviceType={SERVICE_TYPE}
              enableBookingAnalytics={false}
              variant="big"
              onClick={() => openGating('b2b')}
              className="!bg-white !text-[#0e1729] hover:!bg-white/90"
            >
              Запросить КП
              <ChevronRight size={18} aria-hidden />
            </BookingCtaButton>
          </div>

          <div className="mt-6 flex justify-center">
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
        showClientType
        initialClientType={clientType}
      />
    </LpLayout>
  );
}
