import type { UserRole } from "../types";

export type DbRole = "client" | "vendeur" | "admin";

/**
 * Normalise n'importe quelle chaîne de rôle (anglais ou français)
 * vers le rôle applicatif Kawral ('client' | 'seller' | 'admin').
 * Les anciennes valeurs 'agency' / 'agence' sont automatiquement mappées vers 'seller'.
 */
export const toAppRole = (role?: string | null): UserRole => {
	if (!role) return "client";
	const r = role.trim().toLowerCase();
	if (r === "seller" || r === "vendeur" || r === "agency" || r === "agence") return "seller";
	if (r === "admin") return "admin";
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
