import { useEffect } from 'react';

/**
 * Manages per-page meta for LP routes (no react-helmet-async dependency).
 *
 * Sets:
 *  - <title>
 *  - <meta name="description">
 *  - <meta name="robots" content="noindex,nofollow">
 *  - <link rel="canonical">
 *  - Open Graph + Twitter Card (open — for nice WhatsApp/Telegram previews per ТЗ §3.8)
 *  - Schema.org LocalBusiness JSON-LD with both branches
 *
 * On unmount restores original document title and removes injected tags so
 * the user navigating back to the main site sees correct meta.
 */

const TAG_MARKER = 'data-lp-helmet';

const BRANCHES = [
  {
    name: 'ExtraSpace · Mega Tower Almaty',
    streetAddress: 'ул. Абиша Кекилбайулы, 270, блок 4',
    addressLocality: 'Алматы',
    addressRegion: 'Бостандыкский район',
    postalCode: '050060',
    addressCountry: 'KZ',
    geo: { latitude: 43.201397, longitude: 76.890647 },
  },
  {
    name: 'ExtraSpace · Комфорт Сити',
    streetAddress: 'проспект Серкебаева, 146/3',
    addressLocality: 'Алматы',
    postalCode: '050000',
    addressCountry: 'KZ',
    geo: { latitude: 43.201302, longitude: 76.900575 },
  },
];

const PHONE_E164 = '+77783911425';

function setMeta({ name, property, content }) {
  if (!content) return;
  const selector = name
    ? `meta[name="${name}"]`
    : `meta[property="${property}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (name) el.setAttribute('name', name);
    if (property) el.setAttribute('property', property);
    el.setAttribute(TAG_MARKER, 'true');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink({ rel, href }) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute(TAG_MARKER, 'true');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function buildLocalBusinessSchema({ canonical, ogImage }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SelfStorage',
    name: 'ExtraSpace',
    url: canonical || 'https://extraspace.kz',
    image: ogImage || 'https://extraspace.kz/Frame51.png',
    telephone: PHONE_E164,
    priceRange: '₸',
    areaServed: { '@type': 'City', name: 'Алматы' },
    department: BRANCHES.map((b) => ({
      '@type': 'SelfStorage',
      name: b.name,
      telephone: PHONE_E164,
      address: {
        '@type': 'PostalAddress',
        streetAddress: b.streetAddress,
        addressLocality: b.addressLocality,
        ...(b.addressRegion ? { addressRegion: b.addressRegion } : {}),
        ...(b.postalCode ? { postalCode: b.postalCode } : {}),
        addressCountry: b.addressCountry,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: b.geo.latitude,
        longitude: b.geo.longitude,
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    })),
  };
}

function injectJsonLd(schema) {
  const id = 'lp-localbusiness-jsonld';
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    el.setAttribute(TAG_MARKER, 'true');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema);
}

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.canonical               Full absolute URL.
 * @param {string} [props.ogImage]               Absolute URL or path, 1200x630.
 *                                                If only the file name is missing,
 *                                                falls back to /Frame51.png.
 * @param {string} [props.ogImageAlt]
 * @param {boolean} [props.includeJsonLd=true]
 */
const DEFAULT_OG = 'https://extraspace.kz/Frame51.png';

function resolveOgUrl(value) {
  if (!value) return DEFAULT_OG;
  if (/^https?:\/\//i.test(value)) return value;
  // Relative path — prefix with absolute origin so OG previews work in chats.
  const base = (typeof window !== 'undefined' && window.location?.origin)
    || 'https://extraspace.kz';
  const trimmed = value.startsWith('/') ? value : `/${value}`;
  return `${base}${trimmed}`;
}

export default function LpHelmet({
  title,
  description,
  canonical,
  ogImage,
  ogImageAlt = 'ExtraSpace — хранение в Алматы',
  includeJsonLd = true,
}) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const previousTitle = document.title;

    const resolvedOg = resolveOgUrl(ogImage);

    if (title) document.title = title;

    setMeta({ name: 'description', content: description });
    setMeta({ name: 'robots', content: 'noindex,nofollow' });

    setLink({ rel: 'canonical', href: canonical });

    setMeta({ property: 'og:type', content: 'website' });
    setMeta({ property: 'og:site_name', content: 'ExtraSpace' });
    setMeta({ property: 'og:url', content: canonical });
    setMeta({ property: 'og:title', content: title });
    setMeta({ property: 'og:description', content: description });
    setMeta({ property: 'og:image', content: resolvedOg });
    setMeta({ property: 'og:image:width', content: '1200' });
    setMeta({ property: 'og:image:height', content: '630' });
    setMeta({ property: 'og:image:alt', content: ogImageAlt });
    setMeta({ property: 'og:locale', content: 'ru_RU' });

    setMeta({ name: 'twitter:card', content: 'summary_large_image' });
    setMeta({ name: 'twitter:url', content: canonical });
    setMeta({ name: 'twitter:title', content: title });
    setMeta({ name: 'twitter:description', content: description });
    setMeta({ name: 'twitter:image', content: resolvedOg });

    if (includeJsonLd) {
      injectJsonLd(
        buildLocalBusinessSchema({ canonical, ogImage: resolvedOg }),
      );
    }

    return () => {
      document.title = previousTitle;
      const injected = document.head.querySelectorAll(`[${TAG_MARKER}="true"]`);
      injected.forEach((el) => el.parentNode?.removeChild(el));

      // Also restore meta name="robots" to default (no-op if missing).
      const robots = document.head.querySelector('meta[name="robots"]');
      if (robots && !robots.hasAttribute(TAG_MARKER)) {
        robots.setAttribute('content', 'index,follow');
      }
    };
  }, [title, description, canonical, ogImage, ogImageAlt, includeJsonLd]);

  return null;
}
