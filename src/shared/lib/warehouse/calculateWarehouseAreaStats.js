const getBoxAreaM2 = (storage) => {
  const area = parseFloat(storage?.total_volume);
  return !Number.isNaN(area) && area > 0 ? area : 0;
};

export const calculateWarehouseAreaStats = (storageList, { warehouseType } = {}) => {
  const empty = { total: 0, free: 0, occupied: 0, freePercent: 0, occupiedPercent: 0 };

  if (!Array.isArray(storageList) || storageList.length === 0) {
    return empty;
  }

  if (warehouseType === 'CLOUD') {
    const cloudStorage = storageList[0];
    if (!cloudStorage) return empty;

    const total = getBoxAreaM2(cloudStorage);
    const free = parseFloat(cloudStorage.available_volume) || 0;
    const occupied = Math.max(0, total - free);
    const freePercent = total > 0 ? Math.round((free / total) * 100) : 0;
    const occupiedPercent = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return { total, free, occupied, freePercent, occupiedPercent };
  }

  let total = 0;
  let free = 0;
  let occupied = 0;

  const boxes = storageList.filter(
    (s) => !s.storage_type || s.storage_type === 'INDIVIDUAL'
  );

  for (const storage of boxes) {
    const area = getBoxAreaM2(storage);
    if (area <= 0) continue;

    total += area;
    if (storage.status === 'VACANT') {
      free += area;
    } else if (storage.status === 'OCCUPIED') {
      occupied += area;
    }
  }

  const freePercent = total > 0 ? Math.round((free / total) * 100) : 0;
  const occupiedPercent = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return { total, free, occupied, freePercent, occupiedPercent };
};

export const calculateAllWarehousesAreaStats = (warehouses) => {
  const empty = { total: 0, free: 0, occupied: 0, freePercent: 0, occupiedPercent: 0 };

  if (!Array.isArray(warehouses) || warehouses.length === 0) {
    return empty;
  }

  let total = 0;
  let free = 0;
  let occupied = 0;

  for (const warehouse of warehouses) {
    const stats = calculateWarehouseAreaStats(warehouse.storage, {
      warehouseType: warehouse.type,
    });
    total += stats.total;
    free += stats.free;
    occupied += stats.occupied;
  }

  const freePercent = total > 0 ? Math.round((free / total) * 100) : 0;
  const occupiedPercent = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return { total, free, occupied, freePercent, occupiedPercent };
};

export const formatAreaM2 = (m2) => `${Math.round(m2)} м²`;

export const formatAreaWithPercent = (m2, percent) =>
  `${Math.round(m2)} м² / ${percent}%`;
