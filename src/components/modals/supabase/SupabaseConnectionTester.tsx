import React from 'react';
import { CheckCircle2, AlertCircle, Server } from 'lucide-react';

interface SupabaseConnectionTesterProps {
  configured: boolean;
  testing: boolean;
  testResult: string | null;
  onTestConnection: () => void;
}

export const SupabaseConnectionTester: React.FC<SupabaseConnectionTesterProps> = ({
  configured,
  testing,
  testResult,
  onTestConnection,
}) => {
  return (
    <div className="space-y-4">
      {/* Status Badge Card */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          configured
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        {configured ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <h4 className="font-bold text-sm">
            {configured ? 'Clés Supabase détectées' : 'Clés de connexion en attente'}
          </h4>
          <p className="text-xs opacity-90 leading-relaxed">
            {configured
              ? 'Le client Supabase JS est configuré avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
              : 'Pour lier votre propre projet Supabase, renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans les secrets du projet ou le fichier .env.'}
          </p>
        </div>
      </div>

      {/* Action to test connection */}
      <div className="flex items-center justify-between bg-kawral-ivory p-4 rounded-2xl border border-kawral-border">
        <div className="flex items-center gap-2.5 text-xs text-kawral-dark font-semibold">
          <Server className="w-4 h-4 text-kawral-green" />
          <span>Tester la requête d'API Supabase</span>
        </div>
        <button
          onClick={onTestConnection}
          disabled={testing}
          className="px-4 py-2 bg-kawral-green text-white text-xs font-bold rounded-xl hover:bg-[#083A34] transition-colors disabled:opacity-50 cursor-pointer"
        >
          {testing ? 'Vérification...' : 'Tester la connexion'}
        </button>
      </div>

      {testResult && (
        <div className="p-3.5 bg-slate-900 text-slate-100 text-xs rounded-xl font-mono leading-relaxed">
          {testResult}
        </div>
      )}
    </div>
  );
};
