import React from "react";
import { User, Phone, Mail, Pencil } from "lucide-react";
import { Input } from "../../ui";

interface ProfileFormFieldsProps {
  isSeller: boolean;
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  fieldErrors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
  isSeller,
  name,
  setName,
  phone,
  setPhone,
  email,
  fieldErrors,
  onSubmit,
}) => {
  return (
    <form id="profile-form" onSubmit={onSubmit} className="space-y-3.5 pb-4">
      <Input
        label="Nom complet"
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={fieldErrors.name}
        leftIcon={<User className="w-4 h-4" />}
      />

      <Input
        label="Téléphone"
        type="tel"
        placeholder="+221 xx xxx xx xx"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={fieldErrors.phone}
        leftIcon={<Phone className="w-4 h-4" />}
      />

      <Input
        label="Adresse Email"
        type="email"
        value={email}
        disabled
        helperText="L'adresse email ne peut pas être modifiée."
        leftIcon={<Mail className="w-4 h-4" />}
      />

      {isSeller && (
        <div className="flex items-start gap-3 p-3 bg-kawral-green/5 border border-kawral-green/15 rounded-2xl">
          <Pencil className="w-4 h-4 text-kawral-green shrink-0 mt-0.5" />
          <p className="text-xs text-kawral-green font-medium leading-relaxed">
            La bannière et la photo sont visibles sur votre profil vendeur public.
          </p>
        </div>
      )}
    </form>
  );
};
