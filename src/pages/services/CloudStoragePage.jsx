import React, { useCallback, useRef, useState } from 'react';
import {
  CloudUpload,
  Truck,
  Camera,
  Package,
  Home,
  Building2,
  Shirt,
  Baby,
  Archive,
  Boxes,
} from 'lucide-react';

import ServiceShell from './components/ServiceShell.jsx';
import ServiceMeta from './components/ServiceMeta.jsx';
import ServiceHero from './components/ServiceHero.jsx';
import UsefulGrid from './components/UsefulGrid.jsx';
import OtherFormatsBlock from './components/OtherFormatsBlock.jsx';
import CloudCalculator from './components/calculators/CloudCalculator.jsx';
import InlineBookingScheme from './components/InlineBookingScheme.jsx';
import FAQAccordion from '../lp/components/FAQAccordion.jsx';

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

const WHO_FITS = [
  { Icon: Home, title: 'Для дома', text: 'Маленькая квартира, нет времени ехать на склад — курьер сделает всё за вас.' },
  { Icon: Building2, title: 'Для бизнеса', text: 'Интернет-магазины, маркетплейсы, офисы, event-агентства — платите только за объём.' },
];

const WHAT_TO_STORE = [
  { Icon: Shirt, title: 'Сезонная одежда', text: 'Зимние и летние вещи, обувь — на полгода, без шкафов.' },
  { Icon: Baby, title: 'Детские вещи', text: 'Коляски, кроватки, одежда «на вырост» — освободите комнату.' },
  { Icon: Archive, title: 'Архивы и документы', text: 'Редко нужны, но выбросить жалко — заберём, маркируем, привезём по запросу.' },
  { Icon: Boxes, title: 'Товарные остатки', text: 'Маркетплейсы и интернет-магазины: товар, упаковка, возвраты.' },
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
    a: 'Нет, в облачном формате доступ только у сотрудников. Если нужен прямой доступ — выбирайте индивидуальное хранение от 1 месяца.',
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

export default function CloudStoragePage() {
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
        title="Облачное хранение в Алматы · Extra Space"
        description="Заберём вещи у вас, упакуем, привезём обратно по запросу. Платите за объём, а не за бокс. Калькулятор стоимости и заявка онлайн."
        canonical="https://extraspace.kz/cloud-storage"
      />

      <ServiceHero
        badge="Облачное хранение"
        title="Мы заберём и привезём обратно"
        description="Платите за объём, не за бокс. Курьер забирает вещи у вас, мы храним и возвращаем по запросу — от 1 месяца."
        ctaLabel="Рассчитать стоимость"
        onCtaClick={scrollToCalc}
        videoSrc="/videos/oblachnoe-hranenie.mp4"
        videoPoster="/videos/oblachnoe-hranenie-poster.jpg"
        videoTitle="Облачное хранение — Extra Space"
      />

      {schemeParams ? (
        <InlineBookingScheme
          ref={schemeRef}
          format="CLOUD"
          params={schemeParams}
          onReset={handleResetScheme}
        />
      ) : (
        <CloudCalculator onSubmit={handleCalculatorSubmit} />
      )}

      <UsefulGrid
        id="kak-rabotaet"
        title="Как работает"
        subtitle="Сервис «под ключ»: заявка, курьер, фото-каталог в приложении, доставка обратно."
        items={STEPS}
        columns={4}
        background="bg-[#F7FAF9]"
        ordered
      />

      <UsefulGrid
        id="komu"
        title="Кому подходит"
        items={WHO_FITS}
        columns={2}
        background="bg-white"
      />

      <UsefulGrid
        id="chto-hranit"
        title="Что удобно хранить"
        items={WHAT_TO_STORE}
        columns={4}
        background="bg-[#F7FAF9]"
      />

      <FAQAccordion
        items={FAQ_ITEMS}
        title="Частые вопросы про облачное хранение"
        subtitle="Если не нашли ответ — оставьте контакт выше, и мы перезвоним."
      />

      <OtherFormatsBlock exclude="CLOUD" />
    </ServiceShell>
  );
}
