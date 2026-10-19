import React, { useState } from 'react';
import { MapPin, Navigation, ExternalLink, Copy, Check, Layers } from 'lucide-react';
import type { ListingLocation } from '../../../../types';
import { resolveAppointmentLocation } from '../../../../utils/geoCoordinates';

interface ListingLocationMapProps {
  location: ListingLocation;
  appointmentEnabled?: boolean;
}

export const ListingLocationMap: React.FC<ListingLocationMapProps> = ({ location, appointmentEnabled = true }) => {
  const [copied, setCopied] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const geo = resolveAppointmentLocation(
    [location.neighborhood, location.city].filter(Boolean).join(', '),
    location,
  );

  const embedUrl = mapType === 'satellite'
    ? `${geo.embedUrl}&t=k`
    : geo.embedUrl;

  const handleCopy = () => {
    navigator.clipboard.writeText(geo.fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Carte interactive */}
      <div className="relative rounded-2xl overflow-hidden border border-kawral-border/70 bg-slate-100">

        {/* Barre supérieure */}
        <div className="bg-white/95 backdrop-blur-sm px-3.5 py-2 border-b border-kawral-border/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="p-1 rounded-lg bg-kawral-orange/10 text-kawral-orange shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold text-kawral-dark truncate">
              {location.neighborhood && `${location.neighborhood}, `}{location.city}
            </span>
          </div>
          {/* Bouton toggle Plan / Satellite */}
          <button
            type="button"
            onClick={() => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard')}
            title={mapType === 'standard' ? 'Vue Satellite' : 'Vue Plan'}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-kawral-dark hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{mapType === 'standard' ? 'Satellite' : 'Plan'}</span>
          </button>
        </div>

        {/* Iframe Google Maps */}
        <div className="relative h-56">
          <iframe
            title={`Localisation : ${location.neighborhood}, ${location.city}`}
            src={embedUrl}
            className="w-full h-full border-0 select-none"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* Badge discret de confidentialité */}
          <div className="absolute top-2 left-2 pointer-events-none z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-kawral-dark shadow-sm border border-white/60 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-kawral-orange animate-pulse" />
            <span>Zone approximative</span>
          </div>
        </div>

        {/* Barre d'actions inférieure */}
        <div className="bg-kawral-ivory px-3.5 py-2 border-t border-kawral-border/60 flex items-center justify-between gap-2">
          {/* Copier l'adresse */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-kawral-dark transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-bold">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copier l'adresse</span>
              </>
            )}
          </button>

          {/* Bouton GPS */}
          <a
            href={geo.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-kawral-green text-white rounded-xl text-[11px] font-bold hover:bg-kawral-darkgreen transition-all shadow-xs"
          >
            <Navigation className="w-3 h-3 text-kawral-orange" />
            <span>Itinéraire GPS</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* Note de confidentialité */}
      <p className="text-[11px] text-kawral-muted mt-2.5 font-medium flex items-center gap-1">
        <MapPin className="w-3 h-3 text-kawral-orange shrink-0" />
        {appointmentEnabled
          ? 'Adresse exacte communiquée après confirmation du rendez-vous.'
          : "Adresse exacte communiquée par le vendeur."}
      </p>
    </>
  );
};

