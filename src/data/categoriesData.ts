import React from 'react';
import {
  Building2,
  Car,
  Briefcase,
  Shirt,
  Armchair,
  Smartphone,
  Gamepad2,
  Package,
  Home,
  Bed,
  Layers,
  TreePine,
  Store,
  Warehouse,
  Bike,
  Truck,
  Bus,
  Wrench,
  Disc,
  Cog,
  Hammer,
  Monitor,
  UtensilsCrossed,
  Tractor,
  Printer,
  Boxes,
  Footprints,
  ShoppingBag,
  Sparkles,
  Watch,
  Gem,
  Tv,
  Headphones,
  Camera,
  Cpu,
  Trophy,
  Music,
  BookOpen,
  Baby,
  GraduationCap,
  PartyPopper,
  Wheat,
  PawPrint,
  FolderArchive,
  Compass,
} from 'lucide-react';

export interface SubCategoryItem {
  slug: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface MainCategoryItem {
  slug: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  subcategories: SubCategoryItem[];
  // Slugs that historically belonged to this category or aliases
  legacySlugs?: string[];
}

export const MAIN_CATEGORIES_CATALOG: MainCategoryItem[] = [
  // A. Immobilier
  {
    slug: 'immobilier',
    label: 'Immobilier',
    icon: Building2,
    description: 'Vente & location de biens immobiliers',
    legacySlugs: ['real_estate'],
    subcategories: [
      { slug: 'apartment', label: 'Appartements', icon: Building2 },
      { slug: 'house', label: 'Maisons et villas', icon: Home },
      { slug: 'room', label: 'Chambres', icon: Bed },
      { slug: 'studios', label: 'Studios', icon: Layers },
      { slug: 'land', label: 'Terrains', icon: TreePine },
      { slug: 'commercial', label: 'Locaux commerciaux', icon: Store },
      { slug: 'bureaux', label: 'Bureaux', icon: Briefcase },
      { slug: 'entrepots', label: 'Entrepôts', icon: Warehouse },
    ],
  },

  // B. Véhicules
  {
    slug: 'vehicules',
    label: 'Véhicules',
    icon: Car,
    description: 'Voitures, deux-roues et pièces détachées',
    legacySlugs: ['vehicle', 'vehicule'],
    subcategories: [
      { slug: 'voitures', label: 'Voitures', icon: Car },
      { slug: 'motos', label: 'Motos et scooters', icon: Bike },
      { slug: 'camions', label: 'Camions', icon: Truck },
      { slug: 'bus', label: 'Bus et minibus', icon: Bus },
      { slug: 'utilitaires', label: 'Véhicules utilitaires', icon: Truck },
      { slug: 'pieces-detachees', label: 'Pièces détachées', icon: Wrench },
      { slug: 'pneus-jantes', label: 'Pneus et jantes', icon: Disc },
      { slug: 'accessoires-auto', label: 'Accessoires auto', icon: Cog },
    ],
  },

  // C. Matériel pro
  {
    slug: 'materiel-pro',
    label: 'Matériel pro',
    icon: Briefcase,
    description: 'Équipements d’entreprises et outillage',
    subcategories: [
      { slug: 'btp', label: 'Matériel de construction & BTP', icon: Hammer },
      { slug: 'machines-industrielles', label: 'Machines industrielles', icon: Cog },
      { slug: 'outillage-pro', label: 'Outillage professionnel', icon: Wrench },
      { slug: 'informatique-pro', label: 'Matériel informatique pro', icon: Monitor },
      { slug: 'restauration', label: 'Équipements de restauration', icon: UtensilsCrossed },
      { slug: 'agricole', label: 'Matériel agricole', icon: Tractor },
      { slug: 'bureautique', label: 'Équipements de bureau', icon: Printer },
      { slug: 'manutention', label: 'Matériel de manutention', icon: Boxes },
    ],
  },

  // D. Mode
  {
    slug: 'mode',
    label: 'Mode',
    icon: Shirt,
    description: 'Vêtements, chaussures et accessoires',
    subcategories: [
      { slug: 'mode-femme', label: 'Vêtements femme', icon: Shirt },
      { slug: 'mode-homme', label: 'Vêtements homme', icon: Shirt },
      { slug: 'mode-enfant', label: 'Vêtements enfant', icon: Baby },
      { slug: 'chaussures', label: 'Chaussures', icon: Footprints },
      { slug: 'sacs-maroquinerie', label: 'Sacs & maroquinerie', icon: ShoppingBag },
      { slug: 'bijoux', label: 'Bijoux', icon: Gem },
      { slug: 'montres', label: 'Montres', icon: Watch },
      { slug: 'accessoires-mode', label: 'Accessoires de mode', icon: Sparkles },
    ],
  },

  // E. Maison & jardin
  {
    slug: 'maison-jardin',
    label: 'Maison & jardin',
    icon: Armchair,
    description: 'Mobilier, électroménager et jardin',
    subcategories: [
      { slug: 'meubles', label: 'Meubles', icon: Armchair },
      { slug: 'electromenager', label: 'Électroménager', icon: Tv },
      { slug: 'decoration', label: 'Décoration', icon: Sparkles },
      { slug: 'cuisine', label: 'Cuisine & ustensiles', icon: UtensilsCrossed },
      { slug: 'linge-maison', label: 'Literie & linge de maison', icon: Bed },
      { slug: 'jardin', label: 'Jardin & mobilier extérieur', icon: TreePine },
      { slug: 'bricolage', label: 'Bricolage & outillage', icon: Hammer },
      { slug: 'luminaires', label: 'Luminaires', icon: Sparkles },
    ],
  },

  // F. Électronique
  {
    slug: 'electronique',
    label: 'Électronique',
    icon: Smartphone,
    description: 'Smartphones, TV et informatique',
    subcategories: [
      { slug: 'telephones', label: 'Téléphones & smartphones', icon: Smartphone },
      { slug: 'ordinateurs', label: 'Ordinateurs & PC portables', icon: Monitor },
      { slug: 'tablettes', label: 'Tablettes tactiles', icon: Smartphone },
      { slug: 'televiseurs', label: 'Téléviseurs & Smart TV', icon: Tv },
      { slug: 'audio-son', label: 'Audio & enceintes', icon: Headphones },
      { slug: 'consoles-jeux', label: 'Consoles & jeux vidéo', icon: Gamepad2 },
      { slug: 'photo-video', label: 'Appareils photo & caméras', icon: Camera },
      { slug: 'accessoires-informatique', label: 'Accessoires & composants', icon: Cpu },
    ],
  },

  // G. Loisirs
  {
    slug: 'loisirs',
    label: 'Loisirs',
    icon: Gamepad2,
    description: 'Sports, instruments et divertissements',
    subcategories: [
      { slug: 'sport-fitness', label: 'Sports & fitness', icon: Trophy },
      { slug: 'velos', label: 'Vélos & mobilités douces', icon: Bike },
      { slug: 'musique', label: 'Instruments de musique', icon: Music },
      { slug: 'livres-magazines', label: 'Livres & magazines', icon: BookOpen },
      { slug: 'jeux-jouets', label: 'Jeux & jouets', icon: Gamepad2 },
      { slug: 'camping-plein-air', label: 'Camping & plein air', icon: Compass },
      { slug: 'loisirs-creatifs', label: 'Loisirs créatifs', icon: Sparkles },
      { slug: 'collections', label: 'Collections & antiquités', icon: FolderArchive },
    ],
  },

  // H. Autres
  {
    slug: 'autres',
    label: 'Autres',
    icon: Package,
    description: 'Articles divers et opportunités',
    legacySlugs: ['other', 'autre', 'divers'],
    subcategories: [
      { slug: 'articles-bebe', label: 'Bébés & puériculture', icon: Baby },
      { slug: 'fournitures-scolaires', label: 'Fournitures scolaires', icon: GraduationCap },
      { slug: 'loisirs-enfants', label: 'Loisirs enfants', icon: Trophy },
      { slug: 'evenements-ceremonies', label: 'Événements & cérémonies', icon: PartyPopper },
      { slug: 'produits-agricoles', label: 'Produits agricoles & élevage', icon: Wheat },
      { slug: 'animaux-accessoires', label: 'Animaux & accessoires', icon: PawPrint },
      { slug: 'collections-diverses', label: 'Collections diverses', icon: FolderArchive },
      { slug: 'autres-biens', label: 'Autres biens & divers', icon: Package },
    ],
  },
];

/**
 * Returns all main categories
 */
export function getMainCategories(): MainCategoryItem[] {
  return MAIN_CATEGORIES_CATALOG;
}

/**
 * Returns the first concrete subcategory for a main category.
 */
export function getDefaultSubcategorySlug(mainSlug: string): string | undefined {
  return findMainCategory(mainSlug)?.subcategories[0]?.slug;
}

/**
 * Checks whether a slug is one of the concrete categories used for listings.
 */
export function isConcreteCategorySlug(slug: string | undefined | null): boolean {
  if (!slug) return false;
  const clean = slug.toLowerCase().trim();
  return MAIN_CATEGORIES_CATALOG.some((main) =>
    main.subcategories.some((subcategory) => subcategory.slug === clean)
  );
}

/**
 * Find a main category by slug (or legacy slug)
 */
export function findMainCategory(slug: string): MainCategoryItem | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase();
  return MAIN_CATEGORIES_CATALOG.find(
    (c) => c.slug === clean || c.legacySlugs?.includes(clean)
  );
}

