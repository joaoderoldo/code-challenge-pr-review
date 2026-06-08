export type BugSeverity = "high" | "medium" | "low";

export type BugDefinition = {
  id: string;
  label: string;
  severity: BugSeverity;
  filePath: string;
  /**
   * Lines on which a comment counts as a hit for this bug. Kept narrow on
   * purpose — the bug at line 25 is the deps array, but a comment on line 19
   * (the `useEffect(...)` opener) or line 20 (early return inside the body)
   * is plausibly the same finding, so those count too. Lines used by a more
   * specific bug (e.g. state mutation at 21) are NOT included here.
   */
  lines: number[];
  /** Anchor line — used when surfacing "the bug at line N" in the admin UI. */
  primaryLine: number;
  /** Reference answer rendered alongside the candidate's comment in the admin view. */
  expectedAnswer: string;
};

export const BUGS: BugDefinition[] = [
  {
    id: "state-mutation",
    label: "Direct state mutation",
    severity: "medium",
    filePath: "src/lib/hooks/useRecentlyViewed.ts",
    lines: [21],
    primaryLine: 21,
    expectedAnswer:
      "`recent.unshift(currentId)` mutates the array held in state. Even though `setRecent(deduped)` runs afterwards, mutating the previous reference can break concurrent renders and violates React's immutability rule for state. Fix: build a new array — `setRecent(prev => [currentId, ...prev.filter(id => id !== currentId)].slice(0, MAX_RECENT))`.",
  },
  {
    id: "missing-effect-dep",
    label: "useEffect missing [currentId] dep",
    severity: "high",
    filePath: "src/lib/hooks/useRecentlyViewed.ts",
    lines: [19, 20, 22, 23, 24, 25],
    primaryLine: 25,
    expectedAnswer:
      "The effect reads `currentId` but the deps array is empty, so it only fires on mount. Switching characters in the same session never registers a new view. Fix: `}, [currentId]);`. (Bonus if they notice `recent` is also read inside — the right move is to rewrite with the updater form `setRecent(prev => ...)` so `recent` doesn't need to be in deps, which would otherwise cause a loop.)",
  },
  {
    id: "missing-cleanup",
    label: "Event listener has no cleanup",
    severity: "medium",
    filePath: "src/lib/hooks/useRecentlyViewed.ts",
    lines: [27, 33, 34],
    primaryLine: 33,
    expectedAnswer:
      "`addEventListener` without a matching `removeEventListener` leaks a handler on every remount. Strict Mode doubles it in dev so the leak shows up quickly. Fix: return a cleanup from the effect — `return () => window.removeEventListener(\"storage\", handleStorage);`.",
  },
  {
    id: "missing-querykey-dep",
    label: "queryKey missing recentIds dep",
    severity: "high",
    filePath: "src/routes/(characters)/-components/RecentlyViewedSidebar.tsx",
    lines: [10, 11],
    primaryLine: 11,
    expectedAnswer:
      "The `queryFn` depends on `recentIds`, but the `queryKey` is static. React Query identifies the cache by queryKey — when `recentIds` changes, it serves stale cached data instead of refetching. Fix: `queryKey: [\"recently-viewed\", recentIds]`. **Same pattern** as the original `useCharacters` bug in the coding challenge — a candidate who actually did the challenge themselves should catch this immediately.",
  },
  {
    id: "missing-list-key",
    label: "Missing key prop in .map()",
    severity: "low",
    filePath: "src/routes/(characters)/-components/RecentlyViewedSidebar.tsx",
    lines: [28, 29],
    primaryLine: 29,
    expectedAnswer:
      "The `<li>` rendered inside `.map()` has no `key`, so React can't reconcile the list correctly on reorder/delete (and the console warns). Fix: `<li key={character.id}>`.",
  },
];

export const findBugForLine = (
  filePath: string,
  lineNumber: number
): BugDefinition | null => {
  return (
    BUGS.find((bug) => bug.filePath === filePath && bug.lines.includes(lineNumber)) ?? null
  );
};

export const severityColor = (severity: BugSeverity): string => {
  switch (severity) {
    case "high":
      return "text-red-300 bg-red-900/30 border-red-800/50";
    case "medium":
      return "text-amber-300 bg-amber-900/30 border-amber-800/50";
    case "low":
      return "text-sky-300 bg-sky-900/30 border-sky-800/50";
  }
};
