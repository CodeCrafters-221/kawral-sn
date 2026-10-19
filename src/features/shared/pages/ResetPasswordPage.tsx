import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { KawralLogo } from '../../../components/layout/KawralLogo';
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

type Stage = 'checking' | 'idle' | 'loading' | 'success' | 'error' | 'invalid';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stage, setStage] = useState<Stage>('checking');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);

  // Supabase parse automatiquement le hash #access_token=... et établit la session
  useEffect(() => {
    let isMounted = true;
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const hasError = search.includes('error') || hash.includes('error');
    if (hasError) {
      setStage('invalid');
      return;
    }

    const hasRecoveryToken =
      hash.includes('access_token') ||
      hash.includes('type=recovery') ||
      search.includes('code');

    // 1. Vérifier si une session existe déjà
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session) {
        setHasSession(true);
        setStage('idle');
      } else if (!hasRecoveryToken) {
        // Ni session ni hash de récupération dans l'URL -> lien définitivement invalide ou absent
        setStage('invalid');
      }
    });

    // 2. Écouter les événements d'authentification Supabase (PASSWORD_RECOVERY, SIGNED_IN)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === 'PASSWORD_RECOVERY' || (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION'))) {
        setHasSession(true);
        setStage('idle');
      }
    });

    // 3. Timeout de sécurité si un token est présent dans le hash mais qu'aucune session ne répond
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (hasRecoveryToken) {
      timeoutId = setTimeout(() => {
        if (!isMounted) return;
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!isMounted) return;
          if (session) {
            setHasSession(true);
            setStage('idle');
          } else {
            setStage('invalid');
          }
        });
      }, 4000);
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: score, label: 'Faible', color: 'bg-red-400' };
    if (score === 2) return { level: score, label: 'Moyen', color: 'bg-orange-400' };
    if (score === 3) return { level: score, label: 'Bon', color: 'bg-yellow-400' };
    return { level: score, label: 'Fort', color: 'bg-kawral-green' };
  };

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    setStage('loading');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg(
        error.message.includes('same password')
          ? 'Le nouveau mot de passe doit être différent de l\'ancien.'
          : error.message
      );
      setStage('error');
      return;
    }

    setStage('success');
    // Déconnecter toutes les autres sessions et rediriger après 2s
    setTimeout(async () => {
      await supabase.auth.signOut({ scope: 'others' });
      navigate('/', { replace: true });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-kawral-ivory flex items-center justify-center p-4 ">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-kawral-border overflow-hidden flex flex-col md:flex-row min-h-[520px]">

        {/* LEFT PANEL */}
        <div className="hidden md:flex md:w-1/2 relative bg-slate-900 flex-col justify-between p-8 text-white overflow-hidden select-none">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
            alt="Kawral"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-kawral-green/50 to-slate-900/40 mix-blend-multiply" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-lg">
              <KawralLogo size="sm" variant="dark" showTagline={false} />
            </div>
          </div>
          <div className="relative z-10 space-y-1 mt-auto">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Sécurisez<br />votre compte.
            </h1>
            <p className="text-sm text-white/60 mt-2">Choisissez un mot de passe fort pour protéger votre espace Kawral.</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 bg-kawral-ivory p-6 sm:p-10 flex flex-col justify-center">

          {/* Logo mobile only */}
          <div className="md:hidden mb-6">
            <KawralLogo size="md" showTagline={false} />
          </div>

          {/* === ÉTAT : vérification initiale du lien === */}
          {stage === 'checking' && (
            <div className="text-center space-y-4 py-8">
              <div className="w-10 h-10 border-3 border-kawral-green border-t-transparent rounded-full animate-spin mx-auto" />
              <h2 className="text-base font-bold text-kawral-dark">Vérification de sécurité...</h2>
              <p className="text-xs text-kawral-muted">Vérification de la validité de votre lien en cours.</p>
            </div>
          )}

          {/* === ÉTAT : lien invalide/expiré === */}
          {stage === 'invalid' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-black text-kawral-dark">Lien invalide ou expiré</h2>
              <p className="text-sm text-kawral-muted">
                Ce lien de réinitialisation a déjà été utilisé ou a expiré.<br />
                Faites une nouvelle demande depuis la page de connexion.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 w-full bg-kawral-green hover:bg-[#083A34] text-white py-3 px-6 rounded-2xl font-bold text-sm transition-all cursor-pointer"
              >
                Retour à l'accueil
              </button>
            </div>
          )}

          {/* === ÉTAT : succès === */}
          {stage === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-kawral-green/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-kawral-green" />
              </div>
              <h2 className="text-xl font-black text-kawral-dark">Mot de passe mis à jour !</h2>
              <p className="text-sm text-kawral-muted">
                Votre mot de passe a été changé avec succès.<br />
                Vous allez être redirigé vers l'accueil…
              </p>
              <div className="w-8 h-8 border-2 border-kawral-green border-t-transparent rounded-full animate-spin mx-auto mt-2" />
            </div>
          )}

          {/* === ÉTAT : formulaire === */}
          {(stage === 'idle' || stage === 'loading' || stage === 'error') && hasSession && (
            <div>
              <div className="mb-7 space-y-1">
                <h2 className="font-black text-2xl text-kawral-dark flex items-center gap-2">
                  Nouveau mot de passe 🔐
                </h2>
                <p className="text-xs text-kawral-muted font-medium">
                  Choisissez un mot de passe sécurisé d'au moins 8 caractères.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-xs font-bold text-kawral-dark mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-10 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-kawral-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-kawral-green/20 focus:border-kawral-green transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Barre de force */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              i <= strength.level ? strength.color : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] font-bold text-kawral-muted">
                        Force : <span className={
                          strength.level <= 1 ? 'text-red-500' :
                          strength.level === 2 ? 'text-orange-500' :
                          strength.level === 3 ? 'text-yellow-600' : 'text-kawral-green'
                        }>{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirmer */}
                <div>
                  <label className="block text-xs font-bold text-kawral-dark mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={`w-full px-4 py-3 pr-10 bg-white border rounded-2xl text-xs font-medium text-kawral-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-kawral-green/20 transition-all ${
                        confirm.length > 0
                          ? password === confirm
                            ? 'border-kawral-green focus:border-kawral-green'
                            : 'border-red-300 focus:border-red-400'
                          : 'border-slate-200 focus:border-kawral-green'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm.length > 0 && password !== confirm && (
                    <p className="text-[10px] text-red-500 font-medium mt-1">Les mots de passe ne correspondent pas.</p>
                  )}
                </div>

                {/* Erreur */}
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={stage === 'loading' || password !== confirm || password.length < 8}
                  className="w-full bg-kawral-orange hover:bg-kawral-orange-hover text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {stage === 'loading'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
                    : <><span>Enregistrer le mot de passe</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>
            </div>
          )}



        </div>
      </div>
    </div>
  );
};
