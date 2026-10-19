/**
 * Helper to build a direct WhatsApp chat URL for contacting a listing publisher.
 * Handles Senegalese and international phone numbers format.
 */
export function buildWhatsAppUrl(
  phone?: string | null,
  listingTitle?: string,
  listingId?: string,
  customMessage?: string
): string | null {
  if (!phone || typeof phone !== "string") return null;

  // Clean all spaces, dashes, dots, parentheses, and leading plus
  let cleaned = phone.replace(/[^0-9]/g, "");

  if (!cleaned) return null;

  // Handle leading 00 (e.g. 00221 -> 221)
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  }

  // Handle Senegalese local 9-digit numbers (e.g. 771234567, 78..., 76..., 70..., 75..., 33...)
  if (
    cleaned.length === 9 &&
    (cleaned.startsWith("7") || cleaned.startsWith("3"))
  ) {
    cleaned = `221${cleaned}`;
  }

  // Minimum phone number length check
  if (cleaned.length < 8) return null;

  let message = "Bonjour, je vous contacte depuis Kawral";
  if (listingTitle) {
    message += ` au sujet de votre annonce "${listingTitle}"`;
  }
  if (listingId) {
    message += ` (Réf: ${listingId.slice(0, 8)})`;
  }

  if (customMessage && customMessage.trim()) {
    message += `. ${customMessage.trim()}`;
  } else {
    message += ". Est-elle toujours disponible ?";
  }

  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
