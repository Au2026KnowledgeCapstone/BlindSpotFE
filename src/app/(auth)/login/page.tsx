import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-fg">
          Welcome back
        </h2>

        <p className="text-sm text-fg-secondary">
          Sign in to continue to BlindSpot.
        </p>
      </div>

      {<LoginForm />}
    </div>
  );
}
