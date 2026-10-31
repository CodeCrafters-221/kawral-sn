const SITE_ORIGIN = 'https://www.kawral.sn';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/favicon-96x96.png`;

const CATEGORY_CATALOG = {
  immobilier: { label: 'Immobilier', desc: 'Vente & location de biens immobiliers (appartements, villas, terrains, studios, bureaux)' },
  apartment: { label: 'Appartements', parent: 'immobilier', parentLabel: 'Immobilier' },
  house: { label: 'Maisons et villas', parent: 'immobilier', parentLabel: 'Immobilier' },
  room: { label: 'Chambres', parent: 'immobilier', parentLabel: 'Immobilier' },
  studios: { label: 'Studios', parent: 'immobilier', parentLabel: 'Immobilier' },
  land: { label: 'Terrains', parent: 'immobilier', parentLabel: 'Immobilier' },
  commercial: { label: 'Locaux commerciaux', parent: 'immobilier', parentLabel: 'Immobilier' },
  bureaux: { label: 'Bureaux', parent: 'immobilier', parentLabel: 'Immobilier' },
  entrepots: { label: 'Entrepôts', parent: 'immobilier', parentLabel: 'Immobilier' },

  vehicules: { label: 'Véhicules', desc: 'Voitures, motos, utilitaires, camions et pièces détachées' },
  voitures: { label: 'Voitures', parent: 'vehicules', parentLabel: 'Véhicules' },
  motos: { label: 'Motos et scooters', parent: 'vehicules', parentLabel: 'Véhicules' },
  camions: { label: 'Camions', parent: 'vehicules', parentLabel: 'Véhicules' },
  bus: { label: 'Bus et minibus', parent: 'vehicules', parentLabel: 'Véhicules' },
  utilitaires: { label: 'Véhicules utilitaires', parent: 'vehicules', parentLabel: 'Véhicules' },
  'pieces-detachees': { label: 'Pièces détachées', parent: 'vehicules', parentLabel: 'Véhicules' },
  'pneus-jantes': { label: 'Pneus et jantes', parent: 'vehicules', parentLabel: 'Véhicules' },
  'accessoires-auto': { label: 'Accessoires auto/moto', parent: 'vehicules', parentLabel: 'Véhicules' },

  'materiel-pro': { label: 'Matériel Professionnel', desc: 'Équipements pour entreprises, chantiers, commerces et ateliers' },
  'materiel-btp': { label: 'Matériel BTP & chantier', parent: 'materiel-pro', parentLabel: 'Matériel Professionnel' },
  'outils-bricolage': { label: 'Outils et bricolage', parent: 'materiel-pro', parentLabel: 'Matériel Professionnel' },
  'equipement-bureau': { label: 'Équipement de bureau', parent: 'materiel-pro', parentLabel: 'Matériel Professionnel' },
  'materiel-restauration': { label: 'Matériel de restauration', parent: 'materiel-pro', parentLabel: 'Matériel Professionnel' },
  'materiel-agricole': { label: 'Matériel agricole', parent: 'materiel-pro', parentLabel: 'Matériel Professionnel' },
  'materiel-medical': { label: 'Matériel médical', parent: 'materiel-pro', parentLabel: 'Matériel Professionnel' },
  'imprimerie-industrie': { label: 'Imprimerie & industrie', parent: 'materiel-pro', parentLabel: 'Matériel Professionnel' },
  'fournitures-commerce': { label: 'Fournitures de commerce', parent: 'materiel-pro', parentLabel: 'Matériel Professionnel' },

  'mode-beaute': { label: 'Mode & Beauté', desc: 'Vêtements, chaussures, sacs, montres, bijoux et cosmétiques' },
  vetements: { label: 'Vêtements', parent: 'mode-beaute', parentLabel: 'Mode & Beauté' },
  chaussures: { label: 'Chaussures', parent: 'mode-beaute', parentLabel: 'Mode & Beauté' },
  'sacs-maroquinerie': { label: 'Sacs et maroquinerie', parent: 'mode-beaute', parentLabel: 'Mode & Beauté' },
  'montres-bijoux': { label: 'Montres et bijoux', parent: 'mode-beaute', parentLabel: 'Mode & Beauté' },
  'cosmetiques-parfums': { label: 'Cosmétiques et parfums', parent: 'mode-beaute', parentLabel: 'Mode & Beauté' },
  'tenues-traditionnelles': { label: 'Tenues traditionnelles', parent: 'mode-beaute', parentLabel: 'Mode & Beauté' },
  'cheveux-perruques': { label: 'Cheveux et perruques', parent: 'mode-beaute', parentLabel: 'Mode & Beauté' },
  'accessoires-mode': { label: 'Accessoires de mode', parent: 'mode-beaute', parentLabel: 'Mode & Beauté' },

  'maison-meubles': { label: 'Maison & Meubles', desc: 'Mobilier, électroménager, décoration, literie et jardin' },
  'salons-canapes': { label: 'Salons et canapés', parent: 'maison-meubles', parentLabel: 'Maison & Meubles' },
  'chambres-literie': { label: 'Chambres et literie', parent: 'maison-meubles', parentLabel: 'Maison & Meubles' },
  'tables-chaises': { label: 'Tables et chaises', parent: 'maison-meubles', parentLabel: 'Maison & Meubles' },
  'rangement-armoires': { label: 'Rangement et armoires', parent: 'maison-meubles', parentLabel: 'Maison & Meubles' },
  electromenager: { label: 'Électroménager', parent: 'maison-meubles', parentLabel: 'Maison & Meubles' },
  'arts-table-cuisine': { label: 'Arts de la table & cuisine', parent: 'maison-meubles', parentLabel: 'Maison & Meubles' },
  'decoration-linge': { label: 'Décoration et linge', parent: 'maison-meubles', parentLabel: 'Maison & Meubles' },
  'jardin-exterieur': { label: 'Jardin et extérieur', parent: 'maison-meubles', parentLabel: 'Maison & Meubles' },

  electronique: { label: 'Électronique', desc: 'Téléphones, ordinateurs, tablettes, TV, audio et accessoires high-tech' },
  telephones: { label: 'Téléphones et smartphones', parent: 'electronique', parentLabel: 'Électronique' },
  'ordinateurs-tablettes': { label: 'Ordinateurs et tablettes', parent: 'electronique', parentLabel: 'Électronique' },
  'tv-home-cinema': { label: 'TV et Home Cinéma', parent: 'electronique', parentLabel: 'Électronique' },
  'audio-casques-enceintes': { label: 'Audio, casques et enceintes', parent: 'electronique', parentLabel: 'Électronique' },
  'photo-cameras': { label: 'Photo et caméras', parent: 'electronique', parentLabel: 'Électronique' },
  'consoles-jeux-video': { label: 'Consoles et jeux vidéo', parent: 'electronique', parentLabel: 'Électronique' },
  'objets-connectes': { label: 'Montres et objets connectés', parent: 'electronique', parentLabel: 'Électronique' },
  'accessoires-composants': { label: 'Accessoires et composants', parent: 'electronique', parentLabel: 'Électronique' },

  'loisirs-sport': { label: 'Loisirs & Sport', desc: 'Sport, fitness, vélos, instruments de musique, livres et jouets' },
  'sport-fitness': { label: 'Sport et fitness', parent: 'loisirs-sport', parentLabel: 'Loisirs & Sport' },
  'velos-trottinettes': { label: 'Vélos et trottinettes', parent: 'loisirs-sport', parentLabel: 'Loisirs & Sport' },
  'instruments-musique': { label: 'Instruments de musique', parent: 'loisirs-sport', parentLabel: 'Loisirs & Sport' },
  'livres-papeterie': { label: 'Livres et papeterie', parent: 'loisirs-sport', parentLabel: 'Loisirs & Sport' },
  'jeux-jouets': { label: 'Jeux et jouets', parent: 'loisirs-sport', parentLabel: 'Loisirs & Sport' },
  'camping-plein-air': { label: 'Camping et plein air', parent: 'loisirs-sport', parentLabel: 'Loisirs & Sport' },
  'art-collection': { label: 'Art et collection', parent: 'loisirs-sport', parentLabel: 'Loisirs & Sport' },
  'billetterie-evenements': { label: 'Billetterie et événements', parent: 'loisirs-sport', parentLabel: 'Loisirs & Sport' },

  autres: { label: 'Autres & Services', desc: 'Services, cours, événements, puériculture, agriculture et divers' },
  'puericulture-bebe': { label: 'Puériculture et bébé', parent: 'autres', parentLabel: 'Autres & Services' },
  'cours-formations': { label: 'Cours et formations', parent: 'autres', parentLabel: 'Autres & Services' },
  'prestations-services': { label: 'Prestations de services', parent: 'autres', parentLabel: 'Autres & Services' },
  'evenementiel-traiteur': { label: 'Événementiel et traiteur', parent: 'autres', parentLabel: 'Autres & Services' },
  'produits-agricoles-elevage': { label: 'Produits agricoles & élevage', parent: 'autres', parentLabel: 'Autres & Services' },
  'animaux-accessoires': { label: 'Animaux et accessoires', parent: 'autres', parentLabel: 'Autres & Services' },
  'objets-perdus-trouves': { label: 'Objets perdus / trouvés', parent: 'autres', parentLabel: 'Autres & Services' },
  'divers-non-classe': { label: 'Divers non classé', parent: 'autres', parentLabel: 'Autres & Services' },
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

function formatPriceFCFA(price) {
  const num = Number(price);
  if (!Number.isFinite(num) || num <= 0) return 'Prix sur demande';
  return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;
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
  if (!supabaseUrl || !supabaseKey) return null;

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/listings?id=eq.${encodeURIComponent(id)}&select=id,title,description,price,location,status,attributes,created_at,updated_at,listing_images(image_url,is_cover,display_order)&limit=1`;
  const res = await fetch(endpoint, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    signal: AbortSignal.timeout(2200),
  });

  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
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

