import type { UserRole } from "../types";

export type DbRole = "client" | "vendeur" | "admin";

/**
 * Normalise n'importe quelle chaîne de rôle (anglais ou français)
 * vers le rôle applicatif Kawral ('client' | 'seller' | 'admin').
 * Les anciennes valeurs 'agency' / 'agence' sont automatiquement mappées vers 'seller'.
 * ⚠️ Pour les sources non fiables (URL OAuth, localStorage, user_metadata),
 * utiliser `toSafeRegistrationAppRole` qui interdit l'escalade vers 'admin'.
 */
export const toAppRole = (role?: string | null): UserRole => {
	if (!role) return "client";
	const r = role.trim().toLowerCase();
	if (r === "seller" || r === "vendeur" || r === "agency" || r === "agence") return "seller";
	if (r === "admin") return "admin";
	return "client";
};

/**
 * Normalise un rôle provenant d'une source côté client (paramètre URL OAuth,
 * localStorage, user_metadata) en interdisant strictement le rôle 'admin'.
 */
export const toSafeRegistrationAppRole = (
	role?: string | null,
): "client" | "seller" => {
	if (!role) return "client";
	const r = role.trim().toLowerCase();
	if (r === "seller" || r === "vendeur" || r === "agency" || r === "agence") {
		return "seller";
	}
	return "client";
};

/**
 * Normalise n'importe quelle chaîne de rôle vers le rôle de base de données PostgreSQL
 * ('client' | 'vendeur' | 'admin').
 */
export const toDbRole = (role?: string | null): DbRole => {
	if (!role) return "client";
	const r = role.trim().toLowerCase();
	if (r === "seller" || r === "vendeur" || r === "agency" || r === "agence") return "vendeur";
	if (r === "admin") return "admin";
	return "client";
};

/**
 * Normalise un rôle d'inscription côté client vers le rôle PostgreSQL autorisé
 * ('client' | 'vendeur') — n'autorise jamais 'admin'.
 */
export const toSafeRegistrationDbRole = (
	role?: string | null,
): "client" | "vendeur" => {
	if (!role) return "client";
	const r = role.trim().toLowerCase();
	if (r === "seller" || r === "vendeur" || r === "agency" || r === "agence") {
		return "vendeur";
	}
	return "client";
};

/**
 * Retourne le chemin URL du tableau de bord correspondant au rôle.
 */
export const getRoleDashboardPath = (
	role: UserRole | string | null | undefined,
): string => {
	const appRole = toAppRole(role);
	switch (appRole) {
		case "seller":
			return "/dashboard/seller";
		case "admin":
			return "/admin";
		case "client":
		default:
			return "/dashboard/client";
	}
};

/**
 * Retourne l'identifiant de vue dashboard (pour setCurrentView).
 */
export const getRoleDashboardView = (
	role: UserRole | string | null | undefined,
): string => {
	const appRole = toAppRole(role);
	switch (appRole) {
		case "seller":
			return "seller-dashboard";
		case "admin":
			return "admin-dashboard";
		case "client":
		default:
			return "client-dashboard";
	}
};

/**
 * Libellé lisible en français du rôle.
 */
export const getRoleLabel = (
	role: UserRole | string | null | undefined,
): string => {
	const appRole = toAppRole(role);
	switch (appRole) {
		case "seller":
			return "Vendeur";
		case "admin":
			return "Administrateur (Webmaster)";
		case "client":
		default:
			return "Client";
	}
};
