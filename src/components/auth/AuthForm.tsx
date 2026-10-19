import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';
import type { UserRole } from '../../types';
import { Button, Input, GoogleIcon } from '../ui';
import { PasswordInput } from '../ui';
import type { AuthFieldErrors, AuthModalMode } from './types';

interface AuthFormProps {
  mode: AuthModalMode;
  onCloseModal?: () => void;
  onGoogleSignIn?: () => void;
  googleLoading?: boolean;
  selectedRole: UserRole;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  loading: boolean;
  errorMessage: string | null;
  fieldErrors: AuthFieldErrors;
  setFieldErrors: React.Dispatch<React.SetStateAction<AuthFieldErrors>>;
  onSubmit: (event: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onCloseModal,
  onGoogleSignIn,
  googleLoading = false,
  selectedRole,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  phone,
  setPhone,
  loading,
  errorMessage,
  fieldErrors,
  setFieldErrors,
  onSubmit,
  onForgotPassword,
}) => {
  const clearFieldError = (fieldName: string) => {
    setFieldErrors((previous) => ({ ...previous, [fieldName]: '' }));
  };

  const roleLabel = selectedRole === 'seller' ? 'Vendeur' : 'Client';

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode !== 'forgot' && onGoogleSignIn && (
        <div className="space-y-3.5 pt-0.5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            fullWidth
            onClick={onGoogleSignIn}
            isLoading={googleLoading}
            disabled={loading || googleLoading}
            leftIcon={!googleLoading ? <GoogleIcon className="w-5 h-5 shrink-0" /> : undefined}
            className="bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 font-bold border border-slate-200 shadow-xs hover:border-slate-300 transition-all py-3 active:scale-[0.99] cursor-pointer"
          >
            {mode === 'login'
              ? 'Continuer avec Google'
              : `S'inscrire avec Google (${roleLabel})`}
          </Button>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-kawral-ivory px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 absolute">
              ou avec votre email
            </span>
          </div>
        </div>
      )}
      {mode === 'register' && (
        <>
          <Input
            label="Nom complet"
            type="text"
            required
            placeholder="Amadou Diallo"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearFieldError('name');
            }}
            error={fieldErrors.name}
            leftIcon={<User className="w-4 h-4" />}
            className="bg-white"
          />

          <Input
            label="Téléphone (Sénégal)"
            type="tel"
            required
            placeholder="+221 77 000 00 00"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              clearFieldError('phone');
            }}
            error={fieldErrors.phone}
            className="bg-white"
          />
        </>
      )}

      <Input
        label="Email"
        type="email"
        required
        placeholder="vous@exemple.com"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          clearFieldError('email');
        }}
        error={fieldErrors.email}
        className="bg-white"
      />

      {mode !== 'forgot' && (
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-bold text-kawral-green uppercase tracking-wider">
            Mot de passe
          </label>
          <PasswordInput
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearFieldError('password');
            }}
            required
            hasError={!!fieldErrors.password}
          />
          {fieldErrors.password && <p className="text-[11px] text-rose-500 mt-1 ml-1">{fieldErrors.password}</p>}

          {mode === 'login' && (
            <div className="mt-2 text-left">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs font-bold text-kawral-orange hover:text-kawral-orange-hover hover:underline cursor-pointer"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}
        </div>
      )}

      {errorMessage && Object.keys(fieldErrors).every((key) => !fieldErrors[key]) && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        size="lg"
        fullWidth
        isLoading={loading}
        disabled={loading}
        rightIcon={!loading ? <ArrowRight className="w-4 h-4" /> : undefined}
        className="mt-2"
      >
        {mode === 'login' && (loading ? 'Connexion...' : 'Se connecter')}
        {mode === 'register' && (loading ? 'Inscription...' : "S'inscrire")}
        {mode === 'forgot' && (loading ? 'Envoi...' : 'Réinitialiser')}
      </Button>

      {mode !== 'forgot' && (
        <p className="text-[11px] text-center text-slate-500 mt-2.5 leading-relaxed">
          En continuant, vous acceptez nos{' '}
          <Link
            to="/terms"
            onClick={onCloseModal}
            className="font-semibold text-kawral-green hover:underline cursor-pointer"
          >
            Conditions d'utilisation
          </Link>{' '}
          et notre{' '}
          <Link
            to="/privacy"
            onClick={onCloseModal}
            className="font-semibold text-kawral-green hover:underline cursor-pointer"
          >
            Politique de confidentialité
          </Link>.
        </p>
      )}
    </form>
  );
};
