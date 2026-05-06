import React, { memo, useEffect, useRef, useState } from 'react';
import WarehouseMap from '@/components/WarehouseMap.jsx';
import extraspaceLogo from '@/assets/extraspace_logo.png';

/**
 * Lazy-loaded 2GIS map for LP branches block. Doesn't load the heavy 2GIS
 * loader.js until the map enters the viewport (saves ~500kb on first paint).
 */

const BRANCHES = [
  {
    id: 1,
    name: 'ExtraSpace · Mega Tower Almaty',
    address: 'ул. Абиша Кекилбайулы, 270, блок 4',
    phone: '+7 778 391 1425',
    workingHours: 'Круглосуточно',
    type: 'INDIVIDUAL',
    coordinates: [76.890647, 43.201397],
    storage: [],
    available: true,
    image: extraspaceLogo,
  },
  {
    id: 2,
    name: 'ExtraSpace · Жилой комплекс «Комфорт Сити»',
    address: 'проспект Серкебаева, 146/3',
    phone: '+7 778 391 1425',
    workingHours: 'Круглосуточно',
    type: 'INDIVIDUAL',
    coordinates: [76.900575, 43.201302],
    storage: [],
    available: true,
    image: extraspaceLogo,
  },
];

function TwoGisMap({ height = 480 }) {
  const wrapperRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (shouldLoad) return undefined;

    const node = wrapperRef.current;
    if (!node) return undefined;

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={wrapperRef} className="w-full" style={{ minHeight: height }}>
      {shouldLoad ? (
        <div style={{ height }}>
          <WarehouseMap warehouses={BRANCHES} mapId="lp-branches-map" />
        </div>
      ) : (
        <div
          className="flex w-full items-center justify-center rounded-3xl bg-[#eef2f5] text-sm text-[#6b7280]"
          style={{ height }}
        >
          Карта загрузится автоматически…
        </div>
      )}
    </div>
  );
}

export default memo(TwoGisMap);
export { BRANCHES };
