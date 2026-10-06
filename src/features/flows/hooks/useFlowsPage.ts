import { useEffect, useState } from "react";
import { useFlows } from "./useFlows";
import { useFlowEditorState } from "./useFlowEditorState";

export function useFlowsPage(projectId: string) {
  const { data: flows, isLoading, error } = useFlows(projectId);
  const editorState = useFlowEditorState(projectId);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [areaFilter, setAreaFilter] = useState<string | null>(null);

  const filteredFlows = flows?.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    if (areaFilter && f.featureArea !== areaFilter) return false;
    return true;
  }) || [];

  const groupedByArea = filteredFlows.reduce(
    (acc, f) => {
      acc[f.featureArea] = acc[f.featureArea] || [];
      acc[f.featureArea].push(f);
      return acc;
    },
    {} as Record<string, typeof flows>
  );

  return {
    flows: filteredFlows,
    groupedByArea,
    isLoading,
    error,
    editorState,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    areaFilter,
    setAreaFilter,
  };
}
