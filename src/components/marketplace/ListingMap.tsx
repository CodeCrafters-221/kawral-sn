import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing } from '../../types';
import { formatPriceFCFA } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { MapPin, X, ArrowRight } from 'lucide-react';

interface ListingMapProps {
  listings: Listing[];
}

export const ListingMap: React.FC<ListingMapProps> = ({ listings }) => {
  const navigate = useNavigate();
  const [activeListing, setActiveListing] = useState<Listing | null>(listings[0] || null);

  const handleOpenListing = (id: string) => {
    navigate(`/listings/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full h-[550px] rounded-3xl overflow-hidden border border-kawral-border bg-[#EAE7DF] shadow-inner flex flex-col justify-between">
      
      {/* Decorative Interactive Dakar / Senegal Map SVG */}
      <div className="absolute inset-0 opacity-90 pointer-events-none">
        <svg viewBox="0 0 800 600" className="w-full h-full object-cover">
          {/* Sea / Atlantic Ocean */}
          <rect width="800" height="600" fill="#DCE7EA" />
          
          {/* Senegal Coastline shape representation */}
          <path
            d="M 120 0 Q 180 180 100 280 T 220 420 T 350 500 T 500 600 L 800 600 L 800 0 Z"
            fill="#F4EFFAF"
            stroke="#C1D1D3"
            strokeWidth="3"
          />

          {/* Road grid lines representing Dakar highways */}
          <path d="M 100 280 L 350 250 L 550 220" stroke="#E2DCD2" strokeWidth="6" strokeDasharray="8 4" />
          <path d="M 220 270 L 400 380 L 600 450" stroke="#E2DCD2" strokeWidth="5" />
          <path d="M 350 250 L 450 120" stroke="#E2DCD2" strokeWidth="4" />

          {/* Region Text Labels */}
          <text x="110" y="220" fill="#0B4D45" opacity="0.4" fontSize="18" fontWeight="bold">
            ALMADIES / DAKAR
          </text>
          <text x="320" y="220" fill="#0B4D45" opacity="0.4" fontSize="16" fontWeight="bold">
            DIAMNIADIO
          </text>
          <text x="520" y="150" fill="#0B4D45" opacity="0.4" fontSize="16" fontWeight="bold">
            THIÈS
          </text>
          <text x="550" y="420" fill="#0B4D45" opacity="0.4" fontSize="16" fontWeight="bold">
            SALY PORTUDAL
          </text>
        </svg>
      </div>

      {/* Map Header Overlay */}
      <div className="relative z-10 p-4 bg-white/80 backdrop-blur-md border-b border-kawral-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-kawral-orange" />
          <span className="font-extrabold text-sm text-kawral-dark">
            Carte interactive des annonces au Sénégal
          </span>
        </div>
        <span className="bg-kawral-green text-white px-3 py-1 rounded-full text-xs font-bold">
          {listings.length} biens localisés
        </span>
      </div>

      {/* Pins Overlay */}
      <div className="relative z-10 flex-1 p-8">
        {listings.map((item, idx) => {
          // Calculate mock lat/lng coordinates to pin positions on Dakar map preview
          const positions = [
            { top: '35%', left: '18%' }, // Almadies
            { top: '42%', left: '26%' }, // Mermoz
            { top: '38%', left: '42%' }, // Diamniadio
            { top: '72%', left: '68%' }, // Saly
            { top: '25%', left: '65%' }, // Thiès
            { top: '48%', left: '22%' }, // Ouakam
            { top: '30%', left: '28%' }, // Yoff
            { top: '55%', left: '24%' }  // Fann
          ];

          const pos = positions[idx % positions.length];
          const isSelected = activeListing?.id === item.id;

          return (
            <div
              key={item.id}
              style={{ top: pos.top, left: pos.left }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            >
              <button
                onClick={() => setActiveListing(item)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-kawral-orange text-white ring-4 ring-orange-200 scale-110 z-30'
                    : 'bg-kawral-green text-white hover:bg-kawral-darkgreen hover:scale-105 z-20'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{formatPriceFCFA(item.price)}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Popup Card for Selected Pin */}
      {activeListing && (
        <div className="relative z-20 m-4 bg-white rounded-2xl p-4 shadow-2xl border border-kawral-border max-w-md animate-slide-up flex gap-4">
          <img
            src={activeListing.images[0]}
            alt={activeListing.title}
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
          />

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-kawral-green block truncate">
                  {activeListing.categoryLabel} — {activeListing.location.city}
                </span>
                <h4
                  title={activeListing.title}
                  className="font-bold text-sm text-kawral-dark line-clamp-2 break-words [overflow-wrap:anywhere]"
                >
                  {activeListing.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveListing(null)}
                className="text-slate-400 hover:text-slate-600 p-1 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="font-extrabold text-kawral-green text-sm">
                {formatPriceFCFA(activeListing.price)}
              </span>

              <button
                onClick={() => handleOpenListing(activeListing.id)}
                className="flex items-center gap-1 text-xs font-bold text-kawral-orange hover:underline"
              >
                <span>Détails</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
