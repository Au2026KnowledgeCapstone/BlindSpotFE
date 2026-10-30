import { Providers } from "@/app/providers";
import { Workspace } from "@/features/workspace/workspace";

export default function WorkspacePage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return <main className="mx-auto max-w-xl p-10"><h1 className="text-2xl font-semibold">Workspace unavailable</h1><p className="mt-4">The workspace connection needs to be configured by your project administrator.</p></main>;
  }
  return <Providers><Workspace /></Providers>;
}
