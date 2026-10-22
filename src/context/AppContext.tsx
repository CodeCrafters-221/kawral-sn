import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {
	supabase,
	isSupabaseConfigured,
} from "../lib/supabase";
import {
	User,
	Listing,
	FilterState,
	Conversation,
	Message,
	Appointment,
	AppointmentRequestResult,
	Report,
} from "../types";
import { generateUUID, toValidUUID } from "../utils/uuid";
import { toAppRole, toSafeRegistrationAppRole } from "../utils/roles";
import { sanitizeSafeUrl } from "../lib/validation";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type {} from "../data/mockData"; // kept for type completeness
import { listingsService } from "../services/supabase/listingsService";
import { messagesService } from "../services/supabase/messagesService";
import { appointmentsService } from "../services/supabase/appointmentsService";
import { favoritesService } from "../services/supabase/favoritesService";
import { profileService } from "../services/supabase/profileService";
import { useListingsActions } from "./hooks/useListingsActions";
import { useConversationsActions } from "./hooks/useConversationsActions";
import { useAppointmentsActions } from "./hooks/useAppointmentsActions";

export interface Toast {
	id: string;
	type: "success" | "error" | "info";
	message: string;
}

interface AppContextType {
	currentUser: User | null;
	setCurrentUser: (user: User | null) => void;
	upgradeToSeller: () => Promise<boolean>;
	switchRole: (
		roleKey:
			| "client"
			| "seller"
			| "admin"
			| "visitor",
	) => void;

	listings: Listing[];
	isLoadingListings: boolean;
	setIsLoadingListings: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	refetchListings: () => Promise<void>;
	favorites: string[];
	toggleFavorite: (id: string) => void;
	isFavorite: (id: string) => boolean;

	filters: FilterState;
	setFilters: React.Dispatch<
		React.SetStateAction<FilterState>
	>;
	resetFilters: () => void;

	addListing: (
		newListing: Omit<
			Listing,
			| "id"
			| "views"
			| "contactsCount"
			| "createdAt"
			| "status"
		>,
		customId?: string,
	) => Promise<void>;
	updateListing: (
		id: string,
		updates: Partial<Listing>,
	) => void;
	deleteListing: (id: string) => void;
	toggleListingStatus: (id: string) => void;
	updateListingStatus: (
		id: string,
		status: Listing["status"],
	) => Promise<boolean>;
	approveListing: (id: string) => void;
	rejectListing: (id: string) => void;

	conversations: Conversation[];
	messages: Record<string, Message[]>;
	markConversationRead: (
		conversationId: string,
	) => Promise<void>;
	sendMessage: (
		conversationId: string,
		text: string,
	) => void;
	startConversation: (
		listing: Listing,
		initialMessage: string,
	) => string;
	deleteConversation: (conversationId: string) => Promise<void>;
	updateMessage: (
		conversationId: string,
		messageId: string,
		newText: string,
	) => Promise<void>;
	deleteMessage: (
		conversationId: string,
		messageId: string,
	) => Promise<void>;

	appointments: Appointment[];
	requestAppointment: (data: {
		listing: Listing;
		date: string;
		time: string;
		clientName: string;
		clientPhone: string;
		clientEmail: string;
		message: string;
	}) => Promise<AppointmentRequestResult>;
	updateAppointmentStatus: (
		id: string,
		status:
			| "pending"
			| "confirmed"
			| "cancelled"
			| "completed",
	) => void;

	reports: Report[];
	submitReport: (
		listingId: string,
		listingTitle: string,
		reason: Report["reason"],
		details: string,
	) => void;
	dismissReport: (reportId: string) => Promise<void>;

	toasts: Toast[];
	addToast: (
		message: string,
		type?: "success" | "error" | "info",
	) => void;
	removeToast: (id: string) => void;

	authModalOpen: boolean;
	setAuthModalOpen: (open: boolean) => void;
	authModalMode: "login" | "register" | "forgot";
	setAuthModalMode: (
		mode: "login" | "register" | "forgot",
	) => void;
	onboardingModalOpen: boolean;
	setOnboardingModalOpen: (open: boolean) => void;
	becomeSellerModalOpen: boolean;
	setBecomeSellerModalOpen: (open: boolean) => void;

	currentView: string;
	setCurrentView: (view: string) => void;
	isNavigating: boolean;
	selectedListingId: string | null;
	setSelectedListingId: (id: string | null) => void;
	selectedConversationId: string | null;
	setSelectedConversationId: (id: string | null) => void;
}

