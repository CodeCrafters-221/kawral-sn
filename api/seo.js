import {
  getListingSeoMetadata,
  SEO_CATEGORY_METADATA,
} from '../src/data/seoCategoryMetadata.js';

const SITE_ORIGIN = 'https://www.kawral.sn';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/favicon-96x96.png`;
const CATEGORY_SLUG_ALIASES = {
  real_estate: 'immobilier',
  vehicle: 'vehicules',
  vehicule: 'vehicules',
  other: 'autres',
  autre: 'autres',
  divers: 'autres',
};

let cachedTemplateHtml = null;
let cachedTemplateAt = 0;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function getIndexHtmlTemplate(req) {
  const now = Date.now();
  if (cachedTemplateHtml && now - cachedTemplateAt < 5 * 60 * 1000) {
    return cachedTemplateHtml;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.kawral.sn';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const indexUrl = `${proto}://${host}/index.html`;

  const response = await fetch(indexUrl, {
    headers: { 'User-Agent': 'Kawral-SEO-Renderer/1.0' },
    signal: AbortSignal.timeout(2500),
  });

  if (!response.ok) {
    throw new Error(`Failed to load index.html: ${response.status}`);
  }

  const html = await response.text();
  cachedTemplateHtml = html;
  cachedTemplateAt = now;
  return html;
}

async function fetchListingFromSupabase(id) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase public credentials are not configured for SEO rendering.');
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/listings?id=eq.${encodeURIComponent(id)}&select=id,title,description,price,location,status,attributes,transaction_type,created_at,updated_at,listing_images(image_url,is_cover,display_order)&limit=1`;
  const res = await fetch(endpoint, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    signal: AbortSignal.timeout(2200),
  });

  if (!res.ok) {
    throw new Error(`Supabase listing lookup failed with HTTP ${res.status}.`);
  }
  const rows = await res.json();
  if (!Array.isArray(rows)) {
    throw new Error('Supabase listing lookup returned an invalid response.');
  }
  return rows.length > 0 ? rows[0] : null;
}

function injectSeoIntoHtml(html, seo) {
  const safeTitle = escapeHtml(seo.title);
  const safeDesc = escapeHtml(seo.description);
  const safeCanonical = escapeHtml(seo.canonicalUrl);
  const safeImage = escapeHtml(seo.image || DEFAULT_IMAGE);
  const safeType = escapeHtml(seo.ogType || 'website');
  const safeRobots = escapeHtml(
    seo.noIndex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  );

  let updated = html;

  // <title>
  updated = updated.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);

  // <meta name="description">
  updated = updated.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );

  // <meta name="robots">
  updated = updated.replace(
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="${safeRobots}" />`
  );

  // <link rel="canonical">
  updated = updated.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${safeCanonical}" />`
  );

  // Open Graph & Twitter tags
  const replaceMetaProp = (attrName, attrVal, newContent) => {
    const regex = new RegExp(
      `<meta\\s+${attrName}="${attrVal}"\\s+content="[^"]*"\\s*\\/?>`,
      'i'
    );
    updated = updated.replace(regex, `<meta ${attrName}="${attrVal}" content="${newContent}" />`);
  };

  replaceMetaProp('property', 'og:type', safeType);
  replaceMetaProp('property', 'og:url', safeCanonical);
  replaceMetaProp('property', 'og:title', safeTitle);
  replaceMetaProp('property', 'og:description', safeDesc);
  replaceMetaProp('property', 'og:image', safeImage);
  replaceMetaProp('name', 'twitter:title', safeTitle);
  replaceMetaProp('name', 'twitter:description', safeDesc);
  replaceMetaProp('name', 'twitter:image', safeImage);

  // Dynamic JSON-LD block
  if (seo.jsonLd) {
    const jsonString = JSON.stringify(seo.jsonLd).replace(/</g, '\\u003c');
    const dynamicScript = `\n    <script id="kawral-ssr-jsonld" type="application/ld+json">${jsonString}</script>\n  </head>`;
    updated = updated.replace(/<\/head>/i, dynamicScript);
  }

  return updated;
}

function sendNotFound(res, html, title, description, canonicalUrl) {
  const notFoundHtml = injectSeoIntoHtml(html, {
    title,
    description,
    canonicalUrl,
    noIndex: true,
  });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
  return res.status(404).send(notFoundHtml);
}

function sendUnavailable(res) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Retry-After', '60');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(503).send('Service temporairement indisponible.');
}

