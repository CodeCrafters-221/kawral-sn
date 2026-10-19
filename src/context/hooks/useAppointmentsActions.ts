import {
	Appointment,
	AppointmentRequestResult,
	Listing,
} from "../../types";
import { generateUUID } from "../../utils/uuid";
import { isAppointmentEligible } from "../../utils/appointments";
import { appointmentsService } from "../../services/supabase/appointmentsService";

interface UseAppointmentsActionsParams {
	setAppointments: React.Dispatch<
		React.SetStateAction<Appointment[]>
	>;
	currentUserId: string | undefined;
	refetchListings: () => Promise<void>;
	addToast: (
		msg: string,
		type?: "success" | "error" | "info",
	) => void;
}

export function useAppointmentsActions({
	setAppointments,
	currentUserId,
	refetchListings,
	addToast,
}: UseAppointmentsActionsParams) {
	const requestAppointment = async (data: {
		listing: Listing;
		date: string;
		time: string;
		clientName: string;
		clientPhone: string;
		clientEmail: string;
		message: string;
	}): Promise<AppointmentRequestResult> => {
		if (!isAppointmentEligible(data.listing.category)) {
			addToast(
				"Les rendez-vous ne sont disponibles que pour l'immobilier et les véhicules.",
				"error",
			);
			return { success: false, code: "forbidden" };
		}
		const apptId = generateUUID();
		const newApp: Appointment = {
			id: apptId,
			listingId: data.listing.id,
			listingTitle: data.listing.title,
			listingImage: data.listing.images[0] || "",
			listingLocation: `${data.listing.location.neighborhood}, ${data.listing.location.city}`,
			date: data.date,
			time: data.time,
			clientId: currentUserId || "",
			clientName: data.clientName,
			clientPhone: data.clientPhone,
			clientEmail: data.clientEmail,
			sellerId: data.listing.ownerId,
			sellerName: data.listing.owner.name,
			message: data.message,
			status: "pending",
			createdAt: new Date().toISOString().split("T")[0],
		};
		const result =
			await appointmentsService.createAppointment(
				apptId,
				data.listing.id,
				currentUserId || "",
				data.listing.ownerId,
				data.date,
				data.time,
				data.message,
			);
		if (!result.success) {
			const message =
				result.code === "conflict"
					? "Ce créneau vient d'être réservé par un autre client."
					: result.code === "unavailable"
						? "Ce créneau n'est pas disponible."
						: result.code === "forbidden"
							? "Cette annonce ne peut plus recevoir de rendez-vous."
							: "Impossible de créer le rendez-vous.";
			addToast(message, "error");
			return result;
		}
		setAppointments((prev) => [newApp, ...prev]);
		await refetchListings();
		addToast(
			"Demande de rendez-vous envoyée avec succès !",
			"success",
		);
		return result;
	};

	const updateAppointmentStatus = async (
		id: string,
		status:
			| "pending"
			| "confirmed"
			| "cancelled"
			| "completed",
	) => {
		setAppointments((prev) =>
			prev.map((a) => (a.id === id ? { ...a, status } : a)),
		);
		const updated =
			await appointmentsService.updateAppointmentStatus(
				id,
				status,
			);
		if (!updated) {
			await refetchListings();
			addToast(
				"Impossible de modifier le rendez-vous.",
				"error",
			);
			return;
		}
		addToast(
			`Statut du rendez-vous mis à jour: ${status.toUpperCase()}`,
			"info",
		);
	};

	return { requestAppointment, updateAppointmentStatus };
}
