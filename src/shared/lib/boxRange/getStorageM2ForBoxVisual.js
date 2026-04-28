/**
 * Площадь бокса (м²) для модалки и диапазона картинки.
 * Берутся поля, которые и на главной влияют на расчёт. Если в ответе API приходят
 * несколько значений (например, total 7 и available 4), для визуала берём максимум—
 * номинальный размер ячейки, а не «остаток».
 *
 * @param {object | null | undefined} storage
 * @returns {number | null}
 */
export function getStorageM2ForBoxVisual(storage) {
  if (!storage || typeof storage !== "object") return null;

  const toNum = (v) => {
    if (v === undefined || v === null) return null;
    const n = parseFloat(String(v).replace(",", "."));
    return Number.isNaN(n) || n <= 0 ? null : n;
  };

  const candidates = [
    toNum(storage.total_volume),
    toNum(storage.available_volume),
    toNum(storage.area),
    toNum(storage.square),
    toNum(storage.volume),
  ].filter((x) => x != null);

  if (candidates.length === 0) return null;
  return Math.max(...candidates);
}
