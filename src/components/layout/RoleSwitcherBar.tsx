import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserCheck, ShieldCheck, Building2, User, Eye } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { currentUser, switchRole } = useApp();

  // Outil de démonstration — disponible uniquement en développement
  if (!import.meta.env.DEV) return null;

  const currentRole = currentUser?.role || 'visitor';

  return (
    <div className="bg-kawral-darkgreen text-white text-xs py-1.5 px-4 border-b border-kawral-green flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-kawral-green text-kawral-ivory font-medium text-[11px]">
          <UserCheck className="w-3.5 h-3.5 text-kawral-orange" />
          Mode Démo :
        </span>
        <span className="hidden sm:inline text-slate-300">
          Changer de rôle pour tester les fonctionnalités :
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
        <button
          onClick={() => switchRole('client')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
            currentRole === 'client'
              ? 'bg-kawral-orange text-white shadow-sm'
              : 'bg-white/10 hover:bg-white/20 text-slate-200'
          }`}
        >
          <User className="w-3 h-3" />
          Acheteur (Amadou)
        </button>

        <button
          onClick={() => switchRole('seller')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
            currentRole === 'seller'
              ? 'bg-kawral-orange text-white shadow-sm'
              : 'bg-white/10 hover:bg-white/20 text-slate-200'
          }`}
        >
          <UserCheck className="w-3 h-3" />
          Vendeur (Fatou)
        </button>

        <button
          onClick={() => switchRole('admin')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
            currentRole === 'admin'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white/10 hover:bg-white/20 text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3 h-3 text-amber-300" />
          Admin Modération
        </button>

        <button
          onClick={() => switchRole('visitor')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
            currentRole === 'visitor'
              ? 'bg-kawral-green text-white ring-1 ring-white/30'
              : 'bg-white/10 hover:bg-white/20 text-slate-300'
          }`}
        >
          <Eye className="w-3 h-3" />
          Visiteur
        </button>
      </div>
    </div>
  );
};
