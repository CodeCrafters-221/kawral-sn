export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'multiselect';

export interface FieldOption {
  value: string | number;
  label: string;
}

export interface CharacteristicField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
  helpText?: string;
}

export interface CategoryCharacteristics {
  categorySlug: string;
  fields: CharacteristicField[];
}

// ── Options réutilisables ──────────────────────────────────────────

const CONDITION_OPTIONS_STANDARD: FieldOption[] = [
  { value: 'Neuf', label: 'Neuf' },
  { value: 'Très bon état', label: 'Très bon état' },
  { value: 'Bon état', label: 'Bon état' },
  { value: 'Satisfaisant', label: 'Satisfaisant' },
  { value: 'Pour pièces', label: 'Pour pièces / À rénover' },
];

const CONDITION_OPTIONS_CLOTHING: FieldOption[] = [
  { value: 'Neuf avec étiquette', label: 'Neuf avec étiquette' },
  { value: 'Neuf sans étiquette', label: 'Neuf sans étiquette' },
  { value: 'Très bon état', label: 'Très bon état' },
  { value: 'Bon état', label: 'Bon état' },
];

const CONDITION_OPTIONS_SHOES: FieldOption[] = [
  { value: 'Neuf avec boîte', label: 'Neuf avec boîte' },
  { value: 'Neuf sans boîte', label: 'Neuf sans boîte' },
  { value: 'Très bon état', label: 'Très bon état' },
  { value: 'Bon état', label: 'Bon état' },
];

const CONDITION_OPTIONS_TECH: FieldOption[] = [
  { value: 'Neuf sous blister', label: 'Neuf sous blister' },
  { value: 'Comme neuf', label: 'Comme neuf' },
  { value: 'Très bon état', label: 'Très bon état' },
  { value: 'Bon état', label: 'Bon état' },
  { value: 'Écran fissuré / Pour pièces', label: 'Écran fissuré / Pour pièces' },
];

const FUEL_OPTIONS: FieldOption[] = [
  { value: 'Essence', label: 'Essence' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Hybride', label: 'Hybride' },
  { value: 'Électrique', label: 'Électrique' },
];

const CLOTHING_SIZES_ADULT: FieldOption[] = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
  { value: 'XXXL', label: 'XXXL' },
  { value: 'Sur-mesure / Autre', label: 'Sur-mesure / Autre' },
];

const CLOTHING_SIZES_CHILD: FieldOption[] = [
  { value: '0-6 mois', label: '0-6 mois' },
  { value: '6-12 mois', label: '6-12 mois' },
  { value: '1-2 ans', label: '1-2 ans' },
  { value: '3-4 ans', label: '3-4 ans' },
  { value: '5-6 ans', label: '5-6 ans' },
  { value: '7-8 ans', label: '7-8 ans' },
  { value: '9-10 ans', label: '9-10 ans' },
  { value: '11-12 ans', label: '11-12 ans' },
  { value: '13-14 ans', label: '13-14 ans' },
  { value: 'Autre', label: 'Autre' },
];

export const SHOE_SIZES_OPTIONS: FieldOption[] = [
  { value: '35', label: '35' },
  { value: '36', label: '36' },
  { value: '37', label: '37' },
  { value: '38', label: '38' },
  { value: '39', label: '39' },
  { value: '40', label: '40' },
  { value: '41', label: '41' },
  { value: '42', label: '42' },
  { value: '43', label: '43' },
  { value: '44', label: '44' },
  { value: '45', label: '45' },
  { value: '46', label: '46' },
  { value: '47', label: '47' },
  { value: '48+', label: '48+' },
  { value: 'Enfants (< 35)', label: 'Enfants (< 35)' },
  { value: 'Toutes pointures', label: 'Toutes pointures disponibles' },
];

const STORAGE_OPTIONS_PHONE: FieldOption[] = [
  { value: '32 Go', label: '32 Go' },
  { value: '64 Go', label: '64 Go' },
  { value: '128 Go', label: '128 Go' },
  { value: '256 Go', label: '256 Go' },
  { value: '512 Go', label: '512 Go' },
  { value: '1 To', label: '1 To' },
];

const RAM_OPTIONS_PC: FieldOption[] = [
  { value: '4 Go', label: '4 Go' },
  { value: '8 Go', label: '8 Go' },
  { value: '16 Go', label: '16 Go' },
  { value: '32 Go', label: '32 Go' },
  { value: '64 Go', label: '64 Go' },
];

const STORAGE_OPTIONS_PC: FieldOption[] = [
  { value: '128 Go SSD', label: '128 Go SSD' },
  { value: '256 Go SSD', label: '256 Go SSD' },
  { value: '512 Go SSD', label: '512 Go SSD' },
  { value: '1 To SSD', label: '1 To SSD' },
  { value: '1 To HDD', label: '1 To HDD' },
  { value: '2 To ou plus', label: '2 To ou plus' },
];

const currentYear = new Date().getFullYear();

// ── Champs de base ──────────────────────────────────────────────────

export const FIELD_BRAND: CharacteristicField = {
  id: 'brand',
  label: 'Marque',
  type: 'text',
  placeholder: 'Ex: Toyota, Samsung, Nike...',
};

export const FIELD_MODEL: CharacteristicField = {
  id: 'model',
  label: 'Modèle',
  type: 'text',
  placeholder: 'Ex: Corolla, iPhone 14, Galaxy S23...',
};

export const FIELD_YEAR: CharacteristicField = {
  id: 'year',
  label: 'Année',
  type: 'number',
  min: 1970,
  max: currentYear + 1,
  placeholder: `Ex: ${currentYear - 2}`,
};

