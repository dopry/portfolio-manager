/**
 * Maps items through an async mapper with at most `limit` invocations in
 * flight at once. Results are returned in input order. A mapper rejection
 * propagates to the caller (like Promise.all); workers that are already
 * running finish their current item, but no new items are started once the
 * pool drains.
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
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++;
        results[index] = await mapper(items[index], index);
      }
    },
  );
  await Promise.all(workers);
  return results;
}
