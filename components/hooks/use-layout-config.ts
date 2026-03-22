"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { readClientJson, writeClientJson } from "@/lib/client-storage";

type ColumnCount = 3 | 4 | 5;

type LayoutConfig = {
  isDragEnabled: boolean;
  isResizeEnabled: boolean;
  columnCount: ColumnCount;
};

type UseLayoutConfigReturn = {
  layoutConfig: LayoutConfig;
  setDragEnabled: (enabled: boolean) => void;
  setResizeEnabled: (enabled: boolean) => void;
  setColumnCount: (count: ColumnCount) => void;
  resetLayoutConfig: () => void;
  updateLayoutConfig: (updates: Partial<LayoutConfig>) => void;
};

const STORAGE_KEY = "layoutConfig";

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  isDragEnabled: true,
  isResizeEnabled: true,
  columnCount: 4,
};

export const useLayoutConfig = (
  initialConfig?: Partial<LayoutConfig>,
): UseLayoutConfigReturn => {
  const initialLayoutConfig = useMemo(
    () => ({ ...DEFAULT_LAYOUT_CONFIG, ...initialConfig }),
    [initialConfig],
  );
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(
    initialLayoutConfig,
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadLayoutConfig = async () => {
      const stored = await readClientJson<Partial<LayoutConfig>>(STORAGE_KEY);
      if (!isActive) return;

      if (stored) {
        setLayoutConfig({ ...initialLayoutConfig, ...stored });
      } else {
        setLayoutConfig(initialLayoutConfig);
      }
      setIsHydrated(true);
    };

    void loadLayoutConfig();
    return () => {
      isActive = false;
    };
  }, [initialLayoutConfig]);

  // Persist to client storage whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    void writeClientJson(STORAGE_KEY, layoutConfig);
  }, [isHydrated, layoutConfig]);

  const setDragEnabled = useCallback((enabled: boolean) => {
    setLayoutConfig((prev) => ({ ...prev, isDragEnabled: enabled }));
  }, []);

  const setResizeEnabled = useCallback((enabled: boolean) => {
    setLayoutConfig((prev) => ({ ...prev, isResizeEnabled: enabled }));
  }, []);

  const setColumnCount = useCallback((count: ColumnCount) => {
    setLayoutConfig((prev) => ({ ...prev, columnCount: count }));
  }, []);

  const resetLayoutConfig = useCallback(() => {
    setLayoutConfig(initialLayoutConfig);
  }, [initialLayoutConfig]);

  const updateLayoutConfig = useCallback((updates: Partial<LayoutConfig>) => {
    setLayoutConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    layoutConfig,
    setDragEnabled,
    setResizeEnabled,
    setColumnCount,
    resetLayoutConfig,
    updateLayoutConfig,
  };
};
