import React, { useCallback, useRef } from 'react';
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
import PageSeo from '../../shared/seo/PageSeo.jsx';
import { PAGE_SEO, buildBreadcrumbJsonLd, buildFaqPageJsonLd, RU_KK_HREFLANG } from '../../shared/seo/pageMeta.js';
import ServiceHero from './components/ServiceHero.jsx';
import UsefulGrid from './components/UsefulGrid.jsx';
import OtherFormatsBlock from './components/OtherFormatsBlock.jsx';
import InlineBookingScheme from './components/InlineBookingScheme.jsx';
import FAQAccordion from '../lp/components/FAQAccordion.jsx';

const STEPS = [
  {
    num: '1',
    Icon: CloudUpload,
    title: 'Оформляете заявку на сайте',
    text: 'Указываете ориентировочный объём вещей, менеджер уточняет детали хранения.',
  },
  {
    num: '2',
    Icon: Truck,
    title: 'Передаёте вещи на хранение',
    text: 'При необходимости поможем организовать доставку вещей на склад. Стоимость рассчитывается отдельно.',
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
    title: 'Получаете вещи обратно по запросу',
    text: 'При необходимости поможем организовать обратную доставку. Стоимость и сроки рассчитываются отдельно.',
  },
];

const WHO_FITS = [
  { Icon: Home, title: 'Для дома', text: 'Маленькая квартира, мало свободного места или вещи нужны только время от времени — храните их на складе без аренды отдельного бокса.' },
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
    q: 'Как организовать доставку вещей обратно?',
    a: 'При необходимости поможем организовать доставку по запросу. Стоимость и сроки рассчитываются отдельно в зависимости от объёма вещей и адреса.',
  },
  {
    q: 'Есть ли договор для юр.лиц?',
    a: 'Да: договор + акт приёма-передачи + ежемесячный счёт. Подключение «как офис» — только безнал.',
  },
];

export default function CloudStoragePage() {
  const schemeRef = useRef(null);

  const scrollToBooking = useCallback(() => {
    document.getElementById('booking-scheme')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <ServiceShell>
      <PageSeo
        title={PAGE_SEO.cloudStorage.title}
        description={PAGE_SEO.cloudStorage.description}
        path={PAGE_SEO.cloudStorage.path}
        hreflang={RU_KK_HREFLANG.cloudStorage}
        ogLocale="ru_KZ"
        jsonLd={[
          buildBreadcrumbJsonLd([
            { name: 'Главная', path: '/' },
            { name: 'Облачное хранение', path: PAGE_SEO.cloudStorage.path },
          ]),
          buildFaqPageJsonLd(FAQ_ITEMS),
        ]}
        jsonLdId="cloud"
      />

      <ServiceHero
        badge="Облачное хранение"
        title="Облачное хранение вещей без аренды бокса"
        description="Храним вещи от 9 500 ₸/м³ в месяц и возвращаем по запросу. Мебель, сезонные вещи, товары, архивы."
        ctaLabel="Выбрать тариф"
        onCtaClick={scrollToBooking}
        videoSrc="/videos/oblachnoe-hranenie.mp4"
        videoPoster="/videos/oblachnoe-hranenie-poster.jpg"
        videoTitle="Облачное хранение — Extra Space"
      />

      <InlineBookingScheme ref={schemeRef} format="CLOUD" />

      <OtherFormatsBlock exclude="CLOUD" />

      <UsefulGrid
        id="kak-rabotaet"
        title="Как работает"
        subtitle="Удобный сервис хранения: заявка, размещение вещей, фото-каталог в приложении и получение по запросу."
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

    </ServiceShell>
  );
}
