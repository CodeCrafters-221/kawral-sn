import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleHelp,
  Compass,
  UserRound,
  Store,
  FileText,
  ShieldCheck,
  Mail,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  X,
} from "lucide-react";

interface MobileHelpBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type HelpView = "home" | "how" | "client" | "seller" | "faq";

interface GuideStep {
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

const HOW_IT_WORKS_STEPS: GuideStep[] = [
  {
    title: "Explorez les annonces",
    description:
      "Parcourez les offres par catégorie (immobilier, véhicules, électronique, mode, matériel professionnel) ou utilisez la recherche par ville et budget.",
  },
  {
    title: "Échangez en direct",
    description:
      "Discutez directement avec le vendeur via la messagerie intégrée, par téléphone ou sur WhatsApp sans intermédiaire.",
  },
  {
    title: "Concluez en toute sécurité",
    description:
      "Visitez le bien ou vérifiez l'article en personne avant tout paiement. Ne versez jamais d'acompte (Wave, Orange Money) avant la rencontre.",
  },
];

const CLIENT_GUIDE_STEPS: GuideStep[] = [
  {
    title: "Rechercher un bien ou un produit",
    description:
      "Utilisez la barre de recherche ou l'onglet « Explorer » pour filtrer les annonces par catégorie, type de transaction (vente ou location), prix et localisation.",
  },
  {
    title: "Consulter une annonce et ses détails",
    description:
      "Ouvrez une fiche pour parcourir les photos, lire la description complète, vérifier les caractéristiques et enregistrer l'annonce dans vos favoris.",
  },
  {
    title: "Contacter le vendeur ou demander une visite",
    description:
      "Envoyez un message depuis l'annonce, appelez le vendeur ou réservez un créneau de visite lorsque la prise de rendez-vous est activée sur l'annonce.",
  },
];

const SELLER_GUIDE_STEPS: GuideStep[] = [
  {
    title: "Activer le mode vendeur et créer une annonce",
    description:
      "Appuyez sur le bouton « Publier » dans la barre de navigation. Si vous avez un compte client, vous pouvez passer en mode vendeur gratuitement en un clic.",
  },
  {
    title: "Ajouter des photos et les informations clés",
    description:
      "Sélectionnez la catégorie, ajoutez des photos claires, indiquez le titre, le prix en FCFA, le quartier/ville et un numéro de téléphone vérifié.",
  },
  {
    title: "Gérer vos annonces et vos visites",
    description:
      "Depuis l'onglet « Compte » > « Mon tableau de bord », modifiez vos annonces, configurez vos créneaux de visite et mettez à jour le statut (Publiée, Indisponible, Vendu, Loué ou Archivée).",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Comment créer un compte ?",
    answer:
      "Ouvrez le menu en haut à droite ou appuyez sur « Connexion » dans la barre inférieure, puis sélectionnez « Créer un compte ». Vous pouvez vous inscrire gratuitement par e-mail ou via Google.",
  },
  {
    question: "Comment publier une annonce ?",
    answer:
      "Appuyez sur le bouton orange « Publier » en bas de l'écran. Si vous êtes connecté en tant que client, activez gratuitement le mode vendeur, puis complétez le formulaire avec vos photos et le prix.",
  },
  {
    question: "Comment contacter un vendeur ou une agence ?",
    answer:
      "Sur la page d'une annonce, utilisez les boutons de contact pour écrire au vendeur dans la messagerie Kawral, l'appeler directement ou le joindre sur WhatsApp.",
  },
  {
    question: "Comment modifier ou gérer une annonce ?",
    answer:
      "Rendez-vous dans l'onglet « Compte » puis « Mon tableau de bord ». Vous pouvez modifier chaque annonce ou changer son statut (Publiée, Indisponible, Vendu, Loué, Archivée).",
  },
  {
    question: "Comment fonctionne la prise de rendez-vous ?",
    answer:
      "Sur les annonces proposant des visites, appuyez sur « Prendre rendez-vous », choisissez une date et un créneau disponible, puis suivez l'état de votre demande dans votre espace « Rendez-vous ».",
  },
  {
    question: "Comment signaler un problème ?",
    answer:
      "Depuis la page de détail d'une annonce, utilisez l'option « Signaler cette annonce » pour alerter la modération, ou écrivez-nous directement par e-mail à code.crafters221@gmail.com.",
  },
];

const VIEW_TITLES: Record<HelpView, { title: string; subtitle: string }> = {
  home: {
    title: "Aide & Informations",
    subtitle: "Guides, questions fréquentes et informations légales",
  },
  how: {
    title: "Comment fonctionne Kawral ?",
    subtitle: "Présentation de la marketplace en 3 étapes",
  },
  client: {
    title: "Guide client",
    subtitle: "Rechercher, consulter et contacter un vendeur",
  },
  seller: {
    title: "Guide vendeur",
    subtitle: "Créer, illustrer et gérer vos annonces",
  },
  faq: {
    title: "Questions fréquentes",
    subtitle: "Réponses aux questions essentielles",
  },
};

export const MobileHelpBottomSheet: React.FC<MobileHelpBottomSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<HelpView>("home");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Réinitialiser la vue à l'ouverture et bloquer le scroll arrière
  useEffect(() => {
    if (!isOpen) return;
    setCurrentView("home");
    setOpenFaqIndex(null);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigateRoute = (path: string) => {
    onClose();
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStepList = (steps: GuideStep[]) => (
    <div className="space-y-3">
      <ol className="space-y-3">
        {steps.map((step, idx) => (
          <li
            key={step.title}
            className="flex gap-3 p-3.5 rounded-xl bg-[#FAF9F6] border border-slate-100"
          >
            <span className="w-6 h-6 rounded-full bg-kawral-green text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-kawral-dark leading-snug">
                {step.title}
              </h4>
              <p className="text-xs text-kawral-muted leading-relaxed mt-1">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => setCurrentView("home")}
        className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-kawral-dark text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Retour à l'accueil de l'aide</span>
      </button>
    </div>
  );

  const headerMeta = VIEW_TITLES[currentView];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panneau d'aide */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={headerMeta.title}
        className="fixed bottom-0 left-0 right-0 z-[60] mx-auto w-full sm:max-w-lg bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[88vh] flex flex-col overflow-hidden border-t border-slate-200"
      >
        {/* Poignée supérieure */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* En-tête avec retour contextuel et bouton de fermeture */}
        <div className="px-5 pt-2 pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {currentView !== "home" ? (
              <button
                type="button"
                onClick={() => setCurrentView("home")}
                className="p-2 -ml-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-kawral-dark transition-colors cursor-pointer shrink-0"
                aria-label="Retour à l'accueil de l'aide"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-kawral-green/10 flex items-center justify-center shrink-0">
                <CircleHelp className="w-4 h-4 text-kawral-green" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-base text-kawral-dark leading-tight truncate">
                {headerMeta.title}
              </h3>
              <p className="text-[11px] text-kawral-muted truncate mt-0.5">
                {headerMeta.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer shrink-0"
            aria-label="Fermer l'aide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenu défilant */}
        <div className="overflow-y-auto overscroll-contain px-5 py-4 flex-1 pb-[max(20px,env(safe-area-inset-bottom,0px))]">
          {currentView === "home" && (
            <div className="space-y-5">
              {/* ── 1. Comprendre Kawral ── */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  1. Comprendre Kawral
                </h4>

                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-[#FAF9F6] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setCurrentView("how")}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-[#F3EFE6] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Compass className="w-4 h-4 text-kawral-green shrink-0" />
                      <span className="text-xs font-bold text-kawral-dark group-hover:text-kawral-green transition-colors truncate">
                        Comment fonctionne Kawral ?
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentView("client")}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-[#F3EFE6] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserRound className="w-4 h-4 text-kawral-green shrink-0" />
                      <span className="text-xs font-bold text-kawral-dark group-hover:text-kawral-green transition-colors truncate">
                        Guide client
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentView("seller")}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-[#F3EFE6] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Store className="w-4 h-4 text-kawral-green shrink-0" />
                      <span className="text-xs font-bold text-kawral-dark group-hover:text-kawral-green transition-colors truncate">
                        Guide vendeur
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                </div>
              </div>

              {/* ── 2. Questions fréquentes ── */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  2. Questions fréquentes
                </h4>

                <button
                  type="button"
                  onClick={() => setCurrentView("faq")}
                  className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-slate-200/80 bg-[#FAF9F6] hover:bg-[#F3EFE6] text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CircleHelp className="w-4 h-4 text-kawral-orange shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-kawral-dark group-hover:text-kawral-green transition-colors">
                        Consulter la FAQ
                      </span>
                      <span className="block text-[11px] text-kawral-muted truncate">
                        Compte, publication, contact, rendez-vous et signalement
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* ── 3. Contact et informations légales ── */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  3. Contact & Informations légales
                </h4>

                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-[#FAF9F6] overflow-hidden">
                  <a
                    href="mailto:code.crafters221@gmail.com"
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-[#F3EFE6] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Mail className="w-4 h-4 text-kawral-orange shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-kawral-dark group-hover:text-kawral-green transition-colors">
                          Nous contacter par e-mail
                        </span>
                        <span className="block text-[11px] text-kawral-muted truncate">
                          code.crafters221@gmail.com
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleNavigateRoute("/terms")}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-[#F3EFE6] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-kawral-green shrink-0" />
                      <span className="text-xs font-bold text-kawral-dark group-hover:text-kawral-green transition-colors truncate">
                        Conditions générales d'utilisation
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigateRoute("/privacy")}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-[#F3EFE6] text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-kawral-green shrink-0" />
                      <span className="text-xs font-bold text-kawral-dark group-hover:text-kawral-green transition-colors truncate">
                        Politique de confidentialité
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentView === "how" && renderStepList(HOW_IT_WORKS_STEPS)}

          {currentView === "client" && renderStepList(CLIENT_GUIDE_STEPS)}

          {currentView === "seller" && renderStepList(SELLER_GUIDE_STEPS)}

          {currentView === "faq" && (
            <div className="space-y-2.5">
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-[#FAF9F6] overflow-hidden">
                {FAQ_ITEMS.map((item, idx) => {
                  const isExpanded = openFaqIndex === idx;
                  return (
                    <div key={item.question} className="bg-transparent">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaqIndex(isExpanded ? null : idx)
                        }
                        aria-expanded={isExpanded}
                        className="w-full flex items-center justify-between gap-3 px-3.5 py-3 text-left hover:bg-[#F3EFE6]/60 transition-colors cursor-pointer"
                      >
                        <span className="text-xs font-bold text-kawral-dark leading-snug">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-kawral-green" : ""
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-3.5 pb-3 pt-0.5 text-xs text-kawral-muted leading-relaxed bg-white/70">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentView("home")}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-kawral-dark text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour à l'accueil de l'aide</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