/**
 * Find parent main category for a given subcategory slug
 */
export function findParentMainCategory(subSlug: string): MainCategoryItem | undefined {
  if (!subSlug) return undefined;
  const clean = subSlug.toLowerCase();

  // If subSlug is itself a main category
  const main = findMainCategory(clean);
  if (main) return main;

  // Search in subcategories
  for (const cat of MAIN_CATEGORIES_CATALOG) {
    if (cat.subcategories.some((s) => s.slug === clean)) {
      return cat;
    }
  }
  return undefined;
}

/**
 * Returns all subcategories for a given main category slug
 */
export function getSubcategories(mainSlug: string): SubCategoryItem[] {
  const main = findMainCategory(mainSlug);
  return main ? main.subcategories : [];
}

/**
 * Get all slugs belonging to a main category (main slug + legacy slugs + subcategory slugs)
 */
export function getAllCategorySlugs(mainSlug: string): string[] {
  const main = findMainCategory(mainSlug);
  if (!main) return [mainSlug];

  const slugs = new Set<string>();
  slugs.add(main.slug);
  main.legacySlugs?.forEach((s) => slugs.add(s));
  main.subcategories.forEach((sub) => slugs.add(sub.slug));

  return Array.from(slugs);
}

/**
 * Check if a listing's category matches the filter category
 */
