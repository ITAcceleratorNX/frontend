import React, { Suspense, forwardRef, lazy } from 'react';
import { ChevronLeft } from 'lucide-react';

// HomePage is heavy — load it on demand only when the calculator opens the scheme.
const HomePage = lazy(() => import('../../home/index.jsx'));

/**
 * Renders the original HomePage booking flow (same map, same tariffs, same lockers picker)
 * as an inline section on a product page. HomePage internally toggles to its "embed" mode
 * via the `bookingEmbedFormat` prop: it suppresses the main-site Header/Hero/sections/Footer
 * and unwraps the Dialog into a plain inline block.
 */
const InlineBookingScheme = forwardRef(function InlineBookingScheme(
  { format, params, onReset },
  ref,
) {
  return (
    <section
      ref={ref}
      id="kalkulyator"
      className="w-full scroll-mt-16 bg-stone-50 py-6 sm:py-8 lg:py-10"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#31876D] hover:text-[#276b57]"
          >
            <ChevronLeft size={16} aria-hidden />
            Изменить параметры в калькуляторе
          </button>
        )}
        <Suspense
          fallback={
            <div className="flex h-[60vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent border-[#31876D]" />
            </div>
          }
        >
          <HomePage
            bookingEmbedFormat={format}
            embedInitialVolume={params?.volume ?? null}
            embedInitialMonths={params?.months ?? null}
            embedInitialDays={params?.days ?? null}
          />
        </Suspense>
      </div>
    </section>
  );
});

export default InlineBookingScheme;
