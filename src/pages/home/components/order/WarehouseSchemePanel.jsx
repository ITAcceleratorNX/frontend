import React, {memo} from "react";
import { Dropdown } from "../../../../shared/components/Dropdown.jsx";

function WarehouseSchemePanel({ dropdownItems = [],
                                  selectedWarehouse = "",
                                  setSelectedWarehouse,
                                  mapRef,
                                  renderWarehouseScheme,
                              }) {

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
                className="mb-4 flex items-center gap-3 flex-wrap justify-center"
                style={{ position: "relative", zIndex: 1, flexShrink: 0 }}
            >
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

            {/* map */}
            <div className="flex-1 w-full h-full" style={{ minHeight: 0, minWidth: 0, position: "relative", zIndex: 0 }}>
                <div style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
                    {renderWarehouseScheme({ isFullscreen: true })}
                </div>
            </div>
        </div>
    );
}

export default memo(WarehouseSchemePanel);