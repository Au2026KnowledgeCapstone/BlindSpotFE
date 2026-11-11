import Link from "next/link";
import { AccountMenu } from "@/features/auth";
import { BlindSpotMark } from "./BlindSpotMark";

/** The header for pages outside the project app shell (no sidebar): the
 * projects directory and account settings. The BlindSpot wordmark always
 * links back to /projects, same as the sidebar logo inside a project. */
export function StandaloneHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-panel px-4 sm:px-6">
      <Link
        href="/projects"
        className="flex items-center gap-2 rounded-lg text-sm font-semibold tracking-tight text-fg focus:outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/50"
      >
        <BlindSpotMark size={20} />
        <span>BlindSpot</span>
      </Link>
      <AccountMenu />
    </header>
  );
}
