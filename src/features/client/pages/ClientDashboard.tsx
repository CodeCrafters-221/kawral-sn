import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { ListingGrid } from '../../../components/marketplace/ListingGrid';
import { Heart, Calendar, MessageSquare, User, ShieldCheck, Phone, Mail, Camera, ImagePlus, Search, Loader2, MapPin, Navigation, Map } from 'lucide-react';
import { Avatar, Button, Badge, Card, CardContent, CardHeader, CardTitle, Tabs, SafeImage, type TabItem } from '../../../components/ui';
import { uploadAvatar } from '../../../services/supabase/storageService';
import { profileService } from '../../../services/supabase/profileService';

export const ClientDashboard: React.FC = () => {
  const { currentUser, setCurrentUser, favorites, listings, appointments, conversations, setCurrentView, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'favorites' | 'appointments' | 'profile'>('favorites');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const favoriteListings = listings.filter((item) => favorites.includes(item.id));

  // Filtrer les données par utilisateur courant (pas de fuite de données globales)
  const myAppointments = appointments.filter((apt) => apt.clientId === currentUser?.id);
  const myConversations = conversations.filter((conv) => conv.buyerId === currentUser?.id);

  const openProfileSettings = () => {
    document.dispatchEvent(new CustomEvent('open-profile-settings'));
  };

  const handleDirectBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image trop volumineuse (max 10 Mo)', 'error');
      return;
    }

    setUploadingBanner(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      // Instant optimistic UI update
      setCurrentUser({ ...currentUser, banner: dataUrl });

      try {
        const remoteUrl = await uploadAvatar(currentUser.id, file);
        const finalUrl = remoteUrl || dataUrl;
        setCurrentUser({ ...currentUser, banner: finalUrl });
        await profileService.saveProfile(currentUser.id, { bannerUrl: finalUrl });
        addToast('Bannière mise à jour avec succès !', 'success');
      } catch (err) {
        console.warn('Banner upload exception:', err);
        addToast('Bannière mise à jour localement !', 'info');
      } finally {
        setUploadingBanner(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

  const tabItems: TabItem[] = [
    { id: 'favorites', label: 'Mes Favoris', count: favorites.length, icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'appointments', label: 'Mes Rendez-vous', count: myAppointments.length, icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'profile', label: 'Mon Profil', icon: <User className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 pb-20 space-y-8">

      {/* Client Header — avec bannière et avatar visible */}
      <Card className="overflow-hidden shadow-xs">
        {/* Banner zone */}
        <div className="h-32 sm:h-40 relative bg-slate-200 group">
          <div className="absolute inset-0 overflow-hidden rounded-t-3xl">
            <SafeImage
              src={currentUser?.banner}
              fallback={DEFAULT_BANNER}
              alt="Bannière client"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleDirectBannerUpload}
          />

          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full backdrop-blur-sm opacity-90 group-hover:opacity-100 transition-all z-10 cursor-pointer shadow-md disabled:opacity-50"
          >
            {uploadingBanner ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImagePlus className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {uploadingBanner ? 'Téléchargement...' : 'Changer la bannière'}
            </span>
          </button>

          {/* Avatar flottant */}
          <div className="absolute left-4 sm:left-6 -bottom-10 z-20">
            <div
              className="relative group/av cursor-pointer"
              onClick={openProfileSettings}
              title="Modifier la photo de profil"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-white/90 shadow-xl overflow-hidden bg-slate-900/10 flex items-center justify-center">
                <Avatar
                  src={currentUser?.avatar}
                  name={currentUser?.name || 'Acheteur'}
                  size="xl"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/av:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Info zone */}
        <div className="pt-14 sm:pt-16 px-4 sm:px-6 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-kawral-dark">
                {currentUser?.name || 'Acheteur'} 👋
              </h1>
              <Badge variant="primary" size="sm">
                Client / Acheteur
              </Badge>
            </div>
            <p className="text-xs text-kawral-muted mt-1 font-medium">
              {currentUser?.email} {currentUser?.phone && `• ${currentUser.phone}`}
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={openProfileSettings}
              leftIcon={<Camera className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">Modifier le profil</span>
              <span className="sm:hidden">Profil</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentView('search')}
              leftIcon={<Search className="w-3.5 h-3.5" />}
            >
              <span className="hidden sm:inline">Rechercher un bien</span>
              <span className="sm:hidden">Explorer</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Metrics Row using Card component */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-kawral-muted">Biens favoris</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-kawral-green mt-1">{favorites.length}</p>
            </div>
            <div className="p-3.5 bg-rose-50 text-rose-500 rounded-2xl">
              <Heart className="w-6 h-6 fill-current" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-kawral-muted">Rendez-vous demandés</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-kawral-orange mt-1">{myAppointments.length}</p>
            </div>
            <div className="p-3.5 bg-orange-50 text-kawral-orange rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => setCurrentView('messaging')}
          className="hover:shadow-sm transition-all cursor-pointer hover:border-kawral-green"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-kawral-muted">Conversations actives</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-kawral-green mt-1">{myConversations.length}</p>
            </div>
            <div className="p-3.5 bg-kawral-green/10 text-kawral-green rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Tabs */}
      <Tabs
        items={tabItems}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as 'favorites' | 'appointments' | 'profile')}
        variant="pills"
      />

      {/* Tab Content */}
      {activeTab === 'favorites' && (
        <ListingGrid listings={favoriteListings} title="Vos coups de cœur sauvegardés" />
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-kawral-dark">Vos demandes de visites</h3>
            {myAppointments.length > 0 && (
              <Link
                to="/dashboard/client/appointments"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-kawral-green hover:text-kawral-darkgreen transition-colors"
              >
                <Map className="w-3.5 h-3.5 text-kawral-orange" />
                <span>Voir sur la carte interactive</span>
              </Link>
            )}
          </div>
          {myAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-xs text-kawral-muted">
                Vous n'avez pas encore demandé de rendez-vous de visite.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAppointments.map((apt) => (
                <Card key={apt.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-kawral-green flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-kawral-orange" />
                        {apt.date} à {apt.time}
                      </span>
                      <Badge variant={apt.status === 'pending' ? 'accent' : 'success'} size="sm">
                        {apt.status === 'pending' ? 'En attente' : apt.status}
                      </Badge>
                    </div>
                    <h4 title={apt.listingTitle} className="font-bold text-sm text-kawral-dark line-clamp-2 break-words">{apt.listingTitle}</h4>
                    {apt.listingLocation && (
                      <div className="flex items-center gap-1 text-xs text-kawral-orange font-semibold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{apt.listingLocation}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-kawral-muted truncate">Contact : {apt.clientName}</span>
                      <Link
                        to="/dashboard/client/appointments"
                        className="text-kawral-green font-bold hover:underline shrink-0 flex items-center gap-1"
                      >
                        <Map className="w-3 h-3 text-kawral-orange" />
                        <span>Carte</span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3.5 bg-kawral-ivory rounded-2xl border border-kawral-border">
              <div className="p-2 bg-white rounded-xl text-kawral-green">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-kawral-muted font-bold uppercase">Nom complet</p>
                <p className="text-xs font-bold text-kawral-dark">{currentUser?.name || 'Non renseigné'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-kawral-ivory rounded-2xl border border-kawral-border">
              <div className="p-2 bg-white rounded-xl text-kawral-green">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-kawral-muted font-bold uppercase">Adresse Email</p>
                <p className="text-xs font-bold text-kawral-dark">{currentUser?.email || 'Non renseigné'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-kawral-ivory rounded-2xl border border-kawral-border">
              <div className="p-2 bg-white rounded-xl text-kawral-green">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-kawral-muted font-bold uppercase">Téléphone</p>
                <p className="text-xs font-bold text-kawral-dark">{currentUser?.phone || 'Non renseigné'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};
