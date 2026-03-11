"use client";

import { useCallback, useEffect, useRef, useState, use } from "react";
import { Textarea } from "../ui/textarea";

type SaveStatus = "saved" | "saving" | "unsaved";

export default function PlayerNotes({
  charId,
  onSave,
  initialValue,
}: {
  charId: string;
  onSave: (charId: string, val: string) => Promise<unknown>;
  initialValue: string | null;
}) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const save = useCallback(async (content: string): Promise<void> => {
    setSaveStatus("saving");
    await onSave(charId, content);
    setSaveStatus("saved");
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setSaveStatus("unsaved");

      // Clear previous timer and start a new one
      clearTimeout(debounceTimer.current ?? undefined);
      debounceTimer.current = setTimeout(() => {
        save(e.target.value);
      }, 1000);
    },
    [save],
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = initialValue ?? "";
      console.log("mount textareaRef: ", initialValue);
    }
  }, [initialValue]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearTimeout(debounceTimer.current ?? undefined);
  }, []);

  return (
    <div>
      <Textarea
        className="min-h-[50dvh]"
        ref={textareaRef}
        onChange={handleChange}
      />
      <span className="text-muted-foreground text-xs">
        {saveStatus === "saving"
          ? "Saving..."
          : saveStatus === "saved"
            ? "Saved"
            : "Unsaved changes"}
      </span>
    </div>
  );
}
