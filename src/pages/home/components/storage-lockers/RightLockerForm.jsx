import React from "react";
import { MapPin, Package, Calendar, Clock, User } from "lucide-react";
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

const ACCENT = "#31876D";

export default function RightLockerForm({
  locations = [],
  warehouseId = null,
  onWarehouseChange,
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
  isSubmitting = false,
  isPriceLoading = false,
  priceError = "",
  isAdminOrManager = false,
  selectedClientUser = null,
  onOpenClientSelector,
}) {
  return (
    <div className="flex min-h-[450px] flex-col rounded-3xl bg-[#F7FAF9] p-6 shadow-lg">
      <h2 className="font-soyuz-grotesk mb-6 text-2xl font-bold text-[#202422] sm:text-3xl">
        Настройте камеру хранения
      </h2>

      <div className="flex flex-1 flex-col gap-6">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#202422]">
            <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} aria-hidden />
            Локация:
          </label>
          {locations.length === 0 ? (
            <p className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#5C625F]">
              Загрузка списка складов…
            </p>
          ) : (
            <Select
              value={warehouseId != null ? String(warehouseId) : undefined}
              onValueChange={(v) => onWarehouseChange?.(Number(v))}
            >
              <SelectTrigger className="h-[52px] w-full rounded-2xl border border-gray-200 bg-white text-left text-base font-medium text-[#202422] shadow-sm focus:ring-2 focus:ring-[#31876D] focus:ring-offset-0">
                <SelectValue placeholder="Выберите склад" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={String(l.id)}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
          isPriceLoading={isPriceLoading}
        />

        {priceError ? (
          <p className="text-sm text-red-600" role="alert">
            {priceError}
          </p>
        ) : null}

        {isAdminOrManager && (
          <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#202422] font-semibold">
                <User className="w-5 h-5 shrink-0" />
                <span>Клиент</span>
              </div>
              <button
                type="button"
                onClick={() => onOpenClientSelector?.()}
                className="px-4 py-2 text-sm font-medium text-[#31876D] border border-[#31876D] rounded-lg hover:bg-[#31876D] hover:text-white transition-colors"
              >
                {selectedClientUser ? "Изменить" : "Выбрать клиента"}
              </button>
            </div>
            {selectedClientUser && (
              <div className="bg-[#31876D]/10 rounded-lg p-3">
                <div className="text-sm font-medium text-[#202422]">
                  {selectedClientUser.name || "Без имени"}
                </div>
                <div className="text-xs text-gray-600">{selectedClientUser.email}</div>
                {selectedClientUser.phone && (
                  <div className="text-xs text-gray-500">Телефон: {selectedClientUser.phone}</div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-auto space-y-3 pt-2">
          <button
            type="button"
            onClick={onBook}
            disabled={!canSubmit || isSubmitting || isPriceLoading}
            className="w-full bg-[#31876D] text-white font-semibold py-2.5 px-6 rounded-3xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "СОЗДАНИЕ ЗАКАЗА..." : "Забронировать бокс"}
          </button>
          <button
            type="button"
            onClick={onCallback}
            className="w-full bg-transparent border border-gray-300 text-[#616161] font-semibold py-2.5 px-6 rounded-3xl hover:bg-gray-100/50 transition-colors"
          >
            заказать обратный звонок
          </button>
        </div>
      </div>
    </div>
  );
}
