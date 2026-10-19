import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Badge } from "../ui";
import { AppointmentLocationMap } from "./AppointmentLocationMap";
import { Appointment, Listing } from "../../types";
import { MapPin, Calendar, Clock, Navigation, ExternalLink, User } from "lucide-react";
import { resolveAppointmentLocation } from "../../utils/geoCoordinates";

interface AppointmentMapModalProps {
	appointment: Appointment | null;
	matchedListing?: Listing;
	isOpen: boolean;
	onClose: () => void;
}

export const AppointmentMapModal: React.FC<AppointmentMapModalProps> = ({
	appointment,
	matchedListing,
	isOpen,
	onClose,
}) => {
	if (!appointment) return null;

	const geo = resolveAppointmentLocation(
		appointment.listingLocation,
		matchedListing?.location,
	);

	const image = appointment.listingImage || matchedListing?.images?.[0] || "";

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="w-[95vw] max-w-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
				<DialogHeader className="pb-3 border-b border-slate-100">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-2">
							<span className="p-2 bg-kawral-green/10 text-kawral-green rounded-xl">
								<MapPin className="w-5 h-5 text-kawral-orange" />
							</span>
							<div>
								<DialogTitle className="text-base sm:text-lg font-extrabold text-kawral-dark">
									Localisation du rendez-vous
								</DialogTitle>
								<p className="text-xs text-kawral-muted">
									{geo.fullAddress}
								</p>
							</div>
						</div>
						<Badge
							variant={appointment.status === "pending" ? "accent" : "success"}
							size="sm"
						>
							{appointment.status === "pending" ? "En attente" : appointment.status}
						</Badge>
					</div>
				</DialogHeader>

				{/* Résumé du bien & du rendez-vous */}
				<div className="flex items-center gap-3.5 p-3 rounded-2xl bg-kawral-ivory border border-kawral-border/70 my-2">
					{image && (
						<img
							src={image}
							alt={appointment.listingTitle}
							className="w-16 h-16 rounded-xl object-cover shrink-0 border border-kawral-border/60"
						/>
					)}
					<div className="min-w-0 flex-1">
						<h4
							title={appointment.listingTitle}
							className="font-extrabold text-sm text-kawral-dark line-clamp-2 break-words"
						>
							{appointment.listingTitle}
						</h4>
						<div className="flex flex-wrap items-center gap-3 text-xs text-kawral-muted mt-1">
							<span className="flex items-center gap-1 font-semibold text-kawral-green">
								<Calendar className="w-3.5 h-3.5 text-kawral-orange" />
								{appointment.date}
							</span>
							<span className="flex items-center gap-1 font-semibold text-kawral-dark">
								<Clock className="w-3.5 h-3.5 text-slate-400" />
								{appointment.time}
							</span>
							<span className="flex items-center gap-1">
								<User className="w-3.5 h-3.5 text-slate-400" />
								{appointment.clientName}
							</span>
						</div>
					</div>
				</div>

				{/* Carte interactive grand format */}
				<div className="my-2">
					<AppointmentLocationMap
						locationStr={appointment.listingLocation}
						listingLocation={matchedListing?.location}
						title={appointment.listingTitle}
						height="h-[340px]"
						showActions={false}
					/>
				</div>

				{/* Footer avec navigation directe */}
				<div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
					<div className="text-xs text-kawral-muted flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
						<span>Coordonnées GPS : {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}</span>
					</div>

					<div className="flex items-center gap-2 w-full sm:w-auto">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
						>
							Fermer
						</button>
						<a
							href={geo.directionsUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-kawral-green text-white rounded-xl text-xs font-bold hover:bg-kawral-darkgreen transition-all shadow-sm"
						>
							<Navigation className="w-3.5 h-3.5 text-kawral-orange" />
							<span>Lancer le GPS</span>
							<ExternalLink className="w-3 h-3 opacity-70" />
						</a>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
