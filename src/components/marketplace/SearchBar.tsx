import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useLocations } from '../../context/hooks/useLocations';
import {
  Search,
  MapPin,
  Tag,
  X,
  Layers,
  TrendingUp,
  SlidersHorizontal,
  Home,
  Building2,
  TreePine,
  Car,
  Store,
  BedDouble,
  Compass,
  KeyRound,
  Waves,
  Sofa,
  FileCheck,
  ArrowRight,
  Loader2,
  Package,
  Briefcase,
  Shirt,
  Armchair,
  Smartphone,
  Gamepad2
} from 'lucide-react';
import { Button } from '../ui';

interface SearchBarProps {
  className?: string;
  variant?: 'default' | 'glass';
}


const POPULAR_SEARCHES = [
  { text: 'Villa avec piscine', icon: Waves, tag: 'Luxe' },
  { text: 'Appartement meublé', icon: Sofa, tag: 'Prêt à vivre' },
  { text: 'Terrain titre foncier', icon: FileCheck, tag: 'Sécurisé' },
  { text: 'Studio à louer', icon: KeyRound, tag: 'Location' },
  { text: 'Bureau / Local commercial', icon: Store, tag: 'Pro' },
];

const CATEGORIES = [
  { value: '', label: 'Toutes catégories', icon: Tag },
  { value: 'immobilier', label: 'Immobilier', icon: Building2 },
  { value: 'vehicules', label: 'Véhicules', icon: Car },
  { value: 'materiel-pro', label: 'Matériel pro', icon: Briefcase },
  { value: 'mode', label: 'Mode', icon: Shirt },
  { value: 'maison-jardin', label: 'Maison & jardin', icon: Armchair },
  { value: 'electronique', label: 'Électronique', icon: Smartphone },
  { value: 'loisirs', label: 'Loisirs', icon: Gamepad2 },
  { value: 'autres', label: 'Autres', icon: Package },
];

