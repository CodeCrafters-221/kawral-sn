import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { KawralLogo } from './KawralLogo';
import { WhatsAppIcon } from '../ui';
import {
  MapPin,
  Mail,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, setFilters } = useApp();

  const navigateToCategory = (cat: string) => {
    setFilters((prev) => ({
      ...prev,
      category: cat
    }));
    setCurrentView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="hidden sm:block bg-kawral-darkgreen text-white pt-6 sm:pt-8 border-t border-kawral-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10">
        
        {/* Navigation Principale — 4 Colonnes Équilibrées */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pb-5 sm:pb-6">
          
          {/* Colonne 1 : Kawral Sénégal */}
          <div className="space-y-3.5">
            <div onClick={handleGoHome} className="cursor-pointer inline-block" title="Retour à l'accueil Kawral">
              <KawralLogo showTagline={true} size="lg" variant="dark" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kawral est le point de rencontre de l'offre et de la demande au Sénégal pour acheter, louer et vendre en toute sérénité. Immobilier, véhicules, multimédia, mode ou matériel pro : concluez vos affaires en direct.
            </p>
            <div className="flex flex-col gap-1.5 pt-0.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-kawral-orange shrink-0" />
                <span>Dakar, Sénégal — Accessible dans toutes les régions</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-kawral-orange shrink-0" />
                <a href="mailto:code.crafters221@gmail.com" className="hover:underline hover:text-white transition-colors">
                  code.crafters221@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('kawral_pwa_banner_dismissed');
                  window.dispatchEvent(new CustomEvent('open-pwa-install'));
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-kawral-orange text-white border border-white/15 hover:border-kawral-orange text-xs font-semibold transition-all cursor-pointer group"
              >
                <Smartphone className="w-3.5 h-3.5 text-kawral-orange group-hover:text-white transition-colors" />
                <span>Installer l'application Kawral</span>
              </button>
            </div>
          </div>

          {/* Colonne 2 : Catégories phares */}
          <div>
            <h5 className="font-bold text-sm tracking-wide uppercase mb-3 text-kawral-orange">
              Catégories
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => navigateToCategory('immobilier')} className="hover:text-white transition-colors cursor-pointer">
                  Immobilier (Vente & Location)
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('vehicules')} className="hover:text-white transition-colors cursor-pointer">
                  Véhicules & Voitures
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('electronique')} className="hover:text-white transition-colors cursor-pointer">
                  Électronique & Multimédia
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('mode')} className="hover:text-white transition-colors cursor-pointer">
                  Mode & Vêtements
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('maison-jardin')} className="hover:text-white transition-colors cursor-pointer">
                  Maison & Équipements
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('materiel-pro')} className="hover:text-white transition-colors cursor-pointer">
                  Matériel Professionnel
                </button>
              </li>
              <li>
                <button onClick={() => navigateToCategory('loisirs')} className="hover:text-white transition-colors cursor-pointer">
                  Loisirs & Sports
                </button>
              </li>
              <li className="pt-0.5">
                <button
                  onClick={() => {
                    setCurrentView('search');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 font-semibold text-kawral-orange hover:text-white transition-colors cursor-pointer"
                >
                  <span>Explorer toutes les annonces</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Espaces & Services */}
          <div>
            <h5 className="font-bold text-sm text-kawral-ivory tracking-wide uppercase mb-3 text-kawral-orange">
              Espaces & Services
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => setCurrentView('create-listing')}
                  className="hover:text-white transition-colors font-bold text-kawral-orange cursor-pointer inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publier une annonce gratuite</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('seller-dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Espace Vendeur (Gestion de mes annonces)
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('client-dashboard')} className="hover:text-white transition-colors cursor-pointer">
                  Mon Espace Client
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('appointments')} className="hover:text-white transition-colors cursor-pointer">
                  Mes Rendez-vous de visite
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('messaging')} className="hover:text-white transition-colors cursor-pointer">
                  Messagerie & Échanges
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('search')} className="hover:text-white transition-colors cursor-pointer">
                  Recherche & Filtres avancés
                </button>
              </li>
              <li className="pt-0.5">
                <a
                  href="https://chat.whatsapp.com/Bbq6QqEqQMEE5CuN0LWsQy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors font-semibold text-[#25D366] cursor-pointer inline-flex items-center gap-1.5"
                >
                  <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
                  <span>Rejoindre la communauté WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Sécurité & Confiance au Sénégal */}
          <div className="space-y-3">
            <h5 className="font-bold text-sm text-kawral-ivory tracking-wide uppercase text-kawral-orange">
              Sécurité & Confiance
            </h5>
            
            {/* Encadré Conseils de sécurité au Sénégal */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-kawral-orange text-xs font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Conseils de sécurité</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Ne versez <strong>jamais d'acompte</strong> (Wave, Orange Money) avant d'avoir vu le bien. Privilégiez les remises en main propre en lieu public.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors cursor-pointer block">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors cursor-pointer block">
                  Conditions d'utilisation (CGU)
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('admin-dashboard')}
                  className="hover:text-white transition-colors text-slate-400 text-[11px] cursor-pointer pt-1 block"
                >
                  Espace Administration
                </button>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Bandeau Légal et Copyright (Conformité Google OAuth & Réglementaire) */}
      <div className="bg-[#09221a] text-slate-400 py-2 pb-footer-safe sm:py-2 px-4 sm:px-8 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Kawral Technologies SARL. Fait avec passion au Sénégal 🇸🇳</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300 font-medium text-xs">
            <Link to="/privacy" className="hover:text-white hover:underline transition-colors">
              Politique de confidentialité
            </Link>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <Link to="/terms" className="hover:text-white hover:underline transition-colors">
              Conditions d'utilisation
            </Link>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <a href="mailto:code.crafters221@gmail.com" className="hover:text-white hover:underline transition-colors">
              code.crafters221@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
