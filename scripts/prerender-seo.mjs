/**
 * Post-build SEO prerender for SPA.
 * Copies dist/index.html into route folders and injects title/description/canonical/H1/JSON-LD
 * so crawlers see content without executing JavaScript.
 *
 * Hosting must prefer static files over SPA rewrite (Netlify/Render do this when files exist).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const ORIGIN = 'https://extraspace.kz';

const ROUTES = [
  {
    path: '/',
    file: 'index.html',
    title: 'Аренда боксов для хранения вещей в Алматы — Extra Space',
    description:
      'Личные боксы от 2 м², облачное хранение с забором вещей и камера хранения от 1 дня. Тёплый склад, охрана, доступ 24/7. Бронирование онлайн.',
    h1: 'Аренда боксов и хранение вещей в Алматы',
    text: 'Аренда индивидуальных боксов, облачное хранение с доставкой и камера хранения в Алматы. Extra Space — тёплый склад, охрана, доступ 24/7.',
    hreflang: { 'ru-KZ': '/', 'kk-KZ': '/kk', 'x-default': '/' },
  },
  {
    path: '/individual-storage',
    file: 'individual-storage/index.html',
    title: 'Аренда бокса в Алматы — индивидуальное хранение · Extra Space',
    description:
      'Личный бокс 2–100 м² с климат-контролем и охраной. Доступ 24/7 только у вас. Для дома и бизнеса, от 1 месяца. Цены и бронь онлайн.',
    h1: 'Аренда бокса — индивидуальное хранение в Алматы',
    text: 'Личный бокс с климат-контролем и охраной. Доступ 24/7 только у вас. От 1 месяца, бронь онлайн.',
    hreflang: {
      'ru-KZ': '/individual-storage',
      'kk-KZ': '/kk/individual-storage',
      'x-default': '/individual-storage',
    },
  },
  {
    path: '/cloud-storage',
    file: 'cloud-storage/index.html',
    title: 'Хранение вещей с доставкой в Алматы — заберём и привезём',
    description:
      'Курьер заберёт вещи, храним от 9 500 ₸/м³ в месяц, вернём по запросу за 1 день. Мебель, сезонные вещи, товары, архивы. От 1 месяца.',
    h1: 'Хранение вещей с доставкой в Алматы',
    text: 'Курьер заберёт вещи, мы храним на тёплом складе и вернём по запросу. Платите за объём, не за бокс.',
    hreflang: {
      'ru-KZ': '/cloud-storage',
      'kk-KZ': '/kk/cloud-storage',
      'x-default': '/cloud-storage',
    },
  },
  {
    path: '/storage-room',
    file: 'storage-room/index.html',
    title: 'Камера хранения в Алматы — от 1 дня · Extra Space',
    description:
      'Краткосрочное хранение чемоданов, сумок и коробок: от 1 дня до 2 недель. Рядом с центром, бронь онлайн, круглосуточно.',
    h1: 'Камера хранения в Алматы — от 1 дня',
    text: 'Краткосрочное хранение чемоданов, сумок и коробок. От 1 дня до 2 недель, бронь онлайн.',
    hreflang: {
      'ru-KZ': '/storage-room',
      'kk-KZ': '/kk/storage-room',
      'x-default': '/storage-room',
    },
  },
  {
    path: '/moving',
    file: 'moving/index.html',
    title: 'Перевозка вещей с хранением в Алматы — Extra Space',
    description:
      'Мувинг + хранение в одном сервисе: упакуем, перевезём, разместим на тёплом складе. Переезд квартиры или офиса без хаоса.',
    h1: 'Перевозка вещей с хранением в Алматы',
    text: 'Упакуем, перевезём и разместим вещи на тёплом складе Extra Space.',
    hreflang: { 'ru-KZ': '/moving', 'kk-KZ': '/kk/moving', 'x-default': '/moving' },
  },
  {
    path: '/about-warehouse-rental',
    file: 'about-warehouse-rental/index.html',
    title: 'Склад индивидуального хранения в Алматы — о компании',
    description:
      'Как устроен склад Extra Space: охрана, видеонаблюдение, климат-контроль 20–22°C, страхование. Фото и ответы на вопросы.',
    h1: 'Склад индивидуального хранения Extra Space в Алматы',
    text: 'Охрана, видеонаблюдение, климат-контроль 20–22°C и страхование на складе Extra Space.',
  },
  {
    path: '/arenda-kladovki',
    file: 'arenda-kladovki/index.html',
    title: 'Аренда кладовки в Алматы — боксы для хранения · Extra Space',
    description:
      'Аренда кладовки и мини-склада в Алматы: тёплые боксы от 2 м², охрана, климат-контроль, доступ 24/7. Бронь онлайн от 1 месяца.',
    h1: 'Аренда кладовки в Алматы',
    text: 'Личная кладовка на тёплом складе Extra Space — охрана, доступ 24/7, бронь онлайн.',
  },
  {
    path: '/hranenie-shin',
    file: 'hranenie-shin/index.html',
    title: 'Хранение шин в Алматы — сезонное хранение колёс · Extra Space',
    description:
      'Сезонное хранение шин и колёс в Алматы: тёплый склад, охрана, можно с дисками. Заберём курьером или положите в бокс сами. От 1 месяца.',
    h1: 'Хранение шин в Алматы',
    text: 'Сезонное хранение шин на тёплом складе — с дисками или без, с забором курьером или в боксе.',
  },
  {
    path: '/hranenie-mebeli',
    file: 'hranenie-mebeli/index.html',
    title: 'Хранение мебели в Алматы — бокс или с доставкой · Extra Space',
    description:
      'Хранение мебели в Алматы на время ремонта или переезда: тёплый склад, охрана, упаковка и мувинг. Бокс с доступом 24/7 или заберём курьером.',
    h1: 'Хранение мебели в Алматы',
    text: 'Хранение мебели на тёплом складе Extra Space — бокс или облачное хранение с доставкой.',
  },
  {
    path: '/hranenie-pri-pereezde',
    file: 'hranenie-pri-pereezde/index.html',
    title: 'Хранение при переезде в Алматы — мувинг + склад · Extra Space',
    description:
      'Переезд без хаоса: упакуем, перевезём и разместим вещи на складе Extra Space в Алматы. Временное хранение между квартирами или ремонтом.',
    h1: 'Хранение вещей при переезде',
    text: 'Мувинг и временное хранение вещей при переезде в Алматы — Extra Space.',
  },
  {
    path: '/hranenie-dlya-biznesa',
    file: 'hranenie-dlya-biznesa/index.html',
    title: 'Хранение для бизнеса в Алматы — склад, договор, безнал · Extra Space',
    description:
      'Ответственное хранение товаров, архивов и оборудования для бизнеса в Алматы. Договор, безнал, акты. Боксы и облачное хранение с доставкой.',
    h1: 'Хранение для бизнеса в Алматы',
    text: 'Ответственное хранение для бизнеса: договор, безнал, тёплый склад Extra Space в Алматы.',
  },
  {
    path: '/blog',
    file: 'blog/index.html',
    title: 'Блог Extra Space — хранение вещей в Алматы',
    description:
      'Советы по аренде бокса, хранению шин и мебели, переезду и складу для бизнеса в Алматы.',
    h1: 'Блог Extra Space',
    text: 'Практические материалы про хранение вещей, переезд и аренду бокса в Алматы.',
  },
  {
    path: '/katalogi',
    file: 'katalogi/index.html',
    title: 'Где найти Extra Space — каталоги и карты Алматы',
    description:
      'Филиалы Extra Space в 2ГИС и Google Maps, контакты складов в Алматы: Mega Tower и Комфорт Сити.',
    h1: 'Где нас найти',
    text: 'Склады Extra Space в Алматы на картах и в справочниках — 2ГИС, Google Maps.',
  },
  {
    path: '/kk',
    file: 'kk/index.html',
    title: 'Алматыда заттарды сақтау қорабын жалға алу — Extra Space',
    description:
      'Алматыдағы жеке қораптар, бұлтты сақтау және сақтау камерасы. Жылы қойма, күзет, тәулік бойы қолжетімділік.',
    h1: 'Алматыда заттарды сақтау қорабын жалға алу',
    text: 'Жеке қорап, курьермен жеткізу немесе қысқа мерзімді камера — Extra Space жылы қоймасында.',
    hreflang: { 'ru-KZ': '/', 'kk-KZ': '/kk', 'x-default': '/' },
  },
  {
    path: '/kk/individual-storage',
    file: 'kk/individual-storage/index.html',
    title: 'Алматыда қорапты жалға алу — жеке сақтау · Extra Space',
    description:
      'Климат-бақылауы және күзеті бар жеке қорап. Тек сізде тәулік бойы қолжетімділік. 1 айдан бастап.',
    h1: 'Алматыда жеке сақтау қорабы',
    text: 'Өз кілтіңіз, тәулік бойы қолжетімділік, жылы қойма.',
    hreflang: {
      'ru-KZ': '/individual-storage',
      'kk-KZ': '/kk/individual-storage',
      'x-default': '/individual-storage',
    },
  },
  {
    path: '/kk/cloud-storage',
    file: 'kk/cloud-storage/index.html',
    title: 'Алматыда жеткізумен зат сақтау — Extra Space',
    description:
      'Курьер заттарды алып кетеді, қоймада сақтаймыз, сұраныс бойынша қайтарамыз. Көлем бойынша төлем.',
    h1: 'Жеткізумен бұлтты сақтау',
    text: 'Қорапқа бармайсыз: курьер алады, біз сақтаймыз, кейін қайтарамыз.',
    hreflang: {
      'ru-KZ': '/cloud-storage',
      'kk-KZ': '/kk/cloud-storage',
      'x-default': '/cloud-storage',
    },
  },
  {
    path: '/kk/storage-room',
    file: 'kk/storage-room/index.html',
    title: 'Алматыда сақтау камерасы — 1 күннен · Extra Space',
    description:
      'Чемодан, сөмке және қораптарды қысқа мерзімге сақтау: 1 күннен 2 аптаға дейін.',
    h1: 'Алматыда сақтау камерасы',
    text: 'Қысқа мерзім: 1 күннен 2 аптаға дейін. Чемодан мен қораптарға ыңғайлы.',
    hreflang: {
      'ru-KZ': '/storage-room',
      'kk-KZ': '/kk/storage-room',
      'x-default': '/storage-room',
    },
  },
  {
    path: '/kk/moving',
    file: 'kk/moving/index.html',
    title: 'Алматыда көшіру және сақтау — Extra Space',
    description:
      'Мувинг + қойма: орап, тасымалдап, жылы қоймаға орналастырамыз.',
    h1: 'Көшіру және заттарды сақтау',
    text: 'Бір сервисте: қаптау, тасымал және қоймада сақтау.',
    hreflang: { 'ru-KZ': '/moving', 'kk-KZ': '/kk/moving', 'x-default': '/moving' },
  },
  {
    path: '/blog/kak-vybrat-boks-dlya-hraneniya',
    file: 'blog/kak-vybrat-boks-dlya-hraneniya/index.html',
    title: 'Как выбрать бокс для хранения — гид Extra Space',
    description:
      'Размер бокса, срок аренды, индивидуальное или облачное хранение: краткий гид, как подобрать склад Extra Space в Алматы.',
    h1: 'Как выбрать бокс для хранения вещей в Алматы',
    text: 'От 2 м² до больших боксов: что учесть при аренде кладовки и когда лучше облачное хранение.',
  },
  {
    path: '/blog/hranenie-shin-na-sezon',
    file: 'blog/hranenie-shin-na-sezon/index.html',
    title: 'Хранение шин на сезон в Алматы — советы Extra Space',
    description:
      'Куда убрать зимнюю или летнюю резину: условия хранения, шины с дисками, забор курьером или бокс на складе Extra Space.',
    h1: 'Хранение шин на сезон: где держать комплект в Алматы',
    text: 'Резину лучше хранить без солнца и резких перепадов температуры — на тёплом складе.',
  },
  {
    path: '/blog/hranenie-mebeli-pri-remonte',
    file: 'blog/hranenie-mebeli-pri-remonte/index.html',
    title: 'Хранение мебели при ремонте в Алматы — Extra Space',
    description:
      'Куда деть диван и шкаф на время ремонта: упаковка, мувинг и тёплый склад Extra Space в Алматы.',
    h1: 'Хранение мебели на время ремонта',
    text: 'Ремонт без мебели в центре комнаты: упакуем, перевезём и разместим на складе.',
  },
  {
    path: '/blog/pereezd-i-vremennoe-hranenie',
    file: 'blog/pereezd-i-vremennoe-hranenie/index.html',
    title: 'Переезд + временное хранение в Алматы — Extra Space',
    description:
      'Как совместить мувинг и склад: хранение между квартирами, ожидание ключей и переезд без хаоса.',
    h1: 'Переезд и временное хранение вещей',
    text: 'Между старой и новой квартирой вещи могут подождать на складе.',
  },
  {
    path: '/blog/sklad-dlya-biznesa-i-marketplace',
    file: 'blog/sklad-dlya-biznesa-i-marketplace/index.html',
    title: 'Склад для бизнеса в Алматы — Extra Space',
    description:
      'Ответственное хранение для ИП и ТОО: договор, безнал, архивы, сток маркетплейса на складе Extra Space.',
    h1: 'Склад для бизнеса и товарных остатков',
    text: 'Бокс или облачное хранение под товар и архивы для малого бизнеса.',
  },
  {
    path: '/blog/kamera-hraneniya-na-korotkiy-srok',
    file: 'blog/kamera-hraneniya-na-korotkiy-srok/index.html',
    title: 'Камера хранения в Алматы от 1 дня — Extra Space',
    description:
      'Куда сдать чемодан или коробки на несколько дней: камера хранения Extra Space от 1 дня до 2 недель.',
    h1: 'Камера хранения на короткий срок',
    text: 'Командировка, пересадка, короткий ремонт — хранение посуточно без долгого договора.',
  },
];

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function canonicalFor(path) {
  if (!path || path === '/') return `${ORIGIN}/`;
  return `${ORIGIN}${path}`;
}

function injectSeo(html, route) {
  const canonical = canonicalFor(route.path);
  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(route.title)}</title>`);

  if (/<meta\s+name=["']description["']/i.test(out)) {
    out = out.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${escapeHtml(route.description)}" />`,
    );
  } else {
    out = out.replace(
      /<\/title>/i,
      `</title>\n  <meta name="description" content="${escapeHtml(route.description)}" />`,
    );
  }

  if (/<link\s+rel=["']canonical["']/i.test(out)) {
    out = out.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${canonical}" />`,
    );
  } else {
    out = out.replace(
      /<meta name="description"[^>]*>/i,
      (m) => `${m}\n  <link rel="canonical" href="${canonical}" />`,
    );
  }

  if (route.hreflang) {
    const links = Object.entries(route.hreflang)
      .map(
        ([lang, path]) =>
          `<link rel="alternate" hreflang="${lang}" href="${canonicalFor(path)}" />`,
      )
      .join('\n  ');
    out = out.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      (m) => `${m}\n  ${links}`,
    );
  }

  out = out.replace(
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${canonical}" />`,
  );
  out = out.replace(
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
  );
  out = out.replace(
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
  );
  out = out.replace(
    /<meta\s+name=["']twitter:url["'][^>]*>/i,
    `<meta name="twitter:url" content="${canonical}" />`,
  );
  out = out.replace(
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`,
  );
  out = out.replace(
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`,
  );

  const seoBlock = `
    <noscript>
      <div id="seo-prerender" style="max-width:720px;margin:2rem auto;padding:1rem;font-family:system-ui,sans-serif;color:#202422">
        <h1>${escapeHtml(route.h1)}</h1>
        <p>${escapeHtml(route.text)}</p>
        <p><a href="${ORIGIN}/">Extra Space — хранение вещей в Алматы</a></p>
      </div>
    </noscript>
    <div id="seo-prerender-bot" hidden>
      <h1>${escapeHtml(route.h1)}</h1>
      <p>${escapeHtml(route.text)}</p>
    </div>`;

  if (out.includes('<div id="root"></div>')) {
    out = out.replace('<div id="root"></div>', `${seoBlock}\n    <div id="root"></div>`);
  } else {
    out = out.replace('</body>', `${seoBlock}\n</body>`);
  }

  return out;
}

function main() {
  const templatePath = join(DIST, 'index.html');
  if (!existsSync(templatePath)) {
    console.error('prerender-seo: dist/index.html not found. Run vite build first.');
    process.exit(1);
  }

  const template = readFileSync(templatePath, 'utf8');

  for (const route of ROUTES) {
    const target = join(DIST, route.file);
    mkdirSync(dirname(target), { recursive: true });
    const html = injectSeo(template, route);
    writeFileSync(target, html, 'utf8');
    console.log(`✓ prerender ${route.path} → ${route.file}`);
  }
}

main();
