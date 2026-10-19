import React from 'react';
import { MessageSquare, Calendar } from 'lucide-react';
import type { User } from '../../../types';

interface NavbarUserStatsProps {
  currentUser: User;
  conversationsCount: number;
  appointmentsCount: number;
  unreadMessagesCount: number;
  pendingAppointmentsCount: number;
  onNavigateTo: (view: string) => void;
  onClose: () => void;
}

export const NavbarUserStats: React.FC<NavbarUserStatsProps> = ({
  currentUser,
  conversationsCount,
  appointmentsCount,
  unreadMessagesCount,
  pendingAppointmentsCount,
  onNavigateTo,
  onClose,
}) => {
  if (currentUser.role === 'admin') return null;

  const canShowAppointments =
    currentUser.role === 'client' || currentUser.role === 'seller';

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      <button
        onClick={() => {
          onNavigateTo('messaging');
          onClose();
        }}
        className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-[11px] text-white font-semibold">Messages</span>
        </div>
        <span
          className={`text-[11px] font-black rounded-full px-1.5 py-0.5 ${
            unreadMessagesCount > 0 ? 'bg-kawral-orange text-white' : 'bg-white/20 text-white'
          }`}
        >
          {conversationsCount}
        </span>
      </button>

      {canShowAppointments && (
        <button
          onClick={() => {
            onNavigateTo('appointments');
            onClose();
          }}
          className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px] text-white font-semibold">RDV</span>
          </div>
          <span
            className={`text-[11px] font-black rounded-full px-1.5 py-0.5 ${
              pendingAppointmentsCount > 0 ? 'bg-kawral-orange text-white' : 'bg-white/20 text-white'
            }`}
          >
            {appointmentsCount}
          </span>
        </button>
      )}
    </div>
  );
};
