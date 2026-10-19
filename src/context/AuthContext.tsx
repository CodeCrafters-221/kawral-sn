import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef,
} from "react";
import {
	Session,
	User as SupabaseUser,
} from "@supabase/supabase-js";
import {
	supabase,
	isSupabaseConfigured,
	Database,
} from "../lib/supabase";
import { UserRole } from "../types";
import { toAppRole, toDbRole } from "../utils/roles";

type ProfileRow =
	Database["public"]["Tables"]["profiles"]["Row"];

interface AuthContextType {
	session: Session | null;
	supabaseUser: SupabaseUser | null;
	profile: ProfileRow | null;
	loading: boolean;
	isConfigured: boolean;

	signUpWithEmail: (
		email: string,
		password: string,
		options?: {
			fullName?: string;
			phone?: string;
			role?: UserRole;
		},
	) => Promise<{ data: any; error: any }>;

	signInWithEmail: (
		email: string,
		password: string,
	) => Promise<{ data: any; error: any }>;

	signOut: () => Promise<void>;

	resetPassword: (
		email: string,
	) => Promise<{ data: any; error: any }>;

	resendVerificationEmail: (
		email: string,
	) => Promise<{ data: any; error: any }>;

	signInWithGoogle: (options?: {
		role?: UserRole;
	}) => Promise<{ data: any; error: any }>;

	refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<
	AuthContextType | undefined
>(undefined);

export const AuthProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	const [session, setSession] = useState<Session | null>(
		null,
	);
	const [supabaseUser, setSupabaseUser] =
		useState<SupabaseUser | null>(null);
	const [profile, setProfile] = useState<ProfileRow | null>(
		null,
	);
	const [loading, setLoading] = useState<boolean>(true);
	const configured = isSupabaseConfigured();

	const activeFetchPromiseRef = useRef<Promise<void> | null>(null);

