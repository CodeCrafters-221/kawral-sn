import { useState, useEffect, useRef } from "react";
import { Listing, FilterState } from "../../types";
import { listingsService } from "../../services/supabase/listingsService";
import { isSupabaseConfigured } from "../../lib/supabase";
import { isCategoryMatching } from "../../data/categoriesData";

/**
 * Fetches listings server-side using the active filters.
 *
 * All filters are applied directly in Supabase SQL:
 *   - location       → ilike on the location column
 *   - search         → ilike on title / description / location
 *   - transactionType → eq on transaction_type (SQL column)
 *   - price          → gte/lte on price
 *   - surfaceMin     → gte on surface_m2 (SQL column)
 *   - roomsMin       → gte on rooms_count (SQL column)
 *   - category       → client-side (join on categories slug — no flat column)
 *
 * Text inputs (search, location) are debounced 400 ms to avoid a
 * round-trip on every keystroke. All other filter changes are instant.
 */
export function useFilteredListings(
  filters: FilterState,
  fallbackListings: Listing[], // used when Supabase is not configured
) {
  const [results, setResults] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track previous text values to detect text-only changes
  const prevSearchRef = useRef(filters.search);
  const prevLocationRef = useRef(filters.location);

  useEffect(() => {
    // ── Fallback: Supabase not configured ──────────────────────────────────
    if (!isSupabaseConfigured()) {
      const loc = filters.location.toLowerCase();
      const q   = filters.search.toLowerCase();

      const fallback = fallbackListings
        .filter((item) => {
          if (!["published", "sold", "rented", "unavailable"].includes(item.status)) return false;
          if (q) {
            const inTitle = item.title.toLowerCase().includes(q);
            const inDesc  = item.description.toLowerCase().includes(q);
            const inLoc   = `${item.location.city} ${item.location.neighborhood} ${item.location.region}`
              .toLowerCase().includes(q);
            if (!inTitle && !inDesc && !inLoc) return false;
          }
          if (filters.category && !isCategoryMatching(item.category, filters.category)) return false;
          if (filters.transactionType !== "all" && item.transactionType !== filters.transactionType) return false;
          if (loc) {
            const inLoc = `${item.location.city} ${item.location.neighborhood} ${item.location.region} ${item.location.address}`
              .toLowerCase().includes(loc);
            if (!inLoc) return false;
          }
          if (filters.priceMin   != null && item.price < filters.priceMin) return false;
          if (filters.priceMax   != null && item.price > filters.priceMax) return false;
          if (filters.surfaceMin != null && (!item.characteristics.surface || item.characteristics.surface < filters.surfaceMin)) return false;
          if (filters.roomsMin   != null && (!item.characteristics.rooms   || item.characteristics.rooms   < filters.roomsMin))   return false;
          return true;
        })
        .sort((a, b) => {
          if (filters.sortBy === "price_asc")  return a.price - b.price;
          if (filters.sortBy === "price_desc") return b.price - a.price;
          if (filters.sortBy === "popular")    return b.views - a.views;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

      setResults(fallback);
      return;
    }

    // ── Supabase path ──────────────────────────────────────────────────────
    // Only text changes are debounced — everything else fires immediately
    const isTextChange =
      filters.search   !== prevSearchRef.current ||
      filters.location !== prevLocationRef.current;

    prevSearchRef.current   = filters.search;
    prevLocationRef.current = filters.location;

    const delay = isTextChange ? 400 : 0;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await listingsService.fetchFilteredListings(filtersRef.current);
        setResults(data);
      } catch (err) {
        console.error("useFilteredListings error:", err);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.location,
    filters.category,
    filters.transactionType,
    filters.priceMin,
    filters.priceMax,
    filters.surfaceMin,
    filters.roomsMin,
    filters.sortBy,
    fallbackListings,
  ]);

  return { results, isLoading };
}
