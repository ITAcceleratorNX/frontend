import React, { useCallback, useRef } from 'react';
import {
  Hammer,
  Truck,
  Sun,
  Briefcase,
  Thermometer,
  ShieldCheck,
  FileBadge,
  MapPin,
} from 'lucide-react';

import ServiceShell from './components/ServiceShell.jsx';
import ServiceMeta from './components/ServiceMeta.jsx';
import ServiceHero from './components/ServiceHero.jsx';
import UsefulGrid from './components/UsefulGrid.jsx';
import OtherFormatsBlock from './components/OtherFormatsBlock.jsx';
import InlineBookingScheme from './components/InlineBookingScheme.jsx';
import FAQAccordion from '../lp/components/FAQAccordion.jsx';

const USE_CASES = [
  {
    Icon: Hammer,
    title: 'Ремонт квартиры',
    text: 'Освободите комнаты от мебели и коробок на время ремонта — от 1 месяца, удобный заезд.',
  },
  {
    Icon: Truck,
    title: 'Переезд между квартирами',
    text: 'Храните вещи между съёмными квартирами или продажей-покупкой жилья — без посуточной оплаты.',
  },
  {
    Icon: Sun,
    title: 'Сезонные вещи',
    text: 'Шины, велосипед, лыжи, садовый инвентарь — освободите балкон, кладовку и багажник.',
  },
  {
    Icon: Briefcase,
    title: 'Бизнес-товары',
    text: 'Остатки товаров, оборудование, документы — без своего склада и аренды коммерческого помещения.',
  },
];

const ADVANTAGES = [
  { Icon: Thermometer, title: 'Климат-контроль', text: 'Отопление зимой, без сырости — подходит даже для мебели и документов.' },
  { Icon: ShieldCheck, title: 'Охрана 24/7', text: 'Видеонаблюдение и контроль доступа. Доступ только у вас — личный код и ключ.' },
  { Icon: FileBadge, title: 'Страхование вещей', text: 'Базовая страховка включена в стоимость. Можно подключить расширенную за доплату.' },
  { Icon: MapPin, title: 'В черте города', text: '2 филиала в Алматы, 15 минут от центра — не нужно ехать за город.' },
];

const STEPS = [
  { num: '1', title: 'Бронируете онлайн', text: '5 минут, без визита — выбираете размер и срок.' },
  { num: '2', title: 'Подписываете договор по СМС', text: 'Электронный договор приходит на телефон.' },
  { num: '3', title: 'Оплачиваете онлайн', text: 'Картой, СМС-подтверждением или безналом для юр.лиц.' },
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
    q: 'Кто имеет доступ к боксу?',
    a: 'Только вы. У сотрудников нет дубликата ключа — мы видим только периметр и общие коридоры по камерам.',
  },
  {
    q: 'Можно ли продлить аренду?',
    a: 'Да, продление онлайн в личном кабинете в любой момент. Никаких визитов и переподписаний.',
  },
];

export default function IndividualStoragePage() {
  const schemeRef = useRef(null);

  const scrollToBooking = useCallback(() => {
    document.getElementById('booking-scheme')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <ServiceShell>
      <ServiceMeta
        title="Индивидуальное хранение в Алматы · Extra Space"
        description="Личный бокс с климат-контролем и охраной 24/7. От 1 месяца, доступ только у вас. Выбор бокса на карте и бронь онлайн."
        canonical="https://extraspace.kz/individual-storage"
      />

      <ServiceHero
        badge="Индивидуальное хранение"
        title="Личный бокс с самостоятельным доступом"
        description="Свой ключ, доступ 24/7, климат-контроль и охрана. Подойдёт для дома и бизнеса — храните мебель, сезонные вещи, документы и товары."
        ctaLabel="Подобрать бокс"
        onCtaClick={scrollToBooking}
        videoSrc="/videos/individualnoe-hranenie.mp4"
        videoPoster="/videos/individualnoe-hranenie-poster.jpg"
        videoTitle="Индивидуальное хранение в боксе — Extra Space"
      />

      <InlineBookingScheme ref={schemeRef} format="INDIVIDUAL" />

      <OtherFormatsBlock exclude="INDIVIDUAL" />

      <UsefulGrid
        id="kak-rabotaet"
        title="Как работает"
        subtitle="Никаких визитов в офис и подписей на бумаге — всё онлайн, занимает 5 минут."
        items={STEPS}
        columns={4}
        background="bg-[#F7FAF9]"
        ordered
      />

      <UsefulGrid
        id="komu"
        title="Кому подходит"
        subtitle="Сценариев применения несколько, все они подходят под аренду от 1 месяца."
        items={USE_CASES}
        columns={4}
        background="bg-white"
      />

      <UsefulGrid
        id="preimuschestva"
        title="Что входит в стоимость"
        items={ADVANTAGES}
        columns={4}
        background="bg-[#F7FAF9]"
      />

      <FAQAccordion
        items={FAQ_ITEMS}
        title="Частые вопросы про индивидуальное хранение"
        subtitle="Если не нашли ответ — оставьте контакт выше, и мы перезвоним."
      />

    </ServiceShell>
  );
}
