"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";

export default function NewSessionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateName: name.trim() }),
    });
    setLoading(false);
    if (!res.ok) {
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      setError("Failed to create the session.");
      return;
    }
    const { token } = (await res.json()) as { token: string };
    setLink(`${window.location.origin}/review/${token}`);
  };

  const copy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-(--color-canvas)">
      <div className="mx-auto max-w-[640px] px-6 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-(--color-fg-muted) hover:text-(--color-fg-default)"
        >
          <ArrowLeft size={14} />
          Back to sessions
        </Link>

        <h1 className="mt-4 text-2xl font-semibold">New review session</h1>
        <p className="mt-1 text-sm text-(--color-fg-muted)">
          Create a unique link for a candidate. Share the link with them — no login needed on
          their side.
        </p>

        {!link ? (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-md border border-(--color-border-default) bg-(--color-canvas-subtle) p-5"
          >
            <label className="block text-sm text-(--color-fg-muted)">
              Candidate name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
                placeholder="e.g. Tamara Montijo"
                className="mt-1.5 w-full rounded border border-(--color-border-default) bg-(--color-canvas) px-3 py-2 text-sm text-(--color-fg-default) outline-none focus:border-(--color-accent)"
              />
            </label>
            {error && <p className="mt-3 text-sm text-(--color-danger)">{error}</p>}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="mt-4 rounded bg-(--color-success-emphasis) px-3 py-2 text-sm font-medium text-white hover:bg-(--color-success)"
            >
              {loading ? "Creating..." : "Create session"}
            </button>
          </form>
        ) : (
          <div className="mt-8 rounded-md border border-(--color-success) bg-(--color-canvas-subtle) p-5">
            <h2 className="font-semibold text-(--color-success)">Session created.</h2>
            <p className="mt-1 text-sm text-(--color-fg-muted)">
              Send this link to <span className="font-medium text-(--color-fg-default)">{name}</span>.
              The link is the only credential — anyone with it can submit the review.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded border border-(--color-border-default) bg-(--color-canvas) px-3 py-2">
              <code className="flex-1 truncate text-sm">{link}</code>
              <button
                onClick={copy}
                className="inline-flex items-center gap-1 rounded border border-(--color-border-default) bg-(--color-canvas-subtle) px-2 py-1 text-xs hover:bg-(--color-canvas)"
              >
                <Copy size={12} />
                {copied ? "Copied!" : "Copy"}
              </button>
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded border border-(--color-border-default) bg-(--color-canvas-subtle) px-2 py-1 text-xs hover:bg-(--color-canvas)"
              >
                <ExternalLink size={12} />
                Open
              </a>
            </div>
            <Link
              href="/admin"
              className="mt-4 inline-block text-sm text-(--color-accent) hover:underline"
            >
              ← Back to sessions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
