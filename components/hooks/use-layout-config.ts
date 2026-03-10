"use client";

import { useState, useCallback, useEffect } from "react";

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
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(
    DEFAULT_LAYOUT_CONFIG,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored)
        setLayoutConfig({ ...DEFAULT_LAYOUT_CONFIG, ...JSON.parse(stored) });
    } catch (e) {
      console.warn("Failed to save layoutConfig to localStorage:", e);
    }
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    console.log(layoutConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutConfig));
    } catch (e) {
      console.warn("Failed to save layoutConfig to localStorage:", e);
    }
  }, [layoutConfig]);

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
    setLayoutConfig({ ...DEFAULT_LAYOUT_CONFIG, ...initialConfig });
  }, [initialConfig]);

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
