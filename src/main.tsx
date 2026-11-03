import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './pwaRegister';

// iOS exposes `navigator.standalone` for Home Screen web apps. Set this before
// React renders so the fixed header can reserve the status-bar safe area on its
// first frame. The media query remains a fallback for iOS versions that expose
// standalone mode through display-mode instead.
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isIOSStandalone =
  isIOS &&
  ((navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches);

if (isIOSStandalone) {
  document.documentElement.classList.add('ios-standalone');
}

// Initialize PWA service worker
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

