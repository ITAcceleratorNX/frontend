/**
 * TipTop Pay — оплата только через виджет на сайте.
 * API не возвращает payment_page_url; открываем виджет с параметрами от бэкенда.
 * Документация: https://developers.tiptoppay.kz — «Платежный виджет».
 */

const WIDGET_SCRIPT_URL = 'https://widget.tiptoppay.kz/bundles/widget.js';

function isWidgetLoaded() {
  return typeof window !== 'undefined' && window.tiptop && window.tiptop.Widget;
}

/**
 * Загружает скрипт виджета, если ещё не загружен.
 * @returns {Promise<void>}
 */
function loadWidgetScript() {
  if (isWidgetLoaded()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${WIDGET_SCRIPT_URL}"]`);
    if (existing) {
      const check = () => (isWidgetLoaded() ? resolve() : setTimeout(check, 50));
      check();
      return;
    }
    const script = document.createElement('script');
    script.src = WIDGET_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('TipTop Pay widget script failed to load'));
    document.head.appendChild(script);
  });
}

/**
 * Открывает платёжный виджет TipTop Pay с переданными параметрами.
 * @param {Object} params - Параметры для widget.start() (publicTerminalId, amount, currency, description, externalId, accountId, successRedirectUrl, failRedirectUrl, tokenize, culture, emailBehavior и др.)
 * @returns {Promise<{ status: string, transactionId?: number }>} - Результат виджета (success/fail)
 */
export function openTipTopPayWidget(params) {
  if (!params || !params.publicTerminalId || params.amount == null) {
    return Promise.reject(new Error('Invalid widget params: publicTerminalId and amount are required'));
  }

  return loadWidgetScript().then(() => {
    const Widget = window.tiptop.Widget;
    const widget = new Widget();
    return widget.start(params);
  });
}
