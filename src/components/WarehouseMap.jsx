import React, { useEffect, useRef } from 'react';

function cleanupKeyForMapId(mapId) {
  return `__esWarehouseMap_${mapId.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

const WarehouseMap = ({ warehouses = [], mapId = 'warehouse-map' }) => {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || warehouses.length === 0) return;

    // Create 2GIS map configuration
    const mapConfig = {
      mapContainerId: mapId,
      orderedGeometries: warehouses.map((warehouse, index) => ({
        type: "Feature",
        properties: {
          color: "#273655",
          title: warehouse.name,
          description: `
            <div style="padding: 12px; font-family: 'Montserrat', sans-serif; max-width: 280px;">
              <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <img src="${warehouse.image}" alt="${warehouse.name}" 
                     style="width: 45px; height: 45px; border-radius: 8px; margin-right: 12px; object-fit: cover;" />
                <div>
                  <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #273655; line-height: 1.2;">${warehouse.name}</h3>
                </div>
              </div>
              <div style="space-y: 6px;">
                <p style="margin: 6px 0; font-size: 14px; color: #6B6B6B; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">📍</span>${warehouse?.address}
                </p>
                <p style="margin: 6px 0; font-size: 14px; color: #6B6B6B; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">📞</span>${warehouse.phone}
                </p>
                <p style="margin: 6px 0; font-size: 14px; color: #6B6B6B; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">🕒</span>${warehouse.workingHours}
                </p>
              </div>
            </div>
          `,
          zIndex: 1000000000 + index,
          customMarker: true, // Оба маркера будут с логотипом ExtraSpace
          logoUrl: warehouse.image
        },
        geometry: {
          type: "Point",
          coordinates: warehouse.coordinates
        },
        id: warehouse.id
      })),
      mapPosition: {
        lat: 43.23819991094438,
        lon: 76.92867279052736,
        zoom: 12
      }
    };

    // Create the 2GIS map script with improved logic
    const script = document.createElement('script');
    script.innerHTML = `
      (function(config){
        var geometries = config.orderedGeometries;
        var mapPosition = config.mapPosition;
        var containerId = config.mapContainerId;
        
        if (typeof DG !== 'undefined') {
          DG.then(function(){
            var cleanupKey = '__esWarehouseMap_' + containerId.replace(/[^a-zA-Z0-9]/g, '_');
            if (typeof window[cleanupKey] === 'function') {
              window[cleanupKey]();
            }

            var lockMapToModifier = typeof window.matchMedia === 'function' &&
              window.matchMedia('(hover: hover) and (pointer: fine)').matches;

            var map = DG.map(containerId, {
              center: [mapPosition.lat, mapPosition.lon],
              zoom: mapPosition.zoom,
              scrollWheelZoom: false,
              zoomControl: true,
              dragging: !lockMapToModifier,
              doubleClickZoom: !lockMapToModifier
            });

            function applyModifierLock(mod) {
              if (!lockMapToModifier) return;
              if (mod) {
                map.scrollWheelZoom.enable();
                if (map.dragging) map.dragging.enable();
                if (map.doubleClickZoom) map.doubleClickZoom.enable();
              } else {
                map.scrollWheelZoom.disable();
                if (map.dragging) map.dragging.disable();
                if (map.doubleClickZoom) map.doubleClickZoom.disable();
              }
            }

            function syncMapInteractionFromKeyboard(e) {
              applyModifierLock(e.ctrlKey || e.metaKey);
            }
            function onWindowBlur() {
              applyModifierLock(false);
            }

            if (lockMapToModifier) {
              applyModifierLock(false);
            }

            window.addEventListener('keydown', syncMapInteractionFromKeyboard, true);
            window.addEventListener('keyup', syncMapInteractionFromKeyboard, true);
            window.addEventListener('blur', onWindowBlur);

            var mapContainerEl = map.getContainer();
            function syncMapInteractionFromWheel(e) {
              applyModifierLock(e.ctrlKey || e.metaKey);
            }
            mapContainerEl.addEventListener('wheel', syncMapInteractionFromWheel, { capture: true, passive: true });

            window[cleanupKey] = function() {
              window.removeEventListener('keydown', syncMapInteractionFromKeyboard, true);
              window.removeEventListener('keyup', syncMapInteractionFromKeyboard, true);
              window.removeEventListener('blur', onWindowBlur);
              mapContainerEl.removeEventListener('wheel', syncMapInteractionFromWheel, { capture: true, passive: true });
              try { map.remove(); } catch (err) {}
              delete window[cleanupKey];
            };
            
            geometries.forEach(function(geometry) {
              var coords = [geometry.geometry.coordinates[1], geometry.geometry.coordinates[0]];
              var props = geometry.properties;
              
              var marker;
              
              if (props.customMarker) {
                var logoIcon = DG.divIcon({
                  html: '<div class="custom-warehouse-marker" style="' +
                    'width: 50px; height: 50px; ' +
                    'border-radius: 50%; ' +
                    'border: 4px solid white; ' +
                    'box-shadow: 0 4px 16px rgba(39, 54, 85, 0.4); ' +
                    'overflow: hidden; ' +
                    'background: white; ' +
                    'display: flex; ' +
                    'align-items: center; ' +
                    'justify-content: center;' +
                    '">' +
                    '<img src="' + props.logoUrl + '" alt="ExtraSpace" style="' +
                    'width: 40px; height: 40px; ' +
                    'border-radius: 50%; ' +
                    'object-fit: cover;' +
                    '" />' +
                    '</div>',
                  className: "custom-marker-icon",
                  iconSize: [50, 50],
                  iconAnchor: [25, 25]
                });
                marker = DG.marker(coords, { icon: logoIcon });
              } else {
                var standardIcon = DG.divIcon({
                  html: '<div class="standard-warehouse-marker" style="' +
                    'background: linear-gradient(135deg, #273655 0%, #4A5A85 100%); ' +
                    'border: 3px solid white; ' +
                    'border-radius: 50%; ' +
                    'width: 30px; height: 30px; ' +
                    'box-shadow: 0 4px 12px rgba(39, 54, 85, 0.4); ' +
                    'position: relative; ' +
                    'display: flex; ' +
                    'align-items: center; ' +
                    'justify-content: center;' +
                    '">' +
                    '<div style="' +
                    'width: 16px; height: 16px; ' +
                    'background: white; ' +
                    'border-radius: 50%;' +
                    '"></div>' +
                    '</div>',
                  className: "standard-marker-icon",
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
                });
                marker = DG.marker(coords, { icon: standardIcon });
              }
              
              if (props.description) {
                marker.bindPopup(props.description, {
                  closeButton: true,
                  closeOnEscapeKey: true,
                  maxWidth: 320,
                  className: 'warehouse-popup'
                });
              }
              
              if (props.title) {
                marker.bindTooltip(props.title, {
                  permanent: false,
                  opacity: 1,
                  className: "warehouse-tooltip",
                  direction: 'top',
                  offset: [0, -15]
                });
              }
              
              marker.addTo(map);
            });
          });
        }
      })(${JSON.stringify(mapConfig)});
    `;

    // Add enhanced CSS styles for map popups and tooltips
    const style = document.createElement('style');
    style.textContent = `
      .warehouse-popup .leaflet-popup-content-wrapper {
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        border: 1px solid #e5e7eb;
        background: white;
      }
      .warehouse-popup .leaflet-popup-content {
        margin: 0;
        line-height: 1.5;
        font-family: 'Montserrat', sans-serif;
      }
      .warehouse-popup .leaflet-popup-tip {
        background: white;
        border: 1px solid #e5e7eb;
      }
      .warehouse-tooltip {
        background: #273655 !important;
        color: white !important;
        border: none !important;
        border-radius: 8px !important;
        font-family: 'Montserrat', sans-serif !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        padding: 10px 16px !important;
        box-shadow: 0 4px 16px rgba(39, 54, 85, 0.4) !important;
        max-width: 380px !important;
        text-align: center !important;
        white-space: normal !important;
      }
      .warehouse-tooltip .leaflet-tooltip-content {
        white-space: normal !important;
        word-break: break-word !important;
      }
      .warehouse-tooltip:before {
        border-top-color: #273655 !important;
      }
      
      .custom-warehouse-marker {
        transition: transform 0.2s ease;
      }
      .custom-warehouse-marker:hover {
        transform: scale(1.1);
      }
      
      .standard-warehouse-marker {
        transition: transform 0.2s ease;
      }
      .standard-warehouse-marker:hover {
        transform: scale(1.15);
      }
      
      .custom-marker-icon, .standard-marker-icon {
        background: transparent !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);

    // Load 2GIS API if not already loaded
    if (!window.DG) {
      const apiScript = document.createElement('script');
      // Добавляем API ключ для 2GIS (нужно получить от api@2gis.com)
      const apiKey = import.meta.env.VITE_2GIS_API_KEY || '';
      const apiKeyParam = apiKey ? `&key=${apiKey}` : '';
      apiScript.src = `https://maps.api.2gis.ru/2.0/loader.js?pkg=full${apiKeyParam}`;
      apiScript.onload = () => {
        document.head.appendChild(script);
      };
      apiScript.onerror = () => {
        console.error('Ошибка загрузки 2GIS API');
        // Показываем fallback сообщение
        if (mapContainer.current) {
          mapContainer.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f3f3f3; border-radius: 24px; color: #666;">
              <div style="text-align: center; padding: 20px;">
                <p style="margin: 0; font-size: 16px;">Карта временно недоступна</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Проверьте подключение к интернету</p>
              </div>
            </div>
          `;
        }
      };
      document.head.appendChild(apiScript);
    } else {
      document.head.appendChild(script);
    }

    return () => {
      const key = cleanupKeyForMapId(mapId);
      if (typeof window[key] === 'function') {
        window[key]();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [warehouses, mapId]);

  return (
      <div className="relative w-full h-full">
        <div
            id={mapId}
            ref={mapContainer}
            className="absolute inset-0 overflow-hidden"
            style={{width: '100%', height: '100%'}}
        />

        {/* Map loading indicator */}
        {warehouses.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#f3f3f3]">
              <div className="flex flex-col items-center justify-center w-full h-full p-8">
                <svg width="80" height="80" fill="none" viewBox="0 0 100 100" className="mb-4 opacity-40">
                  <rect width="100" height="100" rx="24" fill="#E5E7EB"/>
                  <path d="M30 70V40a10 10 0 0 1 10-10h20a10 10 0 0 1 10 10v30" stroke="#A6A6A6" strokeWidth="4"
                        strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="50" cy="55" r="8" stroke="#A6A6A6" strokeWidth="4"/>
                </svg>
                <div className="text-[#A6A6A6] text-lg font-semibold text-center">Загрузка карты...</div>
              </div>
            </div>
        )}

        {/* Map controls overlay */}
        <div
            className="absolute top-4 left-4 z-10 max-w-[min(100%-2rem,220px)] rounded-lg border border-gray-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm sm:max-w-[240px]"
        >
          <div className="font-montserrat text-sm font-bold text-[#273655]">Алматы</div>
          <div className="font-montserrat text-xs text-[#6B6B6B]">
            Складские помещения
          </div>
          <div className="font-montserrat text-xs text-[#6B6B6B]">
            ExtraSpace
          </div>
          <p className="mt-2 hidden border-t border-gray-200/80 pt-2 font-montserrat text-[10px] leading-snug text-[#5c6570] sm:block">
            Перемещение и масштаб: удерживайте <span className="whitespace-nowrap font-semibold text-[#273655]">Ctrl</span> или{' '}
            <span className="font-semibold text-[#273655]">⌘</span> (Mac), затем тяните карту или крутите колёсико
          </p>
        </div>

      </div>
  );
};

export default WarehouseMap; 