"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AutoSizeInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  minWidthPx?: number;
};

export default function AutoSizeInput({
  value,
  onChange,
  className,
  placeholder,
  minWidthPx = 12,
}: AutoSizeInputProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [widthPx, setWidthPx] = useState(minWidthPx);

  useLayoutEffect(() => {
    const nextWidth = (spanRef.current?.offsetWidth ?? 0) + 2;
    setWidthPx(Math.max(nextWidth, minWidthPx));
  }, [value, placeholder, minWidthPx]);

  return (
    <span className="relative inline-block align-middle">
      <span
        ref={spanRef}
        className={cn(
          "invisible absolute left-0 top-0 whitespace-pre pointer-events-none",
          className,
        )}
      >
        {value || placeholder || " "}
      </span>
      <input
        className={className}
        value={value}
        placeholder={placeholder}
        style={{ width: `${widthPx}px` }}
        onChange={(event) => onChange(event.target.value)}
      />
    </span>
  );
}
