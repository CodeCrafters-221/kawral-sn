import React from 'react';
import { Loader2, Camera } from 'lucide-react';
import { Avatar } from '../../ui';

interface ProfileAvatarBadgeProps {
  name: string;
  avatarPreview: string;
  uploadingAvatar: boolean;
  roleLabel: string;
  onAvatarClick: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  onImageError: () => void;
}

export const ProfileAvatarBadge: React.FC<ProfileAvatarBadgeProps> = ({
  name,
  avatarPreview,
  uploadingAvatar,
  roleLabel,
  onAvatarClick,
  onAvatarChange,
  avatarInputRef,
  onImageError,
}) => {
  return (
    <>
      {/* Floating avatar */}
      <div className="absolute left-4 sm:left-5 -bottom-9 sm:-bottom-10 z-20">
        <div className="relative">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full ring-4 ring-white/90 shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={onImageError}
              />
            ) : (
              <Avatar src="" name={name} size="xl" className="w-full h-full" />
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onAvatarClick}
            disabled={uploadingAvatar}
            className="absolute -bottom-1.5 -right-1.5 p-2 bg-kawral-orange hover:bg-kawral-orange-hover text-white rounded-full shadow-lg transition-colors disabled:opacity-50 cursor-pointer"
            title="Changer la photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onAvatarChange}
          />
        </div>
      </div>

      {/* Role badge */}
      <div className="absolute right-4 bottom-[-16px] z-10">
        <span className="text-[10px] font-extrabold bg-white text-kawral-green border border-kawral-green/20 px-3 py-1 rounded-full shadow-sm">
          {roleLabel}
        </span>
      </div>
    </>
  );
};
