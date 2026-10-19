import React from 'react';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNavigation } from './components/layout/MobileNavigation';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/ui/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { RequirePhoneModal } from './components/modals/RequirePhoneModal';
import { PwaInstallBanner } from './components/pwa/PwaInstallBanner';
import { BecomeSellerModal } from './components/modals/BecomeSellerModal';
import { AppRoutes } from './routes';

const AppContent: React.FC = () => {
  const {
    onboardingModalOpen,
    setOnboardingModalOpen,
    becomeSellerModalOpen,
    setBecomeSellerModalOpen,
    currentView,
  } = useApp();
  const location = useLocation();

  const isHomePage = currentView === 'home' && location.pathname === '/';
  const isListingDetailPage =
    currentView === 'listing-detail' ||
    location.pathname.startsWith('/listings/') ||
    location.pathname.startsWith('/annonce/') ||
    location.pathname.startsWith('/annonces/');

  return (
    <div className="min-h-screen flex flex-col bg-kawral-ivory text-kawral-dark font-sans antialiased selection:bg-kawral-orange selection:text-white">
      
      {/* Main App Navbar (masqué sur la carte détail de l'annonce sur tous les appareils) */}
      {!isListingDetailPage && <Navbar />}

      <main className={`flex-1 animate-fade-in ${!isHomePage && !isListingDetailPage ? 'pt-[164px] sm:pt-[120px]' : ''}`}>
        <AppRoutes />
      </main>

      {/* Footer (masqué sur mobile via hidden sm:block) */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavigation />

      {/* Modals, PWA Install Banner & Toast Feedback */}
      <AuthModal />
      <RequirePhoneModal />
      <OnboardingModal isOpen={onboardingModalOpen} onClose={() => setOnboardingModalOpen(false)} />
      <BecomeSellerModal isOpen={becomeSellerModalOpen} onClose={() => setBecomeSellerModalOpen(false)} />
      <PwaInstallBanner />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
