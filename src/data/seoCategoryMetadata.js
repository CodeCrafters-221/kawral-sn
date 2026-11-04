const CATEGORY_GROUPS = [
  {
    slug: 'immobilier',
    label: 'Immobilier',
    title: 'Immobilier au Sénégal : annonces et locations | Kawral',
    description:
      'Annonces immobilières au Sénégal : appartements, maisons, terrains et locaux à vendre ou à louer sur Kawral.',
    subcategories: [
      ['apartment', 'Appartements'],
      ['house', 'Maisons et villas'],
      ['room', 'Chambres'],
      ['studios', 'Studios'],
      ['land', 'Terrains'],
      ['commercial', 'Locaux commerciaux'],
      ['bureaux', 'Bureaux'],
      ['entrepots', 'Entrepôts'],
    ],
  },
  {
    slug: 'vehicules',
    label: 'Véhicules',
    title: 'Véhicules au Sénégal : voitures et motos | Kawral',
    description:
      'Voitures, motos, camions, bus et véhicules utilitaires : consultez les annonces publiées au Sénégal sur Kawral.',
    subcategories: [
      ['voitures', 'Voitures'],
      ['motos', 'Motos et scooters'],
      ['camions', 'Camions'],
      ['bus', 'Bus et minibus'],
      ['utilitaires', 'Véhicules utilitaires'],
      ['pieces-detachees', 'Pièces détachées'],
      ['pneus-jantes', 'Pneus et jantes'],
      ['accessoires-auto', 'Accessoires auto'],
    ],
  },
  {
    slug: 'materiel-pro',
    label: 'Matériel pro',
    title: 'Matériel professionnel au Sénégal | Kawral',
    description:
      'Équipements, outils et matériel professionnel : parcourez les annonces disponibles au Sénégal sur Kawral.',
    subcategories: [
      ['btp', 'Matériel de construction & BTP'],
      ['machines-industrielles', 'Machines industrielles'],
      ['outillage-pro', 'Outillage professionnel'],
      ['informatique-pro', 'Matériel informatique pro'],
      ['restauration', 'Équipements de restauration'],
      ['agricole', 'Matériel agricole'],
      ['bureautique', 'Équipements de bureau'],
      ['manutention', 'Matériel de manutention'],
    ],
  },
  {
    slug: 'mode',
    label: 'Mode',
    title: 'Mode au Sénégal : vêtements et accessoires | Kawral',
    description:
      'Vêtements, chaussures, bijoux et accessoires de mode : retrouvez les annonces publiées au Sénégal sur Kawral.',
    subcategories: [
      ['mode-femme', 'Vêtements femme'],
      ['mode-homme', 'Vêtements homme'],
      ['mode-enfant', 'Vêtements enfant'],
      ['chaussures', 'Chaussures'],
      ['sacs-maroquinerie', 'Sacs & maroquinerie'],
      ['bijoux', 'Bijoux'],
      ['montres', 'Montres'],
      ['accessoires-mode', 'Accessoires de mode'],
    ],
  },
  {
    slug: 'maison-jardin',
    label: 'Maison & jardin',
    title: 'Maison et jardin au Sénégal : meubles et équipements | Kawral',
    description:
      'Meubles, électroménager, décoration et articles de jardin : consultez les annonces au Sénégal sur Kawral.',
    subcategories: [
      ['meubles', 'Meubles'],
      ['electromenager', 'Électroménager'],
      ['decoration', 'Décoration'],
      ['cuisine', 'Cuisine & ustensiles'],
      ['linge-maison', 'Literie & linge de maison'],
      ['jardin', 'Jardin & mobilier extérieur'],
      ['bricolage', 'Bricolage & outillage'],
      ['luminaires', 'Luminaires'],
    ],
  },
  {
    slug: 'electronique',
    label: 'Électronique',
    title: 'Électronique au Sénégal : téléphones et informatique | Kawral',
    description:
      'Téléphones, ordinateurs, tablettes, téléviseurs et accessoires : parcourez les annonces au Sénégal sur Kawral.',
    subcategories: [
      ['telephones', 'Téléphones & smartphones'],
      ['ordinateurs', 'Ordinateurs & PC portables'],
      ['tablettes', 'Tablettes tactiles'],
      ['televiseurs', 'Téléviseurs & Smart TV'],
      ['audio-son', 'Audio & enceintes'],
      ['consoles-jeux', 'Consoles & jeux vidéo'],
      ['photo-video', 'Appareils photo & caméras'],
      ['accessoires-informatique', 'Accessoires & composants'],
    ],
  },
  {
    slug: 'loisirs',
    label: 'Loisirs',
    title: 'Loisirs et sport au Sénégal | Kawral',
    description:
      'Sport, musique, vélos, livres et jeux : découvrez les annonces de loisirs publiées au Sénégal sur Kawral.',
    subcategories: [
      ['sport-fitness', 'Sports & fitness'],
      ['velos', 'Vélos & mobilités douces'],
      ['musique', 'Instruments de musique'],
      ['livres-magazines', 'Livres & magazines'],
      ['jeux-jouets', 'Jeux & jouets'],
      ['camping-plein-air', 'Camping & plein air'],
      ['loisirs-creatifs', 'Loisirs créatifs'],
      ['collections', 'Collections & antiquités'],
    ],
  },
  {
    slug: 'autres',
    label: 'Autres',
    title: 'Autres annonces au Sénégal | Kawral',
    description:
      'Articles pour bébés, fournitures, produits agricoles, animaux et autres biens : consultez les annonces sur Kawral.',
    subcategories: [
      ['articles-bebe', 'Bébés & puériculture'],
      ['fournitures-scolaires', 'Fournitures scolaires'],
      ['loisirs-enfants', 'Loisirs enfants'],
      ['evenements-ceremonies', 'Événements & cérémonies'],
      ['produits-agricoles', 'Produits agricoles & élevage'],
      ['animaux-accessoires', 'Animaux & accessoires'],
      ['collections-diverses', 'Collections diverses'],
      ['autres-biens', 'Autres biens & divers'],
    ],
  },
];

