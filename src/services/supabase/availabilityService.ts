import {
	supabase,
	isSupabaseConfigured,
} from "../../lib/supabase";
import { AgencyAvailability } from "../../types";
import { generateUUID } from "../../utils/uuid";

export const availabilityService = {
	async fetchHostAvailability(
		hostId: string,
	): Promise<AgencyAvailability[]> {
		if (!isSupabaseConfigured() || !hostId) return [];

		try {
			const { data, error } = await (supabase.from as any)(
				"host_availability",
			)
				.select("*")
				.eq("host_id", hostId)
				.order("day_of_week", { ascending: true });
			if (error) throw error;

			return (data || []).map((item: any) => ({
				id: item.id,
				hostId: item.host_id,
				agencyId: item.agency_id || "",
				dayOfWeek: item.day_of_week,
				startTime: item.start_time.slice(0, 5),
				endTime: item.end_time.slice(0, 5),
				isActive: item.is_active,
			}));
		} catch (error) {
			console.error(
				"availabilityService.fetchHostAvailability error:",
				error,
			);
			return [];
		}
	},

	async saveHostAvailability(
		hostId: string,
		agencyId: string | null,
		availability: AgencyAvailability[],
	): Promise<boolean> {
		if (!isSupabaseConfigured() || !hostId) return true;

		try {
			const { error: deleteError } = await (
				supabase.from as any
			)("host_availability")
				.delete()
				.eq("host_id", hostId);
			if (deleteError) throw deleteError;

			const rows = availability
				.filter((item) => item.isActive)
				.map((item) => ({
					id: item.id || generateUUID(),
					host_id: hostId,
					agency_id: agencyId,
					day_of_week: item.dayOfWeek,
					start_time: item.startTime,
					end_time: item.endTime,
					is_active: true,
				}));

			if (rows.length > 0) {
				const { error: insertError } = await (
					supabase.from as any
				)("host_availability").insert(rows);
				if (insertError) throw insertError;
			}
			return true;
		} catch (error) {
			console.error(
				"availabilityService.saveHostAvailability error:",
				error,
			);
			return false;
		}
	},

	async getAvailableSlots(
		listingId: string,
		date: string,
	): Promise<string[]> {
		if (!isSupabaseConfigured() || !listingId || !date)
			return [];
		try {
			const { data, error } = await (supabase.rpc as any)(
				"get_available_appointment_slots",
				{ p_listing_id: listingId, p_date: date },
			);
			if (error) throw error;
			return (data || []).map(
				(item: { slot: string }) => item.slot,
			);
		} catch (error) {
			console.error(
				"availabilityService.getAvailableSlots error:",
				error,
			);
			return [];
		}
	},
	async fetchAgencyAvailability(
		agencyId: string,
	): Promise<AgencyAvailability[]> {
		if (!isSupabaseConfigured() || !agencyId) return [];

		try {
			const { data, error } = await (supabase.from as any)(
				"agency_availability",
			)
				.select("*")
				.eq("agency_id", agencyId)
				.order("day_of_week", { ascending: true });
			if (error) throw error;

			return (data || []).map((item: any) => ({
				id: item.id,
				hostId: item.agency_id,
				agencyId: item.agency_id,
				dayOfWeek: item.day_of_week,
				startTime: item.start_time.slice(0, 5),
				endTime: item.end_time.slice(0, 5),
				isActive: item.is_active,
			}));
		} catch (error) {
			console.error(
				"availabilityService.fetchAgencyAvailability error:",
				error,
			);
			return [];
		}
	},

	async saveAgencyAvailability(
		agencyId: string,
		availability: AgencyAvailability[],
	): Promise<boolean> {
		if (!isSupabaseConfigured() || !agencyId) return true;

		try {
			const { error: deleteError } = await (
				supabase.from as any
			)("agency_availability")
				.delete()
				.eq("agency_id", agencyId);
			if (deleteError) throw deleteError;

			const rows = availability
				.filter((item) => item.isActive)
				.map((item) => ({
					id: item.id || generateUUID(),
					agency_id: agencyId,
					day_of_week: item.dayOfWeek,
					start_time: item.startTime,
					end_time: item.endTime,
					is_active: true,
				}));

			if (rows.length > 0) {
				const { error: insertError } = await (
					supabase.from as any
				)("agency_availability").insert(rows);
				if (insertError) throw insertError;
			}
			return true;
		} catch (error) {
			console.error(
				"availabilityService.saveAgencyAvailability error:",
				error,
			);
			return false;
		}
	},
};
