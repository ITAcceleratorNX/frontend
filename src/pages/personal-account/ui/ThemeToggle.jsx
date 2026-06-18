import React from 'react';
import clsx from 'clsx';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '../../../components/ui/switch';
import { useTheme } from '../../../shared/context/ThemeContext';

const ThemeToggle = ({ className, compact = false }) => {
  const { isDark, setTheme } = useTheme();

  return (
    <div
      className={clsx(
        'flex items-center gap-3',
        compact ? 'justify-between w-full' : 'justify-between px-1 py-2',
        className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {isDark ? (
          <Moon className={clsx('w-4 h-4 flex-shrink-0', isDark ? 'text-[var(--staff-brand-light,#00A991)]' : 'text-gray-500')} />
        ) : (
          <Sun className="w-4 h-4 flex-shrink-0 text-amber-500" />
        )}
        {!compact && (
          <span
            className={clsx(
              'text-sm font-medium',
              isDark ? 'text-[var(--staff-text-secondary,#6B7280)]' : 'text-gray-600',
            )}
          >
            {isDark ? 'Тёмная тема' : 'Светлая тема'}
          </span>
        )}
        {compact && (
          <span
            className={clsx(
              'text-sm font-medium',
              isDark ? 'text-[var(--staff-text,#f0f2f2)]' : 'text-gray-700',
            )}
          >
            Тема оформления
          </span>
        )}
      </div>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
        className="scale-90"
      />
    </div>
  );
};

export default ThemeToggle;
