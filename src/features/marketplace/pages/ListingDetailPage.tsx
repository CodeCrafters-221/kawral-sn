import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { AppointmentModal } from "../../../components/modals/AppointmentModal";
import { ReportListingModal } from "../../../components/modals/ReportListingModal";
import { Accordion, AudioPlayer } from "../../../components/ui";
import { ContactCard } from "../../../components/marketplace/ContactCard";
import { ListingHeroGallery } from "../components/listing-detail/ListingHeroGallery";
import { ListingKeyStats } from "../components/listing-detail/ListingKeyStats";
import { ListingLocationMap } from "../components/listing-detail/ListingLocationMap";
import { ListingMobileBottomBar } from "../components/listing-detail/ListingMobileBottomBar";
import { CheckCircle2, ShieldAlert, Shield, Check, Zap, ArrowLeft, ChevronLeft, ChevronRight, Home, MapPin, Tag, KeyRound, PauseCircle, Hash } from "lucide-react";
import { listingsService } from "../../../services/supabase/listingsService";
import { ListingCard } from "../../../components/marketplace/ListingCard";
import { Listing } from "../../../types";
import { getCategoryLabel, formatPriceFCFA } from "../../../utils/formatters";
import { findParentMainCategory } from "../../../data/categoriesData";
import { SeoHead } from "../../../components/seo/SeoHead";
import { isAppointmentEligible } from "../../../utils/appointments";
import { getCharacteristicsForCategory } from "../../../data/characteristicsRegistry";
import { getListingRef } from "../../../utils/whatsapp";
import { trackMarketingEvent } from "../../../lib/analytics";

