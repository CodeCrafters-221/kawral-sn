import React, { useState, useRef, useEffect } from "react";
import {
  Building2,
  Home as HomeIcon,
  TreePine as LandIcon,
  Car,
  Store,
  Bed,
  Package,
  Briefcase,
  Shirt,
  Tv,
  Gamepad2,
  Truck,
  Bike,
  ChevronDown,
  ChevronUp,
  Check,
  Mic,
  Square,
  Pause,
  Play,
  RotateCcw,
  Upload,
  FileAudio,
  AlertCircle,
  PenTool,
} from "lucide-react";
import { CategoryType, TransactionType } from "../../../../types";
import { useApp } from "../../../../context/AppContext";
import { useAudioRecorder } from "../../../../hooks/useAudioRecorder";
import { AudioPlayer } from "../../../../components/ui/AudioPlayer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  findMainCategory,
  findParentMainCategory,
  getDefaultSubcategorySlug,
  isRentEligibleCategory,
} from "../../../../data/categoriesData";
import { getCategoryLabel } from "../../../../utils/formatters";

interface Props {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  descriptionType: "text" | "audio";
  setDescriptionType: (v: "text" | "audio") => void;
  audioBlob: Blob | null;
  setAudioBlob: (v: Blob | null) => void;
  audioUrl: string | null;
  setAudioUrl: (v: string | null) => void;
  price: number;
  setPrice: (v: number) => void;
  pricePeriod: "month" | "day" | "total";
  setPricePeriod: (v: "month" | "day" | "total") => void;
  transactionType: TransactionType;
  category?: CategoryType;
  setCategory?: (v: CategoryType) => void;
  region?: string;
  city?: string;
  neighborhood?: string;
}

export const CATEGORY_DEFINITIONS: Record<
  string,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
> = {
  // Catégories principales
  immobilier: {
    label: "Immobilier",
    icon: Building2,
    description: "Appartements, villas, terrains, locaux",
  },
  vehicules: {
    label: "Véhicules",
    icon: Car,
    description: "Voitures, motos, utilitaires",
  },
  "materiel-pro": {
    label: "Matériel pro",
    icon: Briefcase,
    description: "Équipements et outillage professionnel",
  },
  mode: {
    label: "Mode",
    icon: Shirt,
    description: "Vêtements, chaussures, accessoires",
  },
  "maison-jardin": {
    label: "Maison & jardin",
    icon: HomeIcon,
    description: "Mobilier, décoration, jardinage",
  },
  electronique: {
    label: "Électronique",
    icon: Tv,
    description: "Smartphones, ordinateurs, audio, TV",
  },
  loisirs: {
    label: "Loisirs",
    icon: Gamepad2,
    description: "Sport, jeux vidéo, livres, divertissement",
  },
  autres: {
    label: "Autres",
    icon: Package,
    description: "Divers articles et services",
  },
  // Sous-catégories & legacy
  apartment: {
    label: "Appartement",
    icon: Building2,
    description: "Appartement, studio, duplex",
  },
  house: {
    label: "Maison / Villa",
    icon: HomeIcon,
    description: "Villa, maison avec cour",
  },
  land: {
    label: "Terrain",
    icon: LandIcon,
    description: "Terrain nu, parcelle, TF, agricole",
  },
  vehicle: {
    label: "Véhicule",
    icon: Car,
    description: "Voiture, SUV, moto, utilitaire",
  },
  commercial: {
    label: "Local commercial",
    icon: Store,
    description: "Boutique, bureau, entrepôt",
  },
  room: {
    label: "Chambre",
    icon: Bed,
    description: "Chambre meublée, colocation",
  },
  voitures: {
    label: "Voitures",
    icon: Car,
    description: "Véhicules particuliers, SUV, berlines",
  },
  motos: {
    label: "Motos & Scooters",
    icon: Bike,
    description: "Motos, deux-roues, quads",
  },
  utilitaires: {
    label: "Utilitaires & Camions",
    icon: Truck,
    description: "Camionnettes, fourgons, engins",
  },
  real_estate: {
    label: "Immobilier",
    icon: Building2,
    description: "Bien immobilier divers",
  },
  other: {
    label: "Autres",
    icon: Package,
    description: "Autres types d'annonces et biens divers",
  },
};

