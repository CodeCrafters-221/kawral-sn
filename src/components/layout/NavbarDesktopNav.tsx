import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Home, MapPin, Car, Building2, Tag, Key, Users } from 'lucide-react';

interface NavbarDesktopNavProps {
  currentView: string;
  currentUser: any;
  onNavigateToCategory: (category: string, transactionType: 'sale' | 'rent' | 'all') => void;
  onNavigateTo: (view: string) => void;
  isTransparent?: boolean;
}

const CATEGORIES = [
  {
    icon: Home,
    label: 'Immobilier',
    description: 'Maisons & appartements',
    color: 'text-kawral-green',
    bg: 'bg-kawral-green/10',
    actions: [
      { label: 'Acheter', icon: Tag, onClick: (nav: any) => nav('', 'sale') },
      { label: 'Louer', icon: Key, onClick: (nav: any) => nav('', 'rent') },
    ],
  },
  {
    icon: MapPin,
    label: 'Terrains',
    description: 'Parcelles & lotissements',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    actions: [
      { label: 'Tous les terrains', icon: MapPin, onClick: (nav: any) => nav('land', 'all') },
    ],
  },
  {
    icon: Car,
    label: 'Véhicules',
    description: 'Voitures & motos',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    actions: [
      { label: 'Acheter', icon: Tag, onClick: (nav: any) => nav('vehicle', 'sale') },
      { label: 'Louer', icon: Key, onClick: (nav: any) => nav('vehicle', 'rent') },
    ],
  },
  {
    icon: Building2,
    label: 'Locaux',
    description: 'Bureaux & commerces',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    actions: [
      { label: 'Acheter', icon: Tag, onClick: (nav: any) => nav('commercial', 'sale') },
      { label: 'Louer', icon: Key, onClick: (nav: any) => nav('commercial', 'rent') },
    ],
  },
];

export const NavbarDesktopNav: React.FC<NavbarDesktopNavProps> = ({
  currentView,
  currentUser,
  onNavigateToCategory,
  onNavigateTo,
  isTransparent = false,
}) => {
  const isSeller = currentUser?.role === 'seller';
  const [exploreOpen, setExploreOpen] = useState(false);
  const [hovered, setHovered] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const baseText = isTransparent
    ? 'text-white hover:text-kawral-orange'
    : 'text-kawral-dark hover:text-kawral-green';
  const activeText = isTransparent
    ? 'text-kawral-orange font-bold'
    : 'text-kawral-green font-bold';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const active = CATEGORIES[hovered];
  const ActiveIcon = active.icon;

  return (
    <nav className="hidden lg:flex items-center gap-6 text-[15px] font-medium">
      {isSeller && (
        <button
          onClick={() => onNavigateTo('seller-dashboard')}
          className={`transition-colors duration-500 ease-in-out cursor-pointer ${
            currentView.includes('dashboard') ? activeText : baseText
          }`}
        >
          Mon espace vendeur
        </button>
      )}

      {/* Mega-menu Explorer */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setExploreOpen((o) => !o)}
          className={`flex items-center gap-1.5 transition-colors duration-300 ease-in-out cursor-pointer ${
            currentView === 'search' ? activeText : baseText
          }`}
        >
          <span>Explorer</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${exploreOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {exploreOpen && (
          <div className="absolute left-0 top-full mt-3 w-[520px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex"
            style={{ animation: 'fadeSlideDown 0.18s ease-out' }}>

            {/* Left: category list */}
            <div className="w-[200px] bg-kawral-ivory/60 py-3 flex flex-col gap-0.5 border-r border-slate-100">
              {CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.label}
                    onMouseEnter={() => setHovered(i)}
                    onClick={() => {
                      if (cat.actions.length === 1) {
                        cat.actions[0].onClick(onNavigateToCategory);
                        setExploreOpen(false);
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                      hovered === i
                        ? 'bg-white shadow-sm text-kawral-dark'
                        : 'text-slate-500 hover:text-kawral-dark'
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg ${cat.bg}`}>
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                    </span>
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Right: detail panel */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${active.bg} mb-3`}>
                  <ActiveIcon className={`w-4 h-4 ${active.color}`} />
                  <span className={`text-sm font-semibold ${active.color}`}>{active.label}</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">{active.description}</p>

                <div className="flex flex-col gap-2">
                  {active.actions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.label}
                        onClick={() => {
                          action.onClick(onNavigateToCategory);
                          setExploreOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:border-kawral-green/30 hover:bg-kawral-ivory text-sm font-medium text-kawral-dark transition-all duration-150 cursor-pointer group"
                      >
                        <ActionIcon className="w-4 h-4 text-slate-400 group-hover:text-kawral-green transition-colors" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer shortcut */}
              <button
                onClick={() => { onNavigateToCategory('', 'all'); setExploreOpen(false); }}
                className="mt-5 text-xs text-slate-400 hover:text-kawral-green transition-colors text-left cursor-pointer"
              >
                Voir toutes les annonces →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
};
