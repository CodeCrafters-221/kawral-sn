import React from 'react';

interface AuthForgotFooterProps {
  onBackToLogin: () => void;
}

export const AuthForgotFooter: React.FC<AuthForgotFooterProps> = ({ onBackToLogin }) => (
  <div className="mt-4 text-center">
    <button
      type="button"
      onClick={onBackToLogin}
      className="text-xs font-bold text-kawral-green hover:underline cursor-pointer"
    >
      ← Retour à la connexion
    </button>
  </div>
);
