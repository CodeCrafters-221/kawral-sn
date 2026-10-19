import { THRESHOLDS } from '../utils/thresholds.js';
import { runMarketplaceWorkflow } from '../workflows/marketplace.js';
import { runLegalPagesWorkflow } from '../workflows/legal-pages.js';
import { thinkTime } from '../utils/helpers.js';

export const options = {
  stages: [
    { duration: '30s', target: 15 },  // Montée en charge progressive
    { duration: '1m', target: 35 },   // Charge nominale moyenne
    { duration: '1m', target: 50 },   // Pic de charge nominale (50 utilisateurs concurrents)
    { duration: '30s', target: 0 },   // Descente progressive
  ],
  thresholds: THRESHOLDS.load,
};

export default function () {
  runMarketplaceWorkflow();
  thinkTime(1, 2);
  runLegalPagesWorkflow();
  thinkTime(1, 2);
}