export const SearchBar: React.FC<SearchBarProps> = ({ className = '', variant = 'default' }) => {
  const { filters, setFilters, setCurrentView, currentView, listings } = useApp();
  const { locations, isLoading: isLoadingLocations } = useLocations();

  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [locationQuery, setLocationQuery] = useState(filters.location);
  const [category, setCategory] = useState(filters.category);
  const [transactionType, setTransactionType] = useState<'all' | 'sale' | 'rent'>(filters.transactionType);

  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const locationContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Sync internal state when external filter context changes
  useEffect(() => {
    setSearchQuery(filters.search);
    setLocationQuery(filters.location);
    setCategory(filters.category);
    setTransactionType(filters.transactionType);
  }, [filters.search, filters.location, filters.category, filters.transactionType]);

  // Live real-time filter update with debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setFilters((prev) => {
        if (
          prev.search === searchQuery &&
          prev.location === locationQuery &&
          prev.category === category &&
          prev.transactionType === transactionType
        ) {
          return prev;
        }
        return {
          ...prev,
          search: searchQuery,
          location: locationQuery,
          category,
          transactionType,
        };
      });
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, locationQuery, category, transactionType, setFilters]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
      if (locationContainerRef.current && !locationContainerRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSearchSuggestions(false);
    setShowLocationSuggestions(false);

    setFilters((prev) => ({
      ...prev,
      search: searchQuery,
      location: locationQuery,
      category,
      transactionType,
    }));

    if (currentView !== 'search') {
      setCurrentView('search');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLocation = (loc: string) => {
    setLocationQuery(loc);
    setShowLocationSuggestions(false);
    if (currentView !== 'search' && variant === 'glass') {
      // Auto transition to search for immersive UX
      setFilters((prev) => ({ ...prev, location: loc }));
      setCurrentView('search');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSearchPreset = (text: string) => {
    setSearchQuery(text);
    setShowSearchSuggestions(false);
    if (currentView !== 'search' && variant === 'glass') {
      setFilters((prev) => ({ ...prev, search: text }));
      setCurrentView('search');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (cat: string) => {
    setCategory(cat);
    if (currentView !== 'search' && variant === 'glass') {
      setFilters((prev) => ({ ...prev, category: cat }));
      setCurrentView('search');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectTransaction = (type: 'all' | 'sale' | 'rent') => {
    setTransactionType(type);
    if (currentView !== 'search' && variant === 'glass') {
      setFilters((prev) => ({ ...prev, transactionType: type }));
    }
  };

  // Calculate live matching results
  const matchCount = listings.filter((item) => {
    if (item.status !== 'published') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = `${item.location.city} ${item.location.neighborhood} ${item.location.region}`.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }
    if (category && item.category !== category) return false;
    if (transactionType !== 'all' && item.transactionType !== transactionType) return false;
    if (locationQuery) {
      const loc = locationQuery.toLowerCase();
      const matchLoc = `${item.location.city} ${item.location.neighborhood} ${item.location.region}`.toLowerCase().includes(loc);
      if (!matchLoc) return false;
    }
    return true;
  }).length;

  const isGlass = variant === 'glass';

  // Dynamic visual styling inspired by luxury & immersive portals
  const formBaseClasses = isGlass
    ? 'bg-[#0B1E24]/85 backdrop-blur-2xl border border-white/20 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.85)] text-white ring-1 ring-white/10'
    : 'bg-white border border-slate-200/80 shadow-[0_20px_40px_-10px_rgba(13,79,69,0.09)] text-slate-900';

  const labelColor = isGlass ? 'text-emerald-300/90 font-black' : 'text-kawral-green font-black';
  const inputTextColor = isGlass ? 'text-white' : 'text-slate-900';
  const placeholderColor = isGlass ? 'placeholder:text-white/40' : 'placeholder:text-slate-400';
  const dividerColor = isGlass ? 'border-white/10' : 'border-slate-100';
  const dropdownBg = isGlass
    ? 'bg-[#0B1E24]/95 backdrop-blur-2xl border border-white/20 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]'
    : 'bg-white border border-slate-200 text-slate-800 shadow-2xl';

  const pillClass = (active: boolean, accent = false) =>
    `px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
      active
        ? accent
          ? 'bg-kawral-orange text-white shadow-sm'
          : 'bg-kawral-green text-white shadow-sm'
        : isGlass
          ? 'text-white/80 hover:text-white hover:bg-white/10'
          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
    }`;

  const topBarContainerClass = isGlass
    ? 'inline-flex items-center gap-1 p-1 rounded-2xl bg-black/35 backdrop-blur-md border border-white/15'
    : 'inline-flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200/80';

  /* ─── Mobile-only: single immersive search input ─── */
  const [mobileFocused, setMobileFocused] = useState(false);

  const MobileSearchBar = (
    <div className={`block md:hidden ${className}`}>
      <div
        className={`relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
          isGlass
            ? 'bg-white/10 backdrop-blur-xl border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            : 'bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(13,79,69,0.10)]'
        } ${mobileFocused ? (isGlass ? 'ring-2 ring-kawral-orange/60 border-kawral-orange/40' : 'ring-2 ring-kawral-green/30 border-kawral-green/40') : ''}`}
      >
        {/* Animated search icon */}
        <div className={`shrink-0 transition-all duration-300 ${mobileFocused ? 'scale-110' : 'scale-100'}`}>
          <Search className={`w-5 h-5 transition-colors duration-300 ${mobileFocused ? 'text-kawral-orange' : isGlass ? 'text-white/60' : 'text-slate-400'}`} />
        </div>

        <input
          type="text"
          placeholder="Villa, terrain, véhicule, quartier…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setMobileFocused(true)}
          onBlur={() => setMobileFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleSearchSubmit(); }
          }}
          className={`flex-1 bg-transparent text-sm font-semibold outline-none min-w-0 ${
            isGlass ? 'text-white placeholder:text-white/40' : 'text-slate-900 placeholder:text-slate-400'
          }`}
        />

        {/* Clear button */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className={`shrink-0 p-1 rounded-full transition-all cursor-pointer ${
              isGlass ? 'text-white/50 hover:text-white hover:bg-white/15' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Submit arrow button */}
        <button
          type="button"
          onClick={() => handleSearchSubmit()}
          className="shrink-0 w-9 h-9 rounded-xl bg-kawral-orange flex items-center justify-center shadow-md hover:bg-orange-500 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Live match badge */}
      <div className="flex items-center justify-between mt-2 px-1">
        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${isGlass ? 'text-white/60' : 'text-slate-400'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span>{matchCount} bien{matchCount > 1 ? 's' : ''} en direct</span>
        </div>
        {(searchQuery || locationQuery || category) && (
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setLocationQuery(''); setCategory(''); }}
            className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
              isGlass ? 'text-kawral-orange/80 hover:text-kawral-orange' : 'text-kawral-orange hover:text-orange-500'
            }`}
          >
            <X className="w-3 h-3" /> Effacer
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {MobileSearchBar}
    <form
      onSubmit={handleSearchSubmit}
      className={`hidden md:block rounded-3xl p-3.5 sm:p-4 transition-all duration-300 relative ${formBaseClasses} ${className}`}
    >
      {/* Immersive Top Bar: Segmented Transaction Pills & Match Count */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 px-0.5">
        <div className={topBarContainerClass}>
          <button
            type="button"
            onClick={() => handleSelectTransaction('all')}
            className={pillClass(transactionType === 'all')}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tous</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTransaction('sale')}
            className={pillClass(transactionType === 'sale')}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Acheter</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTransaction('rent')}
            className={pillClass(transactionType === 'rent', true)}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Louer</span>
          </button>
        </div>

        {/* Dynamic Match Count Indicator & Clear Button */}
        <div className="flex items-center gap-3">
          <div className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
            isGlass ? 'bg-white/10 text-emerald-300' : 'bg-emerald-50 text-kawral-green border border-emerald-200/60'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{matchCount} bien{matchCount > 1 ? 's' : ''} en direct</span>
          </div>

          {(searchQuery || locationQuery || category) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setLocationQuery('');
                setCategory('');
              }}
              className="text-xs font-bold text-kawral-orange hover:text-orange-400 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              title="Réinitialiser les critères"
            >
              <X className="w-3.5 h-3.5" />
              <span>Effacer</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Smart Input Fields with Instant Live Search */}
      <div className={`grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 items-center rounded-2xl ${
        isGlass ? 'bg-black/25 backdrop-blur-md border border-white/10' : 'bg-slate-50/90 border border-slate-200/70'
      }`}>
        
        {/* Field 1: Que recherchez-vous ? (Live Search with Lucide Icons) */}
        <div
          ref={searchContainerRef}
          className={`relative md:col-span-4 px-4 py-3 rounded-2xl md:rounded-r-none md:border-r transition-all duration-200 ${
            isGlass ? 'hover:bg-white/5 focus-within:bg-white/10' : 'hover:bg-white focus-within:bg-white focus-within:shadow-xs'
          } ${dividerColor}`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase tracking-wider block ${labelColor}`}>
              Que recherchez-vous ?
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer p-0.5"
                title="Effacer ce champ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <Search className="w-4 h-4 text-kawral-orange shrink-0" />
            <input
              type="text"
              placeholder="Villa, appartement, piscine..."
              value={searchQuery}
              onFocus={() => setShowSearchSuggestions(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-transparent text-xs sm:text-sm font-bold outline-none ${inputTextColor} ${placeholderColor}`}
            />
          </div>

          {/* Search Suggestions Dropdown with Pure Lucide Icons */}
          {showSearchSuggestions && (
            <div className={`absolute left-0 top-full mt-2.5 w-full sm:w-88 rounded-3xl p-3.5 z-50 animate-fade-in ${dropdownBg}`}>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-kawral-orange flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Suggestions tendance
                </p>
                <span className="text-[10px] font-semibold text-slate-400">1 clic</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {POPULAR_SEARCHES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.text}
                      type="button"
                      onClick={() => handleSelectSearchPreset(item.text)}
                      className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold text-left transition-all cursor-pointer ${
                        isGlass
                          ? 'hover:bg-white/15 text-white'
                          : 'hover:bg-emerald-50 text-slate-800 hover:text-kawral-green'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-kawral-green/15 flex items-center justify-center text-kawral-green shrink-0">
                          <Icon className="w-3.5 h-3.5 text-kawral-orange" />
                        </div>
                        <span>{item.text}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-black/10 px-2 py-0.5 rounded-full">
                        {item.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Field 2: Où ? (Localisation live & Lucide badges) */}
        <div
          ref={locationContainerRef}
          className={`relative md:col-span-3 px-4 py-3 rounded-2xl md:rounded-none md:border-r transition-all duration-200 ${
            isGlass ? 'hover:bg-white/5 focus-within:bg-white/10' : 'hover:bg-white focus-within:bg-white focus-within:shadow-xs'
          } ${dividerColor}`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase tracking-wider block ${labelColor}`}>
              Où ?
            </span>
            {locationQuery && (
              <button
                type="button"
                onClick={() => setLocationQuery('')}
                className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer p-0.5"
                title="Effacer ce champ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <MapPin className="w-4 h-4 text-kawral-green shrink-0" />
            <input
              type="text"
              placeholder="Almadies, Mermoz, Saly..."
              value={locationQuery}
              onFocus={() => setShowLocationSuggestions(true)}
              onChange={(e) => setLocationQuery(e.target.value)}
              className={`w-full bg-transparent text-xs sm:text-sm font-bold outline-none ${inputTextColor} ${placeholderColor}`}
            />
          </div>

          {/* Location Suggestions Dropdown — données dynamiques de la DB */}
          {showLocationSuggestions && (
            <div className={`absolute left-0 top-full mt-2.5 w-full sm:w-88 rounded-3xl p-3.5 z-50 animate-fade-in ${dropdownBg}`}>
              <div className="flex items-center justify-between mb-2.5 px-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-kawral-green flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-kawral-orange" /> Villes & Quartiers disponibles
                </p>
                <span className="text-[10px] font-semibold text-slate-400">Base de données</span>
              </div>
              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto scrollbar-none">
                {isLoadingLocations ? (
                  <div className="flex items-center gap-2 px-3 py-3 text-xs text-kawral-muted">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Chargement des localisations...</span>
                  </div>
                ) : locations.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-slate-400 italic">Aucune localisation en base</p>
                ) : (
                  locations
                    .filter((loc) =>
                      !locationQuery.trim() ||
                      loc.label.toLowerCase().includes(locationQuery.toLowerCase())
                    )
                    .map((loc) => (
                      <button
                        key={loc.label}
                        type="button"
                        onClick={() => handleSelectLocation(loc.label)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                          locationQuery.toLowerCase() === loc.label.toLowerCase()
                            ? 'bg-kawral-green text-white font-bold'
                            : isGlass
                              ? 'hover:bg-white/15 text-white'
                              : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${locationQuery.toLowerCase() === loc.label.toLowerCase() ? 'text-white' : 'text-kawral-orange'}`} />
                          <span>{loc.label}</span>
                        </div>
                        <span className="text-[10px] opacity-70">{loc.group}</span>
                      </button>
                    ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Field 3: Catégorie avec Lucide Icons */}
        <div className={`md:col-span-3 px-4 py-3 rounded-2xl md:rounded-none md:border-r transition-all duration-200 ${
          isGlass ? 'hover:bg-white/5 focus-within:bg-white/10' : 'hover:bg-white focus-within:bg-white focus-within:shadow-xs'
        } ${dividerColor}`}>
          <span className={`text-[10px] uppercase tracking-wider mb-1 block ${labelColor}`}>
            Catégorie
          </span>
          <div className="flex items-center gap-2.5 mt-1">
            <SlidersHorizontal className="w-4 h-4 text-kawral-orange shrink-0" />
            <select
              value={category}
              onChange={(e) => handleSelectCategory(e.target.value)}
              className={`w-full min-w-0 max-w-full truncate bg-transparent text-xs sm:text-sm font-bold outline-none cursor-pointer ${inputTextColor}`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="text-slate-900 bg-white font-semibold">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit / Navigation Action Button */}
        <div className="md:col-span-2 p-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="!rounded-2xl shadow-xl hover:shadow-2xl py-3.5 sm:py-4 text-xs font-black uppercase tracking-wider transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explorer</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

      </div>
    </form>
    </>
  );
};