export default async function handler(req, res) {
  try {
    const htmlTemplate = await getIndexHtmlTemplate(req);
    const urlObj = new URL(req.url || '/', SITE_ORIGIN);
    const route = urlObj.searchParams.get('route') || '';

    // 1. Route /listings/:id
    if (route === 'listing') {
      const id = (urlObj.searchParams.get('id') || '').trim();
      const canonicalUrl = `${SITE_ORIGIN}/listings/${encodeURIComponent(id)}`;
      if (!id) {
        return sendNotFound(
          res,
          htmlTemplate,
          'Annonce introuvable | Kawral',
          'Cette annonce n’existe pas ou n’est plus disponible.',
          `${SITE_ORIGIN}/listings/`
        );
      }

      const row = await fetchListingFromSupabase(id);

      if (!row || row.status !== 'published') {
        return sendNotFound(
          res,
          htmlTemplate,
          'Annonce introuvable ou indisponible | Kawral',
          'Cette annonce n’existe pas ou n’est plus disponible sur Kawral.',
          canonicalUrl
        );
      }

      const attrs = row.attributes || {};
      const brand = typeof attrs.characteristics?.brand === 'string'
        ? attrs.characteristics.brand.trim()
        : '';
      const rawCategorySlug = String(attrs.category || '').trim();
      const catSlug = CATEGORY_SLUG_ALIASES[rawCategorySlug] || rawCategorySlug;
      const catInfo = SEO_CATEGORY_METADATA[catSlug];
      const categoryLabel = attrs.categoryLabel || catInfo?.label || '';
      const sortedImages = Array.isArray(row.listing_images)
        ? [...row.listing_images]
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map((img) => img.image_url)
            .filter(Boolean)
        : [];
      const primaryImage = sortedImages[0] || DEFAULT_IMAGE;
      const transactionType = row.transaction_type || attrs.transactionType;
      const seo = getListingSeoMetadata({
        title: row.title,
        categoryLabel,
        location: row.location,
        transactionType,
        description: row.description,
      });
      const seoTitle = seo.title || 'Annonce au Sénégal | Kawral';
      const seoDescription = seo.description || seoTitle;
      const price = Number(row.price);

      const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_ORIGIN}/` },
              ...(catInfo
                ? [{
                    '@type': 'ListItem',
                    position: 2,
                    name: catInfo.label,
                    item: `${SITE_ORIGIN}/categories/${catSlug}`,
                  }]
                : []),
              {
                '@type': 'ListItem',
                position: catInfo ? 3 : 2,
                name: row.title,
                item: canonicalUrl,
              },
            ],
          },
          {
            '@type': 'Product',
            name: row.title,
            description: row.description || seoDescription,
            ...(sortedImages.length > 0 ? { image: sortedImages } : {}),
            sku: row.id,
            ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
            ...(categoryLabel ? { category: categoryLabel } : {}),
            offers: {
              '@type': 'Offer',
              url: canonicalUrl,
              priceCurrency: 'XOF',
              ...(Number.isFinite(price) && price > 0 ? { price } : {}),
              availability: 'https://schema.org/InStock',
              ...(row.location
                ? { availableAtOrFrom: {
                '@type': 'Place',
                name: row.location,
                address: {
                  '@type': 'PostalAddress',
                  ...(seo.city ? { addressLocality: seo.city } : {}),
                  addressCountry: 'SN',
                },
              } }
                : {}),
            },
          },
        ],
      };

      const rendered = injectSeoIntoHtml(htmlTemplate, {
        title: seoTitle,
        description: seoDescription,
        canonicalUrl,
        image: primaryImage,
        ogType: 'product',
        jsonLd,
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).send(rendered);
    }

    // 2. Route /categories/:slug
    if (route === 'category') {
      const slug = (urlObj.searchParams.get('slug') || '').trim();
      const canonicalUrl = `${SITE_ORIGIN}/categories/${encodeURIComponent(slug)}`;
      const catInfo = SEO_CATEGORY_METADATA[slug];
      if (!catInfo) {
        return sendNotFound(
          res,
          htmlTemplate,
          'Catégorie introuvable | Kawral',
          'Cette catégorie n’existe pas sur Kawral.',
          canonicalUrl
        );
      }

      const breadcrumbItems = [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_ORIGIN}/` },
      ];
      if (catInfo && catInfo.parent) {
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: 2,
          name: catInfo.parentLabel,
          item: `${SITE_ORIGIN}/categories/${catInfo.parent}`,
        });
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: 3,
          name: catInfo.label,
          item: canonicalUrl,
        });
      } else {
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: 2,
          name: catInfo.label,
          item: canonicalUrl,
        });
      }

      const rendered = injectSeoIntoHtml(htmlTemplate, {
        title: catInfo.title,
        description: catInfo.description,
        canonicalUrl,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbItems,
        },
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
      return res.status(200).send(rendered);
    }

    // 3. Route /explorer
    if (route === 'explorer') {
      const canonicalUrl = `${SITE_ORIGIN}/explorer`;
      const rendered = injectSeoIntoHtml(htmlTemplate, {
        title: 'Explorer toutes les petites annonces au Sénégal | Kawral Marketplace',
        description:
          'Parcourez toutes les petites annonces publiées au Sénégal : immobilier, véhicules, électronique, mode, maison et matériel professionnel sur Kawral.',
        canonicalUrl,
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400');
      return res.status(200).send(rendered);
    }

    // Default fallback
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(htmlTemplate);
  } catch (err) {
    console.error('[api/seo] Failed to generate SEO response:', err);
    return sendUnavailable(res);
  }
}
