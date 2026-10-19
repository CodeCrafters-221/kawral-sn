import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  PlusCircle, 
  Building2, 
  MessageSquare, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2,
  Search,
  PhoneCall,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface OnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
  isOpen: externalIsOpen, 
  onClose: externalOnClose 
}) => {
  const { setCurrentView, currentUser, setAuthModalOpen, setAuthModalMode } = useApp();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-trigger on first visit if controlled externally
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setInternalIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  const handleClose = () => {
    setInternalIsOpen(false);
    if (externalOnClose) externalOnClose();
  };

  if (!internalIsOpen) return null;

  const steps = [
    {
      title: "Bienvenue sur Kawral Immo ! 👋",
      subtitle: "La plateforme immobilière de référence au Sénégal pour acheter, louer et vendre en toute sérénité.",
      badge: "Découverte rapide",
      icon: <Compass className="w-8 h-8 text-kawral-orange" />,
      illustration: (
        <div className="bg-gradient-to-br from-kawral-green/10 to-kawral-orange/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center my-4 border border-kawral-green/10">
          <div className="w-16 h-16 bg-kawral-green rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h4 className="font-extrabold text-kawral-dark text-base mb-1">Annonces vérifiées & Agences de confiance</h4>
          <p className="text-xs text-slate-600 max-w-sm">
            Trouvez des appartements, villas, terrains et bureaux à Dakar, Saly, Thiès et partout au Sénégal.
          </p>
        </div>
      ),
      tips: [
        { icon: <Search className="w-4 h-4 text-kawral-green" />, text: "Filtrez par quartier, budget, nombre de chambres et type de transaction." },
        { icon: <ShieldCheck className="w-4 h-4 text-kawral-green" />, text: "Toutes les annonces sont contrôlées par notre équipe avant publication." }
      ]
    },
    {
      title: "Comment contacter une agence ou un vendeur ?",
      subtitle: "Mise en relation rapide, sécurisée et directe sans intermédiaire masqué.",
      badge: "Acheteurs & Locataires",
      icon: <PhoneCall className="w-8 h-8 text-kawral-green" />,
      illustration: (
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 my-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-kawral-green/10 flex items-center justify-center text-kawral-green">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-kawral-dark">Message Direct & WhatsApp</p>
              <p className="text-[11px] text-slate-500">Posez vos questions et négociez en direct avec l'agent ou le propriétaire.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-kawral-orange/10 flex items-center justify-center text-kawral-orange">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-kawral-dark">Demande de Visite en 1 Clic</p>
              <p className="text-[11px] text-slate-500">Choisissez la date et l'heure de votre visite directement depuis la fiche de l'annonce.</p>
            </div>
          </div>
        </div>
      ),
      tips: [
        { icon: <Building2 className="w-4 h-4 text-kawral-orange" />, text: "Consultez l'annuaire des agences agréées pour voir leurs biens et coordonnées vérifiées." }
      ],
      action: {
        label: "Découvrir les agences partenaires",
        onClick: () => {
          handleClose();
          setCurrentView('agencies');
        }
      }
    },
    {
      title: "Comment publier une annonce d'immobilier ?",
      subtitle: "Réservé aux Propriétaires, Vendeurs indépendants et Agences immobilières.",
      badge: "Vendeurs & Agences",
      icon: <PlusCircle className="w-8 h-8 text-kawral-orange" />,
      illustration: (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-2xl border border-orange-200/60 my-4 flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-kawral-orange text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
            <p className="text-xs text-slate-700 font-medium">Cliquez sur <strong className="text-kawral-orange">« Publier une annonce »</strong> dans la barre supérieure.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-kawral-orange text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
            <p className="text-xs text-slate-700 font-medium">Renseignez les détails (titre, prix, quartier, photos HD, caractéristiques).</p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-kawral-orange text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
            <p className="text-xs text-slate-700 font-medium">Publication immédiate sur le site dès la soumission du formulaire.</p>
          </div>
          <div className="mt-2 p-2.5 bg-white/80 rounded-xl text-[11px] text-slate-600 border border-orange-100 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-kawral-green shrink-0" />
            <span><em>Note :</em> Si vous êtes un simple acheteur, vous n'avez pas besoin de publier. Le bouton est automatiquement masqué.</span>
          </div>
        </div>
      ),
      tips: [
        { icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, text: "Augmentez la visibilité de vos biens auprès de milliers d'acquéreurs qualifiés." }
      ],
      action: currentUser?.role !== 'client' ? {
        label: "Créer une annonce",
        onClick: () => {
          handleClose();
          if (!currentUser) {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          } else {
            setCurrentView('create-listing');
          }
        }
      } : undefined
    }
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-kawral-border flex flex-col max-h-[92vh]">
        
        {/* Header Header Bar */}
        <div className="bg-kawral-green px-6 py-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              {current.icon}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-kawral-orange bg-white/10 px-2 py-0.5 rounded-full inline-block mb-0.5">
                {current.badge} • Étape {currentStep + 1}/{steps.length}
              </span>
              <h3 className="text-base font-black leading-tight text-white">{current.title}</h3>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            title="Fermer le guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-kawral-dark">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            {current.subtitle}
          </p>

          {current.illustration}

          {/* Tips checklist */}
          <div className="flex flex-col gap-2 mt-3">
            {current.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="shrink-0 mt-0.5">{tip.icon}</span>
                <span>{tip.text}</span>
              </div>
            ))}
          </div>

          {/* Action button inside step if available */}
          {current.action && (
            <div className="mt-4 pt-2">
              <button
                onClick={current.action.onClick}
                className="w-full py-2.5 px-4 bg-kawral-green hover:bg-[#083A34] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <span>{current.action.label}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx ? 'w-6 bg-kawral-orange' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Aller à l'étape ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Précédent</span>
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-2 text-xs font-bold text-white bg-kawral-green hover:bg-[#083A34] rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
              >
                <span>Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-xs font-bold text-white bg-kawral-orange hover:bg-orange-600 rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>J'ai compris !</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
