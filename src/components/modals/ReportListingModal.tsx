import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, AlertTriangle, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
} from '../ui';

interface ReportListingModalProps {
  listingId: string;
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportListingModal: React.FC<ReportListingModalProps> = ({
  listingId,
  listingTitle,
  isOpen,
  onClose
}) => {
  const { submitReport } = useApp();

  const [reason, setReason] = useState<'fraud' | 'incorrect_info' | 'unavailable' | 'suspicious' | 'other'>('incorrect_info');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(listingId, listingTitle, reason, details);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <DialogTitle className="font-extrabold text-base sm:text-lg text-kawral-dark">
              Signaler cette annonce
            </DialogTitle>
            <DialogDescription
              title={listingTitle}
              className="text-xs text-kawral-muted line-clamp-2 break-words"
            >
              {listingTitle}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-kawral-dark mb-1.5 uppercase tracking-wider">
              Motif du signalement
            </label>
            <div className="relative w-full min-w-0">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full min-w-0 max-w-full appearance-none pr-9 truncate bg-kawral-ivory border border-kawral-border rounded-xl p-3 text-xs font-semibold text-kawral-dark focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 cursor-pointer"
              >
                <option value="incorrect_info">Informations incorrectes ou erronées</option>
                <option value="fraud">Tentative de fraude / Arnaque</option>
                <option value="unavailable">Bien déjà vendu ou loué / Indisponible</option>
                <option value="suspicious">Comportement ou photos suspectes</option>
                <option value="other">Autre raison</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-kawral-dark mb-1.5 uppercase tracking-wider">
              Détails complémentaires
            </label>
            <textarea
              rows={3}
              required
              placeholder="Expliquez brièvement le problème rencontré..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-kawral-ivory border border-kawral-border rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-xl text-xs border border-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Votre signalement est anonyme et sera traité sous 24h.</span>
          </div>

          <Button
            type="submit"
            variant="destructive"
            size="md"
            fullWidth
            className="mt-2"
          >
            Transmettre le signalement
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
