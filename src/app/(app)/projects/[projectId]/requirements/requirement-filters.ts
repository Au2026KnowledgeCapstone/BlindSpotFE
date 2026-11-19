import type { Requirement } from "@/features/requirements";
export function filterRequirements(items: Requirement[], filters: { tab: string; category: string; priority: string; search: string }) {
  return items.filter((item) => (filters.tab === "all" || item.approvalStatus === filters.tab) && (filters.category === "all" || item.category === filters.category) && (filters.priority === "all" || item.priority === filters.priority) && `${item.title} ${item.id} ${item.description} ${item.acceptanceCriteria.map((criterion) => criterion.text).join(" ")}`.toLowerCase().includes(filters.search.trim().toLowerCase()));
}
