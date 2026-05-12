Промпт для фронт-разработки: LP-1 ExtraSpace (пилот)
Контекст
Делаем 1 пилотный посадочный лендинг для Google Ads трафика на существующем сайте extraspace.kz (Vite SPA). После сдачи и проверки — логика переносится на 2 других LP. Доступа к бэку нет — вся логика на фронте, для CRM подготавливаем готовый payload и абстрактный submit-метод (заглушка), который бэк-команда позже заменит на реальный endpoint.
Стек и интеграция

Vite SPA (существующий проект extraspace.kz)
Используем существующую дизайн-систему сайта (компоненты, цвета, шрифты, лого из header)
Ассеты переиспользуем из /assets/ (фото складов 20260226-IMG_5194-...webp и т.д., обложка indiv_obloshka-...png)
Изоляция от основного сайта: новый роут /lp/arenda-boksa-almaty, не в основном меню, не в sitemap.xml

Задача 1 — Роут и мета
Создать страницу по URL /lp/arenda-boksa-almaty:

<title>: Аренда бокса в Алматы от 6 000 ₸/м² · ExtraSpace
<meta name="description">: Свой бокс с климат-контролем, охраной 24/7. От 1 месяца. 2 филиала в черте Алматы. Бронь онлайн без визита.
<meta name="robots" content="noindex,nofollow">
<link rel="canonical" href="https://extraspace.kz/lp/arenda-boksa-almaty">
Open Graph + Twitter Card (картинка 1200×630, открытые)
Schema.org LocalBusiness JSON-LD с двумя филиалами:

Кекилбайулы 270 блок 4
Серкебаева 146/3
Телефон: +7 778 391 1425



Использовать react-helmet-async или аналог (что уже стоит в проекте). Убедиться, что страница НЕ попадает в sitemap.xml.
Задача 2 — Структура страницы (top-to-bottom)
Все секции — отдельные компоненты. Mobile-first. Якоря для anchor-deeplink из рекламы.

Hero — H1 «Аренда бокса в Алматы от 6 000 ₸/м²», подзаголовок, CTA «Забронировать бокс онлайн» (primary) + «Показать номер» (secondary, запускает phone gating). Фон — фото из существующих ассетов.
Trust strip — 4 пиктограммы в строку: климат-контроль / охрана 24/7 / страхование / в черте города.
Кому подходит — 4 карточки с anchor-якорями: #remont, #pereezd, #shiny, #biznes.
Размеры боксов — 6 карточек (2/4/6/10/15/25 м²) с ценами и CTA «Забронировать [X] м²». Карточка 6 м² — с бейджем «⭐ популярное».
Калькулятор объёма — слайдер «комнат / м³» → подсказка размера + цены (если есть готовый компонент в существующем сайте — переиспользовать; если нет — пропустить, оставить TODO).
Как работает — 4 шага.
Гео-блок — 2 филиала, embed 2GIS (или Google Maps fallback), кнопки «Построить маршрут» и «Открыть в 2GIS».
Mini-form секция — заголовок «Хотите подобрать бокс? Мы перезвоним», встроенная форма (без модалки, для повышения CR).
FAQ — 7 вопросов в accordion.
Финальный CTA — большая кнопка «Забронировать бокс онлайн» + WhatsApp.

Задача 3 — Phone gating (КРИТИЧНО)
Никаких прямых <a href="tel:..."> или открытого номера в первом экране.
Поведение кнопки «Показать номер»:

Клик → открывается модалка с формой (имя + телефон + чекбокс согласия + кнопка «Отправить»).
Поле телефон — с маской +7 (___) ___-__-__ (использовать imask или react-input-mask).
Валидация: имя min 2 chars, телефон обязателен в формате +7XXXXXXXXXX, чекбокс должен быть true.
После успешного submit — модалка переключается во второе состояние:

