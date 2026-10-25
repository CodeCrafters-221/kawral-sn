import express from "express";
import "dotenv/config";
import path from "path";
import dns from "node:dns/promises";
import { createServer as createViteServer } from "vite";
import {
  getAnalyticsDashboardData,
  recordLiveAnalyticsEvent,
  type AnalyticsPeriod,
} from "./src/server/ga4Service";

const app = express();
const PORT = 3000;

app.disable("x-powered-by");

// En-têtes de sécurité HTTP
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), geolocation=(self), microphone=(self), payment=()"
  );
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  next();
});

// Limite stricte de taille JSON (100 Ko) contre les attaques par saturation mémoire
app.use(express.json({ limit: "100kb" }));

// Rate limiter en mémoire par IP pour l'endpoint DNS /api/auth/validate-email
const emailRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = emailRateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    emailRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Health check — GET /api/health
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    env: process.env.NODE_ENV || "development",
  });
});

// ── Google Analytics 4 & Télémétrie Temps Réel ──────────────────────────────

// Collecteur d'événements temps réel envoyé par le client (en parallèle de gtag.js)
app.post("/api/analytics/collect", (req, res) => {
  try {
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";
    recordLiveAnalyticsEvent(req.body || {}, clientIp);
    res.status(204).end();
  } catch {
    res.status(204).end();
  }
});

// Endpoint Dashboard Admin Google Analytics (Trafic 24h/7j/30j, Temps réel, Marketing, Visiteurs)
app.get("/api/admin/analytics", async (req, res) => {
  try {
    const rawPeriod = String(req.query.period || "7d");
    const period: AnalyticsPeriod =
      rawPeriod === "today" || rawPeriod === "30d" ? rawPeriod : "7d";
    const data = await getAnalyticsDashboardData(period);
    res.json(data);
  } catch (err) {
    console.error("Erreur lors de la récupération des données Google Analytics:", err);
    res.status(500).json({
      error: "ANALYTICS_ERROR",
      message: "Impossible de charger les données Google Analytics.",
    });
  }
});

// Journal serveur des modifications pour la pagination des longues modifications
interface ServerModificationLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actionType: string;
  targetTitle: string;
  targetId?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

