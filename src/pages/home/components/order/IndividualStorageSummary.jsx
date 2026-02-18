import React from 'react'
import { ChevronDown, ChevronUp, Tag, Check, X } from 'lucide-react';
import { formatServiceDescription } from '@/shared/lib/utils/serviceNames';

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
                                           includeMoving,
                                           includePacking,
                                           services,
                                           serviceOptions,
                                           serviceSummary,
                                           isPriceCalculating,
                                           setShowOrderDetails,
                                           setShowPromoInput,
                                           setPromoCodeInput,
                                           setPromoError,
                                           handleApplyPromoCode,
                                           handleRemovePromoCode,
                                       }) {
    if (!previewStorage) {
        return (
            <div className="border-2 border-dashed border-gray-300 rounded-3xl bg-transparent p-4 sm:p-6">
                <h3 className="text-lg font-bold text-[#373737] mb-2">Итог</h3>
                <p className="text-sm text-gray-500">
                    Выберите бокс на схеме, чтобы увидеть предварительную цену.
                </p>
            </div>
        );
    }

    const isOccupied = previewStorage.status === 'OCCUPIED' || previewStorage.status === 'PENDING';
    const volume = previewStorage.available_volume || previewStorage.volume || '—';

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-3xl bg-transparent p-4 sm:p-6">
            <h3 className="text-lg font-bold text-[#373737] mb-4">Итог</h3>

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
                    {/* Главная сумма */}
                    <div>
                        <div className="text-lg font-bold text-[#273655] flex items-baseline gap-2">
                            Общая стоимость:{' '}
                            {promoSuccess && promoDiscount > 0 && (
                                <span className="text-sm text-gray-400 line-through">
                  {costSummary.combinedTotal?.toLocaleString() ?? '—'} ₸
                </span>
                            )}
                            <span className="text-2xl">
                {finalIndividualTotal?.toLocaleString() ?? '—'} ₸
              </span>
                            <span className="text-sm font-normal text-gray-600">
                ({volume} м²)
              </span>
                        </div>

                        {promoSuccess && (
                            <div className="text-xs text-gray-500 mt-1">
                                (скидка {promoDiscountPercent}%)
                            </div>
                        )}
                    </div>

                    {/* Информация об акции */}
                    <div className="flex items-center justify-between">
                        {costSummary.pricingBreakdown ? (
                            <div className="space-y-1">
                                <div className="text-sm font-semibold text-green-600">
                                    Акция: {costSummary.pricingBreakdown.ruleName}
                                </div>

                                {costSummary.pricingBreakdown.promoMonths ? (
                                    <>
                                        <div className="text-sm text-gray-600">
                                            Первые {costSummary.pricingBreakdown.promoMonths} мес:{' '}
                                            <span className="font-semibold text-green-600">
                        {Math.round(costSummary.pricingBreakdown.promoMonthlyAmount).toLocaleString()} ₸/мес
                      </span>
                                            <span className="text-xs text-gray-400 ml-1">
                        ({Number(costSummary.pricingBreakdown.promoPrice).toLocaleString()} ₸/м²)
                      </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Далее:{' '}
                                            <span className="font-semibold">
                        {Math.round(costSummary.pricingBreakdown.standardMonthlyAmount).toLocaleString()} ₸/мес
                      </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-sm text-gray-600">
                                        Стоимость в месяц:{' '}
                                        <span className="font-semibold text-green-600">
                      {Math.round(costSummary.pricingBreakdown.standardMonthlyAmount).toLocaleString()} ₸/мес
                    </span>
                                        <span className="text-xs text-gray-400 ml-1">
                      ({Number(costSummary.pricingBreakdown.standardPrice).toLocaleString()} ₸/м²)
                    </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-600">
                                Стоимость хранения в месяц:{' '}
                                <span className="font-semibold text-[#273655]">
                  {costSummary.baseMonthly?.toLocaleString() ?? '—'} ₸
                </span>
                            </div>
                        )}

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

                    {/* Детали заказа */}
                    {showOrderDetails && (
                        <div className="pt-4 border-t border-gray-200 space-y-4 text-sm text-[#273655]">
                            {/* Доставка */}
                            {includeMoving && serviceSummary.breakdown.some(item =>
                                item.label.includes('Доставка')
                            ) && (
                                <div className="flex justify-between font-medium">
                                    <span>Доставка</span>
                                    <span>
                    {serviceSummary.breakdown
                        .filter(item => item.label.includes('Доставка'))
                        .reduce((sum, item) => sum + item.amount, 0)
                        .toLocaleString()} ₸
                  </span>
                                </div>
                            )}

                            {/* Доп. услуги */}
                            {includePacking && serviceSummary.breakdown.some(item =>
                                !item.label.includes('Доставка')
                            ) && (
                                <div>
                                    <h4 className="font-bold mb-2">Дополнительные услуги</h4>
                                    <ul className="space-y-1">
                                        {services
                                            .filter(s => s?.service_id && s?.count > 0)
                                            .map((service, idx) => {
                                                const option = serviceOptions.find(o => String(o.id) === String(service.service_id));
                                                if (!option) return null;
                                                const amount = option.price * Number(service.count);
                                                return (
                                                    <li key={idx} className="flex justify-between">
                            <span>
                              {formatServiceDescription(option.description) || 'Услуга'} × {service.count} шт ×{' '}
                                {option.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₸
                            </span>
                                                        <span className="font-medium">{amount.toLocaleString('ru-RU')} ₸</span>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                    <div className="mt-2 pt-2 border-t font-semibold flex justify-between">
                                        <span>Итого доп. услуги:</span>
                                        <span>
                      {serviceSummary.breakdown
                          .filter(item => !item.label.includes('Доставка'))
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString('ru-RU')} ₸
                    </span>
                                    </div>
                                </div>
                            )}

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