# Open Graph картинки для LP

Положите сюда 3 файла — они будут показываться в превью при шаринге ссылки в WhatsApp / Telegram / Facebook / Twitter:

| Файл (в `LpHelmet` — URL с `.png`) | LP | Размер | Что должно быть на картинке |
|---|---|---|---|
| `lp-arenda-boksa.png` | `/lp/arenda-boksa-almaty` | 1200×630 | Фото бокса/склада + лого ExtraSpace + цена «от 6 000 ₸/м²» |
| `lp-kamera-hraneniya.png` | `/lp/kamera-hraneniya-almaty` | 1200×630 | Фото с чемоданами на полке + лого + «От 1 дня» |
| `lp-oblachnoe.png` | `/lp/oblachnoe-hranenie-almaty` | 1200×630 | Курьер забирает коробки + лого + «От 6 000 ₸/мес» |

## Технические требования

- Формат: PNG или JPG (PNG рекомендуем для логотипа без потерь).
- Размер: ровно 1200 × 630 пикселей (рекомендация Open Graph).
- Вес: до 300 КБ (иначе мессенджеры могут отказаться загружать превью).
- Безопасная зона: важный текст не выходить ближе 60 px от краёв (некоторые мессенджеры обрезают).

## Если файлов нет — что происходит?

В коде LP передаётся относительный путь вида `/og/lp-*.png`. `LpHelmet` через `resolveOgUrl` подставляет полный URL в `<meta property="og:image">` (в dev — `http://localhost:5173`, на проде — `https://extraspace.kz`). Имена файлов в `public/og/` должны совпадать.

## Как тестировать превью

1. WhatsApp: вставьте ссылку в чат самому себе — превью генерируется в течение нескольких секунд.
2. Telegram: то же самое.
3. Facebook Debugger: https://developers.facebook.com/tools/debug/
4. Twitter Card Validator: https://cards-dev.twitter.com/validator
