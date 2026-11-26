import { LoginForm } from "@/features/auth";

const confirmationMessages = {
  confirmed: "Email confirmation completed. Sign in or continue to your workspace.",
  expired: "This confirmation link has expired. Request a new link or try signing in if you already confirmed.",
  invalid: "This confirmation link could not be verified. Open it in the browser where you requested it, or request a new link.",
  failed: "We could not complete the confirmation link. Try signing in, or request a new confirmation email.",
};

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ confirmation?: string | string[] }>;
}) {
  const { confirmation } = await searchParams;
  const outcome = typeof confirmation === "string" && Object.hasOwn(confirmationMessages, confirmation)
    ? confirmation as keyof typeof confirmationMessages
    : undefined;
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-fg">
          Welcome back
        </h2>

        <p className="text-sm text-fg-secondary">
          Sign in to continue to BlindSpot.
        </p>
      </div>

      {outcome && (
        <p role={outcome === "confirmed" ? "status" : "alert"} className={outcome === "confirmed" ? "text-sm text-pass" : "text-sm text-fail"}>
          {confirmationMessages[outcome]}
        </p>
      )}
      <LoginForm checkExistingSession={Boolean(outcome)} />
    </div>
  );
}
