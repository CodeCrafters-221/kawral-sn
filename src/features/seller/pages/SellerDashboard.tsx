import React, { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { formatPriceFCFA } from "../../../utils/formatters";
import { getListingRef } from "../../../utils/whatsapp";
import {
	PlusCircle,
	Eye,
	MessageSquare,
	Trash2,
	Edit3,
	Camera,
	ImagePlus,
	Loader2,
	Building2,
	Calendar,
	Clock,
	Hash,
} from "lucide-react";
import {
	Avatar,
	Button,
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	SafeImage,
} from "../../../components/ui";
import { uploadAvatar } from "../../../services/supabase/storageService";
import { profileService } from "../../../services/supabase/profileService";
import { HostAvailabilityModal } from "../../../components/modals/HostAvailabilityModal";
import { DeleteListingModal } from "../../../components/modals/DeleteListingModal";
import { ListingStatusSelect } from "../components/ListingStatusSelect";
import { Listing } from "../../../types";

export const SellerDashboard: React.FC = () => {
	const navigate = useNavigate();
	const {
		listings,
		currentUser,
		setCurrentUser,
		setCurrentView,
		deleteListing,
		updateListingStatus,
		addToast,
		conversations,
		appointments,
		isLoadingListings,
	} = useApp();
	const [uploadingBanner, setUploadingBanner] =
		useState(false);
	const [availabilityModalOpen, setAvailabilityModalOpen] =
		useState(false);
	const [listingToDelete, setListingToDelete] =
		useState<Listing | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const bannerInputRef = useRef<HTMLInputElement>(null);

	const handleConfirmDelete = async () => {
		if (!listingToDelete) return;
		setIsDeleting(true);
		try {
			await deleteListing(listingToDelete.id);
			setListingToDelete(null);
		} catch (error) {
			console.error("Erreur lors de la suppression de l'annonce :", error);
		} finally {
			setIsDeleting(false);
		}
	};

	// Défense en profondeur : la protection principale est RoleProtectedRoute
	if (
		currentUser &&
		currentUser.role !== "seller" &&
		currentUser.role !== "admin"
	) {
		return <Navigate to="/dashboard/client" replace />;
	}

	const sellerListings = listings.filter(
		(item) => item.ownerId === currentUser?.id,
	);
	const totalViews = sellerListings.reduce(
		(sum, item) => sum + item.views,
		0,
	);
	const sellerListingIds = new Set(
		sellerListings.map((item) => item.id),
	);
	const sellerConversations = conversations.filter(
		(conversation) =>
			conversation.sellerId === currentUser?.id ||
			sellerListingIds.has(conversation.listingId),
	);
	const sellerAppointments = appointments.filter(
		(appointment) =>
			appointment.sellerId === currentUser?.id ||
			sellerListingIds.has(appointment.listingId),
	);
	const publishedListings = sellerListings.filter(
		(item) => item.status === "published",
	).length;
	const unavailableListings = sellerListings.filter(
		(item) => item.status === "unavailable",
	).length;
	const soldListings = sellerListings.filter(
		(item) => item.status === "sold",
	).length;

	// Le changement de statut (avec toast de confirmation / d'erreur) est géré par le contexte


	const openProfileSettings = () => {
		document.dispatchEvent(
			new CustomEvent("open-profile-settings"),
		);
	};

	const handleDirectBannerUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		e.target.value = ""; // reset input
		if (!file || !currentUser) return;

		if (file.size > 10 * 1024 * 1024) {
			addToast(
				"Image trop volumineuse (max 10 Mo)",
				"error",
			);
			return;
		}

		// Show local preview immediately
		const dataUrl = await new Promise<string | null>(
			(resolve) => {
				const reader = new FileReader();
				reader.onload = (ev) =>
					resolve(ev.target?.result as string);
				reader.onerror = () => resolve(null);
				reader.readAsDataURL(file);
			},
		);
		if (!dataUrl) {
			addToast("Impossible de lire le fichier.", "error");
			return;
		}

		// Optimistic preview only — don't persist data URL
		setCurrentUser({ ...currentUser, banner: dataUrl });
		setUploadingBanner(true);

		try {
			const remoteUrl = await uploadAvatar(
				currentUser.id,
				file,
			);
			if (remoteUrl) {
				setCurrentUser({
					...currentUser,
					banner: remoteUrl,
				});
				await profileService.saveProfile(currentUser.id, {
					bannerUrl: remoteUrl,
				});
				addToast(
					"Bannière mise à jour avec succès !",
					"success",
				);
			} else {
				// Rollback preview — don't save data URL to DB
				setCurrentUser({
					...currentUser,
					banner: currentUser.banner || "",
				});
				addToast("Échec de l'upload. Réessayez.", "error");
			}
		} catch (err) {
			setCurrentUser({
				...currentUser,
				banner: currentUser.banner || "",
			});
			addToast("Erreur lors de l'upload.", "error");
		} finally {
			setUploadingBanner(false);
		}
	};

	const DEFAULT_BANNER =
		"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-10 space-y-8" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
			{/* Seller Header — avec bannière et avatar visible */}
			<Card className="overflow-hidden shadow-xs">
				{/* Banner */}
				<div className="h-32 sm:h-40 relative bg-slate-200 group">
					<div className="absolute inset-0 overflow-hidden rounded-t-3xl">
						<SafeImage
							src={currentUser?.banner}
							fallback={DEFAULT_BANNER}
							alt="Bannière vendeur"
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
					</div>

					<input
						ref={bannerInputRef}
						type="file"
						accept="image/png,image/jpeg,image/webp"
						className="hidden"
						onChange={handleDirectBannerUpload}
					/>

					<button
						onClick={() => bannerInputRef.current?.click()}
						disabled={uploadingBanner}
						className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full backdrop-blur-sm opacity-90 group-hover:opacity-100 transition-all z-10 cursor-pointer shadow-md disabled:opacity-50"
					>
						{uploadingBanner ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : (
							<ImagePlus className="w-3.5 h-3.5" />
						)}
						<span className="hidden sm:inline">
							{uploadingBanner
								? "Téléchargement..."
								: "Changer la bannière"}
						</span>
					</button>

					{/* Avatar flottant */}
					<div className="absolute left-4 sm:left-6 -bottom-10 z-20">
						<div
							className="relative group/av cursor-pointer"
							onClick={openProfileSettings}
							title="Modifier la photo de profil"
						>
							<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-white/90 shadow-xl overflow-hidden bg-slate-900/10 flex items-center justify-center">
								<Avatar
									src={currentUser?.avatar}
									name={currentUser?.name || "Vendeur"}
									size="xl"
									className="w-full h-full object-cover rounded-full"
								/>
							</div>
							<div className="absolute inset-0 bg-black/40 opacity-0 group-hover/av:opacity-100 transition-opacity rounded-full flex items-center justify-center">
								<Camera className="w-6 h-6 text-white" />
							</div>
						</div>
					</div>
				</div>

				{/* Info zone */}
				<div className="pt-14 sm:pt-16 px-4 sm:px-6 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 flex-wrap">
							<h1 className="text-lg sm:text-2xl font-black text-kawral-dark">
								{currentUser?.name || "Vendeur"} 👋
							</h1>
							<Badge variant="accent" size="sm">
								Propriétaire / Vendeur
							</Badge>
						</div>
						<p className="text-xs text-kawral-muted mt-1 font-medium">
							Gérez vos annonces et suivez vos statistiques.
						</p>
					</div>
					<div className="flex items-center gap-2.5 flex-wrap">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setAvailabilityModalOpen(true)}
							leftIcon={<Clock className="w-3.5 h-3.5 text-kawral-green" />}
						>
							<span className="hidden sm:inline">Disponibilités</span>
							<span className="sm:hidden">Créneaux</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={openProfileSettings}
							leftIcon={<Camera className="w-3.5 h-3.5" />}
						>
							<span className="hidden sm:inline">Modifier le profil</span>
							<span className="sm:hidden">Profil</span>
						</Button>
						<Button
							variant="accent"
							size="sm"
							onClick={() => {
								setCurrentView("create-listing");
								window.scrollTo({
									top: 0,
									behavior: "smooth",
								});
							}}
							leftIcon={<PlusCircle className="w-4 h-4" />}
						>
							<span className="hidden sm:inline">Publier une annonce</span>
							<span className="sm:hidden">Publier</span>
						</Button>
					</div>
				</div>
			</Card>

			{/* Seller Metrics using Card */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="hover:shadow-sm transition-shadow">
					<CardContent className="p-5 flex items-center justify-between">
						<div>
							<span className="text-xs font-semibold text-kawral-muted">
								Annonces actives
							</span>
							<p className="text-2xl sm:text-3xl font-black text-kawral-green mt-1">
								{publishedListings}
							</p>
							<p className="text-[10px] text-kawral-muted mt-0.5 font-medium">
								{soldListings} vendue{soldListings > 1 ? "s" : ""} • {unavailableListings} en pause
							</p>
						</div>
						<div className="p-3 bg-green-50 text-kawral-green rounded-2xl">
							<Building2 className="w-5 h-5" />
						</div>
					</CardContent>
				</Card>

				<Card className="hover:shadow-sm transition-shadow">
					<CardContent className="p-5 flex items-center justify-between">
						<div>
							<span className="text-xs font-semibold text-kawral-muted">
								Vues totales
							</span>
							<p className="text-2xl sm:text-3xl font-black text-kawral-orange mt-1">
								{totalViews}
							</p>
						</div>
						<div className="p-3 bg-orange-50 text-kawral-orange rounded-2xl">
							<Eye className="w-5 h-5" />
						</div>
					</CardContent>
				</Card>

				<Card
					onClick={() => {
						setCurrentView("messaging");
						window.scrollTo({ top: 0, behavior: "smooth" });
					}}
					className="hover:shadow-sm transition-all cursor-pointer hover:border-kawral-green group"
				>
					<CardContent className="p-5 flex items-center justify-between">
						<div>
							<span className="text-xs font-semibold text-kawral-muted group-hover:text-kawral-green transition-colors">
								Conversations
							</span>
							<p className="text-2xl sm:text-3xl font-black text-kawral-green mt-1">
								{sellerConversations.length}
							</p>
						</div>
						<div className="p-3 bg-kawral-green/10 text-kawral-green rounded-2xl group-hover:scale-110 transition-transform">
							<MessageSquare className="w-5 h-5" />
						</div>
					</CardContent>
				</Card>

				<Card
					onClick={() => {
						setCurrentView("appointments");
						window.scrollTo({ top: 0, behavior: "smooth" });
					}}
					className="hover:shadow-sm transition-all cursor-pointer hover:border-kawral-orange group"
				>
					<CardContent className="p-5 flex items-center justify-between">
						<div>
							<span className="text-xs font-semibold text-kawral-muted group-hover:text-kawral-orange transition-colors">
								Rendez-vous
							</span>
							<p className="text-2xl sm:text-3xl font-black text-kawral-orange mt-1">
								{sellerAppointments.length}
							</p>
						</div>
						<div className="p-3 bg-orange-50 text-kawral-orange rounded-2xl group-hover:scale-110 transition-transform">
							<Calendar className="w-5 h-5" />
						</div>
					</CardContent>
				</Card>
			</div>


			{/* Seller Listings Table using Card */}
			<Card className="overflow-hidden shadow-xs">
				<CardHeader className="p-4 sm:p-6 border-b border-slate-100 flex flex-row flex-wrap items-center justify-between gap-2">
					<CardTitle>
						Vos annonces ({sellerListings.length})
					</CardTitle>
					<Button
						variant="ghost"
						size="xs"
						onClick={() => {
							setCurrentView("create-listing");
						}}
						leftIcon={
							<PlusCircle className="w-3.5 h-3.5" />
						}
					>
						Nouvelle annonce
					</Button>
				</CardHeader>

				{/* Desktop Table */}
				<div className="hidden md:block overflow-x-auto">
					<table className="w-full text-left text-xs font-semibold">
						<thead className="bg-kawral-ivory text-kawral-muted border-b border-slate-200 uppercase tracking-wider text-[10px]">
							<tr>
								<th className="p-4">Bien</th>
								<th className="p-4">Prix</th>
								<th className="p-4">Statut</th>
								<th className="p-4">Vues</th>
								<th className="p-4">Date</th>
								<th className="p-4 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{isLoadingListings ? (
								<tr>
									<td
										colSpan={6}
										className="p-8 text-center text-kawral-muted"
									>
										Chargement de vos annonces...
									</td>
								</tr>
							) : sellerListings.length === 0 ? (
								<tr>
									<td
										colSpan={6}
										className="p-8 text-center text-kawral-muted font-medium"
									>
										<Building2 className="w-8 h-8 mx-auto text-slate-350 mb-2 opacity-50" />
										<p className="text-xs font-bold text-slate-500">
											Vous n'avez encore aucune annonce.
										</p>
										<p className="text-[10px] text-slate-400 mt-0.5">
											Publiez votre première annonce pour
											commencer.
										</p>
									</td>
								</tr>
							) : (
								sellerListings.map((item) => {
									const ref = getListingRef(item.id);
									return (
										<tr
											key={item.id}
											className="hover:bg-slate-50 transition-colors"
										>
											<td className="p-4 flex items-center gap-3">
												<div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/70">
													<SafeImage
														src={item.images[0]}
														alt={item.title}
														className="w-full h-full object-cover block"
														style={{ height: "100%" }}
													/>
												</div>
												<div className="min-w-0 max-w-xs sm:max-w-md space-y-1">
													<h4
														title={item.title}
														className="font-bold text-sm text-kawral-dark line-clamp-2 break-words [overflow-wrap:anywhere]"
													>
														{item.title}
													</h4>
													<div className="flex items-center gap-2 flex-wrap">
														{ref && (
															<span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200 shrink-0">
																<Hash className="w-2.5 h-2.5 text-kawral-green" />
																<span>Réf: {ref}</span>
															</span>
														)}
														<p className="text-[11px] text-kawral-muted truncate">
															{item.location.neighborhood},{" "}
															{item.location.city}
														</p>
													</div>
												</div>
											</td>

											<td className="p-4 font-bold text-kawral-green">
												{formatPriceFCFA(item.price)}
											</td>

											<td className="p-4">
												<ListingStatusSelect
													value={item.status}
													allowRented={item.transactionType === "rent"}
													onChange={(status) =>
														updateListingStatus(item.id, status)
													}
												/>
											</td>

											<td className="p-4 font-bold text-kawral-dark">
												{item.views}
											</td>

											<td className="p-4 text-kawral-muted">
												{item.createdAt}
											</td>

											<td className="p-4 text-right space-x-1 sm:space-x-2">
												<button
													onClick={() =>
														navigate(`/listings/${item.id}`)
													}
													className="p-1.5 text-slate-450 hover:text-kawral-green cursor-pointer inline-flex"
													title="Voir l'annonce"
												>
													<Eye className="w-4 h-4" />
												</button>

												<button
													onClick={() =>
														navigate(
															`/dashboard/seller/listings/${item.id}/edit`,
														)
													}
													className="p-1.5 text-slate-450 hover:text-kawral-orange cursor-pointer inline-flex"
													title="Modifier"
												>
													<Edit3 className="w-4 h-4" />
												</button>

												<button
													onClick={() => setListingToDelete(item)}
													className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer inline-flex"
													title="Supprimer"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>

				{/* Mobile Cards List */}
				<div className="md:hidden divide-y divide-slate-100">
					{isLoadingListings ? (
						<div className="p-8 text-center text-kawral-muted text-xs font-semibold">
							Chargement de vos annonces...
						</div>
					) : sellerListings.length === 0 ? (
						<div className="p-8 text-center text-kawral-muted font-medium">
							<Building2 className="w-8 h-8 mx-auto text-slate-350 mb-2 opacity-50" />
							<p className="text-xs font-bold text-slate-500">
								Vous n'avez encore aucune annonce.
							</p>
							<p className="text-[10px] text-slate-400 mt-0.5">
								Publiez votre première annonce pour
								commencer.
							</p>
						</div>
					) : (
						sellerListings.map((item) => {
							const ref = getListingRef(item.id);
							return (
								<div
									key={`mobile-${item.id}`}
									className="p-4 flex flex-col gap-4"
								>
									<div className="flex items-start gap-3">
										<div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/70">
											<SafeImage
												src={item.images[0]}
												alt={item.title}
												className="w-full h-full object-cover block"
												style={{ height: "100%" }}
											/>
										</div>
										<div className="min-w-0 flex-1">
											<h4
												title={item.title}
												className="font-bold text-sm text-kawral-dark line-clamp-2 break-words [overflow-wrap:anywhere]"
											>
												{item.title}
											</h4>
											<div className="flex items-center gap-2 flex-wrap mt-1">
												<p className="text-xs font-black text-kawral-green">
													{formatPriceFCFA(item.price)}
												</p>
												{ref && (
													<span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] border border-slate-200 shrink-0">
														<Hash className="w-2.5 h-2.5 text-kawral-green" />
														<span>Réf: {ref}</span>
													</span>
												)}
											</div>
											<p className="text-[11px] text-kawral-muted mt-1 truncate">
												{item.location.neighborhood},{" "}
												{item.location.city}
											</p>
										</div>
									</div>

									<div className="flex items-center justify-between gap-3">
										<span className="text-[11px] font-bold uppercase tracking-wider text-kawral-muted shrink-0">
											Statut
										</span>
										<ListingStatusSelect
											value={item.status}
											allowRented={item.transactionType === "rent"}
											onChange={(status) =>
												updateListingStatus(item.id, status)
											}
											className="w-[188px] xs:w-[204px]"
										/>
									</div>

									<div className="flex items-center justify-between pt-3 border-t border-slate-100">
										<div className="flex items-center gap-4 text-[11px] text-kawral-muted font-bold">
											<span className="flex items-center gap-1.5">
												<Eye className="w-3.5 h-3.5" />{" "}
												{item.views} vues
											</span>
											<span className="flex items-center gap-1.5">
												<Calendar className="w-3.5 h-3.5" />{" "}
												{item.createdAt}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={() =>
													navigate(`/listings/${item.id}`)
												}
												className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
											>
												<Eye className="w-4 h-4" />
											</button>
											<button
												onClick={() =>
													navigate(
														`/dashboard/seller/listings/${item.id}/edit`,
													)
												}
												className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg cursor-pointer"
											>
												<Edit3 className="w-4 h-4" />
											</button>
											<button
												onClick={() => setListingToDelete(item)}
												className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg cursor-pointer"
												title="Supprimer"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</Card>

			{/* Modal de confirmation de suppression */}
			<DeleteListingModal
				isOpen={!!listingToDelete}
				onClose={() => !isDeleting && setListingToDelete(null)}
				onConfirm={handleConfirmDelete}
				listing={listingToDelete}
				isDeleting={isDeleting}
			/>

			{/* Modal de gestion des disponibilités */}
			{currentUser && (
				<HostAvailabilityModal
					isOpen={availabilityModalOpen}
					onClose={() => setAvailabilityModalOpen(false)}
					hostId={currentUser.id}
					title="Vos disponibilités de visite"
					subtitle="Définissez vos jours et créneaux horaires pour recevoir des visites de clients."
				/>
			)}
		</div>
	);
};
