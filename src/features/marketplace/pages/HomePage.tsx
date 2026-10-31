import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { HeroSection } from "../components/HeroSection";
import { ListingGrid } from "../../../components/marketplace/ListingGrid";
import { BecomeSellerModal } from "../../../components/modals/BecomeSellerModal";
import { SeoHead } from "../../../components/seo/SeoHead";
import {
  ArrowRight,
  PlusCircle,
  Sparkles,
} from "lucide-react";

import { isCategoryMatching } from "../../../data/categoriesData";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { listings, setCurrentView, setFilters, currentUser, isLoadingListings } = useApp();
  const [becomeSellerModalOpen, setBecomeSellerModalOpen] = useState(false);

  // Exactement 2 lignes sur desktop (8 annonces : 4 par ligne sur desktop, 2 par ligne sur mobile)
  const featuredListings = listings
    .filter((item) => item.status === "published")
    .slice(0, 8);

  // Exactement 2 lignes sur desktop (8 annonces tendance les plus consultées)
  const trendingListings = [...listings]
    .filter((item) => item.status === "published")
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 8);

  // Exactement 1 seule ligne sur desktop (4 annonces)
  // Utilise isCategoryMatching pour inclure tous les biens immobiliers (appartements, villas, terrains, etc.)
  const realEstateListings = listings
    .filter((item) => item.status === "published" && isCategoryMatching(item.category, "immobilier"))
    .slice(0, 4);

  // Exactement 1 seule ligne sur desktop (4 annonces)
  // Utilise isCategoryMatching pour inclure tous les appareils électroniques (téléphones, PC, etc.)
  const electronicsListings = listings
    .filter((item) => item.status === "published" && isCategoryMatching(item.category, "electronique"))
    .slice(0, 4);

  const navigateToCategory = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat }));
    if (cat) {
      navigate(`/categories/${cat}`);
    } else {
      navigate("/explorer");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-10 sm:space-y-12" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
      <SeoHead
        title="Kawral | Achetez. Louez. Vendez. — Marketplace Sénégal"
        description="Le point de rencontre de l'offre et de la demande au Sénégal : petites annonces directes (immobilier, véhicules, multimédia, mode, matériel pro). Achetez, louez et vendez sans intermédiaire."
        canonicalPath="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Comment publier une annonce sur Kawral au Sénégal ?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Créez gratuitement votre compte vendeur sur Kawral, ajoutez les photos, le prix en FCFA et la localisation de votre bien (Dakar, Thiès, Mbour, Saly, Saint-Louis...), puis publiez votre annonce en moins de 2 minutes."
              }
            },
            {
              "@type": "Question",
              "name": "Comment contacter un propriétaire ou vendeur sur Kawral ?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sur chaque annonce, vous pouvez contacter directement le vendeur par téléphone, par WhatsApp, via la messagerie interne sécurisée ou réserver un créneau de visite en ligne sans frais d'intermédiaire."
              }
            },
            {
              "@type": "Question",
              "name": "Quelles catégories d'annonces sont disponibles sur Kawral Sénégal ?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Kawral regroupe 8 grandes catégories au Sénégal : Immobilier (appartements, villas, studios, terrains, bureaux), Véhicules (voitures, motos, utilitaires, pièces), Électronique & Multimédia, Mode & Beauté, Maison & Meubles, Matériel Professionnel, Loisirs & Sport, et Services."
              }
            }
          ]
        }}
      />

      {/* ── HERO SECTION : CARROUSEL 8 CATÉGORIES AVEC OVERLAY SOMBRE & CONTROLES ── */}
      <HeroSection />

      {/* ── GRILLE DES ANNONCES RÉCENTES (EXACTEMENT 4 PAR LIGNE SUR DESKTOP, 2 SUR MOBILE) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-kawral-dark">
              Annonces récentes
            </h2>
            <p className="text-xs text-kawral-muted mt-0.5">
              Trouvez votre bonheur parmi les annonces publiées au Sénégal
            </p>
          </div>
          <Link
            to="/explorer"
            onClick={() => setCurrentView("search")}
            className="flex items-center gap-1 text-xs font-bold text-kawral-orange hover:underline cursor-pointer"
          >
            <span>Voir toutes les annonces</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ListingGrid listings={featuredListings} showControls={false} skeletonCount={8} />
      </section>

      {/* ── TENDANCE SUR KAWRAL ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-kawral-dark">
              Tendance sur Kawral
            </h2>
            <p className="text-xs text-kawral-muted mt-0.5">
              Les annonces les mieux notées et les plus populaires
            </p>
          </div>
          <Link
            to="/explorer"
            onClick={() => setCurrentView("search")}
            className="flex items-center gap-1 text-xs font-bold text-kawral-orange hover:underline cursor-pointer"
          >
            <span>Voir toutes les annonces</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ListingGrid
          listings={trendingListings}
          showControls={false}
          skeletonCount={8}
          mobileHorizontalScroll={true}
          prioritizeFirstRow={false}
        />
      </section>

      {/* ── LOCATION & VENTE IMMOBILIERE (1 LIGNE) ── */}
      {(isLoadingListings || realEstateListings.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-kawral-dark">
                Location & Vente immobilière
              </h2>
              <p className="text-xs text-kawral-muted mt-0.5">
                Découvrez les meilleures offres immobilières
              </p>
            </div>
            <Link
              to="/categories/immobilier"
              onClick={(e) => {
                e.preventDefault();
                navigateToCategory("immobilier");
              }}
              className="flex items-center gap-1 text-xs font-bold text-kawral-orange hover:underline cursor-pointer"
            >
              <span>Voir toutes les annonces</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ListingGrid listings={realEstateListings} showControls={false} skeletonCount={4} prioritizeFirstRow={false} />
        </section>
      )}

      {/* ── APPAREILS ELECTRONIQUES (1 LIGNE) ── */}
      {(isLoadingListings || electronicsListings.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-kawral-dark">
                Appareils électroniques
              </h2>
              <p className="text-xs text-kawral-muted mt-0.5">
                Trouvez les derniers gadgets et appareils électroniques
              </p>
            </div>
            <Link
              to="/categories/electronique"
              onClick={(e) => {
                e.preventDefault();
                navigateToCategory("electronique");
              }}
              className="flex items-center gap-1 text-xs font-bold text-kawral-orange hover:underline cursor-pointer"
            >
              <span>Voir toutes les annonces</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ListingGrid listings={electronicsListings} showControls={false} skeletonCount={4} prioritizeFirstRow={false} />
        </section>
      )}

      {/* ── BANNIÈRE VENDEUR / PROPRIÉTAIRE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-kawral-green text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 border border-emerald-800">
          <div className="space-y-3 text-center lg:text-left max-w-xl z-10">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <span className="inline-block bg-kawral-orange text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {currentUser?.role === "client"
                  ? "Espace Client — Évolution de profil"
                  : currentUser?.role === "seller"
                    ? "Propriétaire / Vendeur"
                    : "Annonceurs & Propriétaires"}
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
              {currentUser?.role === "client"
                ? "Vous êtes client ? Devenez vendeur et publiez vos biens"
                : currentUser?.role === "seller"
                  ? "Prêt à publier une nouvelle annonce ?"
                  : "Vous avez un bien à vendre ou à louer ?"}
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {currentUser?.role === "client"
                ? "Activez gratuitement votre statut vendeur pour mettre en ligne vos annonces, gérer vos créneaux de visite et échanger avec les acheteurs."
                : currentUser?.role === "seller"
                  ? "Publiez votre annonce en quelques minutes ou gérez vos rendez-vous de visite depuis votre tableau de bord."
                  : "Publiez votre annonce en 2 minutes et touchez directement des milliers d'acheteurs au Sénégal."}
            </p>
          </div>

          <div className="z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {currentUser?.role === "client" ? (
              <button
                type="button"
                onClick={() => setBecomeSellerModalOpen(true)}
                className="bg-kawral-orange hover:bg-kawral-orange-hover text-white px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 text-white shrink-0" />
                <span>Devenir vendeur</span>
              </button>
            ) : !currentUser ? (
              <Link
                to="/auth/register/seller"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-kawral-orange hover:bg-kawral-orange-hover text-white no-underline px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                <PlusCircle className="w-4 h-4 text-white shrink-0" />
                <span>Devenir vendeur</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/dashboard/seller/listings/new"
                  onClick={() => {
                    setCurrentView("create-listing");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-kawral-orange hover:bg-kawral-orange-hover text-white no-underline px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <PlusCircle className="w-4 h-4 text-white shrink-0" />
                  <span>Publier une annonce</span>
                </Link>
                <Link
                  to="/dashboard/seller"
                  onClick={() => {
                    setCurrentView("seller-dashboard");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white no-underline border border-white/20 px-4 py-3 sm:py-3.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <span>Mon tableau de bord</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Modale de confirmation pour devenir vendeur */}
      <BecomeSellerModal
        isOpen={becomeSellerModalOpen}
        onClose={() => setBecomeSellerModalOpen(false)}
      />

      {/* Contenu éditorial sémantique longue traîne pour l'indexation des recherches locales au Sénégal */}
      <section aria-label="Présentation de la marketplace Kawral au Sénégal" className="sr-only">
        <h2>Kawral — Le site de petites annonces directes au Sénégal (Dakar et régions)</h2>
        <p>
          Bienvenue sur Kawral (kawral.sn), la plateforme sénégalaise dédiée à l'achat, la location et la vente en direct entre particuliers et professionnels. Trouvez des annonces vérifiées d'immobilier à Dakar (Almadies, Plateau, Mermoz, Sacré-Cœur, Ngor, Ouakam, Yoff, Parcelles Assainies, Pikine, Guédiawaye, Rufisque, Diamniadio), sur la Petite Côte (Mbour, Saly Portudal, Somone), à Thiès, Saint-Louis, Touba, Kaolack et Ziguinchor.
        </p>
        <p>
          Comparez les prix en Franc CFA (FCFA) pour votre futur appartement, maison, villa, studio meublé, terrain titre foncier, voiture d'occasion, moto, téléphone iPhone ou Samsung, ordinateur portable, mobilier ou équipement professionnel, et prenez rendez-vous directement avec le vendeur sans commission.
        </p>
      </section>
    </div>
  );
};
