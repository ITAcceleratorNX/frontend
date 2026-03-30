import React from "react";
import { cn } from "@/shared/lib/utils";

const VOLUMES = [1, 2, 3, 4];
const ACCENT = "#439F7E";

export default function VolumePills({ value, onChange, className }) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {VOLUMES.map((m) => {
        const active = value === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              "min-w-[4.25rem] px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200",
              "shadow-sm hover:shadow active:scale-[0.98]",
              active
                ? "text-white shadow-md"
                : "bg-[#E8EBEA] text-[#3D4542] hover:bg-[#DDE3E0]"
            )}
            style={
              active
                ? {
                    backgroundColor: ACCENT,
                    boxShadow: `0 4px 14px -4px ${ACCENT}80`,
                  }
                : undefined
            }
          >
            {m} m³
          </button>
        );
      })}
    </div>
  );
}
