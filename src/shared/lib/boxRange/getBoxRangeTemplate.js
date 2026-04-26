/**
 * @param {number} sizeM2
 * @returns {import('./boxRangeTemplates.js').BoxRangeTemplateKey}
 */
export function getBoxRangeTemplate(sizeM2) {
  const n = typeof sizeM2 === "string" ? parseFloat(String(sizeM2).replace(",", ".")) : Number(sizeM2);

  if (Number.isNaN(n) || n <= 0) {
    if (import.meta.env.DEV) {
      console.warn(
        "[getBoxRangeTemplate] некорректная площадь, используется range_2:",
        sizeM2
      );
    }
    return "range_2";
  }

  const inDocRange = n >= 2 && n <= 15;
  if (!inDocRange && import.meta.env.DEV) {
    console.warn(
      "[getBoxRangeTemplate] площадь вне таблицы 2–15 м², взят ближайший диапазон:",
      n
    );
  }

  if (n < 2.5) return "range_2";
  if (n < 3.5) return "range_3";
  if (n < 5.5) return "range_4_5";
  if (n < 8.5) return "range_6_8";
  if (n < 12.5) return "range_9_12";
  return "range_13_15";
}
