import React, { memo } from "react";
import WarehouseMap from "../../../components/WarehouseMap";

function BranchesSection({ warehouses }) {
    const primaryPhone = warehouses?.[0]?.phone ?? "+7 778 391 1425";
    const waPhone = primaryPhone.replace(/\D/g, "");

    return (
        <section className="w-full bg-[#F7FAF9] pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-24 lg:pb-28">

            <div className="w-full px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 text-center">
                <h1 className="font-soyuz-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#202422] mb-6 sm:mb-8">
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

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[#DCE7E3] bg-white p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-[#5C625F]">Телефон</p>
                        <a href={`tel:${primaryPhone}`} className="mt-1 block font-semibold text-[#202422] hover:text-[#31876D]">
                            {primaryPhone}
                        </a>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-[#5C625F]">WhatsApp</p>
                        <a
                            href={`https://wa.me/${waPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block font-semibold text-[#202422] hover:text-[#31876D]"
                        >
                            Написать в WhatsApp
                        </a>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-[#5C625F]">График</p>
                        <p className="mt-1 font-semibold text-[#202422]">Круглосуточно</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-[#5C625F]">Маршрут в 2ГИС</p>
                        <a
                            href="https://2gis.kz/almaty/search/Extra%20Space"
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block font-semibold text-[#202422] hover:text-[#31876D]"
                        >
                            Открыть маршрут
                        </a>
                    </div>
                </div>
            </div>

        </section>
    );
}

export default memo(BranchesSection);