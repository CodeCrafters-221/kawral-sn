import { ListingLocation } from "../types";

export interface GeoLocationResult {
	lat: number;
	lng: number;
	label: string;
	city: string;
	neighborhood: string;
	fullAddress: string;
	googleMapsUrl: string;
	directionsUrl: string;
	embedUrl: string;
}

// Coordonnées GPS précises des localités et quartiers du Sénégal
const SENEGAL_COORDINATES: Record<string, { lat: number; lng: number; label: string }> = {
	// Dakar & Quartiers
	almadies: { lat: 14.7478, lng: -17.5186, label: "Les Almadies, Dakar" },
	ngor: { lat: 14.7547, lng: -17.5147, label: "Ngor, Dakar" },
	yoff: { lat: 14.7608, lng: -17.4678, label: "Yoff, Dakar" },
	ouakam: { lat: 14.7225, lng: -17.4897, label: "Ouakam, Dakar" },
	mermoz: { lat: 14.7125, lng: -17.4739, label: "Mermoz, Dakar" },
	fann: { lat: 14.6936, lng: -17.4658, label: "Fann Résidence, Dakar" },
	"point e": { lat: 14.6975, lng: -17.4589, label: "Point E, Dakar" },
	plateau: { lat: 14.6672, lng: -17.4333, label: "Dakar Plateau" },
	medina: { lat: 14.6853, lng: -17.4475, label: "Médina, Dakar" },
	"sacre-coeur": { lat: 14.7153, lng: -17.4639, label: "Sacré-Cœur, Dakar" },
	"sacre coeur": { lat: 14.7153, lng: -17.4639, label: "Sacré-Cœur, Dakar" },
	liberte: { lat: 14.7231, lng: -17.4528, label: "Liberté, Dakar" },
	maristes: { lat: 14.7333, lng: -17.4333, label: "Hann Maristes, Dakar" },
	hann: { lat: 14.7289, lng: -17.4312, label: "Hann Bel-Air, Dakar" },
	"parcelles assainies": { lat: 14.7619, lng: -17.4386, label: "Parcelles Assainies, Dakar" },
	parcelles: { lat: 14.7619, lng: -17.4386, label: "Parcelles Assainies, Dakar" },
	"grand yoff": { lat: 14.7431, lng: -17.4542, label: "Grand Yoff, Dakar" },
	guediawaye: { lat: 14.7786, lng: -17.3917, label: "Guédiawaye" },
	pikine: { lat: 14.7567, lng: -17.3931, label: "Pikine" },
	"keur massar": { lat: 14.7812, lng: -17.3125, label: "Keur Massar" },
	rufisque: { lat: 14.7167, lng: -17.2667, label: "Rufisque" },
	diamniadio: { lat: 14.7208, lng: -17.1811, label: "Diamniadio" },
	bargny: { lat: 14.6983, lng: -17.2300, label: "Bargny" },
	dakar: { lat: 14.7167, lng: -17.4677, label: "Dakar, Sénégal" },

	// Petite Côte / Thiès
	saly: { lat: 14.4444, lng: -17.0264, label: "Saly Portudal, Mbour" },
	mbour: { lat: 14.4222, lng: -16.9639, label: "Mbour" },
	somone: { lat: 14.4889, lng: -17.0778, label: "La Somone" },
	ngaparou: { lat: 14.4694, lng: -17.0583, label: "Ngaparou" },
	popenguine: { lat: 14.5500, lng: -17.1167, label: "Popenguine" },
	thies: { lat: 14.7910, lng: -16.9260, label: "Thiès" },

	// Autres Régions
	"saint-louis": { lat: 16.0326, lng: -16.4818, label: "Saint-Louis" },
	"saint louis": { lat: 16.0326, lng: -16.4818, label: "Saint-Louis" },
	touba: { lat: 14.8631, lng: -15.8753, label: "Touba" },
	mbacke: { lat: 14.7917, lng: -15.9083, label: "Mbacké" },
	kaolack: { lat: 14.1500, lng: -16.0833, label: "Kaolack" },
	fatick: { lat: 14.3333, lng: -16.4167, label: "Fatick" },
	ziguinchor: { lat: 12.5833, lng: -16.2719, label: "Ziguinchor" },
	"cap skirring": { lat: 12.3667, lng: -16.7500, label: "Cap Skirring" },
	tambacounda: { lat: 13.7667, lng: -13.6667, label: "Tambacounda" },
	kolda: { lat: 12.8833, lng: -14.9500, label: "Kolda" },
	louga: { lat: 15.6186, lng: -16.2244, label: "Louga" },
};

function normalizeString(str: string): string {
	return str
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9 ]/g, " ")
		.trim();
}

/**
 * Résout les coordonnées géographiques précises et les liens de navigation
 * à partir d'un objet Location ou d'une chaîne (ex: "Almadies, Dakar").
 */
export function resolveAppointmentLocation(
	locationStr?: string,
	locationObj?: Partial<ListingLocation>,
): GeoLocationResult {
	// 1. Si des coordonnées explicites sont déjà fournies
	if (
		locationObj?.lat &&
		locationObj?.lng &&
		!isNaN(locationObj.lat) &&
		!isNaN(locationObj.lng)
	) {
		const neighborhood = locationObj.neighborhood || "";
		const city = locationObj.city || "Dakar";
		const label = [neighborhood, city].filter(Boolean).join(", ") || "Sénégal";
		const fullAddress = locationObj.address || label;
		const query = `${locationObj.lat},${locationObj.lng}`;
		return {
			lat: locationObj.lat,
			lng: locationObj.lng,
			label,
			city,
			neighborhood,
			fullAddress,
			googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
			directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`,
			embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
		};
	}

	// 2. Extraire les mots-clés de localisation
	const combinedText = [
		locationObj?.address,
		locationObj?.neighborhood,
		locationObj?.city,
		locationObj?.region,
		locationStr,
	]
		.filter(Boolean)
		.join(" ");

	const normalized = normalizeString(combinedText);

	// 3. Recherche dans le dictionnaire des localités du Sénégal
	let matched = SENEGAL_COORDINATES["dakar"];
	let matchedKey = "dakar";

	for (const [key, coord] of Object.entries(SENEGAL_COORDINATES)) {
		if (key === "dakar") continue; // On privilégie les quartiers plus précis d'abord
		if (normalized.includes(key)) {
			matched = coord;
			matchedKey = key;
			break;
		}
	}

	const city = locationObj?.city || (matchedKey.includes("saly") || matchedKey.includes("mbour") ? "Mbour" : "Dakar");
	const neighborhood = locationObj?.neighborhood || (matchedKey !== "dakar" ? matched.label.split(",")[0] : "");
	const label = locationStr || [neighborhood, city].filter(Boolean).join(", ") || matched.label;
	const fullAddress = locationObj?.address ? `${locationObj.address}, ${label}` : `${label}, Sénégal`;

	const mapQuery = `${label}, Sénégal`;

	return {
		lat: matched.lat,
		lng: matched.lng,
		label,
		city,
		neighborhood,
		fullAddress,
		googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
		directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`,
		embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
	};
}
