import React from 'react';
import {
  LayoutDashboard,
  Heart,
  User as UserIcon,
  HelpCircle,
} from 'lucide-react';
import type { User } from '../../../types';

interface NavbarUserMenuItemsProps {
  currentUser: User;
  favoritesCount: number;
  onNavigateTo: (view: string) => void;
  getDashboardViewForRole: () => string;
  onOpenProfileSettings: () => void;
  onOpenOnboarding: () => void;
  onClose: () => void;
}

export const NavbarUserMenuItems: React.FC<NavbarUserMenuItemsProps> = ({
  currentUser,
  favoritesCount,
  onNavigateTo,
  getDashboardViewForRole,
  onOpenProfileSettings,
  onOpenOnboarding,
  onClose,
}) => {
  return (
    <>
      {/* Section : Navigation */}
      <div className="px-2 pt-2 pb-1">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 mb-1">
          Navigation
        </p>

        <button
          onClick={() => {
            onNavigateTo(getDashboardViewForRole());
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-kawral-green hover:text-white transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-kawral-green/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
            <LayoutDashboard className="w-3.5 h-3.5 text-kawral-green group-hover:text-white" />
          </div>
          <span>Mon Tableau de bord</span>
        </button>

        {/* Favoris — client uniquement */}
        {currentUser.role === 'client' && (
          <button
            onClick={() => {
              onNavigateTo('favorites');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-kawral-green hover:text-white transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-50 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
              <Heart className="w-3.5 h-3.5 text-rose-500 group-hover:text-white" />
            </div>
            <span>Mes favoris</span>
            {favoritesCount > 0 && (
              <span className="ml-auto text-[9px] bg-rose-100 group-hover:bg-white/20 text-rose-600 group-hover:text-white font-black px-1.5 py-0.5 rounded-full transition-colors">
                {favoritesCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => {
            onOpenProfileSettings();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-kawral-green hover:text-white transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
            <UserIcon className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
          </div>
          <span>Paramètres du profil</span>
        </button>


      </div>

      {/* Section : Aide */}
      <div className="px-2 pt-1 pb-2">
        <button
          onClick={() => {
            onOpenOnboarding();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span>Guide & Aide interactive</span>
        </button>
      </div>
    </>
  );
};
