import { z } from 'zod';

/* ── Helpers réutilisables ───────────────────────────────────── */

/**
 * Vérifie et nettoie une URL de média (image, audio, avatar) afin de bloquer
 * tout vecteur XSS (ex: javascript:, data:text/html, vbscript:).
 * Autorise uniquement https://, http://, blob: (prévisualisation locale) ou chemin relatif '/'.
 */
export function sanitizeSafeUrl(url: unknown): string {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 2048) return '';
  if (trimmed.startsWith('/')) {
    // Empêcher les protocol-relative URLs arbitraires "//evil.com" si non attendues
    return trimmed.startsWith('//') ? '' : trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (
      parsed.protocol === 'https:' ||
      parsed.protocol === 'http:' ||
      parsed.protocol === 'blob:'
    ) {
      return trimmed;
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Filtre un tableau d'URLs pour ne conserver que les URLs sûres.
 */
export function sanitizeSafeUrlList(urls: unknown): string[] {
  if (!Array.isArray(urls)) return [];
  return urls
    .map((u) => sanitizeSafeUrl(u))
    .filter((u): u is string => u.length > 0);
}

/** Numéro sénégalais : +221 7x xxx xx xx ou 7x xxx xx xx */
export const senegalPhone = z
  .string()
  .min(1, 'Le téléphone est requis')
  .transform(v => v.replace(/\s+/g, '').replace(/[-().]/g, ''))
  .pipe(
    z.string().regex(
      /^(\+221)?[3-9]\d{8}$/,
      'Numéro invalide — ex: +221 77 000 00 00'
    )
  );

/** Nom complet : 2 à 80 caractères, lettres + espaces + tirets + apostrophes */
const fullName = z
  .string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(80, 'Le nom est trop long (max 80 caractères)')
  .regex(
    /^[\p{L}\s'\-]+$/u,
    'Le nom ne doit contenir que des lettres, espaces ou tirets'
  )
  .transform(v => v.trim());

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.fr.nf',
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'suremail.info',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', 'minutemail.com',
  'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.net', 'guerrillamailblock.com',
  'trashmail.com', 'trashmail.net', 'trashmail.org', 'trashmail.ws',
  'sharklasers.com', 'dispostable.com', 'getairmail.com', 'throwawaymail.com',
  'fake.com', 'test.com', 'example.com', 'fakemailgenerator.com', 'crazymailing.com',
  'nada.ltd', 'mohmal.com', 'generator.email', 'dropmail.me', 'inboxkitten.com',
  'mytemp.email', 'tempail.com', 'tempr.email', 'discard.email', 'discardmail.com',
  'spam4.me', 'fakemail.net', 'getnada.com', 'emailondeck.com', 'burnermail.io',
]);

const COMMON_TYPO_DOMAINS: Record<string, string> = {
  'gmaiil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotamil.com': 'hotmail.com',
  'yaaho.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outllok.com': 'outlook.com',
  'icloude.com': 'icloud.com',
  'icoud.com': 'icloud.com',
};

/** Email standard avec détection des faux emails / domaines jetables */
const email = z
  .string()
  .min(1, 'L\'email est requis')
  .max(254, 'Email trop long')
  .toLowerCase()
  .trim()
  .email('Format d\'adresse email invalide (ex: nom@domaine.sn)')
  .refine((val) => {
    const parts = val.split('@');
    return parts[0] && parts[0].length >= 2;
  }, {
    message: 'L\'identifiant avant le @ doit contenir au moins 2 caractères',
  })
  .refine((val) => {
    const domain = val.split('@')[1];
    return !domain || !DISPOSABLE_EMAIL_DOMAINS.has(domain);
  }, {
    message: 'Les adresses emails temporaires ou jetables ne sont pas autorisées',
  })
  .refine((val) => {
    const domain = val.split('@')[1];
    return !domain || !COMMON_TYPO_DOMAINS[domain];
  }, (val) => {
    const domain = val.split('@')[1] || '';
    const suggested = COMMON_TYPO_DOMAINS[domain];
    return {
      message: `Adresse invalide. Vouliez-vous dire @${suggested} ?`,
    };
  });

/** Mot de passe : min 8 chars, au moins 1 lettre + 1 chiffre */
const password = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Mot de passe trop long')
  .regex(/[a-zA-Z]/, 'Le mot de passe doit contenir au moins une lettre')
  .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre');

/** Nom d'agence ou d'entreprise */
const agencyName = z
  .string()
  .min(2, "Le nom de l'agence doit contenir au moins 2 caractères")
  .max(100, 'Nom trop long (max 100 caractères)')
  .transform(v => v.trim());

/** Texte libre (description, message) */
const freeText = (max = 2000) =>
  z
    .string()
    .max(max, `Trop long (max ${max} caractères)`)
    .transform(v => v.trim());

/* ── Schémas complets par formulaire ────────────────────────── */

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const registerSchema = z.object({
  name:     fullName,
  email,
  password,
  phone:    senegalPhone,
});

export const appointmentSchema = z.object({
  clientName:  fullName,
  clientPhone: senegalPhone,
  clientEmail: email,
  date:        z.string().min(1, 'La date est requise'),
  time:        z.string().min(1, "L'heure est requise"),
  message:     freeText(500).optional(),
});

export const profileSchema = z.object({
  name:  fullName,
  phone: senegalPhone.optional().or(z.literal('')),
});

/* ── Inferred types ─────────────────────────────────────────── */
export type LoginInput       = z.infer<typeof loginSchema>;
export type RegisterInput    = z.infer<typeof registerSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type ProfileInput     = z.infer<typeof profileSchema>;

/* ── Helper : parse et retourne les erreurs sous forme d'objet ─ */
export function getZodErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true as const, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach(err => {
    const key = err.path.join('.');
    if (!errors[key]) errors[key] = err.message;
  });
  return { success: false as const, errors };
}
