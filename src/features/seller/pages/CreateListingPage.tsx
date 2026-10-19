import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { CategoryType, TransactionType, ListingStatus } from "../../../types";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Loader2,
  Building2,
  Home as HomeIcon,
  TreePine as LandIcon,
  Car,
  Store,
  Bed,
  Edit2,
  Package,
  Briefcase,
  Shirt,
  Tv,
  Gamepad2,
  Truck,
  Bike,
} from "lucide-react";
import {
  StepCategory,
  StepTransaction,
  StepBasicInfo,
  StepLocation,
  StepCharacteristics,
  StepPhotos,
  StepPreview,
} from "../components/wizard";
import { generateUUID } from "../../../utils/uuid";
import { ListingStatusSelect } from "../components/ListingStatusSelect";
import { uploadListingAudio } from "../../../services/supabase/storageService";
import {
  MAIN_CATEGORIES_CATALOG,
  findMainCategory,
  findParentMainCategory,
  isConcreteCategorySlug,
  isRentEligibleCategory,
} from "../../../data/categoriesData";
import { getCategoryLabel } from "../../../utils/formatters";
import { cleanIncompatibleCharacteristics } from "../../../data/characteristicsRegistry";

const getCategoryBadgeInfo = (catSlug: string) => {
  const main = findMainCategory(catSlug);
  if (main) return { label: main.label, icon: main.icon };
  for (const c of MAIN_CATEGORIES_CATALOG) {
    const sub = c.subcategories.find((s) => s.slug === catSlug);
    if (sub) return { label: sub.label, icon: sub.icon };
  }
  return { label: getCategoryLabel(catSlug) || catSlug, icon: Package };
};

interface WizardStep {
  id: "category" | "transaction" | "basic_info" | "location" | "characteristics" | "photos" | "preview";
  title: string;
}

const RENT_ELIGIBLE_STEPS: WizardStep[] = [
  { id: "category", title: "Choisissez la catégorie" },
  { id: "transaction", title: "Type de transaction" },
  { id: "basic_info", title: "Informations de base" },
  { id: "location", title: "Localisation du bien" },
  { id: "characteristics", title: "Caractéristiques & Équipements" },
  { id: "photos", title: "Photos du bien" },
  { id: "preview", title: "Aperçu & Publication" },
];

const SALE_ONLY_STEPS: WizardStep[] = [
  { id: "category", title: "Choisissez la catégorie" },
  { id: "basic_info", title: "Informations de l'article" },
  { id: "location", title: "Localisation" },
  { id: "characteristics", title: "Caractéristiques" },
  { id: "photos", title: "Photos" },
  { id: "preview", title: "Aperçu & Publication" },
];

// Pas d'images d'exemple : la galerie commence vide pour les nouvelles annonces

