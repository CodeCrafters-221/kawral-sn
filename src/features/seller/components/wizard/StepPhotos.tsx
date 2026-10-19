import React, { useState, useRef } from "react";
import { Upload, Plus, Trash2, Star, Loader2, ImagePlus } from "lucide-react";
import { uploadListingImage } from "../../../../services/supabase/storageService";

interface Props {
  userId: string;
  listingId: string;
  images: string[];
  onAdd: (url: string) => void;
  onRemove: (url: string) => void;
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export const StepPhotos: React.FC<Props> = ({
  userId,
  listingId,
  images,
  onAdd,
  onRemove,
  setImages,
}) => {
  const [inputUrl, setInputUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 10;

  // Valide qu'une URL est sécurisée et pointe vers une image
  const isValidImageUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      // Protocole HTTPS uniquement
      if (parsed.protocol !== "https:") return false;
      // Doit avoir un domaine valide
      if (!parsed.hostname || parsed.hostname.length < 3) return false;
      // Vérifie l'extension ou la présence de paramètres image
      const path = parsed.pathname.toLowerCase();
      const hasImageExt = /\.(jpg|jpeg|png|webp|gif|avif|svg)$/.test(path);
      const hasImageParam = url.toLowerCase().includes("format=") ||
        url.toLowerCase().includes("fit=crop") ||
        url.toLowerCase().includes("image");
      return hasImageExt || hasImageParam;
    } catch {
      return false;
    }
  };

  // Nettoie une URL (supprime les attributs dangereux)
  const sanitizeUrl = (url: string): string => {
    return url.trim().replace(/[<>"']/g, "");
  };

  const handleManualAdd = () => {
    const clean = sanitizeUrl(inputUrl);
    if (!clean) return;

    if (!isValidImageUrl(clean)) {
      setError("URL invalide. Utilisez une URL HTTPS pointant vers une image (jpg, png, webp...).");
      return;
    }
    if (images.length >= MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images autorisées.`);
      return;
    }
    if (images.includes(clean)) {
      setError("Cette image est déjà dans la galerie.");
      return;
    }
    onAdd(clean);
    setInputUrl("");
    setError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES} images atteint.`);
      return;
    }

    setUploading(true);
    setError(null);

    const filesToProcess = Array.from(files).slice(0, remaining);
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

    try {
      for (const file of filesToProcess) {
        // Validation type MIME
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(`Fichier ${file.name} : type non supporté (PNG, JPG, WEBP uniquement).`);
          continue;
        }
        // Validation taille
        if (file.size > 10 * 1024 * 1024) {
          setError(`Fichier ${file.name} trop volumineux (max 10 Mo)`);
          continue;
        }

        const url = await uploadListingImage(userId, listingId, file);
        if (url) {
          setImages((previous) =>
            previous.includes(url) ? previous : [...previous, url],
          );
        } else {
          setError(`Échec du téléchargement pour ${file.name}`);
        }
      }
    } catch (err) {
      console.error("File upload error:", err);
      setError("Erreur réseau lors de l'upload des images.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const makeCover = (url: string) => {
    setImages((prev) => {
      const copy = [...prev];
      const idx = copy.indexOf(url);
      if (idx < 0) return copy;
      const [item] = copy.splice(idx, 1);
      return [item, ...copy];
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed border-kawral-green/30 bg-kawral-ivory rounded-3xl p-8 text-center space-y-3 cursor-pointer hover:bg-slate-50 transition-all ${
          uploading ? "opacity-65 pointer-events-none" : ""
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {uploading ? (
          <Loader2 className="w-10 h-10 text-kawral-green animate-spin mx-auto" />
        ) : (
          <Upload className="w-10 h-10 text-kawral-green mx-auto" />
        )}
        <h4 className="font-extrabold text-sm text-kawral-dark">
          {uploading
            ? "Téléchargement des images en cours..."
            : "Sélectionnez ou glissez vos images"}
        </h4>
        <p className="text-xs text-kawral-muted">
          Formats acceptés : PNG, JPG, WEBP (Max 10 Mo par image)
        </p>

        {!uploading && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 bg-kawral-green text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm"
          >
            <ImagePlus className="w-3.5 h-3.5" /> Choisir des fichiers
          </button>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
          {error}
        </div>
      )}

      {/* Fallback URL Input */}
      <div className="space-y-2">
        <label className="block text-[11px] font-black text-kawral-muted uppercase tracking-wider">
          Ajouter par URL (Alternative)
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://exemple.com/image.jpg"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleManualAdd()}
            className="flex-1 p-2.5 bg-kawral-ivory border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          />
          <button
            type="button"
            onClick={handleManualAdd}
            className="bg-slate-200 hover:bg-slate-300 text-kawral-dark px-4 py-2.5 rounded-xl font-bold text-xs"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <label className="block text-[11px] font-black text-kawral-muted uppercase tracking-wider">
            Galerie ({new Set(images).size} images)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from(new Set(images)).map((img, idx) => {
              const isCover = idx === 0;
              return (
                <div
                  key={idx}
                  className={`relative h-32 rounded-2xl overflow-hidden border transition-all ${
                    isCover
                      ? "ring-4 ring-amber-400 border-transparent shadow-md"
                      : "border-slate-200"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => onRemove(img)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors"
                        title="Supprimer la photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-start">
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => makeCover(img)}
                          className="flex items-center gap-1 bg-white/95 hover:bg-white text-kawral-dark text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs"
                        >
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{" "}
                          Principale
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual cover label when not hovered */}
                  {isCover && (
                    <div className="absolute bottom-2 left-2 bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-white text-white" />{" "}
                      PRINCIPALE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
