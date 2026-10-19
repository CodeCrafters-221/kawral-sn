import React from 'react';
import { Building2, Tag, User } from 'lucide-react';
import type { UserRole } from '../../types';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange }) => (
  <div className="space-y-2 mb-6">
    <label className="block text-[11px] font-bold text-kawral-dark uppercase tracking-wider">
      Type de profil
    </label>
    <div className="grid grid-cols-2 gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() => onRoleChange('client')}
        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
          selectedRole === 'client'
            ? 'border-kawral-green bg-white text-kawral-green font-bold ring-2 ring-kawral-green/15 shadow-xs'
            : 'border-slate-200 bg-white/60 text-kawral-muted hover:bg-white'
        }`}
      >
        <div className="p-2 bg-kawral-green/10 rounded-xl shrink-0">
          <User className="w-4 h-4 text-kawral-green" />
        </div>
        <div className="min-w-0">
          <span className="block text-xs sm:text-sm font-bold leading-tight">Client</span>
          <span className="block text-[10px] sm:text-xs font-normal text-slate-500 truncate">Acheteur / Locataire</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onRoleChange('seller')}
        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
          selectedRole === 'seller'
            ? 'border-kawral-orange bg-white text-kawral-orange font-bold ring-2 ring-kawral-orange/15 shadow-xs'
            : 'border-slate-200 bg-white/60 text-kawral-muted hover:bg-white'
        }`}
      >
        <div className="p-2 bg-orange-100 rounded-xl shrink-0">
          <Tag className="w-4 h-4 text-kawral-orange" />
        </div>
        <div className="min-w-0">
          <span className="block text-xs sm:text-sm font-bold leading-tight">Vendeur</span>
          <span className="block text-[10px] sm:text-xs font-normal text-slate-500 truncate">Propriétaire / Annonceur</span>
        </div>
      </button>
    </div>
  </div>
);
