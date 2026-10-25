import { Listing } from "../../types";
import { generateUUID } from "../../utils/uuid";
import { listingsService } from "../../services/supabase/listingsService";
import {
	recordModificationLog,
	trackMarketingEvent,
} from "../../lib/analytics";

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

const STATUS_FR: Record<Listing["status"], string> = {
	published: "Publiée",
	draft: "Brouillon",
	unavailable: "Indisponible",
	sold: "Vendu",
	rented: "Loué",
	archived: "Archivé",
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

		trackMarketingEvent("publish_listing", {
			item_id: newId,
			item_name: newListingData.title,
			item_category: newListingData.categoryLabel,
			price: newListingData.price,
			city: newListingData.location.city,
		});

		recordModificationLog({
			actorName: newListingData.owner.name || "Vendeur",
			actorRole: currentUserRole || "seller",
			actionType: "listing_created",
			targetTitle: newListingData.title,
			targetId: newId,
			details: `Publication d'une nouvelle annonce (${newListingData.categoryLabel} • ${newListingData.location.city}) à ${newListingData.price.toLocaleString("fr-FR")} FCFA`,
			newValue: "Publiée",
		});

		addToast(
			"Annonce publiée avec succès ! Elle est immédiatement visible sur le site.",
			"success",
		);
	};

	const updateListing = async (
		id: string,
		updates: Partial<Listing>,
	) => {
		const existing = listings.find((item) => item.id === id);
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

		const changedFields = Object.keys(updates).join(", ");
		recordModificationLog({
			actorName: existing?.owner.name || "Utilisateur",
			actorRole: currentUserRole || "seller",
			actionType: "listing_updated",
			targetTitle: updates.title || existing?.title || `Annonce #${id.slice(0, 8)}`,
			targetId: id,
			details: `Modification des champs : ${changedFields}`,
			previousValue:
				updates.price !== undefined && existing
					? `${existing.price.toLocaleString("fr-FR")} FCFA`
					: undefined,
			newValue:
				updates.price !== undefined
					? `${updates.price.toLocaleString("fr-FR")} FCFA`
					: undefined,
		});

		addToast("Annonce mise à jour avec succès", "success");
	};

	const deleteListing = async (id: string) => {
		const existing = listings.find((item) => item.id === id);
		setListings((prev) =>
			prev.filter((item) => item.id !== id),
		);
		await listingsService.deleteListing(id);
		await refetchListings();

		recordModificationLog({
			actorName: currentUserRole === "admin" ? "Administrateur" : existing?.owner.name || "Vendeur",
			actorRole: currentUserRole || "admin",
			actionType: "listing_deleted",
			targetTitle: existing?.title || `Annonce #${id.slice(0, 8)}`,
			targetId: id,
			details: `Suppression définitive de l'annonce (${existing?.categoryLabel || "Catalogue"} • ${existing?.location.city || "Sénégal"})`,
			previousValue: existing ? STATUS_FR[existing.status] : undefined,
			newValue: "Supprimée",
		});

		addToast("Annonce supprimée", "info");
	};

	const updateListingStatus = async (
		id: string,
		status: Listing["status"],
	): Promise<boolean> => {
		const existing = listings.find((item) => item.id === id);
		const previousStatus = existing?.status;
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

		recordModificationLog({
			actorName: currentUserRole === "admin" ? "Administrateur" : existing?.owner.name || "Vendeur",
			actorRole: currentUserRole || "seller",
			actionType: "status_changed",
			targetTitle: existing?.title || `Annonce #${id.slice(0, 8)}`,
			targetId: id,
			details: `Changement de statut de l'annonce`,
			previousValue: previousStatus ? STATUS_FR[previousStatus] : undefined,
			newValue: STATUS_FR[status],
		});

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
		const existing = listings.find((item) => item.id === id);
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

		recordModificationLog({
			actorName: "Administrateur",
			actorRole: "admin",
			actionType: "listing_approved",
			targetTitle: existing?.title || `Annonce #${id.slice(0, 8)}`,
			targetId: id,
			details: "Validation et mise en ligne par la modération",
			previousValue: existing ? STATUS_FR[existing.status] : "Brouillon",
			newValue: "Publiée",
		});

		addToast("Annonce approuvée et publiée !", "success");
	};

	const rejectListing = async (id: string) => {
		const existing = listings.find((item) => item.id === id);
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

		recordModificationLog({
			actorName: "Administrateur",
			actorRole: "admin",
			actionType: "listing_rejected",
			targetTitle: existing?.title || `Annonce #${id.slice(0, 8)}`,
			targetId: id,
			details: "Refus et archivage par la modération",
			previousValue: existing ? STATUS_FR[existing.status] : "Brouillon",
			newValue: "Archivé",
		});

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
