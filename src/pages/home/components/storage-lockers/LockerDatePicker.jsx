import React, { useMemo } from "react";
import DatePicker from "@/shared/ui/DatePicker";
import { cn } from "@/shared/lib/utils";

export default function LockerDatePicker({
  value,
  onChange,
  error,
  minDateISO,
  id,
}) {
  const minDate = useMemo(() => {
    if (!minDateISO) return null;
    const [y, m, d] = minDateISO.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [minDateISO]);

  return (
    <DatePicker
      id={id}
      label={<span className="sr-only">Дата начала</span>}
      value={value}
      onChange={onChange}
      error={error}
      allowFutureDates
      minDate={minDate}
      placeholder="ДД.ММ.ГГГГ"
      className={cn(
        "[&>div]:!min-h-[52px] [&>div]:rounded-2xl [&>div]:border [&>div]:border-gray-200 [&>div]:bg-white [&>div]:p-3 [&>div]:shadow-sm",
        "[&>div]:hover:bg-gray-50/90 [&>div]:focus-within:ring-2 [&>div]:focus-within:!ring-[#31876D] [&>div]:focus-within:border-transparent",
        "[&_label]:sr-only"
      )}
    />
  );
}
