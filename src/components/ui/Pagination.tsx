import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
  alwaysShow?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  itemLabel = "éléments",
  className = "",
  alwaysShow = false,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (!alwaysShow && totalItems <= pageSize && !onPageSizeChange) {
    return null;
  }

  const safePage = Math.min(Math.max(1, page), totalPages);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safePage * pageSize);

  const getVisiblePageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (safePage > 3) {
      pages.push("ellipsis");
    }
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    if (safePage < totalPages - 2) {
      pages.push("ellipsis");
    }
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getVisiblePageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-kawral-border px-4 py-3.5 bg-white/80 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-kawral-muted">
        <span>
          Affichage de{" "}
          <strong className="font-extrabold text-kawral-dark">
            {startItem}–{endItem}
          </strong>{" "}
          sur{" "}
          <strong className="font-extrabold text-kawral-dark">
            {totalItems}
          </strong>{" "}
          {itemLabel}
        </span>

        {onPageSizeChange && pageSizeOptions && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span>• Par page :</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              aria-label="Nombre d'éléments par page"
              className="rounded-lg border border-kawral-border bg-kawral-ivory px-2 py-1 text-[11px] font-bold text-kawral-dark cursor-pointer focus:outline-none focus:border-kawral-green"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => onPageChange(1)}
            className="hidden sm:inline-flex items-center justify-center rounded-xl border border-kawral-border p-1.5 text-kawral-muted hover:text-kawral-green hover:border-kawral-green/50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Première page"
            title="Première page"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => onPageChange(safePage - 1)}
            className="inline-flex items-center justify-center rounded-xl border border-kawral-border p-1.5 text-kawral-green hover:bg-kawral-ivory disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Page précédente"
            title="Page précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1 px-1">
            {pageNumbers.map((item, idx) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 text-xs font-bold text-kawral-muted select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-current={item === safePage ? "page" : undefined}
                  className={`min-w-[30px] h-[30px] px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    item === safePage
                      ? "bg-kawral-green text-white shadow-xs"
                      : "bg-kawral-ivory text-kawral-dark hover:bg-slate-200/70 border border-kawral-border/70"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => onPageChange(safePage + 1)}
            className="inline-flex items-center justify-center rounded-xl border border-kawral-border p-1.5 text-kawral-green hover:bg-kawral-ivory disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Page suivante"
            title="Page suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => onPageChange(totalPages)}
            className="hidden sm:inline-flex items-center justify-center rounded-xl border border-kawral-border p-1.5 text-kawral-muted hover:text-kawral-green hover:border-kawral-green/50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors cursor-pointer"
            aria-label="Dernière page"
            title="Dernière page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