Показывает номер +7 778 391 1425
Кнопка «Позвонить» (<a href="tel:+77783911425">)
Кнопка «Написать в WhatsApp» (https://wa.me/77783911425)


Параллельно с UI — вызов submitLead(payload) (см. Задачу 5).

Та же форма используется в Задаче 2 пункте 8 (встроенный mini-form), но без модалки — сразу inline.
Задача 4 — UTM/GCLID attribution (localStorage)
Создать модуль src/lib/attribution.ts:
typescriptconst STORAGE_KEY = 'extraspace_attribution';
const TTL_DAYS = 90;

interface Attribution {
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  first_visit_at: string;
  last_visit_at: string;
  landing_page: string;
  referrer: string;
}
Логика на загрузку любой LP:

Парсим window.location.search — ищем gclid, utm_*.
Читаем localStorage по ключу extraspace_attribution.
Если есть запись и она младше 90 дней И в URL нет нового gclid/utm:

Обновляем только last_visit_at.
gclid, utm_*, first_visit_at, landing_page — НЕ трогаем (first-touch).


Если в URL есть новый gclid или utm:

Перезаписываем все поля (last-click для повторных кликов из рекламы).


Если запись старше 90 дней или её нет:

Создаём новую запись со всеми текущими параметрами.



Экспорт двух функций:

initAttribution() — вызывать в корневом компоненте LP при mount.
getAttribution(): Attribution | null — вызывать при submit формы.

Задача 5 — Submit формы (заглушка под бэк)
Создать src/lib/submitLead.ts:
typescriptinterface LeadPayload {
  name: string;
  phone: string;
  service_type: 'individual' | 'camera' | 'cloud';
  client_type?: 'b2c' | 'b2b'; // только для LP-3
  landing_page: string;
  page_section: string; // 'hero' | 'mini_form' | 'final_cta' и т.д.
  gclid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  first_visit_at?: string;
  submitted_at: string;
  user_agent: string;
  referrer: string;
}

export async function submitLead(payload: LeadPayload): Promise<{ ok: boolean }> {
  // TODO: заменить на реальный endpoint когда бэк будет готов
  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT || '/api/leads';
  
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok };
  } catch (e) {
    console.error('[submitLead] failed', e, payload);
    // На время отсутствия бэка — логируем payload в console + dataLayer
    // чтобы можно было проверить корректность сборки данных
    return { ok: false };
  }
}
Endpoint вынести в .env через VITE_LEAD_ENDPOINT — бэк позже подставит реальный URL без правки кода.
Защита от ботов на фронте:

Honeypot-поле в форме (скрытое через CSS position:absolute; left:-9999px, tabindex="-1", autocomplete="off"). Если заполнено — submit не вызываем, делаем вид что всё ок.
Rate limit на клиенте: после успешного submit блокируем повторный submit на 60 секунд (хранить timestamp в sessionStorage). На сервере дублировать обязательно, но это уже бэк.
reCAPTCHA НЕ ставить — по ТЗ ломает CR на мобилке.

Задача 6 — GTM dataLayer события
Создать src/lib/analytics.ts с обёрткой:
typescriptexport function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
}
8 событий, которые надо триггерить:
#EventГдеПараметры1page_viewавтоматически GTMстандартные2phone_clickклик «Показать номер» (до открытия модалки)landing_page, section3phone_revealedпосле успешного submit, момент раскрытия номераlanding_page, service_type4whatsapp_clickклик WhatsApp кнопкиlanding_page, section5form_startfocus на первом поле формы (один раз за форму)form_id6form_submit_leadуспешный ответ от submitLeadвесь payload7booking_clickклик любой кнопки «Забронировать»service_type, box_size (если из карточки)8cta_route_buildклик «Построить маршрут»branch: 'kekilbayuly' | 'serkebayev'
GTM Container ID — вынести в .env (VITE_GTM_ID). Подключить GTM скрипт в index.html через шаблон с подстановкой ID на build-time, либо через react-gtm-module.
Задача 7 — Производительность

Все картинки — WebP, через <img loading="lazy"> (кроме hero — eager + fetchpriority="high").
Шрифты — <link rel="preload"> + font-display: swap.
Embed 2GIS — lazy-load через IntersectionObserver (загружать iframe только когда секция входит во viewport, иначе тянет ~500kb на каждый embed).
Целевые метрики (проверять через PageSpeed Insights mobile):

PSI mobile ≥ 85
LCP < 2.5s
CLS < 0.1
INP < 200ms



Задача 8 — Адаптив
Mobile-first, breakpoints: 320px / 375px / 768px / 1024px / 1440px. Проверить:

Никакого horizontal overflow на 320px.
Кнопки CTA — минимум 44px по высоте (touch target).
Модалка phone gating — full-screen на мобилке.


Структура файлов (рекомендация)
src/
  pages/
    lp/
      ArendaBoksaAlmaty/
        index.tsx
        Hero.tsx
        TrustStrip.tsx
        UseCases.tsx
        BoxSizes.tsx
        VolumeCalculator.tsx
        HowItWorks.tsx
        Branches.tsx
        MiniForm.tsx
        FAQ.tsx
        FinalCTA.tsx
        styles.module.css
  components/
    PhoneGatingModal/
    LeadForm/             // переиспользуется в модалке и inline
    PhoneMaskedInput/
    BranchMap/            // 2GIS embed с lazy-load
  lib/
    attribution.ts
    submitLead.ts
    analytics.ts
    phoneFormat.ts