"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Wrong password.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-canvas) px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-(--color-border-default) bg-(--color-canvas-subtle) p-6"
      >
        <div className="mb-5 flex items-center gap-2">
          <Lock size={18} className="text-(--color-fg-muted)" />
          <h1 className="text-lg font-semibold">Admin sign in</h1>
        </div>
        <label className="block text-sm text-(--color-fg-muted)">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            className="mt-1.5 w-full rounded border border-(--color-border-default) bg-(--color-canvas) px-3 py-2 text-sm text-(--color-fg-default) outline-none focus:border-(--color-accent)"
          />
        </label>
        {error && (
          <p className="mt-3 text-sm text-(--color-danger)">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="mt-5 w-full rounded bg-(--color-success-emphasis) px-3 py-2 text-sm font-medium text-white hover:bg-(--color-success)"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
