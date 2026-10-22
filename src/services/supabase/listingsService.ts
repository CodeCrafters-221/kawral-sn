import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { Listing, CategoryType } from "../../types";
import { toValidUUID, generateUUID } from "../../utils/uuid";
import { deleteListingImages } from "./storageService";
import { getCategoryLabel } from "../../utils/formatters";
import { isCategoryMatching, findParentMainCategory, getAllCategorySlugs } from "../../data/categoriesData";
import { sanitizeSafeUrl, sanitizeSafeUrlList } from "../../lib/validation";

/**
 * Helper to map raw Supabase listing records (with joined relations) to the Listing entity
 */
export function mapDatabaseListingToEntity(item: any): Listing {
  const imageUrls: string[] =
    item.listing_images
      ?.sort((a: any, b: any) => a.display_order - b.display_order)
      .map((img: any) => img.image_url) || [];
  const images = Array.from(new Set<string>(sanitizeSafeUrlList(imageUrls)));

  const locParts = (item.location || "")
    .split(",")
    .map((s: string) => s.trim());
  const city = locParts[0] || "Dakar";
  const neighborhood = locParts[1] || "";

  const attrs = item.attributes || {};

  const categoryRecord = Array.isArray(item.categories)
    ? item.categories[0]
    : item.categories;

  // Resolve category slug:
  // 1. From JSONB attributes.category (most specific subcategory, e.g. 'telephones', 'motos')
  // 2. From joined categories table (if present)
  // 3. From flat item.category (if present)
  // 4. Default to 'other' if no category_id was assigned (never force 'apartment'!)
  const rawCatSlug =
    attrs.category ||
    categoryRecord?.slug ||
    item.category ||
    (item.category_id ? "apartment" : "other");

  const catSlug: CategoryType =
    rawCatSlug === "vehicule" || rawCatSlug === "vehicle"
      ? "vehicules"
      : rawCatSlug === "autre" || rawCatSlug === "divers" || rawCatSlug === "other"
        ? "autres"
        : rawCatSlug === "real_estate"
          ? "immobilier"
          : (rawCatSlug as CategoryType);

  const catName =
    attrs.categoryLabel ||
    getCategoryLabel(catSlug) ||
    categoryRecord?.name ||
    "Autres";

  const profile = item.profiles || {};

  const transactionType =
    item.transaction_type || attrs.transactionType || "sale";
  const pricePeriod =
    attrs.pricePeriod || (transactionType === "rent" ? "month" : "total");
  const characteristics = attrs.characteristics || {};

  const safeAudioUrl = sanitizeSafeUrl(
    item.audio_description_url || attrs.audioDescriptionUrl
  );

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    audioDescriptionUrl: safeAudioUrl || undefined,
    category: catSlug as any,
    categoryLabel: catName,
    transactionType: transactionType as any,
    price: Number(item.price),
    pricePeriod: pricePeriod as any,
    status: item.status as Listing["status"],
    location: {
      city,
      neighborhood,
      region: city,
      address: item.location || "",
    },
    characteristics,
    images:
      images.length > 0
        ? images
        : [
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
          ],
    ownerId: item.user_id,
    agencyId: item.agency_id || undefined,
    owner: {
      id: profile.id || item.user_id,
      name: profile.full_name || "Vendeur Kawral",
      type:
        profile.role === "agence"
          ? "agency"
          : profile.role === "vendeur"
            ? "seller"
            : "owner",
      phone: profile.phone || "",
      email: profile.email || "",
      avatar: sanitizeSafeUrl(profile.avatar_url),
      verified: true,
    },
    views: item.views_count || 0,
    contactsCount: 0,
    createdAt: item.created_at
      ? item.created_at.split("T")[0]
      : new Date().toISOString().split("T")[0],
  };
}

