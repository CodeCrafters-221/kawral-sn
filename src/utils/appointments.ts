/**
 * Règle métier : la prise de rendez-vous (visite / essai) n'existe que pour
 * l'immobilier et les véhicules (à vendre ou à louer).
 * Toutes les autres catégories (mode, électronique, maison, loisirs, matériel pro,
 * pièces détachées, autres...) se gèrent par contact direct (appel, WhatsApp, message).
 *
 * La catégorie d'une annonce peut être la catégorie principale ou une sous-catégorie
 * (slug), d'où la liste explicite des slugs éligibles.
 */
const REAL_ESTATE_SLUGS = [
  'immobilier',
  'real_estate',
  'real-estate',
  'apartment',
  'apartments',
  'appartement',
  'appartements',
  'house',
  'houses',
  'maison',
  'maisons',
  'villa',
  'villas',
  'room',
  'chambre',
  'chambres',
  'studios',
  'studio',
  'land',
  'terrain',
  'terrains',
  'commercial',
  'locaux-commerciaux',
  'locaux',
  'bureau',
  'bureaux',
  'entrepot',
  'entrepots',
  'entrepôts',
];

// Véhicules uniquement (pas les pièces détachées, pneus ou accessoires auto qui sont des articles)
const VEHICLE_SLUGS = [
  'vehicule',
  'vehicules',
  'vehicle',
  'vehicles',
  'voitures',
  'voiture',
  'motos',
  'moto',
  'camions',
  'camion',
  'bus',
  'utilitaires',
  'utilitaire',
];

const APPOINTMENT_ELIGIBLE_SLUGS = new Set<string>([
  ...REAL_ESTATE_SLUGS,
  ...VEHICLE_SLUGS,
]);

export function isAppointmentEligible(categorySlug?: string | null): boolean {
  if (!categorySlug) return false;
  const clean = categorySlug.toLowerCase().trim();
  return APPOINTMENT_ELIGIBLE_SLUGS.has(clean);
}
