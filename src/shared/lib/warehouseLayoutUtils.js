import megaTowersLayoutData1 from '../../assets/mega-towers-1-storage.json';
import megaTowersLayoutData2 from '../../assets/mega-towers-2-storage.json';
import mainWarehouseLayoutData from '../../assets/Main_Individual_storage.json';
import komfortLayoutData1 from '../../assets/ZHK_Komfort_storage.json';
import komfortLayoutData2 from '../../assets/second_ZHK_Komfort_storage.json';

/**
 * Возвращает имена боксов для текущего яруса склада.
 * @param {string} warehouseName
 * @param {number} selectedMap - 1 или 2
 * @returns {Set<string>} множество имён боксов в нижнем регистре
 */
export function getLayoutBoxNames(warehouseName, selectedMap = 1) {
  const name = (warehouseName || '').toLowerCase();
  const mapNum = selectedMap || 1;

  let layoutData;
  if (name.includes('mega')) {
    layoutData = mapNum === 1 ? megaTowersLayoutData1 : megaTowersLayoutData2;
  } else if (name.includes('есентай') || name.includes('esentai')) {
    layoutData = mainWarehouseLayoutData;
  } else if (name.includes('комфорт') || name.includes('komfort')) {
    layoutData = mapNum === 1 ? komfortLayoutData1 : komfortLayoutData2;
  } else {
    layoutData = megaTowersLayoutData1;
  }

  const names = new Set();
  (layoutData || []).forEach((box) => {
    if (box?.name) names.add(box.name.toLowerCase());
  });
  return names;
}
