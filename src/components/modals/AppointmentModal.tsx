import React, { useEffect, useState } from "react";
import { Listing } from "../../types";
import { useApp } from "../../context/AppContext";
import {
	Calendar as CalendarIcon,
	Clock,
	User as UserIcon,
	Phone as PhoneIcon,
	Mail as MailIcon,
	MapPin,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import {
	appointmentSchema,
	getZodErrors,
} from "../../lib/validation";
import {
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Badge,
	SafeImage,
} from "../ui";
import { availabilityService } from "../../services/supabase/availabilityService";
import { formatPriceFCFA } from "../../utils/formatters";
import { supabase } from "../../lib/supabase";

interface AppointmentModalProps {
	listing: Listing;
	isOpen: boolean;
	onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
	listing,
	isOpen,
	onClose,
}) => {
	const {
		currentUser,
		requestAppointment,
		setAuthModalOpen,
		setAuthModalMode,
		addToast,
	} = useApp();

	const today = new Date().toLocaleDateString("en-CA", {
		timeZone: "Africa/Dakar",
	});
	const [date, setDate] = useState(today);
	const [time, setTime] = useState("");
	const [availableSlots, setAvailableSlots] = useState<string[]>([]);
	const [loadingSlots, setLoadingSlots] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [clientName, setClientName] = useState(currentUser?.name || "");
	const [clientPhone, setClientPhone] = useState(currentUser?.phone || "");
	const [clientEmail, setClientEmail] = useState(currentUser?.email || "");
	const [message, setMessage] = useState("Souhaite visiter ce bien.");
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (currentUser) {
			if (!clientName) setClientName(currentUser.name || "");
			if (!clientPhone) setClientPhone(currentUser.phone || "");
			if (!clientEmail) setClientEmail(currentUser.email || "");
		}
	}, [currentUser]);

	useEffect(() => {
		if (!isOpen || !date) return;
		let cancelled = false;
		setLoadingSlots(true);
		availabilityService
			.getAvailableSlots(listing.id, date)
			.then((slots) => {
				if (cancelled) return;
				setAvailableSlots(slots);
				setTime((current) =>
					slots.includes(current) ? current : slots[0] || "",
				);
				setLoadingSlots(false);
			});
		return () => {
			cancelled = true;
		};
	}, [date, isOpen, listing.id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentUser) {
			setAuthModalMode("login");
			setAuthModalOpen(true);
			onClose();
			addToast(
				"Veuillez vous connecter pour demander un rendez-vous de visite.",
				"info",
			);
			return;
		}

		setErrors({});
		const v = getZodErrors(appointmentSchema, {
			clientName,
			clientPhone,
			clientEmail,
			date,
			time,
			message,
		});
		if (v.success === false) {
			setErrors(v.errors);
			return;
		}
		if (!time || loadingSlots || submitting) return;
		setSubmitting(true);
		const result = await requestAppointment({
			listing,
			date,
			time,
			clientName,
			clientPhone,
			clientEmail,
			message,
		});
		setSubmitting(false);
		if (result.success) {
			if (currentUser && (!currentUser.phone || currentUser.phone.trim() === '')) {
				void (supabase.from as any)('profiles').update({
					phone: clientPhone,
					updated_at: new Date().toISOString()
				}).eq('id', currentUser.id);
			}
			onClose();
		}
	};

	const mainImage = listing.images && listing.images.length > 0 ? listing.images[0] : "";

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="w-[calc(100vw-1.5rem)] max-w-xl gap-3 max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl p-4 sm:gap-4 sm:max-h-[88vh] sm:rounded-3xl sm:p-7">
				{/* En-tête de la modale */}
				<DialogHeader className="pb-3 sm:pb-4">
					<div className="flex items-center gap-2">
						<span className="p-1.5 bg-kawral-green/10 text-kawral-green rounded-xl">
							<CalendarIcon className="w-5 h-5 text-kawral-green" />
						</span>
						<DialogTitle className="text-lg sm:text-xl font-extrabold text-kawral-dark">
							Prendre un rendez-vous
						</DialogTitle>
					</div>
				</DialogHeader>

				{/* Carte résumé du bien */}
				<div className="flex items-center gap-3 p-2.5 sm:gap-3.5 sm:p-3 rounded-2xl bg-kawral-ivory border border-kawral-border/70">
					{mainImage ? (
						<div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-kawral-border/60">
							<SafeImage
								src={mainImage}
								alt={listing.title}
								className="w-full h-full object-cover"
							/>
						</div>
					) : null}
					<div className="min-w-0 flex-1">
						<h4
							title={listing.title}
							className="font-extrabold text-sm text-kawral-dark line-clamp-2 break-words [overflow-wrap:anywhere]"
						>
							{listing.title}
						</h4>
						<div className="flex items-center gap-2 text-xs text-kawral-muted mt-0.5">
							<span className="flex items-center gap-1 truncate">
								<MapPin className="w-3 h-3 text-kawral-orange shrink-0" />
								{listing.location.city || listing.location.neighborhood || "Sénégal"}
							</span>
							<span>•</span>
							<Badge variant="verified" size="sm">
								{listing.category === 'other' ? 'Prix unique' : (listing.transactionType === "rent" ? "Location" : "Vente")}
							</Badge>
						</div>
						<p className="text-xs font-black text-kawral-green mt-1">
							{formatPriceFCFA(listing.price)} {listing.pricePeriod === "month" ? "/mois" : ""}
						</p>
					</div>
				</div>

				{!currentUser && (
					<div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
						<ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
						<span>Vous devez être connecté à votre compte pour demander un rendez-vous.</span>
					</div>
				)}

				{/* Formulaire de réservation */}
				<form onSubmit={handleSubmit} className="space-y-3 pt-1 sm:space-y-4">
					{/* Choix de la Date */}
					<div className="space-y-1.5">
						<label className="flex items-center gap-1.5 text-xs font-bold text-kawral-green uppercase tracking-wider">
							<CalendarIcon className="w-3.5 h-3.5 text-kawral-green" />
							Date souhaitée
						</label>
						<input
							type="date"
							required
							min={today}
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className="w-full px-4 py-2 sm:py-2.5 bg-background border border-input rounded-xl text-sm font-semibold text-kawral-dark focus:outline-none focus:border-kawral-orange focus:ring-2 focus:ring-kawral-orange/20 transition-all duration-200"
						/>
					</div>

					{/* Créneaux horaires interactifs */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label className="flex items-center gap-1.5 text-xs font-bold text-kawral-green uppercase tracking-wider">
								<Clock className="w-3.5 h-3.5 text-kawral-orange" />
								Créneau horaire
							</label>
							{loadingSlots && (
								<span className="text-[11px] text-kawral-muted animate-pulse">
									Chargement des disponibilités...
								</span>
							)}
						</div>

						{availableSlots.length > 0 ? (
							<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
								{availableSlots.map((slot) => {
									const isSelected = time === slot;
									return (
										<button
											key={slot}
											type="button"
											onClick={() => setTime(slot)}
											className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all duration-200 cursor-pointer ${
												isSelected
													? "bg-kawral-green text-white border-kawral-green shadow-xs scale-[1.02]"
													: "bg-card text-kawral-dark border-input hover:border-kawral-green/40 hover:bg-kawral-ivory"
											}`}
										>
											{slot.replace(":", "h")}
										</button>
									);
								})}
							</div>
						) : !loadingSlots ? (
							<div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
								<p className="text-xs font-bold text-rose-700">
									Aucun créneau disponible pour cette date.
								</p>
								<p className="text-[11px] text-rose-600 mt-0.5">
									Veuillez sélectionner un autre jour.
								</p>
							</div>
						) : null}
					</div>

					{/* Coordonnées : Nom & Téléphone */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<div className="space-y-1.5">
							<label className="flex items-center gap-1.5 text-xs font-bold text-kawral-green uppercase tracking-wider">
								<UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
								Nom complet
							</label>
							<input
								type="text"
								required
								placeholder="Amadou Diallo"
								value={clientName}
								onChange={(e) => setClientName(e.target.value)}
								className="w-full px-4 py-2 sm:py-2.5 bg-background border border-input rounded-xl text-sm font-semibold text-kawral-dark placeholder:text-muted-foreground/60 focus:outline-none focus:border-kawral-orange focus:ring-2 focus:ring-kawral-orange/20 transition-all duration-200"
							/>
							{errors.clientName && (
								<p className="text-[11px] font-semibold text-rose-500 animate-fade-in">
									{errors.clientName}
								</p>
							)}
						</div>

						<div className="space-y-1.5">
							<label className="flex items-center gap-1.5 text-xs font-bold text-kawral-green uppercase tracking-wider">
								<PhoneIcon className="w-3.5 h-3.5 text-muted-foreground" />
								Téléphone
							</label>
							<input
								type="tel"
								required
								placeholder="+221 77 000 00 00"
								value={clientPhone}
								onChange={(e) => setClientPhone(e.target.value)}
								className="w-full px-4 py-2 sm:py-2.5 bg-background border border-input rounded-xl text-sm font-semibold text-kawral-dark placeholder:text-muted-foreground/60 focus:outline-none focus:border-kawral-orange focus:ring-2 focus:ring-kawral-orange/20 transition-all duration-200"
							/>
							{errors.clientPhone && (
								<p className="text-[11px] font-semibold text-rose-500 animate-fade-in">
									{errors.clientPhone}
								</p>
							)}
						</div>
					</div>

					{/* Email */}
					<div className="space-y-1.5">
						<label className="flex items-center gap-1.5 text-xs font-bold text-kawral-green uppercase tracking-wider">
							<MailIcon className="w-3.5 h-3.5 text-muted-foreground" />
							Adresse email
						</label>
						<input
							type="email"
							required
							placeholder="nom@exemple.sn"
							value={clientEmail}
							onChange={(e) => setClientEmail(e.target.value)}
							className="w-full px-4 py-2 sm:py-2.5 bg-background border border-input rounded-xl text-sm font-semibold text-kawral-dark placeholder:text-muted-foreground/60 focus:outline-none focus:border-kawral-orange focus:ring-2 focus:ring-kawral-orange/20 transition-all duration-200"
						/>
						{errors.clientEmail && (
							<p className="text-[11px] font-semibold text-rose-500 animate-fade-in">
								{errors.clientEmail}
							</p>
						)}
					</div>

					{/* Message facultatif */}
					<div className="space-y-1.5">
						<label className="flex items-center gap-1.5 text-xs font-bold text-kawral-green uppercase tracking-wider">
							Message (optionnel)
						</label>
						<textarea
							rows={2}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Précisions sur votre visite..."
							className="w-full px-4 py-2 sm:py-2.5 bg-background border border-input rounded-xl text-sm font-semibold text-kawral-dark placeholder:text-muted-foreground/60 focus:outline-none focus:border-kawral-orange focus:ring-2 focus:ring-kawral-orange/20 resize-none transition-all duration-200"
						/>
					</div>

					{/* Action & Note de réassurance */}
					<div className="pt-2 space-y-2.5">
						<Button
							type="submit"
							variant="accent"
							size="lg"
							fullWidth
							isLoading={submitting}
							disabled={submitting || loadingSlots || !time}
							leftIcon={<Sparkles className="w-4 h-4" />}
						>
							Confirmer le rendez-vous
						</Button>

						<div className="flex items-center justify-center gap-1.5 text-[11px] text-kawral-muted">
							<ShieldCheck className="w-3.5 h-3.5 text-kawral-green" />
							<span>Réservation gratuite & sans engagement</span>
						</div>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
