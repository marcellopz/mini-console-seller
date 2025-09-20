import { useEffect, useMemo, useState } from "react";
import type { Lead, LeadStatus } from "../types";
import { LEAD_STATUSES } from "../types";
import { LeadRow } from "./LeadRow";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface LeadListProps {
  leads: Lead[];
  loading: boolean;
  error?: string;
  onSelect: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
}

export function LeadList({
  leads,
  loading,
  error,
  onSelect,
  onConvert,
}: LeadListProps) {
  const [search, setSearch] = useLocalStorage<string>("leads:search", "");
  const [status, setStatus] = useLocalStorage<LeadStatus | "All">(
    "leads:status",
    "All"
  );
  const [sortDesc, setSortDesc] = useLocalStorage<boolean>(
    "leads:sortDesc",
    true
  );
  const [pageSize, setPageSize] = useLocalStorage<number>("leads:pageSize", 10);
  const [page, setPage] = useState(1);
  const [sizeChanging, setSizeChanging] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = leads.filter((l) =>
      term
        ? l.name.toLowerCase().includes(term) ||
          l.company.toLowerCase().includes(term)
        : true
    );
    if (status !== "All") result = result.filter((l) => l.status === status);
    result.sort((a, b) => (sortDesc ? b.score - a.score : a.score - b.score));
    return result;
  }, [leads, search, status, sortDesc]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status, sortDesc, pageSize]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const visible = filtered.slice(startIdx, endIdx);
  const pageItems = useMemo<(number | "ellipsis")[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items: (number | "ellipsis")[] = [];

    // Always show first page
    items.push(1);

    // Determine the range around current page to show
    let start: number, end: number;

    if (currentPage <= 4) {
      // Near the beginning: show 1, 2, 3, 4, 5, ..., last
      start = 2;
      end = 5;
    } else if (currentPage >= totalPages - 3) {
      // Near the end: show 1, ..., last-4, last-3, last-2, last-1, last
      start = totalPages - 4;
      end = totalPages - 1;
    } else {
      // In the middle: show 1, ..., current-1, current, current+1, ..., last
      start = currentPage - 1;
      end = currentPage + 1;
    }

    // Add ellipsis if there's a gap after first page
    if (start > 2) {
      items.push("ellipsis");
    }

    // Add the range of pages
    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    // Add ellipsis if there's a gap before last page
    if (end < totalPages - 1) {
      items.push("ellipsis");
    }

    // Always show last page (if not already included)
    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
  }, [totalPages, currentPage]);
  function convertOne(lead: Lead) {
    onConvert(lead);
  }

  function handleChangePageSize(value: number) {
    setSizeChanging(true);
    setPageSize(value);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or company"
            className="mt-1 w-full min-w-0 rounded-md border-gray-300 px-3 py-2 shadow-sm transition focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="min-w-0 sm:min-w-32">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus | "All")}
            className="mt-1 w-full min-w-0 rounded-md border-gray-300 px-3 py-2 shadow-sm transition focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="All">All</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grow overflow-hidden rounded-lg border border-gray-200 text-nowrap">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-gray-500">
            Loading leads…
          </div>
        ) : error ? (
          <div className="flex h-48 items-center justify-center text-red-600">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-gray-500">
            No leads found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 sm:px-3">
                    Name
                  </th>
                  <th className="hidden px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 sm:table-cell sm:px-3">
                    Company
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 sm:px-3">
                    Email
                  </th>
                  <th className="hidden px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 md:table-cell sm:px-3">
                    Source
                  </th>
                  <th
                    className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 sm:px-3"
                    aria-sort={sortDesc ? "descending" : "ascending"}
                  >
                    <button
                      type="button"
                      onClick={() => setSortDesc((v) => !v)}
                      className="inline-flex items-center gap-1 hover:text-gray-900"
                      title="Sort by score"
                    >
                      <span>SCORE</span>
                      <span aria-hidden>{sortDesc ? "▼" : "▲"}</span>
                    </button>
                  </th>
                  <th className="hidden px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 sm:table-cell sm:px-3">
                    Status
                  </th>
                  <th className="px-2 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 sm:px-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y divide-gray-200 bg-white transition-opacity duration-200 ${
                  sizeChanging ? "opacity-0" : "opacity-100"
                }`}
                onAnimationEnd={() => setSizeChanging(false)}
              >
                {visible.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    onClick={onSelect}
                    onConvert={convertOne}
                  />
                ))}
              </tbody>
              <tfoot className="bg-white">
                <tr>
                  <td colSpan={7} className="px-2 py-2 sm:px-3">
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>Rows per page</span>
                        <select
                          value={pageSize}
                          onChange={(e) =>
                            handleChangePageSize(Number(e.target.value))
                          }
                          className="rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          {[5, 10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                        <span className="hidden sm:inline">|</span>
                        <span>
                          Showing {total === 0 ? 0 : startIdx + 1}–{endIdx} of{" "}
                          {total}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="rounded-md px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                        >
                          Prev
                        </button>
                        {pageItems.map((item, idx) =>
                          item === "ellipsis" ? (
                            <span
                              key={`ellipsis-${idx}`}
                              className="px-2 text-sm text-gray-500"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={item}
                              onClick={() => setPage(item)}
                              className={`rounded-md px-2 py-1 text-sm ${
                                item === currentPage
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {item}
                            </button>
                          )
                        )}
                        <button
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="rounded-md px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
