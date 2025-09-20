import type { Opportunity } from "../types";

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  onRemove?: (id: string) => void;
}

export function OpportunitiesTable({
  opportunities,
  onRemove,
}: OpportunitiesTableProps) {
  if (opportunities.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-4 text-gray-500">
        No opportunities yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Name
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Account
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                Stage
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                Amount
              </th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {opportunities.map((opp) => (
              <tr key={opp.id}>
                <td className="px-3 py-2 text-sm font-medium text-gray-900">
                  {opp.name}
                </td>
                <td className="px-3 py-2 text-sm text-gray-700">
                  {opp.accountName}
                </td>
                <td className="px-3 py-2 text-sm text-gray-700">{opp.stage}</td>
                <td className="px-3 py-2 text-sm text-gray-900 text-right">
                  {opp.amount ? `$${opp.amount.toLocaleString()}` : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onRemove && onRemove(opp.id)}
                    aria-label="Remove opportunity"
                    className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                    title="Remove"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