export const AVAILABLE_CATEGORIES: Array<{
  id: CategoryType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    id: "immobilier",
    label: "Immobilier",
    icon: Building2,
    description: "Appartement, maison, terrain, local",
  },
  {
    id: "vehicules",
    label: "Véhicules",
    icon: Car,
    description: "Voiture, moto, camion, utilitaire",
  },
  {
    id: "materiel-pro",
    label: "Matériel pro",
    icon: Briefcase,
    description: "Outillage, matériel professionnel",
  },
  {
    id: "mode",
    label: "Mode",
    icon: Shirt,
    description: "Vêtements, chaussures, sacs",
  },
  {
    id: "maison-jardin",
    label: "Maison & jardin",
    icon: HomeIcon,
    description: "Meubles, déco, électroménager",
  },
  {
    id: "electronique",
    label: "Électronique",
    icon: Tv,
    description: "Téléphones, PC, télévisions, son",
  },
  {
    id: "loisirs",
    label: "Loisirs",
    icon: Gamepad2,
    description: "Sport, multimédia, jeux, musique",
  },
  {
    id: "autres",
    label: "Autres",
    icon: Package,
    description: "Autres articles et biens divers",
  },
];

const CATEGORY_PLACEHOLDERS: Record<string, { title: string; desc: string }> = {
  apartment: {
    title: "Ex: Appartement F4 moderne vue mer aux Almadies",
    desc: "Décrivez les atouts de l'appartement (surface, étage, ascenseur, chambres climatisées, parking, sécurité, proximité commerces)...",
  },
  house: {
    title: "Ex: Magnifique Villa F5 avec piscine et jardin à Saly",
    desc: "Décrivez la villa (surface habitable et terrain, nombre de chambres, piscine, jardin, groupe électrogène, quartier)...",
  },
  land: {
    title: "Ex: Terrain 500 m² Titre Foncier aux Almadies - Proche goudron",
    desc: "Décrivez le terrain (superficie exacte, type de document TF/bail/délibération, viabilisation eau/électricité, accès route)...",
  },
  vehicle: {
    title: "Ex: Toyota Land Cruiser Prado 2021 V6 TXL - Automatique",
    desc: "Décrivez le véhicule (marque, modèle, année, kilométrage réel, carburant, boîte, révision effectuée, état carrosserie et pneus)...",
  },
  vehicules: {
    title: "Ex: Toyota Land Cruiser Prado 2021 V6 TXL - Automatique",
    desc: "Décrivez le véhicule (marque, modèle, année, kilométrage réel, carburant, boîte, révision effectuée, état carrosserie et pneus)...",
  },
  voitures: {
    title: "Ex: Peugeot 3008 Allure 2020 1.6 HDi - Automatique",
    desc: "Décrivez la voiture (modèle, année, kilométrage, révision, options, état général)...",
  },
  motos: {
    title: "Ex: Yamaha T-MAX 530 2019 - Excellent état",
    desc: "Décrivez le deux-roues (cylindrée, kilométrage, accessoires, révision)...",
  },
  utilitaires: {
    title: "Ex: Renault Master 2.3 dCi Fourgon L2H2",
    desc: "Décrivez l'utilitaire (volume, charge utile, motorisation, contrôle technique)...",
  },
  commercial: {
    title: "Ex: Local commercial 120 m² sur avenue principale au Plateau",
    desc: "Décrivez le local (surface, vitrine, visibilité sur rue, climatisation, idéal boutique/bureau/showroom, commodités)...",
  },
  room: {
    title: "Ex: Chambre privée meublée climatisée avec salle d'eau à Mermoz",
    desc: "Décrivez la chambre (meublée/vide, climatisation, salle de bain privée/partagée, charges incluses, wifi, accès cuisine)...",
  },
  immobilier: {
    title: "Ex: Appartement F4 moderne vue mer aux Almadies",
    desc: "Décrivez les atouts du bien immobilier (surface, pièces, climatisation, parking, quartier, proximité)...",
  },
  "materiel-pro": {
    title: "Ex: Groupe électrogène Caterpillar 50 kVA insonorisé",
    desc: "Décrivez le matériel professionnel (marque, modèle, puissance, heures de marche, état, garantie)...",
  },
  mode: {
    title: "Ex: Robe de soirée haute couture ou Montre homme automatique",
    desc: "Décrivez l'article de mode (taille, marque, matière, couleur, état neuf/très bon état)...",
  },
  "maison-jardin": {
    title: "Ex: Salon d'angle complet en cuir avec table basse",
    desc: "Décrivez le meuble ou l'équipement (dimensions, matière, couleur, état général)...",
  },
  electronique: {
    title: "Ex: iPhone 15 Pro Max 256 Go - Parfait état avec boîte",
    desc: "Décrivez le produit électronique (marque, modèle, capacité, accessoires fournis, facture disponible)...",
  },
  loisirs: {
    title: "Ex: Console PlayStation 5 avec 2 manettes et 3 jeux",
    desc: "Décrivez l'article de loisir (état, jeux ou accessoires inclus, fonctionnement vérifié)...",
  },
  autres: {
    title: "Ex: Titre de l'article ou du produit",
    desc: "Décrivez en détail l'article ou le bien (état général, caractéristiques, accessoires inclus)...",
  },
  other: {
    title: "Ex: Titre de l'article ou du produit",
    desc: "Décrivez en détail l'article ou le bien (état général, caractéristiques, accessoires inclus)...",
  },
};

