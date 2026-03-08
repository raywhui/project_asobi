"use client";

import {
  type ComponentProps,
  type CSSProperties,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  Diamond,
  Dice3,
  Dot,
  Footprints,
  Heart,
  HeartPlus,
  Move,
  Plus,
  Pencil,
  Save,
  Scaling,
  Settings2,
  Shield,
  Skull,
  Swords,
  Triangle,
  LoaderPinwheel,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input as BaseInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea as BaseTextarea } from "@/components/ui/textarea";
import { ExpandableCardModal } from "@/components/expandable-card-modal";
import { EditableListField } from "@/components/editable-list-field";
import { type CharacterSheetState } from "@/data/dnd-character-sheet";
import { cn, formatSavingThrow } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type SectionId =
  | "basics"
  | "abilities"
  | "savingThrows"
  | "combat"
  | "skills"
  | "equipment"
  | "features"
  | "spells"
  | "backstory";

const initialOrder: SectionId[] = [
  "basics",
  "abilities",
  "savingThrows",
  "combat",
  "skills",
  "equipment",
  "features",
  "spells",
  "backstory",
];
const ORDER_STORAGE_KEY = "dnd-sheet-card-order-v1";
const SPANS_STORAGE_KEY = "dnd-sheet-card-spans-v1";
const COLUMN_OPTIONS = [3, 4, 5] as const;
type ColumnCount = (typeof COLUMN_OPTIONS)[number];
type CardSpan = { colSpan: number; rowSpan: number };
type ResizeState = {
  id: SectionId;
  startX: number;
  startY: number;
  startColSpan: number;
  startRowSpan: number;
  startWidth: number;
  startHeight: number;
  resizeX: boolean;
  resizeY: boolean;
};

const defaultSectionGridSpan: Record<SectionId, CardSpan> = {
  basics: { colSpan: 2, rowSpan: 1 },
  abilities: { colSpan: 1, rowSpan: 1 },
  savingThrows: { colSpan: 1, rowSpan: 1 },
  combat: { colSpan: 1, rowSpan: 1 },
  skills: { colSpan: 2, rowSpan: 1 },
  equipment: { colSpan: 1, rowSpan: 1 },
  features: { colSpan: 1, rowSpan: 1 },
  spells: { colSpan: 1, rowSpan: 1 },
  backstory: { colSpan: 1, rowSpan: 1 },
};

function reorder<T>(list: T[], fromId: T, toId: T) {
  const fromIndex = list.indexOf(fromId);
  const toIndex = list.indexOf(toId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return list;
  }

  const next = [...list];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

function createInitialSpans(): Record<SectionId, CardSpan> {
  return {
    basics: { ...defaultSectionGridSpan.basics },
    abilities: { ...defaultSectionGridSpan.abilities },
    savingThrows: { ...defaultSectionGridSpan.savingThrows },
    combat: { ...defaultSectionGridSpan.combat },
    skills: { ...defaultSectionGridSpan.skills },
    equipment: { ...defaultSectionGridSpan.equipment },
    features: { ...defaultSectionGridSpan.features },
    spells: { ...defaultSectionGridSpan.spells },
    backstory: { ...defaultSectionGridSpan.backstory },
  };
}

function parseStoredSpans(
  raw: string | null,
): Record<SectionId, CardSpan> | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<Record<SectionId, CardSpan>>;
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

    return next;
  } catch {
    return null;
  }
}

type SheetInputProps = ComponentProps<typeof BaseInput> & {
  isEditing: boolean;
};

function SheetInput({
  isEditing,
  className,
  value,
  ...props
}: SheetInputProps) {
  if (isEditing) {
    return (
      <BaseInput
        className={cn(className, props.type === "number" ? "w-16" : "w-auto")}
        value={value}
        {...props}
      />
    );
  }

  const displayValue = value == null ? "" : String(value);
  return (
    <p
      className={cn(
        `pr-3 text-md leading-7 ${displayValue.length > 5 ? "w-[50%]" : "w-[15%]"}`,
        className,
      )}
    >
      {displayValue || "\u2014"}
    </p>
  );
}

type SheetTextareaProps = ComponentProps<typeof BaseTextarea> & {
  isEditing: boolean;
};

function SheetTextarea({
  isEditing,
  className,
  value,
  ...props
}: SheetTextareaProps) {
  if (isEditing) {
    return <BaseTextarea className={className} value={value} {...props} />;
  }

  return (
    <BaseTextarea className={className} value={value} {...props} disabled />
  );
}

