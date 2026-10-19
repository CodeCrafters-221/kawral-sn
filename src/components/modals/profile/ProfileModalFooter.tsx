import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../../ui';

interface ProfileModalFooterProps {
  fieldErrors: Record<string, string>;
  isUploading: boolean;
  saving: boolean;
}

export const ProfileModalFooter: React.FC<ProfileModalFooterProps> = ({
  fieldErrors,
  isUploading,
  saving,
}) => {
  const hasErrors = Object.values(fieldErrors).some(Boolean);

  return (
    <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 bg-white border-t border-slate-200 shadow-[0_-8px_24px_-4px_rgba(0,0,0,0.12)] z-50">
      {hasErrors && (
        <p className="text-[11px] text-rose-500 mb-2 text-center font-medium">
          Corrigez les erreurs ci-dessus avant d'enregistrer.
        </p>
      )}
      {isUploading && (
        <p className="text-[11px] text-kawral-green mb-2 text-center font-medium flex items-center justify-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Upload en cours, patientez…
        </p>
      )}
      <Button
        type="submit"
        form="profile-form"
        variant="primary"
        size="md"
        fullWidth
        isLoading={saving}
        disabled={saving || isUploading}
        className="shadow-md py-3 text-sm font-bold"
      >
        ✓ Enregistrer les modifications
      </Button>
    </div>
  );
};
