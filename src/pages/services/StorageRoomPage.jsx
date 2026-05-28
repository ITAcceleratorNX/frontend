import React, { useCallback, useRef, useState } from 'react';
import {
  Plane,
  Briefcase,
  Home,
  PartyPopper,
  Luggage,
  Box,
  Package,
  Backpack,
} from 'lucide-react';

import ServiceShell from './components/ServiceShell.jsx';
import ServiceMeta from './components/ServiceMeta.jsx';
import ServiceHero from './components/ServiceHero.jsx';
import UsefulGrid from './components/UsefulGrid.jsx';
import OtherFormatsBlock from './components/OtherFormatsBlock.jsx';
import RoomCalculator from './components/calculators/RoomCalculator.jsx';
import InlineBookingScheme from './components/InlineBookingScheme.jsx';
import FAQAccordion from '../lp/components/FAQAccordion.jsx';

const USE_CASES = [
  {
    Icon: Plane,
    title: 'Туристам',
    text: 'Оставьте чемодан до заселения в отель или после выселения — гуляйте по городу налегке.',
  },
  {
    Icon: Briefcase,
    title: 'В командировке',
    text: 'Между встречами не нужно таскать сумки — оставьте у нас на час, день или неделю.',
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
  { Icon: Luggage, title: 'Чемоданы' },
  { Icon: Backpack, title: 'Сумки и рюкзаки' },
  { Icon: Box, title: 'Коробки' },
  { Icon: Package, title: 'Личные вещи' },
];

const STEPS = [
  {
    num: '1',
    title: 'Привозите вещи в филиал',
    text: 'Любой из двух филиалов в черте Алматы. Бронь места можно сделать заранее.',
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

export default function StorageRoomPage() {
  const [schemeParams, setSchemeParams] = useState(null);
  const schemeRef = useRef(null);

  const scrollToCalc = useCallback(() => {
    document.getElementById('kalkulyator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleCalculatorSubmit = useCallback((data) => {
    setSchemeParams(data);
    requestAnimationFrame(() => {
      schemeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const handleResetScheme = useCallback(() => {
    setSchemeParams(null);
    document.getElementById('kalkulyator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <ServiceShell>
      <ServiceMeta
        title="Камера хранения в Алматы · от 1 дня · Extra Space"
        description="Краткосрочное хранение чемоданов, сумок и коробок — от 1 дня до 2 недель. Калькулятор стоимости и бронь онлайн."
        canonical="https://extraspace.kz/storage-room"
      />

      <ServiceHero
        badge="Камера хранения"
        title="Краткосрочное хранение вещей"
        description="Чемоданы, сумки, коробки — храним посуточно. От 1 дня до 2 недель, без долгого договора."
        ctaLabel="Рассчитать стоимость"
        onCtaClick={scrollToCalc}
        videoSrc="/videos/kamera-hraneniya.mp4"
        videoPoster="/videos/kamera-hraneniya-poster.jpg"
        videoTitle="Камера хранения — Extra Space"
      />

      {schemeParams ? (
        <InlineBookingScheme
          ref={schemeRef}
          format="LOCKERS"
          params={schemeParams}
          onReset={handleResetScheme}
        />
      ) : (
        <RoomCalculator onSubmit={handleCalculatorSubmit} />
      )}

      <UsefulGrid
        id="kak-rabotaet"
        title="Как работает"
        subtitle="Привезли — сдали — забрали по коду. Всё в 3 шага."
        items={STEPS}
        columns={3}
        background="bg-[#F7FAF9]"
        ordered
      />

      <UsefulGrid
        id="komu"
        title="Кому подходит"
        items={USE_CASES}
        columns={4}
        background="bg-white"
      />

      <UsefulGrid
        id="chto-hranit"
        title="Что можно сдать на хранение"
        items={STORE_ITEMS}
        columns={4}
        background="bg-[#F7FAF9]"
      />

      <FAQAccordion
        items={FAQ_ITEMS}
        title="Частые вопросы про камеру хранения"
        subtitle="Если не нашли ответ — оставьте контакт выше, и мы перезвоним."
      />

      <OtherFormatsBlock exclude="LOCKERS" />
    </ServiceShell>
  );
}
