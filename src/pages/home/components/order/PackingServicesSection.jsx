import React from 'react';
import { Package, Trash2, Plus } from 'lucide-react';
import { formatServiceDescription } from '@/shared/lib/utils/serviceNames';
import { Switch, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '../../../../components/ui';
import uslugiMuveraIcon from "../../../../../src/assets/услуги_мувера.png";
import uslugiUpakovkiIcon from "../../../../../src/assets/услуги_упаковки.png";
import streychPlenkaIcon from "../../../../../src/assets/стрейч_пленка.png";
import korobkiIcon from "../../../../../src/assets/коробки.png";
import markerIcon from "../../../../../src/assets/маркер.png";
import bubbleWrap10Icon from "../../../../../src/assets/Пузырчатая_плёнка_(10 м).png";
import bubbleWrap100Icon from "../../../../../src/assets/Воздушно-пузырчатая_плёнка_(100 м).png";
import rackRentalIcon from "../../../../../src/assets/Аренда_стелажей.png";

const getServiceTypeIcon = (type) => {
    switch (type) {
        case "LOADER":
            return uslugiMuveraIcon;
        case "PACKER":
            return uslugiUpakovkiIcon;
        case "STRETCH_FILM":
            return streychPlenkaIcon;
        case "BOX_SIZE":
            return korobkiIcon;
        case "MARKER":
            return markerIcon;
        case "BUBBLE_WRAP_1":
            return bubbleWrap10Icon;
        case "BUBBLE_WRAP_2":
            return bubbleWrap100Icon;
        case "RACK_RENTAL":
            return rackRentalIcon;
        default:
            return uslugiUpakovkiIcon;
    }
};

export const getServiceTypeName = (type) => {
    switch (type) {
        case "LOADER":
            return "Услуги мувера";
        case "PACKER":
            return "Услуги упаковщика";
        case "FURNITURE_SPECIALIST":
            return "Мебельщик";
        case "GAZELLE":
            return "Газель";
        case "GAZELLE_FROM":
            return "Газель - доставка";
        case "GAZELLE_TO":
            return "Газель - возврат вещей";
        case "STRETCH_FILM":
            return "Стрейч плёнка";
        case "BOX_SIZE":
            return "Коробки";
        case "MARKER":
            return "Маркер";
        case "UTILITY_KNIFE":
            return "Канцелярский нож";
        case "BUBBLE_WRAP_1":
            return "Пузырчатая плёнка (10м)";
        case "BUBBLE_WRAP_2":
            return "Воздушно-пузырчатая плёнка (100м)";
        case "RACK_RENTAL":
            return "Аренда стеллажей";
        default:
            return "Услуга";
    }
};

const getServiceTypeDescription = (type) => {
    switch (type) {
        case "LOADER":
            return "Безопасный перенос и погрузка тяжёлых и габаритных предметов без риска травм.";
        case "PACKER":
            return "Профессионально упаковываем ваши вещи, экономя время и снижая риск повреждений.";
        case "STRETCH_FILM":
            return "Фиксирует и защищает мебель и коробки от пыли, влаги и царапин.";
        case "BOX_SIZE":
            return "Надёжно защищают вещи от повреждений, пыли и влаги при переезде и хранении.";
        case "MARKER":
            return "Позволяет подписать коробки и быстро находить нужные вещи без лишней суеты.";
        case "BUBBLE_WRAP_1":
            return "Эффективно защищает хрупкие предметы от ударов, сколов и тряски.";
        case "BUBBLE_WRAP_2":
            return "Идеально подходит для упаковки большого объёма вещей при переезде.";
        case "RACK_RENTAL":
            return "Обеспечивает удобное, аккуратное и организованное хранение вещей на складе.";
        default:
            return null;
    }
};


export default function PackingServicesSection({
                                                   includePacking,
                                                   setIncludePacking,
                                                   previewStorage,
                                                   isServicesLoading,
                                                   servicesError,
                                                   services,
                                                   serviceOptions,
                                                   ensureServiceOptions,
                                                   updateServiceRow,
                                                   removeServiceRow,
                                                   addServiceRow,
                                                   movingAddressTo,
                                                   setMovingAddressTo,
                                                   movingOrders,
                                                   setMovingOrders,
                                               }) {
    return (
        <>
            {/* Услуги упаковки */}
            <div className="flex items-center justify-between mb-2 gap-3">
                <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-3xl px-4 py-3 bg-transparent h-12">
                    <span className="text-base font-medium text-[#373737]">Услуги упаковки</span>
                    <Package className="w-5 h-5 text-[#373737]" />
                </div>
                <Switch
                    checked={includePacking}
                    onCheckedChange={async (checked) => {
                        setIncludePacking(checked);
                        if (checked) {
                            await ensureServiceOptions();
                            if (services.length === 0) addServiceRow();
                        }
                    }}
                    className="bg-gray-300 data-[state=checked]:bg-[#00A991]"
                />
            </div>

            {/* Детали услуг упаковки */}
            {includePacking && previewStorage && (
                <div className="mb-3 bg-white rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-xl font-bold text-[#373737]">Детали услуг упаковки</h3>
                    <div className="space-y-3">
                        {isServicesLoading ? (
                            <div className="flex items-center justify-center py-2">
                                <span className="w-5 h-5 border-2 border-t-transparent border-[#373737] rounded-full animate-spin" />
                            </div>
                        ) : (
                            <>
                                {servicesError && <p className="text-xs text-red-600">{servicesError}</p>}

                                {services.length > 0 ? (
                                    services.map((service, index) => {
                                        const selectedOption = serviceOptions.find(option => String(option.id) === service.service_id);
                                        const unitPrice = selectedOption?.price ?? 0;

                                        const availableOptions = serviceOptions.filter(option => {
                                            if (['GAZELLE', 'GAZELLE_FROM', 'GAZELLE_TO', 'INDIVIDUAL'].includes(option?.type)) return false;
                                            return !services.some((s, i) => i !== index && String(s.service_id) === String(option.id));
                                        });

                                        const isGazelleToService = selectedOption?.type === 'GAZELLE_TO';

                                        return (
                                            <div key={index} className="space-y-2">
                                                <div className="rounded-3xl border border-gray-200 bg-white px-4 py-3">
                                                    {/* Верхняя строка с Select и кнопкой */}
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-gray-100">
                                                            {selectedOption ? (
                                                                <img src={getServiceTypeIcon(selectedOption.type)} alt="" className="h-7 w-7 object-contain opacity-70" />
                                                            ) : (
                                                                <Package className="h-7 w-7 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <Select value={service.service_id} onValueChange={value => updateServiceRow(index, 'service_id', value)}>
                                                                <SelectTrigger className="h-auto p-0 border-0 bg-transparent text-[#373737] font-medium hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>span]:text-[#373737] [&>svg]:text-[#373737] [&>svg]:ml-1 w-auto min-w-0">
                                                                    <SelectValue placeholder="Услуга" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {availableOptions.length > 0 ? (
                                                                        <>
                                                                            {/* Группы услуг */}
                                                                            {['PACKER', 'LOADER', 'RACK_RENTAL'].some(type => availableOptions.some(o => o.type === type)) && (
                                                                                <SelectGroup>
                                                                                    <SelectLabel className="text-xs font-semibold text-[#00A991] uppercase tracking-wide">Услуги персонала</SelectLabel>
                                                                                    {availableOptions.filter(o => ['PACKER', 'LOADER', 'RACK_RENTAL'].includes(o.type)).map(option => (
                                                                                        <SelectItem key={option.id} value={String(option.id)}>{formatServiceDescription(option.description) || getServiceTypeName(option.type)}</SelectItem>
                                                                                    ))}
                                                                                </SelectGroup>
                                                                            )}
                                                                            {['BOX_SIZE', 'MARKER', 'BUBBLE_WRAP_1', 'BUBBLE_WRAP_2', 'STRETCH_FILM'].some(type => availableOptions.some(o => o.type === type)) && (
                                                                                <SelectGroup>
                                                                                    <SelectLabel className="text-xs font-semibold text-[#00A991] uppercase tracking-wide mt-2">Упаковочные материалы</SelectLabel>
                                                                                    {availableOptions.filter(o => ['BOX_SIZE', 'MARKER', 'BUBBLE_WRAP_1', 'BUBBLE_WRAP_2', 'STRETCH_FILM'].includes(o.type)).map(option => (
                                                                                        <SelectItem key={option.id} value={String(option.id)}>{formatServiceDescription(option.description) || getServiceTypeName(option.type)}</SelectItem>
                                                                                    ))}
                                                                                </SelectGroup>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <div className="px-2 py-1.5 text-sm text-[#6B6B6B]">Нет доступных услуг</div>
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                            {service.service_id && <span className="ml-auto text-sm text-[#373737]">{unitPrice.toLocaleString()} ₸/шт.</span>}
                                                            <button type="button" onClick={() => removeServiceRow(index)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-[#373737] hover:bg-gray-100 transition-colors shrink-0" aria-label="Удалить услугу">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Кол-во */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-[#373737]">Кол-во</span>
                                                        <Select value={String(service.count)} onValueChange={value => updateServiceRow(index, 'count', parseInt(value) || 1)}>
                                                            <SelectTrigger className="w-16 h-8 rounded-lg border border-gray-200 bg-white text-sm text-[#373737] [&>span]:text-[#373737] [&>svg]:text-gray-500">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {[1,2,3,4,5].map(num => (
                                                                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    {/* Описание */}
                                                    {selectedOption && getServiceTypeDescription(selectedOption.type) && (
                                                        <p className="mt-2 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2">{getServiceTypeDescription(selectedOption.type)}</p>
                                                    )}
                                                </div>

                                                {/* Адрес доставки */}
                                                {isGazelleToService && (
                                                    <div className="pl-3 pr-11">
                                                        <label className="block text-sm text-[#373737] mb-1">Адрес доставки вещей</label>
                                                        <input type="text" value={movingAddressTo} onChange={e => {
                                                            setMovingAddressTo(e.target.value);
                                                            setMovingOrders(prev => prev.map(order => order.status === 'PENDING' && order.direction === 'TO_CLIENT' ? {...order, address: e.target.value} : order));
                                                        }} placeholder="Например: г. Алматы, Абая 25" className="w-full h-[42px] rounded-3xl bg-gray-100 border-0 px-3 text-sm text-[#373737] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-[#373737]">Добавьте услуги, чтобы мы подготовили упаковку под ваши вещи.</p>
                                )}

                                <button type="button" onClick={() => { ensureServiceOptions(); addServiceRow(); }} className="inline-flex items-center gap-1.5 rounded-3xl border-2 border-dashed border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#373737] hover:bg-gray-50 transition-colors">
                                    <Plus className="h-4 w-4" /> Добавить услугу
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}