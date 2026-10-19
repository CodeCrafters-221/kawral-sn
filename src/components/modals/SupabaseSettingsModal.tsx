import React, { useState } from 'react';
import { X, Database } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { SupabaseConnectionTester } from './supabase/SupabaseConnectionTester';
import { SupabaseSchemaViewer } from './supabase/SupabaseSchemaViewer';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({ isOpen, onClose }) => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const configured = isSupabaseConfigured();

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (!configured) {
        setTestResult(
          "⚠️ Supabase n'est pas encore configuré avec des clés valides (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY)."
        );
        setTesting(false);
        return;
      }

      const { data, error } = await supabase.from('categories').select('*').limit(1);
      if (error) {
        setTestResult(`❌ Erreur Supabase: ${error.message}`);
      } else {
        setTestResult(`✅ Connexion Supabase réussie ! (${data.length} catégorie(s) trouvée(s)).`);
      }
    } catch (err: any) {
      setTestResult(`❌ Erreur: ${err?.message || 'Impossible de se connecter'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-kawral-border overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-kawral-green text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Database className="w-6 h-6 text-kawral-orange" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Configuration Supabase</h3>
              <p className="text-xs text-white/80">Gestion des schémas PostgreSQL et clés de connexion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <SupabaseConnectionTester
            configured={configured}
            testing={testing}
            testResult={testResult}
            onTestConnection={handleTestConnection}
          />

          <SupabaseSchemaViewer />
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-kawral-ivory border-t border-kawral-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-kawral-green text-white font-bold text-xs rounded-xl hover:bg-[#083A34] transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
