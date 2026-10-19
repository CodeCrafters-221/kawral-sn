import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import {
	Home,
	Search,
	PlusCircle,
	Heart,
	User,
	MessageSquare,
} from "lucide-react";
import { Avatar } from "../ui";
import { MobileProfileBottomSheet } from "./mobile/MobileProfileBottomSheet";

export const MobileNavigation: React.FC = () => {
	const {
		currentView,
		setCurrentView,
		favorites,
		conversations,
		appointments,
		currentUser,
		setAuthModalOpen,
		setAuthModalMode,
		setBecomeSellerModalOpen,
		addToast,
		switchRole,
	} = useApp();

	const { signOut } = useAuth();
	const [sheetOpen, setSheetOpen] = useState(false);

	const handlePublish = () => {
		if (!currentUser) {
			setAuthModalMode("login");
			setAuthModalOpen(true);
		} else if (currentUser.role === "client") {
			setBecomeSellerModalOpen(true);
		} else {
			setCurrentView("create-listing");
		}
	};

	const getDashboardView = () => {
		if (!currentUser) {
			setAuthModalMode("login");
			setAuthModalOpen(true);
			return;
		}
		switch (currentUser.role) {
			case "seller":
				setCurrentView("seller-dashboard");
				break;
			case "admin":
				setCurrentView("admin-dashboard");
				break;
			default:
				setCurrentView("client-dashboard");
				break;
		}
	};

	const handleLogout = async () => {
		setSheetOpen(false);
		try {
			await signOut();
		} catch {
			/* ignore */
		}
		switchRole("visitor");
		addToast("Vous avez été déconnecté.", "info");
		setCurrentView("home");
	};

	const handleOpenProfile = () => {
		setSheetOpen(false);
		document.dispatchEvent(
			new CustomEvent("open-profile-settings"),
		);
	};

	const unreadCount = conversations.reduce(
		(total, conversation) =>
			total +
			(conversation.unreadCount ??
				(conversation.unread ? 1 : 0)),
		0,
	);
	const pendingRDV = appointments.filter(
		(a) => a.status === "pending",
	).length;

	const roleLabel =
		currentUser?.role === "admin"
			? "⚡ Admin"
			: currentUser?.role === "seller"
				? "🏷️ Vendeur"
				: "👤 Client";

	return (
		<>
			<nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-2xl overflow-visible">
				<div className="flex items-center justify-around px-1 pt-1.5 pb-[max(6px,env(safe-area-inset-bottom))] overflow-visible">
					{/* Accueil */}
					<button
						onClick={() => setCurrentView("home")}
						className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
							currentView === "home"
								? "text-kawral-green bg-kawral-green/8"
								: "text-slate-500"
						}`}
					>
						<Home
							className={`w-5 h-5 ${currentView === "home" ? "scale-110" : ""} transition-transform`}
						/>
						<span>Accueil</span>
					</button>

					{/* Explorer */}
					<button
						onClick={() => setCurrentView("search")}
						className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
							currentView === "search"
								? "text-kawral-green bg-kawral-green/8"
								: "text-slate-500"
						}`}
					>
						<Search
							className={`w-5 h-5 ${currentView === "search" ? "scale-110" : ""} transition-transform`}
						/>
						<span>Explorer</span>
					</button>

					{/* Bouton central (Publier) */}
					<button
						onClick={handlePublish}
						className="relative z-10 flex flex-col items-center justify-center bg-kawral-orange hover:bg-kawral-orange-hover text-white w-14 h-14 rounded-2xl shadow-lg -mt-5 active:scale-90 transition-all border-[3px] border-white cursor-pointer"
					>
						<PlusCircle className="w-6 h-6" />
						<span className="text-[9px] font-black mt-0.5 leading-none">
							Publier
						</span>
					</button>

					{/* Messages / Favoris */}
					{currentUser && currentUser.role !== "admin" ? (
						<button
							onClick={() => setCurrentView("messaging")}
							className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
								currentView === "messaging"
									? "text-kawral-green bg-kawral-green/8"
									: "text-slate-500"
							}`}
						>
							<MessageSquare
								className={`w-5 h-5 ${currentView === "messaging" ? "scale-110" : ""} transition-transform`}
							/>
							{unreadCount > 0 && (
								<span className="absolute top-1 right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
									{unreadCount}
								</span>
							)}
							<span>Messages</span>
						</button>
					) : currentUser?.role === "client" ||
					  !currentUser ? (
						<button
							onClick={() => setCurrentView("favorites")}
							className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
								currentView === "favorites"
									? "text-kawral-orange bg-orange-50"
									: "text-slate-500"
							}`}
						>
							<Heart className="w-5 h-5" />
							{favorites.length > 0 && (
								<span className="absolute top-1 right-2 bg-kawral-orange text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
									{favorites.length}
								</span>
							)}
							<span>Favoris</span>
						</button>
					) : (
						<button
							onClick={() => setCurrentView("search")}
							className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all text-slate-400 cursor-pointer"
						>
							<Search className="w-5 h-5" />
							<span>Annonces</span>
						</button>
					)}

					{/* Compte */}
					<button
						onClick={() =>
							currentUser
								? setSheetOpen(true)
								: (setAuthModalMode("login"),
									setAuthModalOpen(true))
						}
						className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
							currentView.includes("dashboard")
								? "text-kawral-green bg-kawral-green/8"
								: "text-slate-500"
						}`}
					>
						{currentUser ? (
							<Avatar
								src={currentUser.avatar}
								name={currentUser.name}
								size="xs"
								className={`transition-all ${currentView.includes("dashboard") ? "ring-2 ring-kawral-green" : "ring-1 ring-slate-200"}`}
							/>
						) : (
							<User className="w-5 h-5" />
						)}
						<span>
							{currentUser ? "Compte" : "Connexion"}
						</span>
					</button>
				</div>
			</nav>

			{/* Bottom Sheet Profil */}
			{currentUser && (
				<MobileProfileBottomSheet
					isOpen={sheetOpen}
					onClose={() => setSheetOpen(false)}
					currentUser={currentUser}
					roleLabel={roleLabel}
					unreadCount={unreadCount}
					pendingRDV={pendingRDV}
					favoritesCount={favorites.length}
					onNavigateDashboard={getDashboardView}
					onOpenProfileSettings={handleOpenProfile}
					onNavigateMessaging={() =>
						setCurrentView("messaging")
					}
					onNavigateAppointments={() =>
						setCurrentView("appointments")
					}
					onNavigateFavorites={() =>
						setCurrentView("favorites")
					}
					onLogout={handleLogout}
				/>
			)}
		</>
	);
};
