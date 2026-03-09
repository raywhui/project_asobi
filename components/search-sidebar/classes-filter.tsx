"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ClassesFilterValue = string | null;

const CLASSES_OPTIONS: { value: string; label: string }[] = [
  // { value: "barbarian", label: "Barbarian" },
  { value: "bard", label: "Bard" },
  { value: "cleric", label: "Cleric" },
  { value: "druid", label: "Druid" },
  // { value: "fighter", label: "Fighter" },
  // { value: "monk", label: "Monk" },
  { value: "paladin", label: "Paladin" },
  // { value: "ranger", label: "Ranger" },
  // { value: "rogue", label: "Rogue" },
  { value: "sorcerer", label: "Sorcerer" },
  { value: "warlock", label: "Warlock" },
  { value: "wizard", label: "Wizard" },
];

type ClassesFilterProps = {
  value: ClassesFilterValue;
  onChange: (value: ClassesFilterValue) => void;
  disabled?: boolean;
};

function getClassLabel(value: ClassesFilterProps["value"]): string {
  if (value === null) return "All Classes";
  const option = CLASSES_OPTIONS.find((o) => o.value === value);
  return option?.label ?? String(value);
}

export function ClassesFilter({
  value,
  onChange,
  disabled = false,
}: ClassesFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between gap-2 font-normal"
          disabled={disabled}
        >
          <span className="truncate">{getClassLabel(value)}</span>
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
          All Classes
        </DropdownMenuItem>
        {CLASSES_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              console.log(option.value);
              return onChange(option.value);
            }}
            className={value === option.value ? "bg-accent" : undefined}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
