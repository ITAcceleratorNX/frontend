import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const CABINET_PATH_RE = /^\/(personal-account|user\/delivery|admin\/users\/|admin\/moving\/|manager\/moving\/)/;

/**
 * Синхронизирует data-theme на <html> для маршрутов личного кабинета.
 * Нужно, чтобы порталы Radix (Dialog, Select, Popover) наследовали тёмную тему.
 */
const CabinetThemeSync = () => {
  const { isDark } = useTheme();
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.documentElement;
    const inCabinet = CABINET_PATH_RE.test(pathname);

    if (inCabinet && isDark) {
      root.setAttribute('data-theme', 'staff-dark');
      root.classList.add('staff-cabinet');
      root.style.colorScheme = 'dark';
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('staff-cabinet');
      root.style.colorScheme = '';
    }
  }, [isDark, pathname]);

  return null;
};

export default CabinetThemeSync;
