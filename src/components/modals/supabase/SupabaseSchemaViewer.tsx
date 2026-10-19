import React, { useState } from 'react';
import { Terminal, Copy, Check, ShieldCheck } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, SUPABASE_TABLES } from '../../../data/supabaseSchema';

export const SupabaseSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* SQL Schema Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-kawral-dark flex items-center gap-2">
            <Terminal className="w-4 h-4 text-kawral-green" />
            Schéma SQL des 9 tables Supabase
          </label>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-kawral-green/10 text-kawral-green hover:bg-kawral-green/20 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copié !' : 'Copier SQL'}
          </button>
        </div>

        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
          <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56 leading-relaxed select-all">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      </div>

      {/* Table summary badge list */}
      <div className="space-y-2">
        <h5 className="text-xs font-bold text-kawral-dark flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-kawral-green" />
          Tables & RLS activées ({SUPABASE_TABLES.length})
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {SUPABASE_TABLES.map((table) => (
            <div
              key={table}
              className="p-2.5 bg-kawral-ivory rounded-xl border border-kawral-border font-mono text-[11px] font-bold text-kawral-green flex items-center justify-between"
            >
              <span>public.{table}</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-sans font-bold">
                RLS
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
