"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Srd2014CollectionKey } from "@/lib/utils";

const SRD_2014_CATEGORY_OPTIONS: {
  value: Srd2014CollectionKey;
  label: string;
}[] = [
  { value: "ability-scores", label: "Ability Scores" },
  { value: "alignments", label: "Alignments" },
  { value: "backgrounds", label: "Backgrounds" },
  { value: "classes", label: "Classes" },
  { value: "conditions", label: "Conditions" },
  { value: "damage-types", label: "Damage Types" },
  { value: "equipment", label: "Equipment" },
  { value: "equipment-categories", label: "Equipment Categories" },
  { value: "feats", label: "Feats" },
  { value: "features", label: "Features" },
  { value: "languages", label: "Languages" },
  { value: "levels", label: "Levels" },
  { value: "magic-items", label: "Magic Items" },
  { value: "magic-schools", label: "Magic Schools" },
  { value: "monsters", label: "Monsters" },
  { value: "proficiencies", label: "Proficiencies" },
  { value: "races", label: "Races" },
  { value: "rule-sections", label: "Rule Sections" },
  { value: "rules", label: "Rules" },
  { value: "skills", label: "Skills" },
  { value: "spells", label: "Spells" },
  { value: "subclasses", label: "Subclasses" },
  { value: "subraces", label: "Subraces" },
  { value: "traits", label: "Traits" },
  { value: "weapon-properties", label: "Weapon Properties" },
];

export type SrdCategoryFilterValue = Srd2014CollectionKey | null;

type SrdCategoryFilterProps = {
  value: SrdCategoryFilterValue;
  onChange: (value: SrdCategoryFilterValue) => void;
  disabled?: boolean;
};

function getCategoryLabel(value: SrdCategoryFilterValue): string {
  if (value === null) return "All categories";
  const option = SRD_2014_CATEGORY_OPTIONS.find((o) => o.value === value);
  return option?.label ?? value;
}

export function SrdCategoryFilter({
  value,
  onChange,
  disabled = false,
}: SrdCategoryFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between gap-2 font-normal"
          disabled={disabled}
        >
          <span className="truncate">{getCategoryLabel(value)}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-[min(70vh,24rem)] w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        <DropdownMenuItem
          onClick={() => onChange(null)}
          className={value === null ? "bg-accent" : undefined}
        >
          All categories
        </DropdownMenuItem>
        {SRD_2014_CATEGORY_OPTIONS.map((option) => (
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
