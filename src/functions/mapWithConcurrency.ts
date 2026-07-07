/**
 * Maps items through an async mapper with at most `limit` invocations in
 * flight at once. Results are returned in input order. A mapper rejection
 * propagates to the caller (like Promise.all); workers finish the item they
 * are currently awaiting, but no new items are started after a rejection.
 *
 * Used to bound fan-out against the ESPM API, which rate-limits aggressively
 * enough that unbounded Promise.all over per-entity requests trips 429s.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error(`Invalid concurrency limit: ${limit}`);
  }
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  let failed = false;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (!failed && nextIndex < items.length) {
        const index = nextIndex++;
        try {
          results[index] = await mapper(items[index], index);
        } catch (error) {
          failed = true;
          throw error;
        }
      }
    },
  );
  await Promise.all(workers);
  return results;
}
