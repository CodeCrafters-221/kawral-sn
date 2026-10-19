import http from 'k6/http';
import { group, check } from 'k6';
import { ENV } from '../config/env.js';
import { validateResponse } from '../utils/helpers.js';

/**
 * Workflow de vérification de robustesse des pages légales et ressources PWA
 */
export function runLegalPagesWorkflow() {
  group('Pages Légales & Assets PWA', () => {
    // 1. Page de confidentialité (vérification conformité Google sous charge)
    const privacyRes = http.get(`${ENV.frontendUrl}/privacy`, {
      headers: ENV.browserHeaders,
      tags: { name: 'Frontend_PrivacyPolicy' },
    });
    validateResponse(privacyRes, 'Politique de Confidentialité');
    check(privacyRes, {
      'Privacy: contient le texte légal': (r) => r.body && r.body.includes('Politique de Confidentialité'),
      'Privacy: taille suffisante (> 5 Ko)': (r) => r.body && r.body.length > 5000,
    });

    // 2. Conditions Générales d'Utilisation
    const termsRes = http.get(`${ENV.frontendUrl}/terms`, {
      headers: ENV.browserHeaders,
      tags: { name: 'Frontend_Terms' },
    });
    validateResponse(termsRes, 'Conditions Générales');

    // 3. Manifest PWA
    const manifestRes = http.get(`${ENV.frontendUrl}/manifest.json`, {
      headers: { 'Accept': 'application/json' },
      tags: { name: 'Frontend_PwaManifest' },
    });
    validateResponse(manifestRes, 'Manifest PWA');
  });
}
