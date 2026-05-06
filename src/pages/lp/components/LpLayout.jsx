import React, { useEffect } from 'react';
import { initAttribution } from '@/shared/lib/attribution.js';
import { ensureGtmInjected } from '@/shared/lib/analytics.js';
import LpHeader from './LpHeader.jsx';
import LpFooter from './LpFooter.jsx';

/**
 * Wrapper around the LP body. On mount:
 *   - Initializes attribution (GCLID/UTM persistence per ТЗ §3.6).
 *   - Lazily injects GTM container if VITE_GTM_ID is configured.
 *   - Scrolls to anchor (for #remont / #pereezd / #shiny / #biznes deep-links).
 */
export default function LpLayout({ children, onHeaderCta, ctaLabel }) {
  useEffect(() => {
    initAttribution();
    ensureGtmInjected(import.meta.env.VITE_GTM_ID);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash) return;
    const id = setTimeout(() => {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 250);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#202422]">
      <LpHeader onBookClick={onHeaderCta} ctaLabel={ctaLabel} />
      <main className="flex-1">{children}</main>
      <LpFooter />
    </div>
  );
}
