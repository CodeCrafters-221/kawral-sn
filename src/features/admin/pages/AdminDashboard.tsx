import React, { useEffect, useState } from "react";
import { useApp } from "../../../context/AppContext";
import {
	ShieldAlert,
	CheckCircle2,
	XCircle,
	AlertTriangle,
	Users,
	Eye,
	FolderTree,
	Pencil,
	Plus,
	Save,
	Trash2,
	BarChart3,
	Phone,
	Activity,
	MapPin,
	X,
	MessageSquare,
	ListFilter,
	Image as ImageIcon,
	Sparkles,
	CheckSquare,
	Square,
	TrendingUp,
	History,
} from "lucide-react";
import {
	Button,
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Tabs,
	Pagination,
	type TabItem,
} from "../../../components/ui";
import {
	adminService,
	type AdminCategory,
	type AdminRole,
	type AdminUser,
} from "../../../services/supabase/adminService";
import { recordModificationLog } from "../../../lib/analytics";
import { AdminGoogleAnalytics } from "../components/AdminGoogleAnalytics";
import { AdminModificationHistory } from "../components/AdminModificationHistory";
import type { Listing, ListingStatus } from "../../../types";

type AdminTabFilter =
	| "analytics"
	| "modifications"
	| "pending"
	| "reports"
	| "users"
	| "categories"
	| "all-listings";

