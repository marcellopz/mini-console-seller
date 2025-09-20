import type { Lead } from "../types";

interface LeadRowProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
}

export function LeadRow({ lead, onClick, onConvert }: LeadRowProps) {
  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => onClick(lead)}
    >
      <td className="px-2 py-2 text-sm font-medium text-gray-900 max-w-20 sm:max-w-32 sm:px-3">
        <div className="truncate" title={lead.name}>
          {lead.name}
        </div>
      </td>
      <td className="hidden px-2 py-2 text-sm text-gray-700 sm:table-cell sm:px-3">
        {lead.company}
      </td>
      <td className="px-2 py-2 text-sm text-gray-700 max-w-24 sm:max-w-48 sm:px-3">
        <div className="truncate" title={lead.email}>
          {lead.email}
        </div>
      </td>
      <td className="hidden px-2 py-2 text-sm text-gray-700 md:table-cell sm:px-3">
        {lead.source}
      </td>
      <td className="px-2 py-2 text-sm text-gray-900 text-right max-w-16 sm:px-3">
        {lead.score}
      </td>
      <td className="hidden px-2 py-2 text-xs sm:table-cell sm:px-3">
        {renderStatusBadge(lead.status)}
      </td>
      <td className="px-2 py-2 text-right sm:px-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onConvert(lead);
          }}
          disabled={lead.status === "Converted"}
          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
        >
          Convert lead
        </button>
      </td>
    </tr>
  );
}

function renderStatusBadge(status: Lead["status"]) {
  switch (status) {
    case "New":
      return (
        <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-1 text-sky-700 ring-1 ring-inset ring-sky-600/10">
          New
        </span>
      );
    case "Contacted":
      return (
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
          Contacted
        </span>
      );
    case "Qualified":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
          Qualified
        </span>
      );
    case "Lost":
      return (
        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-rose-700 ring-1 ring-inset ring-rose-600/10">
          Lost
        </span>
      );
    case "Converted":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-amber-700 ring-1 ring-inset ring-amber-600/10">
          Converted
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-gray-700 ring-1 ring-inset ring-gray-300">
          {status}
        </span>
      );
  }
}
