import React from "react";

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
  isPriceLoading = false,
}) {
  const endLabel = formatEndDateRu(endDateISO);

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-3xl bg-transparent p-4 sm:p-6">
      <h3 className="text-lg font-bold text-[#373737] mb-4">Итог</h3>

      {isPriceLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin h-4 w-4 border-2 border-t-[#273655] border-b-[#273655] rounded-full" />
          Расчёт...
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="text-lg font-bold text-[#273655] flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="shrink-0">К оплате:</span>
              <span className="inline-flex items-center gap-1 shrink-0">
                {totalPrice != null && Number.isFinite(Number(totalPrice)) ? (
                  <>
                    <span className="text-2xl tabular-nums">
                      {Number(totalPrice).toLocaleString("ru-RU")}
                    </span>
                    <span className="text-2xl leading-none">₸</span>
                  </>
                ) : (
                  <span className="text-2xl">—</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-[#5C625F] sm:flex-row sm:items-center sm:justify-between sm:gap-4 pt-1 border-t border-gray-200">
            <span>
              <span className="font-medium text-[#273655]">Завершение:</span> {endLabel}
            </span>
            {priceLine && (
              <span className="font-medium text-[#273655] sm:text-right">{priceLine}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
