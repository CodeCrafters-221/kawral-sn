import React, { useEffect } from 'react';

const SITE_ORIGIN = 'https://www.kawral.sn';
const DEFAULT_TITLE = 'Kawral | Achetez. Louez. Vendez. — Marketplace Sénégal';
const DEFAULT_DESCRIPTION =
  "Le point de rencontre de l'offre et de la demande au Sénégal : petites annonces directes (immobilier, véhicules, multimédia, mode, matériel pro). Achetez, louez et vendez sans intermédiaire.";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/images/kawral-app-icon.png`;

export interface SeoHeadProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImageAlt?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

function setOrCreateMeta(
  attrName: 'name' | 'property',
  attrValue: string,
  content: string
): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attrName}="${attrValue}"]`
  );
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setOrCreateCanonical(href: string): void {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function resolveAbsoluteHttpsImageUrl(rawUrl?: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return DEFAULT_IMAGE;
  if (trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('http://')) {
    return `https://${trimmed.slice('http://'.length)}`;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  return `${SITE_ORIGIN}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImageAlt,
  canonicalPath,
  ogImage,
  ogType = 'website',
  noIndex = false,
  jsonLd,
}) => {
  useEffect(() => {
    const fullTitle = title
      ? title.includes('Kawral')
        ? title
        : `${title} | Kawral Sénégal`
      : DEFAULT_TITLE;
    const cleanDescription = (description || DEFAULT_DESCRIPTION)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 165);
    const resolvedOgTitle = (ogTitle || fullTitle).replace(/\s+/g, ' ').trim();
    const resolvedOgDescription = (ogDescription || cleanDescription)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);
    const cleanPath = canonicalPath
      ? canonicalPath.startsWith('/')
        ? canonicalPath
        : `/${canonicalPath}`
      : typeof window !== 'undefined'
        ? window.location.pathname
        : '/';
    const canonicalUrl = `${SITE_ORIGIN}${cleanPath === '/' ? '/' : cleanPath.replace(/\/+$/, '')}`;
    const imageUrl = resolveAbsoluteHttpsImageUrl(ogImage);
    const resolvedImageAlt = (ogImageAlt || resolvedOgTitle || 'Kawral — Marketplace Sénégal')
      .replace(/\s+/g, ' ')
      .trim();

    document.title = fullTitle;

    setOrCreateMeta('name', 'description', cleanDescription);
    setOrCreateMeta(
      'name',
      'robots',
      noIndex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );
    setOrCreateCanonical(canonicalUrl);

    // Open Graph
    setOrCreateMeta('property', 'og:type', ogType);
    setOrCreateMeta('property', 'og:url', canonicalUrl);
    setOrCreateMeta('property', 'og:site_name', 'Kawral');
    setOrCreateMeta('property', 'og:title', resolvedOgTitle);
    setOrCreateMeta('property', 'og:description', resolvedOgDescription);
    setOrCreateMeta('property', 'og:image', imageUrl);
    setOrCreateMeta('property', 'og:image:secure_url', imageUrl);
    setOrCreateMeta('property', 'og:image:alt', resolvedImageAlt);

    // Twitter Card
    setOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    setOrCreateMeta('name', 'twitter:title', resolvedOgTitle);
    setOrCreateMeta('name', 'twitter:description', resolvedOgDescription);
    setOrCreateMeta('name', 'twitter:image', imageUrl);

    // Dynamic JSON-LD (nettoie d'abord l'éventuel bloc SSR pré-rendu)
    const ssrScriptEl = document.getElementById('kawral-ssr-jsonld');
    if (ssrScriptEl) ssrScriptEl.remove();

    const scriptId = 'kawral-dynamic-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = scriptId;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, [
    title,
    description,
    ogTitle,
    ogDescription,
    ogImageAlt,
    canonicalPath,
    ogImage,
    ogType,
    noIndex,
    jsonLd,
  ]);

  return null;
};
