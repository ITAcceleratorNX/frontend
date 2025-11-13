import React, { useId } from 'react';
import { Info } from 'lucide-react';
import clsx from 'clsx';

const PLACEMENTS = {
  right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  left: 'right-full top-1/2 -translate-y-1/2 mr-3',
  top: 'left-1/2 bottom-full -translate-x-1/2 mb-3',
  bottom: 'left-1/2 top-full -translate-x-1/2 mt-3',
};

const tooltipContent = (
  <>
    <span className="block text-sm font-semibold text-slate-800 mb-1">
      Зачем мы просим ИИН?
    </span>
    <span className="block text-xs leading-relaxed text-slate-600">
      ИИН используется для надёжного оформления и подписания договора.
      <br />
      Вся информация обрабатывается конфиденциально и защищена.
    </span>
  </>
);

const IinTooltip = ({ placement = 'right' }) => {
  const tooltipId = useId();
  const placementClass = PLACEMENTS[placement] || PLACEMENTS.right;
  const responsiveFallback =
    placement === 'right'
      ? 'max-sm:left-1/2 max-sm:top-full max-sm:-translate-x-1/2 max-sm:translate-y-2 max-sm:ml-0'
      : placement === 'left'
      ? 'max-sm:left-1/2 max-sm:top-full max-sm:-translate-x-1/2 max-sm:translate-y-2 max-sm:mr-0'
      : '';

  return (
    <span
      className="relative inline-flex items-center group"
    >
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#273655]/30 bg-[#273655]/5 text-[#273655] transition-colors hover:bg-[#273655]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#273655]"
        aria-describedby={tooltipId}
        aria-label="Почему требуется ИИН"
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
      </button>

      <span
        role="tooltip"
        id={tooltipId}
        className={clsx(
          'pointer-events-none absolute z-20 w-64 max-w-xs rounded-lg border border-slate-200 bg-white px-4 py-3 text-left shadow-xl transition-all duration-200 ease-out',
          'opacity-0 invisible translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0',
          placementClass,
          responsiveFallback
        )}
      >
        {tooltipContent}
      </span>
    </span>
  );
};

export default IinTooltip;

