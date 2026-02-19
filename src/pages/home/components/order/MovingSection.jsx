import React from 'react';
import { Truck } from 'lucide-react';
import { Switch } from '../../../../components/ui';
import DatePicker from '../../../../shared/ui/DatePicker';
import { getTodayLocalDateString } from '../../../../shared/lib/utils/date';

export default function MovingSection({
                                          includeMoving,
                                          setIncludeMoving,
                                          previewStorage,
                                          movingPickupDate,
                                          setMovingPickupDate,
                                          movingStreetFrom,
                                          setMovingStreetFrom,
                                          movingHouseFrom,
                                          setMovingHouseFrom,
                                          movingFloorFrom,
                                          setMovingFloorFrom,
                                          movingApartmentFrom,
                                          setMovingApartmentFrom,
                                          ensureServiceOptions,
                                      }) {
    return (
        <>
            {/* Перевозка вещей */}
            <div className="flex items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-3xl px-4 py-3 bg-transparent h-12">
                    <span className="text-base font-medium text-[#373737]">Перевозка вещей</span>
                    <Truck className="w-5 h-5 text-[#373737]" />
                </div>
                <Switch
                    checked={includeMoving}
                    onCheckedChange={async (checked) => {
                        setIncludeMoving(checked);
                        if (checked) {
                            await ensureServiceOptions();
                        } else {
                            setMovingStreetFrom("");
                            setMovingHouseFrom("");
                            setMovingFloorFrom("");
                            setMovingApartmentFrom("");
                        }
                    }}
                    className="bg-gray-300 data-[state=checked]:bg-[#00A991]"
                />
            </div>

            {/* Детали перевозки */}
            {includeMoving && previewStorage && (
                <div className="mb-6 bg-white rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 w-full max-w-full">
                    <h3 className="text-xl font-bold text-[#373737]">Детали перевозки</h3>
                    <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <DatePicker
                                value={movingPickupDate}
                                onChange={(value) => setMovingPickupDate(value)}
                                minDate={getTodayLocalDateString()}
                                allowFutureDates={true}
                                placeholder="Дата доставки"
                                className="[&>div]:bg-white [&>div]:border [&>div]:border-gray-200 [&>div]:rounded-3xl [&_input]:text-[#373737] [&_input]:placeholder:text-gray-400 [&_label]:text-[#373737] [&_button]:text-[#373737] [&_button]:hover:text-[#373737] [&_button]:hover:bg-transparent [&_button]:hover:!-translate-y-1/2 [&_button]:hover:!top-1/2 [&_button]:transition-none [&_button]:cursor-pointer [&>div]:focus-within:ring-2 [&>div]:focus-within:ring-gray-200 [&>div]:focus-within:border-gray-300"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm font-medium text-[#373737]">Адрес доставки</label>
                            <input
                                type="text"
                                value={movingStreetFrom}
                                onChange={(e) => setMovingStreetFrom(e.target.value)}
                                placeholder="Например: г. Алматы, Абая 25"
                                className="w-full h-[42px] rounded-3xl bg-gray-100 border-0 px-3 text-sm text-[#373737] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-0"
                            />
                            <div className="flex gap-2 w-full">
                                <input
                                    type="text"
                                    value={movingHouseFrom}
                                    onChange={(e) => setMovingHouseFrom(e.target.value)}
                                    placeholder="Дом"
                                    className="h-[42px] flex-1 rounded-3xl bg-gray-100 border-0 px-3 text-sm text-[#373737] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-0"
                                />
                                <input
                                    type="text"
                                    value={movingFloorFrom}
                                    onChange={(e) => setMovingFloorFrom(e.target.value)}
                                    placeholder="Этаж"
                                    className="h-[42px] flex-1 rounded-3xl bg-gray-100 border-0 px-3 text-sm text-[#373737] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-0"
                                />
                                <input
                                    type="text"
                                    value={movingApartmentFrom}
                                    onChange={(e) => setMovingApartmentFrom(e.target.value)}
                                    placeholder="Квартира"
                                    className="h-[42px] flex-1 rounded-3xl bg-gray-100 border-0 px-3 text-sm text-[#373737] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}