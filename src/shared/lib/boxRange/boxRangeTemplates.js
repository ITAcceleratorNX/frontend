/**
 * Шаблоны вместимости бокса (текст один для обоих складов, картинки — по складу/высоте).
 * @typedef {'range_2'|'range_3'|'range_4_5'|'range_6_8'|'range_9_12'|'range_13_15'} BoxRangeTemplateKey
 */

import img2m from "../../../imageformap/2m.png";
import img3m from "../../../imageformap/3m.png";
import img4_5m from "../../../imageformap/4-5m.png";
import img6_8m from "../../../imageformap/6-8m.png";
import img9_12m from "../../../imageformap/9-12m.png";
import img12_15m from "../../../imageformap/12-15m.png";

/**
 * Статичные картинки в `src/imageformap/`. Сейчас одна сетка на диапазон; варианты
 * для Mega/Comfort — второй клюш при появлении отдельных файлов.
 */
const RANGE_IMAGES = {
  range_2: img2m,
  range_3: img3m,
  range_4_5: img4_5m,
  range_6_8: img6_8m,
  range_9_12: img9_12m,
  range_13_15: img12_15m,
};

export const BOX_RANGE_TEMPLATES = {
  range_2: {
    sizes: [2],
    items:
      "6–8 коробок, 2–3 чемодана, складной стул или кресло, небольшая тумба, шины, сезонные вещи, спортинвентарь",
  },
  range_3: {
    sizes: [3],
    items:
      "8–12 коробок, 2–4 чемодана, велосипед, тумба или комод, стул/кресло, мелкая бытовая техника, сезонные вещи",
  },
  range_4_5: {
    sizes: [4, 5],
    items:
      "диван или матрас, комод, 10–15 коробок, чемоданы, стулья, телевизор, мелкая техника, велосипед, домашние вещи",
  },
  range_6_8: {
    sizes: [6, 7, 8],
    items:
      "диван, кровать или матрас, шкаф в разборе, стол, стулья, комод, бытовая техника, 15–25 коробок, чемоданы, велосипеды",
  },
  range_9_12: {
    sizes: [9, 10, 11, 12],
    items:
      "диван, кровать, матрас, шкафы в разборе, стол, стулья, холодильник, стиральная машина, телевизор, 25–40 коробок, чемоданы, велосипеды",
  },
  range_13_15: {
    sizes: [13, 14, 15],
    items:
      "несколько крупных предметов мебели, кровати, матрасы, шкафы в разборе, диван, столы, стулья, крупная бытовая техника, 40+ коробок, чемоданы, велосипеды и прочие домашние вещи",
  },
};

/**
 * URL картинки (после сборки Vite — абсолютный путь к ассету).
 * @param {BoxRangeTemplateKey} templateKey
 * @param {boolean} [isMegaTowers] — зарезервировано, когда появятся отдельные кадры «высотного» склада
 * @returns {string}
 */
export function getBoxRangeImageUrl(templateKey, _isMegaTowers = false) {
  // при появлении отдельных кадров для Mega: выбирать по _isMegaTowers
  return RANGE_IMAGES[templateKey] ?? RANGE_IMAGES.range_2;
}

export function isMegaTowersWarehouse(warehouse) {
  if (!warehouse?.name || typeof warehouse.name !== "string") return false;
  return warehouse.name.toLowerCase().includes("mega");
}
