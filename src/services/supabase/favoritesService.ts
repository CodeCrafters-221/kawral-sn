import {
	supabase,
	isSupabaseConfigured,
} from "../../lib/supabase";
import { toValidUUID } from "../../utils/uuid";

export const favoritesService = {
	async getFavorites(userId: string): Promise<string[]> {
		if (!isSupabaseConfigured() || !userId) return [];

		try {
			const { data, error } = await (supabase.from as any)(
				"favorites",
			)
				.select("listing_id")
				.eq("user_id", toValidUUID(userId));

			if (error) throw error;
			return (data || []).map(
				(favorite: { listing_id: string }) =>
					favorite.listing_id,
			);
		} catch (err) {
			console.error(
				"favoritesService.getFavorites error:",
				err,
			);
			return [];
		}
	},

	async addFavorite(
		userId: string,
		listingId: string,
	): Promise<boolean> {
		if (!isSupabaseConfigured()) return true;

		try {
			const { error } = await (supabase.from as any)(
				"favorites",
			).insert({
				user_id: toValidUUID(userId),
				listing_id: toValidUUID(listingId),
			});

			if (error && error.code !== "23505") throw error;
			return true;
		} catch (err) {
			console.error(
				"favoritesService.addFavorite error:",
				err,
			);
			return false;
		}
	},

	async removeFavorite(
		userId: string,
		listingId: string,
	): Promise<boolean> {
		if (!isSupabaseConfigured()) return true;

		try {
			const { error } = await (supabase.from as any)(
				"favorites",
			)
				.delete()
				.eq("user_id", toValidUUID(userId))
				.eq("listing_id", toValidUUID(listingId));

			if (error) throw error;
			return true;
		} catch (err) {
			console.error(
				"favoritesService.removeFavorite error:",
				err,
			);
			return false;
		}
	},

	async isFavorite(
		userId: string,
		listingId: string,
	): Promise<boolean> {
		if (!isSupabaseConfigured() || !userId || !listingId)
			return false;

		try {
			const { data, error } = await (supabase.from as any)(
				"favorites",
			)
				.select("id")
				.eq("user_id", toValidUUID(userId))
				.eq("listing_id", toValidUUID(listingId))
				.maybeSingle();

			if (error) throw error;
			return !!data;
		} catch (err) {
			console.error(
				"favoritesService.isFavorite error:",
				err,
			);
			return false;
		}
	},
};
