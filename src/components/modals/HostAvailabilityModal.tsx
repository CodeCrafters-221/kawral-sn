import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, XCircle, Calendar, Sparkles, Check, X } from "lucide-react";
import type { AgencyAvailability } from "../../types";
import { availabilityService } from "../../services/supabase/availabilityService";
import {
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Badge,
} from "../ui";
import { useApp } from "../../context/AppContext";

const WEEK_DAYS = [
	"Dimanche",
	"Lundi",
	"Mardi",
	"Mercredi",
	"Jeudi",
	"Vendredi",
	"Samedi",
];

interface HostAvailabilityModalProps {
	isOpen: boolean;
	onClose: () => void;
	hostId: string;
	agencyId?: string | null;
	title?: string;
	subtitle?: string;
	onSaved?: (availability: AgencyAvailability[]) => void;
}

export const HostAvailabilityModal: React.FC<HostAvailabilityModalProps> = ({
	isOpen,
	onClose,
	hostId,
	agencyId = null,
	title = "Disponibilités pour les visites",
	subtitle = "Définissez vos jours et horaires pour recevoir des demandes de rendez-vous.",
	onSaved,
}) => {
	const { addToast } = useApp();
	const [availability, setAvailability] = useState<AgencyAvailability[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

	// Charger les disponibilités à l'ouverture de la modale
	useEffect(() => {
		if (!isOpen || !hostId) return;

		let mounted = true;
		setLoading(true);
		setMessage(null);

		availabilityService.fetchHostAvailability(hostId).then((items) => {
			if (mounted) {
				setAvailability(items);
				setLoading(false);
			}
		});

		return () => {
			mounted = false;
		};
	}, [isOpen, hostId]);

	const updateDay = (dayOfWeek: number, updates: Partial<AgencyAvailability>) => {
		setAvailability((prev) => {
			const existing = prev.find((item) => item.dayOfWeek === dayOfWeek);
			const next: AgencyAvailability = {
				...(existing?.id !== undefined && { id: existing.id }),
				hostId,
				agencyId: agencyId ?? "",
				dayOfWeek,
				startTime: existing?.startTime ?? "09:00",
				endTime: existing?.endTime ?? "18:00",
				isActive: existing?.isActive ?? false,
				...updates,
			};
			return [...prev.filter((item) => item.dayOfWeek !== dayOfWeek), next].sort(
				(a, b) => a.dayOfWeek - b.dayOfWeek,
			);
		});
	};

	// Actions rapides pour configurer la semaine en 1 clic
	const handleQuickSet = (type: "workdays" | "all" | "none") => {
		setAvailability((prev) => {
			return WEEK_DAYS.map((_, dayOfWeek) => {
				const existing = prev.find((item) => item.dayOfWeek === dayOfWeek);
				let isActive = false;
				if (type === "workdays") {
					// Lundi (1) à Vendredi (5)
					isActive = dayOfWeek >= 1 && dayOfWeek <= 5;
				} else if (type === "all") {
					isActive = true;
				} else if (type === "none") {
					isActive = false;
				}

				return {
					...(existing?.id !== undefined && { id: existing.id }),
					hostId,
					agencyId: agencyId ?? "",
					dayOfWeek,
					startTime: existing?.startTime ?? "09:00",
					endTime: existing?.endTime ?? "18:00",
					isActive,
				};
			});
		});
	};

	const handleSave = async () => {
		setSaving(true);
		setMessage(null);
		const saved = await availabilityService.saveHostAvailability(
			hostId,
			agencyId,
			availability,
		);
		setSaving(false);

		if (saved) {
			setMessage({ text: "Disponibilités enregistrées avec succès.", ok: true });
			addToast("Disponibilités mises à jour avec succès !", "success");
			if (onSaved) onSaved(availability);
			setTimeout(() => {
				onClose();
			}, 900);
		} else {
			setMessage({ text: "Impossible d'enregistrer les disponibilités.", ok: false });
			addToast("Erreur lors de l'enregistrement des disponibilités.", "error");
		}
	};

	const activeDaysCount = availability.filter((a) => a.isActive).length;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="w-[94vw] max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
				{/* En-tête */}
				<DialogHeader className="pb-3 border-b border-slate-100">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-kawral-green/10 flex items-center justify-center shrink-0">
							<Clock className="w-5 h-5 text-kawral-green" />
						</div>
						<div className="min-w-0 pr-6">
							<DialogTitle className="text-base sm:text-lg font-black text-kawral-dark truncate">
								{title}
							</DialogTitle>
							<p className="text-xs text-kawral-muted mt-0.5 line-clamp-2">
								{subtitle}
							</p>
						</div>
					</div>

					{/* Compteur et actions rapides */}
					<div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100/80">
						<div className="flex items-center gap-1.5">
							<span className="text-[11px] font-bold text-kawral-muted">Statut :</span>
							<Badge variant={activeDaysCount > 0 ? "verified" : "secondary"} size="sm">
								{activeDaysCount} jour{activeDaysCount > 1 ? "s" : ""} actif{activeDaysCount > 1 ? "s" : ""}
							</Badge>
						</div>

						<div className="flex items-center gap-1 text-[11px]">
							<button
								type="button"
								onClick={() => handleQuickSet("workdays")}
								className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-kawral-green/10 hover:text-kawral-green font-bold text-slate-600 transition-colors cursor-pointer"
								title="Ouvrir du lundi au vendredi"
							>
								Lun-Ven
							</button>
							<button
								type="button"
								onClick={() => handleQuickSet("all")}
								className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-kawral-green/10 hover:text-kawral-green font-bold text-slate-600 transition-colors cursor-pointer"
								title="Ouvrir tous les jours"
							>
								7j/7
							</button>
							<button
								type="button"
								onClick={() => handleQuickSet("none")}
								className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 font-bold text-slate-600 transition-colors cursor-pointer"
								title="Tout désactiver"
							>
								Fermer tout
							</button>
						</div>
					</div>
				</DialogHeader>

				{/* Corps de la modale */}
				<div className="space-y-2.5 my-2">
					{loading ? (
						<div className="py-12 text-center space-y-2">
							<div className="w-8 h-8 border-3 border-kawral-green border-t-transparent rounded-full animate-spin mx-auto" />
							<p className="text-xs text-kawral-muted font-medium">
								Chargement des disponibilités...
							</p>
						</div>
					) : (
						WEEK_DAYS.map((day, dayOfWeek) => {
							const item = availability.find((e) => e.dayOfWeek === dayOfWeek);
							const isActive = item?.isActive ?? false;

							return (
								<div
									key={day}
									className={`p-3 sm:p-3.5 rounded-2xl border transition-all ${
										isActive
											? "bg-kawral-green/5 border-kawral-green/25 shadow-2xs"
											: "bg-slate-50/70 border-slate-200/60 hover:bg-slate-100/60"
									}`}
								>
									{/* Ligne 1 : Nom du jour + Switch actif/fermé */}
									<div className="flex items-center justify-between gap-2">
										<label className="flex items-center gap-2.5 font-bold text-xs sm:text-sm text-kawral-dark cursor-pointer select-none">
											<input
												type="checkbox"
												checked={isActive}
												onChange={(e) =>
													updateDay(dayOfWeek, { isActive: e.target.checked })
												}
												className="w-4 h-4 rounded border-slate-300 text-kawral-green focus:ring-kawral-green accent-kawral-green cursor-pointer"
											/>
											<span className={isActive ? "text-kawral-dark" : "text-slate-500 font-semibold"}>
												{day}
											</span>
										</label>

										<button
											type="button"
											onClick={() =>
												updateDay(dayOfWeek, { isActive: !isActive })
											}
											className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
												isActive
													? "bg-kawral-green text-white shadow-2xs"
													: "bg-slate-200 text-slate-500 hover:bg-slate-300"
											}`}
										>
											{isActive ? "Disponible" : "Fermé"}
										</button>
									</div>

									{/* Ligne 2 : Horaires (affichés uniquement si le jour est actif) */}
									{isActive && (
										<div className="mt-2.5 pt-2.5 border-t border-kawral-green/15 flex items-center justify-between gap-2 animate-fade-in">
											<div className="flex items-center gap-1.5 flex-1 min-w-0">
												<span className="text-[11px] font-bold text-kawral-muted shrink-0">
													De
												</span>
												<input
													type="time"
													value={item?.startTime ?? "09:00"}
													onChange={(e) =>
														updateDay(dayOfWeek, {
															startTime: e.target.value,
														})
													}
													className="flex-1 min-w-0 px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-kawral-dark text-center focus:border-kawral-green focus:ring-1 focus:ring-kawral-green/30 focus:outline-none [color-scheme:light] shadow-2xs"
												/>
											</div>

											<span className="text-slate-400 font-bold shrink-0">–</span>

											<div className="flex items-center gap-1.5 flex-1 min-w-0">
												<span className="text-[11px] font-bold text-kawral-muted shrink-0">
													à
												</span>
												<input
													type="time"
													value={item?.endTime ?? "18:00"}
													onChange={(e) =>
														updateDay(dayOfWeek, {
															endTime: e.target.value,
														})
													}
													className="flex-1 min-w-0 px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-kawral-dark text-center focus:border-kawral-green focus:ring-1 focus:ring-kawral-green/30 focus:outline-none [color-scheme:light] shadow-2xs"
												/>
											</div>
										</div>
									)}
								</div>
							);
						})
					)}
				</div>

				{/* Message de notification retour */}
				{message && (
					<div
						className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-semibold animate-fade-in ${
							message.ok
								? "bg-emerald-50 text-emerald-800 border border-emerald-200"
								: "bg-rose-50 text-rose-700 border border-rose-200"
						}`}
					>
						{message.ok ? (
							<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
						) : (
							<XCircle className="w-4 h-4 text-rose-500 shrink-0" />
						)}
						<span>{message.text}</span>
					</div>
				)}

				{/* Pied de modale : boutons d'action */}
				<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
						disabled={saving}
					>
						Fermer
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={handleSave}
						disabled={loading || saving}
						isLoading={saving}
						leftIcon={<CheckCircle2 className="w-4 h-4 text-kawral-orange" />}
					>
						<span>Enregistrer les créneaux</span>
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
