import React from 'react';
import { Trash2, AlertTriangle, MapPin, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Badge,
  SafeImage,
} from '../ui';
import { Listing } from '../../types';

export interface DeleteListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  listing: Listing | null;
  isDeleting?: boolean;
}

export const DeleteListingModal: React.FC<DeleteListingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  listing,
  isDeleting = false,
}) => {
  if (!listing) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open && !isDeleting) {
      onClose();
    }
  };

  const thumbnail = listing.images && listing.images.length > 0 ? listing.images[0] : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!isDeleting}
        className="max-w-md p-5 sm:p-6"
      >
        <DialogHeader className="flex flex-row items-center gap-3.5 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 text-left">
            <DialogTitle className="font-extrabold text-base sm:text-lg text-kawral-dark">
              Supprimer l'annonce
            </DialogTitle>
            <DialogDescription className="text-xs text-kawral-muted">
              Cette action supprimera définitivement le bien de votre compte.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Listing preview item */}
        <div className="p-3 bg-kawral-ivory/80 rounded-2xl border border-kawral-border/60 flex items-center gap-3 mt-1">
          <SafeImage
            src={thumbnail}
            alt={listing.title}
            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-kawral-border/50"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <p
              title={listing.title}
              className="font-bold text-xs sm:text-sm text-kawral-dark line-clamp-2 break-words [overflow-wrap:anywhere]"
            >
              {listing.title}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-kawral-muted">
              {listing.location?.city && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {listing.location.neighborhood
                    ? `${listing.location.neighborhood}, ${listing.location.city}`
                    : listing.location.city}
                </span>
              )}
              {listing.categoryLabel && (
                <Badge variant="accent" size="sm" className="shrink-0">
                  {listing.categoryLabel}
                </Badge>
              )}
            </div>
            <p className="text-xs font-black text-kawral-green">
              {typeof listing.price === 'number'
                ? `${listing.price.toLocaleString('fr-FR')} FCFA`
                : ''}
            </p>
          </div>
        </div>

        {/* Irreversible Warning Box */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200/70 text-amber-900 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Attention :</strong> Cette action est irréversible. L'annonce, ses photos et ses messages associés seront définitivement retirés de Kawral.
          </span>
        </div>

        {/* Actions buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto font-medium"
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="md"
            onClick={onConfirm}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="w-4 h-4" />}
            className="w-full sm:w-auto font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
