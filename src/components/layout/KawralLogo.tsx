import React from "react";

interface KawralLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  useFullImage?: boolean;
}

// Fixed pixel dimensions per size — immune to CSS cascade and scroll-driven reflows
const ICON_PX: Record<string, number> = { sm: 32, md: 40, lg: 52, xl: 64 };
const TEXT_CLS: Record<string, string> = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl', xl: 'text-4xl' };
const TAGLINE_CLS: Record<string, string> = { sm: 'text-[9px]', md: 'text-[11px]', lg: 'text-[13px]', xl: 'text-[15px]' };
const IMG_HEIGHT_CLS: Record<string, string> = { sm: 'h-8', md: 'h-10', lg: 'h-13', xl: 'h-16' };

export const KawralLogo: React.FC<KawralLogoProps> = ({
  className = '',
  showTagline = true,
  size = 'md',
  variant = 'light',
  useFullImage = false,
}) => {
  const isDark = variant === 'dark';
  const px = ICON_PX[size] ?? 40;

  // Official brand tokens from system-design.jpg
  // Kawral Green: #123C36 | Kawral Orange: #F47B20 | Charcoal: #171A19
  const textKawColor = isDark ? 'text-white' : 'text-[#123C36]';
  const taglineTextColor = isDark ? 'text-slate-200' : 'text-[#171A19]';

  // If full extracted logo image is preferred
  if (useFullImage) {
    return (
      <div className={`cursor-pointer select-none flex items-center ${className}`}>
        <img
          src={isDark ? "/images/kawral-logo-dark.png" : "/images/kawral-logo.png"}
          alt="Kawral — Achetez. Louez. Vendez."
          className={`${IMG_HEIGHT_CLS[size]} w-auto object-contain`}
          style={{ height: px, width: 'auto', flexShrink: 0 }}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 cursor-pointer select-none ${className}`}>
      {/* ── Fixed 40x40 Emblem Container — anchors the text so it never shifts by a single pixel ── */}
      <div
        style={{ width: `${px}px`, height: `${px}px` }}
        className="flex items-center justify-center shrink-0 select-none"
      >
        {/* ── Avant scroll : app-icon (comme avant) | Après scroll : emblem, même taille fixe ── */}
        {isDark ? (
          // Avant le scroll — logo original inchangé
          <img
            src="/images/kawral-app-icon.png"
            alt="Kawral"
            style={{ width: `${px}px`, height: `${px}px` }}
            className="object-contain rounded-xl shadow-md select-none"
          />
        ) : (
          // Après le scroll — même taille que l'app-icon (px × px, plus de 0.85)
          <img
            src="/images/kawral-emblem.png"
            alt="Kawral"
            style={{ width: `${px}px`, height: `${px}px` }}
            className="object-contain drop-shadow-sm select-none"
          />
        )}
      </div>

      {/* ── Brand Typography: Explicitly locked font-size so it never shrinks ── */}
      <div className="flex flex-col justify-center">
        <div
          className="font-black tracking-tight leading-none flex items-baseline select-none"
          style={{ fontSize: '25px', lineHeight: 1 }}
        >
          <span
            className={`${textKawColor} transition-colors duration-300 ease-in-out`}
            style={{ fontWeight: 900 }}
          >
            Kaw
          </span>
          <span
            className="text-[#F47B20]"
            style={{ fontWeight: 900 }}
          >
            ral
          </span>
        </div>

        {showTagline && (
          <span
            className={`font-semibold tracking-wide leading-tight mt-1 whitespace-nowrap transition-colors duration-300 ease-in-out ${TAGLINE_CLS[size]} ${taglineTextColor}`}
          >
            Achetez. Louez. <span className="text-[#F47B20] font-bold">Vendez.</span>
          </span>
        )}
      </div>
    </div>
  );
};


