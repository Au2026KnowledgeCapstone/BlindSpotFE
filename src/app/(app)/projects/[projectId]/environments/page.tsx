import { ProjectInfrastructure } from "@/features/workspace";
export default async function EnvironmentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectInfrastructure projectId={projectId} environmentOnly />;
}