const initialFilters: FilterState = {
	search: "",
	category: "",
	transactionType: "all",
	location: "",
	priceMin: null,
	priceMax: null,
	surfaceMin: null,
	roomsMin: null,
	sortBy: "recent",
};

const AppContext = createContext<
	AppContextType | undefined
>(undefined);

export const AppProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const navigate = useNavigate();
	const location = useLocation();

	const [currentUser, setCurrentUser] =
		useState<User | null>(null);
	const [listings, setListings] = useState<Listing[]>([]);
	const [isLoadingListings, setIsLoadingListings] =
		useState<boolean>(false);
	const [favorites, setFavorites] = useState<string[]>([]);
	const [conversations, setConversations] = useState<
		Conversation[]
	>([]);
	const [messages, setMessages] = useState<
		Record<string, Message[]>
	>({});
	const listingsRef = useRef<Record<string, Listing>>({});
	const profilesRef = useRef<Record<string, any>>({});
	const { profile, supabaseUser, session, refreshProfile } =
		useAuth();
	const [appointments, setAppointments] = useState<
		Appointment[]
	>([]);
	const [reports, setReports] = useState<Report[]>([]);
	const [filters, setFilters] =
		useState<FilterState>(initialFilters);
	const [toasts, setToasts] = useState<Toast[]>([]);
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [authModalMode, setAuthModalMode] = useState<
		"login" | "register" | "forgot"
	>("login");
	const [onboardingModalOpen, setOnboardingModalOpen] =
		useState(false);
	const [becomeSellerModalOpen, setBecomeSellerModalOpen] =
		useState(false);
	const [selectedListingId, setSelectedListingId] =
		useState<string | null>(null);
	const [
		selectedConversationId,
		setSelectedConversationId,
	] = useState<string | null>(null);

	// ── Toast helpers ────────────────────────────────────────────────────────
	const removeToast = (id: string) =>
		setToasts((prev) => prev.filter((t) => t.id !== id));
	const addToast = (
		message: string,
		type: "success" | "error" | "info" = "success",
	) => {
		const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
		setToasts((prev) => [...prev, { id, type, message }]);
		setTimeout(() => removeToast(id), 4000);
	};

	// ── Data fetching ────────────────────────────────────────────────────────
	const refetchListings = async () => {
		setIsLoadingListings(true);
		if (isSupabaseConfigured()) {
			try {
				// SÉCURITÉ : Ne sélectionner que les colonnes publiques d'affichage (sans email ni role)
				const [{ data: profilesData }, fetchedListings] =
					await Promise.all([
						supabase
							.from("profiles")
							.select("id, full_name, phone, avatar_url, company_name"),
						listingsService.fetchListings(),
					]);
				const profilesMap: Record<string, any> = {};
				profilesData?.forEach((p: any) => {
					profilesMap[p.id] = p;
				});
				profilesRef.current = profilesMap;

				setListings(fetchedListings);

				const listingsMap: Record<string, Listing> = {};
				fetchedListings.forEach((l) => {
					listingsMap[l.id] = l;
				});
				listingsRef.current = listingsMap;
				setIsLoadingListings(false);

				const [
					{
						conversations: fetchedConvs,
						messages: fetchedMsgs,
					},
					fetchedAppts,
				] = await Promise.all([
					messagesService.fetchConversationsAndMessages(
						listingsMap,
						profilesMap,
						undefined,
						supabaseUser?.id,
					),
					appointmentsService.fetchAppointments(
						listingsMap,
						profilesMap,
					),
				]);
				setConversations(fetchedConvs);
				setMessages(fetchedMsgs);
				setAppointments(fetchedAppts);
			} catch (err) {
				console.error("Supabase fetch error:", err);
			}
		}
		setIsLoadingListings(false);
	};

	useEffect(() => {
		let cancelled = false;
		let channel: ReturnType<
			typeof supabase.channel
		> | null = null;
		let recoveryTimer: ReturnType<
			typeof setTimeout
		> | null = null;
		let debounceTimer: ReturnType<
			typeof setTimeout
		> | null = null;
		const debouncedRefetch = () => {
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(
				() => refetchListings(),
				1500,
			);
		};
		const syncConversation = async (
			conversationId: string,
		) => {
			const result =
				await messagesService.fetchConversationsAndMessages(
					listingsRef.current,
					profilesRef.current,
					conversationId,
					supabaseUser?.id,
				);
			const conversation = result.conversations[0];
			if (!conversation) return;
			setConversations((previous) => {
				const exists = previous.some(
					(item) => item.id === conversation.id,
				);
				return exists
					? previous.map((item) =>
							item.id === conversation.id
								? conversation
								: item,
						)
					: [conversation, ...previous];
			});
			setMessages((previous) => {
				const remoteMessages =
					result.messages[conversation.id] || [];
				const localMessages =
					previous[conversation.id] || [];
				const mergedMessages = [
					...localMessages,
					...remoteMessages.filter(
						(remoteMessage) =>
							!localMessages.some(
								(localMessage) =>
									localMessage.id === remoteMessage.id,
							),
					),
				].sort((left, right) =>
					left.createdAt.localeCompare(right.createdAt),
				);
				return {
					...previous,
					[conversation.id]: mergedMessages,
				};
			});
		};
		const syncMessage = (payload: any) => {
			const row = payload.new || payload.old;
			if (!row?.conversation_id) return;
			if (payload.eventType === "UPDATE") {
				void syncConversation(row.conversation_id);
				return;
			}
			if (payload.eventType === "INSERT") {
				const senderProfile =
					profilesRef.current[row.sender_id];
				const message: Message = {
					id: row.id,
					conversationId: row.conversation_id,
					senderId: row.sender_id,
					senderName:
						senderProfile?.full_name || "Utilisateur",
					text: row.content,
					createdAt: row.created_at,
				};
				setMessages((previous) => {
					const current =
						previous[row.conversation_id] || [];
					if (
						current.some((item) => item.id === message.id)
					)
						return previous;
					return {
						...previous,
						[row.conversation_id]: [...current, message],
					};
				});
				setConversations((previous) =>
					previous.map((conversation) =>
						conversation.id === row.conversation_id
							? {
									...conversation,
									lastMessage: row.content,
									updatedAt: row.created_at,
									...(row.sender_id !== supabaseUser?.id
										? {
												unread: true,
												unreadCount:
													(conversation.unreadCount || 0) +
													1,
											}
										: {}),
								}
							: conversation,
					),
				);
			} else if (payload.eventType === "DELETE") {
				setMessages((previous) => ({
					...previous,
					[row.conversation_id]: (
						previous[row.conversation_id] || []
					).filter((item) => item.id !== row.id),
				}));
			}
		};
		const subscribeToRealtime = async () => {
			await refetchListings();
			if (
				cancelled ||
				!isSupabaseConfigured() ||
				!supabaseUser?.id ||
				!session?.access_token
			)
				return;

			supabase.realtime.setAuth(session.access_token);

			channel = supabase
				.channel(`kawral-realtime-${supabaseUser.id}`)
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "listings",
					},
					debouncedRefetch,
				)
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "listing_images",
					},
					debouncedRefetch,
				)
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "conversations",
						filter: `buyer_id=eq.${supabaseUser.id}`,
					},
					(payload) => {
						const realtimePayload = payload as any;
						const conversationId =
							realtimePayload.new?.id ||
							realtimePayload.old?.id;
						if (
							conversationId &&
							payload.eventType !== "DELETE"
						) {
							syncConversation(conversationId);
						}
					},
				)
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "conversations",
						filter: `seller_id=eq.${supabaseUser.id}`,
					},
					(payload) => {
						const realtimePayload = payload as any;
						const conversationId =
							realtimePayload.new?.id ||
							realtimePayload.old?.id;
						if (
							conversationId &&
							payload.eventType !== "DELETE"
						) {
							syncConversation(conversationId);
						}
					},
				)
				.on(
					"postgres_changes",
					{
						event: "*",
						schema: "public",
						table: "appointments",
					},
					debouncedRefetch,
				)
				.subscribe((status, error) => {
					console.info("Supabase Realtime status:", status);
					if (
						status === "CHANNEL_ERROR" ||
						status === "TIMED_OUT"
					) {
						console.error(
							"Supabase Realtime error:",
							error || status,
						);
						if (channel) {
							void supabase.removeChannel(channel);
							channel = null;
						}
						if (!recoveryTimer) {
							recoveryTimer = setTimeout(() => {
								recoveryTimer = null;
								if (!cancelled) void subscribeToRealtime();
							}, 2000);
						}
					}
					if (status === "CLOSED") {
						console.warn(
							"Supabase Realtime channel closed.",
						);
						channel = null;
						if (!recoveryTimer) {
							recoveryTimer = setTimeout(() => {
								recoveryTimer = null;
								if (!cancelled) void subscribeToRealtime();
							}, 2000);
						}
					}
				});
		};

		void subscribeToRealtime();

		return () => {
			cancelled = true;
			if (debounceTimer) clearTimeout(debounceTimer);
			if (recoveryTimer) clearTimeout(recoveryTimer);
			if (channel) void supabase.removeChannel(channel);
		};
	}, [supabaseUser?.id, session?.access_token]);

	const realtimeConversationIds = conversations
		.map((conversation) => conversation.id)
		.sort()
		.join(",");

	useEffect(() => {
		if (
			!isSupabaseConfigured() ||
			!supabaseUser?.id ||
			!session?.access_token ||
			!realtimeConversationIds
		)
			return;

		supabase.realtime.setAuth(session.access_token);
		let cancelled = false;
		const handleBroadcast = (
			payload: any,
			eventType: "INSERT" | "UPDATE" | "DELETE",
		) => {
			const row =
				payload?.record ||
				payload?.new ||
				payload?.old_record ||
				payload?.old;
			if (!row?.conversation_id) return;
			if (eventType === "UPDATE") {
				if (row.is_read === true) {
					setConversations((previous) =>
						previous.map((conversation) =>
							conversation.id === row.conversation_id
								? {
										...conversation,
										unread: false,
										unreadCount: 0,
									}
								: conversation,
						),
					);
				}
				return;
			}
			if (eventType === "DELETE") {
				setMessages((previous) => ({
					...previous,
					[row.conversation_id]: (
						previous[row.conversation_id] || []
					).filter((message) => message.id !== row.id),
				}));
				return;
			}
			const senderProfile =
				profilesRef.current[row.sender_id];
			const message: Message = {
				id: row.id,
				conversationId: row.conversation_id,
				senderId: row.sender_id,
				senderName:
					senderProfile?.full_name || "Utilisateur",
				text: row.content,
				createdAt: row.created_at,
			};
			setMessages((previous) => {
				const current = previous[row.conversation_id] || [];
				if (current.some((item) => item.id === message.id))
					return previous;
				return {
					...previous,
					[row.conversation_id]: [...current, message],
				};
			});
			setConversations((previous) =>
				previous.map((conversation) =>
					conversation.id === row.conversation_id
						? {
								...conversation,
								lastMessage: row.content,
								updatedAt: row.created_at,
								...(row.sender_id !== supabaseUser.id
									? {
											unread: true,
											unreadCount:
												(conversation.unreadCount || 0) + 1,
										}
									: {}),
							}
						: conversation,
				),
			);
		};
		const channels = conversations.map((conversation) => {
			const channel = supabase
				.channel(`conversation:${conversation.id}`, {
					config: { private: true },
				})
				.on(
					"broadcast",
					{ event: "INSERT" },
					({ payload }) => {
						if (cancelled) return;
						handleBroadcast(payload, "INSERT");
					},
				)
				.on(
					"broadcast",
					{ event: "UPDATE" },
					({ payload }) => {
						if (cancelled) return;
						handleBroadcast(payload, "UPDATE");
					},
				)
				.on(
					"broadcast",
					{ event: "DELETE" },
					({ payload }) => {
						if (cancelled) return;
						handleBroadcast(payload, "DELETE");
					},
				)
				.subscribe((status, error) => {
					if (
						status === "CHANNEL_ERROR" ||
						status === "TIMED_OUT"
					) {
						console.error(
							`Supabase Broadcast error (${conversation.id}):`,
							error || status,
						);
					}
				});
			return channel;
		});

		return () => {
			cancelled = true;
			channels.forEach((channel) => {
				void supabase.removeChannel(channel);
			});
		};
	}, [
		realtimeConversationIds,
		supabaseUser?.id,
		session?.access_token,
	]);

	useEffect(() => {
		setIsLoadingListings(true);
		const timer = setTimeout(
			() => setIsLoadingListings(false),
			300,
		);
		return () => clearTimeout(timer);
	}, [filters]);

	// ── Auth sync ────────────────────────────────────────────────────────────
	useEffect(() => {
		const isOAuthGoogle = supabaseUser?.app_metadata?.provider === "google";
		if (supabaseUser && (supabaseUser.email_confirmed_at || (supabaseUser as any).confirmed_at || isOAuthGoogle)) {
			let pendingOauthRole: string | undefined;
			try {
				const raw =
					localStorage.getItem("kawral_pending_oauth_registration") ||
					sessionStorage.getItem("kawral_pending_oauth_registration");
				if (raw) {
					pendingOauthRole = JSON.parse(raw)?.role;
				}
			} catch {}

			setCurrentUser((prev) => {
				// SÉCURITÉ : Seul le profil en base (profile?.role === "admin") peut conférer le rôle "admin".
				// user_metadata et localStorage ne peuvent attribuer que "client" ou "seller".
				const roleMapped: User["role"] =
					profile?.role === "admin"
						? "admin"
						: prev?.id === supabaseUser.id && prev?.role === "seller"
							? "seller"
							: pendingOauthRole === "seller"
								? "seller"
								: profile?.role
									? toAppRole(profile.role)
									: toSafeRegistrationAppRole(
											supabaseUser.user_metadata?.role,
										);

				const isRealUrl = (url?: string) =>
					!!url &&
					!url.startsWith("data:") &&
					Boolean(sanitizeSafeUrl(url));
				const resolvedAvatar = isRealUrl(
					profile?.avatar_url ?? undefined,
				)
					? sanitizeSafeUrl(profile!.avatar_url!)
					: isRealUrl(supabaseUser.user_metadata?.avatar_url)
						? sanitizeSafeUrl(supabaseUser.user_metadata.avatar_url)
						: isRealUrl(prev?.avatar)
							? sanitizeSafeUrl(prev!.avatar!)
							: "";
				const resolvedBanner = isRealUrl(
					(profile as any)?.banner_url,
				)
					? sanitizeSafeUrl((profile as any).banner_url)
					: isRealUrl(supabaseUser.user_metadata?.banner_url)
						? sanitizeSafeUrl(supabaseUser.user_metadata.banner_url)
						: isRealUrl(prev?.banner)
							? sanitizeSafeUrl(prev!.banner!)
							: "";

				const resolvedPhone =
					prev?.phone && prev.phone.trim().length >= 9 && prev.phone !== "+221 77 000 00 00"
						? prev.phone
						: profile?.phone ||
							supabaseUser.user_metadata?.phone ||
							"";

				return {
					id: supabaseUser.id,
					name:
						profile?.full_name ||
						supabaseUser.user_metadata?.full_name ||
						supabaseUser.email?.split("@")[0] ||
						prev?.name ||
						"Utilisateur",
					email: supabaseUser.email || prev?.email || "",
					role: roleMapped,
					phone: resolvedPhone,
					avatar: resolvedAvatar,
					banner: resolvedBanner,
					verified: {
						email: Boolean(
							supabaseUser.email_confirmed_at ||
							(profile as any)?.email_verified,
						),
						phone: !!(
							profile?.phone ||
							supabaseUser.user_metadata?.phone ||
							prev?.verified?.phone
						),
					},
					createdAt: profile?.created_at
						? profile.created_at.split("T")[0]
						: prev?.createdAt ||
							new Date().toISOString().split("T")[0],
				};
			});
		} else if (!supabaseUser && isSupabaseConfigured()) {
			if (!window.location.pathname.includes("/auth/callback")) {
				setCurrentUser(null);
			}
		}
	}, [profile, supabaseUser]);

	useEffect(() => {
		let cancelled = false;

		const loadFavorites = async () => {
			if (
				!currentUser?.id ||
				(currentUser.role !== "client" && currentUser.role !== "seller")
			) {
				setFavorites([]);
				return;
			}

			const loadedFavorites =
				await favoritesService.getFavorites(currentUser.id);
			if (!cancelled) setFavorites(loadedFavorites);
		};

		loadFavorites();
		return () => {
			cancelled = true;
		};
	}, [currentUser?.id, currentUser?.role]);

	// ── Navigation ───────────────────────────────────────────────────────────
	const currentView = (() => {
		const path = location.pathname;
		if (path === "/") return "home";
		if (
			path.startsWith("/explorer") ||
			path.startsWith("/categories")
		)
			return "search";
		if (
			path.startsWith("/listings/") ||
			path.startsWith("/annonces/") ||
			path.startsWith("/annonce/")
		)
			return "listing-detail";
		if (path.endsWith("/messages")) return "messaging";
		if (path.startsWith("/dashboard/client/favorites"))
			return "favorites";
		if (path.startsWith("/dashboard/client"))
			return "client-dashboard";
		if (path.startsWith("/dashboard/seller"))
			return "seller-dashboard";
		if (path.startsWith("/admin")) return "admin-dashboard";
		return "home";
	})();

	const setCurrentView = (view: string) => {
		const createListingPath = "/dashboard/seller/listings/new";

		const rolePath =
			currentUser?.role === "seller"
				? "/dashboard/seller"
				: "/dashboard/client";

		const destinations: Record<string, string> = {
			home: "/",
			search: "/explorer",
			"create-listing": createListingPath,
			"client-dashboard": "/dashboard/client",
			"seller-dashboard": "/dashboard/seller",
			"admin-dashboard": "/admin",
			favorites: "/dashboard/client/favorites",
			messaging: `${rolePath}/messages`,
			appointments: `${rolePath}/appointments`,
			"listing-detail": selectedListingId
				? `/listings/${selectedListingId}`
				: "/explorer",
		};
		navigate(destinations[view] || "/");
		window.scrollTo({ top: 0, behavior: "instant" });
	};

	// ── Favorites ────────────────────────────────────────────────────────────
	const toggleFavorite = async (id: string) => {
		if (
			!currentUser ||
			(currentUser.role !== "client" && currentUser.role !== "seller")
		) {
			addToast(
				"Connectez-vous avec un compte client ou vendeur pour gérer vos favoris.",
				"info",
			);
			return;
		}

		const wasFavorite = favorites.includes(id);
		setFavorites((prev) =>
			wasFavorite
				? prev.filter((favoriteId) => favoriteId !== id)
				: [...prev, id],
		);

		const saved = wasFavorite
			? await favoritesService.removeFavorite(
					currentUser.id,
					id,
				)
			: await favoritesService.addFavorite(
					currentUser.id,
					id,
				);

		if (!saved) {
			setFavorites((prev) =>
				wasFavorite
					? [...prev, id]
					: prev.filter((favoriteId) => favoriteId !== id),
			);
			addToast(
				"Impossible de mettre à jour vos favoris.",
				"error",
			);
			return;
		}

		addToast(
			wasFavorite
				? "Annonce retirée de vos favoris"
				: "Annonce ajoutée à vos favoris !",
			wasFavorite ? "info" : "success",
		);
	};
	const isFavorite = (id: string) => favorites.includes(id);

	// ── Upgrade client to seller ──────────────────────────────────────────────
	const upgradeToSeller = async (): Promise<boolean> => {
		if (!currentUser?.id) return false;
		try {
			if (isSupabaseConfigured()) {
				// 1. Essayer la fonction RPC sécurisée (SECURITY DEFINER)
				const { data: rpcSuccess, error: rpcError } = await (supabase.rpc as any)("upgrade_user_to_seller");

				if (rpcError || !rpcSuccess) {
					// Fallback si la fonction RPC n'a pas encore été appliquée
					await profileService.saveProfile(currentUser.id, {
						role: "vendeur",
					});
				}

				// 2. Mettre à jour les métadonnées auth.users
				await supabase.auth.updateUser({
					data: { role: "seller" },
				});

				// 3. Rafraîchir le profil dans AuthContext
				await refreshProfile();
			}

			// 4. Mettre à jour l'utilisateur courant dans AppContext
			setCurrentUser((prev) =>
				prev ? { ...prev, role: "seller" } : null,
			);
			return true;
		} catch (error) {
			console.error("upgradeToSeller error:", error);
			return false;
		}
	};

	// ── Role switch ──────────────────────────────────────────────────────────
	const switchRole = (
		roleKey:
			| "client"
			| "seller"
			| "admin"
			| "visitor",
	) => {
		if (roleKey === "visitor") {
			setCurrentUser(null);
			void supabase.auth.signOut();
			addToast("Mode Visiteur activé (déconnecté)", "info");
		} else if (currentUser) {
			// SÉCURITÉ : Interdire strictement l'escalade locale vers admin
			if (roleKey === "admin" && profile?.role !== "admin") {
				addToast("Accès refusé : privilèges administrateur requis.", "error");
				return;
			}
			setCurrentUser({
				...currentUser,
				role: roleKey as any,
			});
			addToast(
				`Mode ${roleKey.toUpperCase()} activé`,
				"info",
			);
		} else setAuthModalOpen(true);
	};

	const resetFilters = () => setFilters(initialFilters);

	const markConversationRead = async (
		conversationId: string,
	) => {
		const previousConversation = conversations.find(
			(conversation) => conversation.id === conversationId,
		);
		setConversations((previous) =>
			previous.map((conversation) =>
				conversation.id === conversationId
					? {
							...conversation,
							unread: false,
							unreadCount: 0,
						}
					: conversation,
			),
		);
		if (supabaseUser?.id) {
			const marked =
				await messagesService.markConversationRead(
					conversationId,
					supabaseUser.id,
				);
			if (!marked && previousConversation) {
				setConversations((previous) =>
					previous.map((conversation) =>
						conversation.id === conversationId
							? previousConversation
							: conversation,
					),
				);
				addToast(
					"Impossible de marquer les messages comme lus.",
					"error",
				);
			}
		}
	};

	// ── Extracted hooks ──────────────────────────────────────────────────────
	const listingsActions = useListingsActions({
		listings,
		setListings,
		currentUserId: currentUser?.id,
		currentUserRole: currentUser?.role,
		refetchListings,
		addToast,
	});

	const conversationsActions = useConversationsActions({
		conversations,
		setConversations,
		messages,
		setMessages,
		currentUserId: currentUser?.id,
		currentUserName: currentUser?.name,
		addToast,
	});

	const appointmentsActions = useAppointmentsActions({
		setAppointments,
		currentUserId: currentUser?.id,
		refetchListings,
		addToast,
	});

	// ── Reports ──────────────────────────────────────────────────────────────
	const submitReport = async (
		listingId: string,
		listingTitle: string,
		reason: Report["reason"],
		details: string,
	) => {
		const repId = generateUUID();
		const cleanTitle = (listingTitle || "").trim().slice(0, 200);
		const cleanDetails = (details || "").trim().slice(0, 1000);
		const newReport: Report = {
			id: repId,
			listingId,
			listingTitle: cleanTitle,
			reporterEmail:
				currentUser?.email || "signalement@kawral.sn",
			reason,
			details: cleanDetails,
			status: "pending",
			createdAt: new Date().toISOString().split("T")[0],
		};
		setReports((prev) => [newReport, ...prev]);
		if (isSupabaseConfigured()) {
			try {
				await (supabase.from as any)("reports").insert({
					id: repId,
					listing_id: toValidUUID(listingId),
					reporter_email:
						currentUser?.email || "signalement@kawral.sn",
					reason,
					details: cleanDetails,
					status: "pending",
				});
			} catch (err) {
				console.warn("Report DB save skipped/error:", err);
			}
		}
		addToast(
			"Merci. Le signalement a été transmis à l'équipe de modération.",
			"success",
		);
	};

	const dismissReport = async (reportId: string) => {
		if (currentUser?.role !== "admin" || profile?.role !== "admin") {
			addToast("Action réservée aux administrateurs.", "error");
			return;
		}
		setReports((prev) => prev.filter((r) => r.id !== reportId));
		if (isSupabaseConfigured()) {
			try {
				await (supabase.from as any)("reports").delete().eq("id", toValidUUID(reportId));
			} catch (err) {
				console.warn("Report deletion skipped/error:", err);
			}
		}
		addToast("Signalement traité et retiré.", "info");
	};

	return (
		<AppContext.Provider
			value={{
				currentUser,
				setCurrentUser,
				upgradeToSeller,
				switchRole,
				listings,
				isLoadingListings,
				setIsLoadingListings,
				refetchListings,
				favorites,
				toggleFavorite,
				isFavorite,
				filters,
				setFilters,
				resetFilters,
				...listingsActions,
				conversations,
				messages,
				markConversationRead,
				...conversationsActions,
				appointments,
				...appointmentsActions,
				reports,
				submitReport,
				dismissReport,
				toasts,
				addToast,
				removeToast,
				authModalOpen,
				setAuthModalOpen,
				authModalMode,
				setAuthModalMode,
				onboardingModalOpen,
				setOnboardingModalOpen,
				becomeSellerModalOpen,
				setBecomeSellerModalOpen,
				currentView,
				setCurrentView,
				isNavigating: false,
				selectedListingId,
				setSelectedListingId,
				selectedConversationId,
				setSelectedConversationId,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export const useApp = () => {
	const context = useContext(AppContext);
	if (!context)
		throw new Error(
			"useApp must be used within an AppProvider",
		);
	return context;
};
