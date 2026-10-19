export type UserRole =
	| "client"
	| "seller"
	| "admin";

export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatar?: string;
	banner?: string;
	phone: string;
	verified: {
		email: boolean;
		phone: boolean;
		agency?: boolean;
	};
	agencyName?: string;
	createdAt: string;
}

export interface Category {
	id: string;
	name: string;
	slug: string;
	parent_id?: string | null;
	icon_url?: string | null;
	created_at?: string;
}

export type CategoryType =
	// 8 Catégories principales
	| "immobilier"
	| "vehicules"
	| "materiel-pro"
	| "mode"
	| "maison-jardin"
	| "electronique"
	| "loisirs"
	| "autres"
	// Sous-catégories et alias rétrocompatibles
	| "real_estate"
	| "land"
	| "apartment"
	| "house"
	| "room"
	| "studios"
	| "commercial"
	| "bureaux"
	| "entrepots"
	| "vehicle"
	| "voitures"
	| "motos"
	| "camions"
	| "bus"
	| "utilitaires"
	| "pieces-detachees"
	| "pneus-jantes"
	| "accessoires-auto"
	| "btp"
	| "machines-industrielles"
	| "outillage-pro"
	| "informatique-pro"
	| "restauration"
	| "agricole"
	| "bureautique"
	| "manutention"
	| "mode-femme"
	| "mode-homme"
	| "mode-enfant"
	| "chaussures"
	| "sacs-maroquinerie"
	| "bijoux"
	| "montres"
	| "accessoires-mode"
	| "meubles"
	| "electromenager"
	| "decoration"
	| "cuisine"
	| "linge-maison"
	| "jardin"
	| "bricolage"
	| "luminaires"
	| "telephones"
	| "ordinateurs"
	| "tablettes"
	| "televiseurs"
	| "audio-son"
	| "consoles-jeux"
	| "photo-video"
	| "accessoires-informatique"
	| "sport-fitness"
	| "velos"
	| "musique"
	| "livres-magazines"
	| "jeux-jouets"
	| "camping-plein-air"
	| "loisirs-creatifs"
	| "collections"
	| "articles-bebe"
	| "fournitures-scolaires"
	| "loisirs-enfants"
	| "evenements-ceremonies"
	| "produits-agricoles"
	| "animaux-accessoires"
	| "collections-diverses"
	| "autres-biens"
	| "other"
	| (string & {});

export type TransactionType = "sale" | "rent";

export type ListingStatus =
	| "draft"
	| "published"
	| "unavailable"
	| "sold"
	| "rented"
	| "archived";

export interface ListingCharacteristics {
	brand?: string;
	model?: string;
	titleDeed?: string;
	surface?: number; // m²
	rooms?: number;
	bedrooms?: number;
	bathrooms?: number;
	year?: number;
	mileage?: number; // km
	transmission?: "Manuelle" | "Automatique";
	fuel?: "Essence" | "Diesel" | "Hybride" | "Électrique";
	furnished?: boolean;
	parking?: boolean;
	airConditioning?: boolean;
	security?: boolean;
	generator?: boolean;
	pool?: boolean;
	elevator?: boolean;
	balcony?: boolean;
	waterTank?: boolean;
	// Fashion specific
	size?: string | string[];
	color?: string;
	condition?: string;
	material?: string;
	
	// Dynamic fields
	[key: string]: any;
}

export interface ListingLocation {
	region: string;
	city: string;
	neighborhood: string;
	address?: string;
	lat?: number;
	lng?: number;
}

export type Location = ListingLocation;

export interface Listing {
	id: string;
	title: string;
	description: string;
	audioDescriptionUrl?: string;
	category: CategoryType;
	categoryLabel: string;
	transactionType: TransactionType;
	price: number;
	pricePeriod?: "month" | "day" | "total";
	status: ListingStatus;
	location: ListingLocation;
	characteristics: ListingCharacteristics;
	images: string[];
	ownerId: string;
	agencyId?: string;
	owner: {
		id: string;
		name: string;
		type: "owner" | "seller" | "agency";
		phone: string;
		email: string;
		avatar?: string;
		verified: boolean;
		agencyName?: string;
	};
	views: number;
	contactsCount: number;
	createdAt: string;
	isFeatured?: boolean;
}

export interface Agency {
	id: string;
	userId: string;
	name: string;
	logo: string;
	banner: string;
	city: string;
	address: string;
	phone: string;
	email: string;
	description: string;
	listingCount: number;
	verified: boolean;
	blocked?: boolean;
	rating: number;
	reviewsCount: number;
}

export interface AgencyAvailability {
	id?: string;
	hostId?: string;
	agencyId: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	isActive: boolean;
}

export type SortOption = "recent" | "price_asc" | "price_desc" | "popular";

export interface FilterState {
	search: string;
	category: string;
	transactionType: "all" | "sale" | "rent";
	location: string;
	priceMin: number | null;
	priceMax: number | null;
	surfaceMin: number | null;
	roomsMin: number | null;
	sortBy: SortOption;
}

export interface Conversation {
	id: string;
	listingId: string;
	listingTitle: string;
	listingImage: string;
	listingPrice: number;
	buyerId: string;
	buyerName: string;
	sellerId: string;
	sellerName: string;
	lastMessage: string;
	updatedAt: string;
	unread: boolean;
	unreadCount?: number;
}

export interface Message {
	id: string;
	conversationId: string;
	senderId: string;
	senderName: string;
	text: string;
	createdAt: string;
}

export interface Appointment {
	id: string;
	listingId: string;
	listingTitle: string;
	listingImage: string;
	listingLocation: string;
	date: string;
	time: string;
	clientId: string;
	clientName: string;
	clientPhone: string;
	clientEmail: string;
	sellerId: string;
	sellerName: string;
	sellerPhone?: string;
	sellerEmail?: string;
	message: string;
	status:
		| "pending"
		| "confirmed"
		| "cancelled"
		| "completed";
	createdAt: string;
}

export interface AppointmentRequestResult {
	success: boolean;
	code?: "conflict" | "unavailable" | "forbidden" | "error";
	message?: string;
}

export interface Report {
	id: string;
	listingId: string;
	listingTitle: string;
	reporterEmail: string;
	reason:
		| "fraud"
		| "incorrect_info"
		| "unavailable"
		| "suspicious"
		| "other";
	details: string;
	status: "pending" | "reviewed";
	createdAt: string;
}
