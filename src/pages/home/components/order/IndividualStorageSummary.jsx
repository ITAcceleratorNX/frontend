import React from 'react'
import { ChevronDown, ChevronUp, Tag, Check, X } from 'lucide-react';

export default function IndividualStorageSummary({
                                           previewStorage,
                                           bookingInfo,
                                           isLoadingBookingInfo,
                                           costSummary,
                                           finalIndividualTotal,
                                           promoSuccess,
                                           promoDiscount,
                                           promoDiscountPercent,
                                           promoCode,
                                           promoError,
                                           promoCodeInput,
                                           isValidatingPromo,
                                           showPromoInput,
                                           showOrderDetails,
                                           isPriceCalculating,
                                           monthsNumber,
                                           fullPaymentDiscountInfo,
                                           guideMessage = null,
                                           onGuideClick,
                                           setShowOrderDetails,
                                           setShowPromoInput,
                                           setPromoCodeInput,
                                           setPromoError,
                                           handleApplyPromoCode,
                                           handleRemovePromoCode,
                                       }) {
    const showSimpleGuide =
        Boolean(
            guideMessage &&
            onGuideClick &&
            (!previewStorage || previewStorage.status === "VACANT")
        );

    if (showSimpleGuide) {
        return (
            <button
                type="button"
                onClick={onGuideClick}
                className="border-2 border-dashed border-gray-300 rounded-3xl bg-transparent p-4 sm:p-6 w-full text-left hover:bg-[#F0F4F2]/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#31876D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7FAF9]"
            >
                <h3 className="text-lg font-bold text-[#373737] mb-2">Итог</h3>
                <p className="text-sm text-[#5C625F] leading-relaxed">{guideMessage}</p>
            </button>
        );
    }

    if (!previewStorage) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-3xl bg-transparent p-4 sm:p-6">
                <h3 className="text-lg font-bold text-[#373737] mb-2">Итог</h3>
                <p className="text-sm text-gray-500">
                    {guideMessage ||
                        "Введите площадь (м²) над схемой и нажмите «Найти», затем выберите бокс — так вы увидите предварительную цену."}
                </p>
            </div>
        );
    }

    const isOccupied = previewStorage.status === 'OCCUPIED' || previewStorage.status === 'PENDING';
    const volume = previewStorage.available_volume || previewStorage.volume || '—';

    const occupiedGuideClickable = Boolean(guideMessage && onGuideClick && isOccupied);

    return (
        <div
            className={`border-2 border-dashed border-gray-300 rounded-3xl bg-transparent p-4 sm:p-6 ${
                occupiedGuideClickable
                    ? "cursor-pointer hover:bg-[#F0F4F2]/40 transition-colors focus-within:ring-2 focus-within:ring-[#31876D] focus-within:ring-offset-2 focus-within:ring-offset-[#F7FAF9]"
                    : ""
            }`}
            role={occupiedGuideClickable ? "button" : undefined}
            tabIndex={occupiedGuideClickable ? 0 : undefined}
            onClick={occupiedGuideClickable ? () => onGuideClick() : undefined}
            onKeyDown={
                occupiedGuideClickable
                    ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onGuideClick();
                          }
                      }
                    : undefined
            }
        >
            <h3 className="text-lg font-bold text-[#373737] mb-4">Итог</h3>

            {occupiedGuideClickable && guideMessage ? (
                <p className="text-sm font-medium text-[#273655] mb-4 leading-relaxed">{guideMessage}</p>
            ) : null}

            {/* Занятый бокс */}
            {isOccupied && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold uppercase tracking-wide text-[#273655]">
                            ИТОГ
                        </div>
                        <div className="text-4xl font-black text-[#273655] tracking-tight">
                            {previewStorage.name}
                        </div>
                    </div>

                    {isLoadingBookingInfo ? (
                        <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                            <div className="animate-spin h-4 w-4 border-2 border-t-[#273655] border-b-[#273655] rounded-full" />
                            Загрузка информации о бронировании...
                        </div>
                    ) : bookingInfo ? (
                        <p className="text-sm text-[#6B6B6B]">
                            Бокс забронирован с{' '}
                            <span className="font-medium text-[#273655]">
                {new Date(bookingInfo.start_date).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })}
              </span>{' '}
                            по{' '}
                            <span className="font-medium text-[#273655]">
                {new Date(bookingInfo.end_date).toLocaleDateString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })}
              </span>
                        </p>
                    ) : (
                        <p className="text-sm text-[#6B6B6B]">Бокс занят</p>
                    )}
                </div>
            )}

            {/* Расчёт цены */}
            {isPriceCalculating ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin h-4 w-4 border-2 border-t-[#273655] border-b-[#273655] rounded-full" />
                    Расчёт...
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Стоимость в месяц и размер бокса (без общей суммы за весь срок) */}
                    <div>
                        <div className="text-lg font-bold text-[#273655] flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="shrink-0">Стоимость в месяц:</span>
                            {monthsNumber != null &&
                                monthsNumber > 0 &&
                                finalIndividualTotal != null &&
                                promoSuccess &&
                                promoDiscount > 0 && (
                                    <span className="text-sm text-gray-400 line-through shrink-0">
                                        {Math.round((costSummary.combinedTotal || 0) / monthsNumber).toLocaleString()} ₸
                                    </span>
                                )}
                            {monthsNumber != null && monthsNumber > 0 && finalIndividualTotal != null ? (
                                <>
                                    <span className="inline-flex items-center gap-1 shrink-0">
                                        <span className="text-2xl tabular-nums">
                                            {Math.round(finalIndividualTotal / monthsNumber).toLocaleString()}
                                        </span>
                                        <span className="text-2xl leading-none">₸</span>
                                    </span>
                                    <span className="text-sm font-normal text-gray-600 shrink-0">
                                        ({volume} м²)
                                    </span>
                                </>
                            ) : (
                                <span className="text-sm font-normal text-gray-500">—</span>
                            )}
                        </div>

                        {promoSuccess && (
                            <div className="text-xs text-gray-500 mt-1">(скидка {promoDiscountPercent}%)</div>
                        )}
                    </div>

                    {fullPaymentDiscountInfo && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                            <p className="text-sm font-medium leading-relaxed text-emerald-800">
                                {fullPaymentDiscountInfo.discountPercent > 0
                                    ? `При полной оплате действует скидка ${fullPaymentDiscountInfo.discountPercent}%`
                                    : 'При полной оплате действует специальная цена'}
                                {fullPaymentDiscountInfo.savingsAmount > 0
                                    ? `, экономия ${Math.round(fullPaymentDiscountInfo.savingsAmount).toLocaleString()} ₸ за весь срок.`
                                    : '.'}
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">

                            <button
                                type="button"
                                onClick={() => setShowOrderDetails(!showOrderDetails)}
                                className="text-sm text-[#31876D] hover:text-[#276b57] flex items-center gap-1 underline"
                                aria-expanded={showOrderDetails}
                            >
                                {showOrderDetails ? (
                                    <>
                                        Скрыть подробности <ChevronUp className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        Показать полностью <ChevronDown className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Детали заказа */}
                    {showOrderDetails && (
                        <div className="pt-4 border-t border-gray-200 space-y-4 text-sm text-[#273655]">
                            {/* Размер бокса */}
                            <div className="flex justify-between font-medium">
                                <span>Размер бокса:</span>
                                <span>{volume} м²</span>
                            </div>
                        </div>
                    )}

                    {/* Промокод */}
                    <div className="mt-5">
                        {(!showPromoInput && !promoSuccess) ? (
                            <button
                                type="button"
                                onClick={() => setShowPromoInput(true)}
                                className="text-sm text-[#31876D] hover:text-[#276b57] underline"
                            >
                                Промокод
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-[#273655]">Промокод</label>
                                    {!promoSuccess && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowPromoInput(false);
                                                setPromoCodeInput('');
                                                setPromoError('');
                                            }}
                                            className="text-xs text-gray-500 hover:text-gray-700 underline"
                                        >
                                            Скрыть
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={promoCodeInput}
                                            onChange={e => {
                                                setPromoCodeInput(e.target.value.toUpperCase());
                                                setPromoError('');
                                            }}
                                            placeholder="Введите промокод"
                                            disabled={promoSuccess || isValidatingPromo}
                                            className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#31876D]/30 ${
                                                promoSuccess
                                                    ? 'border-green-500 bg-green-50'
                                                    : promoError
                                                        ? 'border-red-500 bg-red-50'
                                                        : 'border-gray-300'
                                            } disabled:bg-gray-100`}
                                        />
                                        {promoSuccess && (
                                            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                        )}
                                    </div>

                                    {promoSuccess ? (
                                        <button
                                            onClick={handleRemovePromoCode}
                                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                            aria-label="Удалить промокод"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleApplyPromoCode}
                                            disabled={isValidatingPromo || !promoCodeInput.trim()}
                                            className="px-4 py-2 bg-[#31876D] text-white rounded-lg hover:bg-[#276b57] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isValidatingPromo ? (
                                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                            ) : (
                                                'Применить'
                                            )}
                                        </button>
                                    )}
                                </div>

                                {promoError && <p className="text-xs text-red-600">{promoError}</p>}
                                {promoSuccess && (
                                    <p className="text-xs text-green-600">
                                        Промокод <strong>{promoCode}</strong> применён! Скидка {promoDiscountPercent}%
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Итоговая скидка */}
                    {promoSuccess && promoDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-600 font-medium">
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Скидка ({promoDiscountPercent}%):
              </span>
                            <span>-{promoDiscount.toLocaleString()} ₸</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}