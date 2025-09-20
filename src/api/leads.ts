import type { Lead, Opportunity } from "../types";

const LATENCY_MS = 400;

export async function fetchLeads(): Promise<Lead[]> {
  await delay(LATENCY_MS);
  const res = await fetch("/leads.json");
  if (!res.ok) throw new Error("Failed to load leads");
  return (await res.json()) as Lead[];
}

export async function updateLead(
  lead: Lead,
  changes: Partial<Pick<Lead, "email" | "status">>,
  simulateFailure = false
): Promise<Lead> {
  await delay(LATENCY_MS);
  if (simulateFailure) {
    throw new Error("Network error while saving");
  }
  return { ...lead, ...changes };
}

export async function convertToOpportunity(
  lead: Lead,
  amount?: number
): Promise<Opportunity> {
  await delay(LATENCY_MS);
  return {
    id: `opp_${lead.id}`,
    name: lead.name,
    stage: "Prospecting",
    amount,
    accountName: lead.company,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
