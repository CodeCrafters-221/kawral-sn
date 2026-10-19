import { createClient } from "@supabase/supabase-js";

// Supabase Database Schema TypeScript Types matching SQL schema
export type Database = {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					full_name: string | null;
					email: string | null;
					email_verified: boolean;
					avatar_url: string | null;
					banner_url: string | null;
					phone: string | null;
					role: "client" | "vendeur" | "agence" | "admin";
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					full_name?: string | null;
					email?: string | null;
					email_verified?: boolean;
					avatar_url?: string | null;
					banner_url?: string | null;
					phone?: string | null;
					role?: "client" | "vendeur" | "agence" | "admin";
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					full_name?: string | null;
					email?: string | null;
					email_verified?: boolean;
					avatar_url?: string | null;
					banner_url?: string | null;
					phone?: string | null;
					role?: "client" | "vendeur" | "agence" | "admin";
					updated_at?: string;
				};
			};
			agencies: {
				Row: {
					id: string;
					user_id: string;
					agency_name: string;
					logo_url: string | null;
					banner_url: string | null;
					description: string | null;
					address: string | null;
					phone: string | null;
					email: string | null;
					website: string | null;
					verified: boolean;
					is_blocked: boolean;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					agency_name: string;
					logo_url?: string | null;
					banner_url?: string | null;
					description?: string | null;
					address?: string | null;
					phone?: string | null;
					email?: string | null;
					website?: string | null;
					verified?: boolean;
					is_blocked?: boolean;
					created_at?: string;
				};
				Update: {
					agency_name?: string;
					logo_url?: string | null;
					banner_url?: string | null;
					description?: string | null;
					address?: string | null;
					phone?: string | null;
					email?: string | null;
					website?: string | null;
					verified?: boolean;
					is_blocked?: boolean;
				};
			};
			agency_availability: {
				Row: {
					id: string;
					agency_id: string;
					day_of_week: number;
					start_time: string;
					end_time: string;
					is_active: boolean;
				};
				Insert: {
					id?: string;
					agency_id: string;
					day_of_week: number;
					start_time: string;
					end_time: string;
					is_active?: boolean;
				};
				Update: {
					agency_id?: string;
					day_of_week?: number;
					start_time?: string;
					end_time?: string;
					is_active?: boolean;
				};
			};
			host_availability: {
				Row: {
					id: string;
					host_id: string;
					agency_id: string | null;
					day_of_week: number;
					start_time: string;
					end_time: string;
					is_active: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					host_id: string;
					agency_id?: string | null;
					day_of_week: number;
					start_time: string;
					end_time: string;
					is_active?: boolean;
				};
				Update: {
					host_id?: string;
					agency_id?: string | null;
					day_of_week?: number;
					start_time?: string;
					end_time?: string;
					is_active?: boolean;
					updated_at?: string;
				};
			};
			categories: {
				Row: {
					id: string;
					name: string;
					slug: string;
					parent_id: string | null;
					icon_url: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					slug: string;
					parent_id?: string | null;
					icon_url?: string | null;
					created_at?: string;
				};
				Update: {
					name?: string;
					slug?: string;
					parent_id?: string | null;
					icon_url?: string | null;
				};
			};
			listings: {
				Row: {
					id: string;
					user_id: string;
					agency_id: string | null;
					category_id: string | null;
					title: string;
					description: string;
					price: number;
					location: string | null;
					status:
						| "draft"
						| "published"
						| "unavailable"
						| "sold"
						| "rented"
						| "archived";
					views_count: number;
					attributes: any | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					agency_id?: string | null;
					category_id?: string | null;
					title: string;
					description: string;
					price: number;
					location?: string | null;
					status?:
						| "draft"
						| "published"
						| "unavailable"
						| "sold"
						| "rented"
						| "archived";
					views_count?: number;
					attributes?: any | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					title?: string;
					description?: string;
					price?: number;
					location?: string | null;
					status?:
						| "draft"
						| "published"
						| "unavailable"
						| "sold"
						| "rented"
						| "archived";
					views_count?: number;
					category_id?: string | null;
					agency_id?: string | null;
					attributes?: any | null;
					updated_at?: string;
				};
			};
			listing_images: {
				Row: {
					id: string;
					listing_id: string;
					image_url: string;
					is_cover: boolean;
					display_order: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					listing_id: string;
					image_url: string;
					is_cover?: boolean;
					display_order?: number;
					created_at?: string;
				};
				Update: {
					image_url?: string;
					is_cover?: boolean;
					display_order?: number;
				};
			};
			favorites: {
				Row: {
					id: string;
					user_id: string;
					listing_id: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					listing_id: string;
					created_at?: string;
				};
				Update: {
					user_id?: string;
					listing_id?: string;
				};
			};
			conversations: {
				Row: {
					id: string;
					listing_id: string | null;
					buyer_id: string;
					seller_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					listing_id?: string | null;
					buyer_id: string;
					seller_id: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					updated_at?: string;
				};
			};
			messages: {
				Row: {
					id: string;
					conversation_id: string;
					sender_id: string;
					content: string;
					is_read: boolean;
					created_at: string;
				};
				Insert: {
					id?: string;
					conversation_id: string;
					sender_id: string;
					content: string;
					is_read?: boolean;
					created_at?: string;
				};
				Update: {
					content?: string;
					is_read?: boolean;
				};
			};
			appointments: {
				Row: {
					id: string;
					listing_id: string | null;
					client_id: string;
					host_id: string;
					appointment_date: string;
					status:
						| "pending"
						| "confirmed"
						| "cancelled"
						| "completed";
					notes: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					listing_id?: string | null;
					client_id: string;
					host_id: string;
					appointment_date: string;
					status?:
						| "pending"
						| "confirmed"
						| "cancelled"
						| "completed";
					notes?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					appointment_date?: string;
					status?:
						| "pending"
						| "confirmed"
						| "cancelled"
						| "completed";
					notes?: string | null;
					updated_at?: string;
				};
			};
		};
	};
};

const env =
	typeof import.meta !== "undefined" && import.meta.env
		? import.meta.env
		: ((typeof process !== "undefined" && process.env) || ({} as any));

const supabaseUrl =
	env.VITE_SUPABASE_URL ||
	"https://placeholder.supabase.co";
const supabaseAnonKey =
	env.VITE_SUPABASE_ANON_KEY ||
	env.VITE_SUPABASE_PUBLISHABLE_KEY ||
	"placeholder-key";

export const isSupabaseConfigured = (): boolean => {
	const url = env.VITE_SUPABASE_URL;
	const key =
		env.VITE_SUPABASE_ANON_KEY ||
		env.VITE_SUPABASE_PUBLISHABLE_KEY;
	return (
		!!url &&
		url !== "https://placeholder.supabase.co" &&
		(url.startsWith("http://") || url.startsWith("https://")) &&
		!!key &&
		key !== "placeholder-key" &&
		key.length > 20
	);
};

export const supabase = createClient<Database>(
	supabaseUrl,
	supabaseAnonKey,
);
