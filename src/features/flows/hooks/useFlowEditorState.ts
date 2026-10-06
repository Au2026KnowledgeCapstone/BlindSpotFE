import { useEffect, useState } from "react";

export function useFlowEditorState(projectId: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  return {
    isOpen,
    selectedFlowId,
    openEditor: (flowId: string) => {
      setSelectedFlowId(flowId);
      setIsOpen(true);
    },
    closeEditor: () => {
      setSelectedFlowId(null);
      setIsOpen(false);
    },
  };
}
