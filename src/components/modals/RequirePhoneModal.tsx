import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Phone,
  ShieldCheck,
  LogOut,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { senegalPhone } from '../../lib/validation';
import { Button } from '../ui';

export const RequirePhoneModal: React.FC = () => {
  const { currentUser, setCurrentUser, addToast } = useApp();
  const { signOut, refreshProfile } = useAuth();
  const location = useLocation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Ne pas bloquer pendant le bref callback OAuth
  if (location.pathname.includes('/auth/callback')) {
    return null;
  }

  // Si aucun utilisateur n'est connecté ou s'il a déjà un téléphone valide, ne rien afficher
  const hasValidPhone = Boolean(
    currentUser?.phone &&
    currentUser.phone.trim().length >= 9 &&
    currentUser.phone !== '+221 77 000 00 00'
  );

  if (!currentUser || hasValidPhone) {
    return null;
  }

  const isSeller = currentUser.role === 'seller';

  const formatToSenegalStandard = (raw: string): string => {
    const digits = raw.replace(/\D/g, '');
    const national = digits.startsWith('221') ? digits.slice(3) : digits;
    if (national.length === 9) {
      return `+221 ${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5, 7)} ${national.slice(7, 9)}`;
    }
    return raw.trim().startsWith('+') ? raw.trim() : `+221 ${raw.trim()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation du numéro avec la règle Zod sénégalaise
    const validationResult = senegalPhone.safeParse(phoneNumber);
    if (!validationResult.success) {
      setError('Veuillez entrer un numéro valide au Sénégal (ex: 77 123 45 67 ou +221 78 000 00 00).');
      return;
    }

    const formatted = formatToSenegalStandard(validationResult.data);

    setLoading(true);
    try {
      // 1. Mettre à jour la table profiles
      const { error: profileErr } = await (supabase.from as any)('profiles')
        .update({
          phone: formatted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (profileErr) {
        console.warn('Erreur mise à jour profiles:', profileErr.message);
      }

      // 2. Mettre à jour les métadonnées auth
      await supabase.auth.updateUser({
        data: {
          phone: formatted,
        },
      });

      // 3. Mettre à jour l'utilisateur localement dans AppContext
      setCurrentUser({
        ...currentUser,
        phone: formatted,
        verified: {
          ...currentUser.verified,
          phone: true,
        },
      });

      // 4. Déclencher le rafraîchissement global en arrière-plan
      if (refreshProfile) {
        void refreshProfile();
      }

      addToast('Votre numéro de téléphone a été enregistré avec succès !', 'success');
    } catch (err: any) {
      console.error('Erreur enregistrement téléphone:', err);
      setError(err?.message || 'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      addToast('Déconnexion effectuée.', 'info');
    } catch (e) {
      console.error('Erreur déconnexion:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-kawral-border overflow-hidden relative flex flex-col">
        {/* Header avec illustration et UNE SEULE explication claire */}
        <div className="p-6 sm:p-7 bg-gradient-to-br from-kawral-green/10 via-white to-kawral-orange/10 border-b border-slate-100 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-kawral-green text-white shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Information obligatoire
            </span>
            <span className="text-[11px] font-bold text-kawral-muted bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200">
              {isSeller ? 'Compte Vendeur' : 'Compte Client'}
            </span>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-kawral-green text-white flex items-center justify-center shrink-0 shadow-md">
              <Phone className="w-6 h-6 text-kawral-orange" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-kawral-dark leading-snug">
                Renseignez votre numéro de téléphone
              </h3>
              <p className="text-xs text-kawral-muted mt-1.5 leading-relaxed">
                {isSeller
                  ? 'Indispensable pour que vos clients puissent vous joindre directement par appel ou WhatsApp et planifier des visites sur vos annonces.'
                  : 'Indispensable pour contacter directement les vendeurs par appel ou WhatsApp et planifier vos visites en toute sécurité.'}
              </p>
            </div>
          </div>
        </div>

        {/* Corps du formulaire — UN SEUL INPUT */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-semibold leading-relaxed">{error}</span>
            </div>
          )}

          {/* Numéro de téléphone — UNIQUE CHAMP */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Numéro de téléphone <span className="text-kawral-orange">*</span> (Appels & WhatsApp)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4 text-kawral-green" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ex: 77 123 45 67 ou +221 78 000 00 00"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 text-base font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-kawral-green focus:ring-2 focus:ring-kawral-green/20 bg-slate-50/50"
                autoFocus
                required
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Opérateurs acceptés : Orange (77, 78), Free (76), Expresso (70), Promobile (75).
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              className="py-3.5 text-sm font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Valider mon numéro</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors flex items-center justify-center gap-1.5 py-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Se déconnecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
