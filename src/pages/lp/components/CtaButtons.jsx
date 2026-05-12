import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { trackEvent, LP_EVENTS } from '@/shared/lib/analytics.js';

/**
 * Reusable phone-gating CTA buttons:
 *  - "Показать номер" — ALWAYS opens the phone gating modal (no tel: link).
 *  - "Написать в WhatsApp" — direct wa.me link, fires whatsapp_click event.
 *
 * Section param is used in GTM events so we can split conversions by hero / final / etc.
 */

const WHATSAPP_LINK_BASE = 'https://wa.me/77783911425';

const SERVICE_MESSAGES = {
  individual: 'Здравствуйте! Хочу подобрать индивидуальный бокс в ExtraSpace.',
  camera: 'Здравствуйте! Хочу узнать про камеру хранения ExtraSpace.',
  cloud: 'Здравствуйте! Хочу узнать про облачное хранение ExtraSpace.',
};

export function PhoneGatingButton({
  onClick,
  section,
  serviceType,
  variant = 'secondary',
  className = '',
  label = 'Показать номер',
}) {
  const handleClick = () => {
    trackEvent(LP_EVENTS.PHONE_CLICK, {
      landing_page: typeof window !== 'undefined' ? window.location.pathname : '',
      section,
      service_type: serviceType,
    });
    onClick?.();
  };

  const base =
    'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition sm:h-14 sm:px-8 sm:text-base';
  const variants = {
    primary: 'bg-[#31876D] text-white hover:bg-[#2a7260]',
    secondary:
      'border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20',
    outline:
      'border border-[#31876D] bg-white text-[#31876D] hover:bg-[#31876D]/10',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-show-phone ${base} ${variants[variant] || variants.secondary} ${className}`}
    >
      <Phone size={16} aria-hidden />
      {label}
    </button>
  );
}

export function WhatsAppButton({
  serviceType = 'individual',
  section,
  variant = 'whatsapp',
  className = '',
  label = 'Написать в WhatsApp',
}) {
  const message = encodeURIComponent(SERVICE_MESSAGES[serviceType] || SERVICE_MESSAGES.individual);
  const href = `${WHATSAPP_LINK_BASE}?text=${message}`;

  const base =
    'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition sm:h-14 sm:px-8 sm:text-base';
  const variants = {
    whatsapp: 'bg-[#128C7E] text-white hover:bg-[#0e7568]',
    outline:
      'border border-[#128C7E] bg-white text-[#128C7E] hover:bg-[#128C7E]/10',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackEvent(LP_EVENTS.WHATSAPP_CLICK, {
          landing_page: typeof window !== 'undefined' ? window.location.pathname : '',
          section,
          service_type: serviceType,
        })
      }
      className={`${base} ${variants[variant] || variants.whatsapp} ${className}`}
    >
      <MessageCircle size={16} aria-hidden />
      {label}
    </a>
  );
}

export function BookingCtaButton({
  onClick,
  section,
  serviceType,
  boxSize,
  variant = 'primary',
  className = '',
  children,
  type = 'button',
}) {
  const handleClick = (e) => {
    trackEvent(LP_EVENTS.BOOKING_CLICK, {
      landing_page: typeof window !== 'undefined' ? window.location.pathname : '',
      section,
      service_type: serviceType,
      ...(boxSize ? { box_size: boxSize } : {}),
    });
    onClick?.(e);
  };

  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition';
  const variants = {
    primary:
      'h-12 bg-[#31876D] px-6 text-sm text-white hover:bg-[#2a7260] sm:h-14 sm:px-8 sm:text-base',
    outline:
      'h-11 border border-[#31876D] bg-white px-5 text-sm text-[#31876D] hover:bg-[#31876D]/10',
    big:
      'h-14 bg-[#31876D] px-8 text-base text-white hover:bg-[#2a7260] sm:h-16 sm:px-10 sm:text-lg',
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
