import React, { useEffect, useState, useRef } from "react";
import {
	Navigate,
	Route,
	Routes,
	useLocation,
	useNavigate,
	useParams,
} from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { toAppRole, toDbRole, getRoleDashboardPath } from "../utils/roles";

// Pages
import { HomePage } from "../features/marketplace/pages/HomePage";
import { SearchPage } from "../features/marketplace/pages/SearchPage";
import { ListingDetailPage } from "../features/marketplace/pages/ListingDetailPage";
import { CreateListingPage } from "../features/seller/pages/CreateListingPage";
import { ClientDashboard } from "../features/client/pages/ClientDashboard";
import { SellerDashboard } from "../features/seller/pages/SellerDashboard";
import { AdminDashboard } from "../features/admin/pages/AdminDashboard";
import { MessagingPage } from "../features/shared/pages/MessagingPage";
import { AppointmentsPage } from "../features/shared/pages/AppointmentsPage";
import { FavoritesPage } from "../features/client/pages/FavoritesPage";
import { NotFoundPage } from "../features/shared/pages/NotFoundPage";
import { ResetPasswordPage } from "../features/shared/pages/ResetPasswordPage";
import { PrivacyPolicyPage } from "../features/legal/pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "../features/legal/pages/TermsOfServicePage";

// --- Route Helper Components ---

const RouteLoadingFallback: React.FC = () => (
	<div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-kawral-muted text-sm">
		<div className="w-8 h-8 border-3 border-kawral-green border-t-transparent rounded-full animate-spin" />
		<p className="font-semibold text-kawral-dark">Chargement de votre espace sécurisé...</p>
	</div>
);

/** Protège une route : redirige vers /auth/login si l'utilisateur n'est pas connecté */
const ProtectedRoute: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const { session, loading } = useAuth();
	const { currentUser } = useApp();
	if (loading && !session && !currentUser) return <RouteLoadingFallback />;
	if (!session && !currentUser)
		return <Navigate to="/auth/login" replace />;
	return <>{children}</>;
};

/** Filtre les annonces par catégorie via le slug URL */
const CategoryExplorer: React.FC = () => {
	const { slug } = useParams<{ slug: string }>();
	const { setFilters } = useApp();

	useEffect(() => {
		setFilters((filters) => ({
			...filters,
			category: slug || "",
		}));
	}, [setFilters, slug]);

	return <SearchPage />;
};

/** Ouvre la modale d'authentification selon le chemin URL */
const AuthRoute: React.FC = () => {
	const { pathname } = useLocation();
	const { currentUser, setAuthModalOpen, setAuthModalMode } = useApp();
	const { session, loading } = useAuth();
	const isAuthenticated = Boolean(session || currentUser);
	const mode =
		pathname.includes("forgot") ||
		pathname.includes("reset")
			? "forgot"
			: pathname.includes("login")
				? "login"
				: "register";

	useEffect(() => {
		if (loading || isAuthenticated) {
			if (isAuthenticated) setAuthModalOpen(false);
			return;
		}
		setAuthModalMode(mode);
		setAuthModalOpen(true);
	}, [
		loading,
		mode,
		isAuthenticated,
		setAuthModalMode,
		setAuthModalOpen,
	]);

	if (loading) return null;
	if (isAuthenticated) return <Navigate to="/" replace />;

	return <div className="flex-1" aria-hidden="true" />;
};

