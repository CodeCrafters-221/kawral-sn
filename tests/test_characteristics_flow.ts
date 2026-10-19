import {
  getCharacteristicsForCategory,
  cleanIncompatibleCharacteristics,
  CharacteristicField,
} from "../src/data/characteristicsRegistry";
import {
  MAIN_CATEGORIES_CATALOG,
  findMainCategory,
  findParentMainCategory,
  getDefaultSubcategorySlug,
  isConcreteCategorySlug,
  getCategoryLabelFromCatalog,
} from "../src/data/categoriesData";
import { mapDatabaseListingToEntity } from "../src/services/supabase/listingsService";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("\n=======================================================");
console.log("TEST SUITE: SIMPLIFICATION DES CARACTÉRISTIQUES DYNAMIQUES");
console.log("=======================================================\n");

// ── 1. Vérification Voitures vs Motos ─────────────────────────────────
console.log("--- 1. Voitures et Motos ---");
const carFields = getCharacteristicsForCategory("voitures");
const carIds = carFields.map((f) => f.id);
assert(carFields.length >= 3 && carFields.length <= 5, `Voitures a ${carFields.length} champs (attendu: 3-5)`);
assert(carIds.includes("brand"), "Voitures contient la marque");
assert(carIds.includes("model"), "Voitures contient le modèle");
assert(carIds.includes("year"), "Voitures contient l'année");
assert(carIds.includes("mileage"), "Voitures contient le kilométrage");
assert(carIds.includes("fuel"), "Voitures contient le carburant");
assert(!carIds.includes("engineCapacity"), "Voitures NE contient PAS la cylindrée");
assert(!carIds.includes("bedrooms"), "Voitures NE contient PAS les chambres");

const motoFields = getCharacteristicsForCategory("motos");
const motoIds = motoFields.map((f) => f.id);
assert(motoFields.length >= 3 && motoFields.length <= 5, `Motos a ${motoFields.length} champs (attendu: 3-5)`);
assert(motoIds.includes("brand"), "Motos contient la marque");
assert(motoIds.includes("model"), "Motos contient le modèle");
assert(motoIds.includes("engineCapacity"), "Motos contient la cylindrée");
assert(motoIds.includes("year"), "Motos contient l'année");
assert(motoIds.includes("mileage"), "Motos contient le kilométrage");
assert(!motoIds.includes("fuel"), "Motos NE contient PAS le carburant (car-specific)");
assert(!motoIds.includes("bodyType"), "Motos NE contient PAS la carrosserie");

// ── 2. Vérification Appartements vs Terrains ─────────────────────────
console.log("\n--- 2. Appartements et Terrains ---");
const aptFields = getCharacteristicsForCategory("apartment");
const aptIds = aptFields.map((f) => f.id);
assert(aptFields.length >= 3 && aptFields.length <= 5, `Appartements a ${aptFields.length} champs (attendu: 3-5)`);
assert(aptIds.includes("surface"), "Appartements contient la surface");
assert(aptIds.includes("rooms"), "Appartements contient le nombre de pièces");
assert(aptIds.includes("bedrooms"), "Appartements contient le nombre de chambres");
assert(aptIds.includes("bathrooms"), "Appartements contient les salles de bain");
assert(!aptIds.includes("landType"), "Appartements NE contient PAS le type de terrain");
assert(!aptIds.includes("mileage"), "Appartements NE contient PAS le kilométrage");

const landFields = getCharacteristicsForCategory("land");
const landIds = landFields.map((f) => f.id);
assert(landFields.length >= 3 && landFields.length <= 5, `Terrains a ${landFields.length} champs (attendu: 3-5)`);
assert(landIds.includes("surface"), "Terrains contient la surface");
assert(landIds.includes("landType"), "Terrains contient le type de terrain");
assert(landIds.includes("titleDeed"), "Terrains contient le statut foncier");
assert(!landIds.includes("bedrooms"), "Terrains NE contient PAS les chambres");
assert(!landIds.includes("bathrooms"), "Terrains NE contient PAS les salles de bain");

const houseIds = getCharacteristicsForCategory("house").map((f) => f.id);
assert(houseIds.includes("rooms"), "Maisons contiennent le nombre de pièces");
assert(houseIds.includes("bedrooms"), "Maisons conservent le nombre de chambres");