export const AdminDashboard: React.FC = () => {
	const {
		currentUser,
		listings,
		reports,
		appointments,
		updateListingStatus,
		updateListing,
		deleteListing,
		dismissReport,
		addToast,
	} = useApp();

	const [filter, setFilter] =
		useState<AdminTabFilter>("analytics");
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [categories, setCategories] = useState<
		AdminCategory[]
	>([]);
	const [search, setSearch] = useState("");
	const [activePage, setActivePage] = useState(1);
	const [pageSize, setPageSize] = useState(8);
	const [categoryName, setCategoryName] = useState("");
	const [categorySlug, setCategorySlug] = useState("");
	const [editingCategoryId, setEditingCategoryId] =
		useState<string | null>(null);
	const [editingCategoryName, setEditingCategoryName] =
		useState("");
	const [editingCategorySlug, setEditingCategorySlug] =
		useState("");
	const [loadingAdminData, setLoadingAdminData] =
		useState(true);
	const [adminDataError, setAdminDataError] = useState<
		string | null
	>(null);

	// --- #6 & #7 Motif de refus & Actions groupées ---
	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [rejectListingIds, setRejectListingIds] = useState<string[]>([]);
	const [rejectReason, setRejectReason] = useState("");
	const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);

	// --- #2 Prévisualisation & #3 Amélioration IA ---
	const [previewListing, setPreviewListing] = useState<Listing | null>(null);
	const [isImprovingAi, setIsImprovingAi] = useState(false);
	const [editingDesc, setEditingDesc] = useState<string | null>(null);

	// --- #4 Catalogue complet ---
	const [statusFilter, setStatusFilter] = useState<ListingStatus | "all">("all");

	const pendingListings = listings.filter(
		(item) => item.status === "draft",
	);
	const activeListings = listings.filter(
		(item) => item.status === "published",
	);
	const normalizedSearch = search.trim().toLowerCase();
	const filteredPendingListings = pendingListings.filter(
		(listing) =>
			`${listing.title} ${listing.owner.name} ${listing.categoryLabel} ${listing.location.city}`
				.toLowerCase()
				.includes(normalizedSearch),
	);

	// --- Filtered all-listings (tab #4) ---
	const filteredAllListings = listings
		.filter((l) => statusFilter === "all" || l.status === statusFilter)
		.filter((l) =>
			`${l.title} ${l.owner.name} ${l.categoryLabel} ${l.location.city}`
				.toLowerCase()
				.includes(normalizedSearch),
	);
	const filteredReports = reports.filter((report) =>
		`${report.listingTitle} ${report.reason} ${report.details}`
			.toLowerCase()
			.includes(normalizedSearch),
	);
	const filteredUsers = users.filter((user) =>
		`${user.full_name || ""} ${user.phone || ""} ${user.role}`
			.toLowerCase()
			.includes(normalizedSearch),
	);
	const roleCounts: Record<AdminRole, number> = {
		client: users.filter((user) => user.role === "client")
			.length,
		vendeur: users.filter((user) => user.role === "vendeur")
			.length,
		admin: users.filter((user) => user.role === "admin")
			.length,
	};
	const totalViews = listings.reduce(
		(total, listing) => total + listing.views,
		0,
	);
	const categoryCounts = categories.map((category) => ({
		...category,
		listingCount: listings.filter(
			(listing) => listing.categoryLabel === category.name,
		).length,
	}));
	const maxCategoryListings = Math.max(
		1,
		...categoryCounts.map(
			(category) => category.listingCount,
		),
	);
	const filteredCategories = categories.filter((category) =>
		`${category.name} ${category.slug}`
			.toLowerCase()
			.includes(normalizedSearch),
	);

	// --- Analytique enrichie : Top localisations ---
	const locationMap = listings.reduce((acc, l) => {
		const label = l.location.neighborhood
			? `${l.location.neighborhood}, ${l.location.city}`
			: l.location.city || "Sénégal";
		acc[label] = (acc[label] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	const topLocations = Object.entries(locationMap)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5);
	const maxLocationCount = Math.max(1, ...topLocations.map(([, count]) => count));

	// --- Analytique enrichie : Volumes & Transactions ---
	const rentListings = listings.filter((l) => l.transactionType === "rent");
	const saleListings = listings.filter((l) => l.transactionType === "sale");
	const rentAvgPrice = rentListings.length
		? Math.round(rentListings.reduce((sum, l) => sum + l.price, 0) / rentListings.length)
		: 0;
	const totalSaleVolume = saleListings.reduce((sum, l) => sum + l.price, 0);
	const approvalRate = listings.length
		? Math.round((activeListings.length / listings.length) * 100)
		: 100;

	const pagedItems = <T,>(items: T[]) =>
		items.slice(
			(activePage - 1) * pageSize,
			activePage * pageSize,
		);
	const pagedPendingListings = pagedItems(
		filteredPendingListings,
	);
	const pagedReports = pagedItems(filteredReports);
	const pagedUsers = pagedItems(filteredUsers);
	const pagedCategories = pagedItems(filteredCategories);

	useEffect(() => {
		setActivePage(1);
	}, [filter, search, pageSize]);

	useEffect(() => {
		let cancelled = false;

		const loadAdminData = async () => {
			if (!currentUser || currentUser.role !== "admin")
				return;
			setLoadingAdminData(true);
			setAdminDataError(null);
			const [usersResult, categoriesResult] =
				await Promise.all([
					adminService.getUsers(),
					adminService.getCategories(),
				]);
			if (cancelled) return;
			if (usersResult.error || categoriesResult.error) {
				setAdminDataError(
					usersResult.error || categoriesResult.error,
				);
			}
			setUsers(usersResult.data);
			setCategories(categoriesResult.data);
			setLoadingAdminData(false);
		};

		loadAdminData();
		return () => {
			cancelled = true;
		};
	}, [currentUser]);

	const handleApprove = (id: string) => {
		const target = listings.find((l) => l.id === id);
		updateListingStatus(id, "published");
		setSelectedPendingIds((prev) => prev.filter((i) => i !== id));
		recordModificationLog({
			actorName: currentUser?.name || "Administrateur",
			actorRole: "admin",
			actionType: "listing_approved",
			targetTitle: target?.title || `Annonce #${id.slice(0, 8)}`,
			targetId: id,
			details: "Approbation et mise en ligne depuis le panneau de modération",
			previousValue: "Brouillon",
			newValue: "Publiée",
		});
		addToast("Annonce approuvée et publiée !", "success");
	};

	// --- #6 & #7 Motif de refus & Actions groupées ---
	const openRejectModal = (id: string) => {
		setRejectListingIds([id]);
		setRejectReason("");
		setRejectModalOpen(true);
	};

	const openBulkRejectModal = () => {
		if (selectedPendingIds.length === 0) return;
		setRejectListingIds(selectedPendingIds);
		setRejectReason("");
		setRejectModalOpen(true);
	};

	const confirmReject = () => {
		if (rejectListingIds.length === 0) return;
		rejectListingIds.forEach((id) => {
			const target = listings.find((l) => l.id === id);
			updateListingStatus(id, "archived");
			recordModificationLog({
				actorName: currentUser?.name || "Administrateur",
				actorRole: "admin",
				actionType: "listing_rejected",
				targetTitle: target?.title || `Annonce #${id.slice(0, 8)}`,
				targetId: id,
				details: `Refus de l'annonce${rejectReason ? ` — Motif : ${rejectReason}` : ""}`,
				previousValue: "Brouillon",
				newValue: "Archivé",
			});
		});
		addToast(
			`${rejectListingIds.length} annonce(s) refusée(s)${rejectReason ? ` — Motif : ${rejectReason}` : "."}`,
			"info",
		);
		setSelectedPendingIds((prev) =>
			prev.filter((id) => !rejectListingIds.includes(id)),
		);
		setRejectModalOpen(false);
		setRejectListingIds([]);
		setRejectReason("");
	};

	const handleReject = (id: string) => {
		openRejectModal(id);
	};

	const handleBulkApprove = () => {
		if (selectedPendingIds.length === 0) return;
		selectedPendingIds.forEach((id) => {
			const target = listings.find((l) => l.id === id);
			updateListingStatus(id, "published");
			recordModificationLog({
				actorName: currentUser?.name || "Administrateur",
				actorRole: "admin",
				actionType: "listing_approved",
				targetTitle: target?.title || `Annonce #${id.slice(0, 8)}`,
				targetId: id,
				details: "Approbation groupée et publication immédiate",
				previousValue: "Brouillon",
				newValue: "Publiée",
			});
		});
		addToast(
			`${selectedPendingIds.length} annonce(s) approuvée(s) et publiée(s) !`,
			"success",
		);
		setSelectedPendingIds([]);
	};

	const toggleSelectPending = (id: string) => {
		setSelectedPendingIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	const toggleSelectAllPending = () => {
		const pageIds = pagedPendingListings.map((l) => l.id);
		const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedPendingIds.includes(id));
		if (allSelected) {
			setSelectedPendingIds((prev) => prev.filter((id) => !pageIds.includes(id)));
		} else {
			setSelectedPendingIds((prev) => Array.from(new Set([...prev, ...pageIds])));
		}
	};

	// --- #3 Amélioration IA de la description ---
	const handleImproveWithAi = async () => {
		if (!previewListing) return;
		setIsImprovingAi(true);
		try {
			const res = await fetch("/api/gemini/automate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					taskType: "generate-description",
					inputs: {
						existingDraft: editingDesc ?? previewListing.description,
						mode: "improve",
						propertyType: previewListing.categoryLabel,
						location: `${previewListing.location.city}${previewListing.location.neighborhood ? ` (${previewListing.location.neighborhood})` : ""}`,
						transactionType: previewListing.transactionType === "rent" ? "Location" : "Vente",
						tone: "Professionnel & Vendeur",
						length: "medium",
					},
				}),
			});
			const data = await res.json();
			if (data.success && data.result) {
				setEditingDesc(data.result);
				addToast("Description reformulée avec succès par l'IA !", "success");
			} else {
				addToast(data.error || "Impossible d'améliorer la description.", "error");
			}
		} catch {
			addToast("Erreur lors de l'appel au service IA.", "error");
		} finally {
			setIsImprovingAi(false);
		}
	};

	const handleSaveImprovedDesc = async () => {
		if (!previewListing || editingDesc === null) return;
		const oldLen = (previewListing.description || "").length;
		await updateListing(previewListing.id, { description: editingDesc });
		recordModificationLog({
			actorName: currentUser?.name || "Administrateur",
			actorRole: "admin",
			actionType: "ai_description",
			targetTitle: previewListing.title,
			targetId: previewListing.id,
			details: "Reformulation et enregistrement de la description via l'assistant IA",
			previousValue: `${oldLen} caractères`,
			newValue: `${editingDesc.length} caractères`,
		});
		setPreviewListing((prev) =>
			prev ? { ...prev, description: editingDesc } : null,
		);
		setEditingDesc(null);
		addToast("Description mise à jour et enregistrée !", "success");
	};

	const roleLabels: Record<AdminRole, string> = {
		client: "Client",
		vendeur: "Vendeur",
		admin: "Admin",
	};

	const handleRoleChange = async (
		user: AdminUser,
		role: AdminRole,
	) => {
		if (user.id === currentUser?.id) {
			addToast(
				"Vous ne pouvez pas modifier votre propre rôle.",
				"error",
			);
			return;
		}
		const previousRole = user.role;
		const result = await adminService.updateUserRole(
			user.id,
			role,
		);
		if (!result.success) {
			addToast(
				result.error || "Impossible de modifier le rôle.",
				"error",
			);
			return;
		}
		setUsers((previous) =>
			previous.map((item) =>
				item.id === user.id ? { ...item, role } : item,
			),
		);
		recordModificationLog({
			actorName: currentUser?.name || "Administrateur",
			actorRole: "admin",
			actionType: "role_updated",
			targetTitle: user.full_name || user.phone || "Utilisateur",
			targetId: user.id,
			details: "Modification du rôle utilisateur depuis l'administration",
			previousValue: roleLabels[previousRole],
			newValue: roleLabels[role],
		});
		addToast("Rôle utilisateur mis à jour.", "success");
	};

	const handleCreateCategory = async (
		event: React.FormEvent,
	) => {
		event.preventDefault();
		const name = categoryName.trim();
		const slug = categorySlug.trim().toLowerCase();
		if (!name || !slug) {
			addToast(
				"Le nom et le slug sont obligatoires.",
				"error",
			);
			return;
		}
		const result = await adminService.createCategory({
			name,
			slug,
		});
		if (result.error || !result.data) {
			addToast(
				result.error || "Impossible de créer la catégorie.",
				"error",
			);
			return;
		}
		setCategories((previous) =>
			[...previous, result.data!].sort((a, b) =>
				a.name.localeCompare(b.name),
			),
		);
		recordModificationLog({
			actorName: currentUser?.name || "Administrateur",
			actorRole: "admin",
			actionType: "category_updated",
			targetTitle: `Catégorie ${name}`,
			details: `Création d'une nouvelle catégorie (${slug})`,
			newValue: name,
		});
		setCategoryName("");
		setCategorySlug("");
		addToast("Catégorie créée.", "success");
	};

	const handleUpdateCategory = async (
		categoryId: string,
	) => {
		const name = editingCategoryName.trim();
		const slug = editingCategorySlug.trim().toLowerCase();
		if (!name || !slug) {
			addToast(
				"Le nom et le slug sont obligatoires.",
				"error",
			);
			return;
		}
		const existingCat = categories.find((c) => c.id === categoryId);
		const result = await adminService.updateCategory(
			categoryId,
			{ name, slug },
		);
		if (!result.success) {
			addToast(
				result.error ||
					"Impossible de modifier la catégorie.",
				"error",
			);
			return;
		}
		setCategories((previous) =>
			previous.map((item) =>
				item.id === categoryId
					? { ...item, name, slug }
					: item,
			),
		);
		recordModificationLog({
			actorName: currentUser?.name || "Administrateur",
			actorRole: "admin",
			actionType: "category_updated",
			targetTitle: `Catégorie ${name}`,
			targetId: categoryId,
			details: `Modification du nom ou du slug de la catégorie`,
			previousValue: existingCat?.name,
			newValue: name,
		});
		setEditingCategoryId(null);
		addToast("Catégorie mise à jour.", "success");
	};

	const handleDeleteCategory = async (
		category: AdminCategory,
	) => {
		if (
			!window.confirm(
				`Supprimer la catégorie « ${category.name} » ?`,
			)
		)
			return;
		const result = await adminService.deleteCategory(
			category.id,
		);
		if (!result.success) {
			addToast(
				result.error ||
					"Impossible de supprimer la catégorie.",
				"error",
			);
			return;
		}
		setCategories((previous) =>
			previous.filter((item) => item.id !== category.id),
		);
		recordModificationLog({
			actorName: currentUser?.name || "Administrateur",
			actorRole: "admin",
			actionType: "category_updated",
			targetTitle: `Catégorie ${category.name}`,
			targetId: category.id,
			details: "Suppression de la catégorie",
			previousValue: category.name,
			newValue: "Supprimée",
		});
		addToast("Catégorie supprimée.", "info");
	};

	const searchPlaceholder =
		filter === "categories"
			? "Rechercher une catégorie ou un slug"
			: filter === "users"
				? "Rechercher un utilisateur, un téléphone ou un rôle"
				: filter === "reports"
					? "Rechercher un signalement"
					: filter === "modifications"
						? "Rechercher une modification, une annonce ou un auteur"
						: filter === "all-listings"
							? "Rechercher dans toutes les annonces"
							: "Rechercher une annonce en attente";

	const tabItems: TabItem[] = [
		{
			id: "analytics",
			label: "Google Analytics & Trafic",
			icon: <BarChart3 className="w-3.5 h-3.5 text-kawral-orange" />,
		},
		{
			id: "modifications",
			label: "Journal des modifications",
			icon: <History className="w-3.5 h-3.5 text-kawral-green" />,
		},
		{
			id: "all-listings",
			label: "Catalogue complet",
			count: listings.length,
			icon: <ListFilter className="w-3.5 h-3.5" />,
		},
		{
			id: "pending",
			label: "Validation en attente",
			count: pendingListings.length,
			icon: <AlertTriangle className="w-3.5 h-3.5" />,
		},
		{
			id: "reports",
			label: "Signalements reçus",
			count: reports.length,
			icon: (
				<ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
			),
		},
		{
			id: "users",
			label: "Utilisateurs",
			count: users.length,
			icon: <Users className="w-3.5 h-3.5" />,
		},
		{
			id: "categories",
			label: "Catégories",
			count: categories.length,
			icon: <FolderTree className="w-3.5 h-3.5" />,
		},
	];

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 pb-20 space-y-8">
			{/* Admin Header */}
			<div className="bg-kawral-darkgreen text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-2">
				<div className="flex items-center gap-2">
					<ShieldAlert className="w-6 h-6 text-kawral-orange" />
					<h1 className="text-xl sm:text-2xl font-black">
						Panneau de Modération, Analytics & Administration Kawral
					</h1>
				</div>
				<p className="text-xs text-slate-300">
					Suivez en direct les performances Google Analytics (trafic Aujourd'hui, 7j, 30j, temps réel, marketing et infos visiteurs), consultez le journal paginé des modifications et modérez la marketplace.
				</p>
			</div>

			{/* Admin Stats using Card */}
			<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
				<Card className="hover:shadow-sm transition-shadow">
					<CardContent className="p-5">
						<span className="text-xs font-semibold text-kawral-muted">
							Utilisateurs
						</span>
						<p className="text-3xl font-black text-kawral-green mt-1">
							{users.length}
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-sm transition-shadow">
					<CardContent className="p-5">
						<span className="text-xs font-semibold text-kawral-muted">
							En attente de validation
						</span>
						<p className="text-3xl font-black text-kawral-orange mt-1">
							{pendingListings.length}
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-sm transition-shadow">
					<CardContent className="p-5">
						<span className="text-xs font-semibold text-kawral-muted">
							Annonces en ligne
						</span>
						<p className="text-3xl font-black text-kawral-green mt-1">
							{activeListings.length}
						</p>
					</CardContent>
				</Card>

				<Card className="hover:shadow-sm transition-shadow">
					<CardContent className="p-5">
						<span className="text-xs font-semibold text-kawral-muted">
							Signalements d'utilisateurs
						</span>
						<p className="text-3xl font-black text-rose-600 mt-1">
							{reports.length}
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart3 className="w-4 h-4 text-kawral-green" />
							Répartition de la communauté
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{(Object.keys(roleCounts) as AdminRole[]).map(
							(role) => {
								const percentage = users.length
									? Math.round(
											(roleCounts[role] / users.length) *
												100,
										)
									: 0;
								return (
									<div key={role} className="space-y-1.5">
										<div className="flex justify-between text-xs font-bold text-kawral-dark">
											<span>{roleLabels[role]}</span>
											<span>
												{roleCounts[role]} ({percentage}%)
											</span>
										</div>
										<div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
											<div
												className="h-full rounded-full bg-kawral-green transition-all"
												style={{ width: `${percentage}%` }}
											/>
										</div>
									</div>
								);
							},
						)}
						<div className="grid grid-cols-2 gap-3 pt-2">
							<div className="rounded-2xl bg-kawral-ivory p-3">
								<p className="text-[11px] text-kawral-muted">
									Vues cumulées
								</p>
								<p className="text-xl font-black text-kawral-dark">
									{totalViews.toLocaleString("fr-FR")}
								</p>
							</div>
							<div className="rounded-2xl bg-kawral-ivory p-3">
								<p className="text-[11px] text-kawral-muted">
									Rendez-vous
								</p>
								<p className="text-xl font-black text-kawral-dark">
									{appointments.length}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Activity className="w-4 h-4 text-kawral-orange" />
							Activité de la marketplace
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-1.5">
							<div className="flex justify-between text-xs font-bold text-kawral-dark">
								<span>Annonces publiées</span>
								<span>{activeListings.length}</span>
							</div>
							<div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
								<div
									className="h-full rounded-full bg-kawral-green"
									style={{
										width: `${Math.min(100, (activeListings.length / Math.max(1, listings.length)) * 100)}%`,
									}}
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<div className="flex justify-between text-xs font-bold text-kawral-dark">
								<span>En attente de validation</span>
								<span>{pendingListings.length}</span>
							</div>
							<div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
								<div
									className="h-full rounded-full bg-kawral-orange"
									style={{
										width: `${Math.min(100, (pendingListings.length / Math.max(1, listings.length)) * 100)}%`,
									}}
								/>
							</div>
						</div>
						<div className="space-y-3 pt-1">
							<p className="text-xs font-bold text-kawral-dark">
								Annonces par catégorie
							</p>
							{categoryCounts.length === 0 ? (
								<p className="text-xs text-kawral-muted">
									Aucune donnée disponible.
								</p>
							) : (
								categoryCounts
									.slice(0, 6)
									.map((category) => (
										<div
											key={category.id}
											className="flex items-center gap-3"
										>
											<span className="w-24 truncate text-[11px] text-kawral-muted">
												{category.name}
											</span>
											<div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
												<div
													className="h-full rounded-full bg-kawral-orange/80"
													style={{
														width: `${(category.listingCount / maxCategoryListings) * 100}%`,
													}}
												/>
											</div>
											<span className="w-5 text-right text-[11px] font-bold">
												{category.listingCount}
											</span>
										</div>
									))
							)}
						</div>
					</CardContent>
				</Card>

				{/* Top Localisations */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="w-4 h-4 text-kawral-orange" />
							Top localisations & quartiers
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{topLocations.length === 0 ? (
							<p className="text-xs text-kawral-muted">
								Aucune donnée de localisation disponible.
							</p>
						) : (
							<div className="space-y-3">
								{topLocations.map(([loc, count]) => (
									<div key={loc} className="flex items-center gap-3">
										<span className="w-36 truncate text-[11px] font-medium text-kawral-dark">
											{loc}
										</span>
										<div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
											<div
												className="h-full rounded-full bg-kawral-green transition-all"
												style={{
													width: `${(count / maxLocationCount) * 100}%`,
												}}
											/>
										</div>
										<span className="w-8 text-right text-[11px] font-bold text-kawral-dark">
											{count}
										</span>
									</div>
								))}
							</div>
						)}
						<div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-kawral-muted">
							<span>Taux d'approbation global</span>
							<span className="font-bold text-emerald-600">
								{approvalRate}% des annonces en ligne
							</span>
						</div>
					</CardContent>
				</Card>

				{/* Répartition Vente vs Location & Économie */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="w-4 h-4 text-kawral-green" />
							Transactions & Volumes financiers
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex justify-between text-xs font-bold text-kawral-dark">
								<span className="flex items-center gap-1.5">
									<span className="w-2.5 h-2.5 rounded-full bg-kawral-green inline-block" />
									Ventes ({saleListings.length})
								</span>
								<span className="flex items-center gap-1.5">
									<span className="w-2.5 h-2.5 rounded-full bg-kawral-orange inline-block" />
									Locations ({rentListings.length})
								</span>
							</div>
							<div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
								<div
									className="h-full bg-kawral-green transition-all"
									style={{
										width: `${listings.length ? (saleListings.length / listings.length) * 100 : 50}%`,
									}}
								/>
								<div
									className="h-full bg-kawral-orange transition-all"
									style={{
										width: `${listings.length ? (rentListings.length / listings.length) * 100 : 50}%`,
									}}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3 pt-2">
							<div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-3">
								<p className="text-[11px] text-emerald-800 font-semibold">
									Loyer mensuel moyen
								</p>
								<p className="text-base sm:text-lg font-black text-kawral-dark mt-0.5">
									{rentAvgPrice.toLocaleString("fr-FR")} FCFA
								</p>
							</div>
							<div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-3">
								<p className="text-[11px] text-amber-800 font-semibold">
									Volume estimé des ventes
								</p>
								<p className="text-base sm:text-lg font-black text-kawral-dark mt-0.5">
									{totalSaleVolume > 1_000_000_000
										? `${(totalSaleVolume / 1_000_000_000).toFixed(1)} Mrd FCFA`
										: `${Math.round(totalSaleVolume / 1_000_000)} M FCFA`}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filter Tabs using Tabs */}
			<Tabs
				items={tabItems}
				activeId={filter}
				onChange={(id) =>
					setFilter(id as AdminTabFilter)
				}
				variant="pills"
			/>

			{filter !== "analytics" && (
				<div className="max-w-xl">
					<Input
						value={search}
						onChange={(event) =>
							setSearch(event.target.value)
						}
						placeholder={searchPlaceholder}
					/>
				</div>
			)}

			{adminDataError && (
				<Card className="border-rose-200">
					<CardContent className="p-4 text-sm text-rose-600">
						{adminDataError}
					</CardContent>
				</Card>
			)}

			{/* ── Onglet Google Analytics & Trafic ── */}
			{filter === "analytics" && <AdminGoogleAnalytics />}

			{/* ── Onglet Journal paginé des modifications ── */}
			{filter === "modifications" && (
				<AdminModificationHistory
					listings={listings}
					searchQuery={search}
				/>
			)}

			{loadingAdminData &&
				(filter === "users" || filter === "categories") && (
					<Card>
						<CardContent className="p-8 text-center text-xs text-kawral-muted">
							Chargement des données administratives...
						</CardContent>
					</Card>
				)}

			{filter === "users" && !loadingAdminData && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="w-4 h-4 text-kawral-green" />
							Utilisateurs
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0 overflow-x-auto">
						{filteredUsers.length === 0 ? (
							<p className="p-8 text-center text-xs text-kawral-muted">
								Aucun utilisateur trouvé.
							</p>
						) : (
							<table className="w-full text-left text-xs">
								<thead className="bg-kawral-ivory text-kawral-muted">
									<tr>
										<th className="p-4">Utilisateur</th>
										<th className="p-4">Téléphone</th>
										<th className="p-4">Rôle</th>
										<th className="p-4">Créé le</th>
									</tr>
								</thead>
								<tbody>
									{pagedUsers.map((user) => (
										<tr
											key={user.id}
											className="border-t border-kawral-border"
										>
											<td className="p-4 font-bold text-kawral-dark">
												{user.full_name || "Sans nom"}
											</td>
											<td className="p-4">
												<div className="flex items-center gap-2">
													<Phone className="w-3.5 h-3.5 text-kawral-green" />
													<span>
														{user.phone ||
															"Téléphone non renseigné"}
													</span>
												</div>
											</td>
											<td className="p-4">
												<select
													value={user.role}
													disabled={
														user.id === currentUser?.id
													}
													onChange={(event) =>
														handleRoleChange(
															user,
															event.target
																.value as AdminRole,
														)
													}
													className="rounded-xl border border-kawral-border bg-kawral-ivory px-3 py-2 text-xs font-semibold max-w-full truncate"
												>
													<option value="client">
														{roleLabels.client}
													</option>
													<option value="vendeur">
														{roleLabels.vendeur}
													</option>
													<option value="admin">
														{roleLabels.admin}
													</option>
												</select>
											</td>
											<td className="p-4">
												{new Date(
													user.created_at,
												).toLocaleDateString("fr-FR")}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
						<Pagination
							page={activePage}
							totalItems={filteredUsers.length}
							pageSize={pageSize}
							onPageChange={setActivePage}
							onPageSizeChange={setPageSize}
							pageSizeOptions={[8, 16, 32]}
							itemLabel="utilisateurs"
						/>
					</CardContent>
				</Card>
			)}

			{filter === "categories" && !loadingAdminData && (
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FolderTree className="w-4 h-4 text-kawral-green" />
								Nouvelle catégorie
							</CardTitle>
						</CardHeader>
						<CardContent>
							<form
								onSubmit={handleCreateCategory}
								className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
							>
								<Input
									label="Nom"
									value={categoryName}
									onChange={(event) =>
										setCategoryName(event.target.value)
									}
									placeholder="Ex. Appartement"
								/>
								<Input
									label="Slug"
									value={categorySlug}
									onChange={(event) =>
										setCategorySlug(event.target.value)
									}
									placeholder="appartement"
								/>
								<Button
									type="submit"
									leftIcon={<Plus className="w-4 h-4" />}
								>
									Créer
								</Button>
							</form>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-0 overflow-x-auto">
							{categories.length === 0 ? (
								<p className="p-8 text-center text-xs text-kawral-muted">
									Aucune catégorie.
								</p>
							) : (
								<table className="w-full text-left text-xs">
									<thead className="bg-kawral-ivory text-kawral-muted">
										<tr>
											<th className="p-4">Nom</th>
											<th className="p-4">Slug</th>
											<th className="p-4 text-right">
												Actions
											</th>
										</tr>
									</thead>
									<tbody>
										{pagedCategories.map((category) => (
											<tr
												key={category.id}
												className="border-t border-kawral-border"
											>
												{editingCategoryId ===
												category.id ? (
													<>
														<td className="p-4">
															<Input
																value={editingCategoryName}
																onChange={(event) =>
																	setEditingCategoryName(
																		event.target.value,
																	)
																}
															/>
														</td>
														<td className="p-4">
															<Input
																value={editingCategorySlug}
																onChange={(event) =>
																	setEditingCategorySlug(
																		event.target.value,
																	)
																}
															/>
														</td>
														<td className="p-4 text-right">
															<Button
																size="sm"
																onClick={() =>
																	handleUpdateCategory(
																		category.id,
																	)
																}
																leftIcon={
																	<Save className="w-4 h-4" />
																}
															>
																Enregistrer
															</Button>
														</td>
													</>
												) : (
													<>
														<td className="p-4 font-bold text-kawral-dark">
															{category.name}
														</td>
														<td className="p-4 text-kawral-muted">
															{category.slug}
														</td>
														<td className="p-4 text-right space-x-2">
															<Button
																variant="ghost"
																size="sm"
																onClick={() => {
																	setEditingCategoryId(
																		category.id,
																	);
																	setEditingCategoryName(
																		category.name,
																	);
																	setEditingCategorySlug(
																		category.slug,
																	);
																}}
																leftIcon={
																	<Pencil className="w-4 h-4" />
																}
															>
																Modifier
															</Button>
															<Button
																variant="ghost"
																size="sm"
																onClick={() =>
																	handleDeleteCategory(
																		category,
																	)
																}
																leftIcon={
																	<Trash2 className="w-4 h-4 text-rose-500" />
																}
															>
																Supprimer
															</Button>
														</td>
													</>
												)}
											</tr>
										))}
									</tbody>
								</table>
							)}
							<Pagination
								page={activePage}
								totalItems={filteredCategories.length}
								pageSize={pageSize}
								onPageChange={setActivePage}
								onPageSizeChange={setPageSize}
								pageSizeOptions={[8, 16, 32]}
								itemLabel="catégories"
							/>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Moderation List */}
			{filter === "pending" && (
				<div className="space-y-4">
					{pendingListings.length === 0 ? (
						<Card>
							<CardContent className="p-8 text-center text-xs text-kawral-muted">
								Aucune annonce en attente de validation pour le moment.
							</CardContent>
						</Card>
					) : (
						<>
							{/* --- #7 Barre d'actions groupées --- */}
							<div className="flex flex-wrap items-center justify-between gap-3 bg-kawral-ivory/90 border border-kawral-border p-3.5 rounded-2xl">
								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={toggleSelectAllPending}
										className="flex items-center gap-2 text-xs font-bold text-kawral-dark hover:text-kawral-green transition-colors cursor-pointer select-none"
									>
										{pagedPendingListings.length > 0 &&
										pagedPendingListings.every((l) =>
											selectedPendingIds.includes(l.id),
										) ? (
											<CheckSquare className="w-4 h-4 text-kawral-green" />
										) : (
											<Square className="w-4 h-4 text-kawral-muted" />
										)}
										<span>
											Tout sélectionner sur cette page ({pagedPendingListings.length})
										</span>
									</button>
									{selectedPendingIds.length > 0 && (
										<span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
											{selectedPendingIds.length} sélectionnée(s)
										</span>
									)}
								</div>

								{selectedPendingIds.length > 0 && (
									<div className="flex items-center gap-2">
										<Button
											variant="primary"
											size="sm"
											onClick={handleBulkApprove}
											leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
											className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600 text-xs"
										>
											Approuver la sélection ({selectedPendingIds.length})
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={openBulkRejectModal}
											leftIcon={<XCircle className="w-3.5 h-3.5" />}
											className="text-xs"
										>
											Refuser la sélection ({selectedPendingIds.length})
										</Button>
									</div>
								)}
							</div>

							{pagedPendingListings.map((item) => {
								const isSelected = selectedPendingIds.includes(item.id);
								return (
									<Card
										key={item.id}
										className={`transition-all ${
											isSelected
												? "ring-2 ring-kawral-green bg-emerald-50/20"
												: "hover:shadow-sm"
										}`}
									>
										<CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
											<div className="flex items-center gap-3">
												<button
													type="button"
													onClick={() => toggleSelectPending(item.id)}
													className="text-kawral-muted hover:text-kawral-green transition-colors cursor-pointer shrink-0"
													aria-label={isSelected ? "Désélectionner" : "Sélectionner"}
												>
													{isSelected ? (
														<CheckSquare className="w-5 h-5 text-kawral-green" />
													) : (
														<Square className="w-5 h-5 text-slate-300" />
													)}
												</button>

												<img
													src={item.images[0] || ""}
													alt=""
													onError={(e) => {
														(e.target as HTMLImageElement).src =
															"https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";
													}}
													className="w-16 h-16 rounded-2xl object-cover shrink-0"
												/>
												<div className="min-w-0 flex-1">
													<Badge
														variant="accent"
														size="sm"
														className="mb-1"
													>
														{item.categoryLabel}
													</Badge>
													<h4
														title={item.title}
														className="font-bold text-sm text-kawral-dark line-clamp-2 break-words [overflow-wrap:anywhere]"
													>
														{item.title}
													</h4>
													<p className="text-xs text-kawral-muted">
														{item.location.neighborhood},{" "}
														{item.location.city} •{" "}
														{item.price.toLocaleString("fr-FR")}{" "}
														FCFA
													</p>
													<p className="text-[11px] text-kawral-muted mt-0.5 font-medium">
														Vendeur: {item.owner.name}
													</p>
												</div>
											</div>

											<div className="flex items-center gap-2 self-end sm:self-center">
												<Button
													variant="outline"
													size="sm"
													onClick={() => setPreviewListing(item)}
													leftIcon={
														<Eye className="w-4 h-4" />
													}
												>
													Voir
												</Button>

												<Button
													variant="primary"
													size="sm"
													onClick={() => handleApprove(item.id)}
													leftIcon={
														<CheckCircle2 className="w-4 h-4" />
													}
													className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600"
												>
													Approuver
												</Button>

												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleReject(item.id)}
													leftIcon={
														<XCircle className="w-4 h-4" />
													}
												>
													Refuser
												</Button>
											</div>
										</CardContent>
									</Card>
								);
							})}
						</>
					)}
					<Pagination
						page={activePage}
						totalItems={filteredPendingListings.length}
						pageSize={pageSize}
						onPageChange={setActivePage}
						onPageSizeChange={setPageSize}
						pageSizeOptions={[8, 16, 32]}
						itemLabel="annonces en attente"
						className="rounded-2xl border border-kawral-border"
					/>
				</div>
			)}

			{filter === "reports" && (
				<div className="space-y-4">
					{reports.length === 0 ? (
						<Card>
							<CardContent className="p-8 text-center text-xs text-kawral-muted">
								Aucun signalement en attente.
							</CardContent>
						</Card>
					) : (
						pagedReports.map((rep) => (
							<Card
								key={rep.id}
								className="border-rose-200 hover:shadow-sm transition-shadow"
							>
								<CardContent className="p-5 space-y-2">
									<div className="flex items-center justify-between text-xs">
										<Badge variant="destructive" size="sm">
											Motif: {rep.reason}
										</Badge>
										<span className="text-kawral-muted text-[11px]">
											{rep.createdAt}
										</span>
									</div>
									<h4
										title={rep.listingTitle}
										className="font-bold text-sm text-kawral-dark line-clamp-2 break-words"
									>
										{rep.listingTitle}
									</h4>
									<p className="text-xs text-kawral-muted">
										{rep.details}
									</p>
									<div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
										<Button
											variant="outline"
											size="sm"
											onClick={() => dismissReport(rep.id)}
											className="text-xs"
										>
											Classer sans suite
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => {
												if (
													window.confirm(
														`Supprimer définitivement l'annonce signalée « ${rep.listingTitle} » ?`,
													)
												) {
													deleteListing(rep.listingId);
													dismissReport(rep.id);
												}
											}}
											leftIcon={<Trash2 className="w-3.5 h-3.5" />}
											className="text-xs"
										>
											Supprimer l'annonce
										</Button>
									</div>
								</CardContent>
							</Card>
						))
					)}
					<Pagination
						page={activePage}
						totalItems={filteredReports.length}
						pageSize={pageSize}
						onPageChange={setActivePage}
						onPageSizeChange={setPageSize}
						pageSizeOptions={[8, 16, 32]}
						itemLabel="signalements"
						className="rounded-2xl border border-kawral-border"
					/>
				</div>
			)}

			{/* --- #4 Catalogue complet --- */}
			{filter === "all-listings" && (
				<div className="space-y-4">
					{/* Status filter pills */}
					<div className="flex flex-wrap gap-2">
						{(["all", "published", "draft", "unavailable", "sold", "rented", "archived"] as const).map((st) => {
							const labels: Record<string, string> = { all: "Tout", published: "Publiée", draft: "Brouillon", unavailable: "Indisponible", sold: "Vendu", rented: "Loué", archived: "Archivé" };
							const count = st === "all" ? listings.length : listings.filter((l) => l.status === st).length;
							return (
								<button
									key={st}
									type="button"
									onClick={() => { setStatusFilter(st); setActivePage(1); }}
									className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
										statusFilter === st
											? "bg-kawral-green text-white"
											: "bg-kawral-ivory text-kawral-muted hover:bg-slate-200"
									}`}
								>
									{labels[st]} ({count})
								</button>
							);
						})}
					</div>

					{filteredAllListings.length === 0 ? (
						<Card>
							<CardContent className="p-8 text-center text-xs text-kawral-muted">
								Aucune annonce trouvée.
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="p-0 overflow-x-auto">
								<table className="w-full text-left text-xs">
									<thead className="bg-kawral-ivory text-kawral-muted">
										<tr>
											<th className="p-4">Annonce</th>
											<th className="p-4">Catégorie</th>
											<th className="p-4">Prix (FCFA)</th>
											<th className="p-4">Statut</th>
											<th className="p-4">Vues</th>
											<th className="p-4 text-right">Actions</th>
										</tr>
									</thead>
									<tbody>
										{pagedItems(filteredAllListings).map((item) => {
											return (
												<tr key={item.id} className="border-t border-kawral-border">
													<td className="p-4">
														<div className="flex items-center gap-3">
															<img
																src={item.images[0] || ""}
																alt=""
																onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"; }}
																className="w-10 h-10 rounded-xl object-cover shrink-0"
															/>
															<div className="min-w-0">
																<p title={item.title} className="font-bold text-kawral-dark truncate max-w-[200px]">{item.title}</p>
																<p className="text-[11px] text-kawral-muted">{item.owner.name} • {item.location.city}</p>
															</div>
														</div>
													</td>
													<td className="p-4"><Badge variant="accent" size="sm">{item.categoryLabel}</Badge></td>
													<td className="p-4 font-bold">{item.price.toLocaleString("fr-FR")}</td>
													<td className="p-4">
														<select
															value={item.status}
															onChange={(e) => updateListingStatus(item.id, e.target.value as ListingStatus)}
															className="rounded-xl border border-kawral-border bg-kawral-ivory px-2 py-1 text-xs font-bold cursor-pointer max-w-full truncate"
														>
															<option value="published">Publiée</option>
															<option value="draft">Brouillon</option>
															<option value="unavailable">Indisponible</option>
															<option value="sold">Vendu</option>
															<option value="rented">Loué</option>
															<option value="archived">Archivé</option>
														</select>
													</td>
													<td className="p-4">{item.views}</td>
													<td className="p-4 text-right">
														<div className="flex items-center justify-end gap-1.5">
															<Button
																variant="outline"
																size="sm"
																onClick={() => setPreviewListing(item)}
																leftIcon={<Eye className="w-4 h-4" />}
															>
																Détail
															</Button>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => {
																	if (
																		window.confirm(
																			`Supprimer définitivement l'annonce « ${item.title} » ?`,
																		)
																	) {
																		deleteListing(item.id);
																	}
																}}
																className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
																leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
															>
																Supprimer
															</Button>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</CardContent>
							<Pagination
								page={activePage}
								totalItems={filteredAllListings.length}
								pageSize={pageSize}
								onPageChange={setActivePage}
								onPageSizeChange={setPageSize}
								pageSizeOptions={[8, 16, 32]}
								itemLabel="annonces"
							/>
						</Card>
					)}
				</div>
			)}

			{/* --- #6 Modal Motif de refus --- */}
			{rejectModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-kawral-border">
						<div className="p-5 border-b border-kawral-border flex items-center justify-between">
							<div className="flex items-center gap-2">
								<MessageSquare className="w-5 h-5 text-rose-500" />
								<h3 className="font-bold text-sm text-kawral-dark">
									Motif de refus {rejectListingIds.length > 1 ? `(${rejectListingIds.length} annonces)` : ""}
								</h3>
							</div>
							<button
								type="button"
								onClick={() => setRejectModalOpen(false)}
								className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
						<div className="p-5 space-y-3">
							<p className="text-xs text-kawral-muted">Sélectionnez un motif ou saisissez une explication personnalisée :</p>
							<div className="flex flex-wrap gap-2">
								{["Photos manquantes", "Description insuffisante", "Prix suspect", "Doublon", "Contenu inapproprié"].map((reason) => (
									<button
										key={reason}
										type="button"
										onClick={() => setRejectReason(reason)}
										className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors border ${
											rejectReason === reason
												? "bg-rose-50 border-rose-300 text-rose-700"
												: "bg-kawral-ivory border-kawral-border text-kawral-muted hover:border-rose-200"
										}`}
									>
										{reason}
									</button>
								))}
							</div>
							<textarea
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								rows={3}
								placeholder="Précisez le motif de refus (optionnel)..."
								className="w-full rounded-xl border border-kawral-border bg-kawral-ivory px-3 py-2 text-xs text-kawral-dark placeholder:text-kawral-muted focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none"
							/>
						</div>
						<div className="px-5 py-3 border-t border-kawral-border flex items-center justify-end gap-2 bg-slate-50">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setRejectModalOpen(false)}
							>
								Annuler
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={confirmReject}
								leftIcon={<XCircle className="w-4 h-4" />}
							>
								Confirmer le refus
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* --- #2 Preview Drawer (volet latéral droit) & #3 AI Improvement --- */}
			{previewListing && (
				<div className="fixed inset-0 z-50 flex justify-end">
					<div
						className="fixed inset-0 bg-black/20 backdrop-blur-[2px] animate-fade-in"
						onClick={() => { setPreviewListing(null); setEditingDesc(null); }}
						aria-hidden="true"
					/>
					<div className="relative w-full sm:w-[480px] md:w-[520px] h-full bg-white shadow-2xl z-10 flex flex-col border-l border-slate-200/80 animate-slide-left overflow-y-auto">
						{/* Preview Header */}
						<div className="sticky top-0 z-10 bg-white border-b border-kawral-border px-5 py-3 flex items-center justify-between">
							<h3 className="font-bold text-sm text-kawral-dark">Détail de l'annonce</h3>
							<button
								type="button"
								onClick={() => { setPreviewListing(null); setEditingDesc(null); }}
								className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						{/* Photo gallery */}
						{previewListing.images.length > 0 ? (
							<div className="grid grid-cols-2 gap-1 p-1">
								{previewListing.images.slice(0, 4).map((img, i) => (
									<img
										key={i}
										src={img}
										alt={`Photo ${i + 1}`}
										className={`w-full object-cover ${i === 0 ? 'col-span-2 h-48' : 'h-28'} rounded-lg`}
										onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"; }}
									/>
								))}
							</div>
						) : (
							<div className="flex items-center justify-center h-40 bg-slate-50 text-kawral-muted text-xs">
								<ImageIcon className="w-5 h-5 mr-2" /> Aucune photo
							</div>
						)}

						{/* Infos */}
						<div className="p-5 space-y-4">
							<div className="flex items-center gap-2 flex-wrap">
								<Badge variant="accent" size="sm">{previewListing.categoryLabel}</Badge>
								<Badge variant={previewListing.category === 'other' ? 'default' : (previewListing.transactionType === "rent" ? "default" : "success")} size="sm">
									{previewListing.category === 'other' ? 'Prix unique' : (previewListing.transactionType === "rent" ? "Location" : "Vente")}
								</Badge>
							</div>
							<h2
								title={previewListing.title}
								className="text-base font-black text-kawral-dark break-words [overflow-wrap:anywhere]"
							>
								{previewListing.title}
							</h2>
							<p className="text-lg font-black text-kawral-green">
								{previewListing.price.toLocaleString("fr-FR")} FCFA
								{previewListing.category !== 'other' && previewListing.transactionType === "rent" && <span className="text-xs font-normal text-kawral-muted"> / mois</span>}
							</p>

							<div className="flex items-start gap-2 text-xs text-kawral-muted">
								<MapPin className="w-3.5 h-3.5 text-kawral-orange shrink-0 mt-0.5" />
								<span>{previewListing.location.neighborhood && `${previewListing.location.neighborhood}, `}{previewListing.location.city}{previewListing.location.region && `, ${previewListing.location.region}`}</span>
							</div>

							{/* Description + #3 Améliorer avec l'IA */}
							<div>
								<div className="flex items-center justify-between mb-1.5">
									<h4 className="text-xs font-bold text-kawral-dark">Description</h4>
									<button
										type="button"
										disabled={isImprovingAi}
										onClick={handleImproveWithAi}
										className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50 cursor-pointer"
										title="Reformuler avec l'IA dans un style sobre et vendeur"
									>
										<Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isImprovingAi ? "animate-spin" : ""}`} />
										{isImprovingAi ? "Génération en cours..." : "✨ Améliorer avec l'IA"}
									</button>
								</div>

								{editingDesc !== null ? (
									<div className="space-y-2 mt-2 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
										<p className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
											<Sparkles className="w-3 h-3 text-amber-600" />
											Proposition IA (vérifiez ou ajustez avant d'enregistrer) :
										</p>
										<textarea
											value={editingDesc}
											onChange={(e) => setEditingDesc(e.target.value)}
											rows={7}
											className="w-full rounded-xl border border-kawral-border bg-white px-3 py-2 text-xs text-kawral-dark placeholder:text-kawral-muted focus:outline-none focus:ring-2 focus:ring-kawral-green resize-y"
										/>
										<div className="flex items-center justify-end gap-2 pt-1">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setEditingDesc(null)}
											>
												Annuler
											</Button>
											<Button
												variant="primary"
												size="sm"
												onClick={handleSaveImprovedDesc}
												leftIcon={<Save className="w-3.5 h-3.5" />}
											>
												Sauvegarder
											</Button>
										</div>
									</div>
								) : (
									<p className="text-xs text-kawral-muted leading-relaxed whitespace-pre-line">
										{previewListing.description || "Aucune description fournie."}
									</p>
								)}
							</div>

							{/* Caractéristiques */}
							{previewListing.category !== "other" && previewListing.characteristics && Object.keys(previewListing.characteristics).length > 0 && (
								<div>
									<h4 className="text-xs font-bold text-kawral-dark mb-2">Caractéristiques</h4>
									<div className="grid grid-cols-2 gap-2">
										{Object.entries(previewListing.characteristics)
											.filter(([, v]) => v !== undefined && v !== null && v !== false && v !== "")
											.map(([key, value]) => {
												const labels: Record<string, string> = {
													surface: "Surface", rooms: "Pièces", bedrooms: "Chambres", bathrooms: "SdB",
													furnished: "Meublé", parking: "Parking", airConditioning: "Climatisation",
													security: "Gardiennage", generator: "Groupe élec.", pool: "Piscine",
													elevator: "Ascenseur", balcony: "Balcon", waterTank: "Bâche à eau",
													brand: "Marque", model: "Modèle", year: "Année", mileage: "Km",
													transmission: "Transmission", fuel: "Carburant", titleDeed: "Titre foncier",
												};
												const display = value === true ? "Oui" : typeof value === "number" ? value.toLocaleString("fr-FR") : String(value);
												return (
													<div key={key} className="bg-kawral-ivory rounded-xl px-3 py-2">
														<p className="text-[10px] text-kawral-muted">{labels[key] || key}</p>
														<p className="text-xs font-bold text-kawral-dark">{display}</p>
													</div>
												);
											})}
									</div>
								</div>
							)}

							{/* Annonceur */}
							<div className="border-t border-kawral-border pt-3">
								<h4 className="text-xs font-bold text-kawral-dark mb-2">Annonceur</h4>
								<div className="flex items-center gap-3">
									{previewListing.owner.avatar ? (
										<img src={previewListing.owner.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
									) : (
										<div className="w-9 h-9 rounded-full bg-kawral-green text-white flex items-center justify-center text-xs font-bold">
											{previewListing.owner.name.charAt(0).toUpperCase()}
										</div>
									)}
									<div>
										<p className="text-xs font-bold text-kawral-dark">{previewListing.owner.name}</p>
										<p className="text-[11px] text-kawral-muted">
											{previewListing.owner.type === "owner" ? "Propriétaire" : "Vendeur"}
											{previewListing.owner.verified && " • Vérifié ✓"}
										</p>
										{previewListing.owner.phone && (
											<p className="text-[11px] text-kawral-muted flex items-center gap-1 mt-0.5">
												<Phone className="w-3 h-3" /> {previewListing.owner.phone}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Actions rapides */}
							{previewListing.status === "draft" && (
								<div className="flex items-center gap-2 pt-2">
									<Button
										variant="primary"
										size="sm"
										onClick={() => { handleApprove(previewListing.id); setPreviewListing(null); }}
										leftIcon={<CheckCircle2 className="w-4 h-4" />}
										className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600 flex-1"
									>
										Approuver & Publier
									</Button>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => { handleReject(previewListing.id); setPreviewListing(null); }}
										leftIcon={<XCircle className="w-4 h-4" />}
										className="flex-1"
									>
										Refuser
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
