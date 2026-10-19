import {
	supabase,
	isSupabaseConfigured,
} from "../../lib/supabase";
import {
	generateUUID,
	toValidUUID,
} from "../../utils/uuid";

export type AdminRole =
	| "client"
	| "vendeur"
	| "admin";

export interface AdminUser {
	id: string;
	full_name: string | null;
	email: string | null;
	phone: string | null;
	role: AdminRole;
	created_at: string;
}

export interface AdminCategory {
	id: string;
	name: string;
	slug: string;
	parent_id: string | null;
	icon_url: string | null;
	created_at: string;
}

export interface AdminAgencyUpdate {
	verified?: boolean;
	is_blocked?: boolean;
}

const getErrorMessage = (
	error: { message?: string } | null,
) => error?.message || "Une erreur Supabase est survenue.";

export const adminService = {
	async getUsers(): Promise<{
		data: AdminUser[];
		error: string | null;
	}> {
		if (!isSupabaseConfigured())
			return { data: [], error: null };

		try {
			const { data, error } = await (supabase.from as any)(
				"profiles",
			)
				.select(
					"id, full_name, email, phone, role, created_at",
				)
				.order("created_at", { ascending: false });
			if (error)
				return { data: [], error: getErrorMessage(error) };
			return {
				data: (data || []) as AdminUser[],
				error: null,
			};
		} catch (error) {
			return {
				data: [],
				error: getErrorMessage(error as Error),
			};
		}
	},

	async updateUserRole(
		userId: string,
		role: AdminRole,
	): Promise<{ success: boolean; error: string | null }> {
		if (!isSupabaseConfigured())
			return { success: true, error: null };

		try {
			const { error } = await (supabase.from as any)(
				"profiles",
			)
				.update({
					role,
					updated_at: new Date().toISOString(),
				})
				.eq("id", toValidUUID(userId));
			return error
				? { success: false, error: getErrorMessage(error) }
				: { success: true, error: null };
		} catch (error) {
			return {
				success: false,
				error: getErrorMessage(error as Error),
			};
		}
	},

	async updateAgency(
		agencyId: string,
		changes: AdminAgencyUpdate,
	): Promise<{
		success: boolean;
		error: string | null;
		fallbackUsed?: boolean;
	}> {
		if (!isSupabaseConfigured())
			return { success: true, error: null };

		try {
			const query = (supabase.from as any)("agencies")
				.update(changes)
				.eq("id", toValidUUID(agencyId));
			const { data, error } =
				changes.is_blocked === undefined
					? await query.select("id, verified").maybeSingle()
					: await query
							.select("id, verified, is_blocked")
							.maybeSingle();
			if (!error && !data) {
				return {
					success: false,
					error:
						"Aucune agence mise à jour. Vérifiez que le schéma Supabase contient is_blocked et que votre compte est admin.",
				};
			}
			if (error) {
				const message = getErrorMessage(error);
				const schemaCacheError =
					message.includes("is_blocked") &&
					message.includes("schema cache");
				if (
					schemaCacheError &&
					changes.is_blocked !== undefined
				) {
					const fallback = await (supabase.from as any)(
						"agencies",
					)
						.update({ verified: !changes.is_blocked })
						.eq("id", toValidUUID(agencyId))
						.select("id, verified")
						.maybeSingle();
					if (!fallback.error && fallback.data) {
						return {
							success: true,
							error: null,
							fallbackUsed: true,
						};
					}
				}
				return {
					success: false,
					error: schemaCacheError
						? "La colonne is_blocked manque dans le schéma Supabase utilisé par l'application. Exécutez la migration 20260822_admin_agency_moderation.sql dans le SQL Editor du même projet, puis rechargez le schéma."
						: message,
				};
			}
			return error
				? { success: false, error: getErrorMessage(error) }
				: { success: true, error: null };
		} catch (error) {
			return {
				success: false,
				error: getErrorMessage(error as Error),
			};
		}
	},

	async getCategories(): Promise<{
		data: AdminCategory[];
		error: string | null;
	}> {
		if (!isSupabaseConfigured())
			return { data: [], error: null };

		try {
			const { data, error } = await (supabase.from as any)(
				"categories",
			)
				.select("*")
				.order("name", { ascending: true });
			if (error)
				return { data: [], error: getErrorMessage(error) };
			return {
				data: (data || []) as AdminCategory[],
				error: null,
			};
		} catch (error) {
			return {
				data: [],
				error: getErrorMessage(error as Error),
			};
		}
	},

	async createCategory(input: {
		name: string;
		slug: string;
		parentId?: string;
	}): Promise<{
		data: AdminCategory | null;
		error: string | null;
	}> {
		if (!isSupabaseConfigured()) {
			return {
				data: {
					id: generateUUID(),
					name: input.name,
					slug: input.slug,
					parent_id: input.parentId || null,
					icon_url: null,
					created_at: new Date().toISOString(),
				},
				error: null,
			};
		}

		try {
			const { data, error } = await (supabase.from as any)(
				"categories",
			)
				.insert({
					name: input.name,
					slug: input.slug,
					parent_id: input.parentId
						? toValidUUID(input.parentId)
						: null,
				})
				.select("*")
				.single();
			return error
				? { data: null, error: getErrorMessage(error) }
				: { data: data as AdminCategory, error: null };
		} catch (error) {
			return {
				data: null,
				error: getErrorMessage(error as Error),
			};
		}
	},

	async updateCategory(
		categoryId: string,
		input: { name: string; slug: string },
	): Promise<{ success: boolean; error: string | null }> {
		if (!isSupabaseConfigured())
			return { success: true, error: null };

		try {
			const { error } = await (supabase.from as any)(
				"categories",
			)
				.update(input)
				.eq("id", toValidUUID(categoryId));
			return error
				? { success: false, error: getErrorMessage(error) }
				: { success: true, error: null };
		} catch (error) {
			return {
				success: false,
				error: getErrorMessage(error as Error),
			};
		}
	},

	async deleteCategory(
		categoryId: string,
	): Promise<{ success: boolean; error: string | null }> {
		if (!isSupabaseConfigured())
			return { success: true, error: null };

		try {
			const { count, error: listingsError } = await (
				supabase.from as any
			)("listings")
				.select("id", { count: "exact", head: true })
				.eq("category_id", toValidUUID(categoryId));
			if (listingsError) {
				return {
					success: false,
					error: getErrorMessage(listingsError),
				};
			}
			if ((count || 0) > 0) {
				return {
					success: false,
					error:
						"Cette catégorie est utilisée par des annonces et ne peut pas être supprimée.",
				};
			}

			const { error } = await (supabase.from as any)(
				"categories",
			)
				.delete()
				.eq("id", toValidUUID(categoryId));
			return error
				? { success: false, error: getErrorMessage(error) }
				: { success: true, error: null };
		} catch (error) {
			return {
				success: false,
				error: getErrorMessage(error as Error),
			};
		}
	},
};
