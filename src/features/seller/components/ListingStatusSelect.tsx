import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { ListingStatus } from "../../../types";

export interface ListingStatusSelectProps {
	value: ListingStatus;
	/** Appelé avec le nouveau statut. Peut être asynchrone : le sélecteur reste bloqué pendant l'appel. */
	onChange: (status: ListingStatus) => void | Promise<unknown>;
	/** Affiche l'option « Loué » (annonces de location uniquement). */
	allowRented?: boolean;
	disabled?: boolean;
	/** Occupe toute la largeur du conteneur. */
	fullWidth?: boolean;
	id?: string;
	className?: string;
}

interface StatusVisualConfig {
	label: string;
	dotClass: string;
	dotRingClass: string;
	triggerBadgeClass: string;
	selectedRowClass: string;
	checkIconClass: string;
}

const STATUS_CONFIG: Record<ListingStatus, StatusVisualConfig> = {
	published: {
		label: "En ligne",
		dotClass: "bg-emerald-500",
		dotRingClass: "ring-3 ring-emerald-500/20",
		triggerBadgeClass: "text-emerald-900",
		selectedRowClass: "bg-emerald-50/90 text-emerald-950 font-semibold",
		checkIconClass: "text-emerald-600",
	},
	unavailable: {
		label: "Indisponible",
		dotClass: "bg-slate-400",
		dotRingClass: "ring-3 ring-slate-400/20",
		triggerBadgeClass: "text-slate-700",
		selectedRowClass: "bg-slate-100/90 text-slate-900 font-semibold",
		checkIconClass: "text-slate-600",
	},
	sold: {
		label: "Vendu",
		dotClass: "bg-sky-500",
		dotRingClass: "ring-3 ring-sky-500/20",
		triggerBadgeClass: "text-sky-900",
		selectedRowClass: "bg-sky-50/90 text-sky-950 font-semibold",
		checkIconClass: "text-sky-600",
	},
	rented: {
		label: "Loué",
		dotClass: "bg-violet-500",
		dotRingClass: "ring-3 ring-violet-500/20",
		triggerBadgeClass: "text-violet-900",
		selectedRowClass: "bg-violet-50/90 text-violet-950 font-semibold",
		checkIconClass: "text-violet-600",
	},
	archived: {
		label: "Archivée",
		dotClass: "bg-slate-600",
		dotRingClass: "ring-3 ring-slate-600/20",
		triggerBadgeClass: "text-slate-700",
		selectedRowClass: "bg-slate-100 text-slate-900 font-semibold",
		checkIconClass: "text-slate-700",
	},
	draft: {
		label: "Brouillon",
		dotClass: "bg-amber-500",
		dotRingClass: "ring-3 ring-amber-500/20",
		triggerBadgeClass: "text-amber-900",
		selectedRowClass: "bg-amber-50/90 text-amber-950 font-semibold",
		checkIconClass: "text-amber-600",
	},
};

interface MenuPosition {
	top?: number;
	bottom?: number;
	left: number;
	width: number;
	placement: "bottom" | "top";
}

