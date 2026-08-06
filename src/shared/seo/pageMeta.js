/** SEO meta for public marketing pages (from SEO audit 29.07.2026). */
export const SITE_ORIGIN = 'https://extraspace.kz';
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/Frame51.png`;

export const PAGE_SEO = {
  home: {
    title: 'Аренда боксов для хранения вещей в Алматы — Extra Space',
    description:
      'Личные боксы от 2 м², облачное хранение с забором вещей и камера хранения от 1 дня. Тёплый склад, охрана, доступ 24/7. Бронирование онлайн.',
    path: '/',
    h1: 'Аренда боксов и хранение вещей в Алматы',
  },
  individualStorage: {
    title: 'Аренда бокса в Алматы — индивидуальное хранение · Extra Space',
    description:
      'Личный бокс 2–100 м² с климат-контролем и охраной. Доступ 24/7 только у вас. Для дома и бизнеса, от 1 месяца. Цены и бронь онлайн.',
    path: '/individual-storage',
  },
  cloudStorage: {
    title: 'Хранение вещей с доставкой в Алматы — заберём и привезём',
    description:
      'Курьер заберёт вещи, храним от 9 500 ₸/м³ в месяц, вернём по запросу за 1 день. Мебель, сезонные вещи, товары, архивы. От 1 месяца.',
    path: '/cloud-storage',
  },
  storageRoom: {
    title: 'Камера хранения в Алматы — от 1 дня · Extra Space',
    description:
      'Краткосрочное хранение чемоданов, сумок и коробок: от 1 дня до 2 недель. Рядом с центром, бронь онлайн, круглосуточно.',
    path: '/storage-room',
  },
  moving: {
    title: 'Перевозка вещей с хранением в Алматы — Extra Space',
    description:
      'Мувинг + хранение в одном сервисе: упакуем, перевезём, разместим на тёплом складе. Переезд квартиры или офиса без хаоса.',
    path: '/moving',
  },
  about: {
    title: 'Склад индивидуального хранения в Алматы — о компании',
    description:
      'Как устроен склад Extra Space: охрана, видеонаблюдение, климат-контроль 20–22°C, страхование. Фото и ответы на вопросы.',
    path: '/about-warehouse-rental',
  },
  notFound: {
    title: 'Страница не найдена — Extra Space',
    description: 'Запрашиваемая страница не существует или была перемещена.',
    path: null,
    robots: 'noindex, follow',
  },
};

export function absoluteUrl(path) {
  if (!path || path === '/') return `${SITE_ORIGIN}/`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${normalized.replace(/\/$/, '')}`;
}

/** RU ↔ KK alternate links for bilingual marketing pages. */
export function buildRuKkHreflang(ruPath, kkPath) {
  return {
    'ru-KZ': ruPath,
    'kk-KZ': kkPath,
    'x-default': ruPath,
  };
}

export const RU_KK_HREFLANG = {
  home: buildRuKkHreflang('/', '/kk'),
  individualStorage: buildRuKkHreflang('/individual-storage', '/kk/individual-storage'),
  cloudStorage: buildRuKkHreflang('/cloud-storage', '/kk/cloud-storage'),
  storageRoom: buildRuKkHreflang('/storage-room', '/kk/storage-room'),
  moving: buildRuKkHreflang('/moving', '/kk/moving'),
};

export function buildSelfStorageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SelfStorage',
    name: 'Extra Space',
    url: `${SITE_ORIGIN}/`,
    telephone: '+7 778 391-14-25',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Алматы',
      addressCountry: 'KZ',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    priceRange: 'от 9 500 ₸/мес',
  };
}

export function buildBreadcrumbJsonLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * FAQPage schema. Pass [{ q, a }] or [{ question, answer }].
 */
export function buildFaqPageJsonLd(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q || item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a || item.answer,
      },
    })),
  };
}

/** About-page FAQ for schema (UI may not have accordion yet). */
export const ABOUT_FAQ_ITEMS = [
  {
    q: 'Есть ли охрана и видеонаблюдение?',
    a: 'Да: круглосуточная охрана и видеонаблюдение на территории склада Extra Space.',
  },
  {
    q: 'Какой климат на складе?',
    a: 'Климат-контроль поддерживает температуру около 20–22°C — вещи не портятся от сырости и жары.',
  },
  {
    q: 'Можно ли застраховать вещи?',
    a: 'Да, доступно страхование хранимого имущества. Условия уточняйте при бронировании.',
  },
  {
    q: 'Какой формат хранения выбрать?',
    a: 'Индивидуальный бокс — если нужен доступ 24/7; облачное хранение — если нужен забор/доставка; камера хранения — для срока от 1 дня.',
  },
];

/**
 * Когда появятся коды верификации — раскомментировать в index.html:
 * <meta name="google-site-verification" content="..." />
 * <meta name="yandex-verification" content="..." />
 * Этап 3 аудита (GSC / Яндекс.Вебмастер) отложен: нет доступов у команды разработки.
 */
