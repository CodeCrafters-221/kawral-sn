import React from 'react';
import { Loader2, ImagePlus, X } from 'lucide-react';

interface ProfileBannerUploadProps {
  bannerPreview: string;
  uploadingBanner: boolean;
  onBannerClick: () => void;
  onBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  bannerInputRef: React.RefObject<HTMLInputElement | null>;
  onBannerError: () => void;
}

export const ProfileBannerUpload: React.FC<ProfileBannerUploadProps> = ({
  bannerPreview,
  uploadingBanner,
  onBannerClick,
  onBannerChange,
  onClose,
  bannerInputRef,
  onBannerError,
}) => {
  return (
    <div className="h-28 sm:h-40 bg-slate-300 relative overflow-hidden">
      {bannerPreview ? (
        <img
          src={bannerPreview}
          alt="Bannière de profil"
          className="w-full h-full object-cover"
          onError={onBannerError}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-kawral-green to-[#083A34]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Banner upload button */}
      <button
        type="button"
        onClick={onBannerClick}
        disabled={uploadingBanner}
        className="absolute bottom-2.5 right-10 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm transition-all cursor-pointer shadow-md disabled:opacity-60"
      >
        {uploadingBanner ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <ImagePlus className="w-3.5 h-3.5" />
        )}
        <span>{uploadingBanner ? 'Upload...' : 'Bannière'}</span>
      </button>
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onBannerChange}
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2.5 right-2.5 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm cursor-pointer z-30"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