/** Redirige l'utilisateur après l'authentification selon son rôle */
const AuthCallback: React.FC = () => {
	const navigate = useNavigate();
	const { addToast, setCurrentUser } = useApp();
	const { refreshProfile } = useAuth();
	const isResolvingRef = useRef(false);

	useEffect(() => {
		// 1. Gère les erreurs renvoyées par Google ou Supabase (?error=... ou #error=...)
		const searchParams = new URLSearchParams(window.location.search);
		const hashClean = window.location.hash.startsWith("#")
			? window.location.hash.substring(1)
			: "";
		const hashParams = new URLSearchParams(hashClean);

		const err = searchParams.get("error") || hashParams.get("error");
		const desc =
			searchParams.get("error_description") ||
			hashParams.get("error_description");

		if (err || desc) {
			console.error("Google OAuth callback error:", { err, desc });
			if (err === "access_denied") {
				addToast("Connexion avec Google annulée.", "info");
			} else {
				const message =
					desc || err || "Erreur lors de la connexion avec Google.";
				addToast(`Erreur Google : ${message}`, "error");
			}
			navigate("/auth/login", { replace: true });
			return;
		}

		// 2. Gère le hash de reset password renvoyé par Supabase (#access_token=...&type=recovery)
		if (
			window.location.hash &&
			window.location.hash.includes("type=recovery")
		) {
			window.location.replace(
				"/auth/reset-password" + window.location.hash,
			);
			return;
		}

		// Empêcher les doubles exécutions concurrentes (StrictMode)
		if (isResolvingRef.current) return;
		isResolvingRef.current = true;

		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const resolveOAuth = async () => {
			try {
				const code = searchParams.get("code");

				// Récupérer la session Supabase
				let activeSession: Session | null = null;

				// Supabase v2 avec detectSessionInUrl: true gère automatiquement l'échange PKCE dans getSession()
				const { data: sessData } = await supabase.auth.getSession();
				activeSession = sessData?.session ?? null;

				// Si pas encore de session mais qu'un code PKCE est présent dans l'URL, tenter l'échange explicite si non fait
				if (!activeSession && code) {
					try {
						const { data: exchangeData, error: exchangeErr } =
							await supabase.auth.exchangeCodeForSession(code);
						if (!exchangeErr && exchangeData?.session) {
							activeSession = exchangeData.session;
						}
					} catch (e) {
						console.warn("AuthCallback exchangeCodeForSession catch:", e);
					}
				}

				// Si toujours pas de session, écouter brièvement l'événement SIGNED_IN de Supabase (max 2s)
				if (!activeSession?.user) {
					activeSession = await new Promise<Session | null>((resolve) => {
						const timer = setTimeout(() => {
							resolve(null);
						}, 2000);

						const { data: authSub } = supabase.auth.onAuthStateChange(
							(event, sess) => {
								if (
									sess?.user &&
									(event === "SIGNED_IN" ||
										event === "INITIAL_SESSION" ||
										event === "TOKEN_REFRESHED")
								) {
									clearTimeout(timer);
									authSub.subscription.unsubscribe();
									resolve(sess);
								}
							},
						);
					});
				}

				// Si aucune session n'est disponible après attente, rediriger vers login
				if (!activeSession?.user) {
					console.warn(
						"AuthCallback: Aucune session active après attente OAuth.",
					);
					navigate("/auth/login", { replace: true });
					return;
				}

				// Déterminer le rôle cible (query param > storage > meta > client)
				let pendingRole: string | undefined =
					searchParams.get("role") || undefined;
				try {
					const raw =
						localStorage.getItem("kawral_pending_oauth_registration") ||
						sessionStorage.getItem("kawral_pending_oauth_registration");
					if (raw) {
						const parsed = JSON.parse(raw);
						if (!pendingRole) pendingRole = parsed?.role;
					}
				} catch (e) {
					console.warn("Erreur lecture pending oauth:", e);
				}

				const targetRole = toAppRole(
					pendingRole ||
						activeSession.user.user_metadata?.role ||
						"client",
				);
				const dbRole = toDbRole(targetRole);
				const userId = activeSession.user.id;
				const userMeta = activeSession.user.user_metadata || {};
				const fullName =
					userMeta.full_name ||
					userMeta.name ||
					activeSession.user.email?.split("@")[0] ||
					"Utilisateur";
				const avatarUrl =
					userMeta.avatar_url || userMeta.picture || null;
				const existingPhone =
					userMeta.phone || "";

				// 1. Mettre à jour immédiatement l'utilisateur dans AppContext SANS ATTENDRE
				setCurrentUser({
					id: userId,
					name: fullName,
					email: activeSession.user.email || "",
					role: targetRole,
					phone: existingPhone,
					avatar: avatarUrl || "",
					verified: {
						email: true,
						phone: Boolean(existingPhone && existingPhone.trim().length >= 9),
					},
					createdAt: new Date().toISOString().split("T")[0],
				});

				// 2. Redirection IMMÉDIATE vers le dashboard pour afficher la modale téléphone instantanément
				const destination = getRoleDashboardPath(targetRole);
				navigate(destination, { replace: true });

				// 3. Synchronisation en arrière-plan sans bloquer l'UI (Fire-and-forget)
				void (async () => {
					try {
						const profilePayload: Record<string, any> = {
							id: userId,
							full_name: fullName,
							email: activeSession.user.email,
							role: dbRole,
							updated_at: new Date().toISOString(),
						};
						if (avatarUrl) profilePayload.avatar_url = avatarUrl;
						if (existingPhone) profilePayload.phone = existingPhone;

						await (supabase.from as any)("profiles").upsert(profilePayload, {
							onConflict: "id",
						});

						if (targetRole === "seller" && userMeta.role !== "seller") {
							await supabase.auth.updateUser({
								data: { role: "seller" },
							});
						}

						// Nettoyer le pending registration une fois synchronisé
						localStorage.removeItem("kawral_pending_oauth_registration");
						sessionStorage.removeItem("kawral_pending_oauth_registration");

						if (refreshProfile) {
							void refreshProfile();
						}
					} catch (bgErr) {
						console.warn("Background OAuth sync error:", bgErr);
					}
				})();
			} catch (err) {
				console.error("Erreur résolution OAuth callback:", err);
				navigate("/auth/login", { replace: true });
			}
		};

		void resolveOAuth();

		// Timeout de sécurité réduit : 2s max au lieu de 3.5s
		timeoutId = setTimeout(() => {
			console.warn("AuthCallback: Timeout de sécurité déclenché.");
			supabase.auth.getSession().then(({ data: { session: sess } }) => {
				if (sess?.user) {
					const role = toAppRole(sess.user.user_metadata?.role);
					navigate(getRoleDashboardPath(role), { replace: true });
				} else {
					navigate("/auth/login", { replace: true });
				}
			});
		}, 2000);

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [navigate, addToast, setCurrentUser, refreshProfile]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-kawral-muted text-sm">
			<div className="w-8 h-8 border-3 border-kawral-green border-t-transparent rounded-full animate-spin" />
			<p className="font-semibold text-kawral-dark">Finalisation de la connexion sécurisée...</p>
		</div>
	);
};

/** Protège une route par rôle requis */
const RoleProtectedRoute: React.FC<{
	allowedRoles: ("client" | "seller" | "admin")[];
	children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
	const { session, loading } = useAuth();
	const { currentUser } = useApp();

	if (loading && !session && !currentUser) return <RouteLoadingFallback />;

	// Redirige vers /auth/login uniquement si aucun utilisateur n'est authentifié
	if (!session && !currentUser)
		return <Navigate to="/auth/login" replace />;

	if (!currentUser) return <RouteLoadingFallback />;

	if (!allowedRoles.includes(currentUser.role as any)) {
		const fallback =
			currentUser.role === "admin"
				? "/admin"
				: `/dashboard/${currentUser.role}`;
		return <Navigate to={fallback} replace />;
	}
	return <>{children}</>;
};

// --- App Routes ---

export const AppRoutes: React.FC = () => {
	return (
		<Routes>
			{/* Public */}
			<Route path="/" element={<HomePage />} />
			<Route path="/explorer" element={<SearchPage />} />
			<Route
				path="/explorer/:slug"
				element={<CategoryExplorer />}
			/>
			<Route
				path="/categories"
				element={<CategoryExplorer />}
			/>
			<Route
				path="/categories/:slug"
				element={<CategoryExplorer />}
			/>
			<Route
				path="/listings/:id"
				element={<ListingDetailPage />}
			/>
			<Route
				path="/annonces/:id"
				element={<ListingDetailPage />}
			/>
			<Route
				path="/annonce/:id"
				element={<ListingDetailPage />}
			/>
			<Route path="/agencies" element={<Navigate to="/explorer" replace />} />
			<Route
				path="/agencies/:id"
				element={<Navigate to="/explorer" replace />}
			/>

			{/* Legal Pages (Google OAuth & Regulatory Compliance) */}
			<Route path="/privacy" element={<PrivacyPolicyPage />} />
			<Route
				path="/politique-de-confidentialite"
				element={<Navigate to="/privacy" replace />}
			/>
			<Route path="/terms" element={<TermsOfServicePage />} />
			<Route
				path="/conditions-utilisation"
				element={<Navigate to="/terms" replace />}
			/>

			{/* Auth */}
			<Route path="/auth/login" element={<AuthRoute />} />
			<Route
				path="/auth/register"
				element={<AuthRoute />}
			/>
			<Route
				path="/auth/register/client"
				element={<AuthRoute />}
			/>
			<Route
				path="/auth/register/seller"
				element={<AuthRoute />}
			/>
			<Route
				path="/auth/register/agency"
				element={<Navigate to="/auth/register" replace />}
			/>
			<Route
				path="/auth/forgot-password"
				element={<AuthRoute />}
			/>
			<Route
				path="/auth/reset-password"
				element={<ResetPasswordPage />}
			/>
			<Route
				path="/auth/callback"
				element={<AuthCallback />}
			/>

			{/* Dashboard Client */}
			<Route
				path="/dashboard/client/favorites"
				element={
					<ProtectedRoute>
						<FavoritesPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/dashboard/client/messages"
				element={
					<ProtectedRoute>
						<MessagingPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/dashboard/client/appointments"
				element={
					<ProtectedRoute>
						<AppointmentsPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/appointments"
				element={
					<ProtectedRoute>
						<AppointmentsPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/dashboard/client/*"
				element={
					<ProtectedRoute>
						<ClientDashboard />
					</ProtectedRoute>
				}
			/>

			{/* Dashboard Vendeur */}
			<Route
				path="/dashboard/seller/listings/new"
				element={
					<RoleProtectedRoute allowedRoles={["seller"]}>
						<CreateListingPage />
					</RoleProtectedRoute>
				}
			/>
			<Route
				path="/dashboard/seller/listings/:id/edit"
				element={
					<RoleProtectedRoute allowedRoles={["seller"]}>
						<CreateListingPage />
					</RoleProtectedRoute>
				}
			/>
			<Route
				path="/dashboard/seller/messages"
				element={
					<RoleProtectedRoute allowedRoles={["seller"]}>
						<MessagingPage />
					</RoleProtectedRoute>
				}
			/>
			<Route
				path="/dashboard/seller/appointments"
				element={
					<RoleProtectedRoute allowedRoles={["seller"]}>
						<AppointmentsPage />
					</RoleProtectedRoute>
				}
			/>
			<Route
				path="/dashboard/seller/*"
				element={
					<RoleProtectedRoute allowedRoles={["seller"]}>
						<SellerDashboard />
					</RoleProtectedRoute>
				}
			/>

			{/* Redirection ancienne route Agence */}
			<Route
				path="/dashboard/agency/*"
				element={<Navigate to="/dashboard/seller" replace />}
			/>
			<Route
				path="/dashboard/agency"
				element={<Navigate to="/dashboard/seller" replace />}
			/>

			{/* Admin */}
			<Route
				path="/admin/*"
				element={
					<RoleProtectedRoute allowedRoles={["admin"]}>
						<AdminDashboard />
					</RoleProtectedRoute>
				}
			/>

			{/* 404 */}
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
};
