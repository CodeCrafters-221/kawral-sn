import React, { useEffect, useRef, useState } from "react";
import {
	CalendarCheck,
	ChevronRight,
	Eye,
	MessagesSquare,
	Package,
} from "lucide-react";
import { useCountUp } from "../../../hooks/useCountUp";

/**
 * Mémorise (pour la session de l'onglet) le vendeur pour lequel l'animation d'intro a déjà été jouée.
 * Évite de rejouer le comptage à chaque retour sur le dashboard sans rechargement de la page.
 */
let introPlayedForUserId: string | null = null;

type StatTone = "green" | "orange" | "blue" | "violet";

/** Classes Tailwind écrites en toutes lettres pour être détectées par le scan de Tailwind. */
const TONES: Record<
	StatTone,
	{
		card: string;
		iconWrap: string;
		number: string;
		button: string;
	}
> = {
	green: {
		card: "border-l-kawral-green to-kawral-green/[0.06]",
		iconWrap: "bg-kawral-green/10 text-kawral-green ring-kawral-green/10",
		number: "text-kawral-green",
		button:
			"border-kawral-green/50 text-kawral-green hover:bg-kawral-green/5 focus-visible:ring-kawral-green/40",
	},
	orange: {
		card: "border-l-kawral-orange to-kawral-orange/[0.07]",
		iconWrap: "bg-kawral-orange/10 text-kawral-orange ring-kawral-orange/10",
		number: "text-kawral-orange",
		button:
			"border-kawral-orange/50 text-kawral-orange hover:bg-kawral-orange/5 focus-visible:ring-kawral-orange/40",
	},
	blue: {
		card: "border-l-blue-600 to-blue-600/[0.06]",
		iconWrap: "bg-blue-50 text-blue-600 ring-blue-100",
		number: "text-blue-600",
		button:
			"border-blue-600/50 text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500/40",
	},
	violet: {
		card: "border-l-violet-600 to-violet-600/[0.06]",
		iconWrap: "bg-violet-50 text-violet-600 ring-violet-100",
		number: "text-violet-600",
		button:
			"border-violet-600/50 text-violet-600 hover:bg-violet-50 focus-visible:ring-violet-500/40",
	},
};

interface StatCardProps {
	tone: StatTone;
	icon: React.ReactNode;
	title: string;
	value: number;
	description: string;
	actionLabel: string;
	onAction: () => void;
	animate: boolean;
	startFromTarget: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
	tone,
	icon,
	title,
	value,
	description,
	actionLabel,
	onAction,
	animate,
	startFromTarget,
}) => {
	const styles = TONES[tone];
	const safeValue = Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
	const displayed = useCountUp(safeValue, {
		enabled: animate,
		initialValue: startFromTarget ? safeValue : 0,
	});

	return (
		<article
			className={`flex h-full flex-col rounded-2xl border border-slate-200/70 border-l-4 bg-gradient-to-br from-white ${styles.card} p-3 sm:p-5 shadow-xs transition-shadow hover:shadow-sm`}
		>
			<div
				className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full ring-4 ${styles.iconWrap}`}
				aria-hidden="true"
			>
				{icon}
			</div>

			<h3 className="mt-2.5 text-sm sm:text-base font-extrabold leading-tight text-kawral-dark">
				{title}
			</h3>

			<p
				className={`mt-0.5 text-3xl sm:text-4xl font-black leading-none tabular-nums ${styles.number}`}
			>
				<span aria-hidden="true">{displayed.toLocaleString("fr-FR")}</span>
				<span className="sr-only">{safeValue.toLocaleString("fr-FR")}</span>
			</p>

			<p className="mt-1.5 text-[11px] sm:text-xs leading-snug text-kawral-muted">
				{description}
			</p>

			<div className="mt-auto pt-3">
				<button
					type="button"
					onClick={onAction}
					className={`flex w-full cursor-pointer items-center justify-between gap-1 rounded-xl border bg-white/80 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-left text-[10.5px] sm:text-xs font-bold leading-tight transition-colors focus:outline-none focus-visible:ring-2 ${styles.button}`}
				>
					<span className="min-w-0">{actionLabel}</span>
					<ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
				</button>
			</div>
		</article>
	);
};

export interface SellerStatsGridProps {
	/** Identifiant du vendeur (sert à ne jouer l'animation d'intro qu'une fois par session). */
	userId?: string;
	/** `true` quand les données sources sont chargées. */
	isReady: boolean;
	activeListings: number;
	totalViews: number;
	conversations: number;
	appointments: number;
	onManageListings: () => void;
	onViewStatistics: () => void;
	onViewMessages: () => void;
	onViewAgenda: () => void;
}

export const SellerStatsGrid: React.FC<SellerStatsGridProps> = ({
	userId,
	isReady,
	activeListings,
	totalViews,
	conversations,
	appointments,
	onManageListings,
	onViewStatistics,
	onViewMessages,
	onViewAgenda,
}) => {
	const gridRef = useRef<HTMLDivElement>(null);

	// Revisite sans rechargement : on affiche directement les valeurs finales.
	const [startFromTarget] = useState(
		() => !!userId && introPlayedForUserId === userId,
	);

	// L'animation ne démarre que lorsque la grille est réellement visible à l'écran.
	const [isVisible, setIsVisible] = useState(
		() => typeof IntersectionObserver === "undefined",
	);
	useEffect(() => {
		const node = gridRef.current;
		if (isVisible || !node) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setIsVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15 },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [isVisible]);

	const animate = isReady && isVisible;

	useEffect(() => {
		if (animate && userId) introPlayedForUserId = userId;
	}, [animate, userId]);

	const common = { animate, startFromTarget };

	return (
		<div
			ref={gridRef}
			className="grid grid-cols-2 items-stretch gap-3 sm:gap-4"
			aria-label="Statistiques de votre activité"
			role="group"
		>
			<StatCard
				{...common}
				tone="green"
				icon={<Package className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />}
				title="Annonces actives"
				value={activeListings}
				description="Vos annonces sont en ligne et visibles par les utilisateurs."
				actionLabel="Gérer mes annonces"
				onAction={onManageListings}
			/>
			<StatCard
				{...common}
				tone="orange"
				icon={<Eye className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />}
				title="Vues totales"
				value={totalViews}
				description="Nombre total de vues de vos annonces."
				actionLabel="Voir les statistiques"
				onAction={onViewStatistics}
			/>
			<StatCard
				{...common}
				tone="blue"
				icon={<MessagesSquare className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />}
				title="Conversations"
				value={conversations}
				description="Nouveaux messages reçus."
				actionLabel="Voir mes messages"
				onAction={onViewMessages}
			/>
			<StatCard
				{...common}
				tone="violet"
				icon={<CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />}
				title="Rendez-vous"
				value={appointments}
				description="Demandes de rendez-vous à venir."
				actionLabel="Voir mon agenda"
				onAction={onViewAgenda}
			/>
		</div>
	);
};
