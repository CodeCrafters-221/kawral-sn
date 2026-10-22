import express from "express";
import "dotenv/config";
import path from "path";
import dns from "node:dns/promises";
import { createServer as createViteServer } from "vite";

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
