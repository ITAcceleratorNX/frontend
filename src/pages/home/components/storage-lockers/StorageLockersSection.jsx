import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getTodayLocalDateString } from "@/shared/lib/utils/date";
import { showSuccessToast } from "@/shared/lib/toast";
import LeftCapacityGuide from "./LeftCapacityGuide";
import RightLockerForm from "./RightLockerForm";
import {
  computeLockerEndDateISO,
  computeLockerTotalPrice,
  isStartDateInPast,
} from "./useLockerPricing";

/**
 * @param {{ isActive?: boolean; onCallbackClick?: () => void }} props
 */
export default function StorageLockersSection({
  isActive = true,
  onCallbackClick,
}) {
  const [locationId, setLocationId] = useState("mega");
  const [volumeM3, setVolumeM3] = useState(1);
  const [startDate, setStartDate] = useState(() => getTodayLocalDateString());
  const [days, setDays] = useState(1);

  const todayISO = useMemo(() => getTodayLocalDateString(), []);

  const endDateISO = useMemo(
    () => computeLockerEndDateISO(startDate, days),
    [startDate, days]
  );

  const totalPrice = useMemo(
    () => computeLockerTotalPrice(volumeM3, days),
    [volumeM3, days]
  );

  const startDateError = useMemo(() => {
    if (isStartDateInPast(startDate, todayISO)) {
      return "Дата начала не может быть в прошлом";
    }
    return "";
  }, [startDate, todayISO]);

  const daysError = useMemo(() => {
    if (days < 1) return "Минимум 1 день";
    return "";
  }, [days]);

  const priceLine = useMemo(() => {
    if (days === 1) return `${volumeM3} м³ x 4000 ₸`;
    return `${volumeM3} м³ x ${days} дн. x 3000 ₸`;
  }, [volumeM3, days]);

  const canSubmit = !startDateError && !daysError && days >= 1 && totalPrice > 0;

  useEffect(() => {
    if (!isActive || typeof window === "undefined") return;
    localStorage.setItem("prep_duration", String(days));
    localStorage.setItem("prep_area", String(volumeM3));
    localStorage.setItem("calculated_price", String(totalPrice));
  }, [isActive, days, volumeM3, totalPrice]);

  const handleBook = useCallback(() => {
    if (!canSubmit) return;
    showSuccessToast(
      "Заявка на камеру хранения учтена. Менеджер свяжется с вами для подтверждения."
    );
  }, [canSubmit]);

  const handleCallback = useCallback(() => {
    onCallbackClick?.();
  }, [onCallbackClick]);

  return (
    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
      <LeftCapacityGuide volumeM3={volumeM3} />
      <RightLockerForm
        locationId={locationId}
        onLocationChange={setLocationId}
        volumeM3={volumeM3}
        onVolumeChange={setVolumeM3}
        startDate={startDate}
        onStartDateChange={setStartDate}
        startDateError={startDateError}
        minDateISO={todayISO}
        days={days}
        onDaysChange={setDays}
        daysError={daysError}
        endDateISO={endDateISO}
        totalPrice={totalPrice}
        priceLine={priceLine}
        onBook={handleBook}
        onCallback={handleCallback}
        canSubmit={canSubmit}
      />
    </div>
  );
}
