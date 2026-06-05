import React, { useMemo } from 'react';
import { DateField } from '@/shared/ui/DateField.jsx';

export default function LockerDatePicker({
  value,
  onChange,
  error,
  minDateISO,
  id,
}) {
  const minDate = useMemo(() => {
    if (!minDateISO) return null;
    const [y, m, d] = minDateISO.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [minDateISO]);

  return (
    <DateField
      id={id}
      label="Дата начала"
      value={value}
      onChange={onChange}
      error={error}
      allowFutureDates
      minDate={minDate}
      variant="account"
    />
  );
}
