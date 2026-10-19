import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  hasError?: boolean;
  id?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  className = '',
  hasError = false,
  id,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pr-11 px-4 py-3 bg-white border rounded-2xl text-xs font-medium text-kawral-dark placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-kawral-green/20 focus:border-kawral-green transition-all ${
          hasError ? 'border-rose-400' : 'border-slate-200'
        } ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-kawral-green transition-colors p-1"
        tabIndex={-1}
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {visible
          ? <EyeOff className="w-4 h-4" />
          : <Eye    className="w-4 h-4" />
        }
      </button>
    </div>
  );
};