export const ListingDetailPage: React.FC = () => {
  const {
    currentUser,
    listings,
    isLoadingListings,
    setCurrentView,
    isFavorite,
    toggleFavorite,
    startConversation,
    addToast,
    setAuthModalOpen,
    setAuthModalMode,
  } = useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fetchedListing, setFetchedListing] = useState<Listing | null>(null);
  const [isFetchingDirect, setIsFetchingDirect] = useState(false);

  // Listing from context if available, otherwise from direct fetch
  const listing = listings.find((item) => item.id === id) || fetchedListing;

  useEffect(() => {
    if (!id) return;
    const foundInContext = listings.find((item) => item.id === id);
    if (foundInContext) {
      setFetchedListing(null);
      return;
    }

    if (!isLoadingListings) {
      let isMounted = true;
      setIsFetchingDirect(true);
      listingsService
        .fetchListingById(id)
        .then((data) => {
          if (isMounted) {
            setFetchedListing(data);
            setIsFetchingDirect(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsFetchingDirect(false);
          }
        });
      return () => {
        isMounted = false;
      };
    }
  }, [id, listings, isLoadingListings]);

  // True when the connected user is looking at their own listing
  const isOwner = !!(currentUser && listing && currentUser.id === listing.ownerId);

  useEffect(() => {
    if (!listing?.id || isOwner) return;
    const viewedKey = `kawral_viewed_${listing.id}`;
    try {
      if (sessionStorage.getItem(viewedKey)) return;
      sessionStorage.setItem(viewedKey, "1");
    } catch {
      // sessionStorage indisponible (mode privé strict)
    }
    listingsService.incrementViews(listing.id);
    trackMarketingEvent("view_item", {
      item_id: listing.id,
      item_name: listing.title,
      item_category: listing.categoryLabel,
      price: listing.price,
      city: listing.location.city,
    });
  }, [listing?.id, isOwner]);

  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [similarPage, setSimilarPage] = useState(1);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [similarListingsError, setSimilarListingsError] = useState(false);

  useEffect(() => {
    if (!listing?.category || !listing.id) {
      setSimilarListings([]);
      return;
    }

    let isMounted = true;
    setSimilarPage(1);
    setSimilarListings([]);
    setSimilarListingsError(false);
    setIsLoadingSimilar(true);

    listingsService
      .fetchSimilarListings(listing.category, listing.id, 60)
      .then((data) => {
        if (isMounted) setSimilarListings(data);
      })
      .catch(() => {
        if (isMounted) setSimilarListingsError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoadingSimilar(false);
      });

    return () => {
      isMounted = false;
    };
  }, [listing?.category, listing?.id]);

  const similarPageSize = 4;
  const similarPageCount = Math.ceil(similarListings.length / similarPageSize);
  const visibleSimilarListings = similarListings.slice(
    (similarPage - 1) * similarPageSize,
    similarPage * similarPageSize,
  );
  const firstVisibleSimilarPage = Math.max(
    1,
    Math.min(similarPage - 1, similarPageCount - 2),
  );
  const visibleSimilarPages = Array.from(
    { length: Math.min(3, similarPageCount) },
    (_, index) => firstVisibleSimilarPage + index,
  );

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Auto-slide every 4s, stops on user interaction */
  useEffect(() => {
    if (!listing || listing.images.length <= 1 || userInteracted) return;
    autoSlideRef.current = setInterval(() => {
      setActiveImageIdx((prev) =>
        prev === listing.images.length - 1 ? 0 : prev + 1,
      );
    }, 4000);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [listing, userInteracted]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null) return;
      const delta = touchStart - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) {
        setUserInteracted(true);
        if (autoSlideRef.current) clearInterval(autoSlideRef.current);
        setActiveImageIdx((prev) => {
          const len = listing?.images.length ?? 1;
          if (delta > 0) return prev === len - 1 ? 0 : prev + 1;
          return prev === 0 ? len - 1 : prev - 1;
        });
      }
      setTouchStart(null);
    },
    [touchStart, listing],
  );

  if (!listing && (isLoadingListings || isFetchingDirect)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-kawral-green border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Chargement de l'annonce...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SeoHead title="Annonce introuvable | Kawral" noIndex={true} />
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-kawral-dark">
            Annonce introuvable
          </h2>
          <button
            onClick={() => navigate("/explorer")}
            className="bg-kawral-green text-white px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer"
          >
            Retour aux annonces
          </button>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(listing.id);
  const isListingAvailable = listing.status === "published";
  // Rendez-vous uniquement pour l'immobilier et les véhicules si l'annonce est en ligne
  const canBookAppointment = isAppointmentEligible(listing.category) && isListingAvailable;
  const listingRef = getListingRef(listing.id);

  const handleChat = () => {
    if (!currentUser) {
      setAuthModalMode("login");
      setAuthModalOpen(true);
      addToast("Connectez-vous pour contacter le vendeur.", "info");
      return;
    }
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://kawral.sn";
    const convId = startConversation(
      listing,
      `Bonjour, je vous contacte pour "${listing.title}" (Réf: ${listingRef}). Est-elle disponible ?\nLien de l'annonce : ${origin}/listings/${listing.id}`,
    );
    if (convId) {
      setCurrentView("messaging");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Lien copié !", "info");
  };

  const equipmentList = (() => {
    if (!listing.characteristics) return [];
    
    const fields = getCharacteristicsForCategory(listing.category);
    const checkboxes = fields.filter(f => f.type === 'checkbox');
    
    const mapped = checkboxes
      .filter(f => listing.characteristics![f.id])
      .map(f => ({
        key: true,
        label: f.label
      }));

    if (mapped.length > 0) return mapped;
    
    // Fallback static fields for legacy or non-mapped items
    const fallbackList = [
      { key: listing.characteristics.furnished, label: "Meublé" },
      { key: listing.characteristics.parking, label: "Parking / Livraison" },
      { key: listing.characteristics.airConditioning, label: "Climatisation" },
      { key: listing.characteristics.security, label: "Sécurité / Gardiennage" },
      { key: listing.characteristics.generator, label: "Groupe électrogène" },
      { key: listing.characteristics.pool, label: "Piscine" },
      { key: listing.characteristics.waterTank, label: "Réserve d'eau" },
      { key: listing.characteristics.elevator, label: "Ascenseur" },
    ].filter((e) => e.key);

    return fallbackList;
  })();

  const handleBackToAnnouncements = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/explorer");
    }
  };

  return (
    <div className="relative min-h-screen bg-kawral-ivory pt-2 sm:pt-4 lg:pt-6 lg:pb-12">
      <SeoHead
        title={`${listing.title} — ${formatPriceFCFA(listing.price)} à ${listing.location.city} | Kawral`}
        description={`${listing.transactionType === "rent" ? "À louer" : "À vendre"} à ${[listing.location.neighborhood, listing.location.city].filter(Boolean).join(", ") || "Sénégal"} (${formatPriceFCFA(listing.price)}) : ${listing.description || `${getCategoryLabel(listing.category)} disponible sur Kawral Sénégal.`}`}
        canonicalPath={`/listings/${listing.id}`}
        ogImage={listing.images?.[0]}
        ogType="product"
        noIndex={!isListingAvailable && listing.status === "archived"}
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Accueil",
                  "item": "https://www.kawral.sn/"
                },
                ...(findParentMainCategory(listing.category)
                  ? [
                      {
                        "@type": "ListItem",
                        "position": 2,
                        "name": findParentMainCategory(listing.category)!.label,
                        "item": `https://www.kawral.sn/categories/${findParentMainCategory(listing.category)!.slug}`
                      },
                      {
                        "@type": "ListItem",
                        "position": 3,
                        "name": getCategoryLabel(listing.category),
                        "item": `https://www.kawral.sn/categories/${listing.category}`
                      },
                      {
                        "@type": "ListItem",
                        "position": 4,
                        "name": listing.title,
                        "item": `https://www.kawral.sn/listings/${listing.id}`
                      }
                    ]
                  : [
                      {
                        "@type": "ListItem",
                        "position": 2,
                        "name": getCategoryLabel(listing.category),
                        "item": `https://www.kawral.sn/categories/${listing.category}`
                      },
                      {
                        "@type": "ListItem",
                        "position": 3,
                        "name": listing.title,
                        "item": `https://www.kawral.sn/listings/${listing.id}`
                      }
                    ])
              ]
            },
            {
              "@type": "Product",
              "name": listing.title,
              "description": listing.description || listing.title,
              "image": listing.images,
              "sku": listing.id,
              "category": getCategoryLabel(listing.category),
              "offers": {
                "@type": "Offer",
                "url": `https://www.kawral.sn/listings/${listing.id}`,
                "priceCurrency": "XOF",
                "price": listing.price,
                "availability": isListingAvailable
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                "areaServed": {
                  "@type": "Place",
                  "name": `${[listing.location.neighborhood, listing.location.city].filter(Boolean).join(", ") || "Dakar"}, Sénégal`
                },
                "seller": {
                  "@type": "Person",
                  "name": listing.owner.name || "Vendeur Kawral"
                }
              }
            }
          ]
        }}
      />
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6">
        
        {/* Navigation supérieure fluide : Bouton Retour et fil d'Ariane */}
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-2 sm:gap-3 bg-white/80 backdrop-blur-md p-2.5 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBackToAnnouncements}
              className="group inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 hover:text-kawral-green border border-slate-200 shadow-2xs font-extrabold text-xs sm:text-sm transition-all cursor-pointer"
              aria-label="Retour vers les annonces"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-kawral-green" />
              <span>Retour aux annonces</span>
            </button>

            {/* Bouton direct vers l'accueil sur mobile */}
            <Link
              to="/"
              className="sm:hidden inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-kawral-green border border-slate-200 shadow-2xs font-bold text-xs transition-colors"
              title="Retour à l'accueil"
              aria-label="Accueil"
            >
              <Home className="w-3.5 h-3.5 text-slate-500" />
              <span>Accueil</span>
            </Link>
          </div>

          {/* Fil d'Ariane (breadcrumb) */}
          <nav
            aria-label="Fil d'Ariane"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-semibold truncate pr-2"
          >
            <Link to="/" className="flex items-center gap-1 hover:text-kawral-green transition-colors">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Accueil</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link to="/explorer" className="hover:text-kawral-green transition-colors">
              Explorer
            </Link>
            {listing.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <Link
                  to={`/explorer?category=${listing.category}`}
                  className="hover:text-kawral-green transition-colors truncate max-w-[140px]"
                >
                  {getCategoryLabel(listing.category)}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-900 font-bold truncate max-w-[180px] md:max-w-[280px]">
              {listing.title}
            </span>
          </nav>
        </div>

        {/* Bannière de statut Marketplace (Vendu / Loué / Indisponible) */}
        {(listing.status === "sold" || listing.status === "rented" || listing.status === "unavailable") && (
          <div
            role="status"
            className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-2xl flex items-start sm:items-center gap-3 border shadow-xs animate-fade-in ${
              listing.status === "sold"
                ? "bg-orange-50 border-kawral-orange/30 text-kawral-dark"
                : listing.status === "rented"
                  ? "bg-emerald-50 border-kawral-green/25 text-kawral-dark"
                  : "bg-slate-100 border-slate-300 text-kawral-dark"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 text-white ${
                listing.status === "sold"
                  ? "bg-kawral-orange"
                  : listing.status === "rented"
                    ? "bg-kawral-green"
                    : "bg-slate-600"
              }`}
            >
              {listing.status === "sold" ? (
                <Tag className="w-5 h-5" />
              ) : listing.status === "rented" ? (
                <KeyRound className="w-5 h-5" />
              ) : (
                <PauseCircle className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-sm sm:text-base uppercase tracking-wide leading-snug">
                {listing.status === "sold"
                  ? "Article vendu"
                  : listing.status === "rented"
                    ? "Bien loué"
                    : "Annonce indisponible"}
              </p>
              <p className="text-xs text-kawral-muted mt-0.5 leading-relaxed">
                {listing.status === "sold" || listing.status === "rented"
                  ? "La transaction est conclue. La prise de contact et les rendez-vous ne sont plus disponibles."
                  : "Le vendeur a suspendu cette annonce (rupture de stock ou pause). Revenez plus tard."}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start lg:gap-8">
          
          {/* Left Column: Image + Details */}
          <div className="w-full lg:w-[60%] xl:w-[65%] shrink-0 flex flex-col">
            {/* Image Gallery */}
            <div className="w-full">
              <ListingHeroGallery
                listing={listing}
                activeImageIdx={activeImageIdx}
                setActiveImageIdx={setActiveImageIdx}
                favorite={favorite}
                userInteracted={userInteracted}
                setUserInteracted={setUserInteracted}
                onBack={handleBackToAnnouncements}
                onShare={handleShare}
                onToggleFavorite={() => toggleFavorite(listing.id)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />
            </div>

            {/* Details and Characteristics */}
            <div className="relative z-10 mt-3 sm:mt-5 pb-6 lg:pb-10">
              <div className="space-y-4">
                {/* Full title card */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-kawral-border shadow-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                    <span className="font-bold text-[10px] sm:text-xs text-kawral-orange uppercase tracking-wider block">
                      {getCategoryLabel(listing.category)}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {listingRef && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] sm:text-xs border border-slate-200">
                          <Hash className="w-3 h-3 text-kawral-green shrink-0" />
                          <span>Réf : {listingRef}</span>
                        </span>
                      )}
                      {listing.category === "other" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-kawral-green font-extrabold text-[10px] uppercase tracking-wider border border-emerald-200">
                          Prix unique
                        </span>
                      )}
                    </div>
                  </div>
                  <h1 className="text-base sm:text-2xl font-extrabold text-kawral-dark leading-snug break-words [overflow-wrap:anywhere]">
                    {listing.title}
                  </h1>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl sm:text-3xl font-black text-kawral-green leading-none">
                        {listing.price.toLocaleString("fr-FR")} FCFA
                      </span>
                      {listing.category !== "other" && listing.pricePeriod && listing.pricePeriod !== "total" && (
                        <span className="text-xs text-slate-500 font-bold">
                          / {listing.pricePeriod === "month" ? "mois" : "jour"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-kawral-orange shrink-0" />
                      <span>
                        {listing.location.neighborhood ? `${listing.location.neighborhood}, ` : ""}{listing.location.city}
                      </span>
                    </div>
                  </div>
                </div>

                  <ListingKeyStats
                    category={listing.category}
                    characteristics={listing.characteristics}
                  />

                  <div className="bg-white rounded-3xl border border-kawral-border divide-y divide-slate-100 overflow-hidden shadow-xs">
                    <Accordion
                      title={listing.category === "other" ? "Description de l'annonce" : "Description du bien"}
                      defaultOpen
                    >
                      <div className="space-y-4">
                        {listing.audioDescriptionUrl && (
                          <div className="p-3 sm:p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-kawral-orange animate-ping" />
                              <span className="text-xs font-black uppercase tracking-wider text-kawral-green">
                                {listing.category === "other"
                                  ? "Description vocale de l'annonceur"
                                  : "Description vocale du propriétaire"}
                              </span>
                            </div>
                            <AudioPlayer
                              audioUrl={listing.audioDescriptionUrl}
                              title="Écouter la présentation audio"
                            />
                          </div>
                        )}
                        {listing.description && (
                          <p className="text-sm text-kawral-dark leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
                            {listing.description}
                          </p>
                        )}
                      </div>
                    </Accordion>

                    {equipmentList.length > 0 && (
                      <Accordion
                        title={`Équipements & prestations (${equipmentList.length})`}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          {equipmentList.map((e, i) => (
                            <div key={i} className="flex items-center gap-2.5 py-2">
                              <div className="w-5 h-5 rounded-lg bg-kawral-green/10 flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-kawral-green" />
                              </div>
                              <span className="text-xs font-semibold text-kawral-dark">
                                {e.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Accordion>
                    )}

                    <Accordion title="Localisation">
                      <ListingLocationMap location={listing.location} appointmentEnabled={canBookAppointment} />
                    </Accordion>

                    <Accordion title="Sécurité & conseils">
                      <div className="space-y-3">
                        {[
                          {
                            icon: <Shield className="w-4 h-4 text-kawral-green" />,
                            text: "Ne payez jamais d'acompte avant visite.",
                          },
                          {
                            icon: (
                              <CheckCircle2 className="w-4 h-4 text-kawral-green" />
                            ),
                            text: "Vérifiez les titres fonciers originaux.",
                          },
                          {
                            icon: <Zap className="w-4 h-4 text-amber-500" />,
                            text: "Annonce vérifiée par l'équipe Kawral.",
                          },
                        ].map((tip, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="shrink-0 mt-0.5">{tip.icon}</div>
                            <p className="text-xs text-kawral-muted leading-relaxed">
                              {tip.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Accordion>
                  </div>

                  {/* Contact (mobile): placed right above "Signaler un problème" */}
                  {!isOwner && (
                    !isListingAvailable ? (
                      <div className="bg-white rounded-3xl border border-slate-200 p-5 text-center space-y-1.5 shadow-xs">
                        <p className="text-sm font-bold text-slate-800">
                          {listing.status === "sold" ? "Article vendu" : listing.status === "rented" ? "Bien loué" : "Article indisponible"}
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Cette annonce n'est plus disponible. Les prises de contact sont désactivées.
                        </p>
                      </div>
                    ) : (
                      <ListingMobileBottomBar
                        phone={listing.owner.phone}
                        showPhone={showPhone}
                        onTogglePhone={() => setShowPhone((p) => !p)}
                        onChat={handleChat}
                        onAppointment={() => setAppointmentOpen(true)}
                        listingTitle={listing.title}
                        listingId={listing.id}
                        hideAppointment={!canBookAppointment}
                      />
                    )
                  )}

                  <div className="text-center py-2">
                    <button
                      onClick={() => setReportOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-kawral-muted hover:text-rose-500 font-semibold transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Signaler un problème
                    </button>
                  </div>
                </div>
              </div>
            </div>

          {/* Vendor Info: desktop only (on mobile the fixed bottom CTA bar covers contact actions) */}
          {!isOwner && (
            <div className="hidden lg:block lg:w-[40%] xl:w-[35%] lg:sticky lg:top-24 z-20">
              {!isListingAvailable ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {listing.status === "sold" ? "Article vendu" : listing.status === "rented" ? "Bien loué" : "Article indisponible"}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Cette annonce n'est plus disponible. La prise de contact et les réservations sont désactivées.
                  </p>
                </div>
              ) : (
                <ContactCard
                  listing={listing}
                  showPhone={showPhone}
                  onShowPhone={() => setShowPhone(true)}
                  onChat={handleChat}
                  onAppointment={() => setAppointmentOpen(true)}
                  hideAppointment={!canBookAppointment}
                />
              )}
            </div>
          )}

        </div>
      </div>

      {/* Similar Listings Section */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-14 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:py-16 lg:mt-12 border-t border-slate-200/60">
        <h2 className="text-xl sm:text-2xl font-black text-kawral-dark mb-6 sm:mb-8">
          Annonces similaires
        </h2>
        {isLoadingSimilar ? (
          <p className="text-kawral-muted text-sm font-semibold" role="status">
            Chargement des annonces similaires...
          </p>
        ) : similarListingsError ? (
          <p className="text-rose-600 text-sm font-semibold" role="alert">
            Impossible de charger les annonces similaires pour le moment.
          </p>
        ) : similarListings.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {visibleSimilarListings.map((item) => (
                <div key={item.id} className="min-w-0 flex h-full">
                  <ListingCard listing={item} />
                </div>
              ))}
            </div>
            {similarPageCount > 1 && (
              <nav
                className="flex items-center justify-center gap-1.5 mt-6"
                aria-label="Pagination des annonces similaires"
              >
                <button
                  type="button"
                  onClick={() => setSimilarPage((page) => Math.max(1, page - 1))}
                  disabled={similarPage === 1}
                  aria-label="Page précédente"
                  className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-kawral-border text-kawral-dark hover:bg-kawral-ivory disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {visibleSimilarPages.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setSimilarPage(page)}
                    aria-label={`Page ${page}`}
                    aria-current={similarPage === page ? "page" : undefined}
                    className={`w-10 h-10 rounded-xl border text-sm font-bold transition-colors cursor-pointer ${
                      similarPage === page
                        ? "bg-kawral-green text-white border-kawral-green"
                        : "bg-white text-kawral-dark border-kawral-border hover:bg-kawral-ivory"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSimilarPage((page) => Math.min(similarPageCount, page + 1))}
                  disabled={similarPage === similarPageCount}
                  aria-label="Page suivante"
                  className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-kawral-border text-kawral-dark hover:bg-kawral-ivory disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </>
        ) : (
          <p className="text-kawral-muted text-sm font-semibold">
            Aucune annonce similaire pour le moment.
          </p>
        )}
      </div>

      {!isOwner && canBookAppointment && (
        <AppointmentModal
          listing={listing}
          isOpen={appointmentOpen}
          onClose={() => setAppointmentOpen(false)}
        />
      )}
      <ReportListingModal
        listingId={listing.id}
        listingTitle={listing.title}
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
};
