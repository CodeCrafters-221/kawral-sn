import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { profileService } from "../../services/supabase/profileService";
import { uploadAvatar } from "../../services/supabase/storageService";
import { profileSchema, getZodErrors } from "../../lib/validation";
import { ProfileBannerUpload } from "./profile/ProfileBannerUpload";
import { ProfileAvatarBadge } from "./profile/ProfileAvatarBadge";
import { ProfileFormFields } from "./profile/ProfileFormFields";
import { ProfileModalFooter } from "./profile/ProfileModalFooter";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    setCurrentUser,
    addToast,
  } = useApp();
  const { refreshProfile } = useAuth();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const isSeller = currentUser?.role === "seller";

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  // Preview URLs shown in UI (can be data: URL while uploading)
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  // Confirmed remote URLs (only set after successful Supabase Storage upload)
  const [avatarRemote, setAvatarRemote] = useState("");
  const [bannerRemote, setBannerRemote] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Initialize only once when modal opens
  const initializedRef = useRef(false);
  useEffect(() => {
    if (isOpen && currentUser && !initializedRef.current) {
      initializedRef.current = true;
      setName(currentUser.name || "");
      setPhone(currentUser.phone || "");
      setAvatarPreview(currentUser.avatar || "");
      setAvatarRemote(currentUser.avatar || "");
      const initBanner = currentUser.banner || "";
      setBannerPreview(initBanner);
      setBannerRemote(initBanner);
    }
    if (!isOpen) {
      initializedRef.current = false;
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen || !currentUser) return null;

  // ── Upload helper ──────────────────────────────────────────────────────────
  const doUpload = async (
    file: File,
    maxMb: number,
    setUploading: (v: boolean) => void,
    setPreview: (url: string) => void,
    setRemote: (url: string) => void,
    previousPreview: string,
    uploader: (f: File) => Promise<string | null>,
    label: string,
  ) => {
    if (file.size > maxMb * 1024 * 1024) {
      addToast(`Image trop lourde (max ${maxMb} Mo).`, "error");
      return;
    }

    // Show local preview immediately
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Erreur lecture fichier"));
      reader.readAsDataURL(file);
    }).catch(() => null);

    if (!dataUrl) {
      addToast("Impossible de lire le fichier.", "error");
      return;
    }

    setPreview(dataUrl);
    setUploading(true);

    try {
      const remoteUrl = await uploader(file);
      if (remoteUrl) {
        setPreview(remoteUrl);
        setRemote(remoteUrl);
        addToast(`${label} uploadé. Cliquez sur "Enregistrer".`, "info");
      } else {
        setPreview(previousPreview);
        addToast(`Échec de l'upload ${label}. Réessayez.`, "error");
      }
    } catch {
      setPreview(previousPreview);
      addToast(`Erreur upload ${label}.`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    doUpload(
      f,
      5,
      setUploadingAvatar,
      setAvatarPreview,
      setAvatarRemote,
      avatarPreview,
      (file) => uploadAvatar(currentUser.id, file),
      "Photo",
    );
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    doUpload(
      f,
      10,
      setUploadingBanner,
      setBannerPreview,
      setBannerRemote,
      bannerPreview,
      (file) => uploadAvatar(currentUser.id, file),
      "Bannière",
    );
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (uploadingAvatar || uploadingBanner) {
      addToast("Upload en cours, patientez...", "info");
      return;
    }

    const v = getZodErrors(profileSchema, { name, phone: phone || undefined });
    if (v.success === false) {
      setFieldErrors(v.errors);
      return;
    }

    const finalAvatar = avatarRemote.startsWith("data:")
      ? currentUser.avatar || ""
      : avatarRemote;
    const finalBanner = bannerRemote.startsWith("data:")
      ? currentUser.banner || ""
      : bannerRemote;

    setSaving(true);
    try {
      setCurrentUser({
        ...currentUser,
        name,
        phone,
        avatar: finalAvatar,
        banner: finalBanner,
      });

      await profileService.saveProfile(currentUser.id, {
        fullName: name,
        phone,
        ...(finalAvatar ? { avatarUrl: finalAvatar } : {}),
        ...(finalBanner ? { bannerUrl: finalBanner } : {}),
      });

      addToast("Profil mis à jour avec succès !", "success");
      onClose();
      setTimeout(() => refreshProfile().catch(() => {}), 800);
    } catch (err) {
      console.error("Save error:", err);
      addToast("Erreur lors de la sauvegarde.", "error");
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = isSeller
    ? "Vendeur"
    : currentUser.role === "admin"
      ? "Admin"
      : "Client";
  const isUploading = uploadingAvatar || uploadingBanner;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-kawral-border overflow-hidden animate-slide-up sm:animate-fade-in mb-16 sm:mb-0 h-[calc(100dvh-5rem)] sm:h-auto max-h-[calc(100dvh-5rem)] sm:max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Banner Zone & Avatar */}
        <div className="relative shrink-0">
          <ProfileBannerUpload
            bannerPreview={bannerPreview}
            uploadingBanner={uploadingBanner}
            onBannerClick={() => bannerInputRef.current?.click()}
            onBannerChange={handleBannerChange}
            onClose={onClose}
            bannerInputRef={bannerInputRef}
            onBannerError={() => setBannerPreview("")}
          />

          <ProfileAvatarBadge
            name={name}
            avatarPreview={avatarPreview}
            uploadingAvatar={uploadingAvatar}
            roleLabel={roleLabel}
            onAvatarClick={() => avatarInputRef.current?.click()}
            onAvatarChange={handleAvatarChange}
            avatarInputRef={avatarInputRef}
            onImageError={() => setAvatarPreview("")}
          />
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-1 min-h-0 pt-12 sm:pt-14 px-4 sm:px-6 pb-6">
          <h2 className="text-base font-extrabold text-kawral-dark mb-0.5">
            {name || "Mon profil"}
          </h2>
          <p className="text-xs text-kawral-muted mb-4">{currentUser.email}</p>

          <ProfileFormFields
            isSeller={isSeller}
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            email={currentUser.email}
            fieldErrors={fieldErrors}
            onSubmit={handleSave}
          />
        </div>

        {/* Footer */}
        <ProfileModalFooter
          fieldErrors={fieldErrors}
          isUploading={isUploading}
          saving={saving}
        />
      </div>
    </div>
  );
};
