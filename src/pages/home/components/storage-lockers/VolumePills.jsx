import React from "react";
import { cn } from "@/shared/lib/utils";

const VOLUMES = [1, 2, 3, 4];

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
                ? "bg-[#31876D] text-white shadow-md shadow-[#31876D]/35"
                : "bg-[#E8EBEA] text-[#3D4542] hover:bg-[#DDE3E0]"
            )}
          >
            {m} m³
          </button>
        );
      })}
    </div>
  );
}
