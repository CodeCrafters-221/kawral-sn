import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Share2, Heart, Eye, MapPin, Maximize2 } from 'lucide-react';
import { DotNav } from '../../../../components/marketplace/DotNav';
import { formatPriceFCFA, getCategoryLabel } from '../../../../utils/formatters';
import type { Listing } from '../../../../types';
import { ImageLightbox } from './ImageLightbox';

interface ListingHeroGalleryProps {
  listing: Listing;
  activeImageIdx: number;
  setActiveImageIdx: React.Dispatch<React.SetStateAction<number>>;
  favorite: boolean;
  userInteracted: boolean;
  setUserInteracted: (v: boolean) => void;
  onBack?: () => void;
  onShare: () => void;
  onToggleFavorite: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export const ListingHeroGallery: React.FC<ListingHeroGalleryProps> = ({
  listing,
  activeImageIdx,
  setActiveImageIdx,
  favorite,
  userInteracted,
  setUserInteracted,
  onBack,
  onShare,
  onToggleFavorite,
  onTouchStart,
  onTouchEnd,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <>
    <div className="relative w-full h-[280px] xs:h-[340px] sm:h-[420px] md:h-[460px] lg:h-[500px] xl:h-[540px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-md group">
      {/* Conteneur tactile et cliquable pleine largeur */}
      <div
        className="relative w-full h-full cursor-pointer overflow-hidden"
        onClick={() => setIsLightboxOpen(true)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Image principale : prend 100% de la largeur et de la hauteur sans padding ni dézoom */}
        <img
          key={activeImageIdx}
          src={listing.images[activeImageIdx]}
          alt={listing.title}
          className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Dégradé doux et discret pour la lisibilité des badges et boutons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Badges haut-gauche : Statut, Catégorie et Vues */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 sm:gap-2 z-10 pointer-events-none flex-wrap">
        {listing.category !== "other" ? (
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide shadow-sm ${
              listing.transactionType === "sale"
                ? "bg-kawral-green text-white"
                : "bg-kawral-orange text-white"
            }`}
          >
            {listing.transactionType === "sale" ? "À Vendre" : "À Louer"}
          </span>
        ) : (
          <span className="bg-kawral-green text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide shadow-sm">
            Prix Unique
          </span>
        )}
        <span className="bg-black/50 backdrop-blur-md text-white px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold border border-white/10 shadow-sm">
          {getCategoryLabel(listing.category)}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 bg-black/50 backdrop-blur-md text-white/90 px-2.5 py-1 rounded-full text-xs font-bold border border-white/10 shadow-sm">
          <Eye className="w-3 h-3" /> {listing.views}
        </span>
      </div>

      {/* Actions haut-droite : Partager et Favori */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
        <button
          type="button"
          onClick={onShare}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black/50 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center transition-all border border-white/10 shadow-sm cursor-pointer"
          aria-label="Partager l'annonce"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl backdrop-blur-md flex items-center justify-center transition-all active:scale-90 border border-white/10 shadow-sm cursor-pointer ${
            favorite
              ? "bg-rose-500 text-white border-rose-400"
              : "bg-black/50 text-white hover:bg-black/75"
          }`}
          aria-label="Ajouter aux favoris"
        >
          <Heart className={`w-4 h-4 ${favorite ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Flèches de navigation gauche / droite sur grand écran */}
      {listing.images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setUserInteracted(true);
              setActiveImageIdx((p) => (p === 0 ? listing.images.length - 1 : p - 1));
            }}
            className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black/50 hover:bg-black/80 backdrop-blur-md text-white items-center justify-center transition-all z-10 cursor-pointer border border-white/10 shadow-md active:scale-95"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setUserInteracted(true);
              setActiveImageIdx((p) => (p === listing.images.length - 1 ? 0 : p + 1));
            }}
            className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black/50 hover:bg-black/80 backdrop-blur-md text-white items-center justify-center transition-all z-10 cursor-pointer border border-white/10 shadow-md active:scale-95"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Barre inférieure : Points de défilement, compteur et bouton plein écran */}
      <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex items-center justify-between z-10 pointer-events-none">
        {listing.images.length > 1 ? (
          <div className="pointer-events-auto">
            <DotNav
              total={listing.images.length}
              active={activeImageIdx}
              autoPlay={!userInteracted}
              onSelect={(i) => {
                setUserInteracted(true);
                setActiveImageIdx(i);
              }}
            />
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 pointer-events-auto">
          {listing.images.length > 1 && (
            <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
              {activeImageIdx + 1} / {listing.images.length}
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
            title="Agrandir en plein écran"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden sm:inline">Plein écran</span>
          </button>
        </div>
      </div>
    </div>

    {/* Rangée de miniatures interactives sous la photo si plusieurs images */}
    {listing.images.length > 1 && (
      <div className="flex items-center gap-2 mt-2.5 sm:mt-3 overflow-x-auto pb-1 scrollbar-none overscroll-contain">
        {listing.images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setUserInteracted(true);
              setActiveImageIdx(idx);
            }}
            className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
              activeImageIdx === idx
                ? "border-kawral-green ring-2 ring-kawral-green/30 scale-102 shadow-xs"
                : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
            }`}
            aria-label={`Afficher la photo ${idx + 1}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    )}
    
    <ImageLightbox
      images={listing.images}
      activeIndex={activeImageIdx}
      isOpen={isLightboxOpen}
      onClose={() => setIsLightboxOpen(false)}
      onNavigate={(idx) => {
        setUserInteracted(true);
        setActiveImageIdx(idx);
      }}
    />
    </>
  );
};