const serverModificationsLog: ServerModificationLog[] = [
  {
    id: "mod_seed_1",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    actorName: "Moussa Diop (Immo Prestige)",
    actorRole: "seller",
    actionType: "listing_updated",
    targetTitle: "Villa R+2 contemporaine avec piscine aux Almadies",
    details: "Mise à jour du prix et ajout de 3 nouvelles photos HD",
    previousValue: "295 000 000 FCFA",
    newValue: "285 000 000 FCFA",
  },
  {
    id: "mod_seed_2",
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    actorName: "Administrateur",
    actorRole: "admin",
    actionType: "listing_approved",
    targetTitle: "Appartement F4 haut standing vue mer — Plateau",
    details: "Validation et mise en ligne après vérification des photos",
    previousValue: "Brouillon",
    newValue: "Publiée",
  },
  {
    id: "mod_seed_3",
    timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    actorName: "Fatou Ndiaye",
    actorRole: "seller",
    actionType: "listing_created",
    targetTitle: "Terrain viabilisé 300m² titre foncier — Diamniadio",
    details: "Publication d'une nouvelle annonce (Immobilier • Diamniadio) à 18 500 000 FCFA",
    newValue: "Publiée",
  },
  {
    id: "mod_seed_4",
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    actorName: "Cheikh Fall Auto",
    actorRole: "seller",
    actionType: "status_changed",
    targetTitle: "Toyota Prado TXL 2022 Automatique Diésel",
    details: "Changement de statut de l'annonce après conclusion de la vente",
    previousValue: "Publiée",
    newValue: "Vendu",
  },
  {
    id: "mod_seed_5",
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    actorName: "Administrateur",
    actorRole: "admin",
    actionType: "ai_description",
    targetTitle: "Studio meublé climatisé Mermoz Pyrotechnie",
    details: "Reformulation et enrichissement de la description par l'assistant IA",
    previousValue: "Description courte (85 car.)",
    newValue: "Description optimisée SEO (410 car.)",
  },
  {
    id: "mod_seed_6",
    timestamp: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    actorName: "Awa Seck",
    actorRole: "seller",
    actionType: "listing_updated",
    targetTitle: "Local commercial 120m² sur axe principal Sacré-Cœur 3",
    details: "Modification du loyer mensuel et des conditions de bail",
    previousValue: "850 000 FCFA / mois",
    newValue: "780 000 FCFA / mois",
  },
  {
    id: "mod_seed_7",
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    actorName: "Administrateur",
    actorRole: "admin",
    actionType: "role_updated",
    targetTitle: "Ibrahima Sagna (Teranga Motors)",
    details: "Promotion du compte utilisateur vers le rôle Vendeur vérifié",
    previousValue: "Client",
    newValue: "Vendeur",
  },
  {
    id: "mod_seed_8",
    timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    actorName: "Administrateur",
    actorRole: "admin",
    actionType: "listing_rejected",
    targetTitle: "iPhone 15 Pro Max 256Go Neuf",
    details: "Refus de l'annonce — Motif : Photos manquantes ou prix suspect",
    previousValue: "Brouillon",
    newValue: "Archivé",
  },
  {
    id: "mod_seed_9",
    timestamp: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    actorName: "Ousmane Ba",
    actorRole: "seller",
    actionType: "status_changed",
    targetTitle: "Appartement F3 meublé Ngor Almadies",
    details: "Mise à jour de disponibilité suite à une location longue durée",
    previousValue: "Publiée",
    newValue: "Loué",
  },
  {
    id: "mod_seed_10",
    timestamp: new Date(Date.now() - 31 * 3600 * 1000).toISOString(),
    actorName: "Khadija Sy",
    actorRole: "seller",
    actionType: "listing_created",
    targetTitle: "Villa pieds dans l'eau Saly Portudal avec piscine",
    details: "Publication d'une nouvelle annonce (Immobilier • Mbour / Saly) à 1 200 000 FCFA",
    newValue: "Publiée",
  },
  {
    id: "mod_seed_11",
    timestamp: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    actorName: "Administrateur",
    actorRole: "admin",
    actionType: "category_updated",
    targetTitle: "Catégorie Matériel Professionnel",
    details: "Mise à jour du nom et du slug de la catégorie",
    previousValue: "materiel",
    newValue: "materiel-pro",
  },
  {
    id: "mod_seed_12",
    timestamp: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
    actorName: "Mamadou Gueye",
    actorRole: "seller",
    actionType: "listing_updated",
    targetTitle: "Hyundai Tucson 2021 Full Options — Dakar",
    details: "Modification du kilométrage et ajout du carnet d'entretien",
    previousValue: "14 200 000 FCFA",
    newValue: "13 800 000 FCFA",
  },
  {
    id: "mod_seed_13",
    timestamp: new Date(Date.now() - 64 * 3600 * 1000).toISOString(),
    actorName: "Administrateur",
    actorRole: "admin",
    actionType: "listing_deleted",
    targetTitle: "Annonce en doublon — Terrain Mbour",
    details: "Suppression définitive suite à un signalement vérifié",
    previousValue: "Publiée",
    newValue: "Supprimée",
  },
];

app.get("/api/admin/modifications", (_req, res) => {
  res.json({ items: serverModificationsLog });
});

