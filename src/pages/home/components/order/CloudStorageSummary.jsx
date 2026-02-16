import React from "react";
import { Tag, Check, X } from "lucide-react";

export default function CloudStorageSummary({
                                                selectedTariff,
                                                cloudDimensions,
                                                cloudVolume,
                                                cloudPricePreview,
                                                finalCloudTotal,
                                                cloudMonthsNumber,
                                                showCloudPromoInput,
                                                cloudPromoSuccess,
                                                cloudPromoDiscount,
                                                cloudPromoDiscountPercent,
                                                cloudPromoCode,
                                                cloudPromoCodeInput,
                                                cloudPromoError,
                                                isValidatingCloudPromo,
                                                setShowCloudPromoInput,
                                                setCloudPromoCodeInput,
                                                setCloudPromoError,
                                                handleApplyCloudPromoCode,
                                                handleRemoveCloudPromoCode
                                            }) {
    return (
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

                {/* Промокод для облачного хранения */}
                <div className="mt-4 mb-4 pt-4 border-t border-gray-200">
                    {!showCloudPromoInput && !cloudPromoSuccess && (
                        <button
                            type="button"
                            onClick={() => setShowCloudPromoInput(true)}
                            className="text-sm text-[#31876D] hover:text-[#276b57] underline cursor-pointer"
                        >
                            Промокод
                        </button>
                    )}
                    {(showCloudPromoInput || cloudPromoSuccess) && (
                        <>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-[#273655]">
                                    Промокод
                                </label>
                                {!cloudPromoSuccess && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCloudPromoInput(false);
                                            setCloudPromoCodeInput("");
                                            setCloudPromoError("");
                                        }}
                                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                                    >
                                        Скрыть
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={cloudPromoCodeInput}
                                        onChange={(e) => {
                                            setCloudPromoCodeInput(e.target.value.toUpperCase());
                                            setCloudPromoError("");
                                        }}
                                        placeholder="Введите промокод"
                                        disabled={cloudPromoSuccess || isValidatingCloudPromo}
                                        className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#273655] ${
                                            cloudPromoSuccess
                                                ? "border-green-500 bg-green-50"
                                                : cloudPromoError
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-gray-300"
                                        } disabled:bg-gray-100`}
                                    />
                                    {cloudPromoSuccess && (
                                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                                    )}
                                </div>
                                {cloudPromoSuccess ? (
                                    <button
                                        type="button"
                                        onClick={handleRemoveCloudPromoCode}
                                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm whitespace-nowrap"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleApplyCloudPromoCode}
                                        disabled={isValidatingCloudPromo || !cloudPromoCodeInput.trim()}
                                        className="px-3 py-2 bg-[#31876D] text-white rounded-lg hover:bg-[#276b57] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                                    >
                                        {isValidatingCloudPromo ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <span className="sm:hidden">Применить</span>
                                                <Check className="hidden sm:block w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            {cloudPromoError && (
                                <p className="text-xs text-red-600 mt-1">{cloudPromoError}</p>
                            )}
                            {cloudPromoSuccess && (
                                <p className="text-xs text-green-600 mt-1">
                                    Промокод <strong>{cloudPromoCode}</strong> применен! Скидка {cloudPromoDiscountPercent}%
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Скидка по промокоду */}
                {cloudPromoSuccess && cloudPromoDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm text-green-600 mb-3">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Скидка ({cloudPromoDiscountPercent}%):
            </span>
                        <span>-{cloudPromoDiscount.toLocaleString()} ₸</span>
                    </div>
                )}

                <div className="flex justify-between">
          <span className="text-xl font-bold text-[#04A68E]">
            За {cloudMonthsNumber} {cloudMonthsNumber === 1 ? 'месяц' : cloudMonthsNumber < 5 ? 'месяца' : 'месяцев'}
          </span>
                    <span className="text-xl font-bold text-[#04A68E]">
            {cloudPromoSuccess && cloudPromoDiscount > 0 && (
                <span className="text-sm text-gray-400 line-through mr-2">
                {cloudPricePreview?.total?.toLocaleString() ?? "—"} ₸
              </span>
            )}
                        {finalCloudTotal?.toLocaleString() ?? "—"} ₸
          </span>
                </div>
            </div>
        </div>
    );
}