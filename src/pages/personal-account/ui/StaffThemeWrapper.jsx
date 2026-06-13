import React from 'react';
import clsx from 'clsx';
import { isStaffRole } from '../../../shared/lib/utils/isStaffRole';

const StaffThemeWrapper = ({ user, children, className }) => {
  const isStaff = isStaffRole(user?.role);

  return (
    <div
      className={clsx(className, isStaff && 'staff-cabinet')}
      {...(isStaff ? { 'data-theme': 'staff-dark' } : {})}
    >
      {children}
    </div>
  );
};

export default StaffThemeWrapper;
