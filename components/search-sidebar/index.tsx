"use client";

import { PanelRightClose, PencilLine, Search } from "lucide-react";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  getAllSrd2014ByCollection,
  lookupSrd2014Index,
  type Srd2014CollectionKey,
  searchSrd2014Indexes,
  type Srd2014SearchResult,
} from "@/lib/utils";

import {
  SpellLevelFilter,
  type SpellLevelFilterValue,
} from "./spell-level-filter";
import {
  SrdCategoryFilter,
  type SrdCategoryFilterValue,
} from "./srd-category-filter";
import { ClassesFilter, ClassesFilterValue } from "./classes-filter";
import EquipmentText from "./equipment-text";

type SrdRecord = Record<string, unknown>;
const SIDEBAR_ANIMATION_MS = 100;

function toTitleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function stringifyValue(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    const lines = value
      .map((item) => {
        if (typeof item === "string") return `${item}\n`;
        if (typeof item === "number" || typeof item === "boolean") {
          return String(item);
        }
        if (item && typeof item === "object") {
          const maybeName = (item as SrdRecord).name;
          if (typeof maybeName === "string") return maybeName;
          return JSON.stringify(item);
        }
        return null;
      })
      .filter((line): line is string => Boolean(line?.trim()));

    return lines.length > 0 ? lines.join("\n") : null;
  }
  if (value && typeof value === "object") {
    const maybeName = (value as SrdRecord).name;
    if (typeof maybeName === "string") return maybeName;
    return JSON.stringify(value);
  }
  return null;
}

function extractBodyText(data: SrdRecord) {
  const preferredKeys = [
    "desc",
    "description",
    "text",
    "flavor_text",
    "spellcasting",
    "special_abilities",
    "actions",
  ];

  for (const key of preferredKeys) {
    const text = stringifyValue(data[key]);
    if (text) return text;
  }

  const firstText = Object.values(data)
    .map((value) => stringifyValue(value))
    .find((value): value is string => Boolean(value));
  return firstText ?? "No detailed text available for this entry.";
}

function extractBadges(result: Srd2014SearchResult) {
  const badges = [toTitleCase(result.collection), result.index];
  const data = result.data;
  const usefulBadgeKeys = ["level", "type", "size", "school", "alignment"];

  usefulBadgeKeys.forEach((key) => {
    const value = stringifyValue(data[key]);

    if (value === "0" && key === "level") {
      badges.push(`Cantrip`);
    } else if (value) {
      badges.push(`${toTitleCase(key)}: ${value}`);
    }
  });

  return badges.slice(0, 5);
}

