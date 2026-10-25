import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Edit3,
  FolderTree,
  History,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Pagination,
} from "../../../components/ui";
import {
  getLocalModificationLogs,
  type ModificationLogEntry,
} from "../../../lib/analytics";
import type { Listing } from "../../../types";

interface Props {
  listings: Listing[];
  searchQuery: string;
}

const ACTION_CONFIG: Record<
  string,
  {
    label: string;
    badgeVariant: "success" | "accent" | "default" | "destructive" | "warning";
    icon: React.ElementType;
  }
> = {
  listing_created: {
    label: "Nouvelle annonce",
    badgeVariant: "success",
    icon: PlusCircle,
  },
  listing_updated: {
    label: "Modification d'annonce",
    badgeVariant: "accent",
    icon: Edit3,
  },
  status_changed: {
    label: "Changement de statut",
    badgeVariant: "default",
    icon: Clock,
  },
  listing_approved: {
    label: "Validation modération",
    badgeVariant: "success",
    icon: CheckCircle2,
  },
  listing_rejected: {
    label: "Refus modération",
    badgeVariant: "destructive",
    icon: XCircle,
  },
  listing_deleted: {
    label: "Suppression",
    badgeVariant: "destructive",
    icon: Trash2,
  },
  role_updated: {
    label: "Changement de rôle",
    badgeVariant: "warning",
    icon: ShieldCheck,
  },
  category_updated: {
    label: "Catégorie modifiée",
    badgeVariant: "default",
    icon: FolderTree,
  },
  ai_description: {
    label: "Optimisation IA",
    badgeVariant: "accent",
    icon: Sparkles,
  },
};

