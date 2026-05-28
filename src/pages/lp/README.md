# Landing Pages (LP) для PPC-трафика

Три изолированные посадочные страницы для контекстной рекламы Google Ads:

| URL | Тип услуги | `service_type` |
|---|---|---|
| `/lp/arenda-boksa-almaty` | Индивидуальное хранение (от 1 мес.) | `individual` |
| `/lp/kamera-hraneniya-almaty` | Камера хранения (от 1 дня) | `camera` |
| `/lp/oblachnoe-hranenie-almaty` | Облачное хранение (B2C + B2B) | `cloud` |

## Изоляция

- Не попадают в `sitemap.xml` (если будете его генерировать — исключайте `/lp/*`).
- На каждой LP стоит `<meta name="robots" content="noindex,nofollow">` (см. `LpHelmet.jsx`).
- Основное меню сайта на LP не подключено — у LP свой минимальный header/footer.
- Лениво загружаются (`React.lazy`) — не утяжеляют основной бандл.

## Phone gating (ТЗ §3.4)

Прямых `tel:` ссылок и открытого номера на первом экране нет. Кнопка «Показать номер» открывает модалку (`PhoneGatingModal`), а после успешного `submitLead` — раскрывает номер `+7 778 391-14-25` плюс кнопки «Позвонить» и «WhatsApp». Параллельно отправляется заявка с GCLID/UTM в CRM.

## GCLID / UTM attribution (ТЗ §3.6)

`src/shared/lib/attribution.js` — отдельное хранилище под ключом `extraspace_attribution` (не пересекается с легасным `extraspace_utm_params`).

- TTL 90 дней.
- Captures: `gclid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `first_visit_at`, `last_visit_at`, `landing_page`, `referrer`.
- First-touch + last-click: первый визит сохраняется навсегда (на 90 дней), при новом GCLID/UTM запись перезаписывается.
- `initAttribution()` вызывается в `main.jsx` СИНХРОННО до любых React-эффектов — чтобы захватить `utm_*` ДО того, как глобальный `cleanUrlFromUtm()` в `App` их вычистит.

## Submit заявки (ТЗ §3.5)

`src/shared/lib/submitLead.js`:

- Запрос идёт на `VITE_LEAD_ENDPOINT` (если задан) или fallback на существующий `/submit-lead`.
- Payload включает форму + аттрибуцию + meta (UA, referrer, submitted_at).
- Honeypot-поле `company_website` в `LeadForm` — отсекаем ботов на клиенте.
- Rate limit: 1 успешный submit / 60 секунд / браузер (sessionStorage). Обязательно дублировать на бэке.
- reCAPTCHA НЕ используем (ломает CR на мобилке — см. ТЗ §3.5).

## GTM / GA4 события (ТЗ §7)

`src/shared/lib/analytics.js` пушит 8 событий в `window.dataLayer`:

| Событие | Когда | Параметры |
|---|---|---|
| `phone_click` | Клик «Показать номер» | `landing_page`, `section`, `service_type` |
| `phone_revealed` | После успешного submit (раскрытие номера) | `landing_page`, `service_type`, `section` |
| `whatsapp_click` | Клик WhatsApp кнопки | `landing_page`, `section`, `service_type` |
| `form_start` | Первый focus на форме | `form_id`, `service_type` |
| `form_submit_lead` | Успешный submit (вся payload) | `name`, `phone`, `service_type`, GCLID/UTM, ... |
| `booking_click` | Любая кнопка «Забронировать» | `service_type`, `box_size`, `section` |
| `cta_route_build` | «Построить маршрут» в гео-блоке | `branch` (kekilbayuly / serkebayev), `landing_page` |

GTM-контейнер `GTM-KC2QCVNN` подключён напрямую в `frontend/index.html` (head + noscript) — покрывает и главную, и все 3 LP без env-переменных. Любой push через `trackEvent` сразу попадает в dataLayer и читается контейнером.

На кнопке «Показать номер» (компонент `PhoneGatingButton`) стоит класс `btn-show-phone` — на случай если PM в GTM захочет ловить триггером по классу. Сейчас триггер настраивается на custom event `phone_click` (из dataLayer) — это надёжнее, click-trigger по классу — fallback.

В Google Ads настройте `form_submit_lead` как PRIMARY conversion, остальные — secondary (см. ТЗ §7).

## Configurable env vars

См. `frontend/.env.example`. Минимум для прода:

```
VITE_LEAD_ENDPOINT=http://localhost:8080/api/lp-leads
VITE_2GIS_API_KEY=<2gis_api_key>
```

## Тесты приёмки (ТЗ §8)

1. Открыть `/lp/arenda-boksa-almaty?gclid=test123&utm_source=google&utm_medium=cpc&utm_campaign=test` → отправить форму → в CRM пришла заявка с этими параметрами.
2. `localStorage.getItem('extraspace_attribution')` сохраняется при первом визите и подтягивается при submit на любой странице.
3. Заполнить honeypot-поле через DevTools (имя `company_website`) → `submit` ушёл без сетевого запроса (видно в Network), но UI показал успех.
4. Дважды быстро отправить форму → второй раз получаем сообщение «Заявка уже отправлена. Подождите минуту».
5. В DevTools: `window.dataLayer` содержит 8 событий после прохождения сценария.
6. `<meta name="robots" content="noindex,nofollow">` на каждой LP (DevTools → Elements → head).
7. JSON-LD валидируется на https://search.google.com/test/rich-results.

## Структура

```
src/pages/lp/
├── components/                  # переиспользуемые блоки для всех 3 LP
│   ├── Branches.jsx              # 2 филиала + карта
│   ├── CtaButtons.jsx            # PhoneGatingButton / WhatsAppButton / BookingCtaButton
│   ├── FAQAccordion.jsx
│   ├── LeadForm.jsx              # имя + телефон + honeypot + согласие
│   ├── LpFooter.jsx
│   ├── LpHeader.jsx
│   ├── LpHelmet.jsx              # title/meta/canonical/JSON-LD
│   ├── LpLayout.jsx              # init attribution + GTM + анкоры
│   ├── MiniFormSection.jsx       # inline mini-form (выше CR чем модалка)
│   ├── PhoneGatingModal.jsx      # модалка phone gating (state machine)
│   └── TwoGisMap.jsx             # 2GIS карта с lazy-load (IntersectionObserver)
├── ArendaBoksaAlmaty/            # LP-1
│   ├── index.jsx
│   └── VolumeCalculator.jsx
├── KameraHraneniyaAlmaty/        # LP-2
│   └── index.jsx
└── OblachnoeHranenieAlmaty/      # LP-3
    └── index.jsx
```
