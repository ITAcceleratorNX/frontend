import React, { memo } from "react";
import WarehouseMap from "../../../components/WarehouseMap";

function BranchesSection({ warehouses }) {
    return (
        <section className="w-full bg-[#F7FAF9] pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-24 lg:pb-28">

            <div className="w-full px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 text-center">
                <h1 className="font-sf-pro-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-[#202422] mb-6 sm:mb-8">
                    филиалы
                </h1>

                <p className="text-sm sm:text-base text-[#555A65]">
                    Выберите удобный филиал рядом с домом
                </p>
            </div>

            {/* Карта */}
            <div className="w-full mb-12 sm:mb-16">
                <div style={{ width: "100%", height: "600px" }}>
                    <WarehouseMap warehouses={warehouses} mapId="home-branches-map" />
                </div>
            </div>

        </section>
    );
}

export default memo(BranchesSection);