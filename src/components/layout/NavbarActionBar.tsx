import React from "react";
import {
  PlusCircle,
  MessageSquare,
  Heart,
  Bell,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { Avatar } from "../ui";
import { NavbarUserDropdown } from "./NavbarUserDropdown";

interface NavbarActionBarProps {
  currentUser: any;
  conversations: any[];
  appointments: any[];
  favorites: any[];
  unreadMessagesCount: number;
  pendingAppointmentsCount: number;
  pendingModerationCount?: number;
  isUserDropdownOpen: boolean;
  onToggleUserDropdown: () => void;
  onNavigateTo: (view: string) => void;
  onPublishClick: () => void;
  onLoginClick: () => void;
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  onLogout: () => void;
  getDashboardViewForRole: () => string;
  onOpenProfileSettings: () => void;
  onOpenOnboarding: () => void;
  isTransparent?: boolean;
}

export const NavbarActionBar: React.FC<NavbarActionBarProps> = ({
  currentUser,
  conversations: _conversations,
  appointments: _appointments,
  favorites,
  unreadMessagesCount,
  pendingAppointmentsCount,
  pendingModerationCount = 0,
  isUserDropdownOpen,
  onToggleUserDropdown,
  onNavigateTo,
  onPublishClick,
  onLoginClick,
  onMobileMenuToggle,
  isMobileMenuOpen,
  onLogout,
  getDashboardViewForRole,
  onOpenProfileSettings,
  onOpenOnboarding,
  isTransparent = false,
}) => {
  const iconBaseClass = isTransparent
    ? "text-white/90 hover:text-white hover:bg-white/10"
    : "text-slate-600 hover:text-kawral-green hover:bg-slate-100/80";

  const userDropdownClass = isTransparent
    ? "border-white/20 hover:border-white/50 bg-white/10 backdrop-blur-md"
    : "border-slate-200/90 hover:border-kawral-green/60 bg-white hover:bg-slate-50";

  const userNameClass = isTransparent ? "text-white" : "text-slate-800";

  // Notification count: admin moderation or client/seller appointments
  const notificationsCount =
    currentUser?.role === "admin"
      ? pendingModerationCount
      : pendingAppointmentsCount;

  const handleNotificationsClick = () => {
    if (!currentUser) {
      onLoginClick();
      return;
    }
    if (currentUser.role === "admin") {
      onNavigateTo("admin-dashboard");
    } else {
      onNavigateTo("appointments");
    }
  };

  const handleFavoritesClick = () => {
    if (!currentUser) {
      onLoginClick();
      return;
    }
    onNavigateTo("favorites");
  };

  const handleMessagesClick = () => {
    if (!currentUser) {
      onLoginClick();
      return;
    }
    onNavigateTo("messaging");
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 xl:gap-4 shrink-0">
      {/* ── Desktop Quick Access Icons (Hidden on mobile) ── */}
      <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
        {/* 1. Notifications (Bell) */}
        <button
          type="button"
          onClick={handleNotificationsClick}
          className={`relative p-2 rounded-xl transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer ${iconBaseClass}`}
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notificationsCount > 0 && (
            <span className="absolute top-1 right-1 bg-kawral-orange text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
              {notificationsCount}
            </span>
          )}
        </button>

        {/* 2. Favoris (Heart) */}
        <button
          type="button"
          onClick={handleFavoritesClick}
          className={`relative p-2 rounded-xl transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer ${iconBaseClass}`}
          title="Mes favoris"
          aria-label="Mes favoris"
        >
          <Heart className="w-5 h-5" />
          {favorites.length > 0 && (
            <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {favorites.length}
            </span>
          )}
        </button>

        {/* 3. Messages (MessageSquare) */}
        <button
          type="button"
          onClick={handleMessagesClick}
          className={`relative p-2 rounded-xl transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer ${iconBaseClass}`}
          title="Messagerie"
          aria-label="Messagerie"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* 4. Profil / Compte Utilisateur */}
        {currentUser ? (
          <div className="relative">
            <button
              type="button"
              onClick={onToggleUserDropdown}
              aria-label="Menu profil utilisateur"
              aria-haspopup="true"
              aria-expanded={isUserDropdownOpen}
              className={`flex items-center gap-2 p-1.5 pl-2 border rounded-xl transition-all duration-150 cursor-pointer ${userDropdownClass}`}
            >
              <Avatar
                src={currentUser.avatar}
                name={currentUser.name}
                size="sm"
                className="ring-2 ring-kawral-green/20 shrink-0"
              />
              <div className="text-left hidden xl:block max-w-[110px]">
                <div
                  className={`text-xs font-bold leading-tight truncate ${userNameClass}`}
                >
                  {currentUser.name}
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                  isUserDropdownOpen ? "rotate-180" : ""
                } ${isTransparent ? "text-white/70" : "text-slate-400"}`}
              />
            </button>

            {/* User Dropdown Menu */}
            <NavbarUserDropdown
              isOpen={isUserDropdownOpen}
              onClose={onToggleUserDropdown}
              currentUser={currentUser}
              favorites={favorites}
              onNavigateTo={onNavigateTo}
              onLogout={onLogout}
              getDashboardViewForRole={getDashboardViewForRole}
              onOpenProfileSettings={onOpenProfileSettings}
              onOpenOnboarding={onOpenOnboarding}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={onLoginClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
              isTransparent
                ? "text-white hover:text-kawral-orange hover:bg-white/10"
                : "text-slate-700 hover:text-kawral-green hover:bg-slate-100"
            }`}
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span>Se connecter</span>
          </button>
        )}
      </div>

      {/* ── Bouton d'action orange : Publier une annonce ── */}
      {(!currentUser || currentUser.role === "seller" || currentUser.role === "client") && (
        <button
          type="button"
          onClick={onPublishClick}
          className={`${
            isMobileMenuOpen ? "hidden lg:flex" : "hidden sm:flex"
          } bg-kawral-orange hover:bg-kawral-orange-hover text-white px-3.5 sm:px-4 xl:px-4.5 py-2 sm:py-2.2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ease-out shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer items-center gap-1.5 shrink-0`}
          title="Publier une annonce"
        >
          <PlusCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="hidden sm:inline">Publier une annonce</span>
          <span className="sm:hidden">Publier</span>
        </button>
      )}

      {/* ── Mobile Controls (Menu Burger visible pour visiteurs et connectés) ── */}
      <div className="flex lg:hidden items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          aria-expanded={isMobileMenuOpen}
          className={`p-2 rounded-xl cursor-pointer transition-colors ${
            isTransparent && !isMobileMenuOpen
              ? "text-white hover:bg-white/20"
              : "text-slate-700 hover:bg-slate-100"
          }`}
          title={isMobileMenuOpen ? "Fermer le menu" : "Menu de navigation"}
          aria-label={isMobileMenuOpen ? "Fermer le menu" : "Menu de navigation"}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </button>
      </div>
    </div>
  );
};