export const CreateListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const {
    currentUser,
    listings,
    addListing,
    updateListing,
    setCurrentView,
    setAuthModalOpen,
    setAuthModalMode,
    addToast,
  } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [listingId] = useState(() => id || generateUUID());
  const [isPublishing, setIsPublishing] = useState(false);

  // Form state : "sale" (À vendre) par défaut pour toutes les catégories
  const [status, setStatus] = useState<ListingStatus>("published");
  const [category, setCategory] = useState<CategoryType>("apartment");
  const [transactionType, setTransactionType] =
    useState<TransactionType>("sale");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionType, setDescriptionType] = useState<"text" | "audio">("text");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [pricePeriod, setPricePeriod] = useState<"month" | "day" | "total">(
    "total",
  );
  const [region, setRegion] = useState("Dakar");
  const [city, setCity] = useState("Dakar");
  const [neighborhood, setNeighborhood] = useState("Almadies");
  const [address, setAddress] = useState("");
  const [characteristics, setCharacteristics] = useState<Record<string, any>>({});
  const [images, setImages] = useState<string[]>([]);

  // Éligibilité à la location (Immobilier ou Véhicules de transport: voitures, camions, bus, etc.)
  const canRent = isRentEligibleCategory(category);
  const activeSteps = canRent ? RENT_ELIGIBLE_STEPS : SALE_ONLY_STEPS;
  const totalSteps = activeSteps.length;
  const currentStep = Math.min(step, totalSteps);
  const currentStepConfig = activeSteps[currentStep - 1] || activeSteps[0];
  const currentStepId = currentStepConfig.id;

  const handleCategoryChange = (newCat: CategoryType) => {
    if (newCat === category) return;

    const oldCanRent = isRentEligibleCategory(category);
    const newCanRent = isRentEligibleCategory(newCat);

    setCategory(newCat);

    // Par défaut et obligatoirement pour toute catégorie non éligible à la location : vente uniquement
    if (!newCanRent) {
      setTransactionType("sale");
      setPricePeriod("total");
    }

    // Synchronisation de l'étape si la structure d'étapes (avec ou sans transaction) change
    if (oldCanRent !== newCanRent) {
      const oldSteps = oldCanRent ? RENT_ELIGIBLE_STEPS : SALE_ONLY_STEPS;
      const currentStepId = oldSteps[currentStep - 1]?.id;
      const newSteps = newCanRent ? RENT_ELIGIBLE_STEPS : SALE_ONLY_STEPS;
      const matchingIdx = newSteps.findIndex((s) => s.id === currentStepId);
      if (matchingIdx >= 0) {
        setStep(matchingIdx + 1);
      }
    }

    // Nettoyer immédiatement les caractéristiques incompatibles
    setCharacteristics((prev) =>
      cleanIncompatibleCharacteristics(newCat, prev, category)
    );
  };

  // Load listing for edit mode — avec vérification d'ownership (anti-IDOR)
  useEffect(() => {
    if (!isEdit || listings.length === 0 || !currentUser) return;

    const listing = listings.find((item) => item.id === id);

    if (!listing) {
      // Annonce introuvable
      addToast("Annonce introuvable.", "error");
      navigate("/dashboard/seller", { replace: true });
      return;
    }

    // Vérification d'ownership
    const isOwner = listing.ownerId === currentUser.id;
    const isAdmin = currentUser.role === "admin";

    if (!isOwner && !isAdmin) {
      addToast("Vous n'êtes pas autorisé à modifier cette annonce.", "error");
      navigate("/dashboard/seller", { replace: true });
      return;
    }

    // Charger les données de l'annonce
    const canRentListing = isRentEligibleCategory(listing.category);
    setStatus(listing.status || "published");
    setCategory(listing.category);
    setTransactionType(!canRentListing ? "sale" : listing.transactionType);
    setTitle(listing.title);
    setDescription(listing.description);
    if (listing.audioDescriptionUrl) {
      setAudioUrl(listing.audioDescriptionUrl);
      setDescriptionType("audio");
    } else {
      setAudioUrl(null);
      setDescriptionType("text");
    }
    setPrice(listing.price);
    setPricePeriod(
      !canRentListing
        ? "total"
        : (listing.pricePeriod || (listing.transactionType === "rent" ? "month" : "total"))
    );
    setRegion(listing.location.region || "Dakar");
    setCity(listing.location.city || "Dakar");
    setNeighborhood(listing.location.neighborhood || "");
    setAddress(listing.location.address || "");

    const char = listing.characteristics || {};
    setCharacteristics(cleanIncompatibleCharacteristics(listing.category, char));

    if (listing.images) setImages(Array.from(new Set(listing.images)));
  }, [id, isEdit, listings, currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-kawral-border text-center space-y-4 shadow-xl">
        <Lock className="w-12 h-12 text-kawral-orange mx-auto" />
        <h2 className="text-xl font-bold text-kawral-dark">
          Connexion requise
        </h2>
        <p className="text-xs text-kawral-muted">
          Veuillez vous connecter pour publier une annonce sur Kawral.
        </p>
        <button
          onClick={() => {
            setAuthModalMode("login");
            setAuthModalOpen(true);
          }}
          className="w-full py-3 bg-kawral-green text-white rounded-2xl font-bold text-xs"
        >
          Se connecter
        </button>
      </div>
    );
  }

  // ── Validation par étape ────────────────────────────────────────────────
  const [stepError, setStepError] = useState<string | null>(null);

  const validateStep = (currentStepIdx: number): boolean => {
    setStepError(null);
    const stepConfig = activeSteps[currentStepIdx - 1];
    if (!stepConfig) return true;

    switch (stepConfig.id) {
      case "category": {
        if (!isConcreteCategorySlug(category)) {
          setStepError("Veuillez préciser la sous-catégorie pour continuer.");
          return false;
        }
        return true;
      }
      case "basic_info":
        if (!title.trim()) {
          setStepError("Le titre de l'annonce est obligatoire.");
          return false;
        }
        if (title.trim().length < 10) {
          setStepError("Le titre doit contenir au moins 10 caractères.");
          return false;
        }
        if (descriptionType === "text") {
          if (!description.trim()) {
            setStepError("La description écrite est obligatoire.");
            return false;
          }
          if (description.trim().length < 30) {
            setStepError("La description doit contenir au moins 30 caractères.");
            return false;
          }
        } else {
          if (!audioBlob && !audioUrl) {
            setStepError("Veuillez enregistrer ou téléverser une note vocale pour votre annonce.");
            return false;
          }
        }
        if (!price || price <= 0) {
          setStepError("Le prix doit être supérieur à 0 FCFA.");
          return false;
        }
        return true;
      case "location":
        if (!region.trim()) {
          setStepError("Veuillez sélectionner une région.");
          return false;
        }
        if (!city.trim()) {
          setStepError("La ville ou commune est obligatoire.");
          return false;
        }
        if (!neighborhood.trim()) {
          setStepError("Le quartier est obligatoire.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setStep((p) => Math.min(totalSteps, p + 1));
    }
  };

  const handlePublish = async () => {
    if (isPublishing) return;

    // Validation finale avant publication
    const hasDescription =
      descriptionType === "audio"
        ? Boolean(audioBlob || audioUrl)
        : Boolean(description.trim() && description.trim().length >= 30);

    const basicIdx = activeSteps.findIndex((s) => s.id === "basic_info");
    const locIdx = activeSteps.findIndex((s) => s.id === "location");

    if (!isConcreteCategorySlug(category)) {
      addToast("Veuillez sélectionner une sous-catégorie avant de publier.", "error");
      setStep(1);
      return;
    }

    if (!title.trim() || !hasDescription || !price || price <= 0) {
      addToast("Veuillez remplir tous les champs obligatoires.", "error");
      setStep(basicIdx >= 0 ? basicIdx + 1 : 1);
      return;
    }
    if (!region.trim() || !city.trim() || !neighborhood.trim()) {
      addToast("Veuillez renseigner la localisation complète.", "error");
      setStep(locIdx >= 0 ? locIdx + 1 : 1);
      return;
    }
    if (!currentUser?.phone || !currentUser.phone.trim() || currentUser.phone === '+221 77 000 00 00') {
      addToast("Votre numéro de téléphone est obligatoire pour que vos clients puissent vous joindre.", "error");
      return;
    }

    setIsPublishing(true);

    try {
      let finalAudioUrl: string | undefined = undefined;

      if (descriptionType === "audio") {
        if (audioBlob) {
          addToast("Enregistrement de la note vocale...", "info");
          try {
            const uploadedUrl = await uploadListingAudio(
              currentUser.id,
              listingId,
              audioBlob
            );
            if (uploadedUrl) {
              finalAudioUrl = uploadedUrl;
            } else {
              // Fallback to data URL so the voice note is always preserved and playable
              finalAudioUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(audioBlob);
              });
            }
          } catch (uploadErr) {
            console.warn("Audio upload failed, using data url fallback:", uploadErr);
            finalAudioUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(audioBlob);
            });
          }
        } else if (audioUrl && !audioUrl.startsWith("blob:")) {
          finalAudioUrl = audioUrl;
        }
      }

      const finalDescription =
        description.trim() ||
        (descriptionType === "audio"
          ? "Description enregistrée en note vocale (écoutez le message audio)."
          : "");

      const listingData = {
        title: title.trim(),
        description: finalDescription,
        audioDescriptionUrl: finalAudioUrl,
        category,
        categoryLabel: getCategoryLabel(category),
        ...(isEdit && { status }),
        transactionType: !canRent ? "sale" : transactionType,
        price: price || 500000,
        pricePeriod: !canRent ? "total" : (transactionType === "rent" ? pricePeriod : "total"),
        location: { region, city, neighborhood, address },
        characteristics: cleanIncompatibleCharacteristics(category, characteristics),
        images: Array.from(new Set(images)),
        ownerId: currentUser.id,
        owner: {
          id: currentUser.id,
          name: currentUser.name,
          type: "seller" as const,
          phone: currentUser.phone,
          email: currentUser.email,
          avatar: currentUser.avatar,
          verified: currentUser.verified.phone,
        },
      };

      if (isEdit && id) {
        await updateListing(id, listingData);
      } else {
        await addListing(listingData, listingId);
      }

      setCurrentView(
        currentUser.role === "seller"
          ? "seller-dashboard"
          : "client-dashboard",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Erreur lors de la publication:", err);
      addToast("Une erreur est survenue lors de la publication.", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 sm:pt-8 md:pt-10 pb-32 sm:pb-24 space-y-8 w-full min-w-0 max-w-full overflow-hidden">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-block bg-kawral-orange text-white px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
          Étape {currentStep} sur {totalSteps}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-kawral-dark">
          {currentStepConfig.title}
        </h1>
        <p className="text-xs text-kawral-muted">
          Publiez en toute simplicité sur la marketplace Kawral au Sénégal.
        </p>
      </div>

      {/* Statut de l'annonce (mode édition uniquement) */}
      {isEdit && (
        <div className="p-4 rounded-2xl bg-white border border-kawral-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-kawral-muted">
              Statut de votre annonce
            </span>
            <p className="text-xs text-kawral-muted mt-0.5 leading-relaxed">
              Passez l'annonce en Vendu, Loué ou Indisponible quand c'est nécessaire.
            </p>
          </div>
          <ListingStatusSelect
            value={status}
            allowRented={canRent}
            onChange={setStatus}
            className="sm:shrink-0"
          />
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full bg-kawral-ivory h-2.5 rounded-full overflow-hidden border border-kawral-border">
        <div
          className="bg-kawral-green h-full transition-all duration-300 rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Navigation Étapes interactive */}
      <div className="hidden sm:flex items-center justify-between gap-1 overflow-x-auto pb-1 max-w-full min-w-0">
        {activeSteps.map((stepItem, idx) => {
          const stepIndex = idx + 1;
          const isCurrent = currentStep === stepIndex;
          const isCompleted = currentStep > stepIndex;
          const isAccessible = stepIndex <= currentStep;

          return (
            <button
              key={stepItem.id}
              type="button"
              onClick={() => {
                if (isAccessible) setStep(stepIndex);
              }}
              disabled={!isAccessible}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                isCurrent
                  ? "bg-kawral-green text-white shadow-xs"
                  : isCompleted
                    ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                    : "text-slate-400 opacity-50 cursor-not-allowed"
              }`}
              title={isAccessible ? `Aller à l'étape ${stepIndex} : ${stepItem.title}` : undefined}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center shrink-0 ${
                    isCurrent ? "bg-white text-kawral-green font-black" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {stepIndex}
                </span>
              )}
              <span className="truncate max-w-[85px]">{stepItem.title}</span>
            </button>
          );
        })}
      </div>

      {/* Barre récapitulative contextuelle (où on se trouve) */}
      {currentStep > 1 && (
        <div className="flex flex-col gap-2 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl shadow-xs max-w-full min-w-0 overflow-hidden">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs min-w-0 max-w-full">
            <span className="text-[10px] font-black uppercase tracking-wider text-kawral-dark/70">
              {canRent ? "Bien configuré :" : "Article configuré :"}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-emerald-200 rounded-xl font-black text-kawral-green shadow-xs min-w-0 max-w-full">
              {React.createElement(getCategoryBadgeInfo(category).icon, {
                className: "w-3.5 h-3.5 text-kawral-orange shrink-0",
              })}
              <span className="truncate">{getCategoryBadgeInfo(category).label}</span>
            </div>
            {!canRent ? (
              <span className="px-2 py-0.5 bg-white/80 border border-slate-200 rounded-lg font-bold text-slate-700 text-[11px] shrink-0">
                À vendre
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-white/80 border border-slate-200 rounded-lg font-bold text-slate-700 text-[11px] shrink-0">
                {transactionType === "rent" ? "À louer" : "À vendre"}
              </span>
            )}
            {city && (
              <span className="px-2 py-0.5 bg-white/80 border border-slate-200 rounded-lg font-semibold text-slate-600 text-[11px] max-w-[160px] truncate">
                📍 {neighborhood ? `${neighborhood}, ` : ""}{city}
              </span>
            )}
          </div>
          {/* Action button on its own row on mobile */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[11px] font-bold text-kawral-green hover:text-kawral-darkgreen flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs"
              title="Revenir à l'étape 1 pour modifier la catégorie"
            >
              <Edit2 className="w-3 h-3 text-kawral-orange" />
              <span>Changer de catégorie</span>
            </button>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-kawral-border shadow-lg space-y-6 min-w-0 max-w-full overflow-hidden">
        {currentStepId === "category" && (
          <StepCategory value={category} onChange={handleCategoryChange} />
        )}
        {currentStepId === "transaction" && (
          <StepTransaction
            value={transactionType}
            category={category}
            onChange={(v, period) => {
              setTransactionType(v);
              setPricePeriod(period);
            }}
          />
        )}
        {currentStepId === "basic_info" && (
          <StepBasicInfo
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            descriptionType={descriptionType}
            setDescriptionType={setDescriptionType}
            audioBlob={audioBlob}
            setAudioBlob={setAudioBlob}
            audioUrl={audioUrl}
            setAudioUrl={setAudioUrl}
            price={price}
            setPrice={setPrice}
            pricePeriod={pricePeriod}
            setPricePeriod={setPricePeriod}
            transactionType={transactionType}
            category={category}
            setCategory={handleCategoryChange}
            region={region}
            city={city}
            neighborhood={neighborhood}
          />
        )}
        {currentStepId === "location" && (
          <StepLocation
            region={region}
            setRegion={setRegion}
            city={city}
            setCity={setCity}
            neighborhood={neighborhood}
            setNeighborhood={setNeighborhood}
            address={address}
            setAddress={setAddress}
          />
        )}
        {currentStepId === "characteristics" && (
          <StepCharacteristics
            category={category}
            characteristics={characteristics}
            setCharacteristics={setCharacteristics}
          />
        )}
        {currentStepId === "photos" && (
          <StepPhotos
            userId={currentUser.id}
            listingId={listingId}
            images={images}
            onAdd={(url) =>
              setImages((p) => (p.includes(url) ? p : [...p, url]))
            }
            onRemove={(url) =>
              setImages((p) => p.filter((image) => image !== url))
            }
            setImages={setImages}
          />
        )}
        {currentStepId === "preview" && (
          <StepPreview
            title={title}
            price={price}
            neighborhood={neighborhood}
            city={city}
            images={images}
            description={description}
            audioUrl={audioUrl}
            isOther={!canRent}
            transactionType={!canRent ? "sale" : transactionType}
            pricePeriod={pricePeriod}
          />
        )}

        {/* Erreur de validation visible */}
        {stepError && (
          <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl animate-fade-in">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{stepError}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2.5">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => { setStepError(null); setStep((p) => Math.max(1, p - 1)); }}
              className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2.5 border border-kawral-border text-kawral-dark rounded-xl font-bold text-xs hover:bg-kawral-ivory cursor-pointer shrink-0 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline">Précédent</span>
              <span className="xs:hidden">Retour</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-kawral-orange hover:bg-kawral-orange-hover text-white px-4 sm:px-6 py-2.5 rounded-xl font-bold text-xs shadow-md cursor-pointer shrink-0 transition-all active:scale-95"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-kawral-green hover:bg-kawral-darkgreen disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl font-extrabold text-xs sm:text-sm shadow-xl cursor-pointer transition-all active:scale-95 shrink-0"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" />
                  <span className="hidden sm:inline">Publication en cours...</span>
                  <span className="sm:hidden">Publication...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-kawral-orange shrink-0" />
                  <span className="hidden sm:inline">{isEdit ? "Mettre à jour l'annonce" : "Publier l'annonce"}</span>
                  <span className="sm:hidden">{isEdit ? "Mettre à jour" : "Publier"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
