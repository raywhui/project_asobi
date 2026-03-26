"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readClientJson, writeClientJson } from "@/lib/client-storage";

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

  // Load order from client storage on mount
  useEffect(() => {
    let isActive = true;

    const loadOrder = async () => {
      const parsed = await readClientJson<TSectionId[]>(storageKeyOrder);
      if (!isActive || !parsed) {
        setOrder(initialOrder);
        return;
      }

      const parsedSet = new Set(parsed);
      const valid =
        parsed.length === initialOrder.length &&
        initialOrder.every((id) => parsedSet.has(id));

      setOrder(valid ? parsed : initialOrder);
    };

    void loadOrder();
    return () => {
      isActive = false;
    };
  }, [initialOrder, storageKeyOrder]);

  // Load card spans from client storage on mount
  useEffect(() => {
    let isActive = true;

    const loadSpans = async () => {
      const parsed = await readClientJson<Partial<Record<TSectionId, CardSpan>> | null>(
        storageKeySpans,
      );
      if (!isActive || !parsed) return;

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
    };

    void loadSpans();
    return () => {
      isActive = false;
    };
  }, [createInitialSpans, initialOrder, storageKeySpans]);

  // Keep ref in sync with state
  useEffect(() => {
    cardSpansRef.current = cardSpans;
  }, [cardSpans]);

  // Persist order when it changes
  useEffect(() => {
    if (!order) return;
    void writeClientJson(storageKeyOrder, order);
  }, [order, storageKeyOrder]);

  const persistSpans = useCallback(() => {
    void writeClientJson(storageKeySpans, cardSpansRef.current);
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