export function SearchSidebar({ children }: { children?: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(true);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<SrdCategoryFilterValue>(null);
  const [spellLevelFilter, setSpellLevelFilter] =
    useState<SpellLevelFilterValue>(null);
  const [classesFilter, setClassesFilter] = useState<ClassesFilterValue>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Srd2014SearchResult[]>([]);
  const [selectedResult, setSelectedResult] =
    useState<Srd2014SearchResult | null>(null);
  const [selectedData, setSelectedData] = useState<SrdRecord | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current === null) return;
    window.clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
  }, []);

  const openSidebar = useCallback(
    (mode?: "notes") => {
      clearCloseTimeout();
      if (isSidebarVisible) {
        setIsOpen(true);
        return;
      }

      setIsOpen(false);
      setIsSidebarVisible(true);
      mode === "notes" ? setIsSearchMode(false) : setIsSearchMode(true);

      window.requestAnimationFrame(() => {
        setIsOpen(true);
      });
    },
    [clearCloseTimeout, isSidebarVisible],
  );

  const closeSidebar = useCallback(() => {
    clearCloseTimeout();
    setIsOpen(false);
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsSidebarVisible(false);
    }, SIDEBAR_ANIMATION_MS);
  }, [clearCloseTimeout]);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, [clearCloseTimeout]);

  useEffect(() => {
    const handleExternalLookup = (event: Event) => {
      const customEvent = event as CustomEvent<{
        index?: string;
        collection?: Srd2014CollectionKey;
      }>;
      const index = customEvent.detail?.index?.trim();
      const collection = customEvent.detail?.collection;
      if (!index || !collection) return;

      openSidebar();
      setQuery(index);
      setIsLoading(false);
      setIsDetailLoading(true);

      void (async () => {
        try {
          const lookedUp = await lookupSrd2014Index(index, { collection });
          if (!lookedUp) {
            setSelectedResult(null);
            setSelectedData(null);
            setResults([]);
            return;
          }

          const nextResult: Srd2014SearchResult = {
            collection,
            index,
            data: lookedUp,
          };
          setSelectedResult(nextResult);
          setSelectedData(lookedUp);
          setResults([nextResult]);
        } finally {
          setIsDetailLoading(false);
        }
      })();
    };

    window.addEventListener("dnd:sidebar-lookup", handleExternalLookup);
    return () => {
      window.removeEventListener("dnd:sidebar-lookup", handleExternalLookup);
    };
  }, [openSidebar]);

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      return;
    }

    const trimmed = query.trim();

    if (!trimmed) {
      if (categoryFilter === null) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      const timeout = window.setTimeout(async () => {
        setIsLoading(true);
        try {
          const nextResults = await getAllSrd2014ByCollection(
            categoryFilter,
            500,
          );
          setResults(nextResults);
        } finally {
          setIsLoading(false);
        }
      }, 300);

      return () => window.clearTimeout(timeout);
    }

    const collections = categoryFilter !== null ? [categoryFilter] : undefined;

    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const nextResults = await searchSrd2014Indexes(
          trimmed,
          20,
          collections,
        );
        setResults(nextResults);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query, isOpen, categoryFilter]);

  const filteredResults = useMemo(() => {
    if (categoryFilter !== "spells") return results;

    // console.log(
    //   (result: { data: { level: number; classes: String[] } }) =>
    //     Number(result.data.level) === spellLevelFilter,
    // );

    console.log("spellLevelFilter: ", spellLevelFilter);
    console.log("classesFilter: ", classesFilter);

    const filters = [
      spellLevelFilter === null
        ? null
        : (result: Srd2014SearchResult) =>
            Number(result.data.level) === spellLevelFilter,

      classesFilter === null
        ? null
        : (result: Srd2014SearchResult) =>
            (result.data.classes as String[])?.includes(classesFilter),

      // add new filters here as single lines
    ].filter(Boolean);

    // console.log(filters);

    if (filters.length === 0) return results;

    return results.filter((result) =>
      filters.every((fn) => {
        if (fn) return fn(result);
      }),
    );
  }, [results, categoryFilter, spellLevelFilter, classesFilter]);

  const handleResultClick = async (result: Srd2014SearchResult) => {
    setIsDetailLoading(true);
    setSelectedResult(result);
    try {
      const lookedUp = await lookupSrd2014Index(result.index, {
        collection: result.collection,
      });
      setSelectedData((lookedUp ?? result.data) as SrdRecord);
    } finally {
      setIsDetailLoading(false);
    }
  };

  if (!isSidebarVisible) {
    return (
      <div className="fixed top-32 right-20">
        <button
          type="button"
          onClick={() => openSidebar()}
          className="bg-background text-foreground mb-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border opacity-70 transition-opacity hover:opacity-100"
          aria-label="Open sidebar"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => openSidebar("notes")}
          className="bg-background text-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-md border opacity-70 transition-opacity hover:opacity-100"
          aria-label="Open sidebar"
        >
          <PencilLine className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Sidebar
      side="right"
      className={`sticky top-16 h-[calc(100vh-6rem)] w-[20vw] shrink-0 rounded-lg transition-transform duration-200 ease-out will-change-transform bg-card border-0 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <SidebarHeader className="mx-4 px-0 py-4">
        <div className="grid grid-cols-[24px_1fr_24px] items-center gap-2">
          <button
            type="button"
            onClick={closeSidebar}
            className="text-muted-foreground hover:text-foreground inline-flex h-6 w-6 items-center justify-center rounded-sm transition-colors"
            aria-label="Close sidebar"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
          <p className="text-center text-sm font-semibold">
            {isSearchMode ? "5e SRD Lookup" : "Player Notes"}
          </p>
          <span className="h-6 w-6" aria-hidden />
        </div>
      </SidebarHeader>
      {isSearchMode ? (
        <SidebarContent className="space-y-3">
          <div className="space-y-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute left-3 top-2.5 h-4 w-4" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedResult(null);
                  setSelectedData(null);
                }}
                placeholder="Search index or name..."
                className="pl-9"
              />
            </div>
            <SrdCategoryFilter
              value={categoryFilter}
              onChange={(value) => {
                setCategoryFilter(value);
                if (value !== "spells") setSpellLevelFilter(null);
              }}
            />
            {categoryFilter === "spells" && (
              <>
                <SpellLevelFilter
                  value={spellLevelFilter}
                  onChange={setSpellLevelFilter}
                />
                <ClassesFilter
                  value={classesFilter}
                  onChange={setClassesFilter}
                />
              </>
            )}
          </div>

          {isLoading && (
            <p className="text-muted-foreground text-xs">Searching...</p>
          )}

          {!isLoading && query.trim().length > 0 && results.length === 0 && (
            <p className="text-muted-foreground text-xs">No matches found.</p>
          )}

          {!isLoading &&
            categoryFilter === "spells" &&
            spellLevelFilter !== null &&
            results.length > 0 &&
            filteredResults.length === 0 && (
              <p className="text-muted-foreground text-xs">
                No spells at this level.
              </p>
            )}

          <div className="space-y-2">
            {selectedResult ? (
              <div className="space-y-3 rounded-md ">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedResult(null);
                    setSelectedData(null);
                  }}
                  className="text-muted-foreground hover:text-foreground text-xs underline"
                >
                  Back to results
                </button>

                {isDetailLoading && (
                  <p className="text-muted-foreground text-xs">
                    Loading entry...
                  </p>
                )}

                {!isDetailLoading && (
                  <>
                    <h3 className="text-base font-semibold">
                      {typeof (selectedData ?? selectedResult.data).name ===
                      "string"
                        ? String((selectedData ?? selectedResult.data).name)
                        : toTitleCase(selectedResult.index)}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {extractBadges(selectedResult).map((badge) => (
                        <span
                          key={badge}
                          className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px]"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {/* <p className="text-sm whitespace-pre-wrap">
                      {selectedResult.collection !== "equipment" &&
                        extractBodyText(
                          (selectedData ?? selectedResult.data) as SrdRecord,
                        )}
                    </p> */}
                      {/* {selectedResult.collection === "equipment" && ( */}
                      <EquipmentText data={selectedResult.data} />
                      {/* )} */}
                    </div>
                  </>
                )}
              </div>
            ) : (
              filteredResults.map((result) => {
                const displayName =
                  typeof result.data.name === "string"
                    ? result.data.name
                    : result.index;

                return (
                  <button
                    type="button"
                    key={`${result.collection}-${result.index}`}
                    onClick={() => {
                      void handleResultClick(result);
                    }}
                    className="hover:bg-muted/60 w-full rounded-md border p-2 text-left transition-colors"
                  >
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-muted-foreground text-xs">
                      {result.collection} / {result.index}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </SidebarContent>
      ) : (
        <SidebarContent className="space-y-3">{children}</SidebarContent>
      )}
    </Sidebar>
  );
}
