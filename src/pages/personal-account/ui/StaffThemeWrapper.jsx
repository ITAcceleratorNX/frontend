import React from 'react';
import clsx from 'clsx';
import { useTheme } from '../../../shared/context/ThemeContext';

const StaffThemeWrapper = ({ children, className }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={clsx(className, isDark && 'staff-cabinet')}
      {...(isDark ? { 'data-theme': 'staff-dark' } : {})}
    >
      {children}
    </div>
  );
};

export default StaffThemeWrapper;
