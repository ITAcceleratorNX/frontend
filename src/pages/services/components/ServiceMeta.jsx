import { useEffect } from 'react';

/**
 * Lightweight SEO meta for product pages on the main site.
 * Sets <title>, <meta name="description">, <link rel="canonical">.
 * Does NOT add noindex — these pages are public, unlike LP routes.
 */
const TAG_MARKER = 'data-service-meta';

function setMeta({ name, content }) {
  if (!content) return;
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
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

export default function ServiceMeta({ title, description, canonical }) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const previousTitle = document.title;
    if (title) document.title = title;
    setMeta({ name: 'description', content: description });
    setLink({ rel: 'canonical', href: canonical });

    return () => {
      document.title = previousTitle;
      const injected = document.head.querySelectorAll(`[${TAG_MARKER}="true"]`);
      injected.forEach((el) => el.parentNode?.removeChild(el));
    };
  }, [title, description, canonical]);

  return null;
}
