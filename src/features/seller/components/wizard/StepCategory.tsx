import React from "react";
import { CategoryType } from "../../../../types";
import {
  MAIN_CATEGORIES_CATALOG,
  findMainCategory,
  findParentMainCategory,
  getDefaultSubcategorySlug,
  MainCategoryItem,
} from "../../../../data/categoriesData";
import { Check } from "lucide-react";

interface Props {
  value: CategoryType;
  onChange: (v: CategoryType) => void;
}

export const StepCategory: React.FC<Props> = ({ value, onChange }) => {
  // Resolve which main category is active based on current value
  const parentCat = findParentMainCategory(value);
  const currentMainCat: MainCategoryItem =
    parentCat ||
    findMainCategory(value) ||
    MAIN_CATEGORIES_CATALOG[0];

  const activeMainCatSlug = currentMainCat.slug;

  const handleSelectMain = (mainCat: MainCategoryItem) => {
    if (mainCat.slug === activeMainCatSlug) return;
    // Sélectionner automatiquement la 1ère sous-catégorie concrète de cette catégorie principale
    const defaultSub = getDefaultSubcategorySlug(mainCat.slug);
    onChange((defaultSub || mainCat.slug) as CategoryType);
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* 8 Catégories principales */}
      <div className="w-full max-w-full min-w-0">
        <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">
          1. Choisissez la catégorie principale
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-full min-w-0">
          {MAIN_CATEGORIES_CATALOG.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeMainCatSlug === cat.slug;

            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleSelectMain(cat)}
                className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px] min-w-0 max-w-full overflow-hidden ${
                  isSelected
                    ? "border-kawral-green bg-kawral-green text-white shadow-md font-bold ring-2 ring-kawral-green/20 scale-[1.02]"
                    : "border-kawral-border text-kawral-dark hover:bg-kawral-ivory bg-white"
                }`}
              >
                <Icon
                  className={`w-6 h-6 sm:w-7 sm:h-7 mb-1.5 sm:mb-2 shrink-0 ${
                    isSelected ? "text-kawral-orange" : "text-kawral-green"
                  }`}
                />
                <span className="block text-xs font-bold leading-tight truncate max-w-full px-1">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sous-catégories pour la catégorie sélectionnée */}
      {currentMainCat.subcategories.length > 0 && (
        <div className="p-3.5 sm:p-5 bg-emerald-50/70 border border-emerald-100 rounded-2xl animate-fade-in space-y-3 w-full max-w-full min-w-0 overflow-hidden">
          <div className="flex items-center justify-between min-w-0">
            <p className="text-xs font-bold text-kawral-green truncate">
              2. Précisez la sous-catégorie pour « {currentMainCat.label} » :
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 w-full max-w-full min-w-0">
            {currentMainCat.subcategories.map((sub) => {
              const SubIcon = sub.icon;
              const isSubSelected = value === sub.slug;

              return (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => onChange(sub.slug as CategoryType)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left min-w-0 max-w-full overflow-hidden ${
                    isSubSelected
                      ? "bg-kawral-orange text-white shadow-sm ring-1 ring-kawral-orange"
                      : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                  }`}
                >
                  <SubIcon className={`w-4 h-4 shrink-0 ${isSubSelected ? "text-white" : "text-kawral-green"}`} />
                  <span className="truncate flex-1 min-w-0">{sub.label}</span>
                  {isSubSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
