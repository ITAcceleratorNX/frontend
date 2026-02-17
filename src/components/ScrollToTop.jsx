import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SCROLL_TOP_PATHS = ["/", "/about-warehouse-rental", "/public-offer", "/privacy-policy", "/online-payment"];

// Функция для сброса масштаба viewport на мобильных устройствах
const resetViewportZoom = () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        // Временно изменяем viewport для принудительного сброса масштаба
        const originalContent = viewport.getAttribute('content');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        
        // Восстанавливаем оригинальное содержимое после небольшой задержки
        setTimeout(() => {
            viewport.setAttribute('content', originalContent || 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        }, 50);
    }
};

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        if (SCROLL_TOP_PATHS.includes(pathname)) {
            window.scrollTo(0, 0);
        }
        
        // Сбрасываем масштаб viewport на мобильных устройствах при изменении маршрута
        // Это предотвращает проблему с автоматическим зумом после логина
        resetViewportZoom();
        
        // Дополнительный сброс после небольшой задержки для надежности
        const timeoutId1 = setTimeout(resetViewportZoom, 100);
        const timeoutId2 = setTimeout(resetViewportZoom, 300);
        
        return () => {
            clearTimeout(timeoutId1);
            clearTimeout(timeoutId2);
        };
    }, [pathname]);

    return null;
}
