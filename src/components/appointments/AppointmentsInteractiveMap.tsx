import React, { useState } from "react";
import { Appointment, Listing } from "../../types";
import { resolveAppointmentLocation } from "../../utils/geoCoordinates";
import { MapPin, Calendar, Clock, Navigation, ExternalLink, ArrowRight, Eye } from "lucide-react";
import { Badge, Button } from "../ui";
import { useNavigate } from "react-router-dom";

interface AppointmentsInteractiveMapProps {
	appointments: Appointment[];
	listings: Listing[];
	onSelectAppointment?: (apt: Appointment) => void;
}

export const AppointmentsInteractiveMap: React.FC<AppointmentsInteractiveMapProps> = ({
	appointments,
	listings,
	onSelectAppointment,
}) => {
	const navigate = useNavigate();
	const [activeApt, setActiveApt] = useState<Appointment | null>(appointments[0] || null);

	if (appointments.length === 0) {
		return (
			<div className="p-8 text-center text-xs text-kawral-muted bg-white rounded-3xl border border-kawral-border">
				Aucun rendez-vous à afficher sur la carte.
			</div>
		);
	}

	const matchedListing = activeApt
		? listings.find((l) => l.id === activeApt.listingId)
		: undefined;

	const activeGeo = activeApt
		? resolveAppointmentLocation(activeApt.listingLocation, matchedListing?.location)
		: null;

	return (
		<div className="relative w-full rounded-3xl overflow-hidden border border-kawral-border bg-slate-900 shadow-xl flex flex-col md:flex-row h-[600px]">
			{/* Volet latéral de sélection des rendez-vous */}
			<div className="w-full md:w-80 lg:w-96 bg-white border-r border-kawral-border flex flex-col h-full z-10">
				<div className="p-4 border-b border-slate-100 flex items-center justify-between bg-kawral-ivory/50">
					<div className="flex items-center gap-2">
						<span className="p-1.5 rounded-lg bg-kawral-green text-white">
							<MapPin className="w-4 h-4" />
						</span>
						<div>
							<h3 className="font-extrabold text-sm text-kawral-dark">Lieux des visites</h3>
							<p className="text-[11px] text-kawral-muted">
								{appointments.length} rendez-vous programmé{appointments.length > 1 ? "s" : ""}
							</p>
						</div>
					</div>
					<Badge variant="verified" size="sm">
						{appointments.length}
					</Badge>
				</div>

				<div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
					{appointments.map((apt) => {
						const isSelected = activeApt?.id === apt.id;
						const aptListing = listings.find((l) => l.id === apt.listingId);
						const img = apt.listingImage || aptListing?.images?.[0] || "";
						const geo = resolveAppointmentLocation(apt.listingLocation, aptListing?.location);

						return (
							<div
								key={apt.id}
								onClick={() => {
									setActiveApt(apt);
									onSelectAppointment?.(apt);
								}}
								className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
									isSelected
										? "bg-kawral-green text-white shadow-md scale-[1.01]"
										: "hover:bg-slate-50 text-kawral-dark"
								}`}
							>
								{img ? (
									<img
										src={img}
										alt={apt.listingTitle}
										className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/20"
									/>
								) : (
									<div className={`w-14 h-14 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${
										isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
									}`}>
										RDV
									</div>
								)}

								<div className="flex-1 min-w-0">
									<h4
										title={apt.listingTitle}
										className={`font-bold text-xs line-clamp-2 break-words ${isSelected ? "text-white" : "text-kawral-dark"}`}
									>
										{apt.listingTitle}
									</h4>
									<div className={`flex items-center gap-1.5 text-[11px] mt-1 ${
										isSelected ? "text-orange-200" : "text-kawral-orange"
									}`}>
										<MapPin className="w-3 h-3 shrink-0" />
										<span className="truncate font-semibold">{geo.label}</span>
									</div>
									<div className={`flex items-center gap-2 text-[10px] mt-0.5 ${
										isSelected ? "text-emerald-100" : "text-slate-400"
									}`}>
										<span>{apt.date}</span>
										<span>•</span>
										<span>{apt.time}</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Zone de carte interactive */}
			<div className="flex-1 relative h-full flex flex-col justify-between overflow-hidden bg-slate-100">
				{activeGeo ? (
					<iframe
						key={activeApt?.id}
						title={`Carte interactive pour ${activeApt?.listingTitle}`}
						src={`${activeGeo.embedUrl}&z=15`}
						className="w-full h-full border-0 select-none"
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-xs text-kawral-muted">
						Sélectionnez un rendez-vous pour afficher sa carte
					</div>
				)}

				{/* Carte Popup flottante du rendez-vous sélectionné */}
				{activeApt && activeGeo && (
					<div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-kawral-border z-20 flex flex-col gap-3 animate-slide-up">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0 flex-1">
								<span className="text-[10px] font-bold uppercase tracking-wider text-kawral-orange flex items-center gap-1">
									<MapPin className="w-3 h-3 shrink-0" />
									<span className="truncate">{activeGeo.fullAddress}</span>
								</span>
								<h3
									title={activeApt.listingTitle}
									className="font-extrabold text-sm text-kawral-dark line-clamp-2 break-words mt-0.5"
								>
									{activeApt.listingTitle}
								</h3>
							</div>
							<Badge
								variant={activeApt.status === "pending" ? "accent" : "success"}
								size="sm"
							>
								{activeApt.status === "pending" ? "Demande en attente" : activeApt.status}
							</Badge>
						</div>

						<div className="flex items-center justify-between text-xs text-kawral-muted bg-kawral-ivory p-2 rounded-xl border border-kawral-border/60">
							<div className="flex items-center gap-1.5 font-semibold text-kawral-dark">
								<Calendar className="w-3.5 h-3.5 text-kawral-green" />
								<span>{activeApt.date} à {activeApt.time}</span>
							</div>
							<span className="text-[11px]">
								Hôte : <strong>{activeApt.sellerName || "Propriétaire"}</strong>
							</span>
						</div>

						<div className="flex items-center gap-2 pt-1">
							<a
								href={activeGeo.directionsUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-kawral-green text-white rounded-xl text-xs font-bold hover:bg-kawral-darkgreen transition-all shadow-xs"
							>
								<Navigation className="w-3.5 h-3.5 text-kawral-orange" />
								<span>Itinéraire GPS</span>
								<ExternalLink className="w-3 h-3 opacity-70" />
							</a>

							{activeApt.listingId && (
								<button
									type="button"
									onClick={() => navigate(`/listings/${activeApt.listingId}`)}
									className="px-3 py-2 bg-slate-100 text-kawral-dark hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
								>
									<Eye className="w-3.5 h-3.5" />
									<span>Voir l'annonce</span>
								</button>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
