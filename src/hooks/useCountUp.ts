import { useEffect, useRef, useState } from "react";

interface UseCountUpOptions {
	/** Durée de l'animation en millisecondes (défaut : 1000). */
	duration?: number;
	/** Tant que `false`, la valeur affichée reste inchangée (ex. données en cours de chargement). */
	enabled?: boolean;
	/** Valeur affichée au premier rendu (défaut : 0). Passer la cible pour ne pas rejouer l'animation initiale. */
	initialValue?: number;
}

/** Ease-out cubique : démarrage vif, ralentissement progressif en fin de course. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Normalise une valeur en entier positif ; null / undefined / NaN / négatif → 0. */
const toSafeCount = (value: unknown): number => {
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
};

const prefersReducedMotion = (): boolean =>
	typeof window !== "undefined" &&
	typeof window.matchMedia === "function" &&
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Anime un compteur affiché de sa valeur courante vers `target`.
 * - Purement visuel : ne touche jamais aux données sources.
 * - Si `target` change en cours d'animation, repart de la valeur affichée (transition fluide).
 * - Avec `prefers-reduced-motion`, affiche directement la valeur finale.
 */
export function useCountUp(
	target: number,
	{ duration = 1000, enabled = true, initialValue = 0 }: UseCountUpOptions = {},
): number {
	const safeTarget = toSafeCount(target);
	const [value, setValue] = useState(() => toSafeCount(initialValue));
	const currentRef = useRef(value);

	useEffect(() => {
		if (!enabled) return;

		const from = currentRef.current;
		if (from === safeTarget) return;

		if (prefersReducedMotion() || duration <= 0) {
			currentRef.current = safeTarget;
			setValue(safeTarget);
			return;
		}

		let frameId = 0;
		let startTime: number | null = null;

		const tick = (now: number) => {
			if (startTime === null) startTime = now;
			const progress = Math.min((now - startTime) / duration, 1);
			const next =
				progress >= 1
					? safeTarget
					: Math.round(from + (safeTarget - from) * easeOutCubic(progress));
			currentRef.current = next;
			setValue(next);
			if (progress < 1) frameId = requestAnimationFrame(tick);
		};

		frameId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frameId);
	}, [safeTarget, enabled, duration]);

	return value;
}
