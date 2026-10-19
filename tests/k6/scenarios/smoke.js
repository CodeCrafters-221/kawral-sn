import { THRESHOLDS } from '../utils/thresholds.js';
import { runMarketplaceWorkflow } from '../workflows/marketplace.js';
import { runLegalPagesWorkflow } from '../workflows/legal-pages.js';
import { thinkTime } from '../utils/helpers.js';

export const options = {
  vus: 3,
  duration: '30s',
  thresholds: THRESHOLDS.smoke,
};

export default function () {
  runMarketplaceWorkflow();
  thinkTime(1, 2);
  runLegalPagesWorkflow();
  thinkTime(1, 2);
}