app.post("/api/admin/modifications", (req, res) => {
  try {
    const body = req.body || {};
    if (!body.targetTitle || !body.actionType) {
      return res.status(400).json({ error: "INVALID_MODIFICATION_LOG" });
    }
    const entry: ServerModificationLog = {
      id: String(body.id || `mod_${Date.now()}`),
      timestamp: String(body.timestamp || new Date().toISOString()),
      actorName: String(body.actorName || "Utilisateur").slice(0, 120),
      actorRole: String(body.actorRole || "seller").slice(0, 40),
      actionType: String(body.actionType).slice(0, 60),
      targetTitle: String(body.targetTitle).slice(0, 200),
      targetId: body.targetId ? String(body.targetId).slice(0, 80) : undefined,
      details: String(body.details || "").slice(0, 500),
      previousValue: body.previousValue
        ? String(body.previousValue).slice(0, 120)
        : undefined,
      newValue: body.newValue
        ? String(body.newValue).slice(0, 120)
        : undefined,
    };
    serverModificationsLog.unshift(entry);
    if (serverModificationsLog.length > 500) {
      serverModificationsLog.length = 500;
    }
    return res.status(201).json({ ok: true, item: entry });
  } catch {
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// Liste des domaines emails temporaires / jetables
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "yopmail.com", "yopmail.fr", "yopmail.net", "cool.fr.nf", "jetable.fr.nf",
  "mailinator.com", "mailinator.net", "mailinator2.com", "suremail.info",
  "tempmail.com", "temp-mail.org", "temp-mail.io", "tempmail.net",
  "10minutemail.com", "10minutemail.net", "10minutemail.org", "minutemail.com",
  "guerrillamail.com", "guerrillamail.info", "guerrillamail.biz", "guerrillamail.de", "guerrillamail.net", "guerrillamailblock.com",
  "trashmail.com", "trashmail.net", "trashmail.org", "trashmail.ws",
  "sharklasers.com", "dispostable.com", "getairmail.com", "throwawaymail.com",
  "fake.com", "test.com", "example.com", "fakemailgenerator.com", "crazymailing.com",
  "nada.ltd", "mohmal.com", "generator.email", "dropmail.me", "inboxkitten.com",
  "mytemp.email", "tempail.com", "tempr.email", "discard.email", "discardmail.com",
  "spam4.me", "fakemail.net", "getnada.com", "emailondeck.com", "burnermail.io",
]);

// Détection des fautes de frappe courantes sur les fournisseurs majeurs
const COMMON_TYPO_DOMAINS: Record<string, string> = {
  "gmaiil.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmaill.com": "hotmail.com",
  "hotamil.com": "hotmail.com",
  "yaaho.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "icloude.com": "icloud.com",
  "icoud.com": "icloud.com",
};

const HOSTNAME_REGEX = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

// Endpoint de validation de l'existence réelle d'un email (format, domaines jetables, DNS MX)
app.post("/api/auth/validate-email", async (req, res) => {
  try {
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        valid: false,
        error: "RATE_LIMIT_EXCEEDED",
        message: "Trop de tentatives de vérification. Veuillez patienter une minute.",
      });
    }

    const { email } = req.body || {};
    if (!email || typeof email !== "string" || email.length > 254) {
      return res.status(400).json({
        valid: false,
        error: "EMAIL_REQUIRED",
        message: "L'adresse email est requise et ne doit pas dépasser 254 caractères.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const parts = cleanEmail.split("@");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return res.status(400).json({
        valid: false,
        error: "INVALID_FORMAT",
        message: "Format d'adresse email invalide (ex: utilisateur@domaine.com).",
      });
    }

    const [user, domain] = parts;

    // Nom d'utilisateur trop court ou caractère invalide
    if (user.length < 2 || user.length > 64) {
      return res.status(400).json({
        valid: false,
        error: "INVALID_LOCAL_PART",
        message: "L'identifiant avant le @ doit contenir au moins 2 caractères.",
      });
    }

    // Validation stricte du nom de domaine avant toute résolution DNS
    if (!HOSTNAME_REGEX.test(domain)) {
      return res.status(400).json({
        valid: false,
        error: "INVALID_DOMAIN",
        message: "Le nom de domaine de l'adresse email est invalide.",
      });
    }

    // Blocage des domaines temporaires / jetables
    if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      return res.status(400).json({
        valid: false,
        error: "DISPOSABLE_EMAIL",
        message: "Les adresses emails temporaires ou jetables ne sont pas autorisées.",
      });
    }

    // Suggestion de correction de faute de frappe
    if (COMMON_TYPO_DOMAINS[domain]) {
      return res.status(400).json({
        valid: false,
        error: "DOMAIN_TYPO",
        message: `Adresse invalide. Vouliez-vous dire @${COMMON_TYPO_DOMAINS[domain]} ?`,
      });
    }

    // Vérification DNS en temps réel des enregistrements MX du domaine
    try {
      const mxLookupPromise = dns.resolveMx(domain);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("DNS_TIMEOUT")), 3000)
      );

      const mxRecords = await Promise.race([mxLookupPromise, timeoutPromise]);

      if (!mxRecords || mxRecords.length === 0) {
        // Tentative de secours sur l'enregistrement A (RFC 5321 fallback)
        const aRecords = await dns.resolve4(domain).catch(() => []);
        if (!aRecords || aRecords.length === 0) {
          return res.status(400).json({
            valid: false,
            error: "NO_MX_RECORDS",
            message: `Le domaine @${domain} n'est pas configuré pour recevoir des emails.`,
          });
        }
      }
    } catch (dnsErr: any) {
      const code = dnsErr?.code;
      if (code === "ENOTFOUND" || code === "ENODATA" || code === "ESERVFAIL") {
        return res.status(400).json({
          valid: false,
          error: "DOMAIN_NOT_FOUND",
          message: `Le domaine @${domain} n'existe pas ou ne peut pas recevoir d'emails.`,
        });
      }
      // En cas de timeout DNS ou problème réseau imprévu, on trace sans bloquer systématiquement
      console.warn("Avertissement résolution DNS pour le domaine:", domain, dnsErr?.message || dnsErr);
    }

    return res.json({ valid: true });
  } catch (err: any) {
    console.error("Erreur serveur lors de la validation email:", err);
    return res.status(500).json({
      valid: false,
      error: "SERVER_ERROR",
      message: "Erreur serveur lors de la vérification de l'adresse email.",
    });
  }
});

// Start Express + Vite Middleware setup
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Kawral démarré sur http://localhost:${PORT}`);
  });
}

startServer();
