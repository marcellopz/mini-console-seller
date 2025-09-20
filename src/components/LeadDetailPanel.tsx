import { useEffect, useMemo, useState } from "react";
import type { Lead, LeadStatus } from "../types";
import { LEAD_STATUSES } from "../types";
import { isValidEmail } from "../utils/email";

interface LeadDetailPanelProps {
  lead: Lead | null;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (changes: { email: string; status: LeadStatus }) => void;
}

export function LeadDetailPanel({
  lead,
  open,
  saving,
  onClose,
  onSave,
}: LeadDetailPanelProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<LeadStatus>("New");
  const emailValid = useMemo(() => isValidEmail(email), [email]);

  useEffect(() => {
    if (lead) {
      setEmail(lead.email);
      setStatus(lead.status);
    }
  }, [lead]);

  const canSave = lead && emailValid && !saving;

  return (
    <div
      className={`${
        open ? "pointer-events-auto" : "pointer-events-none"
      } fixed inset-0 z-50 flex justify-end`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`${
          open ? "opacity-100" : "opacity-0"
        } transition-opacity duration-200 fixed inset-0 z-40 bg-black/30`}
      />

      {/* Panel */}
      <div
        className={`${
          open ? "translate-x-0" : "translate-x-full"
        } relative z-50 h-full w-full max-w-md transform bg-white shadow-xl transition-transform duration-300`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-semibold">Lead Details</h2>
          <button
            className="rounded-md p-2 hover:bg-gray-100"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {lead ? (
          <div className="space-y-4 p-4">
            <div>
              <div className="text-sm text-gray-500">Name</div>
              <div className="text-lg font-medium">{lead.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Company</div>
              <div className="text-lg font-medium">{lead.company}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 w-full rounded-md border ${
                  email.length === 0 || emailValid
                    ? "border-gray-300"
                    : "border-red-400"
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500`}
              />
              {!emailValid && email.length > 0 && (
                <p className="mt-1 text-xs text-red-600">
                  Enter a valid email.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="mt-1 w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                onClick={onClose}
                className="rounded-md px-4 py-2 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                disabled={!canSave}
                onClick={() => canSave && onSave({ email, status })}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-gray-500">No lead selected.</div>
        )}
      </div>
    </div>
  );
}
