"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type SpellLevelFilterValue = number | null;

const SPELL_LEVEL_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: "Cantrip" },
  { value: 1, label: "1st level" },
  { value: 2, label: "2nd level" },
  { value: 3, label: "3rd level" },
  { value: 4, label: "4th level" },
  { value: 5, label: "5th level" },
  { value: 6, label: "6th level" },
  { value: 7, label: "7th level" },
  { value: 8, label: "8th level" },
  { value: 9, label: "9th level" },
];

type SpellLevelFilterProps = {
  value: SpellLevelFilterValue;
  onChange: (value: SpellLevelFilterValue) => void;
  disabled?: boolean;
};

function getLevelLabel(value: SpellLevelFilterValue): string {
  if (value === null) return "All levels";
  const option = SPELL_LEVEL_OPTIONS.find((o) => o.value === value);
  return option?.label ?? String(value);
}

export function SpellLevelFilter({
  value,
  onChange,
  disabled = false,
}: SpellLevelFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between gap-2 font-normal"
          disabled={disabled}
        >
          <span className="truncate">{getLevelLabel(value)}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuItem
          onClick={() => onChange(null)}
          className={value === null ? "bg-accent" : undefined}
        >
          All levels
        </DropdownMenuItem>
        {SPELL_LEVEL_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={value === option.value ? "bg-accent" : undefined}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