export function isCategoryMatching(
  listingCategory: string | undefined | null,
  filterCategory: string | undefined | null
): boolean {
  if (!filterCategory) return true;
  if (!listingCategory) return false;

  const target = filterCategory.toLowerCase();
  const actual = listingCategory.toLowerCase();

  // Exact match
  if (target === actual) return true;

  // Check if target is a main category and actual is one of its subcategories or legacy aliases
  const main = findMainCategory(target);
  if (main) {
    const allSlugs = getAllCategorySlugs(main.slug);
    if (allSlugs.includes(actual)) return true;
  }

  // Check if actual maps to the same parent as target
  const parentOfActual = findParentMainCategory(actual);
  if (parentOfActual && parentOfActual.slug === target) return true;

  return false;
}

/**
 * Get human-readable label for any slug (main category or subcategory)
 */
export function getCategoryLabelFromCatalog(slug: string): string {
  if (!slug) return 'Toutes catégories';
  const clean = slug.toLowerCase();

  for (const main of MAIN_CATEGORIES_CATALOG) {
    if (main.slug === clean) return main.label;
    if (main.legacySlugs?.includes(clean)) return main.label;
    const sub = main.subcategories.find((s) => s.slug === clean);
    if (sub) return sub.label;
  }

  return slug;
}

/**
 * Détermine si une catégorie ou sous-catégorie est éligible à la location ("À louer")
 * ou si elle est strictement réservée à la vente ("À vendre").
 *
 * Règle :
 * 1. Immobilier : toutes les sous-catégories peuvent être louées ou vendues.
 * 2. Véhicules : uniquement les véhicules roulants (voitures, camions, bus, utilitaires, motos).
 *    Les pièces détachées, pneus/jantes et accessoires sont strictement à la vente.
 * 3. Toutes les autres catégories (Matériel pro, Mode, Maison & jardin, Électronique, Loisirs, Autres) :
 *    automatiquement et uniquement à la vente ("À vendre").
 */
export function isRentEligibleCategory(categorySlug: string | undefined | null): boolean {
  if (!categorySlug) return false;
  const clean = categorySlug.toLowerCase().trim();

  // 1. Immobilier : toute la catégorie immobilière
  const parent = findParentMainCategory(clean);
  const mainSlug = parent?.slug || clean;

  if (mainSlug === 'immobilier' || clean === 'real_estate') {
    return true;
  }

  // 2. Véhicules : uniquement les véhicules roulants (voitures, camions, bus, utilitaires, motos)
  if (mainSlug === 'vehicules' || mainSlug === 'vehicle' || mainSlug === 'vehicule') {
    const nonRentableVehicleParts = [
      'pieces-detachees',
      'pneus-jantes',
      'accessoires-auto',
    ];
    if (nonRentableVehicleParts.includes(clean)) {
      return false;
    }
    return true;
  }

  // 3. Toutes les autres catégories ne sont pas éligibles à la location
  return false;
}
