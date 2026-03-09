"use client";

import {
  type Dispatch,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  type SetStateAction,
  type TouchEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type CardPosition = { left: number; top: number };

export function useCardDragAndDrop<TSectionId extends string>(params: {
  isDragEnabled: boolean;
  isEditing: boolean;
  hasActiveResize: boolean;
  activeResizeId: TSectionId | null;
  order: TSectionId[] | null;
  setOrder: Dispatch<SetStateAction<TSectionId[] | null>>;
  gridRef: RefObject<HTMLDivElement | null>;
  reorder: (list: TSectionId[], fromId: TSectionId, toId: TSectionId) => TSectionId[];
}) {
  const {
    isDragEnabled,
    isEditing,
    hasActiveResize,
    activeResizeId,
    order,
    setOrder,
    gridRef,
    reorder,
  } = params;

  const [draggingId, setDraggingId] = useState<TSectionId | null>(null);
  const [touchDraggingId, setTouchDraggingId] = useState<TSectionId | null>(
    null,
  );
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);
  const draggingIdRef = useRef<TSectionId | null>(null);
  const touchDraggingIdRef = useRef<TSectionId | null>(null);
  const reorderLockRef = useRef(false);
  const lastDragTargetRef = useRef<TSectionId | null>(null);
  const lastTouchTargetRef = useRef<TSectionId | null>(null);
  const dragHandleArmedRef = useRef<TSectionId | null>(null);
  const previousCardPositionsRef = useRef<
    Partial<Record<TSectionId, CardPosition>>
  >({});
  const pendingFromPositionsRef = useRef<
    Partial<Record<TSectionId, CardPosition>> | null
  >(null);

  useEffect(() => {
    draggingIdRef.current = draggingId;
    touchDraggingIdRef.current = touchDraggingId;
  }, [draggingId, touchDraggingId]);

  const clearDragPreview = () => {
    if (dragPreviewRef.current) {
      dragPreviewRef.current.remove();
      dragPreviewRef.current = null;
    }
  };

  const getCurrentCardPositions = () => {
    const grid = gridRef.current;
    if (!grid) return {} as Partial<Record<TSectionId, CardPosition>>;

    const cards = Array.from(
      grid.querySelectorAll<HTMLElement>("[data-section-id]"),
    );
    const positions: Partial<Record<TSectionId, CardPosition>> = {};

    cards.forEach((card) => {
      const id = card.dataset.sectionId as TSectionId | undefined;
      if (!id) return;
      const rect = card.getBoundingClientRect();
      positions[id] = { left: rect.left, top: rect.top };
    });

    return positions;
  };

  const moveCard = (dragId: TSectionId, targetId: TSectionId) => {
    if (!isDragEnabled) return;
    if (dragId === targetId) return;
    if (reorderLockRef.current) return;

    reorderLockRef.current = true;
    setOrder((current) => {
      if (!current) {
        reorderLockRef.current = false;
        return current;
      }
      const fromIndex = current.indexOf(dragId);
      const toIndex = current.indexOf(targetId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        reorderLockRef.current = false;
        return current;
      }

      pendingFromPositionsRef.current = getCurrentCardPositions();
      return reorder(current, dragId, targetId);
    });
  };

  const finishDrag = () => {
    setDraggingId(null);
    dragHandleArmedRef.current = null;
    reorderLockRef.current = false;
    lastDragTargetRef.current = null;
    clearDragPreview();
  };

  const finishTouchDrag = () => {
    setTouchDraggingId(null);
    dragHandleArmedRef.current = null;
    reorderLockRef.current = false;
    lastTouchTargetRef.current = null;
  };

  const getCardWrapperClasses = (id: TSectionId) =>
    cn(
      "transition-[transform,opacity,box-shadow] border-border duration-300 ease-out will-change-transform",
      "relative",
      (draggingId === id || touchDraggingId === id) &&
        "scale-[0.98] opacity-35",
      (draggingId === id || touchDraggingId === id) &&
        "outline outline-2 outline-dashed outline-primary/50 outline-offset-2",
      activeResizeId === id && "select-none",
    );

  const getHeaderHandleClasses = () =>
    cn(
      "flex items-center justify-between select-none",
      !isEditing &&
        !hasActiveResize &&
        isDragEnabled &&
        "cursor-grab active:cursor-grabbing",
    );

  const armDragHandle = (
    id: TSectionId,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (!isDragEnabled || isEditing || hasActiveResize) return;
    if (event.button !== 0) return;
    dragHandleArmedRef.current = id;
  };

  const dragHandlers = (id: TSectionId) => ({
    draggable: isDragEnabled && !isEditing && !hasActiveResize,
    onDragStart: (event: DragEvent<HTMLDivElement>) => {
      if (
        !isDragEnabled ||
        isEditing ||
        hasActiveResize ||
        dragHandleArmedRef.current !== id
      ) {
        event.preventDefault();
        return;
      }

      const node = event.currentTarget;
      const rect = node.getBoundingClientRect();
      const preview = node.cloneNode(true) as HTMLDivElement;
      preview.style.position = "fixed";
      preview.style.top = "-10000px";
      preview.style.left = "-10000px";
      preview.style.width = `${rect.width}px`;
      preview.style.pointerEvents = "none";
      preview.style.opacity = "0.55";
      preview.style.transform = "scale(0.98)";
      preview.style.filter = "saturate(0.9)";
      preview.style.zIndex = "9999";
      document.body.appendChild(preview);
      dragPreviewRef.current = preview;

      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setDragImage(preview, offsetX, offsetY);

      setDraggingId(id);
      lastDragTargetRef.current = null;
    },
    onDragEnter: (event: DragEvent<HTMLDivElement>) => {
      if (!isDragEnabled || isEditing || hasActiveResize) return;
      event.preventDefault();
      if (draggingId && draggingId !== id) {
        if (lastDragTargetRef.current === id) return;
        lastDragTargetRef.current = id;
        moveCard(draggingId, id);
      }
    },
    onDragOver: (event: DragEvent<HTMLDivElement>) => {
      if (!isDragEnabled || isEditing || hasActiveResize) return;
      event.preventDefault();
    },
    onDrop: (event: DragEvent<HTMLDivElement>) => {
      if (!isDragEnabled || isEditing || hasActiveResize) return;
      event.preventDefault();
      finishDrag();
    },
    onDragEnd: () => {
      setDraggingId(null);
      dragHandleArmedRef.current = null;
      reorderLockRef.current = false;
      lastDragTargetRef.current = null;
      clearDragPreview();
    },
    onTouchStart: () => {
      if (
        !isDragEnabled ||
        isEditing ||
        hasActiveResize ||
        dragHandleArmedRef.current !== id
      ) {
        return;
      }
      setTouchDraggingId(id);
      lastTouchTargetRef.current = null;
    },
    onTouchMove: (event: TouchEvent<HTMLDivElement>) => {
      if (!isDragEnabled || isEditing || hasActiveResize) return;
      const touch = event.touches[0];
      const target = document
        .elementFromPoint(touch.clientX, touch.clientY)
        ?.closest("[data-section-id]") as HTMLElement | null;
      const targetId = target?.dataset.sectionId as TSectionId | undefined;

      if (targetId && touchDraggingId && touchDraggingId !== targetId) {
        if (lastTouchTargetRef.current === targetId) return;
        lastTouchTargetRef.current = targetId;
        moveCard(touchDraggingId, targetId);
      }
    },
    onTouchEnd: () => {
      if (!isDragEnabled || isEditing || hasActiveResize) return;
      finishTouchDrag();
    },
  });

  const cancelDragInteractions = () => {
    setDraggingId(null);
    setTouchDraggingId(null);
    dragHandleArmedRef.current = null;
    reorderLockRef.current = false;
    lastDragTargetRef.current = null;
    lastTouchTargetRef.current = null;
    clearDragPreview();
  };

  useEffect(() => {
    if (!isDragEnabled) {
      cancelDragInteractions();
    }
  }, [isDragEnabled]);

  useEffect(() => clearDragPreview, []);

  useEffect(() => {
    const clearArm = () => {
      dragHandleArmedRef.current = null;
    };
    window.addEventListener("pointerup", clearArm);
    window.addEventListener("pointercancel", clearArm);
    return () => {
      window.removeEventListener("pointerup", clearArm);
      window.removeEventListener("pointercancel", clearArm);
    };
  }, []);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const activeDragId = draggingIdRef.current ?? touchDraggingIdRef.current;
    const fromPositions =
      pendingFromPositionsRef.current ?? previousCardPositionsRef.current;

    const cards = Array.from(
      grid.querySelectorAll<HTMLElement>("[data-section-id]"),
    );
    const nextPositions: Partial<Record<TSectionId, CardPosition>> = {};

    cards.forEach((card) => {
      const id = card.dataset.sectionId as TSectionId | undefined;
      if (!id) return;

      // Prevent stacked transforms from previous reorder frames.
      card.getAnimations().forEach((animation) => animation.cancel());

      const rect = card.getBoundingClientRect();
      nextPositions[id] = { left: rect.left, top: rect.top };

      // Never animate the active dragged card itself.
      if (id === activeDragId) return;

      const previous = fromPositions[id];
      if (!previous) return;

      const deltaX = previous.left - rect.left;
      const deltaY = previous.top - rect.top;
      if (!deltaX && !deltaY) return;

      card.animate(
        [
          { transform: `translate(${deltaX}px, ${deltaY}px)` },
          { transform: "translate(0, 0)" },
        ],
        {
          duration: 260,
          easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        },
      );
    });

    previousCardPositionsRef.current = nextPositions;
    pendingFromPositionsRef.current = null;
    reorderLockRef.current = false;
  }, [order, gridRef]);

  return {
    getCardWrapperClasses,
    getHeaderHandleClasses,
    armDragHandle,
    dragHandlers,
    cancelDragInteractions,
  } as const;
}