	const fetchProfile = async (
		userId: string,
		currentUserMeta?: any,
	) => {
		if (activeFetchPromiseRef.current) {
			return activeFetchPromiseRef.current;
		}

		const promise = (async () => {
			try {
				const { data } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", userId)
					.maybeSingle();

				let oauthPending: {
					role?: UserRole;
					agencyName?: string;
					agencyAddress?: string;
				} | null = null;
				try {
					const stored =
						localStorage.getItem("kawral_pending_oauth_registration") ||
						sessionStorage.getItem("kawral_pending_oauth_registration");
					if (stored) {
						oauthPending = JSON.parse(stored);
					}
				} catch (e) {
					console.warn("Could not read oauth pending registration:", e);
				}

				const metaRole = (currentUserMeta?.role || supabaseUser?.user_metadata?.role) as string | undefined;
				const effectivePendingRole: UserRole | undefined =
					oauthPending?.role
						? toAppRole(oauthPending.role)
						: metaRole
							? toAppRole(metaRole)
							: undefined;

				const requestedDbRole = toDbRole(effectivePendingRole);

				if (data) {
					const profileData = data as any;

					if (effectivePendingRole && profileData.role !== requestedDbRole) {
						if (requestedDbRole === "vendeur") {
							try {
								await (supabase.rpc as any)("upgrade_user_to_seller");
							} catch (rpcEx) {
								console.warn("fetchProfile upgrade_user_to_seller RPC warning:", rpcEx);
							}
						}

						// 1. Attempt database profile update
						const { error: roleError } = await (supabase.from as any)("profiles")
							.update({
								role: requestedDbRole,
								updated_at: new Date().toISOString(),
							})
							.eq("id", userId);

						if (roleError) {
							console.warn("OAuth role update DB warning:", roleError.message);
						}

						// 2. ALWAYS enforce the requested role in local profile data
						profileData.role = requestedDbRole;

						// 3. Update user_metadata in auth.users only if different
						if (currentUserMeta?.role !== effectivePendingRole && supabaseUser?.user_metadata?.role !== effectivePendingRole) {
							await supabase.auth.updateUser({
								data: { role: effectivePendingRole },
							});
						}
					}

					const isConfirmed = Boolean(
						supabaseUser?.email_confirmed_at || profileData.email_verified,
					);
					const googleAvatar = currentUserMeta?.avatar_url || currentUserMeta?.picture;
					if (!profileData.avatar_url && googleAvatar) {
						profileData.avatar_url = googleAvatar;
						await (supabase.from as any)("profiles")
							.update({
								avatar_url: googleAvatar,
								updated_at: new Date().toISOString(),
							})
							.eq("id", userId);
					}

					const profileWithEmail = {
						...profileData,
						email: profileData.email || currentUserMeta?.email || null,
						email_verified: isConfirmed,
					};
					setProfile(profileWithEmail);

					if (!profileData.email && currentUserMeta?.email) {
						await (supabase.from as any)("profiles")
							.update({
								email: currentUserMeta.email.trim().toLowerCase(),
								updated_at: new Date().toISOString(),
							})
							.eq("id", userId);
					}
				} else {
					// Fallback if profile row is not yet in public.profiles table
					const userMeta =
						currentUserMeta ||
						supabaseUser?.user_metadata ||
						{};

					const chosenRole =
						effectivePendingRole ||
						toAppRole((userMeta.role as string) || "client");
					const dbRole = toDbRole(chosenRole);

					const googleAvatar = userMeta.avatar_url || userMeta.picture || null;

					const fallbackProfile: ProfileRow = {
						id: userId,
						full_name:
							userMeta.full_name ||
							userMeta.name ||
							supabaseUser?.email?.split("@")[0] ||
							"Utilisateur Kawral",
						email:
							userMeta.email || supabaseUser?.email || null,
						email_verified: Boolean(
							supabaseUser?.email_confirmed_at || userMeta.email_verified || true,
						),
						avatar_url: googleAvatar,
						banner_url: userMeta.banner_url || null,
						phone: userMeta.phone || null,
						role: dbRole,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					};

					setProfile(fallbackProfile);

					try {
						const payload: Record<string, any> = {
							id: userId,
							full_name: fallbackProfile.full_name,
							role: dbRole,
							phone: fallbackProfile.phone,
							updated_at: new Date().toISOString(),
						};

						const emailToSave = fallbackProfile.email?.trim().toLowerCase();
						if (emailToSave && emailToSave.includes("@")) {
							payload.email = emailToSave;
						}
						if (fallbackProfile.avatar_url) payload.avatar_url = fallbackProfile.avatar_url;
						if (fallbackProfile.banner_url) payload.banner_url = fallbackProfile.banner_url;

						const { error: upsertErr } = await (supabase.from as any)("profiles").upsert(
							payload,
						);

						if (upsertErr) {
							console.warn(
								"fetchProfile: initial upsert warning:",
								upsertErr.message,
							);
							await (supabase.from as any)("profiles").upsert({
								id: userId,
								full_name: fallbackProfile.full_name,
								role: dbRole,
							});
						}
					} catch (upsertEx) {
						console.warn("fetchProfile: upsert exception:", upsertEx);
					}

					if (effectivePendingRole && userMeta?.role !== effectivePendingRole) {
						await supabase.auth.updateUser({
							data: { role: effectivePendingRole },
						});
					}
				}

				// Safely clean up pending oauth storage once processed
				if (oauthPending) {
					try {
						localStorage.removeItem("kawral_pending_oauth_registration");
						sessionStorage.removeItem("kawral_pending_oauth_registration");
					} catch (e) {
						console.warn("Could not clear oauth storage:", e);
					}
				}
			} catch (err) {
				console.error("Error in fetchProfile:", err);
			} finally {
				setLoading(false);
				activeFetchPromiseRef.current = null;
			}
		})();

		activeFetchPromiseRef.current = promise;
		return promise;
	};