export const ListingStatusSelect: React.FC<ListingStatusSelectProps> = ({
	value,
	onChange,
	allowRented = false,
	disabled = false,
	fullWidth = false,
	id,
	className = "",
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
	const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
	const generatedId = useId();
	const listboxId = `status-listbox-${generatedId}`;

	const options: ListingStatus[] = ["published", "unavailable", "sold"];
	if (allowRented || value === "rented") options.push("rented");
	options.push("archived");
	if (value === "draft") options.unshift("draft");

	const currentConfig = STATUS_CONFIG[value] ?? STATUS_CONFIG.published;

	const updatePosition = () => {
		const trigger = triggerRef.current;
		if (!trigger) return;

		const rect = trigger.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const horizontalMargin = 12;

		// Largeur compacte et lisible alignée sur le déclencheur (min 188px, max 260px, sans jamais déborder de l'écran)
		const desiredWidth = Math.min(
			Math.max(rect.width, 188),
			Math.min(260, viewportWidth - horizontalMargin * 2),
		);

		// Alignement horizontal intelligent avec maintien dans les limites de l'écran
		let left = rect.left;
		if (left + desiredWidth > viewportWidth - horizontalMargin) {
			left = Math.max(horizontalMargin, rect.right - desiredWidth);
		}
		if (left < horizontalMargin) {
			left = horizontalMargin;
		}

		// Estimation de la hauteur du menu (43px par ligne + 12px de padding)
		const estimatedMenuHeight = options.length * 43 + 12;
		// Marge inférieure de sécurité (prend en compte la barre de navigation mobile ~72px)
		const bottomSafeMargin = viewportWidth < 640 ? 80 : 16;
		const spaceBelow = viewportHeight - rect.bottom - bottomSafeMargin;
		const spaceAbove = rect.top - 16;

		if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
			setMenuPosition({
				bottom: viewportHeight - rect.top + 6,
				left,
				width: desiredWidth,
				placement: "top",
			});
		} else {
			setMenuPosition({
				top: rect.bottom + 6,
				left,
				width: desiredWidth,
				placement: "bottom",
			});
		}
	};

	useLayoutEffect(() => {
		if (!isOpen) return;
		updatePosition();
	}, [isOpen, value, allowRented]);

	useEffect(() => {
		if (!isOpen) return;

		const selectedIdx = options.indexOf(value);
		setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);

		const handlePointerDownOutside = (event: PointerEvent) => {
			const target = event.target as Node | null;
			if (
				triggerRef.current?.contains(target) ||
				menuRef.current?.contains(target)
			) {
				return;
			}
			setIsOpen(false);
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				setIsOpen(false);
				triggerRef.current?.focus();
			}
		};

		const handleScrollOrResize = (event: Event) => {
			if (
				menuRef.current &&
				event.target instanceof Node &&
				menuRef.current.contains(event.target)
			) {
				return;
			}
			setIsOpen(false);
		};

		document.addEventListener("pointerdown", handlePointerDownOutside);
		document.addEventListener("keydown", handleKeyDown);
		window.addEventListener("resize", handleScrollOrResize);
		window.addEventListener("scroll", handleScrollOrResize, true);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDownOutside);
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("resize", handleScrollOrResize);
			window.removeEventListener("scroll", handleScrollOrResize, true);
		};
	}, [isOpen, value]);

	useEffect(() => {
		if (isOpen && highlightedIndex >= 0) {
			optionRefs.current[highlightedIndex]?.focus({ preventScroll: true });
		}
	}, [isOpen, highlightedIndex]);

	const handleSelect = async (newStatus: ListingStatus) => {
		setIsOpen(false);
		triggerRef.current?.focus({ preventScroll: true });

		if (newStatus === value || isSaving || disabled) return;

		setIsSaving(true);
		try {
			await onChange(newStatus);
		} finally {
			setIsSaving(false);
		}
	};

	const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		if (disabled || isSaving) return;

		if (
			e.key === "Enter" ||
			e.key === " " ||
			e.key === "ArrowDown" ||
			e.key === "ArrowUp"
		) {
			e.preventDefault();
			setIsOpen(true);
		}
	};

	const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlightedIndex((prev) => (prev + 1) % options.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlightedIndex(
				(prev) => (prev - 1 + options.length) % options.length,
			);
		} else if (e.key === "Home") {
			e.preventDefault();
			setHighlightedIndex(0);
		} else if (e.key === "End") {
			e.preventDefault();
			setHighlightedIndex(options.length - 1);
		} else if (e.key === "Tab") {
			setIsOpen(false);
		}
	};

	return (
		<div
			className={`relative inline-flex ${
				fullWidth ? "w-full" : "w-auto"
			} ${className}`}
		>
			<button
				ref={triggerRef}
				id={id}
				type="button"
				disabled={disabled || isSaving}
				onClick={() => {
					if (!disabled && !isSaving) {
						setIsOpen((prev) => !prev);
					}
				}}
				onKeyDown={handleTriggerKeyDown}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-controls={isOpen ? listboxId : undefined}
				aria-label={`Statut de l'annonce : ${currentConfig.label}`}
				className={`group w-full min-w-[144px] inline-flex items-center justify-between gap-2.5 h-[39px] px-3 rounded-xl border bg-white text-[13.5px] sm:text-[13px] font-semibold transition-all duration-150 motion-reduce:transition-none cursor-pointer select-none ${
					isOpen
						? "border-kawral-green ring-2 ring-kawral-green/15 shadow-xs"
						: "border-slate-200/90 hover:border-kawral-green/50 hover:bg-slate-50/60 shadow-2xs"
				} active:scale-[0.99] focus-visible:outline-none focus-visible:border-kawral-green focus-visible:ring-2 focus-visible:ring-kawral-green/20 disabled:cursor-wait disabled:opacity-65`}
			>
				<span className="inline-flex items-center gap-2 min-w-0 truncate">
					<span
						aria-hidden="true"
						className={`w-2 h-2 rounded-full shrink-0 ${currentConfig.dotClass} ${currentConfig.dotRingClass}`}
					/>
					<span className={`truncate ${currentConfig.triggerBadgeClass}`}>
						{currentConfig.label}
					</span>
				</span>

				<span className="flex items-center text-slate-400 group-hover:text-slate-600 shrink-0">
					{isSaving ? (
						<Loader2 className="w-3.5 h-3.5 animate-spin text-kawral-green" />
					) : (
						<ChevronDown
							className={`w-4 h-4 transition-transform duration-150 motion-reduce:transition-none ${
								isOpen ? "rotate-180 text-kawral-green" : ""
							}`}
						/>
					)}
				</span>
			</button>

			{isOpen &&
				menuPosition &&
				typeof document !== "undefined" &&
				createPortal(
					<div
						ref={menuRef}
						id={listboxId}
						role="listbox"
						aria-label="Choisir le statut de l'annonce"
						tabIndex={-1}
						onKeyDown={handleMenuKeyDown}
						style={{
							position: "fixed",
							top: menuPosition.top,
							bottom: menuPosition.bottom,
							left: menuPosition.left,
							width: menuPosition.width,
						}}
						className="z-[100] rounded-[14px] border border-slate-200/90 bg-white p-1.5 shadow-[0_12px_32px_-6px_rgba(15,23,42,0.14),0_4px_12px_-2px_rgba(15,23,42,0.06)] animate-fade-in motion-reduce:animate-none focus:outline-none"
					>
						<div className="flex flex-col gap-0.5">
							{options.map((statusOption, idx) => {
								const cfg =
									STATUS_CONFIG[statusOption] ?? STATUS_CONFIG.published;
								const isSelected = statusOption === value;

								return (
									<button
										key={statusOption}
										ref={(el) => {
											optionRefs.current[idx] = el;
										}}
										type="button"
										role="option"
										aria-selected={isSelected}
										onClick={() => handleSelect(statusOption)}
										onMouseEnter={() => setHighlightedIndex(idx)}
										className={`w-full h-[42px] px-3 rounded-[10px] flex items-center justify-between gap-2.5 text-[14px] leading-tight transition-colors duration-100 motion-reduce:transition-none cursor-pointer text-left focus:outline-none ${
											isSelected
												? cfg.selectedRowClass
												: "text-slate-700 font-medium hover:bg-slate-50 active:bg-slate-100 focus-visible:bg-slate-50"
										}`}
									>
										<span className="inline-flex items-center gap-2.5 min-w-0 truncate">
											<span
												aria-hidden="true"
												className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotClass} ${
													isSelected ? cfg.dotRingClass : ""
												}`}
											/>
											<span className="truncate">{cfg.label}</span>
										</span>

										{isSelected && (
											<Check
												aria-hidden="true"
												className={`w-4 h-4 shrink-0 stroke-[2.25] ${cfg.checkIconClass}`}
											/>
										)}
									</button>
								);
							})}
						</div>
					</div>,
					document.body,
				)}
		</div>
	);
};
