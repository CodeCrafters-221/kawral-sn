import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import handler from '../api/seo.js';
import { MAIN_CATEGORIES_CATALOG } from '../src/data/categoriesData.ts';
import { SEO_CATEGORY_METADATA } from '../src/data/seoCategoryMetadata.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const listingId = '9b98b814-d74a-4be7-82a9-9d4d7ab06e12';
const originalFetch = globalThis.fetch;
const originalSupabaseUrl = process.env.VITE_SUPABASE_URL;
const originalSupabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

let listingRows: Record<string, unknown>[] = [];
let listingStatus = 200;
let failListingRequest = false;

interface CategorySeoMetadata {
  label: string;
  title: string;
  description: string;
  parent?: string;
  parentLabel?: string;
}

process.env.VITE_SUPABASE_URL = 'https://supabase.test';
process.env.VITE_SUPABASE_ANON_KEY = 'test-public-key';

async function callSeoHandler(url: string) {
  const headers: Record<string, string> = {};
  const response = {
    statusCode: 200,
    body: '',
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(body: string) {
      this.body = body;
      return this;
    },
    writeHead(code: number, responseHeaders: Record<string, string>) {
      this.statusCode = code;
      Object.assign(headers, responseHeaders);
      return this;
    },
    end(body = '') {
      this.body = body;
      return this;
    },
  };

  globalThis.fetch = async (input) => {
    const requestUrl = new URL(String(input));
    if (requestUrl.pathname === '/index.html') {
      return new Response(await readFile(path.join(root, 'index.html'), 'utf8'));
    }

    if (requestUrl.pathname === '/rest/v1/listings') {
      if (failListingRequest) throw new Error('test network failure');
      if (listingStatus !== 200) return new Response('', { status: listingStatus });
      const requestedId = requestUrl.searchParams.get('id')?.replace(/^eq\./, '');
      return new Response(
        JSON.stringify(listingRows.filter((row) => row.id === requestedId)),
        { status: 200 }
      );
    }

    throw new Error(`Unexpected test fetch: ${requestUrl.pathname}`);
  };

  try {
    await handler(
      {
        url,
        headers: {
          host: 'www.kawral.sn',
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'www.kawral.sn',
        },
      } as never,
      response as never
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  return { ...response, headers };
}

test('SEO metadata covers exactly the live categories with unique titles', () => {
  const liveSlugs = MAIN_CATEGORIES_CATALOG.flatMap((category) => [
    category.slug,
    ...category.subcategories.map((subcategory) => subcategory.slug),
  ]).sort();
  const seoSlugs = Object.keys(SEO_CATEGORY_METADATA).sort();
  const categoryMetadata = Object.values(
    SEO_CATEGORY_METADATA
  ) as CategorySeoMetadata[];
  const titles = categoryMetadata.map(({ title }) => title);

  assert.deepEqual(seoSlugs, liveSlugs);
  assert.equal(new Set(titles).size, titles.length);
  for (const metadata of categoryMetadata) {
    assert.ok(metadata.title.length <= 70, metadata.title);
    assert.ok(metadata.description.length <= 165, metadata.description);
  }
});

test('SEO API returns indexable metadata for every catalog category', async () => {
  const categoryEntries = Object.entries(
    SEO_CATEGORY_METADATA
  ) as [string, CategorySeoMetadata][];
  for (const [slug, metadata] of categoryEntries) {
    const result = await callSeoHandler(
      `/api/seo?${new URLSearchParams({ route: 'category', slug })}`
    );

    assert.equal(result.statusCode, 200, slug);
    const escapedTitle = metadata.title.replace(/&/g, '&amp;');
    assert.ok(result.body.includes(`<title>${escapedTitle}</title>`), slug);
    assert.ok(result.body.includes(`href="https://www.kawral.sn/categories/${slug}"`));
    assert.match(result.body, /name="robots" content="index, follow/);
  }
});

test('SEO API returns 404 and noindex for unknown categories and missing listings', async () => {
  const unknownCategory = await callSeoHandler(
    '/api/seo?route=category&slug=not-a-real-category'
  );
  assert.equal(unknownCategory.statusCode, 404);
  assert.match(unknownCategory.body, /name="robots" content="noindex, nofollow"/);

  listingRows = [];
  const missingListing = await callSeoHandler(
    `/api/seo?${new URLSearchParams({ route: 'listing', id: listingId })}`
  );
  assert.equal(missingListing.statusCode, 404);
  assert.match(missingListing.body, /name="robots" content="noindex, nofollow"/);
  assert.equal(missingListing.headers['x-robots-tag'], 'noindex, nofollow');
});

test('SEO API does not treat Supabase failures as missing listings', async () => {
  listingStatus = 503;
  let result = await callSeoHandler(
    `/api/seo?${new URLSearchParams({ route: 'listing', id: listingId })}`
  );
  assert.equal(result.statusCode, 503);
  assert.equal(result.headers['x-robots-tag'], 'noindex, nofollow');

  listingStatus = 200;
  failListingRequest = true;
  result = await callSeoHandler(
    `/api/seo?${new URLSearchParams({ route: 'listing', id: listingId })}`
  );
  assert.equal(result.statusCode, 503);
  assert.equal(result.headers['retry-after'], '60');
});

test('SEO API renders published listing metadata and 404s unpublished listings', async () => {
  listingRows = [
    {
      id: listingId,
      title: 'Toyota Corolla',
      description: 'Bon état, entretien suivi.',
      price: 4_500_000,
      location: 'Dakar, Plateau',
      status: 'published',
      transaction_type: 'sale',
      attributes: { category: 'voitures', categoryLabel: 'Voitures' },
      listing_images: [{ image_url: 'https://images.example/car.jpg', display_order: 0 }],
    },
  ];
  failListingRequest = false;

  const publishedListing = await callSeoHandler(
    `/api/seo?${new URLSearchParams({ route: 'listing', id: listingId })}`
  );
  assert.equal(publishedListing.statusCode, 200);
  assert.match(publishedListing.body, /<title>Toyota Corolla à vendre à Dakar \| Kawral<\/title>/);
  assert.ok(publishedListing.body.includes(`href="https://www.kawral.sn/listings/${listingId}"`));
  assert.match(publishedListing.body, /name="robots" content="index, follow/);
  assert.ok(publishedListing.body.includes('Toyota Corolla'));
  assert.ok(publishedListing.body.includes('à vendre'));
  assert.match(publishedListing.body, /property="og:title" content="Toyota Corolla"/);
  assert.match(
    publishedListing.body,
    /property="og:description" content="Découvrez Toyota Corolla sur Kawral\. Contactez le vendeur pour plus d&#39;informations\."/
  );
  assert.match(
    publishedListing.body,
    /property="og:image" content="https:\/\/images\.example\/car\.jpg"/
  );
  assert.match(
    publishedListing.body,
    /property="og:image:secure_url" content="https:\/\/images\.example\/car\.jpg"/
  );
  assert.match(publishedListing.body, /property="og:image:alt" content="Toyota Corolla"/);
  assert.match(
    publishedListing.body,
    new RegExp(`property="og:url" content="https://www\\.kawral\\.sn/listings/${listingId}"`)
  );
  assert.match(publishedListing.body, /property="og:type" content="product"/);
  assert.match(publishedListing.body, /property="og:site_name" content="Kawral"/);
  assert.match(publishedListing.body, /name="twitter:card" content="summary_large_image"/);
  assert.match(publishedListing.body, /name="twitter:title" content="Toyota Corolla"/);
  assert.match(
    publishedListing.body,
    /name="twitter:description" content="Découvrez Toyota Corolla sur Kawral\. Contactez le vendeur pour plus d&#39;informations\."/
  );
  assert.match(
    publishedListing.body,
    /name="twitter:image" content="https:\/\/images\.example\/car\.jpg"/
  );

  const jsonLdText = publishedListing.body.match(
    /<script id="kawral-ssr-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/
  )?.[1];
  assert.ok(jsonLdText);
  const jsonLd = JSON.parse(jsonLdText);
  assert.equal(jsonLd['@graph'][1].offers.price, 4_500_000);
  assert.equal(jsonLd['@graph'][1].offers.availability, 'https://schema.org/InStock');

  listingRows = [
    {
      id: listingId,
      title: 'Objet à découvrir',
      description: '',
      price: 0,
      location: null,
      status: 'published',
      attributes: {},
      listing_images: [],
    },
  ];
  const listingWithoutPriceOrLocation = await callSeoHandler(
    `/api/seo?${new URLSearchParams({ route: 'listing', id: listingId })}`
  );
  assert.match(listingWithoutPriceOrLocation.body, /<title>Objet à découvrir \| Kawral<\/title>/);
  const noPriceJsonLdText = listingWithoutPriceOrLocation.body.match(
    /<script id="kawral-ssr-jsonld" type="application\/ld\+json">([\s\S]*?)<\/script>/
  )?.[1];
  assert.ok(noPriceJsonLdText);
  const noPriceJsonLd = JSON.parse(noPriceJsonLdText);
  assert.equal('price' in noPriceJsonLd['@graph'][1].offers, false);
  assert.equal('availableAtOrFrom' in noPriceJsonLd['@graph'][1].offers, false);

  listingRows = [{ ...listingRows[0], status: 'archived' }];
  const unpublishedListing = await callSeoHandler(
    `/api/seo?${new URLSearchParams({ route: 'listing', id: listingId })}`
  );
  assert.equal(unpublishedListing.statusCode, 404);
  assert.match(unpublishedListing.body, /name="robots" content="noindex, nofollow"/);
});

test('legacy listing URLs share the current SEO renderer and canonical route', async () => {
  const vercelConfig = JSON.parse(
    await readFile(path.join(root, 'vercel.json'), 'utf8')
  );
  const listingRewrites = vercelConfig.rewrites.filter(
    (rewrite: { source: string }) =>
      ['/listings/:id', '/annonces/:id', '/annonce/:id'].includes(rewrite.source)
  );

  assert.equal(listingRewrites.length, 3);
  assert.ok(
    listingRewrites.every(
      (rewrite: { destination: string }) =>
        rewrite.destination === '/api/seo?route=listing&id=:id'
    )
  );
});

test('Open Graph uses cover image, falls back to Kawral logo only when no image exists, and resolves direct /listings/:id paths without duplicate meta tags', async () => {
  const iphoneId = 'be7293e4-b369-41ed-9dc9-89839aa850db';
  listingRows = [
    {
      id: iphoneId,
      title: 'iPhone 14 Pro à vendre',
      description: 'État neuf, batterie 98%, débloqué tout opérateur.',
      price: 450_000,
      location: 'Dakar, Almadies',
      status: 'published',
      transaction_type: 'sale',
      attributes: { category: 'telephones', categoryLabel: 'Téléphones & smartphones' },
      listing_images: [
        {
          image_url: 'https://osrjeifsmhwvlfsfiggx.supabase.co/storage/v1/object/public/listing-images/u1/l1/second.webp',
          is_cover: false,
          display_order: 0,
        },
        {
          image_url: 'https://osrjeifsmhwvlfsfiggx.supabase.co/storage/v1/object/public/listing-images/u1/l1/cover-iphone.webp',
          is_cover: true,
          display_order: 1,
        },
      ],
    },
  ];
  failListingRequest = false;
  listingStatus = 200;

  // Appel via le chemin direct /listings/:id tel que reçu lors d'une réécriture Vercel
  const directPathResult = await callSeoHandler(`/listings/${iphoneId}`);
  assert.equal(directPathResult.statusCode, 200);
  assert.match(directPathResult.body, /property="og:title" content="iPhone 14 Pro à vendre"/);
  assert.match(
    directPathResult.body,
    /property="og:description" content="Découvrez iPhone 14 Pro à vendre sur Kawral\. Contactez le vendeur pour plus d&#39;informations\."/
  );
  assert.match(
    directPathResult.body,
    /property="og:image" content="https:\/\/osrjeifsmhwvlfsfiggx\.supabase\.co\/storage\/v1\/object\/public\/listing-images\/u1\/l1\/cover-iphone\.webp"/
  );
  assert.match(
    directPathResult.body,
    /property="og:image:secure_url" content="https:\/\/osrjeifsmhwvlfsfiggx\.supabase\.co\/storage\/v1\/object\/public\/listing-images\/u1\/l1\/cover-iphone\.webp"/
  );
  assert.match(
    directPathResult.body,
    new RegExp(`property="og:url" content="https://www\\.kawral\\.sn/listings/${iphoneId}"`)
  );

  // Vérification de l'absence de doublons de balises meta Open Graph et Twitter
  for (const prop of [
    'og:title',
    'og:description',
    'og:image',
    'og:image:secure_url',
    'og:image:alt',
    'og:url',
    'og:type',
    'og:site_name',
  ]) {
    const matches = directPathResult.body.match(new RegExp(`property="${prop}"`, 'g')) || [];
    assert.equal(matches.length, 1, `Expected exactly 1 meta tag for ${prop}`);
  }
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    const matches = directPathResult.body.match(new RegExp(`name="${name}"`, 'g')) || [];
    assert.equal(matches.length, 1, `Expected exactly 1 meta tag for ${name}`);
  }

  // Cas d'une annonce sans aucune image : repli sur le logo officiel Kawral
  listingRows = [
    {
      ...listingRows[0],
      listing_images: [],
    },
  ];
  const noImageResult = await callSeoHandler(`/listings/${iphoneId}`);
  assert.equal(noImageResult.statusCode, 200);
  assert.match(
    noImageResult.body,
    /property="og:image" content="https:\/\/www\.kawral\.sn\/images\/kawral-app-icon\.png"/
  );
  assert.match(
    noImageResult.body,
    /property="og:image:secure_url" content="https:\/\/www\.kawral\.sn\/images\/kawral-app-icon\.png"/
  );
});

test.after(() => {
  globalThis.fetch = originalFetch;
  if (originalSupabaseUrl === undefined) delete process.env.VITE_SUPABASE_URL;
  else process.env.VITE_SUPABASE_URL = originalSupabaseUrl;
  if (originalSupabaseKey === undefined) delete process.env.VITE_SUPABASE_ANON_KEY;
  else process.env.VITE_SUPABASE_ANON_KEY = originalSupabaseKey;
});
