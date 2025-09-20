import { useEffect, useState } from "react";
import "./App.css";
import type { Lead, Opportunity } from "./types";
import { fetchLeads, updateLead, convertToOpportunity } from "./api/leads";
import { LeadList } from "./components/LeadList";
import { LeadDetailPanel } from "./components/LeadDetailPanel";
import { OpportunitiesTable } from "./components/OpportunitiesTable";
import { Navbar } from "./components/Navbar";
import { PageHeader } from "./components/PageHeader";

function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [selected, setSelected] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [leadPrevStatus, setLeadPrevStatus] = useState<
    Record<string, Lead["status"]>
  >({});

  useEffect(() => {
    let mounted = true;
    fetchLeads()
      .then((data) => {
        if (!mounted) return;
        setLeads(data);
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || "Failed to load");
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function handleSelect(lead: Lead) {
    setSelected(lead);
  }

  async function handleSave(changes: {
    email: string;
    status: Lead["status"];
  }) {
    if (!selected) return;
    setSaving(true);
    const current = selected;
    // optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === current.id ? { ...l, ...changes } : l))
    );
    try {
      const updated = await updateLead(current, changes, false);
      setLeads((prev) => prev.map((l) => (l.id === current.id ? updated : l)));
      setSelected(updated);
    } catch (e: unknown) {
      // rollback
      setLeads((prev) => prev.map((l) => (l.id === current.id ? current : l)));
      alert((e as Error).message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleConvert(amountOrLead?: number | Lead) {
    // If called with a Lead, convert that one; else use selected
    const leadToConvert: Lead | null =
      typeof amountOrLead === "object" && amountOrLead
        ? (amountOrLead as Lead)
        : selected;
    if (!leadToConvert) return;
    const defaultAmount = getDefaultAmountFromScore(leadToConvert.score);
    const opp = await convertToOpportunity(leadToConvert, defaultAmount);
    setOpportunities((prev) => [opp, ...prev]);
    // remember previous status before marking Converted
    setLeadPrevStatus((prev) => ({
      ...prev,
      [leadToConvert.id]: leadToConvert.status,
    }));
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadToConvert.id ? { ...l, status: "Converted" } : l
      )
    );
  }

  function getDefaultAmountFromScore(score: number): number {
    if (score >= 90) return 20000;
    if (score >= 80) return 15000;
    if (score >= 70) return 10000;
    return 5000;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <PageHeader
        title="Leads"
        subtitle="Triage leads and convert them into opportunities"
      />

      <main className="mx-auto max-w-7xl px-2 pb-10 sm:px-4">
        <div className="grid gap-6 xl:grid-cols-3">
          <section className="xl:col-span-2">
            <LeadList
              leads={leads}
              loading={loading}
              error={error}
              onSelect={handleSelect}
              onConvert={(lead) => handleConvert(lead)}
            />
          </section>
          <section className="xl:col-span-1">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Opportunities
              </h2>
              {opportunities.length > 0 && (
                <button
                  onClick={() => {
                    // Restore all lead statuses before clearing opportunities
                    opportunities.forEach((opp) => {
                      const leadId = opp.id.startsWith("opp_")
                        ? opp.id.slice(4)
                        : opp.id;
                      const previous = leadPrevStatus[leadId];
                      setLeads((prev) =>
                        prev.map((l) =>
                          l.id === leadId
                            ? { ...l, status: previous ?? "Qualified" }
                            : l
                        )
                      );
                    });
                    // Clear opportunities and previous status tracking
                    setOpportunities([]);
                    setLeadPrevStatus({});
                  }}
                  className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                >
                  Clear All
                </button>
              )}
            </div>
            <OpportunitiesTable
              opportunities={opportunities}
              onRemove={(id) => {
                setOpportunities((prev) => prev.filter((o) => o.id !== id));
                // derive lead id from opportunity id format: opp_<leadId>
                const leadId = id.startsWith("opp_") ? id.slice(4) : id;
                const previous = leadPrevStatus[leadId];
                setLeads((prev) =>
                  prev.map((l) =>
                    l.id === leadId
                      ? { ...l, status: previous ?? "Qualified" }
                      : l
                  )
                );
                // cleanup stored previous status
                setLeadPrevStatus((prev) => {
                  const { [leadId]: _unused, ...rest } = prev;
                  void _unused;
                  return rest;
                });
              }}
            />
          </section>
        </div>

        <LeadDetailPanel
          open={!!selected}
          lead={selected}
          saving={saving}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      </main>
    </div>
  );
}

export default App;
