import React from 'react';
import { TransactionType } from '../../../../types';
import { DollarSign, Home as HomeIcon, Car, Check } from 'lucide-react';
import { findParentMainCategory } from '../../../../data/categoriesData';

interface Props {
  value: TransactionType;
  onChange: (v: TransactionType, period: 'month' | 'total') => void;
  category?: string;
}

export const StepTransaction: React.FC<Props> = ({ value, onChange, category }) => {
  const isVehicle = category ? findParentMainCategory(category)?.slug === 'vehicules' : false;

  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <p className="text-xs text-kawral-muted font-medium">
          Par défaut, votre annonce est configurée <strong>à vendre</strong>. Si vous proposez ce bien en location, sélectionnez <strong>À louer</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Option À VENDRE (Par défaut) */}
        <button
          type="button"
          onClick={() => onChange('sale', 'total')}
          className={`relative p-5 sm:p-7 rounded-3xl border text-center transition-all cursor-pointer active:scale-[0.98] ${
            value === 'sale'
              ? 'border-kawral-green bg-kawral-green text-white shadow-xl ring-2 ring-kawral-green/20'
              : 'border-kawral-border text-kawral-dark hover:bg-kawral-ivory bg-white'
          }`}
        >
          {value === 'sale' && (
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white flex items-center gap-1">
              <Check className="w-3 h-3" />
              Par défaut
            </span>
          )}
          <DollarSign className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 ${value === 'sale' ? 'text-white' : 'text-kawral-orange'}`} />
          <h3 className="font-extrabold text-base sm:text-lg">À VENDRE</h3>
          <p className={`text-xs mt-1 leading-relaxed ${value === 'sale' ? 'text-white/85 font-medium' : 'text-kawral-muted'}`}>
            {isVehicle ? "Vente directe du véhicule au Sénégal" : "Vente directe ou transaction définitive"}
          </p>
        </button>

        {/* Option À LOUER */}
        <button
          type="button"
          onClick={() => onChange('rent', 'month')}
          className={`relative p-5 sm:p-7 rounded-3xl border text-center transition-all cursor-pointer active:scale-[0.98] ${
            value === 'rent'
              ? 'border-kawral-orange bg-kawral-orange text-white shadow-xl ring-2 ring-kawral-orange/20'
              : 'border-kawral-border text-kawral-dark hover:bg-kawral-ivory bg-white'
          }`}
        >
          {value === 'rent' && (
            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white flex items-center gap-1">
              <Check className="w-3 h-3" />
              Sélectionné
            </span>
          )}
          {isVehicle ? (
            <Car className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 ${value === 'rent' ? 'text-white' : 'text-kawral-orange'}`} />
          ) : (
            <HomeIcon className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 ${value === 'rent' ? 'text-white' : 'text-kawral-orange'}`} />
          )}
          <h3 className="font-extrabold text-base sm:text-lg">À LOUER</h3>
          <p className={`text-xs mt-1 leading-relaxed ${value === 'rent' ? 'text-white/85 font-medium' : 'text-kawral-muted'}`}>
            {isVehicle ? "Location journalière, mensuelle ou événementielle" : "Location mensuelle ou courte durée"}
          </p>
        </button>
      </div>
    </div>
  );
};
