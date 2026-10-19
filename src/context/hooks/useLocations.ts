import { useState, useEffect } from "react";
import { listingsService } from "../../services/supabase/listingsService";

export interface LocationOption {
  label: string;
  group: "Ville" | "Quartier";
}

/**
 * Loads distinct city and neighbourhood values from published listings.
 * Refreshes once on mount — values only change when new listings are added.
 */
export function useLocations() {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listingsService.fetchLocations().then((data) => {
      if (!cancelled) {
        setLocations(data);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return { locations, isLoading };
}
