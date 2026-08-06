import { useEffect } from 'react';
import { DEFAULT_OG_IMAGE, absoluteUrl } from './pageMeta';

const TAG_MARKER = 'data-page-seo';
const HREFLANG_MARKER = 'data-page-seo-hreflang';

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

function setHreflangLinks(hreflang) {
  document.head.querySelectorAll(`link[${HREFLANG_MARKER}="true"]`).forEach((el) => {
    el.parentNode?.removeChild(el);
  });
  if (!hreflang || typeof hreflang !== 'object') return;

  Object.entries(hreflang).forEach(([lang, path]) => {
    if (!path) return;
    const el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', lang);
    el.setAttribute('href', absoluteUrl(path));
    el.setAttribute(HREFLANG_MARKER, 'true');
    el.setAttribute(TAG_MARKER, 'true');
    document.head.appendChild(el);
  });
}

function setJsonLd(id, data) {
  if (!data) return;
  const scriptId = `page-seo-jsonld-${id}`;
  let el = document.getElementById(scriptId);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = scriptId;
    el.setAttribute(TAG_MARKER, 'true');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Sets title, description, canonical, OG/Twitter, optional hreflang and JSON-LD / robots.
 * @param {Record<string, string>} [hreflang] map like { 'ru-KZ': '/', 'kk-KZ': '/kk', 'x-default': '/' }
 */
export default function PageSeo({
  title,
  description,
  path,
  canonical,
  image = DEFAULT_OG_IMAGE,
  robots,
  jsonLd,
  jsonLdId = 'main',
  hreflang,
  ogLocale,
}) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const previousTitle = document.title;
    const href = canonical || (path != null ? absoluteUrl(path) : null);

    if (title) document.title = title;
    setMeta({ name: 'description', content: description });
    if (robots) setMeta({ name: 'robots', content: robots });
    if (href) setLink({ rel: 'canonical', href });

    setMeta({ property: 'og:type', content: 'website' });
    setMeta({ property: 'og:site_name', content: 'ExtraSpace' });
    if (ogLocale) setMeta({ property: 'og:locale', content: ogLocale });
    if (href) setMeta({ property: 'og:url', content: href });
    if (title) setMeta({ property: 'og:title', content: title });
    if (description) setMeta({ property: 'og:description', content: description });
    if (image) setMeta({ property: 'og:image', content: image });

    setMeta({ name: 'twitter:card', content: 'summary_large_image' });
    if (href) setMeta({ name: 'twitter:url', content: href });
    if (title) setMeta({ name: 'twitter:title', content: title });
    if (description) setMeta({ name: 'twitter:description', content: description });
    if (image) setMeta({ name: 'twitter:image', content: image });

    setHreflangLinks(hreflang);

    if (jsonLd) {
      const payloads = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      payloads.forEach((payload, index) => {
        setJsonLd(`${jsonLdId}-${index}`, payload);
      });
    }

    return () => {
      document.title = previousTitle;
      document.head.querySelectorAll(`[${TAG_MARKER}="true"]`).forEach((el) => {
        el.parentNode?.removeChild(el);
      });
    };
  }, [title, description, path, canonical, image, robots, jsonLd, jsonLdId, hreflang, ogLocale]);

  return null;
}