// ── 3. Vérification Vêtements vs Chaussures ──────────────────────────
console.log("\n--- 3. Vêtements et Chaussures ---");
const menClothingFields = getCharacteristicsForCategory("mode-homme");
const menClothingIds = menClothingFields.map((f) => f.id);
assert(menClothingFields.length >= 3 && menClothingFields.length <= 5, `Mode homme a ${menClothingFields.length} champs`);
assert(menClothingIds.includes("clothingType"), "Mode homme contient le type de vêtement");
assert(menClothingIds.includes("size"), "Mode homme contient la taille");
assert(menClothingIds.includes("brand"), "Mode homme contient la marque");
assert(menClothingIds.includes("condition"), "Mode homme contient l'état");
assert(!menClothingIds.includes("shoeSize"), "Mode homme NE contient PAS la pointure");

const genericModeIds = getCharacteristicsForCategory("mode").map((f) => f.id);
assert(!genericModeIds.includes("shoeSize"), "Mode parent ne mélange pas les pointures");
assert(!genericModeIds.includes("size"), "Mode parent n'impose pas de taille ambiguë");
assert(isConcreteCategorySlug("mode-femme"), "Vêtements femme est une catégorie concrète");
assert(!isConcreteCategorySlug("mode"), "Mode parent n'est pas une catégorie concrète");
assert(
  getDefaultSubcategorySlug("mode") === "mode-femme",
  "Catégorie rapide Mode résout sa première sous-catégorie"
);

const shoeFields = getCharacteristicsForCategory("chaussures");
const shoeIds = shoeFields.map((f) => f.id);
assert(shoeFields.length >= 3 && shoeFields.length <= 5, `Chaussures a ${shoeFields.length} champs`);
assert(shoeIds.includes("shoeType"), "Chaussures contient le type de chaussures");
assert(shoeIds.includes("shoeSize"), "Chaussures contient la pointure");
assert(shoeIds.includes("brand"), "Chaussures contient la marque");
assert(shoeIds.includes("condition"), "Chaussures contient l'état");
assert(!shoeIds.includes("size"), "Chaussures NE contient PAS la taille de vêtement");

// ── 4. Vérification Téléphones vs Ordinateurs ────────────────────────
console.log("\n--- 4. Téléphones et Ordinateurs ---");
const phoneFields = getCharacteristicsForCategory("telephones");
const phoneIds = phoneFields.map((f) => f.id);
assert(phoneFields.length >= 3 && phoneFields.length <= 5, `Téléphones a ${phoneFields.length} champs`);
assert(phoneIds.includes("brand"), "Téléphones contient la marque");
assert(phoneIds.includes("model"), "Téléphones contient le modèle");
assert(phoneIds.includes("storage"), "Téléphones contient le stockage");
assert(phoneIds.includes("condition"), "Téléphones contient l'état");
assert(!phoneIds.includes("processor"), "Téléphones NE contient PAS le processeur");
assert(!phoneIds.includes("ram"), "Téléphones NE contient PAS la RAM");

const pcFields = getCharacteristicsForCategory("ordinateurs");
const pcIds = pcFields.map((f) => f.id);
assert(pcFields.length >= 3 && pcFields.length <= 5, `Ordinateurs a ${pcFields.length} champs`);
assert(pcIds.includes("brand"), "Ordinateurs contient la marque");
assert(pcIds.includes("processor"), "Ordinateurs contient le processeur");
assert(pcIds.includes("ram"), "Ordinateurs contient la RAM");
assert(pcIds.includes("storage"), "Ordinateurs contient le stockage");
assert(pcIds.includes("condition"), "Ordinateurs contient l'état");

// ── 5. Vérification Meubles, Vélos, Outillage, Bébé ──────────────────
console.log("\n--- 5. Autres catégories clés du prompt ---");
const furnitureFields = getCharacteristicsForCategory("meubles");
const furnitureIds = furnitureFields.map((f) => f.id);
assert(furnitureIds.includes("furnitureType") && furnitureIds.includes("dimensions") && furnitureIds.includes("material") && furnitureIds.includes("condition"), "Meubles contient type, dimensions, matière, état");

const bikeFields = getCharacteristicsForCategory("velos");
const bikeIds = bikeFields.map((f) => f.id);
assert(bikeIds.includes("bikeType") && bikeIds.includes("brand") && bikeIds.includes("wheelSize") && bikeIds.includes("condition"), "Vélos contient type, marque, taille de roues, état");

