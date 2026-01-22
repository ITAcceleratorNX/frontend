import React from 'react';

import sumkaImg from '../../../assets/cloud-tariffs/sumka.png';
import motorcycleImg from '../../../assets/cloud-tariffs/motorcycle.png';
import bicycleImg from '../../../assets/cloud-tariffs/bicycle.png';
import furnitureImg from '../../../assets/cloud-tariffs/furniture.png';
import shinaImg from '../../../assets/cloud-tariffs/shina.png';
import sunukImg from '../../../assets/cloud-tariffs/sunuk.png';
import garazhImg from '../../../assets/cloud-tariffs/garazh.png';
import skladImg from '../../../assets/cloud-tariffs/sklad.png';

/**
 * Получение информации о тарифе
 */
const getTariffInfo = (tariffType) => {
    if (!tariffType || tariffType === 'CUSTOM') {
        return { image: null, name: 'Свои габариты' };
    }

    const tariffMap = {
        CLOUD_TARIFF_SUMKA: { image: sumkaImg, name: 'Хранение сумки / коробки вещей' },
        CLOUD_TARIFF_SHINA: { image: shinaImg, name: 'Шины' },
        CLOUD_TARIFF_MOTORCYCLE: { image: motorcycleImg, name: 'Хранение мотоцикла' },
        CLOUD_TARIFF_BICYCLE: { image: bicycleImg, name: 'Хранение велосипеда' },
        CLOUD_TARIFF_SUNUK: { image: sunukImg, name: 'Сундук до 1 м³' },
        CLOUD_TARIFF_FURNITURE: { image: furnitureImg, name: 'Шкаф до 2 м³' },
        CLOUD_TARIFF_SKLAD: { image: skladImg, name: 'Кладовка до 3 м³' },
        CLOUD_TARIFF_GARAZH: { image: garazhImg, name: 'Гараж до 9 м³' },
    };

    return tariffMap[tariffType] || { image: null, name: 'Свои габариты' };
};

/**
 * Универсальный бейдж хранилища
 */
const StorageBadge = ({ order, embeddedMobile = false }) => {
    if (!order?.storage) return null;

    const baseClasses = `
    bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0
    ml-1 min-[360px]:ml-2 sm:ml-4
  `;

    const sizeClasses = embeddedMobile
        ? 'w-16 h-16 min-[360px]:w-20 min-[360px]:h-20 p-2'
        : 'w-28 h-28 p-4';

    // ☁️ CLOUD
    if (order.storage.storage_type === 'CLOUD') {
        const tariffInfo = getTariffInfo(order.tariff_type);

        return (
            <div className={`${baseClasses} ${sizeClasses}`}>
                {tariffInfo.image ? (
                    <img
                        src={tariffInfo.image}
                        alt={tariffInfo.name}
                        className="max-w-full max-h-full object-contain"
                    />
                ) : (
                    <span className="text-xs font-bold text-gray-900 text-center leading-tight px-1">
            {tariffInfo.name}
          </span>
                )}
            </div>
        );
    }

    // 📦 INDIVIDUAL
    if (order.storage.name) {
        return (
            <div className={`${baseClasses} ${sizeClasses}`}>
        <span
            className={`font-bold text-gray-900 truncate px-1 ${
                embeddedMobile ? 'text-lg min-[360px]:text-2xl' : 'text-4xl'
            }`}
        >
          {order.storage.name}
        </span>
            </div>
        );
    }

    return null;
};

export default StorageBadge;