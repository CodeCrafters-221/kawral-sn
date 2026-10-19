import React from 'react';
import { LogOut } from 'lucide-react';
import { Avatar } from '../ui';
import { NavbarUserMenuItems } from './navbar/NavbarUserMenuItems';
import type { User } from '../../types';

interface NavbarUserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  favorites: any[];
  onNavigateTo: (view: string) => void;
  onLogout: () => void;
  getDashboardViewForRole: () => string;
  onOpenProfileSettings: () => void;
  onOpenOnboarding: () => void;
}

export const NavbarUserDropdown: React.FC<NavbarUserDropdownProps> = ({
  isOpen,
  onClose,
  currentUser,
  favorites,
  onNavigateTo,
  onLogout,
  getDashboardViewForRole,
  onOpenProfileSettings,
  onOpenOnboarding,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
        {/* Header — Profile card */}
        <div className="bg-gradient-to-br from-kawral-green to-[#083A34] px-4 py-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="md"
              className="ring-2 ring-white/30 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white leading-tight truncate">{currentUser.name}</p>
              <p className="text-[11px] text-emerald-200/80 truncate mt-0.5">{currentUser.email}</p>
            </div>
            <span
              className={`shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                currentUser.role === 'admin'
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                  : currentUser.role === 'seller'
                    ? 'bg-kawral-orange/20 text-orange-300 border-orange-400/30'
                    : 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
              }`}
            >
              {currentUser.role === 'admin'
                ? '⚡ Admin'
                : currentUser.role === 'seller'
                  ? '🏷️ Vendeur'
                  : '👤 Client'}
            </span>
          </div>

          {/* Quick stats row removed — Messages and RDV icons are already in the ActionBar */}
        </div>

        {/* Navigation, AI tools, and guide links */}
        <NavbarUserMenuItems
          currentUser={currentUser}
          favoritesCount={favorites.length}
          onNavigateTo={onNavigateTo}
          getDashboardViewForRole={getDashboardViewForRole}
          onOpenProfileSettings={onOpenProfileSettings}
          onOpenOnboarding={onOpenOnboarding}
          onClose={onClose}
        />

        {/* Footer — Logout */}
        <div className="border-t border-slate-100 px-2 py-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center shrink-0 transition-colors">
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </>
  );
};
