
import { SignupForm } from "@/features/auth";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-fg">
          Create your account
        </h2>

        <p className="text-sm text-fg-secondary">
          Get started with BlindSpot.
        </p>
      </div>

      <SignupForm />
    </div>
  );
}
