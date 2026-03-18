"use client";

import { Textarea } from "../ui/textarea";

export default function CampaignNotes({
  value,
  className,
  onChange,
}: {
  value: string;
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Textarea
        className={`min-h-[25dvh] ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