export function DndCharacterSheet({
  userCharacterData,
  charId,
  onSave,
}: {
  userCharacterData: CharacterSheetState;
  charId?: string;
  onSave?: (charId: string, sheet: CharacterSheetState) => Promise<unknown>;
}) {
  const [sheet, setSheet] = useState<CharacterSheetState>(userCharacterData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(true);
  const [isResizeEnabled, setIsResizeEnabled] = useState(true);
  const [isSpellCardVisible, setIsSpellCardVisible] = useState(true);
  const [columnCount, setColumnCount] = useState<ColumnCount>(4);
  const [order, setOrder] = useState<SectionId[] | null>(null);
  const [cardSpans, setCardSpans] =
    useState<Record<SectionId, CardSpan>>(createInitialSpans);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [draggingId, setDraggingId] = useState<SectionId | null>(null);
  const [touchDraggingId, setTouchDraggingId] = useState<SectionId | null>(
    null,
  );
  const dragPreviewRef = useRef<HTMLDivElement | null>(null);
  const draggingIdRef = useRef<SectionId | null>(null);
  const touchDraggingIdRef = useRef<SectionId | null>(null);
  const reorderLockRef = useRef(false);
  const lastDragTargetRef = useRef<SectionId | null>(null);
  const lastTouchTargetRef = useRef<SectionId | null>(null);
  const dragHandleArmedRef = useRef<SectionId | null>(null);
  const cardSpansRef =
    useRef<Record<SectionId, CardSpan>>(createInitialSpans());
  const gridRef = useRef<HTMLDivElement | null>(null);
  const previousCardPositionsRef = useRef<
    Partial<Record<SectionId, { left: number; top: number }>>
  >({});
  const pendingFromPositionsRef = useRef<Partial<
    Record<SectionId, { left: number; top: number }>
  > | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) {
      setOrder(initialOrder);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      const parsedSet = new Set(parsed);
      const valid =
        parsed.length === initialOrder.length &&
        initialOrder.every((id) => parsedSet.has(id));

      if (valid) {
        setOrder(parsed as SectionId[]);
        return;
      }
    } catch {
      // Ignore invalid localStorage data and use defaults.
    }
    setOrder(initialOrder);
  }, []);

  useEffect(() => {
    const storedSpans = parseStoredSpans(
      window.localStorage.getItem(SPANS_STORAGE_KEY),
    );
    if (storedSpans) {
      setCardSpans(storedSpans);
    }
  }, []);

  useEffect(() => {
    if (!order) return;
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  }, [order]);

  useEffect(() => {
    draggingIdRef.current = draggingId;
    touchDraggingIdRef.current = touchDraggingId;
  }, [draggingId, touchDraggingId]);

  useEffect(() => {
    cardSpansRef.current = cardSpans;
  }, [cardSpans]);

  useEffect(() => {
    if (!isDragEnabled) {
      setDraggingId(null);
      setTouchDraggingId(null);
      dragHandleArmedRef.current = null;
      reorderLockRef.current = false;
      lastDragTargetRef.current = null;
      lastTouchTargetRef.current = null;
      if (dragPreviewRef.current) {
        dragPreviewRef.current.remove();
        dragPreviewRef.current = null;
      }
    }
  }, [isDragEnabled]);

  useEffect(() => {
    if (!isResizeEnabled) {
      setResizeState(null);
    }
  }, [isResizeEnabled]);

  const editableInputClass = "";
  const characterOptionalFields = [
    { key: "race", label: "Race" },
    { key: "background", label: "Background" },
    { key: "alignment", label: "Alignment" },
    { key: "experiencePoints", label: "XP" },
    { key: "gender", label: "Gender" },
  ] as const;

  const updateListOrBackstoryField = <
    K extends "equipment" | "featuresAndTraits" | "backstory",
  >(
    key: K,
    value: CharacterSheetState[K],
  ) => {
    if (!isEditing) return;
    setSheet((current) => ({ ...current, [key]: value }));
  };

  const updateSpellList = (value: CharacterSheetState["spells"]["list"]) => {
    if (!isEditing) return;
    setSheet((current) => ({
      ...current,
      spells: {
        ...current.spells,
        list: value,
      },
    }));
  };

  const updateSpellSlotAmount = (slotIndex: number, delta: number) => {
    setSheet((current) => {
      const slot = current.spells.slots[slotIndex];
      if (!slot) return current;

      const nextAmount = Math.min(slot.max, Math.max(0, slot.amount + delta));
      if (nextAmount === slot.amount) return current;

      return {
        ...current,
        spells: {
          ...current.spells,
          slots: current.spells.slots.map((item, index) =>
            index === slotIndex ? { ...item, amount: nextAmount } : item,
          ),
        },
      };
    });
  };

  const updateSpellSlotTitle = (slotIndex: number, title: string) => {
    if (!isEditing) return;
    setSheet((current) => {
      const slot = current.spells.slots[slotIndex];
      if (!slot) return current;

      return {
        ...current,
        spells: {
          ...current.spells,
          slots: current.spells.slots.map((item, index) =>
            index === slotIndex ? { ...item, title } : item,
          ),
        },
      };
    });
  };

  const updateSpellSlotMax = (slotIndex: number, nextValue: string) => {
    if (!isEditing) return;
    setSheet((current) => {
      const slot = current.spells.slots[slotIndex];
      if (!slot) return current;

      const parsed = Number(nextValue);
      const nextMax = Number.isFinite(parsed)
        ? Math.max(0, Math.round(parsed))
        : slot.max;
      const nextAmount = Math.min(slot.amount, nextMax);

      if (nextMax === slot.max && nextAmount === slot.amount) return current;

      return {
        ...current,
        spells: {
          ...current.spells,
          slots: current.spells.slots.map((item, index) =>
            index === slotIndex
              ? { ...item, max: nextMax, amount: nextAmount }
              : item,
          ),
        },
      };
    });
  };

  const updateSpellSlotAmountInput = (slotIndex: number, nextValue: string) => {
    if (!isEditing) return;
    setSheet((current) => {
      const slot = current.spells.slots[slotIndex];
      if (!slot) return current;

      const parsed = Number(nextValue);
      const nextAmount = Number.isFinite(parsed)
        ? Math.min(slot.max, Math.max(0, Math.round(parsed)))
        : slot.amount;

      if (nextAmount === slot.amount) return current;

      return {
        ...current,
        spells: {
          ...current.spells,
          slots: current.spells.slots.map((item, index) =>
            index === slotIndex ? { ...item, amount: nextAmount } : item,
          ),
        },
      };
    });
  };

  const addSpellSlot = () => {
    if (!isEditing) return;
    setSheet((current) => ({
      ...current,
      spells: {
        ...current.spells,
        slots: [
          ...current.spells.slots,
          {
            title: `Slot ${current.spells.slots.length + 1}`,
            description: "",
            amount: 0,
            max: 1,
          },
        ],
      },
    }));
  };

  const updateAbilityBase = (
    key: keyof CharacterSheetState["ap"],
    nextValue: string,
  ) => {
    if (!isEditing) return;
    setSheet((current) => ({
      ...current,
      ap: {
        ...current.ap,
        [key]: {
          ...current.ap[key],
          base: (() => {
            const parsed = Number(nextValue);
            return Number.isFinite(parsed) ? parsed : current.ap[key].base;
          })(),
        },
      },
    }));
  };

  const updateAbilityModifier = (
    key: keyof CharacterSheetState["ap"],
    nextValue: string,
  ) => {
    if (!isEditing) return;
    setSheet((current) => ({
      ...current,
      ap: {
        ...current.ap,
        [key]: {
          ...current.ap[key],
          modifier: (() => {
            const parsed = Number(nextValue);
            return Number.isFinite(parsed) ? parsed : current.ap[key].modifier;
          })(),
        },
      },
    }));
  };

  function updateCombatField(
    key: "hitDice",
    hitDiceKey: keyof CharacterSheetState["combat"]["hitDice"],
    nextValue: string,
  ): void;
  function updateCombatField<
    K extends keyof Omit<CharacterSheetState["combat"], "hitDice">,
  >(key: K, nextValue: string): void;
  function updateCombatField(
    key: keyof CharacterSheetState["combat"],
    arg2: string,
    arg3?: string,
  ) {
    if (!isEditing) return;

    setSheet((current) => ({
      ...current,
      combat: {
        ...current.combat,
        ...(key === "hitDice"
          ? {
              hitDice: {
                ...current.combat.hitDice,
                [arg2]:
                  typeof current.combat.hitDice[
                    arg2 as keyof CharacterSheetState["combat"]["hitDice"]
                  ] === "number"
                    ? (() => {
                        const parsed = Number(arg3 ?? "");
                        return Number.isFinite(parsed)
                          ? parsed
                          : current.combat.hitDice.amount;
                      })()
                    : (arg3 ?? ""),
              },
            }
          : {
              [key]:
                typeof current.combat[
                  key as keyof Omit<CharacterSheetState["combat"], "hitDice">
                ] === "number"
                  ? (() => {
                      const parsed = Number(arg2);
                      return Number.isFinite(parsed)
                        ? parsed
                        : current.combat[
                            key as keyof Omit<
                              CharacterSheetState["combat"],
                              "hitDice"
                            >
                          ];
                    })()
                  : arg2,
            }),
      },
    }));
  }

  const updateCharacterField = (
    key: keyof CharacterSheetState["character"],
    nextValue: string,
  ) => {
    if (!isEditing) return;
    setSheet((current) => {
      const nextCharacter = {
        ...current.character,
        [key]:
          key === "level"
            ? (() => {
                const parsed = Number(nextValue);
                return Number.isFinite(parsed)
                  ? parsed
                  : current.character.level;
              })()
            : nextValue,
      };

      return {
        ...current,
        character: nextCharacter,
      };
    });
  };

  const updateSkillModifier = (
    key: keyof CharacterSheetState["skills"],
    nextValue: string,
  ) => {
    if (!isEditing) return;
    setSheet((current) => ({
      ...current,
      skills: {
        ...current.skills,
        [key]: {
          ...current.skills[key],
          modifier: (() => {
            const parsed = Number(nextValue);
            return Number.isFinite(parsed)
              ? parsed
              : current.skills[key].modifier;
          })(),
        },
      },
    }));
  };

  const updateSkillProficiency = (
    key: keyof CharacterSheetState["skills"],
    checked: boolean,
  ) => {
    if (!isEditing) return;
    setSheet((current) => ({
      ...current,
      skills: {
        ...current.skills,
        [key]: {
          ...current.skills[key],
          isProficient: checked,
        },
      },
    }));
  };

  const updateSavingThrowModifier = (
    key: keyof CharacterSheetState["savingThrow"],
    nextValue: string,
  ) => {
    if (!isEditing) return;
    setSheet((current) => ({
      ...current,
      savingThrow: {
        ...current.savingThrow,
        [key]: {
          ...current.savingThrow[key],
          modifier: (() => {
            const parsed = Number(nextValue);
            return Number.isFinite(parsed)
              ? parsed
              : current.savingThrow[key].modifier;
          })(),
        },
      },
    }));
  };

  const updateSavingThrowProficiency = (
    key: keyof CharacterSheetState["savingThrow"],
    checked: boolean,
  ) => {
    if (!isEditing) return;
    setSheet((current) => ({
      ...current,
      savingThrow: {
        ...current.savingThrow,
        [key]: {
          ...current.savingThrow[key],
          isProficient: checked,
        },
      },
    }));
  };

  const abilities = useMemo(
    () => [
      { label: "STR", key: "str" as const },
      { label: "DEX", key: "dex" as const },
      { label: "CON", key: "con" as const },
      { label: "INT", key: "int" as const },
      { label: "WIS", key: "wis" as const },
      { label: "CHA", key: "cha" as const },
    ],
    [],
  );

  const skills = useMemo(
    () => [
      { label: "Acrobatics", key: "acrobatics" as const },
      { label: "Animal Handling", key: "animalHandling" as const },
      { label: "Arcana", key: "arcana" as const },
      { label: "Athletics", key: "athletics" as const },
      { label: "Deception", key: "deception" as const },
      { label: "History", key: "history" as const },
      { label: "Insight", key: "insight" as const },
      { label: "Intimidation", key: "intimidation" as const },
      { label: "Investigation", key: "investigation" as const },
      { label: "Medicine", key: "medicine" as const },
      { label: "Nature", key: "nature" as const },
      { label: "Perception", key: "perception" as const },
      { label: "Performance", key: "performance" as const },
      { label: "Persuasion", key: "persuasion" as const },
      { label: "Religion", key: "religion" as const },
      { label: "Sleight of Hand", key: "sleightOfHand" as const },
      { label: "Stealth", key: "stealth" as const },
      { label: "Survival", key: "survival" as const },
    ],
    [],
  );

  const handleSkillLookup = (skillKey: keyof CharacterSheetState["skills"]) => {
    if (typeof window === "undefined") return;

    const index = String(skillKey).replace(/[A-Z]/g, (char) => {
      return `-${char.toLowerCase()}`;
    });

    window.dispatchEvent(
      new CustomEvent<{
        index: string;
        collection: "skills";
      }>("dnd:sidebar-lookup", {
        detail: {
          index,
          collection: "skills",
        },
      }),
    );
  };

  const clearDragPreview = () => {
    if (dragPreviewRef.current) {
      dragPreviewRef.current.remove();
      dragPreviewRef.current = null;
    }
  };

  const getCurrentCardPositions = () => {
    const grid = gridRef.current;
    if (!grid) return {};

    const cards = Array.from(
      grid.querySelectorAll<HTMLElement>("[data-section-id]"),
    );
    const positions: Partial<Record<SectionId, { left: number; top: number }>> =
      {};

    cards.forEach((card) => {
      const id = card.dataset.sectionId as SectionId | undefined;
      if (!id) return;
      const rect = card.getBoundingClientRect();
      positions[id] = { left: rect.left, top: rect.top };
    });

    return positions;
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const getGridColumnCount = () => {
    const grid = gridRef.current;
    if (!grid) return 1;
    const template = getComputedStyle(grid).gridTemplateColumns;
    if (!template) return 1;
    return template.split(" ").filter(Boolean).length;
  };

  const moveCard = (dragId: SectionId, targetId: SectionId) => {
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

  const getGridSpanStyle = (id: SectionId): CSSProperties => {
    const span = cardSpans[id];
    return {
      gridColumn: `span ${span.colSpan} / span ${span.colSpan}`,
      gridRow: `span ${span.rowSpan} / span ${span.rowSpan}`,
    };
  };

  const gridColumnClass =
    columnCount === 3
      ? "xl:grid-cols-3"
      : columnCount === 4
        ? "xl:grid-cols-4"
        : "xl:grid-cols-5";

  const getCardWrapperClasses = (id: SectionId) =>
    cn(
      "transition-[transform,opacity,box-shadow] border-border duration-300 ease-out will-change-transform",
      "relative",
      (draggingId === id || touchDraggingId === id) &&
        "scale-[0.98] opacity-35",
      (draggingId === id || touchDraggingId === id) &&
        "outline outline-2 outline-dashed outline-primary/50 outline-offset-2",
      resizeState?.id === id && "select-none",
    );

  const armDragHandle = (
    id: SectionId,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (!isDragEnabled || isEditing || resizeState) return;
    if (event.button !== 0) return;
    dragHandleArmedRef.current = id;
  };

  const getHeaderHandleClasses = () =>
    cn(
      "flex items-center justify-between select-none",
      !isEditing &&
        !resizeState &&
        isDragEnabled &&
        "cursor-grab active:cursor-grabbing",
    );

  const startResize = (
    id: SectionId,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (!isResizeEnabled || isEditing) return;

    event.preventDefault();
    event.stopPropagation();

    const wrapper = event.currentTarget.closest(
      "[data-section-id]",
    ) as HTMLDivElement | null;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const span = cardSpans[id];

    reorderLockRef.current = false;
    setDraggingId(null);
    setTouchDraggingId(null);
    lastDragTargetRef.current = null;
    lastTouchTargetRef.current = null;
    clearDragPreview();

    setResizeState({
      id,
      startX: event.clientX,
      startY: event.clientY,
      startColSpan: span.colSpan,
      startRowSpan: span.rowSpan,
      startWidth: rect.width,
      startHeight: rect.height,
      resizeX: true,
      resizeY: true,
    });
  };

  const renderResizeHandle = (id: SectionId) => {
    if (!isResizeEnabled || isEditing) return null;
    return (
      <button
        type="button"
        aria-label="Resize card"
        onPointerDown={(event) => startResize(id, event)}
        className="absolute bottom-2 right-2 z-20 cursor-nwse-resize rounded p-1 text-muted-foreground/70 transition-colors hover:text-foreground touch-none"
      >
        <Scaling className="h-4 w-4 transform scale-x-[-1]" />
      </button>
    );
  };

  const dragHandlers = (id: SectionId) => ({
    draggable: isDragEnabled && !isEditing && !resizeState,
    onDragStart: (event: DragEvent<HTMLDivElement>) => {
      if (
        !isDragEnabled ||
        isEditing ||
        resizeState ||
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
      if (!isDragEnabled || isEditing || resizeState) return;
      event.preventDefault();
      if (draggingId && draggingId !== id) {
        if (lastDragTargetRef.current === id) return;
        lastDragTargetRef.current = id;
        moveCard(draggingId, id);
      }
    },
    onDragOver: (event: DragEvent<HTMLDivElement>) => {
      if (!isDragEnabled || isEditing || resizeState) return;
      event.preventDefault();
    },
    onDrop: (event: DragEvent<HTMLDivElement>) => {
      if (!isDragEnabled || isEditing || resizeState) return;
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
        resizeState ||
        dragHandleArmedRef.current !== id
      ) {
        return;
      }
      setTouchDraggingId(id);
      lastTouchTargetRef.current = null;
    },
    onTouchMove: (event: TouchEvent<HTMLDivElement>) => {
      if (!isDragEnabled || isEditing || resizeState) return;
      const touch = event.touches[0];
      const target = document
        .elementFromPoint(touch.clientX, touch.clientY)
        ?.closest("[data-section-id]") as HTMLElement | null;
      const targetId = target?.dataset.sectionId as SectionId | undefined;

      if (targetId && touchDraggingId && touchDraggingId !== targetId) {
        if (lastTouchTargetRef.current === targetId) return;
        lastTouchTargetRef.current = targetId;
        moveCard(touchDraggingId, targetId);
      }
    },
    onTouchEnd: () => {
      if (!isDragEnabled || isEditing || resizeState) return;
      finishTouchDrag();
    },
  });

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
    const nextPositions: Partial<
      Record<SectionId, { left: number; top: number }>
    > = {};

    cards.forEach((card) => {
      const id = card.dataset.sectionId as SectionId | undefined;
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
  }, [order]);

  useEffect(() => {
    if (!resizeState) return;

    const handlePointerMove = (event: PointerEvent) => {
      const columnCount = getGridColumnCount();
      const maxColSpan = Math.max(1, columnCount);
      const maxRowSpan = 3;
      const deltaX = event.clientX - resizeState.startX;
      const deltaY = event.clientY - resizeState.startY;

      const colUnit = Math.max(
        1,
        resizeState.startWidth / resizeState.startColSpan,
      );
      const rowUnit = Math.max(
        1,
        resizeState.startHeight / resizeState.startRowSpan,
      );

      const nextColSpan = resizeState.resizeX
        ? clamp(
            Math.round((resizeState.startWidth + deltaX) / colUnit),
            1,
            maxColSpan,
          )
        : resizeState.startColSpan;
      const nextRowSpan = resizeState.resizeY
        ? clamp(
            Math.round((resizeState.startHeight + deltaY) / rowUnit),
            1,
            maxRowSpan,
          )
        : resizeState.startRowSpan;

      setCardSpans((current) => {
        const existing = current[resizeState.id];
        if (
          existing.colSpan === nextColSpan &&
          existing.rowSpan === nextRowSpan
        ) {
          return current;
        }
        return {
          ...current,
          [resizeState.id]: {
            colSpan: nextColSpan,
            rowSpan: nextRowSpan,
          },
        };
      });
    };

    const handlePointerUp = () => {
      window.localStorage.setItem(
        SPANS_STORAGE_KEY,
        JSON.stringify(cardSpansRef.current),
      );
      setResizeState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    document.body.style.userSelect = "none";
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.userSelect = "";
    };
  }, [resizeState]);

  useEffect(() => {
    console.log("cardSpans:", cardSpans);
  }, [cardSpans]);

  return (
    <div className="mx-auto w-full space-y-6 p-4 md:p-8 lg:w-[80vw]">
      <div
        className={cn(
          "flex flex-col gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center md:justify-between",
          "bg-gradient-to-t from-[#e5e5e5]/5 to-card shadow-xs dark:bg-card",
        )}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
            <SheetInput
              isEditing={isEditing}
              value={sheet.character.name}
              readOnly={!isEditing}
              placeholder="Name"
              className="h-auto w-auto  bg-transparent p-0 pr-0 text-2xl font-bold leading-tight shadow-none focus-visible:ring-0 md:text-3xl"
              onChange={(event) =>
                updateCharacterField("name", event.target.value)
              }
            />
            <Dot className="h-8 w-8" />
            <SheetInput
              isEditing={isEditing}
              value={sheet.character.class}
              readOnly={!isEditing}
              placeholder="Class"
              className="h-auto w-auto bg-transparent p-0 pr-0 text-2xl font-bold leading-tight shadow-none focus-visible:ring-0 md:text-3xl"
              onChange={(event) =>
                updateCharacterField("class", event.target.value)
              }
            />
            <Dot className="h-8 w-8" />
            <span>Level</span>
            <SheetInput
              isEditing={isEditing}
              value={sheet.character.level}
              type="number"
              placeholder="Level"
              readOnly={!isEditing}
              className="h-auto w-20 bg-transparent p-0 pr-0 text-2xl font-bold leading-tight shadow-none focus-visible:ring-0 md:text-3xl"
              onChange={(event) =>
                updateCharacterField("level", event.target.value)
              }
            />
          </div>
          {characterOptionalFields.length > 0 && (
            <div className="text-md text-muted-foreground flex flex-wrap items-center gap-1">
              {characterOptionalFields.map(({ key, label }, index) => (
                <div key={key} className="flex items-center gap-1">
                  {(sheet.character[key] || isEditing) && (
                    <>
                      {index > 0 && <span>|</span>}
                      {isEditing && <span>{label}:</span>}
                      <SheetInput
                        isEditing={isEditing}
                        value={sheet.character[key]}
                        readOnly={!isEditing}
                        className="h-auto w-auto bg-transparent p-0 pr-0 text-md leading-7 shadow-none focus-visible:ring-0"
                        onChange={(event) =>
                          updateCharacterField(key, event.target.value)
                        }
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isEditing ? "default" : "secondary"}>
            {isEditing ? "Editing Enabled" : "Read-Only"}
          </Badge>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Settings2 className="mr-2 h-4 w-4" />
                Sheet Controls
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Sheet Mode</p>
                <Button
                  className="w-full justify-start"
                  disabled={isSaving}
                  onClick={async () => {
                    if (isEditing) {
                      if (charId && onSave) {
                        setIsSaving(true);
                        await onSave(charId, sheet);
                      }
                      setIsSaving(false);
                      setIsEditing(false);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? (
                    <>
                      {isSaving ? (
                        <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Sheet
                    </>
                  ) : (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Mode
                    </>
                  )}
                </Button>
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Layout Columns</p>
                  <div className="flex items-center gap-1 rounded-md border bg-background p-1">
                    {COLUMN_OPTIONS.map((count) => (
                      <Button
                        key={count}
                        type="button"
                        size="sm"
                        variant={columnCount === count ? "default" : "ghost"}
                        onClick={() => setColumnCount(count)}
                        className="h-8 flex-1 px-2 text-xs"
                      >
                        {count} Col
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium">Card Interactions</p>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <Move
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isDragEnabled
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                    <div className="leading-tight">
                      <p className="text-sm">Drag and Drop</p>
                      <p className="text-xs text-muted-foreground">
                        Reorder cards in the grid
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isDragEnabled}
                    onCheckedChange={setIsDragEnabled}
                  />
                </div>

                <div className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <Scaling
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isResizeEnabled
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                    <div className="leading-tight">
                      <p className="text-sm">Resize Cards</p>
                      <p className="text-xs text-muted-foreground">
                        Enable drag-to-resize handles
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isResizeEnabled}
                    onCheckedChange={setIsResizeEnabled}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Card Visibility</p>
                <div className="flex items-center justify-between rounded-md border p-2">
                  <div className="leading-tight">
                    <p className="text-sm">Spell Card</p>
                    <p className="text-xs text-muted-foreground">
                      Show or hide the spells section
                    </p>
                  </div>
                  <Switch
                    checked={isSpellCardVisible}
                    onCheckedChange={setIsSpellCardVisible}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div
        ref={gridRef}
        className={cn(
          "grid grid-cols-1 gap-4 [grid-auto-flow:dense] md:grid-cols-2",
          gridColumnClass,
        )}
      >
        {order?.map((sectionId) => {
          if (sectionId === "spells" && !isSpellCardVisible) {
            return null;
          }

          if (sectionId === "abilities") {
            return (
              <div
                key={sectionId}
                data-section-id={sectionId}
                className={cn(getCardWrapperClasses(sectionId))}
                style={getGridSpanStyle(sectionId)}
                {...dragHandlers(sectionId)}
              >
                <ExpandableCardModal
                  showDragHandle={isDragEnabled}
                  showToggleButton={isEditing}
                  title="Ability Scores"
                  cardClassName="h-full"
                  headerClassName={getHeaderHandleClasses()}
                  titleClassName="w-full"
                  onHeaderPointerDown={(event) =>
                    armDragHandle(sectionId, event)
                  }
                  contentClassName={`grid gap-3 ${cardSpans.abilities.colSpan <= 1 ? "grid-cols-1" : "grid-cols-6"}`}
                >
                  {abilities.map((ability) => (
                    <div
                      key={ability.key}
                      className={`flex items-center gap-2 ${cardSpans.abilities.colSpan <= 1 ? "flex-row" : "flex-col"}`}
                    >
                      <p className="text-3xl w-8">
                        {`(${formatSavingThrow(sheet.ap[ability.key].base + sheet.ap[ability.key].modifier)})`}
                      </p>
                      {cardSpans.abilities.colSpan <= 1 && (
                        <div className="flex items-center justify-center pl-6 pr-2">
                          <Dot className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-lg w-full p-0">
                          {sheet.ap[ability.key].base +
                            sheet.ap[ability.key].modifier}
                        </p>
                        {isEditing && (
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <SheetInput
                                isEditing={isEditing}
                                value={sheet.ap[ability.key].base}
                                type="number"
                                readOnly={!isEditing}
                                className="text-lg w-full p-0"
                                onChange={(event) =>
                                  updateAbilityBase(
                                    ability.key,
                                    event.target.value,
                                  )
                                }
                              />
                              <Label className="text-muted-foreground">
                                Base
                              </Label>
                            </div>
                            <p>+</p>
                            <div className="flex flex-col items-center justify-center gap-2">
                              <SheetInput
                                isEditing={isEditing}
                                value={sheet.ap[ability.key].modifier}
                                type="number"
                                readOnly={!isEditing}
                                className="text-lg w-full p-0"
                                onChange={(event) =>
                                  updateAbilityModifier(
                                    ability.key,
                                    event.target.value,
                                  )
                                }
                              />
                              <Label className="text-muted-foreground">
                                Modifier
                              </Label>
                            </div>
                          </div>
                        )}
                        <Label className="text-muted-foreground">
                          {ability.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </ExpandableCardModal>
                {renderResizeHandle(sectionId)}
              </div>
            );
          }

          if (sectionId === "combat") {
            return (
              <div
                key={sectionId}
                data-section-id={sectionId}
                className={cn(getCardWrapperClasses(sectionId))}
                style={getGridSpanStyle(sectionId)}
                {...dragHandlers(sectionId)}
              >
                <ExpandableCardModal
                  showDragHandle={isDragEnabled}
                  showToggleButton={isEditing}
                  title="Combat"
                  cardClassName="h-full"
                  headerClassName={getHeaderHandleClasses()}
                  onHeaderPointerDown={(event) =>
                    armDragHandle(sectionId, event)
                  }
                  contentClassName={`grid gap-6 ${cardSpans.combat.colSpan <= 1 ? "grid-cols-2" : "grid-cols-3"}`}
                >
                  <div
                    className={`grid gap-6 ${cardSpans.combat.colSpan <= 1 ? "grid-cols-1 col-span-2" : "grid-cols-2 col-span-3"}`}
                  >
                    <div
                      className={`grid gap-2 ${cardSpans.combat.colSpan <= 1 ? "col-span-1" : "col-span-1"}`}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="w-8 h-8" color="pink" />
                        <div className="flex items-center">
                          <SheetInput
                            isEditing={isEditing}
                            type="number"
                            value={sheet.combat.currentHp}
                            readOnly={!isEditing}
                            className="text-3xl p-0 w-auto"
                            onChange={(event) =>
                              updateCombatField("currentHp", event.target.value)
                            }
                          />
                          <p className="text-4xl w-auto text-center">/</p>
                          <SheetInput
                            isEditing={isEditing}
                            type="number"
                            value={sheet.combat.maxHp}
                            readOnly={!isEditing}
                            className="text-3xl p-0 w-auto"
                            onChange={(event) =>
                              updateCombatField("maxHp", event.target.value)
                            }
                          />
                          {(sheet.combat.tempHp > 0 || isEditing) && (
                            <div className="grid">
                              <div className="flex justify-center items-center gap-1">
                                <p className="ml-1">{`(`}</p>
                                <p className="text-[#00A3A3] dark:text-[#00FFFF]">
                                  +
                                </p>
                                <SheetInput
                                  isEditing={isEditing}
                                  type="number"
                                  value={sheet.combat.tempHp}
                                  readOnly={!isEditing}
                                  className="text-3xl w-auto pr-0 text-[#00A3A3] dark:text-[#00FFFF]"
                                  onChange={(event) =>
                                    updateCombatField(
                                      "tempHp",
                                      event.target.value,
                                    )
                                  }
                                />
                                <HeartPlus className="w-6 h-6 text-[#00A3A3] dark:text-[#00FFFF]" />
                                <p>{`)`}</p>
                              </div>
                              {isEditing && (
                                <Label className="text-muted-foreground text-xs">
                                  Temp HP
                                </Label>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Label className="text-muted-foreground">
                        Current HP
                      </Label>
                    </div>
                    <div
                      className={`grid gap-2 ${cardSpans.combat.colSpan <= 1 ? "col-span-1" : "col-span-1"}`}
                    >
                      <div className="flex justify-start items-center gap-2">
                        <Dice3 className="w-8 h-8 dark:text-[#b383fe]" />
                        <div className="flex justify-start items-center">
                          <p className="text-3xl p-0 w-auto">{`(`}</p>
                          <SheetInput
                            isEditing={isEditing}
                            type="number"
                            value={sheet.combat.hitDice.amount}
                            readOnly={!isEditing}
                            className="text-3xl p-0 w-auto"
                            onChange={(event) =>
                              updateCombatField(
                                "hitDice",
                                "amount",
                                event.target.value,
                              )
                            }
                          />
                          <SheetInput
                            isEditing={isEditing}
                            value={sheet.combat.hitDice.diceType}
                            readOnly={!isEditing}
                            className="text-3xl p-0 w-auto"
                            onChange={(event) =>
                              updateCombatField(
                                "hitDice",
                                "diceType",
                                event.target.value,
                              )
                            }
                          />
                          <p className="text-3xl p-0 w-auto">{`)`}</p>
                          <p className="text-3xl p-0 w-auto">
                            {formatSavingThrow(
                              sheet.ap.con.base + sheet.ap.con.modifier,
                            )}
                          </p>
                        </div>
                      </div>
                      <Label className="text-muted-foreground">Hit Dice</Label>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-center items-center gap-2">
                      <Shield className="w-8 h-8 dark:text-[#00FF80]" />
                      <SheetInput
                        isEditing={isEditing}
                        value={sheet.combat.armorClass}
                        readOnly={!isEditing}
                        className="text-3xl w-full"
                        onChange={(event) =>
                          updateCombatField("armorClass", event.target.value)
                        }
                      />
                    </div>
                    <Label className="text-muted-foreground">Armor Class</Label>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-center items-center gap-2">
                      <Swords className="w-8 h-8 dark:text-[yellow]" />
                      <SheetInput
                        isEditing={isEditing}
                        value={sheet.combat.initiative}
                        readOnly={!isEditing}
                        className="text-3xl w-full"
                        onChange={(event) =>
                          updateCombatField("initiative", event.target.value)
                        }
                      />
                    </div>
                    <Label className="text-muted-foreground">Initiative</Label>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-center items-center gap-2">
                      <Footprints className="w-8 h-8" color="grey" />
                      <SheetInput
                        isEditing={isEditing}
                        value={sheet.combat.speed}
                        readOnly={!isEditing}
                        className="text-3xl w-full whitespace-nowrap"
                        onChange={(event) =>
                          updateCombatField("speed", event.target.value)
                        }
                      />
                    </div>
                    <Label className="text-muted-foreground">Speed (ft)</Label>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-start items-center gap-2">
                      <Triangle className="w-8 h-8 text-[#3888F2]" />
                      <div className="flex justify-center items-center">
                        <p className="text-3xl">+</p>
                        <SheetInput
                          isEditing={isEditing}
                          value={sheet.combat.proficiencyBonus}
                          readOnly={!isEditing}
                          className="text-3xl w-full"
                          onChange={(event) =>
                            updateCombatField(
                              "proficiencyBonus",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                    <Label className="text-muted-foreground">
                      Proficiency Bonus
                    </Label>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex justify-center items-center gap-2">
                      <Skull className="w-8 h-8" color="#ef4444" />
                      <SheetInput
                        isEditing={isEditing}
                        value={`${sheet.combat.deathSavesSuccesses}/${sheet.combat.deathSavesFailures}`}
                        readOnly={!isEditing}
                        className="text-3xl w-full"
                        onChange={(event) => {
                          const [s = "", f = ""] = event.target.value
                            .split("/")
                            .map((part) => part.trim());
                          updateCombatField("deathSavesSuccesses", s);
                          updateCombatField("deathSavesFailures", f);
                        }}
                      />
                    </div>
                    <Label className="text-muted-foreground">
                      Death Saves (S/F)
                    </Label>
                  </div>
                </ExpandableCardModal>
                {renderResizeHandle(sectionId)}
              </div>
            );
          }

          if (sectionId === "savingThrows") {
            return (
              <div
                key={sectionId}
                data-section-id={sectionId}
                className={cn(getCardWrapperClasses(sectionId))}
                style={getGridSpanStyle(sectionId)}
                {...dragHandlers(sectionId)}
              >
                <ExpandableCardModal
                  showDragHandle={isDragEnabled}
                  showToggleButton={isEditing}
                  title="Saving Throws"
                  cardClassName="h-full"
                  headerClassName={getHeaderHandleClasses()}
                  onHeaderPointerDown={(event) =>
                    armDragHandle(sectionId, event)
                  }
                  contentClassName={`grid grid-cols-2 ${cardSpans.savingThrows.colSpan <= 1 ? "md:grid-cols-1" : "md:grid-cols-2"}`}
                >
                  {abilities.map((ability, i) => (
                    <div key={ability.key}>
                      <div
                        className={`flex gap-2 justify-start items-center border-muted border-solid py-1 ${i < abilities.length - 1 ? "[border-bottom-width:1px]" : ""}`}
                      >
                        {isEditing && (
                          <>
                            <div className="flex justify-center items-center gap-1">
                              <p>{`(`}</p>
                              <div className="flex justify-center items-center gap-2">
                                <Checkbox
                                  id={`saving-throw-${ability.key}-proficiency`}
                                  name={`saving-throw-${ability.key}-proficiency`}
                                  checked={
                                    sheet.savingThrow[ability.key].isProficient
                                  }
                                  onCheckedChange={(value) =>
                                    updateSavingThrowProficiency(
                                      ability.key,
                                      value === true,
                                    )
                                  }
                                />
                                <p className="text-sm">Add Proficiency</p>
                              </div>
                              <p>{`)`}</p>
                            </div>
                            <Label className="text-sm">
                              Additional Modifiers
                            </Label>
                            <SheetInput
                              isEditing={isEditing}
                              value={sheet.savingThrow[ability.key].modifier}
                              type="number"
                              readOnly={!isEditing}
                              className="w-auto"
                              onChange={(event) =>
                                updateSavingThrowModifier(
                                  ability.key,
                                  event.target.value,
                                )
                              }
                            />
                          </>
                        )}
                        <p className="pr-3 text-md leading-7 w-[15%]">
                          {`${formatSavingThrow(
                            sheet.ap[ability.key].base +
                              sheet.ap[ability.key].modifier,
                            [
                              sheet.savingThrow[ability.key].modifier,
                              sheet.savingThrow[ability.key].isProficient
                                ? sheet.combat.proficiencyBonus
                                : 0,
                            ],
                          )}`}
                        </p>
                        {sheet.savingThrow[ability.key].isProficient && (
                          <Triangle className="w-3 h-3 text-[#3888F2] dark:text-[#3888F2]" />
                        )}
                        <Label>{ability.label}</Label>
                      </div>
                    </div>
                  ))}
                </ExpandableCardModal>
                {renderResizeHandle(sectionId)}
              </div>
            );
          }

          if (sectionId === "skills") {
            return (
              <div
                key={sectionId}
                data-section-id={sectionId}
                className={cn(getCardWrapperClasses(sectionId))}
                style={getGridSpanStyle(sectionId)}
                {...dragHandlers(sectionId)}
              >
                <ExpandableCardModal
                  showDragHandle={isDragEnabled}
                  showToggleButton={isEditing}
                  title="Skills"
                  cardClassName="h-full"
                  headerClassName={getHeaderHandleClasses()}
                  onHeaderPointerDown={(event) =>
                    armDragHandle(sectionId, event)
                  }
                  contentClassName={`grid grid-cols-2 ${cardSpans.skills.colSpan <= 1 ? "md:grid-cols-1" : "md:grid-cols-2"}`}
                >
                  <TooltipProvider>
                    {skills.map((skill, i) => (
                      <div key={skill.key}>
                        <div
                          className={`flex gap-2 justify-start items-center border-muted border-solid py-1 ${i < skills.length - 1 ? "[border-bottom-width:1px]" : ""}`}
                        >
                          {isEditing && (
                            <>
                              <div className="flex justify-center items-center gap-1">
                                <p>{`(`}</p>
                                <div className="flex justify-center items-center gap-2">
                                  <Checkbox
                                    id={`skill-${skill.key}-proficiency`}
                                    name={`skill-${skill.key}-proficiency`}
                                    checked={
                                      sheet.skills[skill.key].isProficient
                                    }
                                    onCheckedChange={(value) =>
                                      updateSkillProficiency(
                                        skill.key,
                                        value === true,
                                      )
                                    }
                                  />
                                  <p className="text-sm">Add Proficiency</p>
                                </div>
                                <p>{`)`}</p>
                              </div>
                              <Label className="text-sm">
                                Additional Modifiers
                              </Label>
                              <SheetInput
                                isEditing={isEditing}
                                value={sheet.skills[skill.key].modifier}
                                type="number"
                                readOnly={!isEditing}
                                className="w-auto"
                                onChange={(event) =>
                                  updateSkillModifier(
                                    skill.key,
                                    event.target.value,
                                  )
                                }
                              />
                            </>
                          )}

                          <p className="pr-3 text-md leading-7 w-[15%]">
                            {`${formatSavingThrow(sheet.ap[sheet.skills[skill.key].baseApType].base + sheet.ap[sheet.skills[skill.key].baseApType].modifier, [sheet.skills[skill.key].modifier, sheet.skills[skill.key].isProficient ? sheet.combat.proficiencyBonus : 0])}`}
                          </p>
                          {sheet.skills[skill.key].isProficient && (
                            <Triangle className="w-3 h-3 text-[#3888F2] dark:text-[#3888F2]" />
                          )}
                          {/* {const skills = await lookupSrd2014Indexes("skills", [
                "athletics",
              ]);} */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Label
                                role="button"
                                tabIndex={0}
                                className="cursor-pointer rounded-sm px-1 hover:bg-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                onClick={() => handleSkillLookup(skill.key)}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                  ) {
                                    event.preventDefault();
                                    handleSkillLookup(skill.key);
                                  }
                                }}
                              >
                                {skill.label}
                              </Label>
                            </TooltipTrigger>
                            {/* <TooltipContent>
                              <p>sup</p>
                            </TooltipContent> */}
                          </Tooltip>
                        </div>
                      </div>
                    ))}
                  </TooltipProvider>
                </ExpandableCardModal>
                {renderResizeHandle(sectionId)}
              </div>
            );
          }

          if (sectionId === "equipment") {
            return (
              <div
                key={sectionId}
                data-section-id={sectionId}
                className={cn(getCardWrapperClasses(sectionId))}
                style={getGridSpanStyle(sectionId)}
                {...dragHandlers(sectionId)}
              >
                <ExpandableCardModal
                  showDragHandle={isDragEnabled}
                  showToggleButton={isEditing}
                  title="Equipment"
                  cardClassName="h-full"
                  headerClassName={getHeaderHandleClasses()}
                  onHeaderPointerDown={(event) =>
                    armDragHandle(sectionId, event)
                  }
                >
                  <EditableListField
                    value={sheet.equipment}
                    isEditing={isEditing}
                    className="min-h-32"
                    onChange={(value) =>
                      updateListOrBackstoryField("equipment", value)
                    }
                    placeholder="Add equipment..."
                  />
                </ExpandableCardModal>
                {renderResizeHandle(sectionId)}
              </div>
            );
          }

          if (sectionId === "features") {
            return (
              <div
                key={sectionId}
                data-section-id={sectionId}
                className={cn(getCardWrapperClasses(sectionId))}
                style={getGridSpanStyle(sectionId)}
                {...dragHandlers(sectionId)}
              >
                <ExpandableCardModal
                  showDragHandle={isDragEnabled}
                  showToggleButton={isEditing}
                  title="Features & Traits"
                  cardClassName="h-full"
                  headerClassName={getHeaderHandleClasses()}
                  onHeaderPointerDown={(event) =>
                    armDragHandle(sectionId, event)
                  }
                >
                  <EditableListField
                    value={sheet.featuresAndTraits}
                    isEditing={isEditing}
                    className="min-h-32"
                    onChange={(value) =>
                      updateListOrBackstoryField("featuresAndTraits", value)
                    }
                    placeholder="Add feature or trait..."
                  />
                </ExpandableCardModal>
                {renderResizeHandle(sectionId)}
              </div>
            );
          }

          if (sectionId === "spells") {
            return (
              <div
                key={sectionId}
                data-section-id={sectionId}
                className={cn(getCardWrapperClasses(sectionId))}
                style={getGridSpanStyle(sectionId)}
                {...dragHandlers(sectionId)}
              >
                <ExpandableCardModal
                  showDragHandle={isDragEnabled}
                  showToggleButton={isEditing}
                  title="Spells"
                  cardClassName="h-full"
                  headerClassName={getHeaderHandleClasses()}
                  onHeaderPointerDown={(event) =>
                    armDragHandle(sectionId, event)
                  }
                >
                  <div className="space-y-2 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Spell Slots</p>
                      {isEditing && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={addSpellSlot}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add Spell Slot
                        </Button>
                      )}
                    </div>
                    <div
                      className={`grid justify-center items-center gap-2 ${cardSpans.spells.colSpan <= 1 ? "grid-cols-1" : "grid-cols-3"}`}
                    >
                      {sheet.spells.slots.map((slot, index) => (
                        <div
                          key={`slot-${index}`}
                          className="p-2 rounded-md border col-span-1"
                        >
                          <div className="leading-tight flex-1 pr-2">
                            <SheetInput
                              isEditing={isEditing}
                              value={slot.title}
                              readOnly={!isEditing}
                              className="text-sm font-medium h-auto w-auto"
                              onChange={(event) =>
                                updateSpellSlotTitle(index, event.target.value)
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2 justify-between">
                            <div className="grid items-center grid-cols-4 gap-1">
                              {Array.from({ length: slot.max }).map((_, i) => (
                                <Diamond
                                  key={`slot-${index}-diamond-${i}`}
                                  className={cn(
                                    "h-5 w-5 transition-colors",
                                    i < slot.amount
                                      ? "text-cyan-400"
                                      : "text-muted-foreground",
                                  )}
                                />
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs tabular-nums text-muted-foreground">
                                {slot.amount}/{slot.max}
                              </p>
                              {isEditing && (
                                <div className="flex items-center gap-1">
                                  <BaseInput
                                    type="number"
                                    value={slot.amount}
                                    onChange={(event) =>
                                      updateSpellSlotAmountInput(
                                        index,
                                        event.target.value,
                                      )
                                    }
                                    className="h-8 w-14"
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    /
                                  </span>
                                  <BaseInput
                                    type="number"
                                    value={slot.max}
                                    onChange={(event) =>
                                      updateSpellSlotMax(
                                        index,
                                        event.target.value,
                                      )
                                    }
                                    className="h-8 w-14"
                                  />
                                </div>
                              )}
                              {!isEditing && (
                                <div className="flex flex-col">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5"
                                    onClick={() =>
                                      updateSpellSlotAmount(index, 1)
                                    }
                                    disabled={slot.amount >= slot.max}
                                    aria-label={`Increase ${slot.title} slots`}
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-5 w-5"
                                    onClick={() =>
                                      updateSpellSlotAmount(index, -1)
                                    }
                                    disabled={slot.amount <= 0}
                                    aria-label={`Decrease ${slot.title} slots`}
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <EditableListField
                    value={sheet.spells.list}
                    isEditing={isEditing}
                    className="min-h-32"
                    onChange={updateSpellList}
                    placeholder="Add spell..."
                  />
                </ExpandableCardModal>
                {renderResizeHandle(sectionId)}
              </div>
            );
          }

          if (sectionId === "backstory") {
            return (
              <div
                key={sectionId}
                data-section-id={sectionId}
                className={cn(getCardWrapperClasses(sectionId))}
                style={getGridSpanStyle(sectionId)}
                {...dragHandlers(sectionId)}
              >
                <ExpandableCardModal
                  showDragHandle={isDragEnabled}
                  showToggleButton={isEditing}
                  title="Backstory"
                  cardClassName="h-full"
                  headerClassName={getHeaderHandleClasses()}
                  onHeaderPointerDown={(event) =>
                    armDragHandle(sectionId, event)
                  }
                >
                  <SheetTextarea
                    isEditing={isEditing}
                    value={sheet.backstory}
                    readOnly={!isEditing}
                    className={cn("min-h-40", editableInputClass)}
                    onChange={(event) =>
                      updateListOrBackstoryField(
                        "backstory",
                        event.target.value,
                      )
                    }
                  />
                </ExpandableCardModal>
                {renderResizeHandle(sectionId)}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