export const FIELD_MILEAGE: CharacteristicField = {
  id: 'mileage',
  label: 'Kilométrage',
  type: 'number',
  min: 0,
  unit: 'km',
  placeholder: 'Ex: 65000',
};

export const FIELD_SURFACE: CharacteristicField = {
  id: 'surface',
  label: 'Surface',
  type: 'number',
  min: 1,
  unit: 'm²',
  placeholder: 'Ex: 120',
};

export const FIELD_CONDITION: CharacteristicField = {
  id: 'condition',
  label: 'État',
  type: 'select',
  options: CONDITION_OPTIONS_STANDARD,
};

// ── Registre complet simplifié (3 à 5 champs essentiels par sous-catégorie) ────

const CHARACTERISTICS_REGISTRY: CategoryCharacteristics[] = [
  // =========================================================================
  // A. IMMOBILIER
  // =========================================================================
  {
    categorySlug: 'apartment',
    fields: [
      FIELD_SURFACE,
      { id: 'rooms', label: 'Nombre de pièces', type: 'number', min: 1, placeholder: 'Ex: 4' },
      { id: 'bedrooms', label: 'Nombre de chambres', type: 'number', min: 0, placeholder: 'Ex: 3' },
      { id: 'bathrooms', label: 'Salles de bain', type: 'number', min: 0, placeholder: 'Ex: 2' },
      {
        id: 'furnished',
        label: 'Meublé',
        type: 'select',
        options: [
          { value: 'Non meublé', label: 'Non meublé' },
          { value: 'Meublé', label: 'Meublé' },
        ],
      },
    ],
  },
  {
    categorySlug: 'house',
    fields: [
      { id: 'surface', label: 'Surface habitable', type: 'number', min: 1, unit: 'm²', placeholder: 'Ex: 250' },
      { id: 'rooms', label: 'Nombre de pièces', type: 'number', min: 1, placeholder: 'Ex: 5' },
      { id: 'bedrooms', label: 'Nombre de chambres', type: 'number', min: 0, placeholder: 'Ex: 4' },
      { id: 'bathrooms', label: 'Salles de bain', type: 'number', min: 0, placeholder: 'Ex: 3' },
      { id: 'landSurface', label: 'Surface du terrain', type: 'number', min: 1, unit: 'm²', placeholder: 'Ex: 400' },
    ],
  },
  {
    categorySlug: 'room',
    fields: [
      {
        id: 'roomType',
        label: 'Type de chambre',
        type: 'select',
        options: [
          { value: 'Chambre individuelle', label: 'Chambre individuelle' },
          { value: 'Chambre partagée / Colocation', label: 'Chambre partagée / Colocation' },
        ],
      },
      { id: 'surface', label: 'Surface', type: 'number', min: 1, unit: 'm²', placeholder: 'Ex: 16' },
      {
        id: 'furnished',
        label: 'Meublée',
        type: 'select',
        options: [
          { value: 'Meublée', label: 'Meublée' },
          { value: 'Non meublée', label: 'Non meublée' },
        ],
      },
      {
        id: 'bathroomType',
        label: 'Salle de bain',
        type: 'select',
        options: [
          { value: 'Privée', label: 'Privée' },
          { value: 'Partagée', label: 'Partagée' },
        ],
      },
    ],
  },
  {
    categorySlug: 'studios',
    fields: [
      FIELD_SURFACE,
      {
        id: 'furnished',
        label: 'Meublé',
        type: 'select',
        options: [
          { value: 'Meublé', label: 'Meublé' },
          { value: 'Non meublé', label: 'Non meublé' },
        ],
      },
      { id: 'floorLevel', label: 'Étage', type: 'number', placeholder: 'Ex: 2' },
    ],
  },
  {
    categorySlug: 'land',
    fields: [
      FIELD_SURFACE,
      {
        id: 'landType',
        label: 'Type de terrain',
        type: 'select',
        options: [
          { value: 'Habitation / Résidentiel', label: 'Habitation / Résidentiel' },
          { value: 'Commercial', label: 'Commercial' },
          { value: 'Agricole', label: 'Agricole' },
          { value: 'Industriel', label: 'Industriel' },
        ],
      },
      {
        id: 'titleDeed',
        label: 'Statut foncier',
        type: 'select',
        options: [
          { value: 'Titre Foncier (TF)', label: 'Titre Foncier (TF)' },
          { value: 'Bail', label: 'Bail' },
          { value: 'Délibération / Attribution', label: 'Délibération / Attribution' },
          { value: 'Acte administratif', label: 'Acte administratif' },
          { value: 'Autre / En cours', label: 'Autre / En cours' },
        ],
      },
    ],
  },
  {
    categorySlug: 'commercial',
    fields: [
      FIELD_SURFACE,
      {
        id: 'commercialType',
        label: 'Type de local',
        type: 'select',
        options: [
          { value: 'Boutique / Magasin', label: 'Boutique / Magasin' },
          { value: 'Bureau / Showroom', label: 'Bureau / Showroom' },
          { value: 'Restaurant / Snack', label: 'Restaurant / Snack' },
          { value: 'Atelier', label: 'Atelier' },
          { value: 'Autre', label: 'Autre' },
        ],
      },
      {
        id: 'condition',
        label: 'État',
        type: 'select',
        options: [
          { value: 'Neuf', label: 'Neuf' },
          { value: 'Très bon état', label: 'Très bon état' },
          { value: 'Bon état', label: 'Bon état' },
          { value: 'À rénover', label: 'À rénover' },
        ],
      },
    ],
  },
  {
    categorySlug: 'bureaux',
    fields: [
      FIELD_SURFACE,
      { id: 'rooms', label: 'Nombre de pièces / bureaux', type: 'number', min: 1, placeholder: 'Ex: 4' },
      {
        id: 'furnished',
        label: 'Meublé',
        type: 'select',
        options: [
          { value: 'Non meublé', label: 'Non meublé' },
          { value: 'Meublé', label: 'Meublé' },
        ],
      },
    ],
  },
  {
    categorySlug: 'entrepots',
    fields: [
      FIELD_SURFACE,
      { id: 'ceilingHeight', label: 'Hauteur sous plafond', type: 'number', min: 1, unit: 'm', placeholder: 'Ex: 6' },
      {
        id: 'heavyVehicleAccess',
        label: 'Accès poids lourds',
        type: 'select',
        options: [
          { value: 'Oui', label: 'Oui' },
          { value: 'Non', label: 'Non' },
        ],
      },
    ],
  },

  // =========================================================================
  // B. VÉHICULES
  // =========================================================================
  {
    categorySlug: 'voitures',
    fields: [
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Toyota, Peugeot, Hyundai...' },
      { id: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: Corolla, 3008, Tucson...' },
      FIELD_YEAR,
      FIELD_MILEAGE,
      { id: 'fuel', label: 'Carburant', type: 'select', options: FUEL_OPTIONS },
    ],
  },
  {
    categorySlug: 'motos',
    fields: [
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Yamaha, Honda, Bajaj, KTM...' },
      { id: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: T-Max, Forza, Pulsar...' },
      { id: 'engineCapacity', label: 'Cylindrée', type: 'number', unit: 'cm³', placeholder: 'Ex: 125, 250, 500...' },
      FIELD_YEAR,
      FIELD_MILEAGE,
    ],
  },
  {
    categorySlug: 'camions',
    fields: [
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Mercedes-Benz, Renault, Volvo...' },
      { id: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: Actros, Kerax, FH...' },
      FIELD_YEAR,
      FIELD_MILEAGE,
      { id: 'payload', label: 'Capacité de charge', type: 'number', unit: 'tonnes', placeholder: 'Ex: 10, 20...' },
    ],
  },
  {
    categorySlug: 'bus',
    fields: [
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Toyota, Mercedes-Benz, Hyundai...' },
      { id: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: Coaster, HiAce, Sprinter...' },
      { id: 'passengerCapacity', label: 'Nombre de places', type: 'number', min: 1, placeholder: 'Ex: 15, 30, 50...' },
      FIELD_YEAR,
      FIELD_MILEAGE,
    ],
  },
  {
    categorySlug: 'utilitaires',
    fields: [
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Renault, Peugeot, Toyota...' },
      { id: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: Master, Hilux, Berlingo...' },
      FIELD_YEAR,
      FIELD_MILEAGE,
      { id: 'payload', label: 'Charge utile', type: 'number', unit: 'kg', placeholder: 'Ex: 1000, 1500...' },
    ],
  },
  {
    categorySlug: 'pieces-detachees',
    fields: [
      { id: 'partType', label: 'Type de pièce', type: 'text', placeholder: 'Ex: Phare avant, Alternateur, Rétroviseur...' },
      { id: 'compatibleBrand', label: 'Marque compatible', type: 'text', placeholder: 'Ex: Toyota, Peugeot...' },
      { id: 'compatibleModel', label: 'Modèle compatible', type: 'text', placeholder: 'Ex: Corolla, 308...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'pneus-jantes',
    fields: [
      {
        id: 'itemType',
        label: 'Type',
        type: 'select',
        options: [
          { value: 'Pneus', label: 'Pneus' },
          { value: 'Jantes', label: 'Jantes' },
          { value: 'Roues complètes', label: 'Roues complètes' },
        ],
      },
      { id: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'Ex: 205/55 R16, 225/45 R17...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Michelin, Bridgestone, Goodyear...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'accessoires-auto',
    fields: [
      { id: 'accessoryType', label: "Type d'accessoire", type: 'text', placeholder: 'Ex: Housse de siège, Galerie, Dashcam...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Pioneer, Michelin...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },

  // =========================================================================
  // C. MATÉRIEL PRO
  // =========================================================================
  {
    categorySlug: 'outillage-pro',
    fields: [
      { id: 'toolType', label: "Type d'outil", type: 'text', placeholder: 'Ex: Marteau piqueur, Poste à souder, Compresseur...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Bosch Pro, Makita, Hilti, DeWalt...' },
      {
        id: 'powerSupply',
        label: 'Alimentation',
        type: 'select',
        options: [
          { value: 'Filaire (220V)', label: 'Filaire (220V)' },
          { value: 'Batterie', label: 'Batterie' },
          { value: 'Thermique (Carburant)', label: 'Thermique (Carburant)' },
          { value: 'Pneumatique', label: 'Pneumatique' },
          { value: 'Manuel', label: 'Manuel' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'btp',
    fields: [
      { id: 'equipmentType', label: 'Type de matériel', type: 'text', placeholder: 'Ex: Bétonnière, Échafaudage, Vibreur, Engin...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Caterpillar, JCB, Komatsu...' },
      { id: 'power', label: 'Puissance / Capacité', type: 'text', placeholder: 'Ex: 350L, 50 kVA, 15 kW...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'machines-industrielles',
    fields: [
      { id: 'machineType', label: 'Type de machine', type: 'text', placeholder: 'Ex: Tour mécanique, Presse, Broyeur, Ensacheuse...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Haas, Trumpf, SCM...' },
      { id: 'productionCapacity', label: 'Capacité de production', type: 'text', placeholder: 'Ex: 500 kg/h, 1000 pcs/jour...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'informatique-pro',
    fields: [
      { id: 'itType', label: 'Type de matériel', type: 'text', placeholder: 'Ex: Serveur rack, Onduleur, Baie de brassage, Switch...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Dell EMC, HP Enterprise, Cisco, APC...' },
      { id: 'specs', label: 'Spécifications principales', type: 'text', placeholder: 'Ex: 2x Xeon, 64 Go RAM, 10kVA...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'restauration',
    fields: [
      { id: 'cateringType', label: "Type d'équipement", type: 'text', placeholder: 'Ex: Four à pizza, Friteuse pro, Chambre froide...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Rational, Zanussi, Diamond...' },
      {
        id: 'powerSupply',
        label: 'Énergie',
        type: 'select',
        options: [
          { value: 'Électrique (220V/380V)', label: 'Électrique (220V/380V)' },
          { value: 'Gaz', label: 'Gaz' },
          { value: 'Mixte', label: 'Mixte' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'agricole',
    fields: [
      { id: 'agriType', label: 'Type de matériel', type: 'text', placeholder: 'Ex: Motoculteur, Tracteur, Pompe d\'irrigation, Moulin...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: John Deere, Massey Ferguson, Kubota...' },
      { id: 'power', label: 'Puissance', type: 'text', placeholder: 'Ex: 75 CV, 15 HP...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'bureautique',
    fields: [
      { id: 'officeType', label: "Type d'équipement", type: 'text', placeholder: 'Ex: Photocopieur multifonction, Traceur, Destructeur...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Canon, HP, Ricoh, Konica Minolta...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'manutention',
    fields: [
      { id: 'handlingType', label: 'Type de matériel', type: 'text', placeholder: 'Ex: Transpalette, Chariot élévateur, Gerbeur, Diable...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Toyota, Linde, Jungheinrich...' },
      { id: 'loadCapacity', label: 'Capacité de charge', type: 'text', placeholder: 'Ex: 1.5 tonne, 2500 kg...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },

  // =========================================================================
  // D. MODE
  // =========================================================================
  {
    categorySlug: 'mode-homme',
    fields: [
      { id: 'clothingType', label: 'Type de vêtement', type: 'text', placeholder: 'Ex: Chemise, Pantalon, Boubou, Costume, Veste...' },
      { id: 'size', label: 'Taille(s)', type: 'multiselect', options: CLOTHING_SIZES_ADULT, placeholder: 'Sélectionner les tailles...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Zara, Nike, Celio, Hugo Boss...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_CLOTHING },
    ],
  },
  {
    categorySlug: 'mode-femme',
    fields: [
      { id: 'clothingType', label: 'Type de vêtement', type: 'text', placeholder: 'Ex: Robe, Tailleur, Jupe, Boubou, Combinaison...' },
      { id: 'size', label: 'Taille(s)', type: 'multiselect', options: CLOTHING_SIZES_ADULT, placeholder: 'Sélectionner les tailles...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Zara, Mango, H&M, Créateur local...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_CLOTHING },
    ],
  },
  {
    categorySlug: 'mode-enfant',
    fields: [
      { id: 'clothingType', label: 'Type de vêtement', type: 'text', placeholder: 'Ex: Ensemble, Robe, T-shirt, Pantalon...' },
      { id: 'size', label: 'Âge / Taille(s)', type: 'multiselect', options: CLOTHING_SIZES_CHILD, placeholder: 'Sélectionner les tailles...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Okaïdi, Petit Bateau, Zara Kids...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_CLOTHING },
    ],
  },
  {
    categorySlug: 'chaussures',
    fields: [
      { id: 'shoeType', label: 'Type de chaussures', type: 'text', placeholder: 'Ex: Baskets, Sneakers, Mocassins, Sandales, Escarpins...' },
      { id: 'shoeSize', label: 'Pointure(s) disponible(s)', type: 'multiselect', options: SHOE_SIZES_OPTIONS, placeholder: 'Sélectionner les pointures disponibles...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Nike, Adidas, Clarks, Zara...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_SHOES },
    ],
  },
  {
    categorySlug: 'sacs-maroquinerie',
    fields: [
      { id: 'bagType', label: "Type d'article", type: 'text', placeholder: 'Ex: Sac à main, Sac à dos, Valise, Portefeuille...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Michael Kors, Guess, Samsonite...' },
      {
        id: 'material',
        label: 'Matière',
        type: 'select',
        options: [
          { value: 'Cuir véritable', label: 'Cuir véritable' },
          { value: 'Simili cuir', label: 'Simili cuir' },
          { value: 'Toile / Tissu', label: 'Toile / Tissu' },
          { value: 'Autre', label: 'Autre' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'bijoux',
    fields: [
      { id: 'jewelryType', label: 'Type de bijou', type: 'text', placeholder: 'Ex: Bague, Collier, Bracelet, Boucles d\'oreilles...' },
      {
        id: 'material',
        label: 'Matière',
        type: 'select',
        options: [
          { value: 'Or 18k / 24k', label: 'Or 18k / 24k' },
          { value: 'Argent 925', label: 'Argent 925' },
          { value: 'Plaqué or', label: 'Plaqué or' },
          { value: 'Acier inoxydable', label: 'Acier inoxydable' },
          { value: 'Fantaisie / Perles', label: 'Fantaisie / Perles' },
          { value: 'Autre', label: 'Autre' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'montres',
    fields: [
      {
        id: 'watchType',
        label: 'Type de montre',
        type: 'select',
        options: [
          { value: 'Automatique / Mécanique', label: 'Automatique / Mécanique' },
          { value: 'Quartz (à pile)', label: 'Quartz (à pile)' },
          { value: 'Montre connectée (Smartwatch)', label: 'Montre connectée (Smartwatch)' },
        ],
      },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Casio, Tissot, Apple, Seiko, Rolex...' },
      { id: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: Series 9, PRX, G-Shock...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'accessoires-mode',
    fields: [
      { id: 'accessoryType', label: "Type d'accessoire", type: 'text', placeholder: 'Ex: Ceinture, Lunettes de soleil, Chapeau, Cravate...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Ray-Ban, Gucci, Tommy Hilfiger...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },

  // =========================================================================
  // E. MAISON & JARDIN
  // =========================================================================
  {
    categorySlug: 'meubles',
    fields: [
      { id: 'furnitureType', label: 'Type de meuble', type: 'text', placeholder: 'Ex: Canapé d\'angle, Table à manger, Lit, Armoire, Bureau...' },
      { id: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'Ex: 200 x 90 cm, 6 places, 180x200 cm...' },
      {
        id: 'material',
        label: 'Matière',
        type: 'select',
        options: [
          { value: 'Bois massif', label: 'Bois massif' },
          { value: 'MDF / Contreplaqué', label: 'MDF / Contreplaqué' },
          { value: 'Métal / Fer forgé', label: 'Métal / Fer forgé' },
          { value: 'Cuir / Simili', label: 'Cuir / Simili' },
          { value: 'Tissu / Velours', label: 'Tissu / Velours' },
          { value: 'Verre', label: 'Verre' },
          { value: 'Autre', label: 'Autre' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'electromenager',
    fields: [
      { id: 'applianceType', label: "Type d'appareil", type: 'text', placeholder: 'Ex: Réfrigérateur, Lave-linge, Cuisinière à gaz, Micro-ondes...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Samsung, LG, Beko, Whirlpool, Midea...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'decoration',
    fields: [
      { id: 'decoType', label: "Type d'article", type: 'text', placeholder: 'Ex: Tapis salon, Tableau, Grand miroir, Rideaux, Vase...' },
      { id: 'material', label: 'Matière / Style', type: 'text', placeholder: 'Ex: Moderne, Bois sculpté, Doré...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'cuisine',
    fields: [
      { id: 'kitchenType', label: "Type d'équipement", type: 'text', placeholder: 'Ex: Batterie de casseroles, Robot multifonction, Blender...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Moulinex, Tefal, Ninja...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'linge-maison',
    fields: [
      { id: 'linenType', label: "Type d'article", type: 'text', placeholder: 'Ex: Matelas orthopédique, Parure de lit, Couette, Rideaux...' },
      { id: 'dimensions', label: 'Dimensions', type: 'text', placeholder: 'Ex: 2 places (160x200), 1 place (90x190)...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'jardin',
    fields: [
      { id: 'gardenType', label: "Type d'article", type: 'text', placeholder: 'Ex: Salon de jardin, Tondeuse, Parasol déporté, Barbecue...' },
      {
        id: 'material',
        label: 'Matière',
        type: 'select',
        options: [
          { value: 'Résine tressée', label: 'Résine tressée' },
          { value: 'Aluminium / Métal', label: 'Aluminium / Métal' },
          { value: 'Bois', label: 'Bois' },
          { value: 'Plastique', label: 'Plastique' },
          { value: 'Autre', label: 'Autre' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'bricolage',
    fields: [
      { id: 'toolType', label: "Type d'outil", type: 'text', placeholder: 'Ex: Perceuse-visseuse, Escabeau, Boîte à outils, Meuleuse...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Bosch, Black+Decker, Total...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'luminaires',
    fields: [
      { id: 'lightType', label: 'Type de luminaire', type: 'text', placeholder: 'Ex: Lustre moderne, Lampadaire sur pied, Suspension LED, Projecteur...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },

  // =========================================================================
  // F. ÉLECTRONIQUE
  // =========================================================================
  {
    categorySlug: 'telephones',
    fields: [
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Apple, Samsung, Xiaomi, Tecno, Infinix, Huawei...' },
      { id: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: iPhone 14 Pro, Galaxy S23, Camon 20...' },
      { id: 'storage', label: 'Stockage', type: 'select', options: STORAGE_OPTIONS_PHONE },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_TECH },
    ],
  },
  {
    categorySlug: 'ordinateurs',
    fields: [
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Apple, HP, Dell, Lenovo, Asus, Acer...' },
      { id: 'processor', label: 'Processeur', type: 'text', placeholder: 'Ex: Intel Core i5/i7, AMD Ryzen 5/7, Apple M1/M2/M3...' },
      { id: 'ram', label: 'Mémoire RAM', type: 'select', options: RAM_OPTIONS_PC },
      { id: 'storage', label: 'Stockage', type: 'select', options: STORAGE_OPTIONS_PC },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'tablettes',
    fields: [
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Apple iPad, Samsung Galaxy Tab...' },
      { id: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: iPad 10, Tab S9, iPad Air...' },
      { id: 'storage', label: 'Stockage', type: 'select', options: STORAGE_OPTIONS_PHONE },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_TECH },
    ],
  },
  {
    categorySlug: 'televiseurs',
    fields: [
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Samsung, LG, TCL, Hisense, Sony...' },
      { id: 'screenSize', label: "Taille d'écran", type: 'number', min: 15, max: 120, unit: 'pouces', placeholder: 'Ex: 43, 50, 55, 65...' },
      {
        id: 'resolution',
        label: 'Résolution',
        type: 'select',
        options: [
          { value: '4K Ultra HD', label: '4K Ultra HD' },
          { value: 'Full HD (1080p)', label: 'Full HD (1080p)' },
          { value: 'Smart TV HD', label: 'Smart TV HD' },
          { value: '8K', label: '8K' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'audio-son',
    fields: [
      { id: 'audioType', label: "Type d'appareil", type: 'text', placeholder: 'Ex: Enceinte Bluetooth, Casque sans fil, Barre de son, Écouteurs...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: JBL, Bose, Sony, Apple AirPods, Marshall...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'consoles-jeux',
    fields: [
      {
        id: 'gamingType',
        label: 'Type',
        type: 'select',
        options: [
          { value: 'Console complète', label: 'Console complète' },
          { value: 'Jeu vidéo', label: 'Jeu vidéo' },
          { value: 'Manette / Accessoire', label: 'Manette / Accessoire' },
        ],
      },
      {
        id: 'platform',
        label: 'Plateforme',
        type: 'select',
        options: [
          { value: 'PlayStation 5', label: 'PlayStation 5' },
          { value: 'PlayStation 4', label: 'PlayStation 4' },
          { value: 'Xbox Series', label: 'Xbox Series' },
          { value: 'Xbox One', label: 'Xbox One' },
          { value: 'Nintendo Switch', label: 'Nintendo Switch' },
          { value: 'PC', label: 'PC' },
          { value: 'Autre', label: 'Autre' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'photo-video',
    fields: [
      {
        id: 'cameraType',
        label: "Type d'appareil",
        type: 'select',
        options: [
          { value: 'Appareil photo hybride', label: 'Appareil photo hybride' },
          { value: 'Reflex numérique', label: 'Reflex numérique' },
          { value: 'Caméra d\'action / GoPro', label: 'Caméra d\'action / GoPro' },
          { value: 'Drone avec caméra', label: 'Drone avec caméra' },
          { value: 'Objectif photo', label: 'Objectif photo' },
        ],
      },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Canon, Sony, Nikon, DJI, GoPro...' },
      { id: 'model', label: 'Modèle', type: 'text', placeholder: 'Ex: EOS R6, Alpha A7, Mini 3 Pro...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'accessoires-informatique',
    fields: [
      { id: 'accessoryType', label: "Type d'accessoire", type: 'text', placeholder: 'Ex: Écran / Moniteur, Clavier, Souris, Disque dur externe, Carte graphique...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Logitech, Dell, Samsung, Kingston...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },

  // =========================================================================
  // G. LOISIRS
  // =========================================================================
  {
    categorySlug: 'velos',
    fields: [
      {
        id: 'bikeType',
        label: 'Type de vélo',
        type: 'select',
        options: [
          { value: 'VTT (Tout terrain)', label: 'VTT (Tout terrain)' },
          { value: 'Vélo de ville', label: 'Vélo de ville' },
          { value: 'Vélo de course / Route', label: 'Vélo de course / Route' },
          { value: 'Vélo enfant', label: 'Vélo enfant' },
          { value: 'Trottinette électrique', label: 'Trottinette électrique' },
          { value: 'Autre', label: 'Autre' },
        ],
      },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Btwin, Trek, Giant, Specialized...' },
      {
        id: 'wheelSize',
        label: 'Taille des roues',
        type: 'select',
        options: [
          { value: '16 pouces', label: '16 pouces' },
          { value: '20 pouces', label: '20 pouces' },
          { value: '24 pouces', label: '24 pouces' },
          { value: '26 pouces', label: '26 pouces' },
          { value: '27.5 pouces', label: '27.5 pouces' },
          { value: '28 pouces / 700c', label: '28 pouces / 700c' },
          { value: '29 pouces', label: '29 pouces' },
          { value: 'Autre', label: 'Autre' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'sport-fitness',
    fields: [
      { id: 'sportType', label: "Type d'équipement", type: 'text', placeholder: 'Ex: Tapis de course, Vélo stationnaire, Haltères, Banc de muscu...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Domyos, Decathlon, Nike, Adidas...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'musique',
    fields: [
      { id: 'instrumentType', label: "Type d'instrument", type: 'text', placeholder: 'Ex: Guitare acoustique, Clavier / Synthé, Batterie, Djembé, Basse...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Yamaha, Fender, Roland, Ibanez...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'livres-magazines',
    fields: [
      { id: 'bookGenre', label: 'Genre / Domaine', type: 'text', placeholder: 'Ex: Littérature, Religion / Coran, Développement personnel, Scolaire...' },
      {
        id: 'language',
        label: 'Langue',
        type: 'select',
        options: [
          { value: 'Français', label: 'Français' },
          { value: 'Arabe', label: 'Arabe' },
          { value: 'Anglais', label: 'Anglais' },
          { value: 'Wolof', label: 'Wolof' },
          { value: 'Autre', label: 'Autre' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'jeux-jouets',
    fields: [
      { id: 'toyType', label: 'Type de jeu', type: 'text', placeholder: 'Ex: Jeu de société, Lego, Poupée, Voiture téléguidée...' },
      {
        id: 'age',
        label: 'Âge recommandé',
        type: 'select',
        options: [
          { value: '0-2 ans', label: '0-2 ans' },
          { value: '3-5 ans', label: '3-5 ans' },
          { value: '6-8 ans', label: '6-8 ans' },
          { value: '9-12 ans', label: '9-12 ans' },
          { value: 'Adulte / Tout âge', label: 'Adulte / Tout âge' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'camping-plein-air',
    fields: [
      { id: 'gearType', label: "Type d'équipement", type: 'text', placeholder: 'Ex: Tente de camping, Sac de couchage, Glacière, Matelas gonflable...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Quechua, Coleman...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'loisirs-creatifs',
    fields: [
      { id: 'craftType', label: 'Activité', type: 'text', placeholder: 'Ex: Couture / Machine à coudre, Peinture & Toiles, Tricot...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'collections',
    fields: [
      { id: 'collectionType', label: "Type d'objet", type: 'text', placeholder: 'Ex: Monnaie ancienne, Timbre de collection, Masque d\'art, Montre vintage...' },
      { id: 'era', label: 'Époque / Origine', type: 'text', placeholder: 'Ex: Années 60, Artisanal d\'Afrique de l\'Ouest...' },
      {
        id: 'condition',
        label: 'État',
        type: 'select',
        options: [
          { value: 'Parfait état', label: 'Parfait état' },
          { value: 'Bon état de conservation', label: 'Bon état de conservation' },
          { value: 'État d\'usage', label: 'État d\'usage' },
        ],
      },
    ],
  },

  // =========================================================================
  // H. AUTRES
  // =========================================================================
  {
    categorySlug: 'articles-bebe',
    fields: [
      { id: 'babyItemType', label: "Type d'article", type: 'text', placeholder: 'Ex: Poussette, Siège auto, Lit parapluie, Chaise haute, Baignoire...' },
      {
        id: 'age',
        label: 'Âge recommandé',
        type: 'select',
        options: [
          { value: 'Dès la naissance (0-6 mois)', label: 'Dès la naissance (0-6 mois)' },
          { value: '6-12 mois', label: '6-12 mois' },
          { value: '1-3 ans', label: '1-3 ans' },
          { value: '3 ans et plus', label: '3 ans et plus' },
          { value: 'Tous âges', label: 'Tous âges' },
        ],
      },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Chicco, Bébé Confort, Cybex, Joie...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'fournitures-scolaires',
    fields: [
      { id: 'schoolItemType', label: "Type d'article", type: 'text', placeholder: 'Ex: Cartable / Sac à dos, Calculatrice Casio, Lot de cahiers...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'loisirs-enfants',
    fields: [
      { id: 'childLeisureType', label: "Type d'article", type: 'text', placeholder: 'Ex: Trampoline, Toboggan, Maisonnette, Trotteur...' },
      {
        id: 'age',
        label: 'Âge recommandé',
        type: 'select',
        options: [
          { value: '1-3 ans', label: '1-3 ans' },
          { value: '3-6 ans', label: '3-6 ans' },
          { value: '6-10 ans', label: '6-10 ans' },
          { value: 'Tous âges', label: 'Tous âges' },
        ],
      },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'evenements-ceremonies',
    fields: [
      { id: 'eventItemType', label: "Type d'article", type: 'text', placeholder: 'Ex: Tente de réception, Bâche, Chaises VIP, Décoration de mariage...' },
      { id: 'capacity', label: 'Capacité / Quantité', type: 'text', placeholder: 'Ex: 50 personnes, Lot de 100 chaises, 5x10 m...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'produits-agricoles',
    fields: [
      { id: 'productType', label: 'Type de produit', type: 'text', placeholder: 'Ex: Sacs d\'arachide, Mil, Maïs, Aliments volaille, Foin...' },
      { id: 'quantity', label: 'Conditionnement / Quantité', type: 'text', placeholder: 'Ex: Sac de 50 kg, Tonne, Balle de 20 kg...' },
    ],
  },
  {
    categorySlug: 'animaux-accessoires',
    fields: [
      { id: 'animalType', label: 'Animal ou accessoire', type: 'text', placeholder: 'Ex: Mouton Ladoum, Chien berger, Cage à oiseaux, Aquarium...' },
      {
        id: 'condition',
        label: 'État / Santé',
        type: 'select',
        options: [
          { value: 'Animal en excellente santé / vacciné', label: 'Animal en excellente santé / vacciné' },
          { value: 'Accessoire neuf', label: 'Accessoire neuf' },
          { value: 'Accessoire occasion', label: 'Accessoire occasion' },
        ],
      },
    ],
  },
  {
    categorySlug: 'collections-diverses',
    fields: [
      { id: 'itemType', label: "Type d'article", type: 'text', placeholder: 'Ex: Souvenirs rares, Artisanat d\'exception...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },
  {
    categorySlug: 'autres-biens',
    fields: [
      { id: 'itemType', label: "Type d'article", type: 'text', placeholder: 'Ex: Objet divers...' },
      { id: 'brand', label: 'Marque', type: 'text', placeholder: 'Ex: Marque si connue...' },
      { id: 'condition', label: 'État', type: 'select', options: CONDITION_OPTIONS_STANDARD },
    ],
  },

  // =========================================================================
  // I. CATÉGORIES PARENTES & ALIAS RÉTROCOMPATIBLES (FALLBACKS)
  // =========================================================================
  {
    categorySlug: 'immobilier',
    fields: [
      FIELD_SURFACE,
      { id: 'rooms', label: 'Nombre de pièces', type: 'number', min: 1, placeholder: 'Ex: 3' },
      FIELD_CONDITION,
    ],
  },
  {
    categorySlug: 'real_estate',
    fields: [
      FIELD_SURFACE,
      { id: 'rooms', label: 'Nombre de pièces', type: 'number', min: 1, placeholder: 'Ex: 3' },
      FIELD_CONDITION,
    ],
  },
  {
    categorySlug: 'vehicules',
    fields: [
      FIELD_BRAND,
      FIELD_MODEL,
      FIELD_YEAR,
      FIELD_MILEAGE,
      { id: 'fuel', label: 'Carburant', type: 'select', options: FUEL_OPTIONS },
    ],
  },
  {
    categorySlug: 'vehicle',
    fields: [
      FIELD_BRAND,
      FIELD_MODEL,
      FIELD_YEAR,
      FIELD_MILEAGE,
      { id: 'fuel', label: 'Carburant', type: 'select', options: FUEL_OPTIONS },
    ],
  },
  {
    categorySlug: 'vehicule',
    fields: [
      FIELD_BRAND,
      FIELD_MODEL,
      FIELD_YEAR,
      FIELD_MILEAGE,
      { id: 'fuel', label: 'Carburant', type: 'select', options: FUEL_OPTIONS },
    ],
  },
  {
    categorySlug: 'materiel-pro',
    fields: [
      { id: 'equipmentType', label: 'Type d\'équipement', type: 'text', placeholder: 'Ex: Outillage, Machine...' },
      FIELD_BRAND,
      FIELD_CONDITION,
    ],
  },
  {
    categorySlug: 'mode',
    fields: [
      { id: 'clothingType', label: "Type d'article", type: 'text', placeholder: 'Ex: Vêtement, Chaussure, Accessoire...' },
      FIELD_BRAND,
      FIELD_CONDITION,
    ],
  },
  {
    categorySlug: 'maison-jardin',
    fields: [
      { id: 'itemType', label: "Type d'article", type: 'text', placeholder: 'Ex: Meuble, Électroménager, Déco...' },
      { id: 'material', label: 'Matière', type: 'text', placeholder: 'Ex: Bois, Métal...' },
      FIELD_CONDITION,
    ],
  },
  {
    categorySlug: 'electronique',
    fields: [
      FIELD_BRAND,
      FIELD_MODEL,
      FIELD_CONDITION,
    ],
  },
  {
    categorySlug: 'loisirs',
    fields: [
      { id: 'itemType', label: "Type d'article", type: 'text', placeholder: 'Ex: Vélo, Instrument, Sport...' },
      FIELD_BRAND,
      FIELD_CONDITION,
    ],
  },
  {
    categorySlug: 'autres',
    fields: [
      { id: 'itemType', label: "Type d'article", type: 'text', placeholder: 'Ex: Article ou bien...' },
      FIELD_BRAND,
      FIELD_CONDITION,
    ],
  },
  {
    categorySlug: 'other',
    fields: [
      { id: 'itemType', label: "Type d'article", type: 'text', placeholder: 'Ex: Article ou bien...' },
      FIELD_BRAND,
      FIELD_CONDITION,
    ],
  },
];

/**
 * Récupère les caractéristiques essentielles (3 à 5 champs) pour une sous-catégorie ou catégorie donnée.
 */
export function getCharacteristicsForCategory(slug: string): CharacteristicField[] {
  if (!slug) return [FIELD_BRAND, FIELD_MODEL, FIELD_CONDITION];

  const clean = slug.toLowerCase().trim();
  const config = CHARACTERISTICS_REGISTRY.find((c) => c.categorySlug === clean);
  if (config) {
    return config.fields;
  }

  // Fallback générique simple pour catégories inconnues
  return [
    { id: 'itemType', label: "Type d'article", type: 'text', placeholder: 'Ex: Type de bien...' },
    FIELD_BRAND,
    FIELD_CONDITION,
  ];
}

/**
 * Nettoie les caractéristiques pour ne conserver QUE les champs valides et compatibles
 * avec la catégorie cible. Supprime immédiatement les données obsolètes ou incompatibles.
 */
export function cleanIncompatibleCharacteristics(
  categorySlug: string,
  characteristics: Record<string, any> | undefined | null,
  sourceCategorySlug?: string
): Record<string, any> {
  if (!characteristics || typeof characteristics !== 'object') {
    return {};
  }

  const allowedFields = getCharacteristicsForCategory(categorySlug);
  const fieldsById = new Map(allowedFields.map((f) => [f.id, f]));
  const sourceFieldsById = sourceCategorySlug
    ? new Map(getCharacteristicsForCategory(sourceCategorySlug).map((f) => [f.id, f]))
    : undefined;

  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(characteristics)) {
    const field = fieldsById.get(key);
    if (!field || value === undefined || value === null || value === '') {
      continue;
    }
    if (sourceFieldsById) {
      const sourceField = sourceFieldsById.get(key);
      if (
        !sourceField ||
        sourceField.type !== field.type ||
        sourceField.label !== field.label
      ) {
        continue;
      }
    }

    // Si le champ est un multiselect
    if (field.type === 'multiselect') {
      if (Array.isArray(value)) {
        const validValues = value.filter((v) =>
          !field.options || field.options.length === 0
            ? Boolean(v)
            : field.options.some((opt) => String(opt.value) === String(v))
        );
        if (validValues.length > 0) {
          cleaned[key] = validValues;
        }
      } else if (typeof value === 'string' && value.trim()) {
        const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
        const validValues = parts.filter((v) =>
          !field.options || field.options.length === 0
            ? Boolean(v)
            : field.options.some((opt) => String(opt.value) === String(v))
        );
        if (validValues.length > 0) {
          cleaned[key] = validValues;
        }
      }
      continue;
    }

    // Si le champ est une liste déroulante, s'assurer que la valeur fait partie des options valides
    if (field.type === 'select' && field.options && field.options.length > 0) {
      const isValidOption = field.options.some((opt) => String(opt.value) === String(value));
      if (!isValidOption) {
        continue;
      }
    }

    cleaned[key] = value;
  }

  return cleaned;
}
