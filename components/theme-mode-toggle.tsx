"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function ThemeModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2" aria-hidden>
        <Sun className="h-4 w-4 text-muted-foreground/60" />
        <Switch checked={false} disabled />
        <Moon className="h-4 w-4 text-muted-foreground/60" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";
  const handleThemeChange = (checked: boolean) => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    setTheme(checked ? "dark" : "light");
    window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 250);
  };

  return (
    <div className="flex items-center gap-2">
      <Sun
        className={cn(
          "h-4 w-4 transition-colors",
          !isDark ? "text-amber-500" : "text-muted-foreground",
        )}
      />
      <Switch checked={isDark} onCheckedChange={handleThemeChange} />
      <Moon
        className={cn(
          "h-4 w-4 transition-colors",
          isDark ? "text-blue-400" : "text-muted-foreground",
        )}
      />
    </div>
  );
}
