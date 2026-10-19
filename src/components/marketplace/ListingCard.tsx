import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatPriceFCFA, getCategoryLabel } from '../../utils/formatters';
import { Heart, MapPin } from 'lucide-react';
import { Badge, SafeImage } from '../ui';

interface ListingCardProps {
  listing: Listing;
  layout?: 'grid' | 'list';
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  layout = 'grid'
}) => {
  const { isFavorite, toggleFavorite } = useApp();
  const navigate = useNavigate();

  const favorite = isFavorite(listing.id);
  const imgSrc = listing.images && listing.images[0] ? listing.images[0] : FALLBACK_IMG;

  const handleClick = () => {
    navigate(`/listings/${listing.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(listing.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`group bg-white rounded-2xl border border-kawral-border shadow-xs overflow-hidden isolate hover:border-kawral-green hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-1 w-full h-full ${
        layout === 'list' ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      {/* Image Container */}
      <div className={`relative overflow-hidden isolate [transform:translateZ(0)] ${layout === 'list' ? 'md:w-64 h-40 sm:h-48 md:h-auto' : 'h-36 sm:h-44 md:h-48'} bg-slate-100 flex-shrink-0`}>
        <SafeImage
          src={imgSrc}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          fallback={FALLBACK_IMG}
        />

        {/* Status Badge (À VENDRE / À LOUER / AUTRE) */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 sm:gap-1.5">
          <Badge
            variant={listing.category === 'other' ? 'secondary' : (listing.transactionType === 'sale' ? 'accent' : 'primary')}
            size="sm"
            className={`uppercase tracking-wider shadow-md font-extrabold backdrop-blur-sm text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 ${
              listing.category === 'other'
                ? 'bg-slate-800 text-white border-slate-800'
                : listing.transactionType === 'sale'
                  ? 'bg-kawral-orange text-white border-kawral-orange'
                  : 'bg-kawral-green text-white border-kawral-green'
            }`}
          >
            {listing.category === 'other' ? 'PRIX UNIQUE' : (listing.transactionType === 'sale' ? 'À VENDRE' : 'À LOUER')}
          </Badge>
          {listing.isFeatured && (
            <Badge variant="warning" size="sm" className="uppercase tracking-wider font-extrabold shadow-md bg-amber-400 text-white border-amber-400 text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2">
              EN VEDETTE
            </Badge>
          )}
        </div>

        {/* Favorite Heart Circle Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shadow-md transition-all duration-200 active:scale-90 cursor-pointer ${
            favorite ? 'text-rose-500' : 'text-kawral-muted hover:text-kawral-orange hover:scale-110'
          }`}
          title={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${favorite ? 'fill-current' : ''}`} />
        </button>

        {/* Voile + badge si Vendu / Loué / Indisponible */}
        {(listing.status === 'sold' || listing.status === 'rented' || listing.status === 'unavailable') && (
          <div className="absolute inset-0 bg-kawral-dark/60 flex items-center justify-center p-2 z-10 pointer-events-none">
            <span
              className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg text-white font-black text-[11px] sm:text-xs uppercase tracking-widest shadow-xl border border-white/30 ${
                listing.status === 'sold'
                  ? 'bg-kawral-orange'
                  : listing.status === 'rented'
                    ? 'bg-kawral-green'
                    : 'bg-slate-700'
              }`}
            >
              {listing.status === 'sold'
                ? 'Vendu'
                : listing.status === 'rented'
                  ? 'Loué'
                  : 'Indisponible'}
            </span>
          </div>
        )}
      </div>

      {/* Body Content Container */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
        <div className="min-w-0">
          {/* Category Tag */}
          <span className="font-bold text-[9px] sm:text-[10px] text-kawral-orange uppercase tracking-wider block mb-0.5 sm:mb-1">
            {getCategoryLabel(listing.category)}
          </span>

          {/* Title */}
          <h3
            title={listing.title}
            className="font-extrabold text-[13px] sm:text-[15px] text-kawral-dark group-hover:text-kawral-green transition-colors leading-snug line-clamp-2 break-words [overflow-wrap:anywhere]"
          >
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-kawral-muted mt-1 mb-2 sm:mt-1.5 sm:mb-3 font-medium min-w-0">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-kawral-orange shrink-0" />
            <span className="truncate">
              {listing.location.neighborhood}, {listing.location.city}
            </span>
          </div>

          {/* Characteristics Summary */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-semibold text-kawral-muted">
            {(() => {
              const c = listing.characteristics;
              if (!c) return null;
              
              const features = [];
              
              if (c.surface) features.push(`${c.surface} m²`);
              if (c.bedrooms) features.push(`${c.bedrooms} ch.`);
              else if (c.rooms) features.push(`${c.rooms} p.`);
              
              if (c.year) features.push(`${c.year}`);
              if (c.mileage !== undefined) features.push(`${c.mileage.toLocaleString("fr-FR")} km`);
              if (c.fuel) features.push(`${c.fuel}`);
              if (c.transmission) features.push(`${c.transmission}`);
              if (c.engineCapacity) features.push(`${c.engineCapacity} cm³`);
              if (c.payload) features.push(`${c.payload}t`);
              
              if (c.storage) features.push(c.storage);
              if (c.ram) features.push(`${c.ram} RAM`);
              
              if (c.size) {
                const sizeText = Array.isArray(c.size) ? c.size.join(", ") : c.size;
                if (sizeText) features.push(`Taille: ${sizeText}`);
              }
              if (c.shoeSize) features.push(`Pt: ${c.shoeSize}`);
              
              if (c.condition && features.length < 2) features.push(c.condition);
              
              return features.slice(0, 4).map((feat, idx) => (
                <span key={idx} className="bg-kawral-ivory border border-kawral-border/60 px-1.5 py-0.5 sm:px-2 rounded-md sm:rounded-lg text-kawral-dark">
                  {feat}
                </span>
              ));
            })()}
          </div>
        </div>

        {/* Footer Price Row */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 sm:pt-3 mt-auto gap-2 min-w-0">
          <div className="min-w-0 flex-1 truncate">
            <span className="text-xs xs:text-sm sm:text-base font-black text-kawral-green truncate block">
              {formatPriceFCFA(listing.price)}
              {listing.category !== 'other' && listing.pricePeriod && listing.pricePeriod !== 'total' && (
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
    </div>
  );
};