export const listingsService = {
  /**
   * Fetch all distinct city + neighbourhood values from published listings.
   * Used to build the dynamic location chips in FilterSidebar.
   */
  async fetchLocations(): Promise<{ label: string; group: "Ville" | "Quartier" }[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await (supabase.from as any)("listings")
        .select("location")
        .eq("status", "published")
        .not("location", "is", null)
        .neq("location", "");

      if (error || !data) return [];

      const cities   = new Set<string>();
      const hoods    = new Set<string>();

      (data as { location: string }[]).forEach(({ location }) => {
        const parts = location.split(",").map((s: string) => s.trim()).filter(Boolean);
        if (parts[0]) cities.add(parts[0]);
        if (parts[1]) hoods.add(parts[1]);
      });

      const result: { label: string; group: "Ville" | "Quartier" }[] = [
        ...[...cities].sort().map((c) => ({ label: c, group: "Ville" as const })),
        ...[...hoods].sort().map((n) => ({ label: n, group: "Quartier" as const })),
      ];

      return result;
    } catch (err) {
      console.error("listingsService.fetchLocations error:", err);
      return [];
    }
  },

  /**
   * Fetch all listings with joined categories, profiles, and images from Supabase
   */
  async fetchListings(): Promise<Listing[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data: listingsData, error } = await supabase
        .from("listings")
        .select(
          `
          *,
          categories ( id, name, slug ),
          profiles ( id, full_name, avatar_url, phone, role ),
          listing_images ( image_url, is_cover, display_order )
        `,
        )
        .order("created_at", { ascending: false });

      if (error || !listingsData) {
        console.warn("listingsService.fetchListings warning:", error?.message);
        return [];
      }

      return listingsData.map(mapDatabaseListingToEntity);
    } catch (error) {
      console.error("listingsService.fetchListings error:", error);
      return [];
    }
  },

  /**
   * Fetch a single listing by its ID
   */
  async fetchListingById(id: string): Promise<Listing | null> {
    if (!isSupabaseConfigured() || !id) return null;

    try {
      const validId = toValidUUID(id);
      const { data, error } = await supabase
        .from("listings")
        .select(
          `
          *,
          categories ( id, name, slug ),
          profiles ( id, full_name, avatar_url, phone, role ),
          listing_images ( image_url, is_cover, display_order )
        `,
        )
        .eq("id", validId)
        .maybeSingle();

      if (error || !data) {
        if (error) console.warn("listingsService.fetchListingById warning:", error.message);
        return null;
      }

      return mapDatabaseListingToEntity(data);
    } catch (err) {
      console.error("listingsService.fetchListingById error:", err);
      return null;
    }
  },

  /**
   * Fetch similar listings directly from the database
   */
  async fetchSimilarListings(categorySlug: string, excludeId: string, limitCount = 60): Promise<Listing[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const validExcludeId = toValidUUID(excludeId);
      // Normalise les alias historiques (vehicle/vehicule -> vehicules, etc.)
      const normalize = (slug: string): string => {
        const s = (slug || "").toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
        if (s === "vehicle" || s === "vehicule") return "vehicules";
        if (s === "other" || s === "autre" || s === "divers") return "autres";
        if (s === "real_estate") return "immobilier";
        return s;
      };
      const ALIASES: Record<string, string[]> = {
        vehicules: ["vehicules", "vehicule", "vehicle"],
        autres: ["autres", "autre", "other", "divers"],
        immobilier: ["immobilier", "real_estate"],
      };

      const targetSlug = normalize(categorySlug);
      // Les sous-catégories (ex: mode-homme) sont rattachées à leur catégorie principale en base
      const mainSlug = findParentMainCategory(targetSlug)?.slug ?? targetSlug;
      const dbSlugs = Array.from(
        new Set([
          mainSlug,
          targetSlug,
          ...(ALIASES[mainSlug] ?? []),
          ...(ALIASES[targetSlug] ?? []),
        ]),
      );

      const { data: catRows, error: categoryError } = await (supabase.from as any)("categories")
        .select("id")
        .in("slug", dbSlugs);
      if (categoryError) throw categoryError;
      const categoryIds: string[] = (catRows ?? []).map((c: any) => c.id);

      // Toutes les valeurs possibles de attributes.category pour cette catégorie principale
      const allSlugs = Array.from(
        new Set([...dbSlugs, ...getAllCategorySlugs(mainSlug)]),
      );
      // NB: category_id peut être NULL (sous-catégorie sans ligne en base) :
      // la vraie sous-catégorie est alors stockée dans attributes.category.
      const orParts: string[] = [
        `attributes->>category.in.(${allSlugs.join(",")})`,
      ];
      if (categoryIds.length) {
        orParts.push(`category_id.in.(${categoryIds.join(",")})`);
      }
      if (mainSlug === "autres") {
        orParts.push("and(category_id.is.null,attributes->>category.is.null)");
      }

      let query = supabase
        .from("listings")
        .select(`
          *,
          categories ( id, name, slug ),
          profiles ( id, full_name, avatar_url, phone, role ),
          listing_images ( image_url, is_cover, display_order )
        `)
        .eq("status", "published")
        .neq("id", validExcludeId)
        .or(orParts.join(","))
        .order("created_at", { ascending: false })
        .limit(60);
      const { data: listingsData, error } = await query;

      if (error) throw error;
      if (!listingsData) return [];

      const entities = listingsData.map(mapDatabaseListingToEntity);
      // Même sous-catégorie en premier, puis le reste de la catégorie principale
      const sameSub = entities.filter((l) => normalize(l.category as string) === targetSlug);
      const others = entities.filter((l) => normalize(l.category as string) !== targetSlug);
      return [...sameSub, ...others].slice(0, limitCount);
    } catch (error) {
      console.error("listingsService.fetchSimilarListings error:", error);
      throw error;
    }
  },

  /**
   * Create a new listing in Supabase DB
   */
  async createListing(
    newId: string,
    userId: string,
    data: Omit<
      Listing,
      "id" | "views" | "contactsCount" | "createdAt" | "status"
    >,
    statusOrAdmin: Listing["status"] | boolean = "published",
  ) {
    if (!isSupabaseConfigured()) return null;

    try {
      const dbStatus: Listing["status"] =
        typeof statusOrAdmin === "string"
          ? statusOrAdmin
          : "published";
      const validUserId = toValidUUID(userId);
      const validListingId = toValidUUID(newId);

      // 1. Fetch category ID dynamically by slug
      const catSlugStr = String(data.category);
      const dbCategorySlug =
        catSlugStr === "vehicle" || catSlugStr === "vehicule"
          ? "vehicules"
          : catSlugStr === "other" || catSlugStr === "autre"
            ? "autres"
            : catSlugStr === "real_estate"
              ? "immobilier"
              : data.category;
      let { data: catData } = await (supabase.from as any)("categories")
        .select("id")
        .eq("slug", dbCategorySlug)
        .maybeSingle();

      if (!catData) {
        const parent = findParentMainCategory(catSlugStr);
        if (parent) {
          const { data: parentCat } = await (supabase.from as any)("categories")
            .select("id")
            .eq("slug", parent.slug)
            .maybeSingle();
          catData = parentCat;
        }
      }

      if (!catData && (data.category === "other" || data.category === "autres")) {
        const { data: altCat } = await (supabase.from as any)("categories")
          .select("id")
          .or("slug.eq.autres,slug.eq.autre,slug.eq.other,slug.eq.divers")
          .maybeSingle();
        catData = altCat;
      }
      const categoryId: string | null = catData ? catData.id : null;

      // 2. Fetch agency ID dynamically if owner is agency
      let agencyId: string | null = null;
      const { data: profileData } = await (supabase.from as any)("profiles")
        .select("role")
        .eq("id", validUserId)
        .maybeSingle();

      if (profileData && profileData.role === "agence") {
        const { data: agencyData } = await (supabase.from as any)("agencies")
          .select("id")
          .eq("user_id", validUserId)
          .maybeSingle();
        agencyId = agencyData ? agencyData.id : null;
      }

      const safeAudioUrl = sanitizeSafeUrl(data.audioDescriptionUrl) || undefined;
      const safeImages = sanitizeSafeUrlList(data.images);

      // 3. Prepare JSONB attributes containing characteristics, category, transactionType, pricePeriod and audioDescriptionUrl
      const attributes = {
        category: data.category,
        categoryLabel:
          data.categoryLabel ||
          (data.category === "other" ? "Autres" : getCategoryLabel(data.category)),
        transactionType: data.transactionType,
        pricePeriod:
          data.pricePeriod ||
          (data.transactionType === "rent" ? "month" : "total"),
        characteristics: data.characteristics || {},
        audioDescriptionUrl: safeAudioUrl,
      };

      const { data: inserted, error } = await (supabase.from as any)("listings")
        .insert({
          id: validListingId,
          user_id: validUserId,
          category_id: categoryId,
          agency_id: agencyId,
          title: (data.title || "").trim().slice(0, 200),
          description: (data.description || "").trim().slice(0, 5000),
          audio_description_url: safeAudioUrl || null,
          price: data.price,
          location: `${data.location.city}, ${data.location.neighborhood}`,
          status: dbStatus,
          attributes: attributes,
          // Dedicated filter columns
          transaction_type: data.transactionType,
          surface_m2: data.characteristics?.surface ?? null,
          rooms_count: data.characteristics?.rooms ?? null,
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error("listingsService.createListing error:", error.message);
        return null;
      }

      if (safeImages.length > 0) {
        const listingDbId = inserted?.id || validListingId;
        const imgRows = Array.from(new Set(safeImages)).map((url, index) => ({
          id: generateUUID(),
          listing_id: listingDbId,
          image_url: url,
          is_cover: index === 0,
          display_order: index,
        }));
        await (supabase.from as any)("listing_images").insert(imgRows);
      }

      return inserted;
    } catch (err) {
      console.error("listingsService.createListing exception:", err);
      return null;
    }
  },

  /**
   * Change uniquement le statut d'une annonce (En ligne, Indisponible, Vendu, Loué, Archivée).
   * Retourne la cause de l'échec pour pouvoir informer l'utilisateur proprement.
   */
  async setListingStatus(
    id: string,
    status: Listing["status"],
  ): Promise<{ ok: boolean; reason?: "constraint" | "forbidden" | "error"; message?: string }> {
    if (!isSupabaseConfigured()) return { ok: true };
    try {
      const validId = toValidUUID(id);
      const { data, error } = await (supabase.from as any)("listings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", validId)
        .select("id, status");

      if (error) {
        console.error("listingsService.setListingStatus error:", error);
        // 23514 = check_violation : la base n'accepte pas encore ce statut
        return {
          ok: false,
          reason: error.code === "23514" ? "constraint" : "error",
          message: error.message,
        };
      }

      // Aucune ligne modifiée : l'annonce n'existe pas ou la sécurité (RLS) a refusé
      if (!data || data.length === 0) {
        console.error("listingsService.setListingStatus: aucune ligne modifiée", { id: validId });
        return { ok: false, reason: "forbidden" };
      }

      return { ok: true };
    } catch (err: any) {
      console.error("listingsService.setListingStatus exception:", err);
      return { ok: false, reason: "error", message: err?.message };
    }
  },

  /**
   * Update listing by ID
   */
  async updateListing(id: string, updates: Partial<Listing>): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;
    try {
      const validId = toValidUUID(id);
      const safeAudioUpdate =
        updates.audioDescriptionUrl !== undefined
          ? sanitizeSafeUrl(updates.audioDescriptionUrl) || null
          : undefined;

      // Prepare attributes if updates contains characteristics, transactionType or pricePeriod
      const attributesUpdate: Record<string, any> = {};
      if (updates.category) {
        attributesUpdate.category = updates.category;
        attributesUpdate.categoryLabel =
          updates.categoryLabel ||
          (updates.category === "other" ? "Autres" : getCategoryLabel(updates.category));
      }
      if (updates.transactionType)
        attributesUpdate.transactionType = updates.transactionType;
      if (updates.pricePeriod)
        attributesUpdate.pricePeriod = updates.pricePeriod;
      if (updates.characteristics)
        attributesUpdate.characteristics = updates.characteristics;
      if (safeAudioUpdate !== undefined)
        attributesUpdate.audioDescriptionUrl = safeAudioUpdate;

      // 1. Fetch current attributes to merge
      let mergedAttributes = {};
      if (Object.keys(attributesUpdate).length > 0) {
        const { data: currentListing } = await (supabase.from as any)(
          "listings",
        )
          .select("attributes")
          .eq("id", validId)
          .maybeSingle();
        mergedAttributes = {
          ...(currentListing ? (currentListing.attributes as object) : {}),
          ...attributesUpdate,
        };
      }

      // 2. Resolve category_id if category slug changed
      let categoryId = undefined;
      if (updates.category) {
        const updateSlugStr = String(updates.category);
        const dbCategorySlug =
          updateSlugStr === "vehicle" || updateSlugStr === "vehicule"
            ? "vehicules"
            : updateSlugStr === "other" || updateSlugStr === "autre"
              ? "autres"
              : updateSlugStr === "real_estate"
                ? "immobilier"
                : updates.category;
        let { data: catData } = await (supabase.from as any)("categories")
          .select("id")
          .eq("slug", dbCategorySlug)
          .maybeSingle();

        if (!catData) {
          const parent = findParentMainCategory(updateSlugStr);
          if (parent) {
            const { data: parentCat } = await (supabase.from as any)("categories")
              .select("id")
              .eq("slug", parent.slug)
              .maybeSingle();
            catData = parentCat;
          }
        }

        if (!catData && (updates.category === "other" || updates.category === "autres")) {
          const { data: altCat } = await (supabase.from as any)("categories")
            .select("id")
            .or("slug.eq.autres,slug.eq.autre,slug.eq.other,slug.eq.divers")
            .maybeSingle();
          catData = altCat;
        }
        categoryId = catData ? catData.id : null;
      }

      const dbStatus = updates.status;

      const { error: updateListingError } = await (supabase.from as any)(
        "listings",
      )
        .update({
          ...(updates.title && { title: updates.title.trim().slice(0, 200) }),
          ...(updates.description && { description: updates.description.trim().slice(0, 5000) }),
          ...(safeAudioUpdate !== undefined && {
            audio_description_url: safeAudioUpdate,
          }),
          ...(updates.price && { price: updates.price }),
          ...(updates.location && {
            location: `${updates.location.city}, ${updates.location.neighborhood}`,
          }),
          ...(categoryId !== undefined && { category_id: categoryId }),
          ...(dbStatus !== undefined && { status: dbStatus }),
          ...(Object.keys(attributesUpdate).length > 0 && {
            attributes: mergedAttributes,
          }),
          // Keep dedicated filter columns in sync
          ...(updates.transactionType && {
            transaction_type: updates.transactionType,
          }),
          ...(updates.characteristics !== undefined && {
            surface_m2: updates.characteristics?.surface ?? null,
            rooms_count: updates.characteristics?.rooms ?? null,
          }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", validId);
      if (updateListingError) throw updateListingError;

      // 3. Handle image updates if updates.images is provided
      if (updates.images !== undefined) {
        const safeImages = sanitizeSafeUrlList(updates.images);
        const { data: listingOwner } = await (supabase.from as any)("listings")
          .select("user_id")
          .eq("id", validId)
          .maybeSingle();
        if (listingOwner?.user_id) {
          try {
            // Clean up only files in storage that were removed by user (not in updates.images)
            const { data: existingFiles } = await supabase.storage
              .from("listing-images")
              .list(`${listingOwner.user_id}/${validId}`);
            if (existingFiles && existingFiles.length > 0) {
              const toRemove = existingFiles
                .filter(
                  (f) =>
                    !safeImages.some((url) => url.includes(f.name)),
                )
                .map((f) => `${listingOwner.user_id}/${validId}/${f.name}`);
              if (toRemove.length > 0) {
                await supabase.storage
                  .from("listing-images")
                  .remove(toRemove);
              }
            }
          } catch (storageErr) {
            console.warn("Clean orphaned images warning:", storageErr);
          }
        }

        // Delete all old listing images
        const { error: deleteImagesError } = await (supabase.from as any)(
          "listing_images",
        )
          .delete()
          .eq("listing_id", validId);
        if (deleteImagesError) throw deleteImagesError;

        // Insert new ones
        const imgRows = Array.from(new Set(safeImages)).map(
          (url, index) => ({
            id: generateUUID(),
            listing_id: validId,
            image_url: url,
            is_cover: index === 0,
            display_order: index,
          }),
        );
        if (imgRows.length > 0) {
          const { error: insertImagesError } = await (supabase.from as any)(
            "listing_images",
          ).insert(imgRows);
          if (insertImagesError) throw insertImagesError;
        }
      }
      return true;
    } catch (err) {
      console.error("listingsService.updateListing error:", err);
      return false;
    }
  },

  async deleteListing(id: string) {
    if (!isSupabaseConfigured()) return;
    try {
      const validId = toValidUUID(id);
      const { data: listingOwner } = await (supabase.from as any)("listings")
        .select("user_id")
        .eq("id", validId)
        .maybeSingle();
      if (listingOwner?.user_id) {
        await deleteListingImages(listingOwner.user_id, validId);
      }
      await supabase.from("listings").delete().eq("id", validId);
    } catch (err) {
      console.error("listingsService.deleteListing error:", err);
    }
  },

  /**
   * Increment listing views
   */
  async incrementViews(id: string) {
    if (!isSupabaseConfigured()) return;
    try {
      const validId = toValidUUID(id);
      const { error } = await (supabase.rpc as any)("increment_views", {
        listing_id: validId,
      });
      if (error) {
        console.error("listingsService.incrementViews RPC error:", error);
      }
    } catch (err) {
      console.error("listingsService.incrementViews error:", err);
    }
  },

  /**
   * Fetch listings filtered server-side through Supabase.
   * All filters applied directly as SQL — no client-side filtering needed.
   */
  async fetchFilteredListings(filters: {
    search?: string;
    category?: string;
    transactionType?: "all" | "sale" | "rent";
    location?: string;
    priceMin?: number | null;
    priceMax?: number | null;
    surfaceMin?: number | null;
    roomsMin?: number | null;
    sortBy?: "recent" | "price_asc" | "price_desc" | "popular";
  }): Promise<Listing[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = (supabase.from as any)("listings").select(`
        *,
        categories ( id, name, slug ),
        profiles ( id, full_name, avatar_url, phone, role ),
        listing_images ( image_url, is_cover, display_order )
      `).in("status", ["published", "sold", "rented", "unavailable"]);

      // Location — ilike on raw location column ("City, Neighbourhood")
      if (filters.location && filters.location.trim()) {
        const cleanLocation = filters.location
          .replace(/[(),"%;*\\]/g, " ")
          .trim()
          .slice(0, 100);
        if (cleanLocation) {
          query = query.ilike("location", `%${cleanLocation}%`);
        }
      }

      // Free-text search — title, description or location
      if (filters.search && filters.search.trim()) {
        const q = filters.search
          .replace(/[(),"%;*\\]/g, " ")
          .trim()
          .slice(0, 100);
        if (q) {
          query = query.or(
            `title.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`,
          );
        }
      }

      // Transaction type — now a real SQL column
      if (filters.transactionType && filters.transactionType !== "all") {
        query = query.eq("transaction_type", filters.transactionType);
      }

      // Price range
      if (filters.priceMin != null) query = query.gte("price", filters.priceMin);
      if (filters.priceMax != null) query = query.lte("price", filters.priceMax);

      // Surface minimum — SQL column surface_m2
      if (filters.surfaceMin != null) {
        query = query.gte("surface_m2", filters.surfaceMin);
      }

      // Rooms minimum — SQL column rooms_count
      if (filters.roomsMin != null) {
        query = query.gte("rooms_count", filters.roomsMin);
      }

      // Sorting
      if (filters.sortBy === "price_asc") {
        query = query.order("price", { ascending: true });
      } else if (filters.sortBy === "price_desc") {
        query = query.order("price", { ascending: false });
      } else if (filters.sortBy === "popular") {
        query = query.order("views_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data: listingsData, error } = await query;

      if (error || !listingsData) {
        console.warn("listingsService.fetchFilteredListings warning:", error?.message);
        return [];
      }

      const mapped: Listing[] = listingsData
        .map(mapDatabaseListingToEntity)
        // Only category still needs a client-side pass (stored in categories join, not a flat column)
        .filter((item: Listing) => {
          if (filters.category && !isCategoryMatching(item.category, filters.category)) return false;
          return true;
        });

      return mapped;
    } catch (err) {
      console.error("listingsService.fetchFilteredListings error:", err);
      return [];
    }
  },
};
