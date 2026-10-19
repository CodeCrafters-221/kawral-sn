import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { KawralLogo } from "./KawralLogo";
import { NavbarSearchBar } from "./NavbarSearchBar";
import { NavbarCategoriesBar } from "./NavbarCategoriesBar";
import { NavbarActionBar } from "./NavbarActionBar";
import { NavbarMobileMenu } from "./NavbarMobileMenu";
import { MobileHelpBottomSheet } from "./mobile/MobileHelpBottomSheet";
import { SupabaseSettingsModal } from "../modals/SupabaseSettingsModal";
import { ProfileSettingsModal } from "../modals/ProfileSettingsModal";

export const Navbar: React.FC = () => {
  const {
    currentUser,
    favorites,
    conversations,
    appointments,
    listings,
    reports,
    setAuthModalOpen,
    setAuthModalMode,
    currentView,
    setCurrentView,
    setFilters,
    switchRole,
    addToast,
    setOnboardingModalOpen,
    setBecomeSellerModalOpen,
  } = useApp();

  const { signOut } = useAuth();
  const location = useLocation();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpSheetOpen, setHelpSheetOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);

  // Fermer le menu burger automatiquement lors d'un changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Bloquer le défilement de l'arrière-plan lorsque le menu burger est ouvert sur mobile
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // La page d'accueil est active si currentView === 'home' ET location.pathname === '/'
  const isHomePage = currentView === "home" && location.pathname === "/";

  // Détection dynamique et réactive du scroll par rapport au Hero
  useEffect(() => {
    if (!isHomePage) {
      setIsPastHero(true);
      return;
    }

    const checkHeroVisibility = () => {
      const heroElement = document.getElementById("hero-section");
      if (heroElement) {
        const rect = heroElement.getBoundingClientRect();
        // Le header passe au blanc dès que le bas du Hero s'approche du header (~110px)
        setIsPastHero(rect.bottom <= 110);
      } else {
        // Fallback si l'élément n'est pas encore rendu
        setIsPastHero(window.scrollY > 450);
      }
    };

    // Vérification initiale
    checkHeroVisibility();

    // Utilisation d'un IntersectionObserver pour une réactivité optimale sans polling
    const sentinel = document.getElementById("hero-sentinel");
    let observer: IntersectionObserver | null = null;

    if (sentinel && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Si la sentinelle est visible ou en dessous du viewport -> on est dans le Hero
            // Si la sentinelle est sortie par le haut -> on a dépassé le Hero
            const isAboveViewport = entry.boundingClientRect.top < 110;
            setIsPastHero(isAboveViewport);
          });
        },
        { rootMargin: "-110px 0px 0px 0px", threshold: [0, 1] }
      );
      observer.observe(sentinel);
    }

    window.addEventListener("scroll", checkHeroVisibility, { passive: true });
    window.addEventListener("resize", checkHeroVisibility, { passive: true });

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("scroll", checkHeroVisibility);
      window.removeEventListener("resize", checkHeroVisibility);
    };
  }, [isHomePage, location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.warn("SignOut error:", err);
    }
    switchRole("visitor");
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    addToast("Vous avez été déconnecté avec succès.", "info");
    setCurrentView("home");
  };

  useEffect(() => {
    const handleOpenProfileSettings = () => setProfileSettingsOpen(true);
    document.addEventListener("open-profile-settings", handleOpenProfileSettings);
    return () =>
      document.removeEventListener("open-profile-settings", handleOpenProfileSettings);
  }, []);

  const unreadMessagesCount = conversations.reduce(
    (total, conversation) =>
      total + (conversation.unreadCount ?? (conversation.unread ? 1 : 0)),
    0
  );

  const pendingAppointmentsCount = appointments.filter(
    (a) => a.status === "pending"
  ).length;

  const pendingModerationCount =
    currentUser?.role === "admin"
      ? listings.filter((l) => l.status === "draft").length + reports.length
      : 0;

  const navigateToCategory = (
    category: string,
    transactionType: "sale" | "rent" | "all" = "all"
  ) => {
    setFilters((prev) => ({
      ...prev,
      category,
      transactionType,
    }));
    setCurrentView("search");
    setMobileMenuOpen(false);
  };

  const handlePublishClick = () => {
    if (!currentUser) {
      setAuthModalMode("login");
      setAuthModalOpen(true);
    } else if (currentUser.role === "client") {
      setBecomeSellerModalOpen(true);
    } else {
      setCurrentView("create-listing");
    }
    setMobileMenuOpen(false);
  };

  const getDashboardViewForRole = () => {
    if (!currentUser) return "client-dashboard";
    switch (currentUser.role) {
      case "seller":
        return "seller-dashboard";
      case "admin":
        return "admin-dashboard";
      default:
        return "client-dashboard";
    }
  };

  // État sombre actif uniquement sur la home tant qu'on n'a pas dépassé le Hero et que le menu mobile est fermé
  const isDark = isHomePage && !isPastHero;
  const headerIsDark = isDark && !mobileMenuOpen;

  // Masquer complètement le header sur la carte détail de l'annonce sur tous les appareils
  const isListingDetailPage =
    currentView === "listing-detail" ||
    location.pathname.startsWith("/listings/") ||
    location.pathname.startsWith("/annonces/") ||
    location.pathname.startsWith("/annonce/");

  if (isListingDetailPage) {
    return null;
  }

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
         HEADER STICKY UNIFIÉ : PLEINE LARGEUR & TRANSITION INTELLIGENTE AU SCROLL
         - Au-dessus du Hero (menu fermé) : fond sombre semi-transparent glassmorphism
         - Après le Hero, hors accueil ou menu mobile ouvert : fond blanc pur net
         ══════════════════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 w-full transition-colors duration-200 ease-in-out ${
          mobileMenuOpen ? "z-[60]" : "z-50"
        } ${
          headerIsDark
            ? "bg-[#0e212b]/85 backdrop-blur-md border-b border-white/10 text-white shadow-sm"
            : "bg-white border-b border-slate-200/90 text-slate-800 shadow-xs"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── PREMIÈRE LIGNE : LOGO + RECHERCHE CENTRALE + ACCÈS RAPIDES + BOUTON PUBLIER ── */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-6 h-16 sm:h-18">
            {/* A. Logo Kawral cliquable */}
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentView("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="cursor-pointer shrink-0 transition-transform duration-200 active:scale-95"
            >
              <KawralLogo
                size="md"
                showTagline={false}
                variant={headerIsDark ? "dark" : "light"}
              />
            </div>

            {/* B. Barre de recherche centrale (Desktop & Tablette — masquée sur mobile/tablette si le menu burger est ouvert) */}
            <div
              className={`${
                mobileMenuOpen ? "hidden lg:flex" : "hidden sm:flex"
              } flex-1 max-w-2xl mx-2 lg:mx-6 justify-center`}
            >
              <NavbarSearchBar isDark={headerIsDark} />
            </div>

            {/* C & D. Icônes d'accès rapide + Bouton Publier une annonce */}
            <NavbarActionBar
              currentUser={currentUser}
              conversations={conversations}
              appointments={appointments}
              favorites={favorites}
              unreadMessagesCount={unreadMessagesCount}
              pendingAppointmentsCount={pendingAppointmentsCount}
              pendingModerationCount={pendingModerationCount}
              isUserDropdownOpen={userDropdownOpen}
              onToggleUserDropdown={() => setUserDropdownOpen(!userDropdownOpen)}
              onNavigateTo={setCurrentView}
              onPublishClick={handlePublishClick}
              onLoginClick={() => {
                setAuthModalMode("login");
                setAuthModalOpen(true);
              }}
              onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
              isMobileMenuOpen={mobileMenuOpen}
              onLogout={handleLogout}
              getDashboardViewForRole={getDashboardViewForRole}
              onOpenProfileSettings={() => setProfileSettingsOpen(true)}
              onOpenOnboarding={() => setOnboardingModalOpen(true)}
              isTransparent={headerIsDark}
            />
          </div>

          {/* Recherche mobile (< sm) : masquée lorsque le menu burger est ouvert */}
          {!mobileMenuOpen && (
            <div className="sm:hidden pb-2.5 pt-0.5">
              <NavbarSearchBar isDark={isDark} />
            </div>
          )}
        </div>

        {/* ── DEUXIÈME LIGNE : LES HUIT CATÉGORIES PRINCIPALES (masquée sur mobile/tablette lorsque le menu burger est ouvert) ── */}
        <div className={mobileMenuOpen ? "hidden lg:block" : "block"}>
          <NavbarCategoriesBar
            isDark={headerIsDark}
            onNavigateToCategory={(catSlug) => navigateToCategory(catSlug, "all")}
          />
        </div>
      </header>

      {/* Menu mobile plein écran sous l'en-tête */}
      <NavbarMobileMenu
        isOpen={mobileMenuOpen}
        currentUser={currentUser}
        onClose={() => setMobileMenuOpen(false)}
        onLoginClick={() => {
          setAuthModalMode("login");
          setAuthModalOpen(true);
        }}
        onRegisterClick={() => {
          setAuthModalMode("register");
          setAuthModalOpen(true);
        }}
        onOpenHelp={() => setHelpSheetOpen(true)}
      />

      {/* Panneau Aide & Informations (accessible depuis le menu burger) */}
      <MobileHelpBottomSheet
        isOpen={helpSheetOpen}
        onClose={() => setHelpSheetOpen(false)}
      />

      {/* Modales de configuration & profil */}
      <SupabaseSettingsModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

      <ProfileSettingsModal
        isOpen={profileSettingsOpen}
        onClose={() => setProfileSettingsOpen(false)}
      />
    </>
  );
};
