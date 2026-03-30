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
  // Совпадает с бэкендом: end_date = start_date + storage_days (Luxon)
  end.setDate(end.getDate() + days);
  const yy = end.getFullYear();
  const mm = String(end.getMonth() + 1).padStart(2, "0");
  const dd = String(end.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
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
