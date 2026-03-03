"use client";

import {
  useCallback,
  type ComponentProps,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Expand, GripVertical, Minimize2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const EXPAND_ANIMATION_MS = 280;

type ExpandableCardModalProps = {
  title: ReactNode;
  children: ReactNode;
  cardClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  onHeaderPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
};

export function ExpandableCardModal({
  title,
  children,
  cardClassName,
  contentClassName,
  headerClassName,
  titleClassName,
  onHeaderPointerDown,
}: ExpandableCardModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const inlineCardRef = useRef<HTMLDivElement | null>(null);
  const modalPanelRef = useRef<HTMLDivElement | null>(null);

  const animateModal = (mode: "open" | "close", onDone?: () => void) => {
    const inlineRect = inlineCardRef.current?.getBoundingClientRect();
    const panelRect = modalPanelRef.current?.getBoundingClientRect();
    const panel = modalPanelRef.current;
    if (!inlineRect || !panelRect || !panel) {
      onDone?.();
      return;
    }

    const deltaX = inlineRect.left - panelRect.left;
    const deltaY = inlineRect.top - panelRect.top;
    const scaleX = inlineRect.width / panelRect.width;
    const scaleY = inlineRect.height / panelRect.height;

    const keyframes: Keyframe[] = [
      {
        transformOrigin: "top left",
        transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
        opacity: 0.25,
      },
      {
        transformOrigin: "top left",
        transform: "translate(0, 0) scale(1, 1)",
        opacity: 1,
      },
    ];

    const animation = panel.animate(
      mode === "open" ? keyframes : [...keyframes].reverse(),
      {
        duration: EXPAND_ANIMATION_MS,
        easing: "cubic-bezier(0.2, 0.75, 0.2, 1)",
        fill: "both",
      },
    );

    animation.onfinish = () => onDone?.();
  };

  const closeModal = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
  }, [isClosing]);

  const openModal = useCallback(() => {
    if (isOpen) return;
    setIsOpen(true);
  }, [isOpen]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || isClosing) return;
    const id = requestAnimationFrame(() => animateModal("open"));
    return () => cancelAnimationFrame(id);
  }, [isOpen, isClosing]);

  useEffect(() => {
    if (!isClosing) return;
    animateModal("close", () => {
      setIsOpen(false);
      setIsClosing(false);
    });
  }, [isClosing]);

  useEffect(() => {
    if (!isOpen) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEscape);
    };
  }, [isOpen, closeModal]);

  const ToggleButton = ({
    expanded,
    ...props
  }: { expanded: boolean } & ComponentProps<"button">) => (
    <button
      type="button"
      onPointerDown={(event) => event.stopPropagation()}
      className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={expanded ? "Close expanded card" : "Expand card"}
      {...props}
    >
      {expanded ? (
        <Minimize2 className="h-4 w-4" />
      ) : (
        <Expand className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <>
      <div ref={inlineCardRef}>
        <Card className={cn("h-full", cardClassName)}>
          <CardHeader>
            <div
              className={cn(
                "flex items-center justify-between",
                headerClassName,
              )}
              onPointerDown={onHeaderPointerDown}
            >
              <CardTitle
                className={cn("text-muted-foreground", titleClassName)}
              >
                {title}
              </CardTitle>
              <div className="flex items-center gap-1">
                <ToggleButton expanded={false} onClick={openModal} />
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className={contentClassName}>{children}</CardContent>
        </Card>
      </div>

      {isMounted &&
        isOpen &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200",
              isClosing ? "bg-black/0" : "bg-black/55",
            )}
          >
            <button
              type="button"
              aria-label="Close modal"
              onClick={closeModal}
              className="absolute inset-0 cursor-default"
            />

            <div
              ref={modalPanelRef}
              className="relative z-10 w-[80vw] max-w-screen-lg"
            >
              <Card className="max-h-[85vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle
                      className={cn("text-muted-foreground", titleClassName)}
                    >
                      {title}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <ToggleButton expanded onClick={closeModal} />
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={contentClassName}>
                  {children}
                </CardContent>
              </Card>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
