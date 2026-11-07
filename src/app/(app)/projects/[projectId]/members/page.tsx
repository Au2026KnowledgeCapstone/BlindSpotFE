import { ProjectMembers } from "@/features/workspace/project-members";

export default async function MembersPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectMembers projectId={projectId} />;
}
