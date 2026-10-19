import { KawralLogo } from '../layout/KawralLogo';

export const AuthHeroPanel: React.FC = () => (
  <div className="hidden md:flex md:w-1/2 relative bg-slate-900 flex-col justify-between p-8 text-white overflow-hidden select-none">
    <img
      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      alt="Kawral Architecture"
      referrerPolicy="no-referrer"
      className="absolute inset-0 w-full h-full object-cover opacity-85"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-kawral-green/50 to-slate-900/40 mix-blend-multiply" />

    <div className="relative z-10">
      <div className="inline-flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-lg">
        <KawralLogo size="sm" variant="dark" showTagline={false} />
      </div>
    </div>

    <div className="relative z-10 space-y-2 mt-auto">
      <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
        Achetez. Louez.
        <br />
        <span className="text-kawral-orange">Vendez.</span>
      </h1>
      <p className="text-xs lg:text-sm text-slate-300 leading-relaxed max-w-sm">
        Le point de rencontre de l'offre et de la demande au Sénégal : trouvez le bien ou service idéal au meilleur prix, ou développez votre clientèle en direct.
      </p>
    </div>
  </div>
);
