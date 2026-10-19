import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Home,
  Building2,
  Tag,
  Banknote,
  Search,
  MapPin,
  RotateCcw,
  TreePine,
  Car,
  Store,
  BedDouble,
  Compass,
  KeyRound,
  Package,
  Briefcase,
  Shirt,
  Armchair,
  Smartphone,
  Gamepad2,
  Bike,
  Truck,
  Maximize2,
} from 'lucide-react';

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType }> = {
  immobilier: { label: 'Immobilier', icon: Building2 },
  vehicules: { label: 'Véhicules', icon: Car },
  'materiel-pro': { label: 'Matériel pro', icon: Briefcase },
  mode: { label: 'Mode', icon: Shirt },
  'maison-jardin': { label: 'Maison & jardin', icon: Armchair },
  electronique: { label: 'Électronique', icon: Smartphone },
  loisirs: { label: 'Loisirs', icon: Gamepad2 },
  autres: { label: 'Autres', icon: Package },
  apartment: { label: 'Appartements', icon: Building2 },
  house: { label: 'Maisons & Villas', icon: Home },
  land: { label: 'Terrains', icon: TreePine },
  vehicle: { label: 'Véhicules', icon: Car },
  voitures: { label: 'Voitures', icon: Car },
  motos: { label: 'Motos & Scooters', icon: Bike },
  utilitaires: { label: 'Utilitaires', icon: Truck },
  commercial: { label: 'Commerces & Bureaux', icon: Store },
  room: { label: 'Chambres', icon: BedDouble },
  other: { label: 'Autres', icon: Package },
};

const formatPrice = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toLocaleString('fr-FR')}M`;
  if (val >= 1000) return `${(val / 1000).toLocaleString('fr-FR')}k`;
  return val.toLocaleString('fr-FR');
};

const Chip: React.FC<{ icon?: React.ElementType; label: string; onRemove: () => void }> = ({
  icon: Icon,
  label,
  onRemove,
}) => (
  <span className="inline-flex shrink-0 items-center gap-1.5 pl-3 pr-1 py-1 rounded-full bg-white border border-emerald-200 text-kawral-green text-xs font-bold shadow-2xs animate-fade-in">
    {Icon && <Icon className="w-3.5 h-3.5" />}
    <span className="max-w-[160px] truncate">{label}</span>
    <button
      type="button"
      onClick={onRemove}
      className="w-5 h-5 rounded-full hover:bg-emerald-50 flex items-center justify-center transition-colors cursor-pointer"
      aria-label={`Retirer le filtre ${label}`}
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

/** Affiche uniquement les filtres actifs, chacun supprimable en un clic. */
export const FilterChips: React.FC = () => {
  const { filters, setFilters, resetFilters } = useApp();

  const chips: { key: string; icon?: React.ElementType; label: string; clear: () => void }[] = [];

  if (filters.search)
    chips.push({ key: 'search', icon: Search, label: `“${filters.search}”`, clear: () => setFilters((p) => ({ ...p, search: '' })) });
  if (filters.transactionType !== 'all')
    chips.push({
      key: 'tx',
      icon: filters.transactionType === 'sale' ? Compass : KeyRound,
      label: filters.transactionType === 'sale' ? 'À vendre' : 'À louer',
      clear: () => setFilters((p) => ({ ...p, transactionType: 'all' })),
    });
  if (filters.category) {
    const meta = CATEGORY_META[filters.category] || { label: filters.category, icon: Tag };
    chips.push({ key: 'cat', icon: meta.icon, label: meta.label, clear: () => setFilters((p) => ({ ...p, category: '' })) });
  }
  if (filters.location)
    chips.push({ key: 'loc', icon: MapPin, label: filters.location, clear: () => setFilters((p) => ({ ...p, location: '' })) });
  if (filters.priceMin !== null || filters.priceMax !== null)
    chips.push({
      key: 'price',
      icon: Banknote,
      label:
        filters.priceMin && filters.priceMax
          ? `${formatPrice(filters.priceMin)} - ${formatPrice(filters.priceMax)} FCFA`
          : filters.priceMax
            ? `< ${formatPrice(filters.priceMax)} FCFA`
            : `> ${formatPrice(filters.priceMin || 0)} FCFA`,
      clear: () => setFilters((p) => ({ ...p, priceMin: null, priceMax: null })),
    });
  if (filters.surfaceMin !== null)
    chips.push({ key: 'surface', icon: Maximize2, label: `${filters.surfaceMin}+ m²`, clear: () => setFilters((p) => ({ ...p, surfaceMin: null })) });
  if (filters.roomsMin !== null)
    chips.push({ key: 'rooms', icon: BedDouble, label: `${filters.roomsMin}+ pièces`, clear: () => setFilters((p) => ({ ...p, roomsMin: null })) });

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none sm:flex-wrap -mx-1 px-1 py-0.5">
      {chips.map((c) => (
        <Chip key={c.key} icon={c.icon} label={c.label} onRemove={c.clear} />
      ))}
      <button
        type="button"
        onClick={resetFilters}
        className="shrink-0 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Tout effacer</span>
      </button>
    </div>
  );
};
