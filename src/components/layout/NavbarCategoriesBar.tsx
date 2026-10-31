import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MAIN_CATEGORIES_CATALOG,
  MainCategoryItem,
  SubCategoryItem,
  findParentMainCategory,
} from "../../data/categoriesData";
import { useApp } from "../../context/AppContext";
import { ArrowRight } from "lucide-react";

interface NavbarCategoriesBarProps {
  onNavigateToCategory: (categorySlug: string) => void;
  className?: string;
  isDark?: boolean;
}

export const NavbarCategoriesBar: React.FC<NavbarCategoriesBarProps> = ({
  onNavigateToCategory,
  className = "",
  isDark = false,
}) => {
  const { filters } = useApp();
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(
    null
  );
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout>>({} as any);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine which category is currently selected in app filters
  const selectedParent = findParentMainCategory(filters.category);
  const currentFilteredMainSlug = selectedParent
    ? selectedParent.slug
    : filters.category?.toLowerCase() || null;

  // Clear pending close timer
  const cancelCloseTimer = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null as any;
    }
  }, []);

  // Schedule flyout closure with a comfortable debounce (180ms)
  const scheduleClose = useCallback(() => {
    cancelCloseTimer();
    leaveTimerRef.current = setTimeout(() => {
      setActiveCategorySlug(null);
    }, 180);
  }, [cancelCloseTimer]);

  // Immediate opening on category hover or focus
  const handleCategoryHover = (slug: string) => {
    cancelCloseTimer();
    setActiveCategorySlug(slug);
  };

  // Immediate close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveCategorySlug(null);
        cancelCloseTimer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cancelCloseTimer]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setActiveCategorySlug(null);
        cancelCloseTimer();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cancelCloseTimer]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => cancelCloseTimer();
  }, [cancelCloseTimer]);

  const activeCategory: MainCategoryItem | undefined =
    MAIN_CATEGORIES_CATALOG.find((c) => c.slug === activeCategorySlug);

  const handleSelectCategory = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    setActiveCategorySlug(null);
    cancelCloseTimer();
    onNavigateToCategory(slug);
  };

  const containerBorderClass = isDark
    ? "border-t border-white/10 bg-transparent"
    : "border-t border-slate-100 bg-white/95";

  return (
    <div
      ref={containerRef}
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelCloseTimer}
      className={`relative w-full select-none transition-colors duration-200 ${containerBorderClass} ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        {/* Navigation horizontal row (desktop & tablet) */}
        <nav
          role="navigation"
          aria-label="Catégories principales"
          className="flex items-center justify-between overflow-x-auto scrollbar-none py-1.5 sm:py-2 gap-1 md:gap-2"
        >
          {MAIN_CATEGORIES_CATALOG.map((cat) => {
            const isHovered = activeCategorySlug === cat.slug;
            const isSelected = currentFilteredMainSlug === cat.slug;

            const buttonThemeClass = isDark
              ? isSelected
                ? "text-kawral-orange font-bold bg-white/15"
                : isHovered
                  ? "text-white bg-white/15"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              : isSelected
                ? "text-kawral-green font-bold bg-emerald-50/80"
                : isHovered
                  ? "text-kawral-green bg-slate-50"
                  : "text-slate-700 hover:text-kawral-green hover:bg-slate-50/80";

            const indicatorColor = isDark ? "bg-kawral-orange" : "bg-kawral-green";

            return (
              <div
                key={cat.slug}
                className="relative shrink-0"
                onMouseEnter={() => handleCategoryHover(cat.slug)}
              >
                <Link
                  to={`/categories/${cat.slug}`}
                  onClick={(e) => handleSelectCategory(e, cat.slug)}
                  onFocus={() => handleCategoryHover(cat.slug)}
                  aria-expanded={isHovered}
                  aria-haspopup="true"
                  className={`relative inline-block no-underline px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold tracking-tight transition-all duration-200 ease-out active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-kawral-orange/40 ${buttonThemeClass}`}
                >
                  {/* ABSOLUTE RULE: NO ARROWS, NO CHEVRONS, JUST THE PURE LABEL */}
                  <span>{cat.label}</span>

                  {/* Active indicator bar */}
                  {isSelected && (
                    <span
                      className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${indicatorColor}`}
                    />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Index SEO complet des sous-catégories pour les moteurs de recherche (Mobile-First & Desktop) */}
        <nav aria-label="Toutes les sous-catégories Kawral" className="sr-only">
          <ul>
            {MAIN_CATEGORIES_CATALOG.map((cat) => (
              <li key={cat.slug}>
                <Link to={`/categories/${cat.slug}`}>{cat.label} au Sénégal</Link>
                <ul>
                  {cat.subcategories.map((sub) => (
                    <li key={sub.slug}>
                      <Link to={`/categories/${sub.slug}`}>{sub.label} au Sénégal</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bridge buffer area so pointer never leaves container moving to the panel */}
      {activeCategory && (
        <div
          onMouseEnter={cancelCloseTimer}
          onMouseLeave={scheduleClose}
          className="absolute left-0 right-0 top-full z-50 pt-1 pointer-events-auto"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
            <div
              role="region"
              aria-label={`Sous-catégories de ${activeCategory.label}`}
              className={`rounded-2xl shadow-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-top-1 duration-150 ${
                isDark
                  ? "bg-[#142832]/95 backdrop-blur-2xl border border-white/15 text-white"
                  : "bg-white border border-slate-200/80 shadow-xl text-slate-900"
              }`}
            >
              {/* Top banner: Category header + "Toutes les annonces" CTA */}
              <div
                className={`flex items-center justify-between pb-4 mb-4 border-b ${
                  isDark ? "border-white/10" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`p-2 rounded-xl ${
                      isDark
                        ? "bg-white/10 text-kawral-orange"
                        : "bg-emerald-50 text-kawral-green"
                    }`}
                  >
                    <activeCategory.icon className="w-5 h-5" />
                  </span>
                  <div>
                    <h3
                      className={`text-sm font-bold leading-tight ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {activeCategory.label}
                    </h3>
                    {activeCategory.description && (
                      <p
                        className={`text-[11px] ${
                          isDark ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {activeCategory.description}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  to={`/categories/${activeCategory.slug}`}
                  onClick={(e) => handleSelectCategory(e, activeCategory.slug)}
                  className="flex items-center gap-1.5 text-xs font-bold text-kawral-orange hover:text-kawral-orange-hover hover:underline transition-colors cursor-pointer group"
                >
                  <span>Toutes les annonces en {activeCategory.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Multi-column grid of subcategories */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                {activeCategory.subcategories.map((sub: SubCategoryItem) => {
                  const SubIcon = sub.icon;
                  const isCurrentSub =
                    filters.category?.toLowerCase() === sub.slug;

                  const subItemClass = isDark
                    ? isCurrentSub
                      ? "bg-white/20 text-white font-bold shadow-xs border border-white/30"
                      : "text-slate-200 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                    : isCurrentSub
                      ? "bg-emerald-50 text-kawral-green font-bold shadow-xs border border-emerald-200"
                      : "text-slate-700 hover:text-kawral-green hover:bg-slate-50 border border-transparent hover:border-slate-100";

                  const subIconBoxClass = isDark
                    ? "bg-white/10 text-white/80 group-hover:text-kawral-orange group-hover:bg-white/15"
                    : "bg-slate-100/70 text-slate-600 group-hover:text-kawral-green group-hover:bg-emerald-50";

                  return (
                    <Link
                      key={sub.slug}
                      to={`/categories/${sub.slug}`}
                      onClick={(e) => handleSelectCategory(e, sub.slug)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left no-underline transition-all duration-150 cursor-pointer group ${subItemClass}`}
                    >
                      <span
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${subIconBoxClass}`}
                      >
                        <SubIcon className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-medium leading-tight line-clamp-1 transition-colors">
                        {sub.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
