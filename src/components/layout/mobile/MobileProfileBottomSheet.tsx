import React from 'react';
import { LayoutDashboard, Settings, MessageSquare, Calendar, Heart, LogOut, X, ChevronRight } from 'lucide-react';
import { Avatar } from '../../ui';
import type { User } from '../../../types';

interface MobileProfileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  roleLabel: string;
  unreadCount: number;
  pendingRDV: number;
  favoritesCount: number;
  onNavigateDashboard: () => void;
  onOpenProfileSettings: () => void;
  onNavigateMessaging: () => void;
  onNavigateAppointments: () => void;
  onNavigateFavorites: () => void;
  onLogout: () => void;
}

export const MobileProfileBottomSheet: React.FC<MobileProfileBottomSheetProps> = ({
  isOpen,
  onClose,
  currentUser,
  roleLabel,
  unreadCount,
  pendingRDV,
  favoritesCount,
  onNavigateDashboard,
  onOpenProfileSettings,
  onNavigateMessaging,
  onNavigateAppointments,
  onNavigateFavorites,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="sm:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Profile header */}
        <div className="px-5 pt-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="lg"
              className="ring-2 ring-kawral-green/20 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-base text-kawral-dark truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-xs text-kawral-muted truncate">{currentUser.email}</p>
              <span className="inline-block mt-1 text-[10px] font-bold bg-kawral-green/10 text-kawral-green px-2 py-0.5 rounded-full">
                {roleLabel}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 text-slate-500 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actions list */}
        <div className="px-4 py-3 space-y-1">
          <button
            onClick={() => {
              onClose();
              onNavigateDashboard();
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-kawral-green text-white font-bold text-sm active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <LayoutDashboard className="w-5 h-5 text-kawral-orange shrink-0" />
            <span>Mon tableau de bord</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-60" />
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenProfileSettings();
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-kawral-dark font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <Settings className="w-5 h-5 text-kawral-green shrink-0" />
            <span>Paramètres du profil</span>
            <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
          </button>

          {/* Messages — tous sauf admin */}
          {currentUser.role !== 'admin' && (
            <button
              onClick={() => {
                onClose();
                onNavigateMessaging();
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-kawral-dark font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-kawral-green shrink-0" />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="ml-auto bg-kawral-green text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Rendez-vous — client, seller uniquement */}
          {(currentUser.role === 'client' || currentUser.role === 'seller') && (
            <button
              onClick={() => {
                onClose();
                onNavigateAppointments();
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-kawral-dark font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <Calendar className="w-5 h-5 text-kawral-green shrink-0" />
              <span>Rendez-vous</span>
              {pendingRDV > 0 && (
                <span className="ml-auto bg-kawral-orange text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {pendingRDV}
                </span>
              )}
            </button>
          )}

          {/* Favoris — client et vendeur */}
          {(currentUser.role === 'client' || currentUser.role === 'seller') && (
            <button
              onClick={() => {
                onClose();
                onNavigateFavorites();
              }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-kawral-dark font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <Heart className="w-5 h-5 text-rose-500 shrink-0" />
              <span>Mes favoris</span>
              {favoritesCount > 0 && (
                <span className="ml-auto bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-sm active:scale-[0.98] transition-all mt-2 cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Se déconnecter</span>
          </button>
        </div>

        {/* Safe area bottom spacer — respects iOS home indicator */}
        <div className="h-[max(24px,env(safe-area-inset-bottom,0px))]" />
      </div>
    </>
  );
};
