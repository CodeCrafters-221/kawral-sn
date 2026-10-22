import React from "react";
import { CheckCircle2 } from "lucide-react";
import { AudioPlayer } from "../../../../components/ui/AudioPlayer";
import { SafeImage } from "../../../../components/ui/SafeImage";

import { TransactionType } from "../../../../types";

interface Props {
  title: string;
  price: number;
  neighborhood: string;
  city: string;
  images: string[];
  description?: string;
  audioUrl?: string | null;
  isOther?: boolean;
  transactionType?: TransactionType;
  pricePeriod?: "month" | "day" | "total";
}

export const StepPreview: React.FC<Props> = ({
  title,
  price,
  neighborhood,
  city,
  images,
  description,
  audioUrl,
  isOther = false,
  transactionType = "sale",
  pricePeriod = "total",
}) => (
  <div className="space-y-6">
    <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl text-xs flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      <span>
        Votre annonce est prête à être vérifiée et publiée sur Kawral.
      </span>
    </div>

    <div className="border border-kawral-border rounded-2xl overflow-hidden bg-kawral-ivory p-4 sm:p-5 space-y-4">
      <div className="w-full h-52 sm:h-64 rounded-xl overflow-hidden bg-slate-100 shadow-xs shrink-0">
        <SafeImage
          src={images[0]}
          alt={title || "Aperçu de l'annonce"}
          className="w-full h-full object-cover block"
          style={{ height: "100%" }}
        />
      </div>

      <div className="min-w-0">
        <h3
          title={title}
          className="font-extrabold text-base sm:text-lg text-kawral-dark break-words [overflow-wrap:anywhere]"
        >
          {title || "Annonce sans titre"}
        </h3>
        <p className="text-xs text-kawral-muted mt-0.5">
          {neighborhood}, {city}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <p className="font-black text-xl text-kawral-green">
          {price.toLocaleString("fr-FR")} FCFA
          {transactionType === "rent" && pricePeriod !== "total" && (
            <span className="text-xs font-semibold text-kawral-muted ml-1">
              /{pricePeriod === "month" ? "mois" : "jour"}
            </span>
          )}
        </p>
        <span
          className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase ${
            transactionType === "rent"
              ? "bg-kawral-orange text-white"
              : "bg-kawral-green text-white"
          }`}
        >
          {transactionType === "rent" ? "À LOUER" : "À VENDRE"}
        </span>
      </div>

      {/* Note vocale si présente */}
      {audioUrl && (
        <div className="pt-2">
          <AudioPlayer
            audioUrl={audioUrl}
            title={isOther ? "Note vocale de l'article" : "Note vocale du bien"}
          />
        </div>
      )}

      {/* Description textuelle */}
      {description && description.trim() && (
        <div className="pt-2 border-t border-slate-200/70">
          <h4 className="text-xs font-bold text-kawral-dark mb-1">
            Description
          </h4>
          <p className="text-xs text-kawral-muted leading-relaxed line-clamp-4">
            {description}
          </p>
        </div>
      )}
    </div>
  </div>
);