const toolFields = getCharacteristicsForCategory("outillage-pro");
const toolIds = toolFields.map((f) => f.id);
assert(toolIds.includes("toolType") && toolIds.includes("brand") && toolIds.includes("powerSupply") && toolIds.includes("condition"), "Outillage pro contient type, marque, alimentation, état");

const babyFields = getCharacteristicsForCategory("articles-bebe");
const babyIds = babyFields.map((f) => f.id);
assert(babyIds.includes("babyItemType") && babyIds.includes("age") && babyIds.includes("brand") && babyIds.includes("condition"), "Articles bébé contient type, âge, marque, état");

// ── 6. Vérification de toutes les 64 sous-catégories ─────────────────
console.log("\n--- 6. Règle des 3 à 5 champs sur tout le catalogue ---");
let totalSubcatsTested = 0;
for (const mainCat of MAIN_CATEGORIES_CATALOG) {
  for (const sub of mainCat.subcategories) {
    const fields = getCharacteristicsForCategory(sub.slug);
    totalSubcatsTested++;
    assert(
      fields.length >= 2 && fields.length <= 5,
      `Sous-catégorie [${mainCat.label} -> ${sub.label} (${sub.slug})] a ${fields.length} champs (attendu: 2-5)`
    );
    // Vérifier l'absence de cases à cocher abusives
    const checkboxes = fields.filter((f) => f.type === "checkbox");
    assert(checkboxes.length === 0, `Sous-catégorie [${sub.slug}] n'a aucune case à cocher abusive (0 checkboxes)`);
  }
}
assert(totalSubcatsTested === 64, `Total de 64 sous-catégories testées avec succès (${totalSubcatsTested}/64)`);

// ── 7. Nettoyage dynamique des caractéristiques incompatibles ────────
console.log("\n--- 7. Nettoyage dynamique lors du changement de sous-catégorie ---");

// Cas 1 : Voiture -> Moto
const initialCarData = {
  brand: "Toyota",
  model: "Corolla",
  year: 2020,
  mileage: 50000,
  fuel: "Essence", // Incompatible avec moto
  doors: 4,        // Incompatible
};
const cleanedForMoto = cleanIncompatibleCharacteristics("motos", initialCarData);
assert(cleanedForMoto.brand === "Toyota", "Voiture -> Moto : Marque conservée");
assert(cleanedForMoto.model === "Corolla", "Voiture -> Moto : Modèle conservé");
assert(cleanedForMoto.year === 2020, "Voiture -> Moto : Année conservée");
assert(cleanedForMoto.mileage === 50000, "Voiture -> Moto : Kilométrage conservé");
assert(cleanedForMoto.fuel === undefined, "Voiture -> Moto : Carburant retiré car incompatible");
assert(cleanedForMoto.doors === undefined, "Voiture -> Moto : Portes retiré");

// Cas 2 : Voiture -> Terrain
const cleanedForLand = cleanIncompatibleCharacteristics("land", initialCarData);
assert(Object.keys(cleanedForLand).length === 0, "Voiture -> Terrain : Toutes les données voiture purgées (aucun champ compatible)");

// Cas 3 : Vêtements -> Chaussures
const initialClothingData = {
  clothingType: "Chemise",
  size: "XL",
  brand: "Zara",
  condition: "Très bon état",
};
const cleanedForShoes = cleanIncompatibleCharacteristics("chaussures", initialClothingData);
assert(cleanedForShoes.brand === "Zara", "Vêtement -> Chaussures : Marque conservée");
assert(cleanedForShoes.condition === "Très bon état", "Vêtement -> Chaussures : État conservé");
assert(cleanedForShoes.size === undefined, "Vêtement -> Chaussures : Taille XL purgée car incompatible");
assert(cleanedForShoes.clothingType === undefined, "Vêtement -> Chaussures : Type vêtement purgé");
const cleanedForOtherItems = cleanIncompatibleCharacteristics(
  "autres-biens",
  { itemType: "Pneus" },
  "pneus-jantes"
);
assert(
  cleanedForOtherItems.itemType === undefined,
  "Pneus -> Autres biens : Type sélectionné purgé lorsqu'il devient un texte libre"
);

