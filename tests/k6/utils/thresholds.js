/**
 * k6 Performance Thresholds (SLO / SLA)
 * Définition des critères d'acceptation de charge et de scalabilité.
 */

export const THRESHOLDS = {
  // Profil Smoke Test : 0 erreur, latence très basse
  smoke: {
    http_req_failed: ['rate<0.01'],        // Moins de 1% d'erreurs
    http_req_duration: ['p(95)<800'],      // 95% des requêtes sous 800ms
  },

  // Profil Load Test : Charge nominale réaliste (jusqu'à 50 VUs)
  load: {
    http_req_failed: ['rate<0.02'],        // Moins de 2% d'erreurs
    http_req_duration: ['p(95)<1200', 'p(99)<2000'], // 95% < 1.2s, 99% < 2s
  },

  // Profil Stress Test : Recherche de la limite de scalabilité (100 - 200 VUs)
  stress: {
    http_req_failed: ['rate<0.05'],        // Moins de 5% d'erreurs tolérées au pic
    http_req_duration: ['p(95)<3000'],     // Tolérance 3s sous stress maximal
  },

  // Profil Spike Test : Résilience face à un pic brutal
  spike: {
    http_req_failed: ['rate<0.08'],        // Moins de 8% d'erreurs lors du pic immédiat
    http_req_duration: ['p(90)<2500'],
  },
};