export const SEO_CATEGORY_METADATA = Object.freeze(
  Object.fromEntries(
    CATEGORY_GROUPS.flatMap((category) => [
      [
        category.slug,
        {
          label: category.label,
          title: category.title,
          description: category.description,
        },
      ],
      ...category.subcategories.map(([slug, label]) => [
        slug,
        {
          label,
          parent: category.slug,
          parentLabel: category.label,
          title: `${label} au Sénégal | ${category.label} | Kawral`,
          description: `Annonces de ${label.toLowerCase()} dans la catégorie ${category.label} au Sénégal. Consultez les offres et contactez directement l'annonceur sur Kawral.`,
        },
      ]),
    ])
  )
);

export function getListingSeoMetadata({
  title,
  categoryLabel,
  location,
  transactionType,
  description,
}) {
  const cleanTitle = String(title || '').replace(/\s+/g, ' ').trim();
  const cleanLocation = String(location || '').replace(/\s+/g, ' ').trim();
  const city = cleanLocation.split(',')[0].trim();
  const normalizedTitle = cleanTitle.toLocaleLowerCase('fr');
  const normalizedLocation = city.toLocaleLowerCase('fr');
  const transactionLabel =
    transactionType === 'rent'
      ? 'à louer'
      : transactionType === 'sale'
        ? 'à vendre'
        : '';
  const titleParts = [cleanTitle];

  if (transactionLabel && !normalizedTitle.includes(transactionLabel)) {
    titleParts.push(transactionLabel);
  }
  if (city && !normalizedTitle.includes(normalizedLocation)) {
    titleParts.push(`à ${city}`);
  }

  const seoTitle = `${titleParts.filter(Boolean).join(' ')} | Kawral`;
  const descriptionParts = [
    categoryLabel ? `Annonce ${categoryLabel.toLowerCase()}` : '',
    transactionLabel,
    city ? `à ${city}` : '',
    String(description || '').replace(/\s+/g, ' ').trim(),
  ].filter(Boolean);

  const ogTitle = cleanTitle || seoTitle;
  const ogDescription = cleanTitle
    ? `Découvrez ${cleanTitle} sur Kawral. Contactez le vendeur pour plus d'informations.`
    : "Découvrez cette annonce sur Kawral. Contactez le vendeur pour plus d'informations.";

  return {
    title: seoTitle,
    description: descriptionParts.join(' — ').slice(0, 160),
    ogTitle,
    ogDescription,
    city,
    transactionLabel,
  };
}
