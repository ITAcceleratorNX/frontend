import React from "react";
import { Info } from "lucide-react";
import { formatLockerPriceKzt } from "./useLockerPricing";

const ACCENT = "#439F7E";

function formatEndDateRu(iso) {
  if (!iso) return "—";
  const p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!p) return "—";
  const d = new Date(Number(p[1]), Number(p[2]) - 1, Number(p[3]));
  if (Number.isNaN(d.getTime())) return "—";
  const s = d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (/\sг\.?$/.test(s)) return s;
  return `${s} г.`;
}

export default function LockerSummary({
  endDateISO,
  totalPrice,
  priceLine,
  showUpdatedBadge = true,
}) {
  const endLabel = formatEndDateRu(endDateISO);

  return (
    <div
      className="rounded-3xl border-2 border-dashed p-5 sm:p-6"
      style={{
        borderColor: `${ACCENT}66`,
        background: "linear-gradient(180deg, rgba(67,159,126,0.12) 0%, rgba(67,159,126,0.05) 100%)",
      }}
    >
      <div className="mb-1 flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-[#6B7570]">Итого к оплате</span>
        {showUpdatedBadge && (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-[#2d6b58]"
            style={{ backgroundColor: "rgba(67,159,126,0.18)" }}
          >
            <Info className="h-3.5 w-3.5" strokeWidth={2.25} style={{ color: ACCENT }} />
            Расчет обновлен
          </span>
        )}
      </div>

      <p className="text-3xl font-bold tracking-tight text-[#202422] sm:text-[2rem] sm:leading-tight">
        {formatLockerPriceKzt(totalPrice)}
      </p>

      <div className="mt-5 flex flex-col gap-2 text-sm text-[#5C625F] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span>
          <span className="font-medium text-[#202422]">Завершение:</span> {endLabel}
        </span>
        {priceLine && (
          <span className="font-medium text-[#202422] sm:text-right">{priceLine}</span>
        )}
      </div>
    </div>
  );
}