export default async function handler(req, res) {
  try {
    const htmlTemplate = await getIndexHtmlTemplate(req);
    const urlObj = new URL(req.url || '/', SITE_ORIGIN);
    const route = urlObj.searchParams.get('route') || '';

    // 1. Route /listings/:id
    if (route === 'listing') {
      const id = (urlObj.searchParams.get('id') || '').trim();
      const canonicalUrl = `${SITE_ORIGIN}/listings/${encodeURIComponent(id)}`;
      const row = id ? await fetchListingFromSupabase(id).catch(() => null) : null;

      if (!row || row.status === 'archived' || row.status === 'draft') {
        const notFoundHtml = injectSeoIntoHtml(htmlTemplate, {
          title: 'Annonce introuvable ou expirée | Kawral Sénégal',
          description: "Cette annonce n'est plus disponible sur Kawral. Découvrez des centaines d'autres annonces vérifiées au Sénégal.",
          canonicalUrl,
          noIndex: true,
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
        return res.status(200).send(notFoundHtml);
      }

      const city = ((row.location || 'Dakar').split(',')[0] || 'Dakar').trim();
      const priceLabel = formatPriceFCFA(row.price);
      const attrs = row.attributes || {};
      const catSlug = attrs.category || 'immobilier';
      const catInfo = CATEGORY_CATALOG[catSlug] || { label: attrs.categoryLabel || 'Annonces' };
      const sortedImages = Array.isArray(row.listing_images)
        ? [...row.listing_images]
            .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
            .map((img) => img.image_url)
            .filter(Boolean)
        : [];
      const primaryImage = sortedImages[0] || DEFAULT_IMAGE;
      const cleanDesc = String(row.description || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 155);

      const seoTitle = `${row.title} — ${priceLabel} à ${city} | Kawral`;
      const seoDescription =
        cleanDesc ||
        `${row.title} à ${city} (${priceLabel}). Contactez directement le vendeur sur Kawral Sénégal.`;

      const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_ORIGIN}/` },
              {
                '@type': 'ListItem',
                position: 2,
                name: catInfo.label,
                item: `${SITE_ORIGIN}/categories/${catSlug}`,
              },
              { '@type': 'ListItem', position: 3, name: row.title, item: canonicalUrl },
            ],
          },
          {
            '@type': 'Product',
            name: row.title,
            description: row.description || seoDescription,
            image: sortedImages.length > 0 ? sortedImages : [DEFAULT_IMAGE],
            sku: row.id,
            category: catInfo.label,
            offers: {
              '@type': 'Offer',
              url: canonicalUrl,
              priceCurrency: 'XOF',
              price: Number(row.price) || 0,
              availability:
                row.status === 'published'
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/SoldOut',
              availableAtOrFrom: {
                '@type': 'Place',
                name: row.location || city,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: city,
                  addressCountry: 'SN',
                },
              },
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
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
      return res.status(200).send(rendered);
    }

    // 2. Route /categories/:slug
    if (route === 'category') {
      const slug = (urlObj.searchParams.get('slug') || '').trim();
      const catInfo = CATEGORY_CATALOG[slug];
      const catLabel = catInfo ? catInfo.label : slug;
      const parentPrefix = catInfo && catInfo.parentLabel ? `${catInfo.parentLabel} ` : '';
      const canonicalUrl = `${SITE_ORIGIN}/categories/${encodeURIComponent(slug)}`;
      const seoTitle = `${catLabel} au Sénégal — Petites annonces ${parentPrefix}| Kawral`;
      const seoDescription =
        catInfo && catInfo.desc
          ? `${catInfo.desc} au Sénégal. Achetez, louez et vendez en direct à Dakar et dans les régions sans intermédiaire sur Kawral.`
          : `Découvrez toutes les annonces de ${catLabel.toLowerCase()} à vendre ou à louer au Sénégal (Dakar, Thiès, Mbour, Saint-Louis). Contact direct sur Kawral.`;

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
          name: catLabel,
          item: canonicalUrl,
        });
      } else {
        breadcrumbItems.push({
          '@type': 'ListItem',
          position: 2,
          name: catLabel,
          item: canonicalUrl,
        });
      }

      const rendered = injectSeoIntoHtml(htmlTemplate, {
        title: seoTitle,
        description: seoDescription,
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
    console.error('[api/seo] Fallback to static index.html:', err);
    res.writeHead(307, { Location: '/index.html' });
    return res.end();
  }
}
