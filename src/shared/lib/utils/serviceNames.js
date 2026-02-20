/**
 * Убирает габариты вида 60*40*40, 60×40×40 и т.д. из описания услуги.
 * Оставляет только текст в скобках (120 мм), (шт) и т.п.
 * @param {string} desc - Описание услуги
 * @returns {string} - Отформатированное описание без габаритов
 */
export const formatServiceDescription = (desc) => {
  if (!desc || typeof desc !== "string") return desc || "";
  let result = desc.replace(/\d+\s*[*×xX]\s*\d+\s*[*×xX]\s*\d+/g, "").trim();
  // Замена для Заказанных услуг в личном кабинете менеджера
  result = result.replace(/Газель - забор вещей\s*(\(с клиента на склад\))?/g, "Газель - доставка (с клиента на склад)");
  return result;
};

/**
 * Утилита для получения человекочитаемых названий типов услуг
 * @param {string} type - Тип услуги
 * @returns {string} - Название услуги на русском языке
 */
export const getServiceTypeName = (type) => {
  if (!type) return "Услуга";

  const serviceNames = {
    // Основные услуги
    LOADER: "Грузчик",
    PACKER: "Упаковщик",
    FURNITURE_SPECIALIST: "Мебельщик",
    
    // Услуги перевозки
    GAZELLE: "Газель",
    GAZELLE_FROM: "Газель - Доставка",
    GAZELLE_TO: "Газель - возврат вещей",
    
    // Упаковочные материалы
    STRETCH_FILM: "Стрейч-плёнка",
    BOX_SIZE: "Коробка",
    MARKER: "Маркер",
    UTILITY_KNIFE: "Канцелярский нож",
    BUBBLE_WRAP_1: "Воздушно-пузырчатая плёнка 10м",
    BUBBLE_WRAP_2: "Воздушно-пузырчатая плёнка 120м",
    
    // Типы хранения
    RACK_RENTAL: "Аренда стеллажей",
    RACK: "Стеллажное хранение",
    INDIVIDUAL: "Индивидуальное хранение",
    CLOUD: "Облачное хранение",
    MOVING: "Услуга переезда",
    DEPOSIT: "Депозит",
    
    // Цена за м² и за м³ (одна ставка из тарифов склада)
    M2: "Цена за 1 м² в месяц",
    CLOUD_M3: "Цена за 1 м³ в месяц (облачное хранение)",
  };

  return serviceNames[type] || "Услуга";
};

