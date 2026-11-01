import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { MAIN_CATEGORIES_CATALOG } from '../src/data/categoriesData';
import { SEO_CATEGORY_METADATA } from '../src/data/seoCategoryMetadata.js';

const SITE_ORIGIN = 'https://www.kawral.sn';
const PAGE_SIZE = 1000;
const MAX_SITEMAP_URLS = 50_000;

interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

interface SupabaseListingRow {
  id: string;
  status: string;
  updated_at?: string | null;
  created_at?: string | null;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDate(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().split('T')[0];
}

async function fetchPublishedListings(): Promise<SupabaseListingRow[]> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[sitemap] VITE_SUPABASE_URL et une clé publique Supabase sont nécessaires pour générer un sitemap complet.'
    );
  }

  try {
    const listings: SupabaseListingRow[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/listings?select=id,status,updated_at,created_at&status=eq.published&order=created_at.desc,id.asc&limit=${PAGE_SIZE}&offset=${offset}`;
      const response = await fetch(endpoint, {
        headers: {
          apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`[sitemap] Supabase a répondu HTTP ${response.status}.`);
      }

      const rows: unknown = await response.json();
      if (
        !Array.isArray(rows) ||
        rows.some(
          (row) =>
            !row ||
            typeof row !== 'object' ||
            typeof (row as SupabaseListingRow).id !== 'string' ||
            typeof (row as SupabaseListingRow).status !== 'string'
        )
      ) {
        throw new Error('[sitemap] Supabase a retourné une liste d’annonces invalide.');
      }

      listings.push(...(rows as SupabaseListingRow[]));
      if (rows.length < PAGE_SIZE) return listings;
      }
  } catch (error) {
    console.error('[sitemap] Récupération des annonces échouée; le sitemap n’a pas été mis à jour.', error);
    throw error;
  }
}

async function generateSitemap() {
  const sitemapCategorySlugs = new Set(
    MAIN_CATEGORIES_CATALOG.flatMap((category) => [
      category.slug,
      ...category.subcategories.map((subcategory) => subcategory.slug),
    ])
  );
  const seoCategorySlugs = new Set(Object.keys(SEO_CATEGORY_METADATA));
  if (
    sitemapCategorySlugs.size !== seoCategorySlugs.size ||
    [...sitemapCategorySlugs].some((slug) => !seoCategorySlugs.has(slug))
  ) {
    throw new Error('[sitemap] Les catégories SEO ne correspondent pas au catalogue.');
  }

  const entries: SitemapUrlEntry[] = [];
  const seenUrls = new Set<string>();

  const addEntry = (entry: SitemapUrlEntry) => {
    if (seenUrls.has(entry.loc)) return;
    if (entries.length >= MAX_SITEMAP_URLS) {
      throw new Error(`[sitemap] Le sitemap dépasse la limite de ${MAX_SITEMAP_URLS} URL.`);
    }
    seenUrls.add(entry.loc);
    entries.push(entry);
  };

  // 1. Pages principales & institutionnelles
  addEntry({
    loc: `${SITE_ORIGIN}/`,
    changefreq: 'daily',
    priority: '1.0',
  });

  addEntry({
    loc: `${SITE_ORIGIN}/explorer`,
    changefreq: 'hourly',
    priority: '0.9',
  });

  // 2. 8 Catégories principales
  for (const cat of MAIN_CATEGORIES_CATALOG) {
    addEntry({
      loc: `${SITE_ORIGIN}/categories/${cat.slug}`,
      changefreq: 'daily',
      priority: '0.8',
    });
  }

  // 3. 64 Sous-catégories
  for (const cat of MAIN_CATEGORIES_CATALOG) {
    for (const sub of cat.subcategories) {
      addEntry({
        loc: `${SITE_ORIGIN}/categories/${sub.slug}`,
        changefreq: 'daily',
        priority: '0.7',
      });
    }
  }

  // 4. Annonces publiées dans Supabase
  const listings = await fetchPublishedListings();
  const seenListingIds = new Set<string>();
  for (const listing of listings) {
    if (
      listing.status !== 'published' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        listing.id
      ) ||
      seenListingIds.has(listing.id)
    ) {
      continue;
    }
    seenListingIds.add(listing.id);
    addEntry({
      loc: `${SITE_ORIGIN}/listings/${listing.id}`,
      lastmod: toIsoDate(listing.updated_at || listing.created_at),
      changefreq: 'weekly',
      priority: '0.6',
    });
  }

  // 5. Pages légales
  addEntry({
    loc: `${SITE_ORIGIN}/privacy`,
    changefreq: 'monthly',
    priority: '0.3',
  });

  addEntry({
    loc: `${SITE_ORIGIN}/terms`,
    changefreq: 'monthly',
    priority: '0.3',
  });

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
${u.lastmod ? `    <lastmod>${escapeXml(u.lastmod)}</lastmod>\n` : ''}    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    ),
    '</urlset>',
    '',
  ];

  const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
  await fs.writeFile(outputPath, xmlLines.join('\n'), 'utf8');
  console.log(`[sitemap] Généré avec succès : ${entries.length} URLs (${seenListingIds.size} annonces publiées) -> ${outputPath}`);
}

generateSitemap().catch((err) => {
  console.error('[sitemap] Échec de génération du sitemap:', err);
  process.exit(1);
});
