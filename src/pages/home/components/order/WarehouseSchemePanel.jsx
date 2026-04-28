import React, {memo, useState, useEffect, useCallback} from "react";
import { Dropdown } from "../../../../shared/components/Dropdown.jsx";
import BoxCalculator from "./BoxCalculator.jsx";

function WarehouseSchemePanel({ dropdownItems = [],
                                  selectedWarehouse = "",
                                  setSelectedWarehouse,
                                  mapRef,
                                  renderWarehouseScheme,
                                  storageBoxes = [],
                                  selectedMap = 1,
                                  onHighlightedBoxes,
                                  onBoxSelect,
                                  selectedStorage = null,
                                  canEditBoxName = false,
                                  onRenameStorage,
                                  hideWarehouseDropdown = false,
                                  nameInputId = "home-scheme-box-name",
                              }) {

    const [nameDraft, setNameDraft] = useState("");
    const [savingName, setSavingName] = useState(false);

    useEffect(() => {
        setNameDraft(selectedStorage?.name ?? "");
    }, [selectedStorage?.id, selectedStorage?.name]);

    const showRenameBar = Boolean(
        canEditBoxName &&
        selectedStorage?.id &&
        selectedStorage?.storage_type === "INDIVIDUAL"
    );

    const handleSaveBoxName = useCallback(async () => {
        if (!onRenameStorage || !selectedStorage?.id) return;
        const next = nameDraft.trim();
        if (!next) return;
        if (next === (selectedStorage.name || "").trim()) return;
        setSavingName(true);
        try {
            await onRenameStorage(selectedStorage.id, next);
        } finally {
            setSavingName(false);
        }
    }, [onRenameStorage, selectedStorage?.id, selectedStorage?.name, nameDraft]);

    return (
        <div
            className="rounded-2xl h-[78vh] min-h-[450px] flex flex-col"
            style={{
                background: "linear-gradient(to bottom, #00A991 0%, #31876D 100%)",
                padding: "20px",
                borderRadius: "20px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)",
                position: "relative",
                minHeight: 0,
                overflow: "hidden",
            }}
        >
            {/* header controls */}
            <div
                className="mb-2 flex items-center gap-3 flex-wrap justify-center"
                style={{ position: "relative", zIndex: 1, flexShrink: 0 }}
            >
                {!hideWarehouseDropdown ? (
                <div className="w-fit [&_button]:bg-transparent [&_button]:text-white [&_button]:border-2 [&_button]:border-white [&_button]:rounded-full [&_button]:hover:bg-white/10 [&_svg]:text-white">
                    <Dropdown
                      items={Array.isArray(dropdownItems) ? dropdownItems : []}
                      value={selectedWarehouse ? (selectedWarehouse.id ?? selectedWarehouse.value) : undefined}
                      onChange={(_, item) => setSelectedWarehouse(item)}
                      placeholder="Выберите склад"
                      searchable={false}
                      getKey={(w) => w.id}
                      getLabel={(w) => w.name}
                      getDescription={(w) => w.address}
                      className="bg-transparent text-white border-2 border-white rounded-full hover:bg-white/10 w-auto min-w-[200px]"
                      popoverProps={{ className: "p-0" }}
                    />
                </div>
                ) : (
                <p className="text-center text-white font-semibold px-2 max-w-[min(100%,280px)] truncate" title={selectedWarehouse?.name}>
                    {selectedWarehouse?.name || "Склад"}
                </p>
                )}

                {/* zoom buttons */}
                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={() => mapRef?.current?.zoomIn?.()}
                        className="w-10 h-10 rounded-full bg-[#A8E6CF] text-gray-600 flex items-center justify-center hover:bg-[#90D4B8] transition-colors shadow-md font-bold text-xl"
                        aria-label="Увеличить"
                    >
                        +
                    </button>

                    <button
                        onClick={() => mapRef?.current?.zoomOut?.()}
                        className="w-10 h-10 rounded-full bg-[#A8E6CF] text-gray-600 flex items-center justify-center hover:bg-[#90D4B8] transition-colors shadow-md font-bold text-xl"
                        aria-label="Уменьшить"
                    >
                        −
                    </button>
                </div>
            </div>

            {showRenameBar && (
                <div
                    className="mb-2 flex flex-wrap items-center gap-2 rounded-xl border border-white/40 bg-black/10 px-3 py-2 text-white"
                    style={{ position: "relative", zIndex: 1, flexShrink: 0 }}
                >
                    <label className="text-xs font-medium opacity-90 shrink-0" htmlFor={nameInputId}>
                        Имя бокса
                    </label>
                    <input
                        id={nameInputId}
                        type="text"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        maxLength={50}
                        className="min-w-[120px] flex-1 rounded-lg border border-white/50 bg-white/95 px-2 py-1.5 text-sm text-[#202422] outline-none focus:ring-2 focus:ring-white/80"
                        autoComplete="off"
                        disabled={savingName}
                    />
                    <button
                        type="button"
                        onClick={handleSaveBoxName}
                        disabled={
                            savingName ||
                            !nameDraft.trim() ||
                            nameDraft.trim() === (selectedStorage?.name || "").trim()
                        }
                        className="shrink-0 rounded-lg bg-white/95 px-3 py-1.5 text-sm font-semibold text-[#31876D] shadow disabled:opacity-50 disabled:pointer-events-none hover:bg-white"
                    >
                        {savingName ? "…" : "Сохранить"}
                    </button>
                </div>
            )}

            <BoxCalculator
                storageBoxes={storageBoxes}
                selectedWarehouse={selectedWarehouse}
                selectedMap={selectedMap}
                onHighlightedBoxes={onHighlightedBoxes}
                onBoxSelect={onBoxSelect}
            />

            <div className="flex-1 w-full h-full min-h-0 min-w-0 relative z-0">
                <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
                    {renderWarehouseScheme({ isFullscreen: true })}
                </div>
            </div>
        </div>
    );
}

export default memo(WarehouseSchemePanel);