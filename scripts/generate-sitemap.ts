import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { MAIN_CATEGORIES_CATALOG } from '../src/data/categoriesData';

const SITE_ORIGIN = 'https://www.kawral.sn';

interface SitemapUrlEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

interface SupabaseListingRow {
  id: string;
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

function toIsoDate(dateStr?: string | null): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return parsed.toISOString().split('T')[0];
}

async function fetchPublishedListings(): Promise<SupabaseListingRow[]> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[sitemap] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY absent, génération sans annonces dynamiques.');
    return [];
  }

  try {
    const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/listings?select=id,updated_at,created_at&status=eq.published&order=created_at.desc&limit=5000`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    if (!response.ok) {
      console.warn(`[sitemap] Réponse Supabase HTTP ${response.status} — génération des routes statiques et catégories uniquement.`);
      return [];
    }

    const rows = (await response.json()) as SupabaseListingRow[];
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.warn('[sitemap] Erreur lors de la récupération des annonces Supabase:', error);
    return [];
  }
}

async function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  const entries: SitemapUrlEntry[] = [];
  const seenUrls = new Set<string>();

  const addEntry = (entry: SitemapUrlEntry) => {
    if (seenUrls.has(entry.loc)) return;
    seenUrls.add(entry.loc);
    entries.push(entry);
  };

  // 1. Pages principales & institutionnelles
  addEntry({
    loc: `${SITE_ORIGIN}/`,
    lastmod: today,
    changefreq: 'daily',
    priority: '1.0',
  });

  addEntry({
    loc: `${SITE_ORIGIN}/explorer`,
    lastmod: today,
    changefreq: 'hourly',
    priority: '0.9',
  });

  // 2. 8 Catégories principales
  for (const cat of MAIN_CATEGORIES_CATALOG) {
    addEntry({
      loc: `${SITE_ORIGIN}/categories/${cat.slug}`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.8',
    });
  }

  // 3. 64 Sous-catégories
  for (const cat of MAIN_CATEGORIES_CATALOG) {
    for (const sub of cat.subcategories) {
      addEntry({
        loc: `${SITE_ORIGIN}/categories/${sub.slug}`,
        lastmod: today,
        changefreq: 'daily',
        priority: '0.7',
      });
    }
  }

  // 4. Annonces publiées dans Supabase
  const listings = await fetchPublishedListings();
  for (const listing of listings) {
    if (!listing.id) continue;
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
    lastmod: today,
    changefreq: 'monthly',
    priority: '0.3',
  });

  addEntry({
    loc: `${SITE_ORIGIN}/terms`,
    lastmod: today,
    changefreq: 'monthly',
    priority: '0.3',
  });

  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(u.lastmod)}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    ),
    '</urlset>',
    '',
  ];

  const outputPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
  await fs.writeFile(outputPath, xmlLines.join('\n'), 'utf8');
  console.log(`[sitemap] Généré avec succès : ${entries.length} URLs (${listings.length} annonces publiées) -> ${outputPath}`);
}

generateSitemap().catch((err) => {
  console.error('[sitemap] Échec de génération du sitemap:', err);
  process.exit(1);
});
