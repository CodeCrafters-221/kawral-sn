import React from 'react';
import type { AuthFieldErrors, AuthModalMode } from './types';

interface AuthModeTabsProps {
  mode: AuthModalMode;
  setMode: (mode: AuthModalMode) => void;
  setErrorMessage: (message: string | null) => void;
  setFieldErrors: React.Dispatch<React.SetStateAction<AuthFieldErrors>>;
}

const getTabClassName = (isActive: boolean) =>
  `flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
    isActive
      ? 'bg-kawral-green text-white shadow-xs ring-1 ring-kawral-green'
      : 'text-kawral-muted hover:text-kawral-dark'
  }`;

export const AuthModeTabs: React.FC<AuthModeTabsProps> = ({
  mode,
  setMode,
  setErrorMessage,
  setFieldErrors,
}) => {
  const switchMode = (nextMode: AuthModalMode) => {
    setMode(nextMode);
    setErrorMessage(null);
    setFieldErrors({});
  };

  return (
    <div className="bg-white p-1 rounded-2xl border border-slate-200/90 flex items-center mb-6 shadow-2xs">
      <button type="button" onClick={() => switchMode('login')} className={getTabClassName(mode === 'login')}>
        Se connecter
      </button>

      <button type="button" onClick={() => switchMode('register')} className={getTabClassName(mode === 'register')}>
        S'inscrire
      </button>
    </div>
  );
};
