import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface NavbarSearchBarProps {
  className?: string;
  isDark?: boolean;
}

export const NavbarSearchBar: React.FC<NavbarSearchBarProps> = ({
  className = "",
  isDark = false,
}) => {
  const { filters, setFilters, setCurrentView, currentView } = useApp();
  const [query, setQuery] = useState(filters.search || "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal query state with filters context
  useEffect(() => {
    setQuery(filters.search || "");
  }, [filters.search]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = query.trim();

    setFilters((prev) => ({
      ...prev,
      search: clean,
    }));

    if (currentView !== "search") {
      setCurrentView("search");
    }
  };

  const handleClear = () => {
    setQuery("");
    setFilters((prev) => ({
      ...prev,
      search: "",
    }));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  const formThemeClass = isDark
    ? "bg-white/10 hover:bg-white/15 focus-within:bg-white/15 border-white/20 hover:border-white/35 focus-within:border-kawral-orange focus-within:ring-3 focus-within:ring-kawral-orange/25 text-white"
    : "bg-white border-slate-200/90 hover:border-slate-300 focus-within:border-kawral-orange focus-within:ring-3 focus-within:ring-kawral-orange/15 text-slate-800";

  const inputThemeClass = isDark
    ? "text-white placeholder:text-white/60"
    : "text-slate-800 placeholder:text-slate-400";

  const iconThemeClass = isDark ? "text-white/70" : "text-slate-400";

  const clearBtnThemeClass = isDark
    ? "text-white/60 hover:text-white hover:bg-white/10"
    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100";

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`relative flex items-center w-full max-w-2xl border rounded-xl sm:rounded-2xl shadow-xs transition-all duration-200 overflow-hidden ${formThemeClass} ${className}`}
    >
      {/* Search leading icon */}
      <div className={`pl-3.5 pr-2 flex items-center justify-center pointer-events-none ${iconThemeClass}`}>
        <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
      </div>

      {/* Input element */}
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Rechercher un bien, un véhicule, du matériel…"
        aria-label="Rechercher un bien, un véhicule, du matériel"
        className={`w-full py-2.5 sm:py-2.5 pr-2 text-xs sm:text-sm font-medium placeholder:font-normal bg-transparent border-none outline-none focus:outline-none focus:ring-0 leading-normal ${inputThemeClass}`}
      />

      {/* Clear button if text entered */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Effacer la recherche"
          className={`p-1 mr-1 rounded-full transition-colors cursor-pointer ${clearBtnThemeClass}`}
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}

      {/* Orange search submit button inspired by Leboncoin / Kawral identity */}
      <button
        type="submit"
        aria-label="Lancer la recherche"
        className="m-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-kawral-orange hover:bg-kawral-orange-hover text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ease-out hover:scale-[1.02] active:scale-95 hover:brightness-105 shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
      >
        <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
        <span className="hidden md:inline font-bold">Rechercher</span>
      </button>
    </form>
  );
};
