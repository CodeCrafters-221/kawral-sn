import React from 'react';

interface Props {
  total: number;
  active: number;
  onSelect: (i: number) => void;
  autoPlay?: boolean;
}

export const DotNav: React.FC<Props> = ({ total, active, onSelect, autoPlay = false }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: Math.min(total, 8) }).map((_, i) => (
      <button
        key={i}
        onClick={() => onSelect(i)}
        className="relative overflow-hidden rounded-full transition-all duration-300"
        style={{ width: i === active ? 20 : 8, height: 8 }}
      >
        <span className="absolute inset-0 rounded-full bg-white/40" />
        {i === active && (
          <span
            className={`absolute inset-0 rounded-full bg-white ${
              autoPlay ? 'animate-[shrink_4s_linear]' : ''
            }`}
          />
        )}
      </button>
    ))}
    {total > 8 && (
      <span className="text-white/60 text-[10px] font-bold ml-1">+{total - 8}</span>
    )}
  </div>
);
