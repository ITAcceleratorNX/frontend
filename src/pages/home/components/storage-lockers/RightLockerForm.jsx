import React from "react";
import { MapPin, Package, Calendar, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VolumePills from "./VolumePills";
import LockerStepper from "./LockerStepper";
import LockerDatePicker from "./LockerDatePicker";
import LockerSummary from "./LockerSummary";

const ACCENT = "#439F7E";

const LOCATIONS = [
  { id: "comfort", label: "ЖК Комфорт Сити" },
  { id: "mega", label: "ЖК Мега Товерс" },
];

export default function RightLockerForm({
  locationId,
  onLocationChange,
  volumeM3,
  onVolumeChange,
  startDate,
  onStartDateChange,
  startDateError,
  minDateISO,
  days,
  onDaysChange,
  daysError,
  endDateISO,
  totalPrice,
  priceLine,
  onBook,
  onCallback,
  canSubmit,
}) {
  return (
    <div className="flex min-h-[420px] flex-col rounded-3xl bg-white p-6 shadow-lg sm:p-8 lg:p-10">
      <header className="mb-8">
        <h2 className="font-soyuz-grotesk
 text-2xl font-bold tracking-tight text-[#202422] sm:text-3xl">
          Камера хранения
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#5C625F] sm:text-base">
          Краткосрочное хранение без доставки. Вы привозите и забираете вещи самостоятельно.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-7">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#202422]">
            <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} aria-hidden />
            Локация:
          </label>
          <Select value={locationId} onValueChange={onLocationChange}>
            <SelectTrigger
              className="h-[52px] w-full rounded-2xl border border-gray-200 bg-white text-left text-base font-medium text-[#202422] shadow-sm focus:ring-2 focus:ring-[#439F7E] focus:ring-offset-0"
            >
              <SelectValue placeholder="Выберите локацию" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#202422]">
            <Package className="h-4 w-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} aria-hidden />
            Объем бокса:
          </label>
          <VolumePills value={volumeM3} onChange={onVolumeChange} />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-4">
          <div>
            <label
              htmlFor="locker-start-date"
              className="mb-2 flex items-center gap-2 text-sm font-medium text-[#202422]"
            >
              <Calendar className="h-4 w-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} aria-hidden />
              Дата начала:
            </label>
            <LockerDatePicker
              id="locker-start-date"
              value={startDate}
              onChange={onStartDateChange}
              error={startDateError}
              minDateISO={minDateISO}
            />
          </div>
          <div>
            <LockerStepper
              label="Срок (дней):"
              labelIcon={Clock}
              value={days}
              onChange={onDaysChange}
              min={1}
              max={14}
            />
            {daysError && (
              <p className="mt-1.5 text-xs text-red-600">{daysError}</p>
            )}
          </div>
        </div>

        <LockerSummary
          endDateISO={endDateISO}
          totalPrice={totalPrice}
          priceLine={priceLine}
        />

        <div className="mt-auto space-y-3 pt-2">
          <button
            type="button"
            onClick={onBook}
            disabled={!canSubmit}
            className="w-full rounded-[20px] py-3.5 text-base font-bold text-white shadow-md transition-all hover:opacity-95 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-45"
            style={{
              backgroundColor: ACCENT,
              boxShadow: "0 6px 20px -6px rgba(67, 159, 126, 0.55)",
            }}
          >
            Забронировать бокс
          </button>
          <button
            type="button"
            onClick={onCallback}
            className="w-full rounded-[20px] border border-[#C5CAC8] bg-white py-3.5 text-base font-semibold text-[#3D4542] transition-colors hover:bg-[#F7FAF9]"
          >
            Заказать обратный звонок
          </button>
        </div>
      </div>
    </div>
  );
}
