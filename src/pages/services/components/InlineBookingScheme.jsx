import React, { Suspense, forwardRef, lazy } from 'react';

const HomePage = lazy(() => import('../../home/index.jsx'));

/**
 * Inline booking on product pages: warehouse map (INDIVIDUAL), cloud tariffs (CLOUD),
 * or lockers form (LOCKERS). Uses the same HomePage flow as the main-site modal.
 */
const InlineBookingScheme = forwardRef(function InlineBookingScheme({ format }, ref) {
  return (
    <section
      ref={ref}
      id="booking-scheme"
      className="w-full scroll-mt-16 bg-stone-50 py-6 sm:py-8 lg:py-10"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex h-[60vh] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent border-[#31876D]" />
            </div>
          }
        >
          <HomePage bookingEmbedFormat={format} />
        </Suspense>
      </div>
    </section>
  );
});

export default InlineBookingScheme;
