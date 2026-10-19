import {
	supabase,
	isSupabaseConfigured,
} from "../../lib/supabase";
import {
	Appointment,
	AppointmentRequestResult,
	Listing,
} from "../../types";
import { toValidUUID } from "../../utils/uuid";

export const appointmentsService = {
	/**
	 * Fetch appointments from Supabase DB
	 */
	async fetchAppointments(
		listingsMap: Record<string, Listing>,
		profilesMap: Record<string, any>,
	): Promise<Appointment[]> {
		if (!isSupabaseConfigured()) return [];

		try {
			const { data: authData } =
				await supabase.auth.getUser();
			const userId = authData?.user?.id;
			const userProfile = userId
				? profilesMap[userId]
				: null;
			const isAdmin = userProfile?.role === "admin";

			if (!userId) return []; // Les visiteurs ne voient aucun RDV

			let query = (supabase.from as any)(
				"appointments",
			).select("*");

			// Filtrer cote serveur (sauf pour les admins)
			if (!isAdmin) {
				query = query.or(
					`client_id.eq.${userId},host_id.eq.${userId}`,
				);
			}

			const { data: apptData, error } = await query.order(
				"created_at",
				{
					ascending: false,
				},
			);

			if (error || !apptData) return [];

			return apptData.map((a: any) => {
				const matchedListing = listingsMap[a.listing_id];
				const clientProfile = profilesMap[a.client_id];
				const hostProfile = profilesMap[a.host_id];

				return {
					id: a.id,
					listingId: a.listing_id || "",
					listingTitle:
						matchedListing?.title || "Rendez-vous visite",
					listingImage:
						matchedListing?.images[0] ||
						"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=300&q=80",
					listingLocation: matchedListing
						? `${matchedListing.location.neighborhood}, ${matchedListing.location.city}`
						: "Dakar",
					date: a.appointment_date
						? a.appointment_date.split("T")[0]
						: "",
					time: a.appointment_date
						? new Date(
								a.appointment_date,
							).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})
						: "",
					clientId: a.client_id || "",
					clientName: clientProfile?.full_name || "Client",
					clientPhone: clientProfile?.phone || "",
					clientEmail: clientProfile?.email || "",
					sellerId: a.host_id,
					sellerName: hostProfile?.full_name || matchedListing?.owner?.name || "Hôte",
					sellerPhone: hostProfile?.phone || matchedListing?.owner?.phone || "",
					sellerEmail: hostProfile?.email || matchedListing?.owner?.email || "",
					message: a.notes || "",
					status: a.status || "pending",
					createdAt: a.created_at
						? a.created_at.split("T")[0]
						: "",
				};
			});
		} catch (err) {
			console.error(
				"appointmentsService.fetchAppointments error:",
				err,
			);
			return [];
		}
	},

	/**
	 * Create an appointment request in Supabase DB
	 */
	async createAppointment(
		apptId: string,
		listingId: string,
		clientId: string,
		hostId: string,
		date: string,
		time: string,
		message: string,
	): Promise<AppointmentRequestResult> {
		if (!isSupabaseConfigured()) {
			return {
				success: false,
				code: "error",
				message: "Supabase n'est pas configure.",
			};
		}
		const rpcParams = {
			p_listing_id: toValidUUID(listingId),
			p_appointment_date: date,
			p_appointment_time: `${time}:00`,
			p_notes: message,
		};

		const ensureClientProfile = async () => {
			try {
				const { data: authData } = await supabase.auth.getUser();
				const user = authData?.user;
				if (user) {
					await (supabase.from as any)("profiles").upsert({
						id: user.id,
						full_name:
							user.user_metadata?.full_name ||
							user.email?.split("@")[0] ||
							"Client",
						role: "client",
						phone: user.user_metadata?.phone || null,
					});
				}
			} catch (e) {
				console.warn(
					"[createAppointment] auto-create profile fallback error:",
					e,
				);
			}
		};

		try {
			let { error } = await (supabase.rpc as any)(
				"create_appointment_request",
				rpcParams,
			);

			// Si violation de clé étrangère appointments_client_id_fkey, créer le profil et réessayer une fois
			if (
				error &&
				(error.code === "23503" ||
					error.message?.includes("appointments_client_id_fkey"))
			) {
				console.warn(
					"[createAppointment] Profil manquant dans public.profiles (23503). Création automatique et nouvelle tentative...",
				);
				await ensureClientProfile();
				const retryRes = await (supabase.rpc as any)(
					"create_appointment_request",
					rpcParams,
				);
				error = retryRes.error;
			}

			if (!error) return { success: true };

			// Log brut pour debogage
			console.warn(
				"[createAppointment] erreur Supabase:",
				error.code,
				error.message,
			);

			const msg = error.message || "";
			const code =
				// Creneau deja pris : unique_violation ou SLOT_TAKEN
				error.code === "23505" || msg.includes("SLOT_TAKEN")
					? "conflict"
					// Creneau passe ou hors disponibilites
					: msg.includes("SLOT_UNAVAILABLE") ||
					  msg.includes("PAST_SLOT")
					? "unavailable"
					// Annonce indispo / hote bloque / proprio qui reserve lui-meme
					: msg.includes("LISTING_UNAVAILABLE") ||
					  msg.includes("HOST_BLOCKED") ||
					  msg.includes("HOST_CANNOT_BOOK")
					? "forbidden"
					: "error";

			return {
				success: false,
				code,
				message: error.message,
			};
		} catch (err) {
			console.error(
				"appointmentsService.createAppointment error:",
				err,
			);
			return {
				success: false,
				code: "error",
				message: "Erreur lors de la reservation.",
			};
		}
	},

	/**
	 * Update appointment status by ID
	 */
	async updateAppointmentStatus(
		id: string,
		status:
			| "pending"
			| "confirmed"
			| "cancelled"
			| "completed",
	): Promise<boolean> {
		if (!isSupabaseConfigured()) return true;
		try {
			const targetUuid = toValidUUID(id);
			const { error } = await (supabase.from as any)(
				"appointments",
			)
				.update({
					status,
					updated_at: new Date().toISOString(),
				})
				.eq("id", targetUuid);
			if (error) throw error;
			return true;
		} catch (err) {
			console.error(
				"appointmentsService.updateAppointmentStatus error:",
				err,
			);
			return false;
		}
	},
};
