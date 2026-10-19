import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowUpDown,
  ChevronDown,
  Check,
  X,
  Clock,
  TrendingDown,
  TrendingUp,
  Flame,
} from 'lucide-react';
import type { SortOption } from '../../types';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

interface SortItemConfig {
  value: SortOption;
  label: string;
  description: string;
  icon: React.ElementType;
}

const SORT_OPTIONS: SortItemConfig[] = [
  {
    value: 'recent',
    label: 'Plus récentes',
    description: 'Dernières annonces publiées',
    icon: Clock,
  },
  {
    value: 'price_asc',
    label: 'Prix croissant',
    description: 'Du moins cher au plus cher',
    icon: TrendingDown,
  },
  {
    value: 'price_desc',
    label: 'Prix décroissant',
    description: 'Du plus cher au moins cher',
    icon: TrendingUp,
  },
  {
    value: 'popular',
    label: 'Plus populaires',
    description: 'Les annonces les plus consultées',
    icon: Flame,
  },
];

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileSheetRef = useRef<HTMLDivElement>(null);

  const activeOption =
    SORT_OPTIONS.find((opt) => opt.value === value) || SORT_OPTIONS[0];

  // Fermeture au clic extérieur et touche Échap (Desktop)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Ne pas fermer si le clic est dans le menu desktop ou dans le tiroir mobile
      if (
        (dropdownRef.current && dropdownRef.current.contains(target)) ||
        (mobileSheetRef.current && mobileSheetRef.current.contains(target))
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Verrouiller le scroll d'arrière-plan sur mobile quand le tiroir est ouvert
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleSelect = (sortValue: SortOption) => {
    onChange(sortValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* ── Desktop Trigger ── */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
          Trier par :
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="h-9 px-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
        >
          <span>{activeOption.label}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* ── Mobile Trigger ── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`sm:hidden h-9 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer ${
          value !== 'recent'
            ? 'bg-emerald-50 border-emerald-200 text-kawral-green'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
        }`}
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span className="max-w-[110px] truncate">{activeOption.label}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {/* ── Desktop Floating Popover Menu ── */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Options de tri"
          className="hidden sm:block absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-40 animate-fade-in"
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Ordre d'affichage
            </p>
          </div>
          <div className="py-1 space-y-0.5">
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-kawral-green font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-kawral-green text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-kawral-green shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Sheet Drawer (Porté sur document.body pour coller au bas de l'écran visible) ── */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="sm:hidden fixed inset-0 z-[100] flex items-end">
            {/* Backdrop avec flou */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Tiroir coulissant du bas */}
            <div
              ref={mobileSheetRef}
              role="dialog"
              aria-modal="true"
              aria-label="Trier les annonces"
              className="relative w-full bg-white rounded-t-3xl p-5 shadow-2xl z-10 animate-slide-up border-t border-slate-200"
              style={{
                paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
              }}
            >
              {/* Poignée tactile */}
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Trier les annonces
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choisissez l'ordre d'affichage des résultats
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fermer"
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 pt-3">
                {SORT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-emerald-50 text-kawral-green font-bold border-2 border-kawral-green/40 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-kawral-green text-white shadow-xs'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold leading-tight">
                            {opt.label}
                          </p>
                          <p className="text-xs text-slate-500 font-medium leading-tight mt-1">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-kawral-green text-white flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
