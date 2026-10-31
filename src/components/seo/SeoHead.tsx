import React, { useEffect } from 'react';

const SITE_ORIGIN = 'https://www.kawral.sn';
const DEFAULT_TITLE = 'Kawral | Achetez. Louez. Vendez. — Marketplace Sénégal';
const DEFAULT_DESCRIPTION =
  "Le point de rencontre de l'offre et de la demande au Sénégal : petites annonces directes (immobilier, véhicules, multimédia, mode, matériel pro). Achetez, louez et vendez sans intermédiaire.";
const DEFAULT_IMAGE = `${SITE_ORIGIN}/images/kawral-app-icon.png`;

export interface SeoHeadProps {
  title?: string;
  description?: string;
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

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
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
    const cleanPath = canonicalPath
      ? canonicalPath.startsWith('/')
        ? canonicalPath
        : `/${canonicalPath}`
      : typeof window !== 'undefined'
        ? window.location.pathname
        : '/';
    const canonicalUrl = `${SITE_ORIGIN}${cleanPath === '/' ? '/' : cleanPath.replace(/\/+$/, '')}`;
    const imageUrl = ogImage
      ? ogImage.startsWith('http')
        ? ogImage
        : `${SITE_ORIGIN}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`
      : DEFAULT_IMAGE;

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
    setOrCreateMeta('property', 'og:title', fullTitle);
    setOrCreateMeta('property', 'og:description', cleanDescription);
    setOrCreateMeta('property', 'og:image', imageUrl);

    // Twitter Card
    setOrCreateMeta(
      'name',
      'twitter:card',
      ogImage ? 'summary_large_image' : 'summary'
    );
    setOrCreateMeta('name', 'twitter:title', fullTitle);
    setOrCreateMeta('name', 'twitter:description', cleanDescription);
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
  }, [title, description, canonicalPath, ogImage, ogType, noIndex, jsonLd]);

  return null;
};
