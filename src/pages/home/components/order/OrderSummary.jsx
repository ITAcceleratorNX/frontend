import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function OrderSummary({
                                         storageType, // 'INDIVIDUAL' | 'CLOUD'
                                         previewStorage,
                                         bookingInfo,
                                         isLoadingBookingInfo,
                                         isPriceCalculating,
                                         finalTotal,
                                         promoSuccess,
                                         promoDiscount,
                                         promoDiscountPercent,
                                         showOrderDetails,
                                         setShowOrderDetails,
                                         serviceSummary,
                                         services,
                                         serviceOptions,
                                         includeMoving,
                                         includePacking,
                                         showPromoInput,
                                         setShowPromoInput,
                                         promoCodeInput,
                                         setPromoCodeInput,
                                         promoError,
                                         handleApplyPromoCode,
                                         handleRemovePromoCode,
                                         cloudVolume,
                                         cloudPricePreview,
                                         selectedTariff,
                                         showCloudPromoInput,
                                         setShowCloudPromoInput,
                                         cloudPromoCodeInput,
                                         setCloudPromoCodeInput,
                                         cloudPromoError,
                                         cloudPromoSuccess,
                                         handleApplyCloudPromoCode,
                                         handleRemoveCloudPromoCode,
                                         finalCloudTotal,
                                         cloudPromoDiscount,
                                         cloudPromoDiscountPercent,
                                         cloudMonthsNumber,
                                         getServiceTypeName
                                     }) {
    // Определяем, показывать ли индивидуальный или облачный блок
    const isIndividual = storageType === 'INDIVIDUAL';

    return (
        <div className="mt-2">
            <div className="border-2 border-dashed border-gray-300 rounded-3xl bg-transparent p-4 sm:p-6">
                <h3 className="text-lg font-bold text-[#373737] mb-2">Итог</h3>

                {isIndividual ? (
                    previewStorage ? (
                        <div className="space-y-2">
                            {/* Информация о бронировании */}
                            {previewStorage.status === 'OCCUPIED' || previewStorage.status === 'PENDING' ? (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#273655]">
                                            ИТОГ
                                        </div>
                                        <div className="text-4xl font-black text-[#273655] tracking-tight">
                                            {previewStorage.name}
                                        </div>
                                    </div>
                                    {isLoadingBookingInfo ? (
                                        <div className="text-sm text-[#6B6B6B] flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#273655]"></div>
                                            Загрузка информации о бронировании...
                                        </div>
                                    ) : bookingInfo ? (
                                        <p className="text-sm text-[#6B6B6B]">
                                            Бокс стоит о бронировании с{" "}
                                            <span className="font-medium text-[#273655]">
                        {new Date(bookingInfo.start_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                                            , по{" "}
                                            <span className="font-medium text-[#273655]">
                        {new Date(bookingInfo.end_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                                        </p>
                                    ) : (
                                        <p className="text-sm text-[#6B6B6B]">Бокс занят</p>
                                    )}
                                </div>
                            ) : null}

                            {/* Общая стоимость */}
                            {isPriceCalculating ? (
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#273655]"></div>
                                    Расчет...
                                </div>
                            ) : (
                                <>
                                    <div className="text-lg font-bold text-[#373655] mb-2">
                                        Общая стоимость: {promoSuccess && promoDiscount > 0 && (
                                        <span className="text-sm text-gray-400 line-through mr-1">
                        {serviceSummary?.combinedTotal?.toLocaleString() ?? "—"} ₸
                      </span>
                                    )}
                                        {finalTotal?.toLocaleString() ?? "—"} ₸
                                    </div>
                                    <div className="text-xs text-gray-500 mb-4">{promoSuccess && ` (скидка ${promoDiscountPercent}%)`}</div>

                                    {/* Кнопка показать/скрыть детали */}
                                    <div className="flex items-center justify-between mb-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowOrderDetails(!showOrderDetails)}
                                            className="text-sm text-[#31876D] hover:text-[#276b57] flex items-center gap-1 underline"
                                        >
                                            {showOrderDetails ? (
                                                <>
                                                    Скрыть подробности
                                                    <ChevronUp className="w-4 h-4" />
                                                </>
                                            ) : (
                                                <>
                                                    Показать полностью
                                                    <ChevronDown className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Детали заказа */}
                                    {showOrderDetails && (
                                        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                                            {/* Тут можно вставить код дополнительных услуг, доставки и размеров бокса */}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">Выберите бокс на схеме, чтобы увидеть предварительную цену.</p>
                    )
                ) : (
                    // Облачное хранение
                    <div className="bg-white rounded-3xl px-6 py-6 mb-6 border-2 border-dashed border-gray-300">
                        <p className="text-sm text-[#555A65] mb-7">Рассчитанный объём: {cloudVolume.toFixed(2)} м³</p>
                        <div className="flex items-center justify-between mb-7">
                            <h3 className="text-xl font-bold text-[#04A68E]">ИТОГ</h3>
                            <span className="text-xl font-bold text-[#04A68E]">{cloudVolume.toFixed(2)} м³</span>
                        </div>

                        <div className="text-base text-[#273655]">
                            {selectedTariff?.isCustom ? (
                                <div className="flex justify-between mb-3">
                                    <span>Габариты:</span>
                                    <span className="font-medium">{cloudDimensions.width} × {cloudDimensions.height} × {cloudDimensions.length} м</span>
                                </div>
                            ) : selectedTariff ? (
                                <div className="flex justify-between mb-3">
                                    <span>Тариф:</span>
                                    <span className="font-medium">{selectedTariff.name}</span>
                                </div>
                            ) : null}

                            <div className="flex justify-between mt-4 mb-3">
                                <span className="text-[#04A68E]">За месяц</span>
                                <span className="font-medium text-[#04A68E]">{cloudPricePreview?.monthly?.toLocaleString() ?? "—"} ₸</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}