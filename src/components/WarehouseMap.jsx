import React, { useEffect, useRef } from 'react';

const WarehouseMap = ({ warehouses = [] }) => {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || warehouses.length === 0) return;

    // Create 2GIS map configuration
    const mapConfig = {
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
      },
      isWheelZoomEnabled: true
    };

    // Create the 2GIS map script with improved logic
    const script = document.createElement('script');
    script.innerHTML = `
      (function(config){
        var geometries = config.orderedGeometries;
        var mapPosition = config.mapPosition;
        var isWheelZoomEnabled = config.isWheelZoomEnabled;
        
        if (typeof DG !== 'undefined') {
          DG.then(function(){
            var map = DG.map("warehouse-map", {
              center: [mapPosition.lat, mapPosition.lon],
              zoom: mapPosition.zoom,
              scrollWheelZoom: isWheelZoomEnabled,
              zoomControl: !isWheelZoomEnabled
            });
            
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
        padding: 10px 14px !important;
        box-shadow: 0 4px 16px rgba(39, 54, 85, 0.4) !important;
        max-width: 250px !important;
        text-align: center !important;
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
      // Cleanup script
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [warehouses]);

  return (
      <div className="relative w-full h-full">
        <div
            id="warehouse-map"
            ref={mapContainer}
            className="absolute inset-0 rounded-3xl shadow-lg overflow-hidden"
            style={{width: '100%', height: '100%'}}
        />

        {/* Map loading indicator */}
        {warehouses.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#f3f3f3] rounded-3xl">
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
            className="absolute top-4 left-4 bg-white/35 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-sm z-10"
        >
          <div className="text-sm font-bold text-[#273655] font-montserrat">Алматы</div>
          <div className="text-xs text-[#6B6B6B] font-montserrat">
            Складские помещения
          </div>
          <div className="text-xs text-[#6B6B6B] font-montserrat">
            ExtraSpace
          </div>
        </div>

      </div>
  );
};

export default WarehouseMap; 