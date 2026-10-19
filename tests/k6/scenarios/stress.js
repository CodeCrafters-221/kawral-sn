import { THRESHOLDS } from '../utils/thresholds.js';
import { runMarketplaceWorkflow } from '../workflows/marketplace.js';
import { runLegalPagesWorkflow } from '../workflows/legal-pages.js';
import { thinkTime } from '../utils/helpers.js';

export const options = {
  stages: [
    { duration: '30s', target: 30 },   // Montée initiale
    { duration: '1m', target: 80 },    // Poussée à 80 VUs
    { duration: '1m', target: 150 },   // Stress à 150 VUs
    { duration: '1m', target: 200 },   // Stress maximal à 200 VUs
    { duration: '30s', target: 0 },    // Récupération
  ],
  thresholds: THRESHOLDS.stress,
};

export default function () {
  runMarketplaceWorkflow();
  thinkTime(0.5, 1.5);
  runLegalPagesWorkflow();
  thinkTime(0.5, 1.5);
}