	useEffect(() => {
		if (!configured) {
			setLoading(false);
			return;
		}

		// Get initial active session
		supabase.auth
			.getSession()
			.then(({ data: { session } }) => {
				if (session?.user && !session.user.email_confirmed_at) {
					// L'adresse email n'a pas encore été confirmée
					setSession(null);
					setSupabaseUser(null);
					setProfile(null);
					setLoading(false);
					return;
				}
				setSession(session);
				setSupabaseUser(session?.user ?? null);
				if (session?.user) {
					void fetchProfile(
						session.user.id,
						session.user.user_metadata,
					);
				} else {
					const searchParams = new URLSearchParams(window.location.search);
					const hashClean = window.location.hash.startsWith("#")
						? window.location.hash.substring(1)
						: "";
					const hashParams = new URLSearchParams(hashClean);
					const hasErrorParam =
						searchParams.has("error") ||
						searchParams.has("error_description") ||
						hashParams.has("error") ||
						hashParams.has("error_description");
					const isOauthPending =
						!hasErrorParam &&
						(window.location.pathname.includes("/auth/callback") ||
							window.location.hash.includes("access_token") ||
							window.location.search.includes("code"));
					if (!isOauthPending) {
						setLoading(false);
					} else {
						// Timeout de sécurité pour éviter tout blocage indéfini
						setTimeout(() => {
							setLoading(false);
						}, 1500);
					}
				}
			});

		// Listen to real-time session changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			async (_event, session) => {
				if (session?.user && !session.user.email_confirmed_at) {
					// Compte non confirmé : refuser la session
					setSession(null);
					setSupabaseUser(null);
					setProfile(null);
					setLoading(false);
					return;
				}
				setSession(session);
				setSupabaseUser(session?.user ?? null);
				if (session?.user) {
					try {
						await fetchProfile(
							session.user.id,
							session.user.user_metadata,
						);
					} finally {
						setLoading(false);
					}
				} else {
					setProfile(null);
					setLoading(false);
				}
			},
		);

