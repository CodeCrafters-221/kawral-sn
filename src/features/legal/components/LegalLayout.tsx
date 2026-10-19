import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Mail,
  ShieldCheck,
  Calendar,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button, Badge } from '../../../components/ui';

export interface LegalSectionItem {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  icon: React.ReactNode;
  badgeLabel?: string;
  sections: LegalSectionItem[];
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  lastUpdated,
  icon,
  badgeLabel = "Document Officiel",
  sections,
  children,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // offset for sticky navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-kawral-ivory text-kawral-dark  pb-6 sm:pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav className="flex items-center gap-1.5 text-kawral-muted font-medium">
            <Link to="/" className="hover:text-kawral-green transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-kawral-dark font-semibold truncate max-w-[200px] sm:max-w-none">
              {title}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="text-xs hidden sm:inline-flex bg-white hover:bg-slate-50 border-kawral-border"
            >
              Imprimer
            </Button>
            <Link to="/">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                Retour
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Header */}
        <header className="bg-gradient-to-br from-kawral-darkgreen via-kawral-green to-[#0f4d38] text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="accent" size="sm" className="font-bold">
                  {badgeLabel}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Dernière mise à jour : {lastUpdated}</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                {title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-kawral-orange shadow-lg shrink-0 self-start md:self-center">
              {icon}
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar / Table of Contents (Desktop Sticky) */}
          <aside className="lg:col-span-4 hidden lg:block sticky top-24">
            <div className="bg-white rounded-3xl p-6 border border-kawral-border/70 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-kawral-green" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-kawral-dark">
                  Sommaire du document
                </h3>
              </div>

              <nav className="space-y-1 text-xs">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full text-left px-3 py-2 rounded-xl font-medium text-slate-600 hover:text-kawral-green hover:bg-kawral-ivory transition-all cursor-pointer flex items-start gap-2.5 group"
                  >
                    <span className="font-bold text-slate-400 group-hover:text-kawral-orange shrink-0">
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                    <span className="line-clamp-1">{section.title}</span>
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-slate-100">
                <div className="p-3 bg-kawral-ivory rounded-2xl text-[11px] text-slate-600 space-y-1.5">
                  <p className="font-semibold text-kawral-dark flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-kawral-orange" />
                    Contact DPO & Légal
                  </p>
                  <p className="text-slate-500">
                    Pour toute question ou demande relative à vos données :
                  </p>
                  <a
                    href="mailto:code.crafters221@gmail.com"
                    className="font-bold text-kawral-green hover:underline break-all inline-block pt-1"
                  >
                    code.crafters221@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Legal Body Content */}
          <main className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-kawral-border/70 shadow-sm space-y-10 leading-relaxed text-slate-700 text-sm">
            {children}

            {/* Bottom Contact Callout */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200/80 text-emerald-950 space-y-3 mt-12">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-kawral-green text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-kawral-dark">
                    Besoin d'éclaircissements ou d'exercer vos droits ?
                  </h4>
                  <p className="text-xs text-slate-600">
                    Notre équipe est à votre disposition pour toute demande relative à la protection des données ou à nos conditions.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="mailto:code.crafters221@gmail.com"
                  className="inline-flex items-center gap-2 bg-kawral-green hover:bg-kawral-darkgreen text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Écrire à : code.crafters221@gmail.com</span>
                </a>
              </div>
            </div>
          </main>

        </div>

      </div>
    </div>
  );
};
