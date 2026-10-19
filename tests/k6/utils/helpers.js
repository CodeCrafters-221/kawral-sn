import { sleep, check } from 'k6';

/**
 * Pause réaliste de l'utilisateur (think time)
 * @param {number} min - Durée min en secondes
 * @param {number} max - Durée max en secondes
 */
export function thinkTime(min = 1, max = 3) {
  const duration = Math.random() * (max - min) + min;
  sleep(duration);
}

/**
 * Sélection aléatoire dans un tableau
 */
export function randomItem(array) {
  if (!array || array.length === 0) return null;
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Vérification standard d'une réponse HTTP
 * @param {object} res - Objet de réponse k6 http
 * @param {string} name - Nom logique de l'action
 * @param {number} expectedStatus - Statut HTTP attendu (défaut: 200)
 */
export function validateResponse(res, name, expectedStatus = 200) {
  return check(res, {
    [`${name}: status est ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${name}: temps de réponse < 2000ms`]: (r) => r.timings.duration < 2000,
  });
}