const field =
  "w-full min-w-0 max-w-full box-border p-3 bg-kawral-ivory border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-kawral-green transition-all";

export const StepBasicInfo: React.FC<Props> = ({
  title,
  setTitle,
  description,
  setDescription,
  descriptionType,
  setDescriptionType,
  audioBlob,
  setAudioBlob,
  audioUrl,
  setAudioUrl,
  price,
  setPrice,
  pricePeriod,
  setPricePeriod,
  transactionType,
  category = "apartment",
  setCategory,
  city,
  neighborhood,
}) => {
  const { addToast } = useApp();
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Audio Recorder Hook
  const recorder = useAudioRecorder({ maxDurationSeconds: 180 });

  // Sync recorder blob/url to parent state
  useEffect(() => {
    if (recorder.audioBlob) {
      setAudioBlob(recorder.audioBlob);
    }
  }, [recorder.audioBlob, setAudioBlob]);

  useEffect(() => {
    if (recorder.audioUrl) {
      setAudioUrl(recorder.audioUrl);
    }
  }, [recorder.audioUrl, setAudioUrl]);

  const categoryDef =
    CATEGORY_DEFINITIONS[category] || (() => {
      const parentCategory = findParentMainCategory(category);
      const subcategory = parentCategory?.subcategories.find(
        (item) => item.slug === category
      );
      const mainCategory = findMainCategory(category);

      return {
        label: getCategoryLabel(category),
        icon: subcategory?.icon || mainCategory?.icon || parentCategory?.icon || Package,
        description:
          parentCategory?.description ||
          mainCategory?.description ||
          "Article à vendre sur Kawral",
      };
    })();
  const categoryName = categoryDef.label;
  const CategoryIcon = categoryDef.icon;
  const placeholders =
    CATEGORY_PLACEHOLDERS[category] || {
      title: `Ex: ${categoryName}...`,
      desc: `Décrivez les détails de votre annonce ${categoryName.toLowerCase()} (état, caractéristiques, prix et éléments inclus)...`,
    };
  const canRent = isRentEligibleCategory(category);
  const transactionName = transactionType === "rent" ? "Location" : "Vente";

  // Handle direct audio file upload from disk
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      addToast("Veuillez sélectionner un fichier audio valide (.mp3, .m4a, .wav).", "error");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      addToast("Le fichier audio ne doit pas dépasser 20 Mo.", "error");
      return;
    }

    recorder.resetRecording();
    setAudioBlob(file);
    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);
    addToast("Fichier audio chargé avec succès !", "success");
  };

  const handleClearAudio = () => {
    recorder.resetRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    addToast("Enregistrement audio supprimé.", "info");
  };

  const currentAudioUrl = audioUrl || recorder.audioUrl;

  const formatSeconds = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {/* 🏷️ Indicateur de catégorie active & Sélecteur rapide */}
      <div className="bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3 w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-kawral-green text-white flex items-center justify-center shrink-0 shadow-sm">
              <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-kawral-orange shrink-0" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-kawral-green bg-kawral-green/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                  {canRent ? "Catégorie du bien" : "Catégorie de l'article"}
                </span>
                <span className="text-[11px] text-slate-400">•</span>
                <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                  {!canRent || transactionType === "sale" ? "À vendre (Vente)" : "À louer (Location)"}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-kawral-dark truncate">
                {categoryName}
                <span className="text-xs font-normal text-kawral-muted ml-2 hidden sm:inline">
                  ({categoryDef.description})
                </span>
              </h3>
            </div>
          </div>

          {setCategory && (
            <button
              type="button"
              onClick={() => setShowCategoryPicker((prev) => !prev)}
              className="px-2.5 py-1.5 text-xs font-bold text-kawral-green hover:text-white bg-kawral-green/10 hover:bg-kawral-green rounded-xl transition-all flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
              title="Changer la catégorie du bien"
            >
              <span className="hidden sm:inline">{showCategoryPicker ? 'Fermer' : 'Changer de catégorie'}</span>
              <span className="sm:hidden">{showCategoryPicker ? 'Fermer' : 'Modifier'}</span>
              {showCategoryPicker ? (
                <ChevronUp className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              )}
            </button>
          )}
        </div>

        {setCategory && showCategoryPicker && (
          <div className="pt-3 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-fade-in w-full max-w-full min-w-0">
            {AVAILABLE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = cat.id === category;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(
                      (getDefaultSubcategorySlug(cat.id) || cat.id) as CategoryType
                    );
                    setShowCategoryPicker(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer min-w-0 max-w-full overflow-hidden ${
                    isSelected
                      ? "border-kawral-green bg-kawral-green text-white shadow-xs font-bold"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-semibold"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? "text-kawral-orange" : "text-slate-500"
                    }`}
                  />
                  <span className="text-xs truncate flex-1 min-w-0">{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Titre de l'annonce ───────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-kawral-dark">
          Titre de l'annonce <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder={placeholders.title}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={field}
        />
      </div>

      {/* ── Sélecteur de Mode Description (Écrite vs Vocale) ─────────── */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-kawral-dark">
            Description de l'annonce <span className="text-rose-500">*</span>
          </label>
          <span className="text-[11px] text-kawral-muted font-medium">
            Choisissez le format de présentation
          </span>
        </div>

        {/* Onglets de sélection du mode */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200 w-full max-w-full min-w-0">
          <button
            type="button"
            onClick={() => setDescriptionType("text")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-w-0 max-w-full ${
              descriptionType === "text"
                ? "bg-white text-kawral-dark shadow-sm border border-slate-200/80"
                : "text-slate-500 hover:text-kawral-dark"
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-kawral-green shrink-0" />
            <span className="truncate">Description écrite</span>
          </button>

          <button
            type="button"
            onClick={() => setDescriptionType("audio")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-w-0 max-w-full ${
              descriptionType === "audio"
                ? "bg-white text-kawral-dark shadow-sm border border-slate-200/80"
                : "text-slate-500 hover:text-kawral-dark"
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-kawral-orange shrink-0" />
            <span className="truncate">Note vocale</span>
            <span className="px-1.5 py-0.5 rounded-md bg-kawral-orange/10 text-kawral-orange text-[9px] font-black uppercase shrink-0">
              Nouveau
            </span>
          </button>
        </div>

        {/* ── Mode 1 : Description Écrite ────────────────────────────── */}
        {descriptionType === "text" && (
          <div className="space-y-1.5 animate-fade-in">
            <textarea
              rows={6}
              required
              placeholder={placeholders.desc}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={field + " leading-relaxed"}
            />
            <div className="flex justify-between items-center text-[10px] text-kawral-muted font-medium">
              <span>
                Conseil : mentionnez les atouts clés, l'emplacement et la
                disponibilité.
              </span>
              <span>{description.length} caractères (min. 30)</span>
            </div>
          </div>
        )}

        {/* ── Mode 2 : Description Vocale (Enregistrement / Upload) ───── */}
        {descriptionType === "audio" && (
          <div className="space-y-4 animate-fade-in">
            {/* Box d'enregistrement / lecteur */}
            <div className="rounded-3xl border border-kawral-green/20 bg-gradient-to-b from-emerald-50/50 via-white to-amber-50/30 p-5 sm:p-6 shadow-xs text-center space-y-4">
              {/* Message d'erreur s'il y a lieu */}
              {recorder.error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{recorder.error}</span>
                </div>
              )}

              {/* Cas A : Aucun audio enregistré et pas en cours d'enregistrement */}
              {!currentAudioUrl && !recorder.isRecording && (
                <div className="space-y-4 py-3">
                  <div className="w-16 h-16 rounded-3xl bg-kawral-green/10 text-kawral-green flex items-center justify-center mx-auto shadow-inner">
                    <Mic className="w-8 h-8 text-kawral-green" />
                  </div>

                  <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-black text-kawral-dark">
                      Enregistrez votre description vocale
                    </h4>
                    <p className="text-xs text-kawral-muted leading-relaxed">
                      Décrivez votre bien avec votre voix (français, wolof,
                      etc.). Durée maximale de 3 minutes.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full max-w-md mx-auto pt-2">
                    {/* Bouton pour démarrer l'enregistrement */}
                    <button
                      type="button"
                      onClick={() => recorder.startRecording()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-kawral-green hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Mic className="w-4 h-4 text-kawral-orange" />
                      <span>Démarrer l'enregistrement</span>
                    </button>

                    {/* Import de fichier alternatif */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 hover:border-kawral-green text-slate-700 hover:text-kawral-dark font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Importer un fichier audio</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Cas B : Enregistrement en cours */}
              {recorder.isRecording && (
                <div className="space-y-5 py-4">
                  {/* Animation onde sonore live */}
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-12 max-w-full overflow-hidden px-2">
                    {recorder.audioLevels.map((lvl, idx) => (
                      <span
                        key={idx}
                        style={{
                          height: `${Math.round(lvl * 100)}%`,
                          transition: "height 80ms ease-out",
                        }}
                        className={`w-1 sm:w-1.5 rounded-full ${
                          recorder.isPaused
                            ? "bg-amber-400"
                            : "bg-kawral-green shadow-xs animate-pulse"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Timer & Statut */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                      <span>
                        {recorder.isPaused
                          ? "En pause"
                          : "Enregistrement en direct..."}
                      </span>
                    </div>

                    <div className="text-2xl font-black text-kawral-dark font-mono">
                      {formatSeconds(recorder.recordingDuration)} / 03:00
                    </div>
                  </div>

                  {/* Actions d'enregistrement */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xs mx-auto">
                    {recorder.isPaused ? (
                      <button
                        type="button"
                        onClick={recorder.resumeRecording}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95"
                      >
                        <Play className="w-4 h-4" />
                        <span>Reprendre</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={recorder.pauseRecording}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer active:scale-95"
                      >
                        <Pause className="w-4 h-4" />
                        <span>Mettre en pause</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={recorder.stopRecording}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-kawral-green hover:bg-emerald-800 text-white font-black text-xs shadow-md cursor-pointer active:scale-95"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Terminer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Cas C : Audio disponible (enregistré ou téléversé) */}
              {currentAudioUrl && !recorder.isRecording && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-kawral-green flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-kawral-green shrink-0" />
                      <span>Note vocale prête pour l'annonce</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAudio}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
                    >
                      Supprimer / Recommencer
                    </button>
                  </div>

                  {/* Lecteur audio personnalisé */}
                  <AudioPlayer
                    audioUrl={currentAudioUrl}
                    title="Description vocale enregistrée"
                    onDelete={handleClearAudio}
                  />
                </div>
              )}
            </div>

            {/* Note ou texte d'accompagnement facultatif en mode vocal */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-600">
                Résumé ou texte d'accompagnement{" "}
                <span className="text-slate-400 font-normal">(facultatif)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Vous pouvez ajouter quelques précisions écrites (ex: Disponible immédiatement, prix négociable)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={field + " leading-relaxed"}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Prix et Fréquence ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 w-full max-w-full min-w-0">
        <div className={`min-w-0 max-w-full ${!canRent || transactionType !== "rent" ? "sm:col-span-2" : ""}`}>
          <label className="block text-xs font-bold text-kawral-dark mb-1 truncate">
            {!canRent || transactionType === "sale" ? "Prix de vente (FCFA)" : "Loyer (FCFA)"} <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            required
            placeholder={!canRent || transactionType === "sale" ? "Ex: 45000" : "Ex: 250000"}
            value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value))}
            className={field + " font-bold text-sm text-kawral-green"}
          />
          {(!canRent || transactionType === "sale") && (
            <p className="text-[11px] text-kawral-muted mt-1 font-medium break-words">
              Prix de vente définitif pour ce bien ou article (sans frais récurrents).
            </p>
          )}
        </div>
        {canRent && transactionType === "rent" && (
          <div className="min-w-0 max-w-full">
            <label className="block text-xs font-bold text-kawral-dark mb-1 truncate">Fréquence du loyer</label>
            <Select
              value={pricePeriod}
              onValueChange={(value) => setPricePeriod(value as 'month' | 'day' | 'total')}
            >
              <SelectTrigger className={field + " h-11 py-2.5 font-bold text-left"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[min(24rem,60dvh)]">
                <SelectItem value="month">Par mois</SelectItem>
                <SelectItem value="day">Par jour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};
