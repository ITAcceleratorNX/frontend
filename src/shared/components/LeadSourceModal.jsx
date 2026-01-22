import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

// Импортируем иконки из Figma
import SiteIcon from '@/assets/lead-source-icons/site.png';
import WhatsappIcon from '@/assets/lead-source-icons/whatsapp.png';
import TwoGisIcon from '@/assets/lead-source-icons/2gis.png';
import InstagramIcon from '@/assets/lead-source-icons/instagram.png';
import TiktokIcon from '@/assets/lead-source-icons/tiktok.png';
import AdsIcon from '@/assets/lead-source-icons/ads.png';

const LEAD_SOURCES = [
  { value: 'site', label: 'Сайт', icon: SiteIcon },
  { value: 'whatsapp', label: 'WhatsApp', icon: WhatsappIcon },
  { value: '2gis', label: '2ГИС', icon: TwoGisIcon },
  { value: 'instagram', label: 'Instagram', icon: InstagramIcon },
  { value: 'tiktok', label: 'TikTok', icon: TiktokIcon },
  { value: 'ads', label: 'Реклама', icon: AdsIcon },
];

const STORAGE_KEY = 'extraspace_lead_source';
const STORAGE_SHOWN_KEY = 'extraspace_lead_source_shown';

// Кэш для предзагруженных изображений
const imageCache = new Map();

// Функция предзагрузки изображений
const preloadImages = () => {
  LEAD_SOURCES.forEach((source) => {
    if (!imageCache.has(source.icon)) {
      const img = new Image();
      img.src = source.icon;
      img.loading = 'eager';
      imageCache.set(source.icon, img);
    }
  });
};

// Предзагрузка изображений при первом импорте модуля
if (typeof window !== 'undefined') {
  // Предзагружаем сразу при загрузке модуля
  preloadImages();
  
  // Также предзагружаем через link preload в head
  if (document.head) {
    LEAD_SOURCES.forEach((source) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = source.icon;
      link.crossOrigin = 'anonymous';
      if (!document.querySelector(`link[href="${source.icon}"]`)) {
        document.head.appendChild(link);
      }
    });
  }
}

