import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { MobileHelpBottomSheet } from "./MobileHelpBottomSheet";

export const MobileHelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le centre d'aide"
        title="Centre d'aide et informations utiles"
        className="sm:hidden fixed bottom-[calc(68px+env(safe-area-inset-bottom,0px))] right-4 z-40 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-kawral-green hover:bg-kawral-darkgreen text-white shadow-xl border border-white/25 active:scale-90 transition-all duration-200 cursor-pointer backdrop-blur-md group"
      >
        <HelpCircle className="w-4 h-4 text-kawral-orange group-hover:rotate-12 transition-transform" />
        <span className="font-extrabold text-xs tracking-wide">Aide</span>
      </button>

      <MobileHelpBottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
