import React from "react";
import type { CategoryType, ListingCharacteristics } from "../../../../types";
import { getCharacteristicsForCategory, CharacteristicField } from "../../../../data/characteristicsRegistry";

interface ListingKeyStatsProps {
  category: CategoryType;
  characteristics: ListingCharacteristics;
}

// Fallback label map for legacy keys
const LEGACY_LABELS: Record<string, { label: string; unit?: string }> = {
  surface: { label: 'Surface', unit: 'm²' },
  bedrooms: { label: 'Chambres' },
  rooms: { label: 'Pièces' },
  bathrooms: { label: 'Salles de bain' },
  year: { label: 'Année' },
  mileage: { label: 'Kilométrage', unit: 'km' },
  fuel: { label: 'Carburant' },
  transmission: { label: 'Boîte de vitesses' },
  engineCapacity: { label: 'Cylindrée', unit: 'cm³' },
  payload: { label: 'Charge utile' },
  brand: { label: 'Marque' },
  model: { label: 'Modèle' },
  condition: { label: 'État' },
  storage: { label: 'Stockage' },
  ram: { label: 'RAM' },
  processor: { label: 'Processeur' },
  size: { label: 'Taille' },
  shoeSize: { label: 'Pointure' },
  clothingType: { label: 'Type' },
  shoeType: { label: 'Type' },
  furnitureType: { label: 'Type de meuble' },
  dimensions: { label: 'Dimensions' },
  bikeType: { label: 'Type de vélo' },
  toolType: { label: "Type d'outil" },
  babyItemType: { label: "Type d'article" },
  landType: { label: 'Type de terrain' },
  titleDeed: { label: 'Statut foncier' },
};

const LEGACY_CATEGORY_FIELDS: Record<string, string[]> = {
  vehicules: ['transmission'],
  vehicle: ['transmission'],
  vehicule: ['transmission'],
  voitures: ['transmission'],
  motos: ['transmission'],
  camions: ['transmission'],
  bus: ['transmission'],
  utilitaires: ['transmission'],
};

export const ListingKeyStats: React.FC<ListingKeyStatsProps> = ({
  category,
  characteristics,
}) => {
  if (!characteristics || typeof characteristics !== "object") return null;

  const fields = getCharacteristicsForCategory(category);

  // 1. Matched fields from registry
  let statFields: Array<{ id: string; label: string; unit?: string }> = fields
    .filter(
      (f) =>
        f.type !== "checkbox" &&
        characteristics[f.id] !== undefined &&
        characteristics[f.id] !== "" &&
        characteristics[f.id] !== null &&
        (!Array.isArray(characteristics[f.id]) || characteristics[f.id].length > 0)
    )
    .map((f) => ({
      id: f.id,
      label: f.label,
      unit: f.unit,
    }));

  // 2. Fallback pour annonces existantes avec anciennes clés ou catégories historiques
  if (statFields.length === 0) {
    const fallbackItems: Array<{ id: string; label: string; unit?: string }> = [];
    const allowedLegacyFields = new Set([
      ...fields.map((field) => field.id),
      ...(LEGACY_CATEGORY_FIELDS[category] || []),
    ]);

    for (const [key, val] of Object.entries(characteristics)) {
      if (
        allowedLegacyFields.has(key) &&
        val !== undefined &&
        val !== "" &&
        val !== null &&
        typeof val !== "boolean" &&
        (!Array.isArray(val) || val.length > 0)
      ) {
        if (LEGACY_LABELS[key]) {
          fallbackItems.push({
            id: key,
            label: LEGACY_LABELS[key].label,
            unit: LEGACY_LABELS[key].unit,
          });
        }
      }
    }
    statFields = fallbackItems;
  }

  if (statFields.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
      {statFields.map((field) => {
        const rawValue = characteristics[field.id];

        // Vérifier si c'est une liste de valeurs (ex: pointures, tailles)
        const isList =
          Array.isArray(rawValue) ||
          (typeof rawValue === "string" &&
            rawValue.includes(",") &&
            (field.id === "size" || field.id === "shoeSize" || field.id.toLowerCase().includes("size")));

        if (isList) {
          const items: string[] = Array.isArray(rawValue)
            ? rawValue.map(String)
            : String(rawValue)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

          const colSpan =
            items.length > 3
              ? "col-span-2 sm:col-span-3"
              : "col-span-2 sm:col-span-2";

          return (
            <div
              key={field.id}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-2xl border border-kawral-border text-center shadow-xs hover:border-emerald-200 transition-colors ${colSpan}`}
            >
              <span className="text-[10px] sm:text-xs text-kawral-muted font-bold uppercase tracking-wider mb-2">
                {field.label}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
                {items.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-50 text-kawral-green font-extrabold text-xs border border-emerald-200/80 shadow-2xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        let displayValue = rawValue;

        // Format booleans
        if (typeof displayValue === "boolean") {
          displayValue = displayValue ? "Oui" : "Non";
        }

        // Format numbers (ex: 65 000 km, 120 m²)
        if (typeof displayValue === "number") {
          displayValue = displayValue.toLocaleString("fr-FR");
        }

        return (
          <div
            key={field.id}
            className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-2xl border border-kawral-border text-center shadow-xs hover:border-emerald-200 transition-colors"
          >
            <span className="text-[10px] sm:text-xs text-kawral-muted font-bold uppercase tracking-wider mb-1 line-clamp-1">
              {field.label}
            </span>
            <span className="text-sm sm:text-base font-black text-kawral-dark line-clamp-1">
              {displayValue} {field.unit ? `${field.unit}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
};
