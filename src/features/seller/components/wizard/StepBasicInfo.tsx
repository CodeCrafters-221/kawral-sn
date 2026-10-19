import React, { useRef, useEffect } from "react";
import {
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
import { isRentEligibleCategory } from "../../../../data/categoriesData";
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
  category: CategoryType;
  region?: string;
  city?: string;
  neighborhood?: string;
}

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
  category,
  city,
  neighborhood,
}) => {
  const { addToast } = useApp();
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

  const categoryName = getCategoryLabel(category);
  const placeholders =
    CATEGORY_PLACEHOLDERS[category] || {
      title: `Ex: ${categoryName}...`,
      desc: `Décrivez les détails de votre annonce ${categoryName.toLowerCase()} (état, caractéristiques, prix et éléments inclus)...`,
    };
  const canRent = isRentEligibleCategory(category);

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
