import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LogIn,
  UserPlus,
  CircleHelp,
  FileText,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Avatar } from "../ui";
import type { User } from "../../types";

interface NavbarMobileMenuProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onOpenHelp: () => void;
}

export const NavbarMobileMenu: React.FC<NavbarMobileMenuProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLoginClick,
  onRegisterClick,
  onOpenHelp,
}) => {
  const routerNavigate = useNavigate();

  if (!isOpen) return null;

  const handleNavigateRoute = (path: string) => {
    onClose();
    routerNavigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInstallPwa = () => {
    onClose();
    localStorage.removeItem("kawral_pwa_banner_dismissed");
    window.dispatchEvent(new CustomEvent("open-pwa-install"));
  };

  const roleBadgeLabel =
    currentUser?.role === "admin"
      ? "Administrateur"
      : currentUser?.role === "seller"
        ? "Vendeur"
        : "Client";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu principal"
      className="lg:hidden fixed top-16 sm:top-18 inset-x-0 bottom-0 z-[55] bg-white text-kawral-dark flex flex-col justify-between overflow-y-auto overscroll-contain animate-fade-in"
    >
      <div className="px-5 py-5 space-y-6">
        {/* ── 1. Espace Visiteur (Authentification) ou Résumé discret de l'utilisateur ── */}
        {currentUser ? (
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="md"
              className="ring-1 ring-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-kawral-dark truncate">
                  {currentUser.name}
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-kawral-green/10 text-kawral-green shrink-0">
                  {roleBadgeLabel}
                </span>
              </div>
              {currentUser.email && (
                <p className="text-xs text-kawral-muted truncate mt-0.5">
                  {currentUser.email}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <p className="text-xs text-kawral-muted leading-relaxed">
              Connectez-vous pour publier des annonces, enregistrer vos favoris et échanger avec les vendeurs.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLoginClick();
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-kawral-green hover:bg-kawral-darkgreen text-white text-xs font-bold transition-colors active:scale-[0.98] cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>Se connecter</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRegisterClick();
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-kawral-ivory hover:bg-[#F3EFE6] text-kawral-dark border border-kawral-border text-xs font-bold transition-colors active:scale-[0.98] cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-kawral-orange shrink-0" />
                <span>Créer un compte</span>
              </button>
            </div>
          </div>
        )}

        {/* ── 2. Assistance & Informations générales ── */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Assistance & Plateforme
          </p>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-kawral-ivory hover:bg-[#F3EFE6] text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-kawral-green shadow-2xs shrink-0">
                <CircleHelp className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <span className="block text-sm font-bold text-kawral-dark group-hover:text-kawral-green transition-colors">
                  Aide & Informations
                </span>
                <span className="block text-xs text-kawral-muted truncate">
                  Guides, questions fréquentes et contact
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-kawral-green shrink-0 transition-colors" />
          </button>

          <button
            type="button"
            onClick={handleInstallPwa}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-kawral-dark shrink-0">
                <Smartphone className="w-4 h-4 text-kawral-green" />
              </span>
              <div className="min-w-0">
                <span className="block text-sm font-semibold text-kawral-dark">
                  Installer l'application
                </span>
                <span className="block text-xs text-kawral-muted truncate">
                  Ajouter Kawral sur votre écran d'accueil
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* ── 3. Documents légaux ── */}
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Informations légales
          </p>

          <button
            type="button"
            onClick={() => handleNavigateRoute("/terms")}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-4 h-4 text-slate-400 group-hover:text-kawral-green shrink-0 transition-colors" />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-kawral-dark truncate">
                Conditions générales d'utilisation
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigateRoute("/privacy")}
            className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-kawral-green shrink-0 transition-colors" />
              <span className="text-xs font-semibold text-slate-700 group-hover:text-kawral-dark truncate">
                Politique de confidentialité
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>
        </div>
      </div>

      {/* ── Pied de menu discret avec respect de la safe-area ── */}
      <div className="px-5 pt-4 pb-[max(24px,env(safe-area-inset-bottom,0px))] border-t border-slate-100 bg-[#FAF9F6] flex items-center justify-between text-[11px] text-kawral-muted">
        <span className="font-medium">
          © {new Date().getFullYear()} Kawral Sénégal
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3 h-3 text-kawral-orange shrink-0" />
          <span>Dakar, Sénégal</span>
        </span>
      </div>
    </div>
  );
};