		return () => {
			subscription.unsubscribe();
		};
	}, [configured]);

	const signUpWithEmail = async (
		email: string,
		password: string,
		options?: {
			fullName?: string;
			phone?: string;
			role?: UserRole;
		},
	) => {
		if (!configured) {
			return {
				data: null,
				error: new Error(
					"Supabase n'est pas encore configuré avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.",
				),
			};
		}

		const roleMapped = toDbRole(options?.role);

		const cleanEmail = email.trim().toLowerCase();

		const res = await supabase.auth.signUp({
			email: cleanEmail,
			password,
			options: {
				data: {
					full_name: options?.fullName,
					phone: options?.phone,
					role: roleMapped,
				},
			},
		});

		// Protection anti-doublon Supabase (lorsque confirm_email est actif, identities vide indique un compte déjà existant)
		if (
			res.data?.user &&
			res.data.user.identities &&
			res.data.user.identities.length === 0
		) {
			return {
				data: null,
				error: new Error(
					"Cette adresse email est déjà enregistrée. Veuillez vous connecter.",
				),
			};
		}

		if (res.data.user && !res.error) {
			const isEmailConfirmed = Boolean(res.data.user.email_confirmed_at);

			// Upsert user profile row into public.profiles
			const { error: profileErr } = await supabase
				.from("profiles")
				.upsert({
					id: res.data.user.id,
					full_name:
						options?.fullName || cleanEmail.split("@")[0],
					email: cleanEmail,
					email_verified: isEmailConfirmed,
					phone: options?.phone || null,
					role: roleMapped as any,
					updated_at: new Date().toISOString(),
				} as any);

			if (profileErr) {
				console.warn(
					"Profile upsert warning:",
					profileErr.message,
				);
			}

			// Ne jamais connecter un compte dont l'email n'a pas été confirmé
			if (!isEmailConfirmed) {
				setSession(null);
				setSupabaseUser(null);
				return res;
			}

			if (res.data?.session) {
				setSession(res.data.session);
			}
			setSupabaseUser(res.data.user);

			await fetchProfile(res.data.user.id, {
				...res.data.user.user_metadata,
				email: res.data.user.email || cleanEmail,
			});
		}

		return res;
	};

	const signInWithEmail = async (
		email: string,
		password: string,
	) => {
		if (!configured) {
			return {
				data: null,
				error: new Error(
					"Supabase n'est pas encore configuré avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.",
				),
			};
		}
		const res = await supabase.auth.signInWithPassword({
			email: email.trim().toLowerCase(),
			password,
		});

		if (res.error) {
			return res;
		}

		// Si l'utilisateur n'a pas confirmé son email, déconnexion immédiate et refus d'accès
		if (res.data?.user && !res.data.user.email_confirmed_at) {
			await supabase.auth.signOut();
			setSession(null);
			setSupabaseUser(null);
			setProfile(null);
			return {
				data: null,
				error: new Error("Email not confirmed"),
			};
		}

		if (res.data?.session) {
			setSession(res.data.session);
		}
		if (res.data?.user) {
			setSupabaseUser(res.data.user);
			await fetchProfile(res.data.user.id, {
				...res.data.user.user_metadata,
				email: res.data.user.email || email,
			});
		}
		return res;
	};

	const signOut = async () => {
		if (configured) {
			await supabase.auth.signOut();
		}
		setSession(null);
		setSupabaseUser(null);
		setProfile(null);
	};

	const resetPassword = async (email: string) => {
		if (!configured) {
			return {
				data: null,
				error: new Error(
					"Supabase n'est pas encore configuré avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.",
				),
			};
		}
		return await supabase.auth.resetPasswordForEmail(
			email,
			{
				redirectTo: `${window.location.origin}/auth/reset-password`,
			},
		);
	};

	const resendVerificationEmail = async (email: string) => {
		if (!configured) {
			return {
				data: null,
				error: new Error(
					"Supabase n'est pas configuré.",
				),
			};
		}
		const cleanEmail = email.trim().toLowerCase();
		return await supabase.auth.resend({
			type: "signup",
			email: cleanEmail,
		});
	};

	const signInWithGoogle = async (options?: {
		role?: UserRole;
	}) => {
		if (!configured) {
			return {
				data: null,
				error: new Error(
					"Supabase n'est pas encore configuré avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.",
				),
			};
		}

		if (options?.role) {
			try {
				const pendingData = JSON.stringify({
					role: options.role,
					timestamp: Date.now(),
				});
				localStorage.setItem("kawral_pending_oauth_registration", pendingData);
				sessionStorage.setItem("kawral_pending_oauth_registration", pendingData);
			} catch (err) {
				console.warn("Could not save oauth registration in storage:", err);
			}
		} else {
			try {
				localStorage.removeItem("kawral_pending_oauth_registration");
				sessionStorage.removeItem("kawral_pending_oauth_registration");
			} catch (err) {
				console.warn("Could not clear oauth registration in storage:", err);
			}
		}

		const redirectTo = options?.role
			? `${window.location.origin}/auth/callback?role=${encodeURIComponent(options.role)}`
			: `${window.location.origin}/auth/callback`;

		console.info("[AuthContext] Initiating Google OAuth with redirectTo:", redirectTo);

		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo,
				queryParams: {
					prompt: "select_account",
				},
				...(options?.role && {
					data: {
						role: options.role,
					},
				}),
			} as any,
		});

		return { data, error };
	};

	const refreshProfile = async () => {
		if (supabaseUser) {
			await fetchProfile(supabaseUser.id);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				session,
				supabaseUser,
				profile,
				loading,
				isConfigured: configured,
				signUpWithEmail,
				signInWithEmail,
				signOut,
				resetPassword,
				resendVerificationEmail,
				signInWithGoogle,
				refreshProfile,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error(
			"useAuth must be used within an AuthProvider",
		);
	}
	return context;
};
