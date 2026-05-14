import React, { useEffect, useCallback } from 'react';
import { initAttribution } from '@/shared/lib/attribution.js';
import { trackBookingClick } from '@/shared/lib/analytics.js';
import LpHeader from './LpHeader.jsx';
import LpFooter from './LpFooter.jsx';

/**
 * Wrapper around the LP body. On mount:
 *   - Initializes attribution (GCLID/UTM persistence per ТЗ §3.6).
 *   - Якоря (#ceny, #faq, …) обрабатывает браузер + scroll-margin-top в CSS (без JS).
 *
 * GTM container (GTM-KC2QCVNN) подключён через snippet прямо в frontend/index.html
 * — он покрывает и главную, и все 3 LP. Здесь делать ничего не нужно.
 */
export default function LpLayout({ children, onHeaderCta, ctaLabel, bookingServiceType }) {
  useEffect(() => {
    initAttribution();
  }, []);

  const handleHeaderBookClick = useCallback(() => {
    if (bookingServiceType) {
      trackBookingClick({
        section: 'header',
        service_type: bookingServiceType,
        box_size: null,
      });
    }
    onHeaderCta?.();
  }, [bookingServiceType, onHeaderCta]);

  return (
    <div className="lp-page flex min-h-screen flex-col bg-white text-[#202422]">
      <LpHeader onBookClick={handleHeaderBookClick} ctaLabel={ctaLabel} />
      <main className="flex-1">{children}</main>
      <LpFooter />
    </div>
  );
}
