import React from 'react';
import { Link } from 'react-router-dom';
import { Listing } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatPriceFCFA } from '../../utils/formatters';
import { Heart, MapPin } from 'lucide-react';
import { Badge, SafeImage } from '../ui';

interface ListingCardProps {
  listing: Listing;
  layout?: 'grid' | 'list';
  imageLoading?: 'eager' | 'lazy';
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  layout = 'grid',
  imageLoading = 'lazy',
}) => {
  const { isFavorite, toggleFavorite } = useApp();

  const favorite = isFavorite(listing.id);
  const imgSrc = listing.images && listing.images[0] ? listing.images[0] : FALLBACK_IMG;

  return (
    <article className="group relative bg-white rounded-2xl border border-kawral-border shadow-xs overflow-hidden isolate hover:border-kawral-green hover:shadow-xl transition-all duration-300 flex flex-1 w-full h-full">
      <Link
        to={`/listings/${listing.id}`}
        className={`flex flex-1 w-full h-full no-underline ${
          layout === 'list' ? 'flex-col md:flex-row' : 'flex-col'
        }`}
      >
      {/* Image Container */}
      <div className={`relative overflow-hidden isolate [transform:translateZ(0)] ${layout === 'list' ? 'md:w-64 h-40 sm:h-48 md:h-auto' : 'h-36 sm:h-44 md:h-48'} bg-slate-100 flex-shrink-0`}>
        <SafeImage
          src={imgSrc}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          style={{ height: '100%' }}
          fallback={FALLBACK_IMG}
          loading={imageLoading}
          decoding="async"
        />

        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <Badge
            variant={listing.transactionType === 'rent' ? 'primary' : 'accent'}
            size="sm"
            className={`uppercase tracking-wider shadow-md font-extrabold backdrop-blur-sm text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 ${
              listing.transactionType === 'rent'
                ? 'bg-kawral-darkgreen text-white border-kawral-darkgreen'
                : 'bg-kawral-orange text-white border-kawral-orange'
            }`}
          >
            {listing.transactionType === 'rent' ? 'À LOUER' : 'À VENDRE'}
          </Badge>
        </div>
      </div>

      {/* Body Content Container */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          {/* Title */}
          <h3
            title={listing.title}
            className="font-extrabold text-[13px] sm:text-[15px] text-kawral-dark group-hover:text-kawral-green transition-colors leading-snug whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
          >
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-kawral-muted mt-1 mb-2 sm:mt-1.5 sm:mb-3 font-medium min-w-0">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-kawral-orange shrink-0" />
            <span className="truncate min-w-0">
              {[listing.location.neighborhood, listing.location.city].filter(Boolean).join(', ') || 'Localisation non précisée'}
            </span>
          </div>

          <div className="h-4 min-w-0 text-[10px] sm:text-[11px] font-semibold text-kawral-muted truncate">
            {listing.owner.name && listing.owner.name !== 'Vendeur Kawral'
              ? `@${listing.owner.name.trim()}`
              : null}
          </div>
        </div>

        {/* Footer Price Row */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 sm:pt-3 mt-auto gap-2 min-w-0">
          <div className="min-w-0 flex-1 truncate">
            <span className="text-xs xs:text-sm sm:text-base font-black text-kawral-green truncate block">
              {formatPriceFCFA(listing.price)}
              {listing.pricePeriod && listing.pricePeriod !== 'total' && (
                <span className="text-[10px] sm:text-[11px] font-normal text-kawral-muted ml-0.5 sm:ml-1">
                  /{listing.pricePeriod === 'month' ? 'mois' : 'jour'}
                </span>
              )}
            </span>
          </div>

          <span className="hidden sm:inline-flex items-center text-[10px] sm:text-[11px] font-bold text-kawral-green whitespace-nowrap group-hover:text-kawral-orange group-hover:translate-x-0.5 transition-all shrink-0">
            Voir détails →
          </span>
        </div>

      </div>
      </Link>
      <button
        onClick={() => toggleFavorite(listing.id)}
        className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shadow-md transition-all duration-200 active:scale-90 cursor-pointer ${
          favorite ? 'text-rose-500' : 'text-kawral-muted hover:text-kawral-orange hover:scale-110'
        }`}
        title={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        aria-pressed={favorite}
        type="button"
      >
        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${favorite ? 'fill-current' : ''}`} />
      </button>
    </article>
  );
};
