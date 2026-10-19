import React, { useState } from "react";
import { MapPin, Navigation, ExternalLink, Copy, Check, Layers, Maximize2 } from "lucide-react";
import { resolveAppointmentLocation } from "../../utils/geoCoordinates";
import { ListingLocation } from "../../types";

interface AppointmentLocationMapProps {
	locationStr?: string;
	listingLocation?: Partial<ListingLocation>;
	title?: string;
	className?: string;
	height?: string;
	showActions?: boolean;
	onExpand?: () => void;
}

export const AppointmentLocationMap: React.FC<AppointmentLocationMapProps> = ({
	locationStr,
	listingLocation,
	title,
	className = "",
	height = "h-48",
	showActions = true,
	onExpand,
}) => {
	const [copied, setCopied] = useState(false);
	const [mapType, setMapType] = useState<"standard" | "satellite">("standard");

	const geo = resolveAppointmentLocation(locationStr, listingLocation);

	const handleCopy = (e: React.MouseEvent) => {
		e.stopPropagation();
		navigator.clipboard.writeText(geo.fullAddress);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const embedUrl = `${geo.embedUrl}${mapType === "satellite" ? "&t=k" : ""}`;

	return (
		<div className={`relative rounded-2xl overflow-hidden border border-kawral-border/80 bg-slate-100 flex flex-col ${className}`}>
			{/* En-tête de la carte */}
			<div className="bg-white/95 backdrop-blur-sm px-3.5 py-2 border-b border-kawral-border/60 flex items-center justify-between text-xs z-10">
				<div className="flex items-center gap-1.5 min-w-0">
					<span className="p-1 rounded-lg bg-kawral-green/10 text-kawral-green shrink-0">
						<MapPin className="w-3.5 h-3.5" />
					</span>
					<span className="font-bold text-kawral-dark truncate" title={geo.fullAddress}>
						{geo.label}
					</span>
				</div>
				<div className="flex items-center gap-1 shrink-0">
					{/* Toggle vue satellite / plan */}
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							setMapType((prev) => (prev === "standard" ? "satellite" : "standard"));
						}}
						className="p-1.5 rounded-lg text-slate-500 hover:text-kawral-dark hover:bg-slate-100 transition-colors"
						title={mapType === "standard" ? "Passer en vue Satellite" : "Passer en vue Plan"}
					>
						<Layers className="w-3.5 h-3.5" />
					</button>

					{onExpand && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onExpand();
							}}
							className="p-1.5 rounded-lg text-slate-500 hover:text-kawral-dark hover:bg-slate-100 transition-colors"
							title="Agrandir la carte"
						>
							<Maximize2 className="w-3.5 h-3.5" />
						</button>
					)}
				</div>
			</div>

			{/* Carte interactive intégrée */}
			<div className={`relative w-full ${height} overflow-hidden bg-slate-200`}>
				<iframe
					title={`Carte rendez-vous ${title || geo.label}`}
					src={embedUrl}
					className="w-full h-full border-0 select-none"
					loading="lazy"
					allowFullScreen={false}
					referrerPolicy="no-referrer-when-downgrade"
				/>

				{/* Pin overlay informatif */}
				<div className="absolute top-2 left-2 pointer-events-none z-10 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-kawral-dark shadow-sm border border-white/60 flex items-center gap-1">
					<span className="w-2 h-2 rounded-full bg-kawral-orange animate-pulse" />
					<span>Lieu exact du rendez-vous</span>
				</div>
			</div>

			{/* Barre d'action inférieure */}
			{showActions && (
				<div className="bg-kawral-ivory px-3 py-2 border-t border-kawral-border/60 flex items-center justify-between gap-2 text-xs">
					<button
						type="button"
						onClick={handleCopy}
						className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-kawral-dark transition-colors cursor-pointer"
					>
						{copied ? (
							<>
								<Check className="w-3.5 h-3.5 text-emerald-600" />
								<span className="text-emerald-600 font-bold">Copié !</span>
							</>
						) : (
							<>
								<Copy className="w-3.5 h-3.5 text-slate-400" />
								<span>Copier l'adresse</span>
							</>
						)}
					</button>

					<div className="flex items-center gap-2">
						<a
							href={geo.directionsUrl}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
							className="flex items-center gap-1 px-2.5 py-1 bg-kawral-green text-white rounded-lg text-[11px] font-bold hover:bg-kawral-darkgreen transition-all shadow-xs"
						>
							<Navigation className="w-3 h-3 text-kawral-orange" />
							<span>Itinéraire GPS</span>
							<ExternalLink className="w-2.5 h-2.5 opacity-70 ml-0.5" />
						</a>
					</div>
				</div>
			)}
		</div>
	);
};
