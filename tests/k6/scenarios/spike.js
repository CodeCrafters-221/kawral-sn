import { THRESHOLDS } from '../utils/thresholds.js';
import { runMarketplaceWorkflow } from '../workflows/marketplace.js';
import { runLegalPagesWorkflow } from '../workflows/legal-pages.js';
import { thinkTime } from '../utils/helpers.js';

export const options = {
  stages: [
    { duration: '10s', target: 5 },    // Trafic initial bas
    { duration: '10s', target: 100 },  // Pic brutal instantané à 100 VUs
    { duration: '30s', target: 100 },  // Maintien du pic
    { duration: '10s', target: 0 },    // Fin du pic
  ],
  thresholds: THRESHOLDS.spike,
};

export default function () {
  runMarketplaceWorkflow();
  thinkTime(0.5, 1);
  runLegalPagesWorkflow();
  thinkTime(0.5, 1);
}
