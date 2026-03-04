import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getSavingThrowModifier(stat: number) {
  return Math.floor((stat - 10) / 2);
}

export function formatSavingThrow(stat: number, modifier: number[] = [0]) {
  const savingThrow =
    getSavingThrowModifier(stat) + modifier.reduce((acc, cur) => acc + cur);
  return savingThrow >= 0 ? `+${savingThrow}` : `${savingThrow}`;
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
