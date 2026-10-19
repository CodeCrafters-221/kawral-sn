import React from 'react';
import { useApp } from '../../context/AppContext';
import { useLocations } from '../../context/hooks/useLocations';
import {
  SlidersHorizontal,
  RotateCcw,
  X,
  MapPin,
  Tag,
  Banknote,
  Check,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface FilterSidebarProps {
  /** Nombre de résultats (calculé par la page, source unique de vérité) */
  resultCount?: number;
  onCloseMobile?: () => void;
  isModal?: boolean;
}

const RENT_PRICE_PRESETS = [
  { label: '< 200k', min: null, max: 200000 },
  { label: '200k - 500k', min: 200000, max: 500000 },
  { label: '500k - 1,5M', min: 500000, max: 1500000 },
  { label: '> 1,5M', min: 1500000, max: null },
];

const SALE_PRICE_PRESETS = [
  { label: '< 50M', min: null, max: 50000000 },
  { label: '50M - 150M', min: 50000000, max: 150000000 },
  { label: '150M - 300M', min: 150000000, max: 300000000 },
  { label: '> 300M', min: 300000000, max: null },
];

const CATEGORIES = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'immobilier', label: 'Immobilier' },
  { value: 'vehicules', label: 'Véhicules' },
  { value: 'materiel-pro', label: 'Matériel pro' },
  { value: 'mode', label: 'Mode' },
  { value: 'maison-jardin', label: 'Maison & jardin' },
  { value: 'electronique', label: 'Électronique' },
  { value: 'loisirs', label: 'Loisirs' },
  { value: 'autres', label: 'Autres' },
];

const TRANSACTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'sale', label: 'Acheter' },
  { value: 'rent', label: 'Louer' },
] as const;

const MAX_LOCATION_CHIPS = 8;

const inputCls =
  'w-full min-w-0 max-w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-kawral-green/20 focus:border-kawral-green placeholder:text-slate-400 transition-all';

const Section: React.FC<{ icon?: React.ElementType; title: string; children: React.ReactNode }> = ({
  icon: Icon,
  title,
  children,
}) => (
  <div className="space-y-2.5">
    <p className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 uppercase tracking-wider">
      {Icon && <Icon className="w-3.5 h-3.5 text-kawral-green" />}
      {title}
    </p>
    {children}
  </div>
);

const pillCls = (active: boolean) =>
  cn(
    'py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center',
    active
      ? 'bg-kawral-green text-white border-kawral-green shadow-xs'
      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
  );

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ resultCount, onCloseMobile, isModal = false }) => {
  const { filters, setFilters, resetFilters } = useApp();
  const { locations, isLoading: isLoadingLocations } = useLocations();

  const isPresetActive = (min: number | null, max: number | null) =>
    filters.priceMin === min && filters.priceMax === max;

  const togglePricePreset = (min: number | null, max: number | null) =>
    setFilters((prev) =>
      isPresetActive(min, max) ? { ...prev, priceMin: null, priceMax: null } : { ...prev, priceMin: min, priceMax: max }
    );

  const pricePresets = filters.transactionType === 'sale' ? SALE_PRICE_PRESETS : RENT_PRICE_PRESETS;

  return (
    <aside
      aria-label="Filtres de recherche"
      className={cn(
        'bg-white flex flex-col',
        isModal ? 'h-full max-h-[85vh] rounded-3xl overflow-hidden' : 'rounded-3xl border border-slate-200/80 shadow-sm'
      )}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-kawral-green" />
          <h2 className="font-black text-sm text-slate-900">Filtres</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-500 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Effacer
          </button>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Fermer les filtres"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Corps */}
      <div className={cn('px-5 py-5 space-y-6', isModal && 'overflow-y-auto flex-1 overscroll-contain')}>
        {/* Transaction */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
          {TRANSACTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, transactionType: t.value }))}
              className={cn(
                'py-2 text-xs font-bold rounded-lg transition-all cursor-pointer',
                filters.transactionType === t.value
                  ? 'bg-white text-kawral-green shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Catégorie */}
        <Section icon={Tag} title="Catégorie">
          <div className="relative w-full min-w-0">
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className={cn(inputCls, 'appearance-none pr-9 truncate text-ellipsis cursor-pointer')}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </Section>

        {/* Localisation */}
        <Section icon={MapPin} title="Où ?">
          <input
            type="text"
            placeholder="Ville ou quartier"
            value={filters.location}
            onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            className={inputCls}
          />
          <div className="flex flex-wrap gap-1.5">
            {isLoadingLocations ? (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Chargement...
              </span>
            ) : (
              locations.slice(0, MAX_LOCATION_CHIPS).map((loc) => {
                const active = filters.location.toLowerCase() === loc.label.toLowerCase();
                return (
                  <button
                    key={loc.label}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, location: active ? '' : loc.label }))}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer',
                      active ? 'bg-kawral-orange text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    )}
                  >
                    {loc.label}
                  </button>
                );
              })
            )}
          </div>
        </Section>

        {/* Budget */}
        <Section icon={Banknote} title="Budget (FCFA)">
          <div className="grid grid-cols-2 gap-1.5">
            {pricePresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => togglePricePreset(p.min, p.max)}
                className={pillCls(isPresetActive(p.min, p.max))}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min"
              aria-label="Prix minimum"
              value={filters.priceMin ?? ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, priceMin: e.target.value ? Number(e.target.value) : null }))}
              className={inputCls}
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max"
              aria-label="Prix maximum"
              value={filters.priceMax ?? ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, priceMax: e.target.value ? Number(e.target.value) : null }))}
              className={inputCls}
            />
          </div>
        </Section>

      </div>

      {/* Bouton d'application (mobile) */}
      {onCloseMobile && (
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-full py-3.5 bg-kawral-green hover:bg-emerald-800 active:scale-[0.99] text-white rounded-2xl font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {resultCount !== undefined
              ? `Voir ${resultCount} résultat${resultCount > 1 ? 's' : ''}`
              : 'Voir les résultats'}
          </button>
        </div>
      )}
    </aside>
  );
};
