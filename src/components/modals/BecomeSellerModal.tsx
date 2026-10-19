import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Building,
} from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Badge,
} from "../ui";
import { useApp } from "../../context/AppContext";

interface BecomeSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BecomeSellerModal: React.FC<BecomeSellerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, upgradeToSeller, setCurrentView, addToast } = useApp();
  const navigate = useNavigate();

  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleConfirmUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const success = await upgradeToSeller();
      if (success) {
        addToast(
          `Félicitations ${currentUser?.name || ""} ! Votre compte est désormais Vendeur.`,
          "success"
        );
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          setCurrentView("seller-dashboard");
          navigate("/dashboard/seller");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        addToast(
          "Impossible de mettre à niveau votre compte. Veuillez réessayer.",
          "error"
        );
      }
    } catch (err) {
      console.error("Error upgrading to seller:", err);
      addToast(
        "Une erreur est survenue lors de la mise à niveau de votre compte.",
        "error"
      );
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isUpgrading && onClose()}>
      <DialogContent className="w-[94vw] max-w-lg p-5 sm:p-6 max-h-[90vh] overflow-y-auto rounded-3xl">
        <div className="space-y-4">
          <DialogHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-kawral-orange/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-kawral-orange" />
              </div>
              <div className="min-w-0 pr-6 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base sm:text-lg font-black text-kawral-dark">
                    Devenir Vendeur sur Kawral
                  </DialogTitle>
                  <Badge variant="accent" size="sm">
                    Gratuit
                  </Badge>
                </div>
                <p className="text-xs text-kawral-muted mt-0.5">
                  Activez votre statut vendeur pour publier et gérer vos annonces.
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Avantages du compte vendeur */}
          <div className="space-y-2.5 my-2">
            <h4 className="text-xs font-black text-kawral-dark uppercase tracking-wider">
              Ce que vous permet le statut Vendeur :
            </h4>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-kawral-dark">
                <div className="w-7 h-7 rounded-xl bg-kawral-green text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-kawral-dark font-extrabold">
                    Publication d'annonces
                  </strong>
                  <span className="text-[11px] text-kawral-muted leading-relaxed">
                    Publiez vos appartements, maisons, terrains, véhicules et équipements avec photos et notes vocales.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-kawral-dark">
                <div className="w-7 h-7 rounded-xl bg-kawral-green text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-kawral-dark font-extrabold">
                    Gestion des disponibilités & Rendez-vous
                  </strong>
                  <span className="text-[11px] text-kawral-muted leading-relaxed">
                    Définissez vos jours et créneaux pour recevoir des demandes de visite de clients intéressés.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-kawral-dark">
                <div className="w-7 h-7 rounded-xl bg-kawral-green text-white flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-kawral-dark font-extrabold">
                    Messagerie directe & Tableau de bord
                  </strong>
                  <span className="text-[11px] text-kawral-muted leading-relaxed">
                    Échangez avec les acheteurs et suivez les statistiques de vos biens en temps réel.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pied de modale : Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isUpgrading}
            >
              Annuler
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={handleConfirmUpgrade}
              disabled={isUpgrading}
              isLoading={isUpgrading}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
              className="w-full sm:w-auto"
            >
              <span>Confirmer et devenir vendeur</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
