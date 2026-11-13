import Link from "next/link";
import { Compass } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <EmptyState
        icon={Compass}
        title="404: Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        action={<Link href="/dashboard" className="text-xs text-accent underline-offset-4 hover:underline">Back to dashboard</Link>}
        className="max-w-sm"
      />
    </main>
  );
}
