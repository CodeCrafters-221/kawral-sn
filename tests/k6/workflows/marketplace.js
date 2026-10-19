import http from 'k6/http';
import { group } from 'k6';
import { ENV } from '../config/env.js';
import { thinkTime, validateResponse, randomItem } from '../utils/helpers.js';

/**
 * Parcours complet de consultation de la Marketplace Kawral
 */
export function runMarketplaceWorkflow() {
  group('1. Consultation Page Accueil', () => {
    // A. Chargement de l'application frontend
    const homeRes = http.get(ENV.frontendUrl, {
      headers: ENV.browserHeaders,
      tags: { name: 'Frontend_Home' },
    });
    validateResponse(homeRes, 'Accueil');

    // B. Récupération des annonces récentes publiées avec relations Supabase
    const listingsUrl = `${ENV.supabaseUrl}/rest/v1/listings?status=eq.published&select=id,title,price,location,status,created_at,categories(id,name,slug),listing_images(image_url)&order=created_at.desc&limit=12`;
    const listingsRes = http.get(listingsUrl, {
      headers: ENV.supabaseHeaders,
      tags: { name: 'Supabase_FetchFeaturedListings' },
    });
    validateResponse(listingsRes, 'Annonces Récentes');

    // C. Récupération des agences
    const agenciesUrl = `${ENV.supabaseUrl}/rest/v1/agencies?select=id,agency_name,verified&limit=6`;
    const agenciesRes = http.get(agenciesUrl, {
      headers: ENV.supabaseHeaders,
      tags: { name: 'Supabase_FetchAgencies' },
    });
    validateResponse(agenciesRes, 'Agences');
  });

  thinkTime(1, 2);

  group('2. Recherche & Filtrage Dynamique', () => {
    const categories = ['apartment', 'land', 'vehicle', 'commercial'];
    const chosenCat = randomItem(categories);

    // Filtrage par catégorie
    const filterUrl = `${ENV.supabaseUrl}/rest/v1/listings?status=eq.published&select=id,title,price,location&limit=10`;
    const filterRes = http.get(filterUrl, {
      headers: ENV.supabaseHeaders,
      tags: { name: 'Supabase_FilterListings' },
    });
    validateResponse(filterRes, 'Filtre Catégorie');

    // Recherche par mot-clé localisation (ex: Dakar)
    const searchUrl = `${ENV.supabaseUrl}/rest/v1/listings?location=ilike.*Dakar*&status=eq.published&select=id,title,price,location&limit=10`;
    const searchRes = http.get(searchUrl, {
      headers: ENV.supabaseHeaders,
      tags: { name: 'Supabase_SearchLocation' },
    });
    validateResponse(searchRes, 'Recherche Localisation');
  });

  thinkTime(1, 2);

  group('3. Consultation Fiche Détail Annonce', () => {
    // Récupération d'une annonce spécifique
    const detailUrl = `${ENV.supabaseUrl}/rest/v1/listings?status=eq.published&select=*,categories(*),listing_images(*)&limit=1`;
    const detailRes = http.get(detailUrl, {
      headers: ENV.supabaseHeaders,
      tags: { name: 'Supabase_ListingDetail' },
    });
    validateResponse(detailRes, 'Fiche Détail Annonce');
  });
}
