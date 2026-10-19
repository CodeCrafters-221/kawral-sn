import React, { useEffect, useState } from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import type { AgencyAvailability } from "../../types";
import { availabilityService } from "../../services/supabase/availabilityService";

const WEEK_DAYS = [
	"Dimanche",
	"Lundi",
	"Mardi",
	"Mercredi",
	"Jeudi",
	"Vendredi",
	"Samedi",
];

interface HostAvailabilityEditorProps {
	hostId: string;
	agencyId?: string | null;
}

export const HostAvailabilityEditor: React.FC<
	HostAvailabilityEditorProps
> = ({ hostId, agencyId = null }) => {
	const [availability, setAvailability] = useState<AgencyAvailability[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

	useEffect(() => {
		let mounted = true;
		setLoading(true);
		availabilityService.fetchHostAvailability(hostId).then((items) => {
			if (mounted) {
				setAvailability(items);
				setLoading(false);
			}
		});
		return () => {
			mounted = false;
		};
	}, [hostId]);

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

	const save = async () => {
		setSaving(true);
		setMessage(null);
		const saved = await availabilityService.saveHostAvailability(
			hostId,
			agencyId,
			availability,
		);
		setSaving(false);
		setMessage(
			saved
				? { text: "Disponibilités enregistrées avec succès.", ok: true }
				: { text: "Impossible d'enregistrer les disponibilités.", ok: false },
		);
	};

	return (
		<div className="bg-white rounded-3xl border border-kawral-border shadow-sm overflow-hidden">
			{/* En-tête */}
			<div className="px-5 pt-5 pb-4 border-b border-slate-100">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-2.5 min-w-0 flex-1">
						<div className="w-9 h-9 rounded-2xl bg-kawral-green/10 flex items-center justify-center shrink-0">
							<Clock className="w-4 h-4 text-kawral-green" />
						</div>
						<div className="min-w-0">
							<h3 className="text-sm font-extrabold text-kawral-dark leading-tight">
								Disponibilités
							</h3>
							<p className="text-[11px] text-kawral-muted leading-none mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
								Créneaux pour les demandes de visite
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={save}
						disabled={loading || saving}
						className="shrink-0 px-4 py-2 bg-kawral-green hover:bg-kawral-darkgreen disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
					>
						{saving ? "En cours…" : "Enregistrer"}
					</button>
				</div>
			</div>

			{/* Corps */}
			<div className="px-3 py-3 space-y-1">
				{loading ? (
					<p className="text-xs text-kawral-muted text-center py-6">
						Chargement des disponibilités…
					</p>
				) : (
					WEEK_DAYS.map((day, dayOfWeek) => {
						const item = availability.find((e) => e.dayOfWeek === dayOfWeek);
						const isActive = item?.isActive ?? false;

						return (
							<div
								key={day}
								onClick={() => updateDay(dayOfWeek, { isActive: !isActive })}
								role="checkbox"
								aria-checked={isActive}
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === " " || e.key === "Enter") {
										e.preventDefault();
										updateDay(dayOfWeek, { isActive: !isActive });
									}
								}}
								className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl cursor-pointer transition-all select-none ${
									isActive
										? "bg-kawral-green/5 border border-kawral-green/15"
										: "border border-transparent hover:bg-slate-50"
								}`}
							>
								{/* Checkbox stylisée */}
								<div
									className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
										isActive
											? "bg-kawral-green border-kawral-green"
											: "bg-white border-slate-300"
									}`}
								>
									{isActive && (
										<svg
											className="w-3 h-3 text-white"
											viewBox="0 0 12 12"
											fill="none"
										>
											<path
												d="M2 6l3 3 5-5"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									)}
								</div>

								{/* Nom du jour */}
								<span
									className={`text-xs font-bold w-20 shrink-0 ${
										isActive ? "text-kawral-dark" : "text-slate-400"
									}`}
								>
									{day}
								</span>

								{/* Badge statut */}
								<span
									className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
										isActive
											? "bg-kawral-green/10 text-kawral-green"
											: "bg-slate-100 text-slate-400"
									}`}
								>
									{isActive ? "Ouvert" : "Fermé"}
								</span>

								{/* Inputs horaires — stopPropagation pour éviter le toggle du jour */}
								<div className="flex items-center gap-1 flex-1 min-w-0">
									<input
										type="time"
										value={item?.startTime ?? "09:00"}
										disabled={!isActive}
										onClick={(e) => e.stopPropagation()}
										onChange={(e) => {
											e.stopPropagation();
											updateDay(dayOfWeek, { startTime: e.target.value });
										}}
										className={`flex-1 min-w-0 w-0 rounded-xl border px-1.5 py-1.5 text-xs font-semibold text-center transition-all focus:outline-none ${
											isActive
												? "border-kawral-border bg-white focus:border-kawral-green text-kawral-dark"
												: "border-transparent bg-transparent text-slate-300 cursor-default"
										}`}
									/>
									<span
										className={`text-xs shrink-0 ${
											isActive ? "text-slate-400" : "text-slate-200"
										}`}
									>
										–
									</span>
									<input
										type="time"
										value={item?.endTime ?? "18:00"}
										disabled={!isActive}
										onClick={(e) => e.stopPropagation()}
										onChange={(e) => {
											e.stopPropagation();
											updateDay(dayOfWeek, { endTime: e.target.value });
										}}
										className={`flex-1 min-w-0 w-0 rounded-xl border px-1.5 py-1.5 text-xs font-semibold text-center transition-all focus:outline-none ${
											isActive
												? "border-kawral-border bg-white focus:border-kawral-green text-kawral-dark"
												: "border-transparent bg-transparent text-slate-300 cursor-default"
										}`}
									/>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Message de retour */}
			{message && (
				<div
					className={`mx-3 mb-3 flex items-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-semibold ${
						message.ok
							? "bg-emerald-50 text-emerald-700 border border-emerald-200"
							: "bg-rose-50 text-rose-600 border border-rose-200"
					}`}
				>
					{message.ok ? (
						<CheckCircle2 className="w-4 h-4 shrink-0" />
					) : (
						<XCircle className="w-4 h-4 shrink-0" />
					)}
					<span>{message.text}</span>
				</div>
			)}
		</div>
	);
};