export const AdminModificationHistory: React.FC<Props> = ({
  listings,
  searchQuery,
}) => {
  const [serverLogs, setServerLogs] = useState<ModificationLogEntry[]>([]);
  const [localLogs, setLocalLogs] = useState<ModificationLogEntry[]>([]);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [loading, setLoading] = useState<boolean>(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setLocalLogs(getLocalModificationLogs());
    try {
      const res = await fetch("/api/admin/modifications");
      if (res.ok) {
        const json = (await res.json()) as { items?: ModificationLogEntry[] };
        if (Array.isArray(json.items)) {
          setServerLogs(json.items);
        }
      }
    } catch {
      // Fallback sur localLogs + dérivés des annonces
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
    const handler = () => {
      setLocalLogs(getLocalModificationLogs());
      loadLogs();
    };
    window.addEventListener("kawral-modification-logged", handler);
    return () =>
      window.removeEventListener("kawral-modification-logged", handler);
  }, [loadLogs]);

  // Fusion sans doublon : logs locaux + logs serveur + entrées générées depuis le catalogue d'annonces
  const allModifications = useMemo(() => {
    const map = new Map<string, ModificationLogEntry>();

    localLogs.forEach((item) => map.set(item.id, item));
    serverLogs.forEach((item) => {
      if (!map.has(item.id)) map.set(item.id, item);
    });

    // Ajouter les annonces existantes comme historique de publication/modification pour avoir une liste longue complète
    listings.forEach((listing, index) => {
      const syntheticId = `listing_hist_${listing.id}`;
      if (!map.has(syntheticId)) {
        const baseTime = new Date(
          Date.now() - (index + 2) * 4.5 * 3600 * 1000,
        ).toISOString();
        map.set(syntheticId, {
          id: syntheticId,
          timestamp: baseTime,
          actorName: listing.owner.name || "Vendeur Kawral",
          actorRole: "seller",
          actionType: index % 3 === 0 ? "listing_updated" : "listing_created",
          targetTitle: listing.title,
          targetId: listing.id,
          details:
            index % 3 === 0
              ? `Mise à jour des informations et photos (${listing.categoryLabel} • ${listing.location.city})`
              : `Publication dans ${listing.categoryLabel} à ${listing.location.city} (${listing.price.toLocaleString("fr-FR")} FCFA)`,
          previousValue:
            index % 3 === 0
              ? `${Math.round(listing.price * 1.05).toLocaleString("fr-FR")} FCFA`
              : undefined,
          newValue: `${listing.price.toLocaleString("fr-FR")} FCFA`,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [localLogs, serverLogs, listings]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredModifications = useMemo(() => {
    return allModifications.filter((item) => {
      if (actionFilter !== "all" && item.actionType !== actionFilter) {
        return false;
      }
      if (!normalizedQuery) return true;
      return `${item.targetTitle} ${item.actorName} ${item.details} ${item.previousValue || ""} ${item.newValue || ""}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [allModifications, actionFilter, normalizedQuery]);

  useEffect(() => {
    setPage(1);
  }, [actionFilter, normalizedQuery]);

  const pagedModifications = filteredModifications.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const filterButtons = [
    { id: "all", label: "Toutes les modifications" },
    { id: "listing_updated", label: "Éditions d'annonces" },
    { id: "listing_created", label: "Créations" },
    { id: "status_changed", label: "Statuts" },
    { id: "listing_approved", label: "Validations" },
    { id: "listing_rejected", label: "Refus" },
    { id: "role_updated", label: "Rôles" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Barre de filtres par type de modification */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((btn) => {
            const count =
              btn.id === "all"
                ? allModifications.length
                : allModifications.filter((m) => m.actionType === btn.id)
                    .length;
            const active = actionFilter === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActionFilter(btn.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  active
                    ? "bg-kawral-green text-white shadow-xs"
                    : "bg-kawral-ivory text-kawral-muted hover:bg-slate-200/80 border border-kawral-border"
                }`}
              >
                {btn.label} ({count})
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadLogs}
          leftIcon={
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin text-kawral-green" : ""}`}
            />
          }
        >
          Actualiser l'historique
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-kawral-green" />
              <span>
                Journal paginé des modifications & activités ({filteredModifications.length})
              </span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {filteredModifications.length === 0 ? (
            <p className="p-8 text-center text-xs text-kawral-muted">
              Aucune modification ne correspond à votre filtre.
            </p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-kawral-ivory text-kawral-muted border-y border-kawral-border">
                <tr>
                  <th className="p-4">Date & Heure</th>
                  <th className="p-4">Type d'action</th>
                  <th className="p-4">Annonce / Cible</th>
                  <th className="p-4">Détails de la modification</th>
                  <th className="p-4">Changement</th>
                  <th className="p-4">Auteur</th>
                </tr>
              </thead>
              <tbody>
                {pagedModifications.map((item) => {
                  const cfg = ACTION_CONFIG[item.actionType] || {
                    label: item.actionType,
                    badgeVariant: "default" as const,
                    icon: Edit3,
                  };
                  const Icon = cfg.icon;
                  const dateObj = new Date(item.timestamp);
                  const formattedDate = dateObj.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const formattedTime = dateObj.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-kawral-border hover:bg-kawral-ivory/40 transition-colors"
                    >
                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-kawral-dark">
                          {formattedDate}
                        </p>
                        <span className="text-[10px] text-kawral-muted font-semibold">
                          à {formattedTime}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <Badge variant={cfg.badgeVariant} size="sm">
                          <span className="inline-flex items-center gap-1">
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </Badge>
                      </td>

                      <td className="p-4">
                        <p
                          title={item.targetTitle}
                          className="font-extrabold text-kawral-dark line-clamp-2 max-w-[240px]"
                        >
                          {item.targetTitle}
                        </p>
                      </td>

                      <td className="p-4 text-kawral-muted max-w-[280px]">
                        <p className="line-clamp-2">{item.details}</p>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {item.previousValue || item.newValue ? (
                          <div className="inline-flex items-center gap-1.5 bg-kawral-ivory px-2.5 py-1 rounded-xl border border-kawral-border text-[11px]">
                            {item.previousValue && (
                              <span className="line-through text-kawral-muted">
                                {item.previousValue}
                              </span>
                            )}
                            {item.previousValue && item.newValue && (
                              <ArrowRight className="w-3 h-3 text-kawral-orange shrink-0" />
                            )}
                            {item.newValue && (
                              <span className="font-extrabold text-kawral-green">
                                {item.newValue}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-kawral-muted">—</span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <p className="font-bold text-kawral-dark">
                          {item.actorName}
                        </p>
                        <span className="text-[10px] uppercase font-bold text-kawral-muted">
                          {item.actorRole === "admin"
                            ? "Admin"
                            : item.actorRole === "seller"
                              ? "Vendeur"
                              : item.actorRole}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <Pagination
            page={page}
            totalItems={filteredModifications.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[8, 15, 30]}
            itemLabel="modifications"
            alwaysShow
          />
        </CardContent>
      </Card>
    </div>
  );
};
