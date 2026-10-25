import React, { useState } from 'react';
import { Phone, MessageSquare, Calendar, CheckCircle2, Shield } from 'lucide-react';
import { Listing } from '../../types';
import { WhatsAppIcon } from '../ui';
import { buildWhatsAppUrl, getListingRef } from '../../utils/whatsapp';
import { trackMarketingEvent } from '../../lib/analytics';

const QUICK_MESSAGES = ['Toujours disponible ?', 'Je veux visiter.', 'Négociable ?'];

interface Props {
  listing: Listing;
  showPhone: boolean;
  onShowPhone: () => void;
  onChat: () => void;
  onAppointment: () => void;
  hideAppointment?: boolean;
}

export const ContactCard: React.FC<Props> = ({ listing, showPhone, onShowPhone, onChat, onAppointment, hideAppointment = false }) => {
  const [quickMsg, setQuickMsg] = useState<string | null>(null);

  const whatsappUrl = buildWhatsAppUrl(
    listing.owner.phone,
    listing.title,
    listing.id,
    quickMsg || undefined
  );

  const ownerLabel =
    listing.owner.type === 'owner' ? 'Propriétaire' : 'Vendeur';
  const listingRef = getListingRef(listing.id);

  const handlePhoneClick = () => {
    trackMarketingEvent('phone_click', {
      item_id: listing.id,
      item_name: listing.title,
      item_category: listing.categoryLabel,
      city: listing.location.city,
    });
    onShowPhone();
  };

  const handleWhatsAppClick = () => {
    trackMarketingEvent('whatsapp_click', {
      item_id: listing.id,
      item_name: listing.title,
      item_category: listing.categoryLabel,
      city: listing.location.city,
    });
  };

  const handleChatClick = () => {
    trackMarketingEvent('contact_seller', {
      item_id: listing.id,
      item_name: listing.title,
      item_category: listing.categoryLabel,
      method: 'internal_chat',
    });
    onChat();
  };

  const handleAppointmentClick = () => {
    trackMarketingEvent('book_appointment', {
      item_id: listing.id,
      item_name: listing.title,
      item_category: listing.categoryLabel,
      city: listing.location.city,
    });
    onAppointment();
  };

  return (
    <div className="bg-white rounded-3xl border border-kawral-border overflow-hidden shadow-lg">

      {/* Identity */}
      <div className="p-5 flex items-center gap-4 border-b border-slate-100">
        <div className="relative shrink-0">
          {listing.owner.avatar ? (
            <img src={listing.owner.avatar} alt="" className="w-14 h-14 rounded-2xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-kawral-green flex items-center justify-center text-white font-black text-xl">
              {listing.owner.name.charAt(0)}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="font-extrabold text-sm text-kawral-dark truncate">
              {listing.owner.name}
            </h4>
            {listing.owner.verified && <CheckCircle2 className="w-3.5 h-3.5 text-kawral-green shrink-0" />}
          </div>
          <p className="text-[11px] text-kawral-muted font-medium">{ownerLabel}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[10px] font-bold text-emerald-600">Répond en moins de 2h</span>
            </div>
            {listingRef && (
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                Réf : {listingRef}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-center bg-kawral-ivory rounded-2xl px-3 py-2 border border-kawral-border">
          <span className="text-base font-black text-kawral-green leading-none">{listing.views}</span>
          <span className="text-[9px] font-bold text-kawral-muted uppercase tracking-wide mt-0.5">vues</span>
        </div>
      </div>

      {/* Quick messages */}
      <div className="px-5 pt-4 pb-3">
        <p className="text-[10px] font-bold text-kawral-muted uppercase tracking-wider mb-2.5">Message rapide</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_MESSAGES.map((msg) => (
            <button
              key={msg}
              onClick={() => setQuickMsg((q) => q === msg ? null : msg)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                quickMsg === msg
                  ? 'bg-kawral-green text-white border-kawral-green'
                  : 'bg-kawral-ivory text-kawral-dark border-kawral-border hover:border-kawral-green/40'
              }`}
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

      {/* Call */}
      <div className="px-5 pb-2.5">
        {showPhone ? (
          <a href={`tel:${listing.owner.phone}`}
            onClick={handlePhoneClick}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-kawral-green text-white font-bold text-sm shadow-md">
            <Phone className="w-4 h-4 text-kawral-orange" /> {listing.owner.phone}
          </a>
        ) : (
          <div className="flex rounded-2xl overflow-hidden shadow-md">
            <button onClick={handlePhoneClick}
              className="flex-1 bg-kawral-green hover:bg-[#0a3d38] text-white py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
              <Phone className="w-4 h-4 text-kawral-orange" /> Appeler
            </button>
            <div className="w-px bg-white/20" />
            <button onClick={handlePhoneClick}
              className="px-4 bg-kawral-green hover:bg-[#0a3d38] text-white/70 hover:text-white text-[10px] font-bold transition-colors flex items-center">
              Voir n°
            </button>
          </div>
        )}
      </div>

      {/* WhatsApp */}
      {whatsappUrl && (
        <div className="px-5 pb-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
            <span>Contacter sur WhatsApp</span>
          </a>
        </div>
      )}

      {/* Secondary actions */}
      <div className={`px-5 pb-5 ${hideAppointment ? 'flex' : 'grid grid-cols-2'} gap-2.5`}>
        <button onClick={handleChatClick}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-kawral-orange hover:bg-[#e06a10] text-white font-bold text-xs shadow-sm transition-colors active:scale-[0.98] cursor-pointer">
          <MessageSquare className="w-3.5 h-3.5" />
          {quickMsg ? 'Envoyer' : 'Envoyer un message'}
        </button>
        {!hideAppointment && (
          <button onClick={handleAppointmentClick}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-kawral-border bg-kawral-ivory hover:bg-slate-100 text-kawral-dark font-bold text-xs transition-colors cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-kawral-green" /> Rendez-vous
          </button>
        )}
      </div>

      {/* Trust footer */}
      <div className="px-5 py-3 bg-kawral-ivory border-t border-kawral-border flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-kawral-green shrink-0" />
        <p className="text-[10px] text-kawral-muted leading-snug font-medium">
          Ne versez jamais d'argent avant d'avoir visité le bien et vérifié les documents.
        </p>
      </div>

    </div>
  );
};
