
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authService } from "../services/auth-service";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setLoading(true);
    setError("");

    try {
      await authService.signOut();

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Unable to log out. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleLogout}
        disabled={loading}
      >
        {loading ? "Logging out..." : "Log out"}
      </Button>

      {error && (
        <p role="alert" className="text-sm text-fail">
          {error}
        </p>
      )}
    </div>
  );
}
