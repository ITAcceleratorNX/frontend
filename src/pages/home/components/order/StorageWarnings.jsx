import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function StorageWarnings({ selectedWarehouse, megaSelectedMap, komfortSelectedMap }) {
    const isMegaWarning = selectedWarehouse?.name?.toLowerCase().includes('mega') && megaSelectedMap === 2;
    const isKomfortWarning = selectedWarehouse?.name === "Жилой комплекс «Комфорт Сити»" && komfortSelectedMap === 2;

    if (!isMegaWarning && !isKomfortWarning) return null;

    return (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-[#273655] leading-relaxed">
                        <span className="font-semibold">Внимание:</span> В Ярусе 2 вес не должен превышать 200 кг на квадратный метр
                    </p>
                </div>
            </div>
        </div>
    );
}