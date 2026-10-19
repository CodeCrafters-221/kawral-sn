import React from 'react';
import { Phone, MessageSquare, Calendar } from 'lucide-react';
import { WhatsAppIcon } from '../../../../components/ui';
import { buildWhatsAppUrl } from '../../../../utils/whatsapp';

interface ListingMobileBottomBarProps {
  phone: string;
  showPhone: boolean;
  onTogglePhone: () => void;
  onChat: () => void;
  onAppointment: () => void;
  listingTitle?: string;
  listingId?: string;
  hideAppointment?: boolean;
}

export const ListingMobileBottomBar: React.FC<ListingMobileBottomBarProps> = ({
  phone,
  showPhone,
  onTogglePhone,
  onChat,
  onAppointment,
  listingTitle,
  listingId,
  hideAppointment = false,
}) => {
  const whatsappUrl = buildWhatsAppUrl(phone, listingTitle, listingId);

  return (
    <div className="lg:hidden bg-white rounded-3xl border border-kawral-border shadow-xs p-4 space-y-3">
      <p className="text-[11px] font-black uppercase tracking-wider text-kawral-muted">
        Contacter le vendeur
      </p>

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
          aria-label="Contacter sur WhatsApp"
        >
          <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
          <span>Contacter sur WhatsApp</span>
        </a>
      )}

      <div className="grid grid-cols-2 gap-2">
        {showPhone && phone ? (
          <a
            href={`tel:${phone}`}
            className="bg-kawral-green text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform min-w-0"
          >
            <Phone className="w-4 h-4 text-kawral-orange shrink-0" />
            <span className="truncate text-xs font-bold">{phone}</span>
          </a>
        ) : (
          <button
            onClick={onTogglePhone}
            className="bg-kawral-green text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform cursor-pointer min-w-0"
          >
            <Phone className="w-4 h-4 text-kawral-orange shrink-0" />
            <span className="truncate">Appeler / Voir n°</span>
          </button>
        )}
        <button
          onClick={onChat}
          className="bg-kawral-orange text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform cursor-pointer min-w-0"
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span className="truncate">Message</span>
        </button>
      </div>

      {!hideAppointment && (
        <button
          onClick={onAppointment}
          className="w-full bg-white border border-kawral-border text-kawral-green py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Prendre rendez-vous</span>
        </button>
      )}

      <p className="text-[11px] text-kawral-muted text-center leading-snug">
        {hideAppointment
          ? "Ne payez jamais d'acompte avant d'avoir vérifié l'article en personne."
          : "Ne payez jamais d'acompte avant visite et vérification."}
      </p>
    </div>
  );
};
