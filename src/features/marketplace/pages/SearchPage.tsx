import React, { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { useFilteredListings } from "../../../context/hooks/useFilteredListings";
import { FilterSidebar } from "../../../components/marketplace/FilterSidebar";
import { FilterChips } from "../../../components/marketplace/FilterChips";
import { ListingGrid } from "../../../components/marketplace/ListingGrid";
import { ListingMap } from "../../../components/marketplace/ListingMap";
import { SortDropdown } from "../../../components/marketplace/SortDropdown";
import { Dialog, DialogContent, DialogTitle } from "../../../components/ui";
import { SlidersHorizontal, Map as MapIcon, LayoutGrid, Loader2 } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  immobilier: "Immobilier",
  vehicules: "Véhicules",
  "materiel-pro": "Matériel pro",
  mode: "Mode",
  "maison-jardin": "Maison & jardin",
  electronique: "Électronique",
  loisirs: "Loisirs",
  autres: "Autres",
};

export const SearchPage: React.FC = () => {
  const { listings, filters, setFilters } = useApp();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const { results: sortedListings, isLoading } = useFilteredListings(filters, listings);
  const count = sortedListings.length;

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.transactionType !== "all" ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.priceMin !== null || filters.priceMax !== null ? 1 : 0);

  // Sous-titre contextuel : « 6 annonces · "villa" · Immobilier · Dakar »
  const context = [
    filters.search && `« ${filters.search} »`,
    filters.category && (CATEGORY_LABELS[filters.category] ?? filters.category),
    filters.location,
  ].filter(Boolean) as string[];

  const segBtn = (mode: "grid" | "map", Icon: React.ElementType, label: string) => (
    <button
      type="button"
      onClick={() => setViewMode(mode)}
      aria-pressed={viewMode === mode}
      aria-label={label}
      className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
        viewMode === mode ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 sm:pt-8 animate-fade-in"
      style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
    >
      {/* En-tête */}
      <header className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Explorer les annonces</h1>
        <p className="mt-1 text-sm text-slate-500 flex flex-wrap items-center gap-x-1.5" aria-live="polite">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-kawral-green" />
          ) : (
            <span className="font-bold text-slate-800">
              {count} annonce{count > 1 ? "s" : ""}
            </span>
          )}
          {context.map((c) => (
            <React.Fragment key={c}>
              <span className="text-slate-300">·</span>
              <span className="truncate max-w-[200px]">{c}</span>
            </React.Fragment>
          ))}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
        {/* Sidebar desktop */}
        <div className="hidden lg:block lg:col-span-1 sticky top-36">
          <FilterSidebar resultCount={count} />
        </div>

        {/* Filtres mobile */}
        <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
          <DialogContent
            showCloseButton={false}
            className="p-0 max-w-md w-[94vw] sm:w-full border-none shadow-2xl bg-white rounded-3xl overflow-hidden max-h-[88vh] flex flex-col gap-0"
          >
            <DialogTitle className="sr-only">Filtres de recherche</DialogTitle>
            <FilterSidebar resultCount={count} onCloseMobile={() => setShowMobileFilters(false)} isModal />
          </DialogContent>
        </Dialog>

        {/* Résultats */}
        <section className="lg:col-span-3 space-y-4" aria-label="Résultats">
          {/* Barre d'outils unique */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2 min-w-0">
              <button
                id="explore-open-filters"
                type="button"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden relative h-9 shrink-0 flex items-center gap-1.5 px-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
                {activeFilterCount > 0 && (
                  <span className="min-w-5 h-5 px-1 rounded-full bg-kawral-green text-white text-[11px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <SortDropdown
                value={filters.sortBy}
                onChange={(newSort) =>
                  setFilters((prev) => ({ ...prev, sortBy: newSort }))
                }
              />
            </div>

            <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-xl shrink-0" role="group" aria-label="Affichage">
              {segBtn("grid", LayoutGrid, "Grille")}
              {segBtn("map", MapIcon, "Carte")}
            </div>
          </div>

          <FilterChips />

          {viewMode === "map" ? (
            <ListingMap listings={sortedListings} />
          ) : (
            <ListingGrid listings={sortedListings} showControls={false} layout="grid" withSidebar />
          )}
        </section>
      </div>
    </div>
  );
};
