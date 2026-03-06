"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { searchSrd2014Indexes, type Srd2014SearchResult } from "@/lib/utils";

export function DashboardSearchSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Srd2014SearchResult[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const nextResults = await searchSrd2014Indexes(trimmed, 20);
        setResults(nextResults);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query, isOpen]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-background text-foreground sticky top-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border"
        aria-label="Open sidebar"
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <Sidebar
      side="right"
      className="sticky top-4 h-[calc(100vh-2rem)] shrink-0 rounded-lg"
    >
      <SidebarHeader>
        <div className="grid grid-cols-[24px_1fr_24px] items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground inline-flex h-6 w-6 items-center justify-center rounded-sm transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-center text-sm font-semibold">5e Lookup</p>
          <span className="h-6 w-6" aria-hidden />
        </div>
      </SidebarHeader>
      <SidebarContent className="space-y-3">
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-2.5 h-4 w-4" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search index or name..."
            className="pl-9"
          />
        </div>

        {isLoading && (
          <p className="text-muted-foreground text-xs">Searching...</p>
        )}

        {!isLoading && query.trim().length > 0 && results.length === 0 && (
          <p className="text-muted-foreground text-xs">No matches found.</p>
        )}

        <div className="space-y-2">
          {results.map((result) => {
            const displayName =
              typeof result.data.name === "string"
                ? result.data.name
                : result.index;

            return (
              <div
                key={`${result.collection}-${result.index}`}
                className="rounded-md border p-2"
              >
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-muted-foreground text-xs">
                  {result.collection} / {result.index}
                </p>
              </div>
            );
          })}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
