/**
 * Ключ ячейки на SVG-схеме: совпадает с `name` в JSON (mega/komfort и т.д.).
 * Отображаемое имя бокса — `storage.name`; при переименовании в БД меняется только оно.
 */
export function storageLayoutSlot(storage) {
  if (!storage) return "";
  const slot = storage.scheme_slot;
  if (slot != null && String(slot).trim() !== "") return String(slot).trim();
  return String(storage.name || "").trim();
}

export function storageMatchesLayoutSlot(storage, layoutSlotName) {
  if (!storage || layoutSlotName == null) return false;
  return (
    storageLayoutSlot(storage).toLowerCase() ===
    String(layoutSlotName).toLowerCase()
  );
}
