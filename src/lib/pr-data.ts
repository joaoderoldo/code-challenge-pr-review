import type { DiffLine, PullRequest } from "@/types";

const A = (newLine: number, content: string): DiffLine => ({ type: "addition", newLine, content });
const C = (oldLine: number, newLine: number, content: string): DiffLine => ({
  type: "context",
  oldLine,
  newLine,
  content,
});
const H = (content: string): DiffLine => ({ type: "hunk", content });

/**
 * The fake PR shown to candidates.
 *
 * Five bugs are planted on purpose. They are all standard-issue React / TanStack Query
 * mistakes that any React developer should catch on a code review:
 *
 *  1. useRecentlyViewed.ts:21 — direct state mutation (`recent.unshift(currentId)`)
 *  2. useRecentlyViewed.ts:25 — missing `[currentId]` in the useEffect dep array
 *  3. useRecentlyViewed.ts:34 — useEffect adds a `storage` listener without cleanup
 *  4. RecentlyViewedSidebar.tsx:11 — queryKey `["recently-viewed"]` is missing `recentIds`
 *  5. RecentlyViewedSidebar.tsx:25 — `<li>` inside `.map()` has no `key` prop
 *
 * See BUGS_ANSWER_KEY.md at the project root for the grading rubric.
 */
export const pullRequest: PullRequest = {
  number: 142,
  title: "feat(characters): add Recently Viewed sidebar",
  author: "harry-dev",
  branch: "feature/recently-viewed",
  baseBranch: "main",
  description: `Adds a sidebar on the home page showing the last 5 characters the user viewed. The list is persisted to localStorage and syncs across tabs via the \`storage\` event.

## Changes
- New hook \`useRecentlyViewed\` for tracking + persistence
- New \`RecentlyViewedSidebar\` component
- The character detail page calls \`useRecentlyViewed(character.id)\` to register a view
- The home page renders the sidebar next to the character grid

Closes #138.`,
  files: [
    {
      path: "src/lib/hooks/useRecentlyViewed.ts",
      status: "added",
      additions: 37,
      deletions: 0,
      lines: [
        H("@@ -0,0 +1,37 @@"),
        A(1, 'import { useState, useEffect } from "react";'),
        A(2, ""),
        A(3, 'const STORAGE_KEY = "the-harry-potter-app-recently-viewed";'),
        A(4, "const MAX_RECENT = 5;"),
        A(5, ""),
        A(6, "const readFromStorage = (): string[] => {"),
        A(7, '  if (typeof window === "undefined") return [];'),
        A(8, "  try {"),
        A(9, "    const raw = window.localStorage.getItem(STORAGE_KEY);"),
        A(10, "    return raw ? JSON.parse(raw) : [];"),
        A(11, "  } catch {"),
        A(12, "    return [];"),
        A(13, "  }"),
        A(14, "};"),
        A(15, ""),
        A(16, "export const useRecentlyViewed = (currentId?: string) => {"),
        A(17, "  const [recent, setRecent] = useState<string[]>(readFromStorage);"),
        A(18, ""),
        A(19, "  useEffect(() => {"),
        A(20, "    if (!currentId) return;"),
        A(21, "    recent.unshift(currentId);"),
        A(22, "    const deduped = Array.from(new Set(recent)).slice(0, MAX_RECENT);"),
        A(23, "    setRecent(deduped);"),
        A(24, "    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));"),
        A(25, "  }, []);"),
        A(26, ""),
        A(27, "  useEffect(() => {"),
        A(28, "    const handleStorage = (e: StorageEvent) => {"),
        A(29, "      if (e.key === STORAGE_KEY) {"),
        A(30, "        setRecent(readFromStorage());"),
        A(31, "      }"),
        A(32, "    };"),
        A(33, '    window.addEventListener("storage", handleStorage);'),
        A(34, "  }, []);"),
        A(35, ""),
        A(36, "  return recent;"),
        A(37, "};"),
      ],
    },
    {
      path: "src/routes/(characters)/-components/RecentlyViewedSidebar.tsx",
      status: "added",
      additions: 41,
      deletions: 0,
      lines: [
        H("@@ -0,0 +1,41 @@"),
        A(1, 'import { useQuery } from "@tanstack/react-query";'),
        A(2, 'import { Link } from "@tanstack/react-router";'),
        A(3, 'import { fetchCharacter } from "@lib/api/characters";'),
        A(4, 'import { useRecentlyViewed } from "@lib/hooks/useRecentlyViewed";'),
        A(5, 'import { Character } from "@lib/constants/characters";'),
        A(6, ""),
        A(7, "export const RecentlyViewedSidebar = () => {"),
        A(8, "  const recentIds = useRecentlyViewed();"),
        A(9, ""),
        A(10, "  const { data: characters = [], isLoading } = useQuery<Character[]>({"),
        A(11, '    queryKey: ["recently-viewed"],'),
        A(12, "    queryFn: async () => {"),
        A(13, "      const results = await Promise.all(recentIds.map((id) => fetchCharacter(id)));"),
        A(14, "      return results.filter((c): c is Character => Boolean(c));"),
        A(15, "    },"),
        A(16, "    enabled: recentIds.length > 0,"),
        A(17, "  });"),
        A(18, ""),
        A(19, "  if (recentIds.length === 0) return null;"),
        A(20, ""),
        A(21, "  return ("),
        A(22, '    <aside className="w-60 shrink-0">'),
        A(23, '      <h2 className="font-decorative text-lg text-amber-200 mb-4">Recently Viewed</h2>'),
        A(24, "      {isLoading ? ("),
        A(25, '        <p className="text-sm text-amber-200/40">Loading...</p>'),
        A(26, "      ) : ("),
        A(27, '        <ul className="flex flex-col gap-2">'),
        A(28, "          {characters.map((character) => ("),
        A(29, "            <li>"),
        A(30, '              <Link to="/$characterId" params={{ characterId: character.id }}'),
        A(31, '                className="flex items-center gap-2 rounded-lg p-2 hover:bg-amber-900/20">'),
        A(32, "                <img src={character.image || undefined} alt={character.name}"),
        A(33, '                  className="h-10 w-10 rounded-full object-cover" />'),
        A(34, '                <span className="text-sm text-amber-100">{character.name}</span>'),
        A(35, "              </Link>"),
        A(36, "            </li>"),
        A(37, "          ))}"),
        A(38, "        </ul>"),
        A(39, "      )}"),
        A(40, "    </aside>"),
        A(41, "  );"),
        A(42, "};"),
      ],
    },
    {
      path: "src/routes/(characters)/$characterId.tsx",
      status: "modified",
      additions: 2,
      deletions: 0,
      lines: [
        H("@@ -6,6 +6,7 @@"),
        C(6, 6, 'import { InfoSection } from "@lib/components/InfoSection";'),
        C(7, 7, 'import { Button } from "@lib/components/Button";'),
        C(8, 8, 'import { Character } from "@lib/constants/characters";'),
        A(9, 'import { useRecentlyViewed } from "@lib/hooks/useRecentlyViewed";'),
        C(9, 10, 'import { CharacterCard } from "./-components/CharacterCard";'),
        C(10, 11, 'import { formatDate } from "@lib/utils";'),
        C(11, 12, ""),
        H("@@ -22,6 +23,7 @@"),
        C(22, 23, "function CharacterDetailsView() {"),
        C(23, 24, "  const character = Route.useLoaderData();"),
        C(24, 25, ""),
        A(26, "  useRecentlyViewed(character?.id);"),
        C(25, 27, "  if (!character) {"),
        C(26, 28, "    return ("),
        C(27, 29, '      <div className="flex flex-col items-center gap-4 py-20 text-center">'),
      ],
    },
    {
      path: "src/routes/(characters)/index.tsx",
      status: "modified",
      additions: 9,
      deletions: 1,
      lines: [
        H("@@ -3,6 +3,7 @@"),
        C(3, 3, 'import { characterFilters } from "@lib/constants/filters";'),
        C(4, 4, 'import { CharactersGrid } from "./-components/CharactersGrid";'),
        C(5, 5, 'import { CharactersFilters } from "./-components/CharactersFilters";'),
        A(6, 'import { RecentlyViewedSidebar } from "./-components/RecentlyViewedSidebar";'),
        C(6, 7, ""),
        C(7, 8, 'export const Route = createFileRoute("/(characters)/")({'),
        C(8, 9, "  component: CharactersIndexView,"),
        H("@@ -19,8 +20,15 @@"),
        C(19, 20, "function CharactersIndexView() {"),
        C(20, 21, "  return ("),
        C(21, 22, "    <>"),
        C(22, 23, "      <CharactersFilters />"),
        { type: "deletion", oldLine: 23, content: "      <CharactersGrid />" },
        A(24, '      <div className="flex gap-8 px-4">'),
        A(25, '        <div className="flex-1">'),
        A(26, "          <CharactersGrid />"),
        A(27, "        </div>"),
        A(28, "        <RecentlyViewedSidebar />"),
        A(29, "      </div>"),
        C(24, 30, "    </>"),
        C(25, 31, "  );"),
        C(26, 32, "}"),
      ],
    },
  ],
};