// Cas 4 : Téléphone -> Ordinateur
const initialPhoneData = {
  brand: "Apple",
  model: "iPhone 14 Pro",
  storage: "256 Go",
  condition: "Très bon état",
};
const cleanedForPc = cleanIncompatibleCharacteristics("ordinateurs", initialPhoneData);
assert(cleanedForPc.brand === "Apple", "Téléphone -> PC : Marque conservée");
assert(cleanedForPc.condition === "Très bon état", "Téléphone -> PC : État conservé");
assert(cleanedForPc.storage === undefined, "Téléphone -> PC : Stockage smartphone retiré car options différentes");

// ── 8. Test simulation création et mise à jour d'annonce ─────────────
console.log("\n--- 8. Simulation Création et Modification avec Supabase Mapping ---");

// Simulation Supabase Record avec subcategory 'telephones'
const mockDbItem = {
  id: "e4e9b9c0-1111-4222-8333-555555555555",
  user_id: "user-123",
  title: "iPhone 15 Pro Max 256 Go",
  description: "Téléphone en parfait état, batterie 100%, vendu avec boîte et accessoires d'origine.",
  price: 750000,
  location: "Dakar, Almadies",
  status: "published",
  views_count: 42,
  created_at: "2026-10-10T12:00:00Z",
  categories: { id: "cat-1", slug: "electronique", name: "Électronique" },
  attributes: {
    category: "telephones",
    categoryLabel: "Téléphones & smartphones",
    transactionType: "sale",
    pricePeriod: "total",
    characteristics: {
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      storage: "256 Go",
      condition: "Comme neuf",
    },
  },
  listing_images: [
    { image_url: "https://example.com/img1.jpg", display_order: 0, is_cover: true },
  ],
};

const mappedEntity = mapDatabaseListingToEntity(mockDbItem);
assert(mappedEntity.id === mockDbItem.id, "ID correctement mappé");
assert(mappedEntity.category === "telephones", "Sous-catégorie 'telephones' préservée dans l'entité");
assert(mappedEntity.categoryLabel === "Téléphones & smartphones", "Label de sous-catégorie correct");
assert(mappedEntity.characteristics.brand === "Apple", "Caractéristique brand correcte");
assert(mappedEntity.characteristics.model === "iPhone 15 Pro Max", "Caractéristique model correcte");
assert(mappedEntity.characteristics.storage === "256 Go", "Caractéristique storage correcte");
assert(mappedEntity.characteristics.condition === "Comme neuf", "Caractéristique condition correcte");

// Simulation modification : vendeur change en 'ordinateurs' et met à jour
const updatedCharacteristics = cleanIncompatibleCharacteristics("ordinateurs", {
  ...mappedEntity.characteristics,
  processor: "Apple M2 Pro",
  ram: "16 Go",
  storage: "512 Go SSD",
});
assert(updatedCharacteristics.brand === "Apple", "Modification : Marque Apple conservée");
assert(updatedCharacteristics.processor === "Apple M2 Pro", "Modification : Processeur ajouté");
assert(updatedCharacteristics.ram === "16 Go", "Modification : RAM ajoutée");
assert(updatedCharacteristics.storage === "512 Go SSD", "Modification : Stockage SSD mis à jour");
assert(updatedCharacteristics.model === undefined, "Modification : Modèle smartphone supprimé car PC a processeur/ram");

// ── 9. Rétrocompatibilité avec les annonces existantes ─────────────────
console.log("\n--- 9. Rétrocompatibilité avec les annonces existantes ---");

// Annonce existante avec slug historique 'vehicle'
const legacyVehicleDbItem = {
  id: "legacy-v-1",
  user_id: "user-999",
  title: "Toyota Prado 2021",
  description: "Véhicule d'occasion en excellent état",
  price: 25000000,
  location: "Dakar, Point E",
  status: "published",
  attributes: {
    category: "vehicle",
    characteristics: {
      brand: "Toyota",
      model: "Prado",
      year: 2021,
      mileage: 45000,
      fuel: "Diesel",
    },
  },
};
const legacyEntity = mapDatabaseListingToEntity(legacyVehicleDbItem);
assert(legacyEntity.characteristics.brand === "Toyota", "Annonce historique : Marque lue sans perte");
assert(legacyEntity.characteristics.year === 2021, "Annonce historique : Année lue sans perte");
assert(legacyEntity.characteristics.mileage === 45000, "Annonce historique : Kilométrage lu sans perte");

console.log("\n=======================================================");
console.log("🎉 TOUTES LES VÉRIFICATIONS SONT PASSÉES AVEC SUCCÈS !");
console.log("=======================================================\n");
