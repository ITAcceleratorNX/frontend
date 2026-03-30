import React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const ACCENT = "#31876D";

export default function LockerStepper({
  value,
  onChange,
  min = 1,
  max = 14,
  label,
  labelIcon: LabelIcon,
  className,
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <span className="mb-2 flex items-center gap-2 text-sm font-medium text-[#202422]">
          {LabelIcon && (
            <LabelIcon className="h-4 w-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} aria-hidden />
          )}
          {label}
        </span>
      )}
      <div
        className={cn(
          "flex h-[52px] items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-0 shadow-sm"
        )}
      >
        <button
          type="button"
          onClick={dec}
          disabled={value <= min}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
            "border border-gray-200/80 bg-[#F5F7F6] shadow-sm hover:bg-[#EBEFED]",
            "disabled:pointer-events-none disabled:opacity-35"
          )}
          style={{ color: ACCENT }}
          aria-label="Уменьшить"
        >
          <Minus className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <span className="min-w-[2ch] text-center text-base font-semibold tabular-nums text-[#202422]">
          {value}
        </span>
        <button
          type="button"
          onClick={inc}
          disabled={value >= max}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all",
            "border border-gray-200/80 bg-[#F5F7F6] shadow-sm hover:bg-[#EBEFED]",
            "disabled:pointer-events-none disabled:opacity-35"
          )}
          style={{ color: ACCENT }}
          aria-label="Увеличить"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