export const LeadSourceModal = ({ open, onOpenChange, onSelect }) => {
  const [selectedSource, setSelectedSource] = useState(null);
  const preloadTimeoutRef = useRef(null);

  const handleSelect = (source) => {
    setSelectedSource(source);
    // Сохраняем в localStorage
    localStorage.setItem(STORAGE_KEY, source.value);
    localStorage.setItem(STORAGE_SHOWN_KEY, 'true');
    
    if (onSelect) {
      onSelect(source.value);
    }
    
    // Закрываем модальное окно через небольшую задержку для лучшего UX
    setTimeout(() => {
      onOpenChange(false);
    }, 300);
  };

  // Предзагрузка изображений при открытии модального окна
  useEffect(() => {
    if (open) {
      // Предзагружаем все изображения сразу
      preloadImages();
      
      // Дополнительная проверка загрузки изображений для оптимизации
      const checkImagesLoaded = () => {
        LEAD_SOURCES.forEach((source) => {
          const cached = imageCache.get(source.icon);
          if (!cached || !cached.complete) {
            // Если изображение еще не загружено, создаем новый объект Image
            const img = new Image();
            img.src = source.icon;
            img.loading = 'eager';
            imageCache.set(source.icon, img);
          }
        });
      };
      
      checkImagesLoaded();
    } else {
      // Очищаем таймер при закрытии
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
        preloadTimeoutRef.current = null;
      }
    }
    
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, [open]);

  // Если пользователь закрыл модальное окно без выбора, помечаем как показанное
  const handleClose = () => {
    if (!selectedSource) {
      // Пользователь закрыл без выбора - помечаем как показанное, чтобы не показывать снова
      localStorage.setItem(STORAGE_SHOWN_KEY, 'true');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="
        max-w-[680px] 
        w-[calc(100vw-24px)] 
        sm:w-[calc(100vw-48px)] 
        md:w-[calc(100vw-64px)]
        rounded-[25px] 
        p-5 
        sm:p-6 
        md:p-8 
        lg:p-[60px_40px]
        gap-4 
        sm:gap-5 
        md:gap-6
        lg:gap-8
        border-0
        shadow-xl
        [&>button:last-child]:hidden
      ">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 md:right-[26px] md:top-[26px] z-10 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#363636]" />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-2 sm:gap-3 w-full">
          <h2 className="
            font-sf-pro-text 
            font-semibold 
            text-[22px] 
            sm:text-[24px] 
            md:text-[28px] 
            lg:text-[32px] 
            leading-[1.19] 
            text-[#363636]
            tracking-[-0.05em]
          ">
            Откуда вы узнали о нас?
          </h2>
          <p className="
            font-sf-pro-text 
            font-normal 
            text-sm 
            sm:text-base 
            md:text-lg 
            lg:text-xl 
            leading-[1.15] 
            text-[#363636]
          ">
            Помогите нам улучшить сервис, выбрав источник, откуда вы узнали о ExtraSpace
          </p>
        </div>

        {/* Options Grid */}
        <div className="flex flex-col gap-4 sm:gap-5 w-full">
          {/* First row: Сайт, WhatsApp, 2ГИС */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full">
            {LEAD_SOURCES.slice(0, 3).map((source) => {
              const Icon = source.icon;
              const isSelected = selectedSource?.value === source.value;
              
              return (
                <button
                  key={source.value}
                  onClick={() => handleSelect(source)}
                  className={`
                    flex flex-col items-center justify-center 
                    gap-1.5 sm:gap-2
                    p-3 sm:p-4 md:p-5 lg:p-8
                    rounded-[25px]
                    transition-all duration-200
                    bg-gradient-to-b from-[#26B3AB] to-[#00A991]
                    hover:opacity-90
                    active:opacity-80
                    ${isSelected ? 'ring-2 ring-[#363636] ring-offset-2' : ''}
                    w-full
                    min-h-[100px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[160px]
                  `}
                >
                  <div className="
                    w-10 h-10 
                    sm:w-14 sm:h-14 
                    md:w-16 md:h-16 
                    lg:w-20 lg:h-20
                    flex items-center justify-center
                    relative
                  ">
                    <img 
                      src={Icon} 
                      alt={source.label}
                      className="w-full h-full object-contain"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      onError={(e) => {
                        console.error(`Ошибка загрузки иконки ${source.label}:`, Icon);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        if (import.meta.env.DEV) {
                          console.log(`✅ Иконка ${source.label} загружена:`, Icon);
                        }
                      }}
                    />
                  </div>
                  <span className="
                    font-sf-pro-text 
                    font-medium 
                    text-xs 
                    sm:text-sm 
                    md:text-base 
                    lg:text-lg 
                    leading-[1.4] 
                    text-[#F5F5F5]
                    text-center
                  ">
                    {source.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Second row: Instagram, TikTok, Реклама */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full">
            {LEAD_SOURCES.slice(3, 6).map((source) => {
              const Icon = source.icon;
              const isSelected = selectedSource?.value === source.value;
              
              return (
                <button
                  key={source.value}
                  onClick={() => handleSelect(source)}
                  className={`
                    flex flex-col items-center justify-center 
                    gap-1.5 sm:gap-2
                    p-3 sm:p-4 md:p-5 lg:p-8
                    rounded-[25px]
                    transition-all duration-200
                    bg-gradient-to-b from-[#26B3AB] to-[#00A991]
                    hover:opacity-90
                    active:opacity-80
                    ${isSelected ? 'ring-2 ring-[#363636] ring-offset-2' : ''}
                    w-full
                    min-h-[100px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[160px]
                  `}
                >
                  <div className="
                    w-10 h-10 
                    sm:w-14 sm:h-14 
                    md:w-16 md:h-16 
                    lg:w-20 lg:h-20
                    flex items-center justify-center
                    relative
                  ">
                    <img 
                      src={Icon} 
                      alt={source.label}
                      className="w-full h-full object-contain"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      onError={(e) => {
                        console.error(`Ошибка загрузки иконки ${source.label}:`, Icon);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        if (import.meta.env.DEV) {
                          console.log(`✅ Иконка ${source.label} загружена:`, Icon);
                        }
                      }}
                    />
                  </div>
                  <span className="
                    font-sf-pro-text 
                    font-medium 
                    text-xs 
                    sm:text-sm 
                    md:text-base 
                    lg:text-lg 
                    leading-[1.4] 
                    text-[#F5F5F5]
                    text-center
                  ">
                    {source.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer text */}
        <p className="
          font-sf-pro-text 
          font-normal 
          text-xs 
          sm:text-sm 
          md:text-base 
          lg:text-lg 
          leading-[1.4] 
          text-[#5C5C5C]
          text-center
          w-full
        ">
          Вы можете пропустить этот вопрос, но ваша информация поможет нам стать лучше
        </p>
      </DialogContent>
    </Dialog>
  );
};

// Хук для получения сохраненного источника лида
export const useLeadSource = () => {
  const [leadSource, setLeadSource] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setLeadSource(saved);
    }
  }, []);

  const saveLeadSource = (source) => {
    localStorage.setItem(STORAGE_KEY, source);
    setLeadSource(source);
  };

  const clearLeadSource = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLeadSource(null);
  };

  return { leadSource, saveLeadSource, clearLeadSource };
};

// Проверка, показывалось ли уже модальное окно
export const shouldShowLeadSourceModal = () => {
  return localStorage.getItem(STORAGE_SHOWN_KEY) !== 'true';
};

// Получить сохраненный источник лида
export const getStoredLeadSource = () => {
  return localStorage.getItem(STORAGE_KEY);
};
