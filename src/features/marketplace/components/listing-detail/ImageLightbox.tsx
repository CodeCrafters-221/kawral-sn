import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ImageLightboxProps {
  images: string[];
  activeIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  activeIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onNavigate(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
    if (e.key === 'ArrowRight') onNavigate(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  }, [isOpen, activeIndex, images.length, onClose, onNavigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <button
        onClick={onClose}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 cursor-pointer"
        aria-label="Fermer"
      >
        <X className="w-6 h-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={() => onNavigate(activeIndex === 0 ? images.length - 1 : activeIndex - 1)}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 cursor-pointer"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={() => onNavigate(activeIndex === images.length - 1 ? 0 : activeIndex + 1)}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 cursor-pointer"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div className="w-full h-full p-4 sm:p-12 flex items-center justify-center" onClick={onClose}>
        <img
          src={images[activeIndex]}
          alt="Vue agrandie"
          className="max-w-full max-h-full object-contain animate-[fadeIn_.3s_ease] filter drop-shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <span className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md">
          {activeIndex + 1} / {images.length}
        </span>
      </div>
    </div>,
    document.body
  );
};
