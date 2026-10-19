import { Listing } from "../../types";
import { generateUUID } from "../../utils/uuid";
import { listingsService } from "../../services/supabase/listingsService";

interface UseListingsActionsParams {
	listings: Listing[];
	setListings: React.Dispatch<
		React.SetStateAction<Listing[]>
	>;
	currentUserId: string | undefined;
	currentUserRole: string | undefined;
	refetchListings: () => Promise<void>;
	addToast: (
		msg: string,
		type?: "success" | "error" | "info",
	) => void;
}

const LISTING_STATUS_TOAST: Partial<Record<Listing["status"], string>> = {
	published: "remise en ligne",
	unavailable: "marquée comme indisponible",
	sold: "marquée comme vendue",
	rented: "marquée comme louée",
	archived: "archivée",
	draft: "repassée en brouillon",
};


export function useListingsActions({
	listings,
	setListings,
	currentUserId,
	currentUserRole,
	refetchListings,
	addToast,
}: UseListingsActionsParams) {
	const addListing = async (
		newListingData: Omit<
			Listing,
			| "id"
			| "views"
			| "contactsCount"
			| "createdAt"
			| "status"
		>,
		customId?: string,
	) => {
		const newId = customId || generateUUID();
		// Publication directe sans modération préalable (post-modération en cas de signalement)
		const initialStatus: Listing["status"] = "published";
		const fullListing: Listing = {
			...newListingData,
			id: newId,
			status: initialStatus,
			views: 0,
			contactsCount: 0,
			createdAt: new Date().toISOString().split("T")[0],
		};
		setListings((prev) => [fullListing, ...prev]);
		await listingsService.createListing(
			newId,
			currentUserId || "",
			newListingData,
			initialStatus,
		);
		await refetchListings();
		addToast(
			"Annonce publiée avec succès ! Elle est immédiatement visible sur le site.",
			"success",
		);
	};

	const updateListing = async (
		id: string,
		updates: Partial<Listing>,
	) => {
		setListings((prev) =>
			prev.map((item) =>
				item.id === id ? { ...item, ...updates } : item,
			),
		);
		const saved = await listingsService.updateListing(
			id,
			updates,
		);
		if (!saved) {
			await refetchListings();
			addToast(
				"Impossible de sauvegarder les modifications de cette annonce.",
				"error",
			);
			return;
		}
		await refetchListings();
		addToast("Annonce mise à jour avec succès", "success");
	};

	const deleteListing = async (id: string) => {
		setListings((prev) =>
			prev.filter((item) => item.id !== id),
		);
		await listingsService.deleteListing(id);
		await refetchListings();
		addToast("Annonce supprimée", "info");
	};

	const updateListingStatus = async (
		id: string,
		status: Listing["status"],
	): Promise<boolean> => {
		const previousStatus = listings.find(
			(item) => item.id === id,
		)?.status;
		if (previousStatus === status) return true;

		// Mise à jour optimiste de l'interface
		setListings((prev) =>
			prev.map((item) =>
				item.id === id ? { ...item, status } : item,
			),
		);

		const result = await listingsService.setListingStatus(id, status);

		if (!result.ok) {
			// Retour arrière : on remet l'ancien statut affiché
			if (previousStatus) {
				setListings((prev) =>
					prev.map((item) =>
						item.id === id
							? { ...item, status: previousStatus }
							: item,
					),
				);
			}
			addToast(
				result.reason === "constraint"
					? "Ce statut n'est pas encore activé sur le serveur. Contactez l'administrateur du site."
					: result.reason === "forbidden"
						? "Vous n'avez pas l'autorisation de modifier cette annonce."
						: "Impossible de mettre à jour le statut de l'annonce. Réessayez.",
				"error",
			);
			return false;
		}

		addToast(
			`Annonce ${LISTING_STATUS_TOAST[status] ?? "mise à jour"}.`,
			"success",
		);
		return true;
	};

	const toggleListingStatus = async (id: string) => {
		const current = listings.find((item) => item.id === id)?.status;
		await updateListingStatus(
			id,
			current === "published" ? "unavailable" : "published",
		);
	};


	const approveListing = async (id: string) => {
		setListings((prev) =>
			prev.map((item) =>
				item.id === id
					? { ...item, status: "published" }
					: item,
			),
		);
		await listingsService.updateListing(id, {
			status: "published",
		});
		await refetchListings();
		addToast("Annonce approuvée et publiée !", "success");
	};

	const rejectListing = async (id: string) => {
		setListings((prev) =>
			prev.map((item) =>
				item.id === id
					? { ...item, status: "archived" }
					: item,
			),
		);
		await listingsService.updateListing(id, {
			status: "archived",
		});
		await refetchListings();
		addToast("Annonce rejetée", "error");
	};

	return {
		addListing,
		updateListing,
		deleteListing,
		toggleListingStatus,
		updateListingStatus,
		approveListing,
		rejectListing,
	};
}
