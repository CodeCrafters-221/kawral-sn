import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, MailCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { toAppRole, getRoleDashboardView } from '../../utils/roles';
import { getZodErrors, loginSchema, registerSchema } from '../../lib/validation';
import { Button } from '../ui';
import { AuthForgotFooter } from './AuthForgotFooter';
import { AuthForm } from './AuthForm';
import { AuthHeading } from './AuthHeading';
import { AuthHeroPanel } from './AuthHeroPanel';
import { AuthModeTabs } from './AuthModeTabs';
import { RoleSelector } from './RoleSelector';
import type { AuthFieldErrors } from './types';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    setCurrentUser,
    setCurrentView,
    addToast,
  } = useApp();

  const {
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    resendVerificationEmail,
    signInWithGoogle,
    isConfigured,
  } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [registeredEmailSuccess, setRegisteredEmailSuccess] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await signInWithGoogle({
        role: authModalMode === 'register' ? selectedRole : undefined,
      });

      if (error) {
        setErrorMessage(error.message || "Impossible d'initialiser la connexion avec Google.");
        addToast(error.message || "Erreur de connexion Google", "error");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Une erreur inattendue est survenue avec Google.");
      addToast("Erreur lors de la connexion Google.", "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (pathname === '/auth/register/client') setSelectedRole('client');
    if (pathname === '/auth/register/seller' || pathname === '/auth/register/agency') setSelectedRole('seller');
  }, [pathname]);

  if (!authModalOpen) return null;

  const navigateToRoleDashboard = (role: UserRole) => {
    setCurrentView(getRoleDashboardView(role));
  };

  const closeModal = () => {
    setRegisteredEmailSuccess(null);
    setUnconfirmedEmail(null);
    setErrorMessage(null);
    setAuthModalOpen(false);
  };

  // Fermeture manuelle par l'utilisateur : retour à l'accueil si on est sur une route /auth
  const dismissModal = () => {
    closeModal();
    if (pathname.startsWith('/auth')) {
      setCurrentView('home');
      navigate('/', { replace: true });
    }
  };

  const handleResendConfirmation = async (targetEmail: string) => {
    if (!targetEmail) return;
    setResending(true);
    try {
      const { error } = await resendVerificationEmail(targetEmail);
      if (error) {
        addToast(error.message, 'error');
      } else {
        addToast(`Email de confirmation renvoyé à ${targetEmail} !`, 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Erreur lors du renvoi.', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setUnconfirmedEmail(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        const validation = getZodErrors(loginSchema, { email, password });
        if (validation.success === false) {
          setFieldErrors(validation.errors);
          setErrorMessage(Object.values(validation.errors)[0]);
          setLoading(false);
          return;
        }

        if (isConfigured) {
          const { data, error } = await signInWithEmail(email, password);
          if (error) {
            const rawMsg = error.message || '';
            const lowerMsg = rawMsg.toLowerCase();
            if (lowerMsg.includes('email not confirmed') || lowerMsg.includes('email_not_confirmed')) {
              setUnconfirmedEmail(email.trim());
              setErrorMessage(
                "Votre adresse email n'a pas encore été confirmée. Veuillez vérifier votre boîte de réception ou cliquer ci-dessous pour renvoyer le lien."
              );
            } else if (lowerMsg.includes('invalid login credentials')) {
              setErrorMessage('Email ou mot de passe incorrect.');
            } else {
              setErrorMessage(rawMsg);
            }
            setLoading(false);
            return;
          }

          if (data?.user) {
            if (!data.user.email_confirmed_at) {
              setUnconfirmedEmail(email.trim());
              setErrorMessage(
                "Votre adresse email n'a pas encore été confirmée. Veuillez vérifier votre boîte de réception ou cliquer ci-dessous pour renvoyer le lien."
              );
              setLoading(false);
              return;
            }

            const finalRole: UserRole = toAppRole(data.user.user_metadata?.role);

            setCurrentUser({
              id: data.user.id,
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Utilisateur',
              email: data.user.email || email,
              role: finalRole,
              phone: data.user.user_metadata?.phone || '',
              avatar: data.user.user_metadata?.avatar_url || '',
              verified: {
                email: Boolean(data.user.email_confirmed_at),
                phone: Boolean(data.user.user_metadata?.phone),
              },
              createdAt: data.user.created_at ? data.user.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            });

            addToast('Connexion réussie ! Bienvenue sur Kawral.', 'success');
            navigateToRoleDashboard(finalRole);
            closeModal();
          }
        } else {
          setErrorMessage(
            "Le service d'authentification n'est pas disponible pour le moment. Veuillez réessayer ultérieurement."
          );
          setLoading(false);
          return;
        }
      } else if (authModalMode === 'register') {
        const validation = getZodErrors(registerSchema, {
          name,
          email,
          password,
          phone,
        });
        if (validation.success === false) {
          setFieldErrors(validation.errors);
          setErrorMessage(Object.values(validation.errors)[0]);
          setLoading(false);
          return;
        }

        // Vérification préalable en temps réel de l'existence réelle du domaine email (DNS MX & anti-jetable)
        try {
          const checkRes = await fetch('/api/auth/validate-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
          });
          const checkData = await checkRes.json();
          if (!checkRes.ok || checkData.valid === false) {
            setFieldErrors({ email: checkData.message || 'Adresse email invalide ou introuvable.' });
            setErrorMessage(checkData.message || 'Le domaine de cette adresse email n\'existe pas ou ne peut pas recevoir d\'emails.');
            setLoading(false);
            return;
          }
        } catch (checkErr) {
          console.warn('Vérification DNS préalable non bloquante:', checkErr);
        }

        if (isConfigured) {
          const { data, error } = await signUpWithEmail(email, password, {
            fullName: name,
            phone,
            role: selectedRole,
          });

          if (error) {
            const rawMsg = error.message || '';
            const lowerMsg = rawMsg.toLowerCase();
            if (
              lowerMsg.includes('already registered') ||
              lowerMsg.includes('already in use') ||
              lowerMsg.includes('unique') ||
              lowerMsg.includes('déjà enregistrée')
            ) {
              setErrorMessage('Cet email est déjà utilisé. Essayez de vous connecter.');
            } else if (
              lowerMsg.includes('temporaire') ||
              lowerMsg.includes('jetable') ||
              lowerMsg.includes('invalide') ||
              lowerMsg.includes('check_violation')
            ) {
              setErrorMessage('Les adresses emails temporaires ou jetables ne sont pas autorisées.');
            } else {
              setErrorMessage(rawMsg);
            }
            setLoading(false);
            return;
          }

          if (data?.user) {
            // L'email doit impérativement être validé avant toute connexion
            if (!data.user.email_confirmed_at) {
              setRegisteredEmailSuccess(email.trim());
              addToast('Compte créé ! Vérifiez votre boîte mail pour confirmer votre inscription.', 'info');
              setLoading(false);
              return;
            }

            setCurrentUser({
              id: data.user.id,
              name: data.user.user_metadata?.full_name || name || data.user.email?.split('@')[0] || 'Nouvel Utilisateur',
              email: data.user.email || email,
              role: selectedRole,
              phone: data.user.user_metadata?.phone || phone || '',
              avatar: '',
              verified: {
                email: Boolean(data.user.email_confirmed_at),
                phone: Boolean(phone),
              },
              createdAt: new Date().toISOString().split('T')[0],
            });

            const roleSuccessMessages: Record<UserRole, string> = {
              client: 'Compte Client créé avec succès !',
              seller: 'Compte Vendeur prêt ! Vous pouvez publier vos annonces.',
              admin: 'Compte Administrateur configuré avec succès !',
            };
            addToast(roleSuccessMessages[selectedRole], 'success');
            navigateToRoleDashboard(selectedRole);
            closeModal();
          }
        } else {
          setErrorMessage(
            "Le service d'authentification n'est pas disponible pour le moment. Veuillez réessayer ultérieurement."
          );
          setLoading(false);
          return;
        }
      } else {
        // Mode Réinitialisation du mot de passe
        try {
          const checkRes = await fetch('/api/auth/validate-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
          });
          const checkData = await checkRes.json();
          if (!checkRes.ok || checkData.valid === false) {
            setFieldErrors({ email: checkData.message || 'Adresse email invalide ou introuvable.' });
            setErrorMessage(checkData.message || 'Le domaine de cette adresse email n\'existe pas ou ne peut pas recevoir d\'emails.');
            setLoading(false);
            return;
          }
        } catch (checkErr) {
          console.warn('Vérification DNS préalable non bloquante:', checkErr);
        }

        if (isConfigured) {
          const { error } = await resetPassword(email);
          if (error) {
            setErrorMessage(error.message);
            setLoading(false);
            return;
          }
        }
        addToast('Un lien de réinitialisation a été envoyé à votre adresse email.', 'info');
        setAuthModalMode('login');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue lors du traitement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full shadow-2xl border border-kawral-border relative overflow-hidden flex flex-col md:flex-row max-h-[95dvh] sm:max-h-[92vh]">
        <AuthHeroPanel />

        <div className="w-full md:w-1/2 bg-kawral-ivory p-6 sm:p-10 flex flex-col justify-between relative overflow-y-auto flex-1 min-h-0 md:max-h-[640px]">
          <button
            onClick={dismissModal}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-white rounded-full shadow-xs transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {registeredEmailSuccess ? (
            <div className="py-8 text-center space-y-4 my-auto">
              <div className="w-16 h-16 bg-emerald-100 text-kawral-green rounded-full flex items-center justify-center mx-auto shadow-inner">
                <MailCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-kawral-dark">Vérifiez votre boîte de réception</h3>
                <p className="text-xs text-kawral-muted mt-2 max-w-xs mx-auto">
                  Un email de confirmation vient d'être envoyé à <span className="font-bold text-slate-800">{registeredEmailSuccess}</span>.
                </p>
                <p className="text-[11px] text-slate-500 mt-2">
                  Veuillez cliquer sur le lien reçu pour activer votre compte avant de vous connecter.
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2.5 max-w-xs mx-auto">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setRegisteredEmailSuccess(null);
                    setAuthModalMode('login');
                  }}
                >
                  Passer à la connexion
                </Button>
                <button
                  type="button"
                  disabled={resending}
                  onClick={() => handleResendConfirmation(registeredEmailSuccess)}
                  className="text-xs font-semibold text-kawral-orange hover:underline cursor-pointer py-1 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Renvoi en cours...' : "Vous n'avez rien reçu ? Renvoyer"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <AuthModeTabs
                mode={authModalMode}
                setMode={(newMode) => {
                  setAuthModalMode(newMode);
                  setErrorMessage(null);
                  setUnconfirmedEmail(null);
                  setFieldErrors({});
                }}
                setErrorMessage={setErrorMessage}
                setFieldErrors={setFieldErrors}
              />
              <AuthHeading mode={authModalMode} />

              {authModalMode === 'register' && (
                <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
              )}

              {unconfirmedEmail && authModalMode === 'login' && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex flex-col gap-2">
                  <p className="font-medium">
                    L'adresse <strong>{unconfirmedEmail}</strong> n'a pas encore été vérifiée.
                  </p>
                  <button
                    type="button"
                    disabled={resending}
                    onClick={() => handleResendConfirmation(unconfirmedEmail)}
                    className="self-start text-[11px] font-bold text-amber-900 underline hover:text-amber-950 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Envoi...' : 'Renvoyer le lien de confirmation'}
                  </button>
                </div>
              )}

              <AuthForm
                mode={authModalMode}
                onCloseModal={closeModal}
                onGoogleSignIn={handleGoogleSignIn}
                googleLoading={googleLoading}
                selectedRole={selectedRole}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                name={name}
                setName={setName}
                phone={phone}
                setPhone={setPhone}
                loading={loading}
                errorMessage={errorMessage}
                fieldErrors={fieldErrors}
                setFieldErrors={setFieldErrors}
                onSubmit={handleSubmit}
                onForgotPassword={() => setAuthModalMode('forgot')}
              />
            </div>
          )}

          {authModalMode === 'forgot' && !registeredEmailSuccess && (
            <AuthForgotFooter onBackToLogin={() => setAuthModalMode('login')} />
          )}
        </div>
      </div>
    </div>
  );
};
