import { Redis } from "@upstash/redis";

const globalForDb = globalThis as unknown as {
  __prReviewStore?: Map<string, string>;
  __prReviewSets?: Map<string, Set<string>>;
};

const inMemoryStore =
  globalForDb.__prReviewStore ?? (globalForDb.__prReviewStore = new Map<string, string>());
const inMemorySets =
  globalForDb.__prReviewSets ?? (globalForDb.__prReviewSets = new Map<string, Set<string>>());

const hasRedis =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

if (!redis && process.env.NODE_ENV === "production") {
  console.warn(
    "[db] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set — using in-memory store. " +
      "Data will be lost on every cold start. Set the env vars in Vercel to persist sessions."
  );
}

export const db = {
  async get<T>(key: string): Promise<T | null> {
    if (redis) {
      return (await redis.get<T>(key)) ?? null;
    }
    const raw = inMemoryStore.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  async set<T>(key: string, value: T): Promise<void> {
    if (redis) {
      await redis.set(key, value);
      return;
    }
    inMemoryStore.set(key, JSON.stringify(value));
  },

  async sadd(key: string, member: string): Promise<void> {
    if (redis) {
      await redis.sadd(key, member);
      return;
    }
    const set = inMemorySets.get(key) ?? new Set<string>();
    set.add(member);
    inMemorySets.set(key, set);
  },

  async smembers(key: string): Promise<string[]> {
    if (redis) {
      return await redis.smembers(key);
    }
    const set = inMemorySets.get(key);
    return set ? Array.from(set) : [];
  },
};
