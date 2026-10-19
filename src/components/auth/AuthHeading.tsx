import React from 'react';
import type { AuthModalMode } from './types';

interface AuthHeadingProps {
  mode: AuthModalMode;
}

export const AuthHeading: React.FC<AuthHeadingProps> = ({ mode }) => (
  <div className="mb-6 space-y-1">
    <h2 className="font-black text-2xl text-kawral-dark flex items-center gap-2">
      {mode === 'login' && (
        <>
          Bon retour <span className="inline-block animate-bounce">👋</span>
        </>
      )}
      {mode === 'register' && (
        <>
          Rejoignez Kawral <span className="inline-block animate-bounce">🚀</span>
        </>
      )}
      {mode === 'forgot' && (
        <>
          Mot de passe oublié <span className="inline-block">🔐</span>
        </>
      )}
    </h2>
    <p className="text-xs text-kawral-muted font-medium">
      {mode === 'login' && 'Accédez à vos favoris, messages et annonces.'}
      {mode === 'register' && 'Sélectionnez votre type de profil pour commencer.'}
      {mode === 'forgot' && 'Saisissez votre email pour recevoir le lien de réinitialisation.'}
    </p>
  </div>
);
