# Gabarito — Bugs no PR fake

**NÃO compartilhar com candidatos.** Este arquivo lista cada bug plantado no PR `feat(characters): add Recently Viewed sidebar`, a linha exata e o que se espera que o candidato comente.

Todos os 5 bugs são padrão React / TanStack Query — qualquer dev frontend razoável deveria pegar. Se o candidato fez o coding-challenge sozinho (sem IA), o bug do `queryKey` deveria ser **especialmente fácil** porque é o mesmo padrão do bug 2 do challenge original (em `useCharacters.ts`).

---

## Bug 1 — Mutação direta de state

**Arquivo**: `src/lib/hooks/useRecentlyViewed.ts`
**Linha**: 21
**Código**:
```ts
recent.unshift(currentId);
const deduped = Array.from(new Set(recent)).slice(0, MAX_RECENT);
setRecent(deduped);
```

**Problema**: `recent.unshift()` muta o array original que veio de `useState`. React compara state por referência; mesmo que a chamada `setRecent(deduped)` seja com um novo array, mutar o anterior pode causar inconsistências em renders concorrentes e quebra a regra "state é imutável".

**Resposta esperada do candidato**: "state mutation — `unshift` muta o array do useState. Deve fazer `setRecent([currentId, ...recent.filter(id => id !== currentId)].slice(0, MAX_RECENT))` ou usar updater function."

**Severidade**: Média. Não causa bug visível imediato, mas é violação de regra fundamental.

---

## Bug 2 — `useEffect` com dependência faltando

**Arquivo**: `src/lib/hooks/useRecentlyViewed.ts`
**Linha**: 25
**Código**:
```ts
useEffect(() => {
  if (!currentId) return;
  recent.unshift(currentId);
  // ...
}, []);              // ← deveria ser [currentId]
```

**Problema**: O effect lê `currentId` mas tem deps array vazio. Roda só no mount; trocar de personagem na mesma sessão não registra a view.

**Resposta esperada**: "deps array vazio — o effect usa `currentId` e `recent`, deveria depender pelo menos de `currentId`. Senão só registra a primeira view, não as próximas." (Bonus se mencionar a regra do exhaustive-deps lint, ou que `recent` causaria loop.)

**Severidade**: Alta. Feature praticamente não funciona.

---

## Bug 3 — `useEffect` sem cleanup do event listener

**Arquivo**: `src/lib/hooks/useRecentlyViewed.ts`
**Linha**: 34
**Código**:
```ts
useEffect(() => {
  const handleStorage = (e: StorageEvent) => { /* ... */ };
  window.addEventListener("storage", handleStorage);
  // ← falta: return () => window.removeEventListener("storage", handleStorage);
}, []);
```

**Problema**: Memory leak — o listener nunca é removido. Toda vez que o hook remonta, acumula um listener. Em dev com Strict Mode roda 2x e fica visível rápido.

**Resposta esperada**: "falta cleanup — precisa retornar uma função do effect que faz `removeEventListener`. Strict Mode duplica o listener."

**Severidade**: Média. Não quebra a feature mas vaza memória.

---

## Bug 4 — `queryKey` sem dependência

**Arquivo**: `src/routes/(characters)/-components/RecentlyViewedSidebar.tsx`
**Linha**: 11
**Código**:
```ts
const { data: characters = [], isLoading } = useQuery<Character[]>({
  queryKey: ["recently-viewed"],     // ← falta recentIds
  queryFn: async () => {
    const results = await Promise.all(recentIds.map((id) => fetchCharacter(id)));
    return results.filter((c): c is Character => Boolean(c));
  },
  enabled: recentIds.length > 0,
});
```

**Problema**: A `queryFn` depende de `recentIds`, mas a `queryKey` é estática. React Query identifica o cache pela queryKey — quando `recentIds` muda, ele devolve o cache antigo em vez de refetch.

**Resposta esperada**: "queryKey precisa incluir `recentIds` — senão o cache não invalida quando a lista muda. Mesmo bug do `useCharacters` do challenge."

**Severidade**: Alta. **Este é o bug âncora** — se o candidato fez o challenge ele DEVE pegar.

---

## Bug 5 — Falta `key` no `.map()`

**Arquivo**: `src/routes/(characters)/-components/RecentlyViewedSidebar.tsx`
**Linha**: 29
**Código**:
```tsx
{characters.map((character) => (
  <li>                        // ← falta key={character.id}
    <Link to="/$characterId" ...>
      ...
```

**Problema**: React precisa do `key` para reconciliar a lista. Sem ele, performance ruim e bugs estranhos em reorder/delete. O console mostra warning.

**Resposta esperada**: "falta `key` no `<li>` — precisa de `key={character.id}` no elemento raiz do map."

**Severidade**: Baixa. Funciona aparentemente, mas é erro de iniciante.

---

## Sugestão de pontuação

| # | Bug | Peso |
|---|---|---|
| 1 | Mutação de state | 1 |
| 2 | useEffect dep faltando | 2 (alta) |
| 3 | Listener sem cleanup | 1 |
| 4 | queryKey sem dep | 3 (âncora — pegou = fez o challenge) |
| 5 | Missing key no map | 1 |

**Total**: 8 pontos.

- **7-8**: senior real, fez o challenge sem IA
- **5-6**: bom, mas pode ter usado IA pesada no challenge
- **3-4**: médio, alerta amarelo
- **0-2**: vermelho — não fez review de PR antes, ou só passou o diff pra IA

### Sinais de alerta a observar
- **Comentários genéricos** ("This could be improved") sem citar o problema específico = passou pela IA sem ler.
- **Pegou bug 4 mas não bug 2** = pode ter procurado padrões já vistos no challenge.
- **Não pegou bug 4** = forte indício de não ter feito o challenge sozinho.
- **Bugs inventados** (apontar problema onde não tem) = não entende o código.
- **Não pegou nada em 10+ minutos** = pedir pra ele compartilhar a tela e pensar em voz alta.
