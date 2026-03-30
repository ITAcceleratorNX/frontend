/**
 * Расчёт даты окончания и стоимости для камер хранения (краткосрочная аренда).
 */

/**
 * @param {string} startDateISO - YYYY-MM-DD
 * @param {number} days - длительность в днях (≥1)
 * @returns {string|null} YYYY-MM-DD или null
 */
export function computeLockerEndDateISO(startDateISO, days) {
  if (!startDateISO || typeof startDateISO !== "string" || days < 1) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDateISO.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const start = new Date(y, mo - 1, d);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setDate(end.getDate() + (days - 1));
  const yy = end.getFullYear();
  const mm = String(end.getMonth() + 1).padStart(2, "0");
  const dd = String(end.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * @param {number} volumeM3 - 1–4
 * @param {number} days - 1–14
 * @returns {number}
 */
export function computeLockerTotalPrice(volumeM3, days) {
  const v = Number(volumeM3);
  const n = Math.floor(Number(days));
  if (!Number.isFinite(v) || v < 1 || !Number.isFinite(n) || n < 1) return 0;
  if (n === 1) return Math.round(v * 4000);
  return Math.round(v * n * 3000);
}

/**
 * @param {string} startDateISO
 * @returns {boolean} true если дата строго раньше сегодня (локальный календарь)
 */
export function isStartDateInPast(startDateISO, todayISO) {
  if (!startDateISO || !todayISO) return false;
  return startDateISO < todayISO;
}

export function formatLockerPriceKzt(amount) {
  const n = Math.round(Number(amount) || 0);
  return `${n.toLocaleString("ru-RU").replace(/,/g, " ")} ₸`;
}
