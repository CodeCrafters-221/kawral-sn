import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useFilteredListings } from "../../../context/hooks/useFilteredListings";
import { FilterSidebar } from "../../../components/marketplace/FilterSidebar";
import { FilterChips } from "../../../components/marketplace/FilterChips";
import { ListingGrid } from "../../../components/marketplace/ListingGrid";
import { ListingMap } from "../../../components/marketplace/ListingMap";
import { SortDropdown } from "../../../components/marketplace/SortDropdown";
import { Dialog, DialogContent, DialogTitle } from "../../../components/ui";
import { SeoHead } from "../../../components/seo/SeoHead";
import { MAIN_CATEGORIES_CATALOG, findMainCategory, findParentMainCategory } from "../../../data/categoriesData";
import { getCategoryLabel } from "../../../utils/formatters";
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
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Support URL query parameter ?q=... (e.g. Google Sitelinks Searchbox)
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q.trim() !== "" && q !== filters.search) {
      setFilters((prev) => ({ ...prev, search: q.trim() }));
    }
  }, [searchParams, setFilters]);

  const { results: sortedListings, isLoading } = useFilteredListings(filters, listings);
  const count = sortedListings.length;

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.transactionType !== "all" ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.priceMin !== null || filters.priceMax !== null ? 1 : 0);

  // Sous-titre contextuel : « 6 annonces · "villa" · Immobilier · Dakar »
  const activeCatLabel = filters.category
    ? CATEGORY_LABELS[filters.category] ?? getCategoryLabel(filters.category as any) ?? filters.category
    : "";
  const context = [
    filters.search && `« ${filters.search} »`,
    activeCatLabel,
    filters.location,
  ].filter(Boolean) as string[];

  // Métadonnées SEO dynamiques selon la catégorie ou la recherche
  const mainCat = filters.category ? findMainCategory(filters.category) : undefined;
  const parentCat = filters.category ? findParentMainCategory(filters.category) : undefined;
  const seoTitle = filters.category
    ? `${activeCatLabel} au Sénégal — Petites annonces ${
        parentCat && parentCat.slug !== filters.category ? `${parentCat.label} ` : ""
      }| Kawral`
    : "Explorer toutes les petites annonces au Sénégal | Kawral Marketplace";
  const seoDescription = mainCat?.description
    ? `${mainCat.description} Achetez, louez et vendez en direct au Sénégal (Dakar et régions) sans intermédiaire sur Kawral.`
    : filters.category
      ? `Découvrez toutes les annonces de ${activeCatLabel.toLowerCase()} à vendre ou à louer au Sénégal (Dakar, Thiès, Mbour, Saint-Louis). Contact direct sur Kawral.`
      : "Parcourez toutes les petites annonces publiées au Sénégal : immobilier, véhicules, électronique, mode, maison et matériel professionnel sur Kawral.";
  const canonicalPath = filters.category ? `/categories/${filters.category}` : "/explorer";

  const activeCatalogCategory = parentCat || mainCat;

  const searchPageJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://www.kawral.sn${canonicalPath}#collection`,
        "url": `https://www.kawral.sn${canonicalPath}`,
        "name": seoTitle,
        "description": seoDescription,
        "inLanguage": "fr-SN",
        "isPartOf": {
          "@id": "https://www.kawral.sn/#website"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": filters.category
          ? [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Accueil",
                "item": "https://www.kawral.sn/"
              },
              ...(parentCat && parentCat.slug !== filters.category
                ? [
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": parentCat.label,
                      "item": `https://www.kawral.sn/categories/${parentCat.slug}`
                    },
                    {
                      "@type": "ListItem",
                      "position": 3,
                      "name": activeCatLabel,
                      "item": `https://www.kawral.sn/categories/${filters.category}`
                    }
                  ]
                : [
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": activeCatLabel,
                      "item": `https://www.kawral.sn/categories/${filters.category}`
                    }
                  ])
            ]
          : [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Accueil",
                "item": "https://www.kawral.sn/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Explorer les annonces",
                "item": "https://www.kawral.sn/explorer"
              }
            ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": filters.category
              ? `Comment trouver une annonce ${activeCatLabel.toLowerCase()} fiable au Sénégal sur Kawral ?`
              : "Comment acheter ou louer en direct au Sénégal sur Kawral ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": filters.category
                ? `Utilisez les filtres par ville (Dakar, Almadies, Plateau, Mermoz, Pikine, Thiès, Mbour/Saly, Saint-Louis) et par budget en FCFA pour comparer les offres de ${activeCatLabel.toLowerCase()} et contacter directement le propriétaire ou vendeur par téléphone, messagerie ou WhatsApp sans commission.`
                : "Parcourez les annonces vérifiées par catégorie et par région au Sénégal, puis contactez directement l'annonceur par appel, WhatsApp ou messagerie intégrée sans aucun frais d'intermédiaire."
            }
          },
          {
            "@type": "Question",
            "name": "La publication et la prise de contact sur Kawral sont-elles directes ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Oui, Kawral met en relation directe les vendeurs, bailleurs et acheteurs partout au Sénégal avec prise de rendez-vous en ligne et contact WhatsApp instantané."
            }
          }
        ]
      }
    ]
  };

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
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        jsonLd={searchPageJsonLd}
      />

      {/* En-tête */}
      <header className="mb-5 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Explorer les annonces
          {activeCatLabel && <span className="sr-only"> — {activeCatLabel} au Sénégal</span>}
        </h1>
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

      {/* Bloc éditorial sémantique longue traîne pour l'indexation par catégorie et localité au Sénégal */}
      <section
        aria-label="Informations sur les petites annonces au Sénégal"
        className="sr-only"
      >
        <h2>
          {activeCatLabel
            ? `Petites annonces ${activeCatLabel} à vendre et à louer au Sénégal`
            : "Toutes les petites annonces gratuites au Sénégal sur Kawral"}
        </h2>
        <p>
          {activeCatLabel
            ? `Consultez les meilleures offres de ${activeCatLabel.toLowerCase()} publiées sur Kawral, la marketplace de référence au Sénégal. Que vous recherchiez à Dakar (Almadies, Ngor, Ouakam, Yoff, Mermoz, Sacré-Cœur, Point E, Fann, Plateau, Hann Maristes, Parcelles Assainies, Pikine, Guédiawaye, Rufisque, Keur Massar, Diamniadio) ou dans les régions (Thiès, Mbour, Saly Portudal, Saint-Louis, Touba, Kaolack, Ziguinchor, Cap Skirring, Diourbel, Louga, Tambacounda, Kolda), échangez directement avec les propriétaires et vendeurs vérifiés en Franc CFA (FCFA) sans frais d'agence.`
            : "Kawral connecte acheteurs, locataires et vendeurs dans toutes les régions du Sénégal : Dakar, Thiès, Mbour, Saly, Saint-Louis, Touba, Kaolack et Ziguinchor. Trouvez un appartement, une villa, un terrain avec titre foncier, une voiture d'occasion, un smartphone, de l'électroménager ou du matériel professionnel au meilleur prix en FCFA."}
        </p>
        {activeCatalogCategory ? (
          <nav aria-label={`Sous-catégories ${activeCatalogCategory.label}`}>
            <h3>Parcourir les rubriques {activeCatalogCategory.label} au Sénégal</h3>
            <ul>
              {activeCatalogCategory.subcategories.map((sub) => (
                <li key={sub.slug}>
                  <Link to={`/categories/${sub.slug}`}>
                    {sub.label} à vendre et à louer à Dakar et au Sénégal
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <nav aria-label="Catégories principales au Sénégal">
            <h3>Explorer par catégorie sur Kawral Sénégal</h3>
            <ul>
              {MAIN_CATEGORIES_CATALOG.map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/categories/${cat.slug}`}>
                    {cat.label} au Sénégal — {cat.description}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </section>
    </div>
  );
};
