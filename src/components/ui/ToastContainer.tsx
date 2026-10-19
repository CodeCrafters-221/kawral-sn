import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X, Wifi } from 'lucide-react';

const TOAST_DURATION = 4000; // ms

interface ToastItemProps {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, type, message, onRemove }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Mount animation
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss
    const dismissTimer = setTimeout(() => handleDismiss(), TOAST_DURATION);
    return () => clearTimeout(dismissTimer);
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 350);
  };

  const config = {
    success: {
      bg: 'bg-kawral-green',
      border: 'border-emerald-800/40',
      bar: 'bg-kawral-orange',
      icon: <CheckCircle2 className="w-5 h-5 text-kawral-orange shrink-0" />,
      label: 'Succès',
    },
    error: {
      bg: 'bg-rose-700',
      border: 'border-rose-900/40',
      bar: 'bg-rose-300',
      icon: <AlertCircle className="w-5 h-5 text-rose-200 shrink-0" />,
      label: 'Erreur',
    },
    info: {
      bg: 'bg-kawral-dark',
      border: 'border-slate-600/40',
      bar: 'bg-amber-400',
      icon: <Info className="w-5 h-5 text-amber-400 shrink-0" />,
      label: 'Info',
    },
  }[type];

  return (
    <div
      className={`
        pointer-events-auto w-full overflow-hidden rounded-2xl shadow-2xl border
        ${config.bg} ${config.border}
        transition-all duration-350 ease-out
        ${visible && !leaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
      `}
      style={{ willChange: 'transform, opacity' }}
    >
      {/* Progress bar */}
      <div className="relative h-0.5 w-full bg-white/10 overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full ${config.bar} rounded-full`}
          style={{
            animation: `toast-progress ${TOAST_DURATION}ms linear forwards`,
          }}
        />
      </div>

      <div className="flex items-start gap-3 p-4">
        {/* Icon bubble */}
        <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
          {config.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black text-white/60 uppercase tracking-wider mb-0.5">
            {config.label}
          </p>
          <p className="text-sm font-semibold text-white leading-snug break-words">
            {message}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1.5 rounded-xl hover:bg-white/15 transition-colors text-white/60 hover:text-white cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div
      className="fixed bottom-24 md:bottom-8 right-4 z-[9999] flex flex-col gap-3 w-[340px] max-w-[calc(100vw-2rem)] pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};
