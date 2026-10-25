import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { Calendar, MapPin, Phone, Mail, CheckCircle2, XCircle, Map, List, User } from 'lucide-react';
import { Button, Badge, Card, CardContent, Pagination } from '../../../components/ui';
import { AppointmentLocationMap } from '../../../components/appointments/AppointmentLocationMap';
import { AppointmentMapModal } from '../../../components/appointments/AppointmentMapModal';
import { AppointmentsInteractiveMap } from '../../../components/appointments/AppointmentsInteractiveMap';
import { Appointment } from '../../../types';
import { resolveAppointmentLocation } from '../../../utils/geoCoordinates';

const STATUS_LABELS: Record<string, { label: string; variant: 'accent' | 'success' | 'default' | 'destructive' | 'warning' }> = {
  pending:   { label: 'En attente',  variant: 'accent' },
  confirmed: { label: 'Confirmé',    variant: 'success' },
  cancelled: { label: 'Annulé',      variant: 'destructive' },
  completed: { label: 'Effectué',    variant: 'warning' },
};

export const AppointmentsPage: React.FC = () => {
  const { appointments, listings, updateAppointmentStatus, addToast, currentUser } = useApp();
  const { session, loading } = useAuth();

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [modalAppointment, setModalAppointment] = useState<Appointment | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Guard : l'utilisateur doit être connecté
  if (loading) return null;
  if (!session || !currentUser) return <Navigate to="/auth/login" replace />;

  // Filtrer : l'utilisateur ne voit que les RDV auxquels il participe
  const myAppointments = appointments.filter(
    (apt) =>
      apt.clientId === currentUser.id ||
      apt.sellerId === currentUser.id,
  );

  const pagedAppointments = myAppointments.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  // Seul le vendeur HOST du RDV peut confirmer ou annuler
  const canManageAppointment = (aptSellerId: string) =>
    (currentUser.role === 'seller' || currentUser.role === 'admin') &&
    (aptSellerId === currentUser.id || currentUser.role === 'admin');

  const selectedMatchedListing = modalAppointment
    ? listings.find((l) => l.id === modalAppointment.listingId)
    : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 pb-20 space-y-6">
      {/* En-tête avec bascule Liste / Carte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-kawral-dark">Vos rendez-vous de visite</h1>
          <p className="text-xs text-kawral-muted">
            Consultez la localisation exacte sur la carte et suivez l'état de vos rendez-vous au Sénégal.
          </p>
        </div>

        {myAppointments.length > 0 && (
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-kawral-border self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-kawral-dark shadow-xs'
                  : 'text-slate-500 hover:text-kawral-dark'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Liste</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-kawral-green text-white shadow-xs'
                  : 'text-slate-500 hover:text-kawral-dark'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-kawral-orange" />
              <span>Carte interactive ({myAppointments.length})</span>
            </button>
          </div>
        )}
      </div>

      {myAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-xs text-kawral-muted space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-kawral-dark">
              {currentUser.role === 'client'
                ? "Vous n'avez pas encore demandé de rendez-vous de visite."
                : 'Aucun rendez-vous de visite programmé pour le moment.'}
            </p>
            <p className="text-[11px] text-slate-400">
              Lorsqu'un rendez-vous est réservé, sa localisation exacte s'affichera directement sur la carte.
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'map' ? (
        /* Vue Carte Interactive globale */
        <div className="space-y-3 animate-fade-in">
          <AppointmentsInteractiveMap
            appointments={myAppointments}
            listings={listings}
            onSelectAppointment={(apt) => setModalAppointment(apt)}
          />
        </div>
      ) : (
        /* Vue Liste détaillée avec mini-cartes intégrées + Pagination */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pagedAppointments.map((apt) => {
              const matchedListing = listings.find((l) => l.id === apt.listingId);
              const geo = resolveAppointmentLocation(apt.listingLocation, matchedListing?.location);
              const image = apt.listingImage || matchedListing?.images?.[0] || '';

              return (
                <Card key={apt.id} className="hover:shadow-md transition-all space-y-0 overflow-hidden flex flex-col justify-between">
                  <CardContent className="p-5 sm:p-6 space-y-4">
                    {/* Top Bar : Date / Statut */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-kawral-green">
                        <Calendar className="w-4 h-4 text-kawral-orange" />
                        <span>{apt.date} à {apt.time}</span>
                      </div>
                      {(() => {
                        const s = STATUS_LABELS[apt.status] ?? { label: apt.status, variant: 'default' as const };
                        return (
                          <Badge variant={s.variant} size="sm">
                            {s.label}
                          </Badge>
                        );
                      })()}
                    </div>

                    {/* Infos Bien & Titre */}
                    <div className="flex items-start gap-3.5">
                      {image ? (
                        <img
                          src={image}
                          alt={apt.listingTitle}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-kawral-border/60 shadow-xs"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-kawral-ivory border border-kawral-border/60 shrink-0 flex items-center justify-center text-kawral-green">
                          <MapPin className="w-6 h-6 text-kawral-orange" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        {apt.listingId ? (
                          <Link
                            to={`/listings/${apt.listingId}`}
                            title={apt.listingTitle}
                            className="font-extrabold text-base text-kawral-dark hover:text-kawral-green transition-colors line-clamp-2 break-words"
                          >
                            {apt.listingTitle}
                          </Link>
                        ) : (
                          <h3
                            title={apt.listingTitle}
                            className="font-extrabold text-base text-kawral-dark line-clamp-2 break-words"
                          >
                            {apt.listingTitle}
                          </h3>
                        )}

                        {/* Badge Localisation exacte */}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-kawral-orange mt-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{geo.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Carte interactive pour ce rendez-vous */}
                    <div className="pt-1">
                      <AppointmentLocationMap
                        locationStr={apt.listingLocation}
                        listingLocation={matchedListing?.location}
                        title={apt.listingTitle}
                        height="h-44"
                        onExpand={() => setModalAppointment(apt)}
                      />
                    </div>

                    {/* Coordonnées & Message */}
                    <div className="space-y-2 text-xs bg-kawral-ivory p-3.5 rounded-2xl border border-kawral-border">
                      {/* Label rôle du contact */}
                      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/60">
                        <User className="w-3.5 h-3.5 text-kawral-green shrink-0" />
                        <span className="font-extrabold text-kawral-dark">
                          {currentUser.id === apt.sellerId ? "Client" : "Hôte"}
                        </span>
                        <span className="text-kawral-muted">—</span>
                        <span className="font-bold text-kawral-dark truncate">
                          {currentUser.id === apt.sellerId ? apt.clientName : apt.sellerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-kawral-muted">
                        <Phone className="w-3.5 h-3.5 text-kawral-green shrink-0" />
                        <span>
                          {currentUser.id === apt.sellerId
                            ? apt.clientPhone || "—"
                            : apt.sellerPhone || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-kawral-muted">
                        <Mail className="w-3.5 h-3.5 text-kawral-green shrink-0" />
                        <span className="truncate">
                          {currentUser.id === apt.sellerId
                            ? apt.clientEmail || "—"
                            : apt.sellerEmail || "—"}
                        </span>
                      </div>
                      {apt.message && (
                        <p className="pt-2 border-t border-slate-200/60 font-medium italic text-kawral-dark">
                          "{apt.message}"
                        </p>
                      )}
                    </div>

                    {/* Actions de gestion pour l'hôte */}
                    {canManageAppointment(apt.sellerId) && apt.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            updateAppointmentStatus(apt.id, 'confirmed');
                            addToast('Rendez-vous confirmé.', 'success');
                          }}
                          leftIcon={<CheckCircle2 className="w-4 h-4 text-kawral-orange" />}
                        >
                          Confirmer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateAppointmentStatus(apt.id, 'cancelled');
                            addToast('Rendez-vous refusé.', 'info');
                          }}
                          leftIcon={<XCircle className="w-4 h-4 text-rose-500" />}
                        >
                          Refuser
                        </Button>
                      </div>
                    )}

                    {/* Action pour le client : possibilité d'annuler sa propre demande en attente */}
                    {!canManageAppointment(apt.sellerId) && apt.clientId === currentUser.id && apt.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateAppointmentStatus(apt.id, 'cancelled');
                            addToast('Votre demande de rendez-vous a été annulée.', 'info');
                          }}
                          leftIcon={<XCircle className="w-4 h-4 text-rose-500" />}
                        >
                          Annuler ma demande
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalItems={myAppointments.length}
            pageSize={pageSize}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[6, 12, 24]}
            itemLabel="rendez-vous"
            className="rounded-2xl border border-kawral-border shadow-xs"
          />
        </div>
      )}

      {/* Modale d'agrandissement de la carte pour un rendez-vous */}
      <AppointmentMapModal
        appointment={modalAppointment}
        matchedListing={selectedMatchedListing}
        isOpen={Boolean(modalAppointment)}
        onClose={() => setModalAppointment(null)}
      />
    </div>
  );
};
