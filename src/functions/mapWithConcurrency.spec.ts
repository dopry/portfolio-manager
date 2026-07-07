import { describe, expect, it } from "vitest";
import { mapWithConcurrency } from "./mapWithConcurrency.js";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("mapWithConcurrency", () => {
  it("never exceeds the concurrency limit", async () => {
    const gates = Array.from({ length: 6 }, () => deferred<void>());
    let inFlight = 0;
    let maxInFlight = 0;

    const resultPromise = mapWithConcurrency(
      [0, 1, 2, 3, 4, 5],
      2,
      async (index) => {
        inFlight++;
        maxInFlight = Math.max(maxInFlight, inFlight);
        await gates[index].promise;
        inFlight--;
        return index * 10;
      },
    );

    // Release the gates one at a time; the pool must stay capped throughout.
    for (const gate of gates) {
      await new Promise((resolve) => setImmediate(resolve));
      expect(inFlight).to.be.at.most(2);
      gate.resolve();
    }

    await expect(resultPromise).resolves.toEqual([0, 10, 20, 30, 40, 50]);
    expect(maxInFlight).to.equal(2);
  });

  it("preserves input order even when later items finish first", async () => {
    const first = deferred<void>();
    const result = mapWithConcurrency(["a", "b", "c"], 3, async (item, i) => {
      if (i === 0) await first.promise;
      return item.toUpperCase();
    });
    await new Promise((resolve) => setImmediate(resolve));
    first.resolve();
    await expect(result).resolves.toEqual(["A", "B", "C"]);
  });

  it("propagates mapper rejections", async () => {
    await expect(
      mapWithConcurrency([1, 2, 3], 2, async (n) => {
        if (n === 2) throw new Error("boom");
        return n;
      }),
    ).rejects.toThrow("boom");
  });

  it("does not start new items after a rejection", async () => {
    let calls = 0;
    await expect(
      mapWithConcurrency([1, 2, 3, 4], 1, async () => {
        calls++;
        throw new Error("first item fails");
      }),
    ).rejects.toThrow("first item fails");
    // With a single worker, the failure must stop the pool before items 2-4.
    expect(calls).to.equal(1);
  });

  it("passes the item index to the mapper and handles limit > items", async () => {
    const seen: number[] = [];
    const result = await mapWithConcurrency(["x", "y"], 10, async (_, i) => {
      seen.push(i);
      return i;
    });
    expect(result).toEqual([0, 1]);
    expect(seen).toEqual([0, 1]);
  });

  it("resolves to an empty array for no items", async () => {
    await expect(
      mapWithConcurrency([], 3, async () => "never"),
    ).resolves.toEqual([]);
  });

  it("rejects invalid limits", async () => {
    await expect(mapWithConcurrency([1], 0, async (n) => n)).rejects.toThrow(
      "Invalid concurrency limit: 0",
    );
    await expect(mapWithConcurrency([1], 1.5, async (n) => n)).rejects.toThrow(
      "Invalid concurrency limit: 1.5",
    );
  });
});
