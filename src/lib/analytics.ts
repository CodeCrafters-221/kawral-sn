/**
 * Service Google Analytics 4 (gtag.js) & Télémétrie Marketing Kawral
 * Measurement ID par défaut : G-Z9H926ZGPW
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const env =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : ({} as Record<string, string | undefined>);

export const GA_MEASUREMENT_ID =
  env.VITE_GA_MEASUREMENT_ID || "G-Z9H926ZGPW";

export interface ModificationLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actionType:
    | "listing_created"
    | "listing_updated"
    | "status_changed"
    | "listing_approved"
    | "listing_rejected"
    | "listing_deleted"
    | "role_updated"
    | "category_updated"
    | "ai_description";
  targetTitle: string;
  targetId?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

const MODIFICATION_STORAGE_KEY = "kawral_admin_modification_logs_v1";
const VISITOR_SESSION_KEY = "kawral_ga_visitor_id_v1";

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let vid = localStorage.getItem(VISITOR_SESSION_KEY);
    if (!vid) {
      vid = `v_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(VISITOR_SESSION_KEY, vid);
    }
    return vid;
  } catch {
    return `v_${Date.now()}`;
  }
}

function isReturningVisitor(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const firstSeen = localStorage.getItem("kawral_ga_first_seen");
    const now = Date.now();
    if (!firstSeen) {
      localStorage.setItem("kawral_ga_first_seen", String(now));
      return false;
    }
    // Considéré récurrent si la première visite date de plus de 30 minutes
    return now - Number(firstSeen) > 30 * 60 * 1000;
  } catch {
    return false;
  }
}

function detectDeviceInfo() {
  if (typeof navigator === "undefined") {
    return {
      deviceCategory: "mobile" as const,
      browser: "Chrome",
      os: "Android",
    };
  }
  const ua = navigator.userAgent || "";
  const isTablet = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua);
  const isMobile =
    !isTablet &&
    /Mobile|iPhone|iPod|Android.*Mobile|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  const deviceCategory: "mobile" | "desktop" | "tablet" = isTablet
    ? "tablet"
    : isMobile
      ? "mobile"
      : "desktop";

  let browser = "Autre";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";

  let os = "Autre";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { deviceCategory, browser, os };
}

function extractMarketingSource() {
  if (typeof window === "undefined") {
    return {
      source: "direct",
      medium: "(none)",
      campaign: "(direct)",
      channel: "Direct",
    };
  }
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source")?.toLowerCase();
  const utmMedium = params.get("utm_medium")?.toLowerCase();
  const utmCampaign = params.get("utm_campaign") || "(not set)";

  let referrerHost = "";
  try {
    if (document.referrer) {
      const refUrl = new URL(document.referrer);
      if (refUrl.hostname !== window.location.hostname) {
        referrerHost = refUrl.hostname.replace(/^www\./, "").toLowerCase();
      }
    }
  } catch {
    // ignore invalid referrer
  }

  const source = utmSource || referrerHost || "direct";
  let medium = utmMedium || (referrerHost ? "referral" : "(none)");
  let channel = "Direct";

  if (
    /google|bing|yahoo|duckduckgo|ecosia|qwant/.test(source) &&
    medium !== "cpc" &&
    medium !== "paid"
  ) {
    medium = "organic";
    channel = "Organic Search";
  } else if (
    /facebook|fb|instagram|whatsapp|tiktok|linkedin|twitter|x\.com|t\.co/.test(
      source,
    ) ||
    medium === "social"
  ) {
    medium = "social";
    channel = "Organic Social";
  } else if (medium === "cpc" || medium === "ppc" || medium === "paid") {
    channel = "Paid Search";
  } else if (medium === "email" || medium === "newsletter") {
    channel = "Email";
  } else if (referrerHost) {
    channel = "Referral";
  }

  return {
    source,
    medium,
    campaign: utmCampaign,
    channel,
  };
}

/**
 * Initialise le script Google Analytics 4 si nécessaire
 */
export function initGoogleAnalytics(): void {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false,
    });
  }

  const existingScript = document.querySelector(
    `script[src*="googletagmanager.com/gtag/js"]`,
  );
  if (!existingScript) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }
}

/**
 * Envoie un événement au collecteur serveur pour alimenter le Dashboard Temps Réel
 * en complément de Google Analytics 4.
 */
function sendToServerCollector(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const device = detectDeviceInfo();
    const marketing = extractMarketingSource();
    const body = JSON.stringify({
      visitorId: getOrCreateVisitorId(),
      isReturning: isReturningVisitor(),
      ...device,
      ...marketing,
      ...payload,
      timestamp: new Date().toISOString(),
    });

    fetch("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Silencieux si hors-ligne
    });
  } catch {
    // Silencieux
  }
}

/**
 * Suit chaque changement de page dans le routeur SPA React
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window === "undefined") return;
  const title = pageTitle || document.title || "Kawral Marketplace";

  if (typeof window.gtag === "function" && GA_MEASUREMENT_ID) {
    window.gtag("event", "page_view", {
      page_title: title,
      page_location: window.location.href,
      page_path: pagePath,
      send_to: GA_MEASUREMENT_ID,
    });
  }

  sendToServerCollector({
    type: "page_view",
    eventName: "page_view",
    pagePath,
    pageTitle: title,
  });
}

/**
 * Suit un événement marketing ou de conversion clé sur la plateforme
 */
export function trackMarketingEvent(
  eventName:
    | "view_item"
    | "contact_seller"
    | "whatsapp_click"
    | "phone_click"
    | "book_appointment"
    | "add_to_wishlist"
    | "search"
    | "publish_listing"
    | "share_listing",
  params: Record<string, string | number | boolean | undefined> = {},
): void {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function" && GA_MEASUREMENT_ID) {
    window.gtag("event", eventName, {
      ...params,
      send_to: GA_MEASUREMENT_ID,
    });
  }

  sendToServerCollector({
    type: "event",
    eventName,
    pagePath: window.location.pathname,
    pageTitle: document.title,
    eventParams: params,
  });
}

/**
 * Enregistre une modification dans le journal d'audit local & serveur
 * pour l'historique paginé des longues modifications.
 */
export function recordModificationLog(
  entry: Omit<ModificationLogEntry, "id" | "timestamp">,
): ModificationLogEntry {
  const fullEntry: ModificationLogEntry = {
    ...entry,
    id: `mod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(MODIFICATION_STORAGE_KEY);
      const existing: ModificationLogEntry[] = raw ? JSON.parse(raw) : [];
      const updated = [fullEntry, ...existing].slice(0, 300);
      localStorage.setItem(MODIFICATION_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("kawral-modification-logged"));
    } catch {
      // ignore storage quota errors
    }

    fetch("/api/admin/modifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullEntry),
    }).catch(() => {
      // ignore offline
    });
  }

  return fullEntry;
}

/**
 * Récupère les modifications enregistrées localement
 */
export function getLocalModificationLogs(): ModificationLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MODIFICATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
