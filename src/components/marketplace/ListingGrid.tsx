import React, { useEffect, useState } from 'react';
import { Listing } from '../../types';
import { ListingCard } from './ListingCard';
import { ListingGridSkeleton } from './Skeletons';
import { Pagination } from '../ui/Pagination';
import { useApp } from '../../context/AppContext';
import { Grid, List, SearchX, RefreshCw, ChevronDown } from 'lucide-react';

interface ListingGridProps {
  listings: Listing[];
  title?: string;
  showControls?: boolean;
  isLoading?: boolean;
  skeletonCount?: number;
  /** Disposition imposée par le parent (sinon gérée en interne) */
  layout?: 'grid' | 'list';
  /** Grille plus étroite (3 colonnes max) quand une sidebar est affichée */
  withSidebar?: boolean;
  /** Défilement horizontal sur mobile (ex: Tendance sur Kawral) */
  mobileHorizontalScroll?: boolean;
  /** Taille de page pour la pagination (par défaut 12) */
  defaultPageSize?: number;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  title,
  showControls = true,
  isLoading,
  skeletonCount = 6,
  layout: controlledLayout,
  withSidebar = false,
  mobileHorizontalScroll = false,
  defaultPageSize = 12,
}) => {
  const { filters, setFilters, resetFilters, isLoadingListings } = useApp();
  const [internalLayout, setLayout] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const layout = controlledLayout ?? internalLayout;

  useEffect(() => {
    setPage(1);
  }, [
    filters.search,
    filters.category,
    filters.transactionType,
    filters.location,
    filters.priceMin,
    filters.priceMax,
    filters.sortBy,
    listings.length,
  ]);

  const showSkeleton = isLoading !== undefined ? isLoading : isLoadingListings;

  if (showSkeleton) {
    return (
      <ListingGridSkeleton
        layout={layout}
        showControls={showControls}
        count={skeletonCount}
        mobileHorizontalScroll={mobileHorizontalScroll}
      />
    );
  }

  const displayedListings = mobileHorizontalScroll
    ? listings
    : listings.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Top Header & View Controls Bar */}
      {showControls && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-kawral-border">
          <div>
            {title && <h2 className="font-extrabold text-lg text-kawral-dark">{title}</h2>}
            <p className="text-xs font-semibold text-kawral-muted">
              <span className="text-kawral-green font-extrabold text-sm">{listings.length}</span> {listings.length > 1 ? 'annonces trouvées' : 'annonce trouvée'}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-kawral-muted hidden md:inline shrink-0">Trier par:</span>
              <div className="relative min-w-0">
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as any
                    }))
                  }
                  className="bg-kawral-ivory border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-kawral-dark focus:outline-none focus:border-kawral-green appearance-none truncate text-ellipsis cursor-pointer max-w-[150px] sm:max-w-none"
                >
                  <option value="recent">Plus récentes</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="popular">Plus populaires</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Grid / List Layout Toggles */}
            <div className="flex items-center gap-1 bg-kawral-ivory p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setLayout('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  layout === 'grid'
                    ? 'bg-kawral-green text-white shadow-xs'
                    : 'text-kawral-muted hover:text-kawral-dark'
                }`}
                title="Vue Grille"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setLayout('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  layout === 'list'
                    ? 'bg-kawral-green text-white shadow-xs'
                    : 'text-kawral-muted hover:text-kawral-dark'
                }`}
                title="Vue Liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Empty State when no listings match */}
      {listings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-kawral-border p-12 text-center space-y-4 shadow-xs my-8">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-kawral-orange flex items-center justify-center mx-auto">
            <SearchX className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-xl text-kawral-dark">
            Aucune annonce trouvée
          </h3>
          <p className="text-xs text-kawral-muted max-w-md mx-auto leading-relaxed">
            Essayez de modifier ou de réinitialiser vos filtres de recherche pour voir plus de biens disponibles au Sénégal.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 bg-kawral-green hover:bg-kawral-darkgreen text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Réinitialiser tous les filtres
          </button>
        </div>
      ) : (
        <>
          {/* Listings Layout */}
          <div
            className={
              layout === 'grid'
                ? mobileHorizontalScroll
                  ? 'flex flex-nowrap items-stretch overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 pb-3 sm:pb-0 scroll-smooth snap-x snap-mandatory no-scrollbar w-full'
                  : withSidebar
                    ? 'grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-5'
                    : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'
                : 'flex flex-col gap-4'
            }
            style={
              mobileHorizontalScroll
                ? { WebkitOverflowScrolling: 'touch' }
                : undefined
            }
          >
            {displayedListings.map((item, index) => (
              <div
                key={item.id}
                className={
                  mobileHorizontalScroll
                    ? 'w-[calc(50%-6px)] min-w-[calc(50%-6px)] max-w-[calc(50%-6px)] shrink-0 snap-start sm:w-auto sm:min-w-0 sm:max-w-none sm:shrink flex flex-col h-full self-stretch'
                    : 'min-w-0 flex flex-col h-full self-stretch'
                }
              >
                <ListingCard
                  listing={item}
                  layout={layout}
                  imageLoading={index < 4 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>

          {!mobileHorizontalScroll && listings.length > pageSize && (
            <Pagination
              page={page}
              totalItems={listings.length}
              pageSize={pageSize}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[12, 24, 48]}
              itemLabel="annonces"
              className="rounded-2xl border border-kawral-border shadow-xs"
            />
          )}
        </>
      )}

    </div>
  );
};
