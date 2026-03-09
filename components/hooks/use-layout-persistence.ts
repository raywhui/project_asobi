"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CardSpan = { colSpan: number; rowSpan: number };

export function useLayoutPersistence<TSectionId extends string>(params: {
  storageKeyOrder: string;
  storageKeySpans: string;
  initialOrder: TSectionId[];
  createInitialSpans: () => Record<TSectionId, CardSpan>;
}) {
  const { storageKeyOrder, storageKeySpans, initialOrder, createInitialSpans } =
    params;

  const [order, setOrder] = useState<TSectionId[] | null>(null);
  const [cardSpans, setCardSpans] = useState<Record<TSectionId, CardSpan>>(
    createInitialSpans,
  );
  const cardSpansRef = useRef<Record<TSectionId, CardSpan>>(
    createInitialSpans(),
  );

  // Load order from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(storageKeyOrder);
    if (!raw) {
      setOrder(initialOrder);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as TSectionId[];
      const parsedSet = new Set(parsed);
      const valid =
        parsed.length === initialOrder.length &&
        initialOrder.every((id) => parsedSet.has(id));

      setOrder(valid ? parsed : initialOrder);
    } catch {
      setOrder(initialOrder);
    }
  }, [initialOrder, storageKeyOrder]);

  // Load card spans from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(storageKeySpans);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<
        Record<TSectionId, CardSpan>
      > | null;
      if (!parsed) return;

      const next = createInitialSpans();

      for (const id of initialOrder) {
        const span = parsed[id];
        if (!span) continue;

        const colSpan = Number(span.colSpan);
        const rowSpan = Number(span.rowSpan);
        if (!Number.isFinite(colSpan) || !Number.isFinite(rowSpan)) continue;

        next[id] = {
          colSpan: Math.min(5, Math.max(1, Math.round(colSpan))),
          rowSpan: Math.min(3, Math.max(1, Math.round(rowSpan))),
        };
      }

      setCardSpans(next);
      cardSpansRef.current = next;
    } catch {
      // Ignore invalid localStorage data and use defaults.
    }
  }, [createInitialSpans, initialOrder, storageKeySpans]);

  // Keep ref in sync with state
  useEffect(() => {
    cardSpansRef.current = cardSpans;
  }, [cardSpans]);

  // Persist order when it changes
  useEffect(() => {
    if (!order || typeof window === "undefined") return;
    window.localStorage.setItem(storageKeyOrder, JSON.stringify(order));
  }, [order, storageKeyOrder]);

  const persistSpans = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      storageKeySpans,
      JSON.stringify(cardSpansRef.current),
    );
  }, [storageKeySpans]);

  return {
    order,
    setOrder,
    cardSpans,
    setCardSpans,
    cardSpansRef,
    persistSpans,
  } as const;
}

